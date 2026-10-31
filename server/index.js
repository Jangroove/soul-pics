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
import sharp from 'sharp'

const SOURCE_VERSION = 'v1.0.9'
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

function resolveCodexCommand() {
  const configured = process.env.SOUL_PICS_CODEX_BIN || process.env.CODEX_BIN
  if (configured) return configured
  if (process.platform === 'win32') {
    const installRoot = path.join(process.env.LOCALAPPDATA || os.homedir(), 'OpenAI', 'Codex', 'bin')
    try {
      const installs = fs.readdirSync(installRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ executable: path.join(installRoot, entry.name, 'codex.exe'), modifiedAt: fs.statSync(path.join(installRoot, entry.name)).mtimeMs }))
        .filter((entry) => fs.existsSync(entry.executable))
        .sort((left, right) => right.modifiedAt - left.modifiedAt)
      if (installs.length) return installs[0].executable
    } catch {
      // Fall back to PATH when Codex is not installed in its standard Windows location.
    }
  }
  return 'codex'
}

function codexCommandAvailable() {
  const command = resolveCodexCommand()
  if (path.isAbsolute(command) || command.includes(path.sep)) return fs.existsSync(command)
  const names = path.extname(command) ? [command] : process.platform === 'win32' ? [`${command}.exe`, `${command}.cmd`, command] : [command]
  return (process.env.PATH || '').split(path.delimiter).some((directory) => names.some((name) => fs.existsSync(path.join(directory, name))))
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

const appTempRoot = path.join(projectRoot, 'temp')
const workExchangeRoot = path.join(appTempRoot, 'work-exchange')
const workJobs = new Map()

function safeJobId(value) {
  return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value)
}

async function readWorkJob(jobId) {
  const job = workJobs.get(jobId)
  if (!job) return null
  try {
    const stat = await fsp.stat(job.resultPath)
    if (!stat.isFile() || stat.size < 100 || stat.size > 100 * 1024 * 1024) return null
    const png = await fsp.readFile(job.resultPath)
    const metadata = await sharp(png).metadata()
    if (metadata.format !== 'png' || !metadata.width || !metadata.height) return null
    if (job.mode === 'codex-background') return { png, stat, metadata }
    if (!metadata.hasAlpha) return null
    const alpha = await sharp(png).extractChannel('alpha').stats()
    if ((alpha.channels?.[0]?.min ?? 255) >= 255) return null
    return { png, stat, metadata, alpha: alpha.channels?.[0] }
  } catch {
    return null
  }
}

async function cleanOldWorkJobs() {
  const expiry = Date.now() - 24 * 60 * 60 * 1000
  await fsp.mkdir(workExchangeRoot, { recursive: true }).catch(() => {})
  for (const entry of await fsp.readdir(workExchangeRoot, { withFileTypes: true }).catch(() => [])) {
    if (!entry.isDirectory()) continue
    const directory = path.join(workExchangeRoot, entry.name)
    const stat = await fsp.stat(directory).catch(() => null)
    if (stat && stat.mtimeMs < expiry) {
      workJobs.delete(entry.name)
      await fsp.rm(directory, { recursive: true, force: true }).catch(() => {})
    }
  }
}

cleanOldWorkJobs()
setInterval(cleanOldWorkJobs, 60 * 60 * 1000).unref()

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

