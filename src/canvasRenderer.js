import { DEFAULT_QUALITY, projectPreset } from './projectConfig.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function fitContain(image, canvas) {
  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
  return { width: image.naturalWidth * scale, height: image.naturalHeight * scale }
}

export function backgroundRect(image, canvas, fitMode = 'cover', positionX = 50, positionY = 50) {
  if (fitMode === 'stretch') return { x: 0, y: 0, width: canvas.width, height: canvas.height }

  const scale = fitMode === 'actual'
    ? 1
    : fitMode === 'contain'
      ? Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
      : Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale

  return {
    x: (canvas.width - width) * (positionX / 100),
    y: (canvas.height - height) * (positionY / 100),
    width,
    height,
  }
}

function drawBackground(ctx, image, project, targetCanvas) {
  const preset = projectPreset(project)
  const rect = backgroundRect(image, preset, project.backgroundFit, project.backgroundPositionX, project.backgroundPositionY)
  const scaleX = targetCanvas.width / preset.width
  const scaleY = targetCanvas.height / preset.height
  ctx.drawImage(image, rect.x * scaleX, rect.y * scaleY, rect.width * scaleX, rect.height * scaleY)
}

function hexToRgba(hex, opacity) {
  const value = hex.replace('#', '')
  const expanded = value.length === 3 ? value.split('').map((item) => item + item).join('') : value
  const number = Number.parseInt(expanded, 16)
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(Math.max(0, radius), width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.quadraticCurveTo(x, y, x + safeRadius, y)
  ctx.closePath()
}

export function sampleBackgroundTint(project) {
  const sample = document.createElement('canvas')
  sample.width = 48
  sample.height = 48
  const ctx = sample.getContext('2d', { willReadFrequently: true })

  ctx.fillStyle = project.backgroundColor
  ctx.fillRect(0, 0, sample.width, sample.height)
  if (project.backgroundImage) drawBackground(ctx, project.backgroundImage, project, sample)

  const pixels = ctx.getImageData(0, 0, sample.width, sample.height).data
  let red = 0
  let green = 0
  let blue = 0
  let count = 0
  for (let index = 0; index < pixels.length; index += 16) {
    red += pixels[index]
    green += pixels[index + 1]
    blue += pixels[index + 2]
    count += 1
  }

  const channel = (value) => Math.round(value / count).toString(16).padStart(2, '0')
  return `#${channel(red)}${channel(green)}${channel(blue)}`
}

function canvasStats(canvas, ignoreTransparent = false) {
  const pixels = canvas.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data
  let count = 0
  let luminanceSum = 0
  let luminanceSquaredSum = 0
  let saturationSum = 0
  let warmthSum = 0
  let detailSum = 0
  let previousLuminance = null

  for (let index = 0; index < pixels.length; index += 4) {
    if (ignoreTransparent && pixels[index + 3] < 20) continue
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
    const high = Math.max(red, green, blue)
    const low = Math.min(red, green, blue)

    luminanceSum += luminance
    luminanceSquaredSum += luminance * luminance
    saturationSum += high ? (high - low) / high : 0
    warmthSum += (red - blue) / 255
    if (previousLuminance !== null) detailSum += Math.abs(luminance - previousLuminance)
    previousLuminance = luminance
    count += 1
  }

  if (!count) return { y: 128, c: 40, s: 0, w: 0, d: 12 }
  const averageLuminance = luminanceSum / count
  return {
    y: averageLuminance,
    c: Math.sqrt(Math.max(0, luminanceSquaredSum / count - averageLuminance * averageLuminance)),
    s: saturationSum / count,
    w: warmthSum / count,
    d: detailSum / Math.max(1, count - 1),
  }
}

export function analyzeFinalQuality(project, strength) {
  const sampleSize = 96
  const backgroundCanvas = document.createElement('canvas')
  const subjectCanvas = document.createElement('canvas')
  backgroundCanvas.width = backgroundCanvas.height = subjectCanvas.width = subjectCanvas.height = sampleSize

  const backgroundCtx = backgroundCanvas.getContext('2d')
  backgroundCtx.fillStyle = project.backgroundColor
  backgroundCtx.fillRect(0, 0, sampleSize, sampleSize)
  if (project.backgroundImage) drawBackground(backgroundCtx, project.backgroundImage, project, backgroundCanvas)

  const subjectCtx = subjectCanvas.getContext('2d')
  const fitted = fitContain(project.subjectImage, subjectCanvas)
  subjectCtx.drawImage(project.subjectImage, (sampleSize - fitted.width) / 2, (sampleSize - fitted.height) / 2, fitted.width, fitted.height)

  const background = canvasStats(backgroundCanvas)
  const subject = canvasStats(subjectCanvas, true)
  const multiplier = { weak: 0.5, standard: 1, strong: 1.5 }[strength] || 1
  const recommendation = (value, min, max) => Math.round(clamp(value * multiplier, min, max))

  return {
    enabled: true,
    backgroundBlur: recommendation(Math.max(0, (background.d - subject.d) * 0.34), 0, 14),
    brightness: recommendation((background.y - subject.y) * 0.22, -30, 30),
    contrast: recommendation((background.c - subject.c) * 0.55, -35, 35),
    saturation: recommendation((background.s - subject.s) * 75, -40, 40),
    temperature: recommendation((background.w - subject.w) * 120, -60, 60),
    edgeSoftness: Number(clamp(Math.max(0, subject.d - background.d) * 0.035 * multiplier, 0, 3).toFixed(2)),
    colorSpill: recommendation(10 + Math.abs(background.w - subject.w) * 22, 0, 35),
    spillColor: sampleBackgroundTint(project),
    sharpness: recommendation((background.d - subject.d) * 1.35, -35, 35),
    grain: recommendation(Math.max(0, subject.d - background.d) * 0.5, 0, 24),
    shadowDistance: recommendation(10 + background.c * 0.12, 0, 36),
    shadowOpacity: recommendation(18 + background.c * 0.28, 0, 55),
    shadowBlur: recommendation(18 + (55 - background.c) * 0.22, 0, 48),
  }
}

function drawGrain(ctx, width, height, opacity) {
  if (opacity <= 0) return
  const texture = document.createElement('canvas')
  texture.width = texture.height = 96
  const textureCtx = texture.getContext('2d')
  const imageData = textureCtx.createImageData(96, 96)

  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = 80 + ((((index / 4) * 9301 + 49297) % 233280) / 233280) * 95
    imageData.data[index] = imageData.data[index + 1] = imageData.data[index + 2] = value
    imageData.data[index + 3] = 255
  }

  textureCtx.putImageData(imageData, 0, 0)
  ctx.save()
  ctx.globalAlpha = opacity / 100
  ctx.globalCompositeOperation = 'soft-light'
  ctx.drawImage(texture, 0, 0, width, height)
  ctx.restore()
}

