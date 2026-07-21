import crypto from 'node:crypto'
import fs from 'node:fs'
import { promises as fsp } from 'node:fs'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import readline from 'node:readline'
import express from 'express'
import multer from 'multer'
import OpenAI from 'openai'
import sharp from 'sharp'

const SOURCE_VERSION = 'v1.0.0'
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

try {
  process.loadEnvFile?.(path.join(projectRoot, '.env'))
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

const app = express()
const cache = new Map()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 1 } })
const port = Number(process.env.PORT || 8787)

app.use(express.json({ limit: '32kb' }))

function firstExisting(candidates) {
  return candidates.filter(Boolean).find((candidate) => fs.existsSync(candidate)) || null
}

const localAiPython = firstExisting([
  process.env.SOUL_PICS_PYTHON,
  path.join(projectRoot, '.local-ai', '.venv', 'Scripts', 'python.exe'),
  path.resolve(projectRoot, '..', 'local_cutout_poc', '.venv', 'Scripts', 'python.exe'),
])

const localAiCache = firstExisting([
  process.env.SOUL_PICS_MODEL_CACHE,
  path.join(projectRoot, '.local-ai', 'model-cache'),
  path.resolve(projectRoot, '..', 'local_cutout_poc', 'hf_cache'),
]) || path.join(projectRoot, '.local-ai', 'model-cache')

class LocalAiWorker {
  constructor(python) {
    this.python = python
    this.child = null
    this.readyPromise = null
    this.pending = new Map()
    this.sequence = 0
  }

  available() {
    return Boolean(this.python && fs.existsSync(path.join(projectRoot, 'local_ai', 'worker.py')))
  }

  start() {
    if (!this.available()) return Promise.reject(new Error('Soul Pics local AI is not installed. Run npm run setup:local-ai.'))
    if (this.child && this.readyPromise) return this.readyPromise
    let resolveReady
    let rejectReady
    this.readyPromise = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject })
    this.child = spawn(this.python, [path.join(projectRoot, 'local_ai', 'worker.py')], {
      cwd: projectRoot,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        SOUL_PICS_MODEL_CACHE: localAiCache,
        HF_HUB_OFFLINE: '1',
        TRANSFORMERS_OFFLINE: '1',
        HF_HUB_DISABLE_TELEMETRY: '1',
        HF_HUB_DISABLE_SYMLINKS_WARNING: '1',
      },
    })
    readline.createInterface({ input: this.child.stdout }).on('line', (line) => {
      let message
      try { message = JSON.parse(line) } catch { return console.warn('Local AI emitted a non-JSON line', line) }
      if (message.type === 'ready') {
        console.log('Soul Pics local AI worker ready', message)
        resolveReady(message)
        return
      }
      const pending = this.pending.get(message.id)
      if (!pending) return
      clearTimeout(pending.timer)
      this.pending.delete(message.id)
      if (message.ok) pending.resolve(message.result)
      else pending.reject(Object.assign(new Error(message.error || 'Local cutout failed.'), { errorType: message.errorType }))
    })
    this.child.stderr.on('data', (chunk) => process.stderr.write(chunk))
    this.child.on('error', (error) => rejectReady(error))
    this.child.on('exit', (code) => {
      const error = new Error(`Soul Pics local AI worker stopped unexpectedly (code ${code}).`)
      rejectReady(error)
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer)
        pending.reject(error)
      }
      this.pending.clear()
      this.child = null
      this.readyPromise = null
    })
    return this.readyPromise
  }

  async request(payload) {
    await this.start()
    const id = ++this.sequence
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error('Local cutout timed out after 10 minutes.'))
      }, 10 * 60 * 1000)
      this.pending.set(id, { resolve, reject, timer })
      this.child.stdin.write(`${JSON.stringify({ ...payload, id })}\n`, 'utf8')
    })
  }
}

const localAi = new LocalAiWorker(localAiPython)
process.on('exit', () => localAi.child?.kill())