class CodexAppServerClient {
  constructor() {
    const command = resolveCodexCommand()
    this.child = spawn(command, ['app-server', '--listen', 'stdio://'], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    this.pending = new Map()
    this.listeners = new Set()
    this.sequence = 0
    this.buffer = ''
    this.failure = null
    this.child.stdout.on('data', (chunk) => this.consume(chunk))
    this.child.stderr.on('data', (chunk) => {
      const message = chunk.toString().trim()
      if (message) console.error('Codex App Server:', message.slice(-2000))
    })
    this.child.on('error', (error) => this.fail(error))
    this.child.on('close', (code) => this.fail(new Error(`Codex App Server exited (code ${code}).`)))
  }

  consume(chunk) {
    this.buffer += chunk.toString()
    let newline = this.buffer.indexOf('\n')
    while (newline >= 0) {
      const line = this.buffer.slice(0, newline).trim()
      this.buffer = this.buffer.slice(newline + 1)
      if (line) {
        try {
          const message = JSON.parse(line)
          if (typeof message.method === 'string') {
            for (const listener of this.listeners) listener(message)
          }
          const pending = this.pending.get(String(message.id))
          if (pending) {
            clearTimeout(pending.timer)
            this.pending.delete(String(message.id))
            if (message.error) pending.reject(new Error(message.error.message || 'Codex App Server request failed.'))
            else pending.resolve(message)
          }
        } catch {
          // Ignore non-JSON diagnostics emitted on stdout.
        }
      }
      newline = this.buffer.indexOf('\n')
    }
  }

  fail(error) {
    if (this.failure) return
    this.failure = error
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer)
      pending.reject(error)
    }
    this.pending.clear()
  }

  request(method, params, timeoutMs = 30000) {
    if (this.failure) return Promise.reject(this.failure)
    const id = ++this.sequence
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(String(id))
        reject(new Error(`Codex App Server request timed out: ${method}`))
      }, timeoutMs)
      this.pending.set(String(id), { resolve, reject, timer })
      try {
        this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
      } catch (error) {
        clearTimeout(timer)
        this.pending.delete(String(id))
        reject(error)
      }
    })
  }

  notify(method, params) {
    this.child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
  }

  onNotification(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  waitForTurn(threadId, timeoutMs = 60 * 60 * 1000) {
    let unsubscribe = () => {}
    let timer
    const promise = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        unsubscribe()
        reject(new Error('Codex did not finish the cutout within one hour.'))
      }, timeoutMs)
      unsubscribe = this.onNotification((message) => {
        if (message.method !== 'turn/completed' || message.params?.threadId !== threadId) return
        clearTimeout(timer)
        unsubscribe()
        const status = message.params?.turn?.status || 'unknown'
        if (status === 'completed') resolve()
        else reject(new Error(`Codex cutout turn ended with status: ${status}.`))
      })
    })
    return {
      promise,
      cancel: () => {
        clearTimeout(timer)
        unsubscribe()
      },
    }
  }

  close() {
    this.fail(new Error('Codex App Server closed.'))
    this.child.kill()
  }
}

function trackImageGenerationCalls(rpc, job) {
  job.imageGenerationAttempts = 0
  job.imageGenerationEvents = []
  let writeQueue = Promise.resolve()
  const writeLog = () => {
    const logPath = path.join(job.directory, 'codex-activity.json')
    const log = {
      jobId: job.id,
      threadId: job.threadId,
      imageGenerationAttempts: job.imageGenerationAttempts,
      imageGenerationEvents: job.imageGenerationEvents,
    }
    writeQueue = writeQueue.then(() => fsp.writeFile(logPath, `${JSON.stringify(log, null, 2)}\n`, 'utf8')).catch((error) => {
      console.error('Could not write Codex activity log', { jobId: job.id, message: error.message })
    })
    return writeQueue
  }
  rpc.onNotification((message) => {
    if (!['item/started', 'item/completed'].includes(message.method)) return
    const params = message.params
    if (params?.threadId !== job.threadId || params?.item?.type !== 'imageGeneration') return
    if (message.method === 'item/started') {
      job.imageGenerationAttempts += 1
      job.imageGenerationEvents.push({
        itemId: params.item.id,
        startedAt: params.startedAtMs,
        status: 'started',
      })
    } else {
      const event = job.imageGenerationEvents.find((item) => item.itemId === params.item.id)
      if (event) {
        event.completedAt = params.completedAtMs
        event.status = params.item.status || 'completed'
      }
    }
    void writeLog()
  })
  return { writeLog }
}