function displayedSubjectRotation(subject) {
  return Boolean(subject.flip) !== Boolean(subject.flipY) ? -subject.rotation : subject.rotation
}

function renderScene(ctx, canvas, project) {
  const preset = projectPreset(project)
  const quality = project.quality || DEFAULT_QUALITY
  ctx.fillStyle = project.backgroundColor
  ctx.fillRect(0, 0, preset.width, preset.height)

  if (project.backgroundImage) {
    ctx.save()
    if (quality.enabled && quality.backgroundBlur) ctx.filter = `blur(${quality.backgroundBlur}px)`
    drawBackground(ctx, project.backgroundImage, project, canvas)
    ctx.restore()
  }

  if (project.subjectImage) {
    const fitted = fitContain(project.subjectImage, preset)
    const width = fitted.width * project.subject.scale
    const height = fitted.height * project.subject.scale
    const subjectLayer = document.createElement('canvas')
    subjectLayer.width = preset.width
    subjectLayer.height = preset.height
    const subjectCtx = subjectLayer.getContext('2d')
    const softness = quality.enabled ? quality.edgeSoftness + Math.max(0, -quality.sharpness) * 0.025 : 0
    const sharpness = quality.enabled ? Math.max(0, quality.sharpness) * 0.18 : 0

    subjectCtx.save()
    subjectCtx.translate(project.subject.x, project.subject.y)
    subjectCtx.scale(project.subject.flip ? -1 : 1, project.subject.flipY ? -1 : 1)
    subjectCtx.rotate(project.subject.rotation * Math.PI / 180)
    subjectCtx.filter = `brightness(${100 + (quality.enabled ? quality.brightness : 0)}%) contrast(${100 + (quality.enabled ? quality.contrast + sharpness : 0)}%) saturate(${100 + (quality.enabled ? quality.saturation : 0)}%) blur(${softness}px)`
    subjectCtx.drawImage(project.subjectImage, -width / 2, -height / 2, width, height)
    subjectCtx.restore()

    if (quality.enabled && quality.temperature) {
      subjectCtx.save()
      subjectCtx.globalCompositeOperation = 'source-atop'
      subjectCtx.globalAlpha = Math.abs(quality.temperature) / 500
      subjectCtx.fillStyle = quality.temperature > 0 ? '#ff9b52' : '#5f8dff'
      subjectCtx.fillRect(0, 0, preset.width, preset.height)
      subjectCtx.restore()
    }

    if (quality.enabled && quality.colorSpill) {
      subjectCtx.save()
      subjectCtx.globalCompositeOperation = 'source-atop'
      subjectCtx.globalAlpha = quality.colorSpill / 250
      subjectCtx.fillStyle = quality.spillColor
      subjectCtx.fillRect(0, 0, preset.width, preset.height)
      subjectCtx.restore()
    }

    ctx.save()
    if (quality.enabled && quality.shadowOpacity) {
      ctx.filter = `drop-shadow(${quality.shadowDistance * 0.35}px ${quality.shadowDistance}px ${quality.shadowBlur}px ${hexToRgba('#000000', quality.shadowOpacity / 100)})`
    }
    ctx.drawImage(subjectLayer, 0, 0)
    ctx.restore()
  }

  if (quality.enabled) drawGrain(ctx, preset.width, preset.height, quality.grain)
}