function cacheSet(key, value) {
  cache.set(key, value)
  while (cache.size > 3) cache.delete(cache.keys().next().value)
}

function imageSize(width, height) {
  const safeWidth = Math.ceil(Number(width) / 16) * 16
  const safeHeight = Math.ceil(Number(height) / 16) * 16
  if (!Number.isFinite(safeWidth) || !Number.isFinite(safeHeight)) return null
  const pixels = safeWidth * safeHeight
  if (safeWidth < 16 || safeHeight < 16 || safeWidth > 3840 || safeHeight > 3840 || pixels < 655360 || pixels > 8294400 || Math.max(safeWidth, safeHeight) / Math.min(safeWidth, safeHeight) > 3) return null
  return `${safeWidth}x${safeHeight}`
}

function apiError(error, fallback) {
  if (error?.status === 401) return 'The OpenAI API key is invalid. Update .env and restart the API server.'
  if (error?.status === 429) return 'OpenAI rate limit or quota reached. Check API billing and try again shortly.'
  if (error?.name === 'APIConnectionError' || error?.message === 'Connection error.') return 'The local API server could not connect to OpenAI. Check outbound HTTPS access, proxy settings, certificates, and DNS before retrying. No automatic retry is performed.'
  if (error?.code === 'moderation_blocked') return 'This prompt was blocked by image safety checks. Revise it and try again.'
  return fallback
}

function localAiError(error) {
  if (/No subject matched/.test(error?.message || '')) return 'No matching subject was detected. Try a shorter subject description in Japanese or English.'
  if (/out of memory|GPU memory/i.test(error?.message || '')) return 'The local GPU ran out of memory. Close other GPU apps and try again.'
  if (/not installed|No module named/i.test(error?.message || '')) return 'Soul Pics local AI is not installed completely. Run npm run setup:local-ai.'
  return error?.message || 'Local cutout failed. Check the server log.'
}

app.get('/api/health', (_request, response) => response.json({
  ok: true,
  sourceVersion: SOURCE_VERSION,
  configured: localAi.available() || Boolean(process.env.OPENAI_API_KEY),
  localCutout: { available: localAi.available(), workerRunning: Boolean(localAi.child), apiUsed: false },
  background: { configured: Boolean(process.env.OPENAI_API_KEY), apiUsed: true },
}))

app.post('/api/background', async (request, response) => {
  const executionStartedAt = new Date().toISOString()
  const startedAt = Date.now()
  console.log('Background execution started', { sourceVersion: SOURCE_VERSION, startedAt: executionStartedAt })
  try {
    if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: 'Server is not configured with OPENAI_API_KEY.' })
    const prompt = String(request.body?.prompt || '').trim()
    if (prompt.length < 3 || prompt.length > 1500) return response.status(400).json({ error: 'Describe the background in 3 to 1500 characters.' })
    const size = imageSize(request.body?.width, request.body?.height)
    if (!size) return response.status(400).json({ error: 'The requested canvas size is not supported for AI generation.' })
    const quality = ['low', 'medium', 'high'].includes(request.body?.quality) ? request.body.quality : 'low'
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 0, timeout: 120000 })
    console.log('Background OpenAI request started', { model: 'gpt-image-2', operation: 'images.generate', quality, elapsedMs: Date.now() - startedAt })
    const result = await client.images.generate({
      model: 'gpt-image-2',
      prompt: `Create a polished background image for a designed social graphic at ${size}. ${prompt}\nDo not add readable text, logos, watermarks, borders, or frames. Keep the composition useful for a separately composited foreground subject and headline unless the user explicitly asks otherwise.`,
      size, quality, output_format: 'png', n: 1,
    })
    const base64 = result.data?.[0]?.b64_json
    if (!base64) throw new Error('Image API returned no image data.')
    const png = Buffer.from(base64, 'base64')
    console.log('Background generation completed', { outputBytes: png.length, elapsedMs: Date.now() - startedAt })
    response.set('Cache-Control', 'no-store').type('png').send(png)
  } catch (error) {
    console.error('Background generation failed', { sourceVersion: SOURCE_VERSION, startedAt: executionStartedAt, status: error?.status, code: error?.code, requestId: error?.request_id, message: error?.message, elapsedMs: Date.now() - startedAt })
    response.status(error?.status === 400 ? 400 : 500).json({ error: apiError(error, 'Background generation failed. Check the API server log for details.') })
  }
})