async function runCodexCutout(job) {
  const rpc = new CodexAppServerClient()
  job.status = 'starting'
  try {
    await rpc.request('initialize', {
      clientInfo: { name: 'soul-pics', title: 'Soul Pics', version: SOURCE_VERSION },
      capabilities: { experimentalApi: true },
    })
    rpc.notify('initialized', {})
    const started = await rpc.request('thread/start', {
      cwd: job.directory,
      sandbox: 'workspace-write',
      approvalPolicy: 'never',
      threadSource: 'appServer',
    })
    const threadId = started.result?.thread?.id
    if (!threadId) throw new Error('Codex could not start a cutout task.')
    job.threadId = threadId
    job.status = 'running'
    const activity = trackImageGenerationCalls(rpc, job)
    const completion = rpc.waitForTurn(threadId)
    try {
      await rpc.request('turn/start', {
        threadId,
        cwd: job.directory,
        input: [
          { type: 'skill', name: 'imagegen', path: path.join(os.homedir(), '.codex', 'skills', '.system', 'imagegen', 'SKILL.md') },
          { type: 'localImage', path: job.sourcePath, detail: 'high' },
          {
            type: 'text',
            text: [
              'Soul Pics is asking you to create a transparent PNG cutout from the attached source image.',
              `Source image: ${job.sourcePath}`,
              `Save the finished PNG to this exact path: ${job.resultPath}`,
              'Follow the attached imagegen skill and use its built-in image editing tool to remove the background and retain the object described below. Do not use an API or CLI fallback.',
              'Preserve the source image dimensions and original subject pixels as closely as possible. The output must be a PNG with an alpha channel and actually transparent background pixels.',
              'Copy the generated image into the exact result path above. Only create the requested result image in this job folder. Do not modify any other files or claim completion unless the PNG was fully written and verified.',
              'If the image editing tool is unavailable or the requested transparent PNG cannot be saved, explain that clearly and do not create a substitute image.',
              '',
              'User prompt:',
              job.prompt,
            ].join('\n'),
          },
        ],
      })
      await completion.promise
    } catch (error) {
      completion.cancel()
      throw error
    }
    const result = await readWorkJob(job.id)
    if (!result) throw new Error('Codex finished without a valid transparent result.png.')
    await activity.writeLog()
    job.status = 'completed'
    job.completedAt = Date.now()
    job.resultMetadata = { width: result.metadata.width, height: result.metadata.height, bytes: result.stat.size }
    console.log('Codex cutout completed', { jobId: job.id, threadId, imageGenerationAttempts: job.imageGenerationAttempts, ...job.resultMetadata })
  } catch (error) {
    job.status = 'failed'
    job.error = error?.code === 'ENOENT'
      ? 'Codex CLI was not found. Add it to PATH or set SOUL_PICS_CODEX_BIN.'
      : error?.message || 'Codex cutout failed.'
    console.error('Codex cutout failed', { jobId: job.id, threadId: job.threadId || null, message: job.error })
  } finally {
    // The listener is scoped to this task; the process exits after its turn.
    rpc.close()
  }
}