function drawTextLayer(ctx, canvas, preset, layer) {
  if (!layer.value.trim()) return

  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${layer.italic ? 'italic ' : ''}${layer.weight} ${layer.size}px ${layer.font}`
  ctx.lineJoin = 'round'

  const metrics = ctx.measureText(layer.value)
  const textHeight = Math.max(layer.size, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
  const backgroundOpacity = clamp(layer.backgroundOpacity ?? 0, 0, 100) / 100
  const backgroundBlur = Math.max(0, layer.backgroundBlur ?? 0)

  if (backgroundOpacity > 0 || backgroundBlur > 0) {
    const paddingX = Math.max(0, layer.backgroundPaddingX ?? 28)
    const paddingY = Math.max(0, layer.backgroundPaddingY ?? 14)
    const boxWidth = metrics.width + paddingX * 2
    const boxHeight = textHeight + paddingY * 2
    const boxX = layer.x - boxWidth / 2
    const boxY = layer.y - boxHeight / 2
    const radius = Math.max(0, layer.backgroundRadius ?? 12)

    if (backgroundBlur > 0) {
      const snapshot = document.createElement('canvas')
      snapshot.width = preset.width
      snapshot.height = preset.height
      snapshot.getContext('2d').drawImage(canvas, 0, 0)
      ctx.save()
      roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, radius)
      ctx.clip()
      ctx.filter = `blur(${backgroundBlur}px)`
      ctx.drawImage(snapshot, 0, 0)
      ctx.restore()
    }

    if (backgroundOpacity > 0) {
      ctx.save()
      ctx.fillStyle = hexToRgba(layer.backgroundColor || '#20252a', backgroundOpacity)
      roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, radius)
      ctx.fill()
      ctx.restore()
    }
  }

  const spread = Math.max(0, layer.shadowSpread || 0)
  const blur = Math.max(0, layer.shadowBlur || 0)
  const opacity = clamp(layer.shadowOpacity ?? 45, 0, 100) / 100
  if (opacity > 0) {
    const shadowLayer = document.createElement('canvas')
    shadowLayer.width = preset.width
    shadowLayer.height = preset.height
    const shadowCtx = shadowLayer.getContext('2d')
    shadowCtx.textAlign = 'center'
    shadowCtx.textBaseline = 'middle'
    shadowCtx.font = ctx.font
    shadowCtx.lineJoin = 'round'
    shadowCtx.fillStyle = layer.shadowColor
    shadowCtx.strokeStyle = layer.shadowColor
    if (spread > 0) {
      shadowCtx.lineWidth = spread * 2
      shadowCtx.strokeText(layer.value, layer.x, layer.y)
    }
    shadowCtx.fillText(layer.value, layer.x, layer.y)

    ctx.save()
    ctx.globalAlpha = opacity
    ctx.filter = blur > 0 ? `blur(${blur}px)` : 'none'
    ctx.drawImage(shadowLayer, layer.shadowX, layer.shadowY)
    ctx.restore()
  }

  ctx.strokeStyle = layer.strokeColor
  ctx.lineWidth = layer.stroke
  if (layer.stroke) ctx.strokeText(layer.value, layer.x, layer.y)
  ctx.fillStyle = layer.color
  ctx.fillText(layer.value, layer.x, layer.y)

  if (layer.underline) {
    const underlineY = layer.y + layer.size * 0.42
    ctx.strokeStyle = layer.color
    ctx.lineWidth = Math.max(1, layer.size * 0.055)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(layer.x - metrics.width / 2, underlineY)
    ctx.lineTo(layer.x + metrics.width / 2, underlineY)
    ctx.stroke()
  }

  ctx.restore()
}

export function renderProject(canvas, project) {
  const preset = projectPreset(project)
  canvas.width = preset.width
  canvas.height = preset.height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, preset.width, preset.height)
  renderScene(ctx, canvas, project)
  for (const layer of project.textLayers) drawTextLayer(ctx, canvas, preset, layer)
}

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  }
}

function hitTextLayer(ctx, point, layer) {
  if (!layer.value.trim()) return false
  ctx.save()
  ctx.font = `${layer.italic ? 'italic ' : ''}${layer.weight} ${layer.size}px ${layer.font}`
  const metrics = ctx.measureText(layer.value)
  ctx.restore()

  const backgroundActive = (layer.backgroundOpacity ?? 0) > 0 || (layer.backgroundBlur ?? 0) > 0
  const backgroundPaddingX = backgroundActive ? (layer.backgroundPaddingX ?? 28) * 2 : 24
  const backgroundPaddingY = backgroundActive ? (layer.backgroundPaddingY ?? 14) * 2 : 18
  const width = metrics.width + Math.max(layer.stroke * 2 + 24, backgroundPaddingX)
  const measuredHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const height = Math.max(measuredHeight, layer.size) + Math.max(layer.stroke * 2 + 18, backgroundPaddingY)
  return Math.abs(point.x - layer.x) <= width / 2 && Math.abs(point.y - layer.y) <= height / 2
}

function hitSubject(point, project, preset) {
  if (!project.subjectImage) return false
  const fitted = fitContain(project.subjectImage, preset)
  const halfWidth = fitted.width * project.subject.scale / 2
  const halfHeight = fitted.height * project.subject.scale / 2
  const dx = point.x - project.subject.x
  const dy = point.y - project.subject.y
  const angle = -(displayedSubjectRotation(project.subject) * Math.PI) / 180
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle)
  return Math.abs(localX) <= halfWidth && Math.abs(localY) <= halfHeight
}

export function canvasTarget(canvas, point, project) {
  const ctx = canvas.getContext('2d')
  for (let index = project.textLayers.length - 1; index >= 0; index -= 1) {
    if (hitTextLayer(ctx, point, project.textLayers[index])) return { type: 'text', index }
  }
  if (hitSubject(point, project, projectPreset(project))) return { type: 'subject' }
  return project.backgroundImage && project.backgroundFit !== 'stretch' ? { type: 'background' } : null
}
