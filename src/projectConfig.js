export const PRESETS = {
  youtubeLandscape: { width: 1280, height: 720 },
  youtubeVertical: { width: 1080, height: 1920 },
  instagram: { width: 1080, height: 1440 },
  xHeader: { width: 1500, height: 500 },
  socialIcon: { width: 400, height: 400 },
}

export const CUSTOM_LIMITS = { min: 64, max: 4096 }
export const UI_VERSION = 'v1.0.9'

const DEFAULT_FONT_OPTIONS = [
  ['Arial', 'Arial, sans-serif'],
  ['Segoe UI', "'Segoe UI', sans-serif"],
  ['Noto Sans JP', "'Noto Sans JP', sans-serif"],
  ['Georgia', 'Georgia, serif'],
  ['Times New Roman', "'Times New Roman', serif"],
  ['Impact', 'Impact, sans-serif'],
  ['Courier New', "'Courier New', monospace"],
].map(([name, value]) => ({ name, value }))

export function fontOption(name) {
  return DEFAULT_FONT_OPTIONS.find((option) => option.name === name) || {
    name,
    value: `"${String(name).replaceAll('"', '\\"')}"`,
  }
}

export function cachedFontOptions() {
  try {
    const names = JSON.parse(localStorage.getItem('soul-pics-local-fonts') || '[]')
    if (Array.isArray(names) && names.length) return names.map(fontOption)
  } catch {
    // Local storage can be disabled or contain data from an older release.
  }
  return DEFAULT_FONT_OPTIONS
}

export function projectPreset(project) {
  if (project.preset !== 'custom') return PRESETS[project.preset] || PRESETS.youtubeLandscape
  const width = Math.max(CUSTOM_LIMITS.min, Math.min(CUSTOM_LIMITS.max, Number(project.customWidth) || 1200))
  const height = Math.max(CUSTOM_LIMITS.min, Math.min(CUSTOM_LIMITS.max, Number(project.customHeight) || 1200))
  return { width, height }
}

export function freshText(value = 'Your headline') {
  return {
    id: crypto.randomUUID(),
    value,
    x: 640,
    y: 120,
    size: 76,
    color: '#ffffff',
    font: 'Arial, sans-serif',
    weight: 800,
    italic: false,
    underline: false,
    stroke: 5,
    strokeColor: '#111111',
    shadowColor: '#000000',
    shadowX: 6,
    shadowY: 8,
    shadowSpread: 0,
    shadowBlur: 8,
    shadowOpacity: 45,
    backgroundColor: '#20252a',
    backgroundOpacity: 0,
    backgroundPaddingX: 28,
    backgroundPaddingY: 14,
    backgroundRadius: 12,
    backgroundBlur: 0,
  }
}

export const DEFAULT_QUALITY = Object.freeze({
  enabled: false,
  backgroundBlur: 0,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  edgeSoftness: 0,
  colorSpill: 0,
  spillColor: '#647fa3',
  sharpness: 0,
  grain: 0,
  shadowDistance: 0,
  shadowOpacity: 0,
  shadowBlur: 0,
})

export function formatMessage(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

export function storedLanguage() {
  try {
    return localStorage.getItem('soul-pics-language') === 'ja' ? 'ja' : 'en'
  } catch {
    return 'en'
  }
}