async function runCodexBackground(job) {
  const rpc = new CodexAppServerClient()
  job.status = 'starting'
  try {
    await rpc.request('initialize', {
      clientInfo: { name: 'soul-pics', title: 'Soul Pics', version: SOURCE_VERSION },
      capabilities: { experimentalApi: true },
    })
    rpc.notify('initialized', {})
    const started = await rpc.request('thread/start', {
      cwd: job.directory,
      sandbox: 'workspace-write',
      approvalPolicy: 'never',
      threadSource: 'appServer',
    })
    const threadId = started.result?.thread?.id
    if (!threadId) throw new Error('Codex could not start a background generation task.')
    job.threadId = threadId
    job.status = 'running'
    const completion = rpc.waitForTurn(threadId)
    try {
      await rpc.request('turn/start', {
        threadId,
        cwd: job.directory,
        input: [
          { type: 'skill', name: 'imagegen', path: path.join(os.homedir(), '.codex', 'skills', '.system', 'imagegen', 'SKILL.md') },
          {
            type: 'text',
            text: [
              'Soul Pics is asking you to generate one polished background image for a design canvas.',
              `Create a PNG at exactly ${job.width}×${job.height} pixels (aspect ratio ${job.width / job.height}).`,
              `Save the finished PNG to this exact path: ${job.resultPath}`,
              'Follow the attached imagegen skill and use its built-in image generation tool. Do not call an external API or use a CLI fallback.',
              'Do not include readable text, logos, watermarks, borders, or frames. Leave useful visual space for a separately composited subject and headline unless the user explicitly requests otherwise.',
              'Only create the requested PNG in this job folder. Do not modify other files or claim completion unless the image is fully written and decodable.',
              'The application will crop and resize the generated image to the exact target dimensions if necessary.',
              '',
              'User prompt:',
              job.prompt,
            ].join('\n'),
          },
        ],
      })
      await completion.promise
    } catch (error) {
      completion.cancel()
      throw error
    }

    const generated = await fsp.readFile(job.resultPath)
    const metadata = await sharp(generated).metadata()
    if (metadata.format !== 'png' || !metadata.width || !metadata.height) throw new Error('Codex finished without a decodable background PNG.')
    const finalPng = await sharp(generated)
      .resize(job.width, job.height, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer()
    await fsp.writeFile(job.resultPath, finalPng)
    const result = await readWorkJob(job.id)
    if (!result || result.metadata.width !== job.width || result.metadata.height !== job.height) throw new Error('Codex background could not be normalized to the requested canvas size.')
    job.status = 'completed'
    job.completedAt = Date.now()
    job.resultMetadata = { width: result.metadata.width, height: result.metadata.height, bytes: result.stat.size }
    console.log('Codex background completed', { jobId: job.id, threadId, ...job.resultMetadata })
  } catch (error) {
    job.status = 'failed'
    job.error = error?.code === 'ENOENT'
      ? 'Codex CLI was not found. Add it to PATH or set SOUL_PICS_CODEX_BIN.'
      : error?.message || 'Codex background generation failed.'
    console.error('Codex background failed', { jobId: job.id, threadId: job.threadId || null, message: job.error })
  } finally {
    rpc.close()
  }
}

const localAi = new LocalAiWorker(localAiPython)
process.on('exit', () => localAi.child?.kill())

function cacheSet(key, value) {
  cache.set(key, value)
  while (cache.size > 3) cache.delete(cache.keys().next().value)
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
  configured: localAi.available() || codexCommandAvailable(),
  localCutout: { available: localAi.available(), workerRunning: Boolean(localAi.child), apiUsed: false },
  background: { configured: codexCommandAvailable(), provider: 'codex-app-server', apiUsed: false },
}))