app.post('/api/mask', (request, _response, next) => {
  request.maskExecutionStartedAt = new Date().toISOString()
  console.log('Local mask execution started', { sourceVersion: SOURCE_VERSION, startedAt: request.maskExecutionStartedAt })
  next()
}, upload.single('image'), async (request, response) => {
  const startedAt = Date.now()
  let tempDirectory
  try {
    if (!localAi.available()) return response.status(503).json({ error: 'Soul Pics local AI is not installed completely. Run npm run setup:local-ai.' })
    if (!request.file?.mimetype?.startsWith('image/')) return response.status(400).json({ error: 'Upload one image file.' })
    const prompt = String(request.body.prompt || '').trim()
    if (prompt.length < 3 || prompt.length > 500) return response.status(400).json({ error: 'Describe what to keep in 3 to 500 characters.' })
    const key = crypto.createHash('sha256').update('mask-v7-local-grounded-sam2-birefnet').update(request.file.buffer).update(prompt).digest('hex')
    if (cache.has(key)) return response.set('X-Soul-Pics-Cache', 'hit').type('png').send(cache.get(key))
    const metadata = await sharp(request.file.buffer).metadata()
    if (!metadata.width || !metadata.height) return response.status(400).json({ error: 'The image dimensions could not be read.' })
    console.log('Local mask input decoded', { width: metadata.width, height: metadata.height, format: metadata.format, bytes: request.file.size, elapsedMs: Date.now() - startedAt })

    tempDirectory = await fsp.mkdtemp(path.join(os.tmpdir(), 'soul-pics-mask-'))
    const extension = request.file.mimetype.includes('png') ? '.png' : request.file.mimetype.includes('webp') ? '.webp' : '.jpg'
    const inputPath = path.join(tempDirectory, `source${extension}`)
    const outputPath = path.join(tempDirectory, 'cutout.png')
    await fsp.writeFile(inputPath, request.file.buffer)
    const details = await localAi.request({ action: 'mask', inputPath, outputPath, prompt })
    const png = await fsp.readFile(outputPath)
    const alpha = (await sharp(png).extractChannel('alpha').stats()).channels?.[0] || {}
    console.log('Local mask completed', {
      ...details, outputBytes: png.length, alphaMin: alpha.min, alphaMax: alpha.max,
      elapsedMs: Date.now() - startedAt, apiUsed: false,
    })
    cacheSet(key, png)
    response
      .set('Cache-Control', 'no-store')
      .set('X-Soul-Pics-Local-AI', 'true')
      .set('X-Soul-Pics-Normalized-Prompt', encodeURIComponent(details.normalizedPrompt || ''))
      .type('png')
      .send(png)
  } catch (error) {
    console.error('Local mask failed', { name: error?.name, errorType: error?.errorType, message: error?.message, elapsedMs: Date.now() - startedAt })
    response.status(/No subject matched/.test(error?.message || '') ? 422 : 500).json({ error: localAiError(error) })
  } finally {
    if (tempDirectory) await fsp.rm(tempDirectory, { recursive: true, force: true }).catch(() => {})
  }
})

app.listen(port, '127.0.0.1', () => console.log(`Soul Pics API listening on http://127.0.0.1:${port}`, {
  sourceVersion: SOURCE_VERSION,
  localCutoutAvailable: localAi.available(),
  backgroundApiConfigured: Boolean(process.env.OPENAI_API_KEY),
  startedAt: new Date().toISOString(),
}))