app.post('/api/work-cutout', upload.single('image'), async (request, response) => {
  try {
    if (!request.file?.mimetype?.startsWith('image/')) return response.status(400).json({ error: 'Upload one image file.' })
    const prompt = String(request.body?.prompt || '').trim()
    if (prompt.length < 3 || prompt.length > 500) return response.status(400).json({ error: 'Describe what to keep in 3 to 500 characters.' })
    const metadata = await sharp(request.file.buffer).metadata()
    if (!metadata.width || !metadata.height) return response.status(400).json({ error: 'The image dimensions could not be read.' })
    await fsp.mkdir(workExchangeRoot, { recursive: true })
    const id = crypto.randomUUID()
    const directory = path.join(workExchangeRoot, id)
    await fsp.mkdir(directory, { recursive: false })
    const extension = request.file.mimetype.includes('png') ? 'png' : request.file.mimetype.includes('webp') ? 'webp' : 'jpg'
    const inputName = `source.${extension}`
    const resultName = 'result.png'
    const sourcePath = path.join(directory, inputName)
    const resultPath = path.join(directory, resultName)
    const instructions = [
      'Soul Pics cutout experiment',
      '',
      'This test checks local file access in ChatGPT desktop Work. Do not ask me to attach or upload the image.',
      'Use Work local access to read this exact source image path:',
      sourcePath,
      'Create a transparent PNG cutout using the user prompt below, then save it to this exact output path:',
      resultPath,
      'Do not rename the output file.',
      'The result must be a PNG with a transparent alpha channel. Keep the original subject pixels and image dimensions where possible.',
      'If you cannot access the local path, say so clearly and ask me to open or grant access to the folder. Do not claim to have read or saved files you could not access.',
      '',
      'User prompt:',
      prompt,
      '',
      'When finished, ensure the output file is fully written. Soul Pics will detect it automatically.',
    ].join('\n')
    await Promise.all([
      fsp.writeFile(path.join(directory, inputName), request.file.buffer),
      fsp.writeFile(path.join(directory, 'INSTRUCTIONS.txt'), instructions, 'utf8'),
    ])
    workJobs.set(id, { id, mode: 'work', status: 'waiting', directory, inputName, sourcePath, resultName, resultPath, prompt, createdAt: Date.now() })
    response.json({ id, folder: directory, inputName, resultName, instructions })
  } catch (error) {
    console.error('Work cutout job creation failed', { message: error?.message })
    response.status(500).json({ error: 'Could not prepare the local Work exchange folder.' })
  }
})

app.post('/api/codex-cutout', upload.single('image'), async (request, response) => {
  try {
    if (!request.file?.mimetype?.startsWith('image/')) return response.status(400).json({ error: 'Upload one image file.' })
    const prompt = String(request.body?.prompt || '').trim()
    if (prompt.length < 3 || prompt.length > 500) return response.status(400).json({ error: 'Describe what to keep in 3 to 500 characters.' })
    const metadata = await sharp(request.file.buffer).metadata()
    if (!metadata.width || !metadata.height) return response.status(400).json({ error: 'The image dimensions could not be read.' })
    await fsp.mkdir(workExchangeRoot, { recursive: true })
    const id = crypto.randomUUID()
    const directory = path.join(workExchangeRoot, id)
    await fsp.mkdir(directory, { recursive: false })
    const extension = request.file.mimetype.includes('png') ? 'png' : request.file.mimetype.includes('webp') ? 'webp' : 'jpg'
    const inputName = `source.${extension}`
    const sourcePath = path.join(directory, inputName)
    const resultName = 'result.png'
    const resultPath = path.join(directory, resultName)
    await fsp.writeFile(sourcePath, request.file.buffer)
    const job = { id, mode: 'codex', status: 'queued', directory, inputName, sourcePath, resultName, resultPath, prompt, sourceMetadata: metadata, createdAt: Date.now() }
    workJobs.set(id, job)
    response.json({ id, provider: 'codex', folder: directory, inputName, resultName, status: job.status })
    setImmediate(() => { void runCodexCutout(job) })
  } catch (error) {
    console.error('Codex cutout job creation failed', { message: error?.message })
    response.status(500).json({ error: 'Could not start the Codex cutout task.' })
  }
})

app.get('/api/work-cutout/:id/status', async (request, response) => {
  if (!safeJobId(request.params.id)) return response.status(400).json({ error: 'Invalid job id.' })
  const job = workJobs.get(request.params.id)
  if (!job) return response.status(404).json({ error: 'Cutout job was not found.' })
  const result = await readWorkJob(request.params.id)
  const ready = Boolean(result) && (!['codex', 'codex-background'].includes(job.mode) || job.status === 'completed')
  response.json({ ready, status: job.status, error: job.error || null, ...(job.mode === 'codex' ? { imageGenerationAttempts: job.imageGenerationAttempts ?? 0 } : {}), ...(ready ? { width: result.metadata.width, height: result.metadata.height, bytes: result.stat.size } : {}) })
})

app.get('/api/work-cutout/:id/result', async (request, response) => {
  if (!safeJobId(request.params.id)) return response.status(400).json({ error: 'Invalid job id.' })
  const result = await readWorkJob(request.params.id)
  if (!result) return response.status(404).json({ error: 'A complete transparent PNG result is not available yet.' })
  response.set('Cache-Control', 'no-store').type('png').send(result.png)
})

app.post('/api/work-cutout/:id/open-folder', async (request, response) => {
  if (!safeJobId(request.params.id)) return response.status(400).json({ error: 'Invalid job id.' })
  const job = workJobs.get(request.params.id)
  if (!job) return response.status(404).json({ error: 'Work cutout job was not found.' })
  try {
    const command = process.platform === 'win32' ? 'explorer.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open'
    const folderProcess = spawn(command, [job.directory], { detached: true, stdio: 'ignore', windowsHide: false })
    folderProcess.once('error', (error) => console.error('Could not open Work exchange folder', { message: error.message }))
    folderProcess.unref()
    response.json({ ok: true })
  } catch (error) {
    response.status(500).json({ error: 'Could not open the exchange folder.' })
  }
})

app.post('/api/background', async (request, response) => {
  try {
    const prompt = String(request.body?.prompt || '').trim()
    if (prompt.length < 3 || prompt.length > 1500) return response.status(400).json({ error: 'Describe the background in 3 to 1500 characters.' })
    const width = Number(request.body?.width)
    const height = Number(request.body?.height)
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 64 || height < 64 || width > 4096 || height > 4096 || width * height > 16777216 || Math.max(width, height) / Math.min(width, height) > 3) {
      return response.status(400).json({ error: 'The requested canvas dimensions are outside the supported background generation range.' })
    }
    if (!codexCommandAvailable()) return response.status(503).json({ error: 'Codex CLI is unavailable. Install and sign in to Codex, then restart Soul Pics.' })
    await fsp.mkdir(workExchangeRoot, { recursive: true })
    const id = crypto.randomUUID()
    const directory = path.join(workExchangeRoot, id)
    await fsp.mkdir(directory, { recursive: false })
    const resultName = 'result.png'
    const resultPath = path.join(directory, resultName)
    const job = { id, mode: 'codex-background', status: 'queued', directory, resultName, resultPath, prompt, width, height, createdAt: Date.now() }
    workJobs.set(id, job)
    response.json({ id, provider: 'codex', resultName, width, height, status: job.status })
    setImmediate(() => { void runCodexBackground(job) })
  } catch (error) {
    console.error('Background generation job creation failed', { message: error?.message })
    response.status(500).json({ error: 'Could not start the Codex background generation task.' })
  }
})

app.get('/api/background/:id/status', async (request, response) => {
  if (!safeJobId(request.params.id)) return response.status(400).json({ error: 'Invalid background job id.' })
  const job = workJobs.get(request.params.id)
  if (!job || job.mode !== 'codex-background') return response.status(404).json({ error: 'Background generation job was not found.' })
  const result = await readWorkJob(job.id)
  const ready = Boolean(result) && job.status === 'completed'
  response.json({ ready, status: job.status, error: job.error || null, ...(ready ? { width: result.metadata.width, height: result.metadata.height, bytes: result.stat.size } : {}) })
})

app.get('/api/background/:id/result', async (request, response) => {
  if (!safeJobId(request.params.id)) return response.status(400).json({ error: 'Invalid background job id.' })
  const job = workJobs.get(request.params.id)
  if (!job || job.mode !== 'codex-background') return response.status(404).json({ error: 'Background generation job was not found.' })
  const result = await readWorkJob(job.id)
  if (!result || job.status !== 'completed') return response.status(404).json({ error: 'A complete background PNG is not available yet.' })
  response.set('Cache-Control', 'no-store').type('png').send(result.png)
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

    await fsp.mkdir(appTempRoot, { recursive: true })
    tempDirectory = await fsp.mkdtemp(path.join(appTempRoot, 'mask-'))
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
  backgroundCodexAvailable: codexCommandAvailable(),
  startedAt: new Date().toISOString(),
}))
