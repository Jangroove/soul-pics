import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import './styles.css'

const PRESETS = {
  youtubeLandscape: { width: 1280, height: 720 },
  youtubeVertical: { width: 1080, height: 1920 },
  instagram: { width: 1080, height: 1440 },
  xHeader: { width: 1500, height: 500 },
  socialIcon: { width: 400, height: 400 },
}

const CUSTOM_LIMITS = { min: 64, max: 4096 }
const UI_VERSION = 'v1.0.0'

const DEFAULT_FONT_OPTIONS = [
  ['Arial', 'Arial, sans-serif'],
  ['Segoe UI', "'Segoe UI', sans-serif"],
  ['Noto Sans JP', "'Noto Sans JP', sans-serif"],
  ['Georgia', 'Georgia, serif'],
  ['Times New Roman', "'Times New Roman', serif"],
  ['Impact', 'Impact, sans-serif'],
  ['Courier New', "'Courier New', monospace"],
].map(([name, value]) => ({ name, value }))

function fontOption(name) {
  return DEFAULT_FONT_OPTIONS.find((option) => option.name === name) || { name, value: `"${String(name).replaceAll('"', '\\"')}"` }
}

function cachedFontOptions() {
  try {
    const names = JSON.parse(localStorage.getItem('soul-pics-local-fonts') || '[]')
    if (Array.isArray(names) && names.length) return names.map(fontOption)
  } catch { /* Ignore unavailable or invalid local storage. */ }
  return DEFAULT_FONT_OPTIONS
}

function projectPreset(project) {
  if (project.preset !== 'custom') return PRESETS[project.preset] || PRESETS.youtubeLandscape
  const width = Math.max(CUSTOM_LIMITS.min, Math.min(CUSTOM_LIMITS.max, Number(project.customWidth) || 1200))
  const height = Math.max(CUSTOM_LIMITS.min, Math.min(CUSTOM_LIMITS.max, Number(project.customHeight) || 1200))
  return { width, height }
}

const COPY = {
  en: {
    presetYoutubeLandscape: 'YouTube thumbnail · Landscape', presetYoutubeVertical: 'YouTube Shorts · Vertical', presetInstagram: 'Instagram post · Portrait', presetXHeader: 'X profile header', presetSocialIcon: 'Social profile icon', presetCustom: 'Custom size', customWidth: 'Width', customHeight: 'Height', customHint: '64–4096 px',
    eyebrow: 'OPENAI BUILD WEEK · APPS FOR YOUR LIFE', subhead: 'Say what to keep. Place it anywhere. Add the words that make it yours.', download: 'Download PNG',
    checkingAi: 'Checking AI…', localAiReady: 'Local cutout ready', localAiRequired: 'Local AI setup required', backgroundAiReady: 'BG API ready', backgroundKeyRequired: 'BG API key optional',
    canvas: '1. Canvas & background', format: 'Format', fallbackBackground: 'Padding / transparent area color',
    tabCanvas: 'Canvas', tabBackground: 'Canvas/BG', tabSubject: 'Subject', tabPlacement: 'Place', tabContent: 'Text', tabStyle: 'Style', tabLayout: 'Position', tabInfo: 'Info', tabBlend: 'Quality',
    canvas: '1. Canvas', background: '2. Background', backgroundFit: 'Background fit', fitCover: 'Cover · fill without distortion', fitContain: 'Contain · show the whole image', fitStretch: 'Stretch · fill with distortion', fitActual: 'Actual size · 1:1 pixels', backgroundPositionX: 'BG X', backgroundPositionY: 'BG Y', centerBackground: 'Center background', backgroundPositionHint: 'Drag an empty area of the preview to reposition the background.', generatePrompt: 'Generate from a prompt', backgroundPlaceholder: 'e.g. Neon blue and violet AI studio, cinematic light, open space on the left', generationQuality: 'GPT Image 2 generation quality', low: 'Low · draft / lowest cost', medium: 'Mid · standard quality', high: 'High · final quality / higher cost', generatingBackgroundButton: 'Generating background…', generateBackgroundButton: 'Generate AI background', saveBackground: 'Save background image', or: 'or', uploadBackground: 'Upload background image', backgroundHint: '[caution] Prompt-based AI background generation incurs a separate API charge.',
    subject: '3. Subject & placement', uploadSource: 'Upload source image', keepQuestion: 'What should Soul Pics keep?', keepPlaceholder: 'e.g. Keep only the person and the product in their hands', creatingMask: 'Creating local cutout…', createMask: 'Create local AI cutout', saveSubject: 'Save cutout image', maskHint: 'The prompt instructions are converted on this PC and processed with Grounding DINO, SAM 2.1, and BiRefNet. Everything runs locally, so there are no additional charges.',
    placement: 'Placement controls', size: 'Size', x: 'X', y: 'Y', rotation: 'Rotation', brightness: 'Brightness', contrast: 'Contrast', flip: 'Flip horizontally', flipVertical: 'Flip vertically',
    output: 'Output', outputHint: 'Preview and download share one Canvas renderer.', dragHint: 'Drag the background, subject, or text directly on the preview.', previewLabel: 'Soul Pics output preview', processing: 'Processing', processingHint: 'Please keep this tab open. The preview will update automatically when finished.', loadingBackground: 'Loading and preparing the background image…', loadingSubject: 'Loading and preparing the subject image…', loadingFontsProcessing: 'Loading the fonts installed on this PC…',
    textLayers: '4. Text layers', textBlock: 'Text', backgroundBlock: 'Text background', outlineBlock: 'Outline', shadowBlock: 'Shadow', blockColor: 'Color', blockWidth: 'Width', blockOpacity: 'Opacity', blockSpread: 'Spread', blockBlur: 'Blur', blockPaddingX: 'Horizontal padding', blockPaddingY: 'Vertical padding', blockRadius: 'Corner radius', layer: 'Layer', addLayer: 'Add text layer', text: 'Text', font: 'Font', loadFonts: 'PC fonts', loadingFonts: 'Loading…', textColor: 'Text color', outlineColor: 'Outline color', shadowColor: 'Shadow color', outline: 'Outline', shadowSize: 'Shadow spread', textShadowOpacity: 'Shadow opacity', textShadowX: 'Shadow X', textShadowY: 'Shadow Y', textShadowBlur: 'Blur', shadowX: 'Shadow X', shadowY: 'Shadow Y', shadowBlur: 'Shadow blur', bold: 'Bold', italic: 'Italic', underline: 'Underline', removeLayer: 'Remove selected layer', fontsLoaded: '{count} installed font families loaded.', noFontsFound: 'This browser returned no local fonts. The fallback list remains available.', fontAccessUnsupported: 'This browser cannot list installed fonts. Use desktop Chrome or Edge.', fontAccessDenied: 'Font access was not allowed. You can enable Local fonts in the site permissions and try again.',
    blend: '5. Final quality adjustment', blendHint: 'Analyze the original background and subject locally, then fine-tune every visible value while watching the preview.', resetQuality: 'Reset to initial state', autoQuality: 'Recommended auto adjust', adjustmentStrength: 'Auto strength', weak: 'Weak', standard: 'Standard', strong: 'Strong', qualityLocalHint: 'All analysis and rendering are processed locally in this browser, so there are no additional charges.', toneGroup: 'Color & tone', depthGroup: 'Depth & edges', textureGroup: 'Texture', shadowGroup: 'Shadow', backgroundBlur: 'Background blur', brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation', temperature: 'Color temperature', edgeSoftness: 'Edge softness', colorSpill: 'Background color spill', sharpness: 'Subject sharpness', grain: 'Global grain', shadowDistance: 'Shadow distance', shadowOpacity: 'Shadow opacity', shadowBlur: 'Shadow blur', qualityApplied: 'Original assets analyzed locally; recommended values applied.', qualityReset: 'Final quality adjustments reset. Images, placement, and text were preserved.',
    promise: 'Build Week promise', promiseLocal: 'Original images remain local during editing.', promiseExplicit: 'AI runs only when you press an AI button.', promiseMatch: 'Download matches this preview.',
    start: 'Start with a background or a subject image.', subjectLoaded: 'Subject loaded. Original pixels stay local in this browser.', backgroundLoaded: 'Background loaded. Original pixels stay local in this browser.', badImage: 'That image could not be read. Try PNG, JPEG, or WebP.', exported: 'PNG exported from the exact same canvas used for the preview.', subjectSaved: 'The cutout/source image was saved without compositing.', backgroundSaved: 'The background image was saved without compositing.', localAiNotConfigured: 'Local cutout is not installed. Run npm run setup:local-ai, then restart the server.', backgroundAiNotConfigured: 'Background generation needs OPENAI_API_KEY in .env. Restart the server after adding it.', uploadSubjectFirst: 'Upload a source image first.', describeKeep: 'Describe what to keep before creating the local cutout.', sourcePrepareFailed: 'The source image could not be prepared.', masking: 'Local AI is translating the prompt, detecting the subject, and refining its edges. The first run can take several minutes.', maskApplied: 'Local transparent cutout completed. Original RGB pixels and image proportions were preserved.', maskFailed: 'The local cutout failed.', describeBackground: 'Describe the background you want to generate.', generatingBackground: 'GPT Image 2 is generating a {quality} quality background. This can take up to two minutes.', backgroundGenerated: 'AI background generated and loaded. It is now edited locally like an uploaded background.', backgroundFailed: 'Background generation failed.',
  },
  ja: {
    presetYoutubeLandscape: 'YouTube サムネイル・横', presetYoutubeVertical: 'YouTube Shorts・縦', presetInstagram: 'Instagram 投稿・縦', presetXHeader: 'X プロフィールヘッダー', presetSocialIcon: 'SNS プロフィールアイコン', presetCustom: '自由指定', customWidth: '幅', customHeight: '高さ', customHint: '64〜4096 px',
    eyebrow: 'OPENAI BUILD WEEK · 暮らしのためのアプリ', subhead: '残したいものを伝える。好きな場所に置く。自分の言葉を加える。', download: 'PNGを保存',
    checkingAi: 'AI接続を確認中…', localAiReady: 'ローカル切り抜き利用可能', localAiRequired: 'ローカルAI要セットアップ', backgroundAiReady: '背景API利用可能', backgroundKeyRequired: '背景APIキーは任意',
    canvas: '1. キャンバス・背景', format: '形式', fallbackBackground: '余白・透明部分の色',
    tabCanvas: 'キャンバス', tabBackground: '背景', tabSubject: '被写体', tabPlacement: '配置', tabContent: 'テキスト', tabStyle: '装飾', tabLayout: '位置', tabInfo: '情報', tabBlend: '画質調整',
    canvas: '1. キャンバス', background: '2. 背景', backgroundFit: '背景の表示方法', fitCover: '全面を埋める・比率維持', fitContain: '全体を収める・比率維持', fitStretch: '全面に引き伸ばす', fitActual: '素材サイズのまま・1:1', backgroundPositionX: '背景X', backgroundPositionY: '背景Y', centerBackground: '背景を中央に戻す', backgroundPositionHint: 'プレビューの空いている場所をドラッグして背景位置を変更できます。', generatePrompt: 'プロンプトから生成', backgroundPlaceholder: '例：青と紫のネオンが光るAIスタジオ、映画的な照明、左側に余白', generationQuality: 'GPT Image 2 生成品質', low: 'Low・下書き／最安', medium: 'Mid・通常品質', high: 'High・最終仕上げ／高額', generatingBackgroundButton: '背景を生成中…', generateBackgroundButton: 'AI背景を生成', saveBackground: '背景素材を保存', or: 'または', uploadBackground: '背景画像をアップロード', backgroundHint: '【注意】プロンプトによるAI背景生成を実行した場合、別途API料金が発生します。',
    subject: '3. 被写体・配置', uploadSource: '元画像をアップロード', keepQuestion: 'Soul Picsに何を残しますか？', keepPlaceholder: '例：人物と手に持っている製品だけを残す', creatingMask: 'ローカル切り抜き中…', createMask: 'ローカルAIで切り抜く', saveSubject: '切り抜き素材を保存', maskHint: 'プロンプトの指示内容をPC内で変換し、Grounding DINO・SAM 2.1・BiRefNetで処理します。すべてローカルで行うため、別途料金は発生しません。',
    placement: '配置調整', size: 'サイズ', x: 'X位置', y: 'Y位置', rotation: '回転', brightness: '明るさ', contrast: 'コントラスト', flip: '左右反転', flipVertical: '上下反転',
    output: '出力', outputHint: 'プレビューと保存画像は同じCanvasレンダラーを使用します。', dragHint: 'プレビュー上の背景・被写体・テキストを直接ドラッグして移動できます。', previewLabel: 'Soul Pics出力プレビュー', processing: '処理中', processingHint: 'このタブを閉じずにお待ちください。完了するとプレビューが自動更新されます。', loadingBackground: '背景画像を読み込んで準備しています…', loadingSubject: '被写体画像を読み込んで準備しています…', loadingFontsProcessing: 'このPCにインストールされたフォントを読み込んでいます…',
    textLayers: '4. テキストレイヤー', textBlock: '文字', backgroundBlock: 'テキスト背景', outlineBlock: '縁取り', shadowBlock: '影', blockColor: '色', blockWidth: '幅', blockOpacity: '透明度', blockSpread: '広がり', blockBlur: 'ぼかし', blockPaddingX: '左右余白', blockPaddingY: '上下余白', blockRadius: '角丸', layer: 'レイヤー', addLayer: 'テキストレイヤーを追加', text: 'テキスト', font: 'フォント', loadFonts: 'PCフォント', loadingFonts: '読込中…', textColor: '文字色', outlineColor: '縁取り色', shadowColor: '影の色', outline: '線幅', shadowSize: '影の広がり', textShadowOpacity: '影の濃度', textShadowX: '影X', textShadowY: '影Y', textShadowBlur: 'ぼかし', shadowX: '影のX位置', shadowY: '影のY位置', shadowBlur: '影のぼかし', bold: '太字', italic: '斜体', underline: '下線', removeLayer: '選択中のレイヤーを削除', fontsLoaded: 'インストール済みフォントを{count}ファミリー読み込みました。', noFontsFound: 'このブラウザからローカルフォントが返されませんでした。標準候補は引き続き使用できます。', fontAccessUnsupported: 'このブラウザではPCフォントを列挙できません。デスクトップ版ChromeまたはEdgeをお使いください。', fontAccessDenied: 'フォント参照が許可されませんでした。サイトの権限で「ローカル フォント」を許可して再実行できます。',
    blend: '5. 最終画質調整', blendHint: '元の背景と被写体をローカル解析し、表示された推奨値をプレビューを見ながら微調整できます。', resetQuality: '初期状態に戻す', autoQuality: 'おすすめ自動調整', adjustmentStrength: '自動調整の強さ', weak: '弱', standard: '標準', strong: '強', qualityLocalHint: '解析と描画はすべてこのブラウザ内でローカル処理するため、別途料金は発生しません。', toneGroup: '色・トーン', depthGroup: '奥行き・輪郭', textureGroup: '質感', shadowGroup: '影', backgroundBlur: '背景ぼかし', brightness: '明るさ', contrast: 'コントラスト', saturation: '彩度', temperature: '色温度', edgeSoftness: '輪郭の柔らかさ', colorSpill: '背景色の回り込み', sharpness: '被写体のシャープネス', grain: '全体の粒状感', shadowDistance: '影の距離', shadowOpacity: '影の濃さ', shadowBlur: '影のぼかし', qualityApplied: '元画像をローカル解析し、推奨値を反映しました。', qualityReset: '画質調整を初期化しました。画像・配置・文字は保持されています。',
    promise: 'Build Weekでの約束', promiseLocal: '編集中の元画像はローカルに保持します。', promiseExplicit: 'AIはAIボタンを押したときだけ実行します。', promiseMatch: '保存画像はこのプレビューと一致します。',
    start: '背景画像または被写体画像から始めましょう。', subjectLoaded: '被写体を読み込みました。元画像はこのブラウザ内に保持されます。', backgroundLoaded: '背景を読み込みました。元画像はこのブラウザ内に保持されます。', badImage: '画像を読み込めませんでした。PNG、JPEG、WebPをお試しください。', exported: 'プレビューと同じCanvasからPNGを保存しました。', subjectSaved: '合成前の切り抜き／被写体素材を保存しました。', backgroundSaved: '合成前の背景素材を保存しました。', localAiNotConfigured: 'ローカル切り抜きが未導入です。npm run setup:local-aiを実行し、サーバーを再起動してください。', backgroundAiNotConfigured: '背景生成には.envのOPENAI_API_KEYが必要です。設定後にサーバーを再起動してください。', uploadSubjectFirst: '最初に元画像をアップロードしてください。', describeKeep: 'ローカル切り抜きを実行する前に、残したい対象を入力してください。', sourcePrepareFailed: '元画像を処理用に準備できませんでした。', masking: '日本語指示の変換、被写体検出、輪郭精製をPC内で実行しています。初回は数分かかる場合があります。', maskApplied: 'ローカル切り抜きが完了しました。元画像のRGB画素と縦横比を維持しています。', maskFailed: 'ローカル切り抜き処理に失敗しました。', describeBackground: '生成したい背景を入力してください。', generatingBackground: 'GPT Image 2が{quality}品質の背景を生成しています。最大2分ほどかかる場合があります。', backgroundGenerated: 'AI背景を生成して読み込みました。以後はアップロード背景と同じようにローカルで編集できます。', backgroundFailed: '背景生成に失敗しました。',
  },
}

const freshText = (value = 'Your headline') => ({
  id: crypto.randomUUID(), value, x: 640, y: 120, size: 76,
  color: '#ffffff', font: 'Arial, sans-serif', weight: 800, italic: false, underline: false,
  stroke: 5, strokeColor: '#111111', shadowColor: '#000000', shadowX: 6,
  shadowY: 8, shadowSpread: 0, shadowBlur: 8, shadowOpacity: 45,
  backgroundColor: '#20252a', backgroundOpacity: 0, backgroundPaddingX: 28,
  backgroundPaddingY: 14, backgroundRadius: 12, backgroundBlur: 0,
})
const DEFAULT_QUALITY=Object.freeze({enabled:false,backgroundBlur:0,brightness:0,contrast:0,saturation:0,temperature:0,edgeSoftness:0,colorSpill:0,spillColor:'#647fa3',sharpness:0,grain:0,shadowDistance:0,shadowOpacity:0,shadowBlur:0})
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v))
function formatMessage(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, value), template)
}

function fitContain(image, canvas) {
  const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
  return { width: image.naturalWidth * scale, height: image.naturalHeight * scale }
}

function backgroundRect(image, canvas, fitMode = 'cover', positionX = 50, positionY = 50) {
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
  const number = Number.parseInt(value.length === 3 ? value.split('').map((item) => item + item).join('') : value, 16)
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(Math.max(0, radius), width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function sampleBackgroundTint(project) {
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

function stats(canvas,alpha=false){
 const d=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data
 let n=0,sy=0,sy2=0,ss=0,sw=0,sd=0,prev=null
 for(let i=0;i<d.length;i+=4){if(alpha&&d[i+3]<20)continue;const r=d[i],g=d[i+1],b=d[i+2],y=r*.2126+g*.7152+b*.0722,hi=Math.max(r,g,b),lo=Math.min(r,g,b);sy+=y;sy2+=y*y;ss+=hi?(hi-lo)/hi:0;sw+=(r-b)/255;if(prev!==null)sd+=Math.abs(y-prev);prev=y;n++}
 if(!n)return{y:128,c:40,s:0,w:0,d:12};const y=sy/n;return{y,c:Math.sqrt(Math.max(0,sy2/n-y*y)),s:ss/n,w:sw/n,d:sd/Math.max(1,n-1)}
}
function analyzeFinalQuality(p,strength){
 const z=96,b=document.createElement('canvas'),u=document.createElement('canvas');b.width=b.height=u.width=u.height=z
 const bc=b.getContext('2d');bc.fillStyle=p.backgroundColor;bc.fillRect(0,0,z,z);if(p.backgroundImage)drawBackground(bc,p.backgroundImage,p,b)
 const uc=u.getContext('2d'),f=fitContain(p.subjectImage,u);uc.drawImage(p.subjectImage,(z-f.width)/2,(z-f.height)/2,f.width,f.height)
 const bg=stats(b),sub=stats(u,true),m={weak:.5,standard:1,strong:1.5}[strength]||1,q=(v,a,c)=>Math.round(clamp(v*m,a,c))
 return{enabled:true,backgroundBlur:q(Math.max(0,(bg.d-sub.d)*.34),0,14),brightness:q((bg.y-sub.y)*.22,-30,30),contrast:q((bg.c-sub.c)*.55,-35,35),saturation:q((bg.s-sub.s)*75,-40,40),temperature:q((bg.w-sub.w)*120,-60,60),edgeSoftness:+clamp(Math.max(0,sub.d-bg.d)*.035*m,0,3).toFixed(2),colorSpill:q(10+Math.abs(bg.w-sub.w)*22,0,35),spillColor:sampleBackgroundTint(p),sharpness:q((bg.d-sub.d)*1.35,-35,35),grain:q(Math.max(0,sub.d-bg.d)*.5,0,24),shadowDistance:q(10+bg.c*.12,0,36),shadowOpacity:q(18+bg.c*.28,0,55),shadowBlur:q(18+(55-bg.c)*.22,0,48)}
}
function grain(ctx,w,h,a){if(a<=0)return;const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d'),d=x.createImageData(96,96);for(let i=0;i<d.data.length;i+=4){const v=80+((i/4*9301+49297)%233280)/233280*95;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);ctx.save();ctx.globalAlpha=a/100;ctx.globalCompositeOperation='soft-light';ctx.drawImage(c,0,0,w,h);ctx.restore()}
function displayedSubjectRotation(subject){return Boolean(subject.flip)!==Boolean(subject.flipY)?-subject.rotation:subject.rotation}
function renderScene(ctx,canvas,p){
 const z=projectPreset(p),q=p.quality||DEFAULT_QUALITY;ctx.fillStyle=p.backgroundColor;ctx.fillRect(0,0,z.width,z.height)
 if(p.backgroundImage){ctx.save();if(q.enabled&&q.backgroundBlur)ctx.filter='blur('+q.backgroundBlur+'px)';drawBackground(ctx,p.backgroundImage,p,canvas);ctx.restore()}
 if(p.subjectImage){const f=fitContain(p.subjectImage,z),w=f.width*p.subject.scale,h=f.height*p.subject.scale,l=document.createElement('canvas');l.width=z.width;l.height=z.height;const x=l.getContext('2d'),soft=q.enabled?q.edgeSoftness+Math.max(0,-q.sharpness)*.025:0,sharp=q.enabled?Math.max(0,q.sharpness)*.18:0
 x.save();x.translate(p.subject.x,p.subject.y);x.scale(p.subject.flip?-1:1,p.subject.flipY?-1:1);x.rotate(p.subject.rotation*Math.PI/180);x.filter='brightness('+(100+(q.enabled?q.brightness:0))+'%) contrast('+(100+(q.enabled?q.contrast+sharp:0))+'%) saturate('+(100+(q.enabled?q.saturation:0))+'%) blur('+soft+'px)';x.drawImage(p.subjectImage,-w/2,-h/2,w,h);x.restore()
 if(q.enabled&&q.temperature){x.save();x.globalCompositeOperation='source-atop';x.globalAlpha=Math.abs(q.temperature)/500;x.fillStyle=q.temperature>0?'#ff9b52':'#5f8dff';x.fillRect(0,0,z.width,z.height);x.restore()}
 if(q.enabled&&q.colorSpill){x.save();x.globalCompositeOperation='source-atop';x.globalAlpha=q.colorSpill/250;x.fillStyle=q.spillColor;x.fillRect(0,0,z.width,z.height);x.restore()}
 ctx.save();if(q.enabled&&q.shadowOpacity)ctx.filter='drop-shadow('+(q.shadowDistance*.35)+'px '+q.shadowDistance+'px '+q.shadowBlur+'px '+hexToRgba('#000000',q.shadowOpacity/100)+')';ctx.drawImage(l,0,0);ctx.restore()}
 if(q.enabled)grain(ctx,z.width,z.height,q.grain)
}
function renderProject(canvas,p){const z=projectPreset(p);canvas.width=z.width;canvas.height=z.height;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,z.width,z.height);renderScene(ctx,canvas,p)
 for (const l of p.textLayers) {
  if (!l.value.trim()) continue
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = (l.italic ? 'italic ' : '') + l.weight + ' ' + l.size + 'px ' + l.font
  ctx.lineJoin = 'round'
  const metrics = ctx.measureText(l.value)
  const textHeight = Math.max(l.size, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)
  const backgroundOpacity = clamp(l.backgroundOpacity ?? 0, 0, 100) / 100
  const backgroundBlur = Math.max(0, l.backgroundBlur ?? 0)
  if (backgroundOpacity > 0 || backgroundBlur > 0) {
    const paddingX = Math.max(0, l.backgroundPaddingX ?? 28)
    const paddingY = Math.max(0, l.backgroundPaddingY ?? 14)
    const boxWidth = metrics.width + paddingX * 2
    const boxHeight = textHeight + paddingY * 2
    const boxX = l.x - boxWidth / 2
    const boxY = l.y - boxHeight / 2
    const radius = Math.max(0, l.backgroundRadius ?? 12)
    if (backgroundBlur > 0) {
      const snapshot = document.createElement('canvas')
      snapshot.width = z.width
      snapshot.height = z.height
      snapshot.getContext('2d').drawImage(canvas, 0, 0)
      ctx.save()
      roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, radius)
      ctx.clip()
      ctx.filter = 'blur(' + backgroundBlur + 'px)'
      ctx.drawImage(snapshot, 0, 0)
      ctx.restore()
    }
    if (backgroundOpacity > 0) {
      ctx.save()
      ctx.fillStyle = hexToRgba(l.backgroundColor || '#20252a', backgroundOpacity)
      roundedRectPath(ctx, boxX, boxY, boxWidth, boxHeight, radius)
      ctx.fill()
      ctx.restore()
    }
  }
  const spread = Math.max(0, l.shadowSpread || 0)
  const blur = Math.max(0, l.shadowBlur || 0)
  const opacity = Math.max(0, Math.min(100, l.shadowOpacity ?? 45)) / 100
  if (opacity > 0) {
    const shadowLayer = document.createElement('canvas')
    shadowLayer.width = z.width
    shadowLayer.height = z.height
    const shadowCtx = shadowLayer.getContext('2d')
    shadowCtx.textAlign = 'center'
    shadowCtx.textBaseline = 'middle'
    shadowCtx.font = ctx.font
    shadowCtx.lineJoin = 'round'
    shadowCtx.fillStyle = l.shadowColor
    shadowCtx.strokeStyle = l.shadowColor
    if (spread > 0) {
      shadowCtx.lineWidth = spread * 2
      shadowCtx.strokeText(l.value, l.x, l.y)
    }
    shadowCtx.fillText(l.value, l.x, l.y)
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.filter = blur > 0 ? 'blur(' + blur + 'px)' : 'none'
    ctx.drawImage(shadowLayer, l.shadowX, l.shadowY)
    ctx.restore()
  }
  ctx.strokeStyle = l.strokeColor
  ctx.lineWidth = l.stroke
  if (l.stroke) ctx.strokeText(l.value, l.x, l.y)
  ctx.fillStyle = l.color
  ctx.fillText(l.value, l.x, l.y)
  if (l.underline) {
    const metrics = ctx.measureText(l.value)
    const underlineY = l.y + l.size * .42
    ctx.strokeStyle = l.color
    ctx.lineWidth = Math.max(1, l.size * .055)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(l.x - metrics.width / 2, underlineY)
    ctx.lineTo(l.x + metrics.width / 2, underlineY)
    ctx.stroke()
  }
  ctx.restore()
 }
}
function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = reject
    image.src = url
  })
}

function afterNextPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))
}

function canvasPoint(canvas, event) {
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

function canvasTarget(canvas, point, project) {
  const ctx = canvas.getContext('2d')
  for (let index = project.textLayers.length - 1; index >= 0; index -= 1) {
    if (hitTextLayer(ctx, point, project.textLayers[index])) return { type: 'text', index }
  }
  if (hitSubject(point, project, projectPreset(project))) return { type: 'subject' }
  return project.backgroundImage && project.backgroundFit !== 'stretch' ? { type: 'background' } : null
}

function storedLanguage() {
  try { return localStorage.getItem('soul-pics-language') === 'ja' ? 'ja' : 'en' } catch { return 'en' }
}

function App() {
  const initialLanguage = storedLanguage()
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const subjectPanelRef = useRef(null)
  const subjectPromptRef = useRef(null)
  const [language, setLanguage] = useState(initialLanguage)
  const [project, setProject] = useState({
    preset: 'youtubeLandscape', customWidth: 1200, customHeight: 1200, backgroundColor: '#111827', backgroundImage: null, backgroundAsset: null, backgroundGeneratedReady: false, backgroundFit: 'cover', backgroundPositionX: 50, backgroundPositionY: 50, subjectImage: null, subjectAsset: null, subjectCutoutReady: false,
    subject: { x: 640, y: 500, scale: 0.72, rotation: 0, flip: false, flipY: false },
    quality: { ...DEFAULT_QUALITY },
    textLayers: [freshText(initialLanguage === 'ja' ? '見出しを入力' : 'Your headline')],
  })
  const [selectedText, setSelectedText] = useState(0)
  const [selectionPrompt, setSelectionPrompt] = useState('')
  const [backgroundPrompt, setBackgroundPrompt] = useState('')
  const [backgroundQuality, setBackgroundQuality] = useState('low')
  const [qualityStrength, setQualityStrength] = useState('standard')
  const [backgroundGeneratorOpen, setBackgroundGeneratorOpen] = useState(true)
  const [backgroundUploadOpen, setBackgroundUploadOpen] = useState(false)
  const [masking, setMasking] = useState(false)
  const [generatingBackground, setGeneratingBackground] = useState(false)
  const [uploadingAsset, setUploadingAsset] = useState(null)
  const [serviceStatus, setServiceStatus] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [leftTab, setLeftTab] = useState('background')
  const [rightTab, setRightTab] = useState('content')
  const [fontOptions, setFontOptions] = useState(cachedFontOptions)
  const [loadingFonts, setLoadingFonts] = useState(false)
  const [notice, setNotice] = useState({ key: 'start' })
  const tr = COPY[language]
  const preset = projectPreset(project)
  const activeText = project.textLayers[selectedText]
  const localCutoutReady = Boolean(serviceStatus?.localCutout?.available)
  const backgroundAiReady = Boolean(serviceStatus?.background?.configured)
  const aiStatusText = serviceStatus === null
    ? tr.checkingAi
    : `${localCutoutReady ? tr.localAiReady : tr.localAiRequired} · ${backgroundAiReady ? tr.backgroundAiReady : tr.backgroundKeyRequired}`
  const message = (key, values) => setNotice({ key, values })
  const noticeText = notice.text || formatMessage(tr[notice.key] || notice.key, notice.values)

  useEffect(() => { if (canvasRef.current) renderProject(canvasRef.current, project) }, [project])
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem('soul-pics-language', language) } catch {}
  }, [language])
  useEffect(() => {
    fetch('/api/health')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((health) => setServiceStatus(health))
      .catch(() => setServiceStatus({ localCutout: { available: false }, background: { configured: false } }))
  }, [])
  const updateSubject = (patch) => setProject((p) => ({ ...p, subject: { ...p.subject, ...patch } }))
  const updateQuality = (patch) => setProject((p) => ({ ...p, quality: { ...p.quality, enabled: true, ...patch } }))
  const updateText = (patch) => setProject((p) => ({ ...p, textLayers: p.textLayers.map((item, index) => index === selectedText ? { ...item, ...patch } : item) }))
  const revealSubjectPlacement = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const panel = subjectPanelRef.current
      const prompt = subjectPromptRef.current
      if (!panel || !prompt) return
      const panelRect = panel.getBoundingClientRect()
      const promptRect = prompt.getBoundingClientRect()
      const promptTopAtZero = promptRect.top - panelRect.top + panel.scrollTop
      const maxScroll = Math.max(0, panel.scrollHeight - panel.clientHeight)
      const maxKeepingPromptVisible = Math.max(0, promptTopAtZero - 8)
      panel.scrollTo({ top: Math.min(maxScroll, maxKeepingPromptVisible), behavior: 'smooth' })
    }))
  }
  const loadLocalFonts = async () => {
    if (!window.queryLocalFonts) return message('fontAccessUnsupported')
    setLoadingFonts(true)
    try {
      const localFaces = await window.queryLocalFonts()
      const families = [...new Map(localFaces.map((face) => face.family?.trim()).filter(Boolean).map((name) => [name.toLocaleLowerCase(), name])).values()]
        .sort(new Intl.Collator(language).compare)
      const options = families.map(fontOption)
      if (options.length) {
        setFontOptions(options)
        try { localStorage.setItem('soul-pics-local-fonts', JSON.stringify(families)) } catch {}
        message('fontsLoaded', { count: options.length })
      } else {
        message('noFontsFound')
      }
    } catch {
      message('fontAccessDenied')
    } finally {
      setLoadingFonts(false)
    }
  }
  const resizeCanvas = (patch) => setProject((p) => {
    const before = projectPreset(p)
    const next = { ...p, ...patch }
    const after = projectPreset(next)
    const scaleX = after.width / before.width
    const scaleY = after.height / before.height
    return {
      ...next,
      subject: { ...p.subject, x: p.subject.x * scaleX, y: p.subject.y * scaleY },
      textLayers: p.textLayers.map((layer) => ({ ...layer, x: layer.x * scaleX, y: layer.y * scaleY })),
    }
  })
  const autoQuality=()=>{if(!project.subjectImage)return message('uploadSubjectFirst');const start=performance.now(),quality=analyzeFinalQuality(project,qualityStrength);setProject(p=>({...p,quality}));setRightTab('blend');message('qualityApplied');console.log('Local final-quality analysis completed',{strength:qualityStrength,elapsedMs:Math.round(performance.now()-start),quality})}
  const resetQuality=()=>{setProject(p=>({...p,quality:{...DEFAULT_QUALITY}}));message('qualityReset')}
  const startCanvasDrag = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const point = canvasPoint(canvas, event)
    const target = canvasTarget(canvas, point, project)
    if (!target) return
    event.preventDefault()
    if (target.type === 'text') setSelectedText(target.index)
    if (target.type === 'background') setLeftTab('background')
    const origin = target.type === 'subject'
      ? { x: project.subject.x, y: project.subject.y }
      : target.type === 'background'
        ? { x: project.backgroundPositionX, y: project.backgroundPositionY }
        : { x: project.textLayers[target.index].x, y: project.textLayers[target.index].y }
    dragRef.current = { pointerId: event.pointerId, point, target, origin }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }
  const moveCanvasDrag = (event) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || !canvas || drag.pointerId !== event.pointerId) return
    event.preventDefault()
    const point = canvasPoint(canvas, event)
    const dx = point.x - drag.point.x
    const dy = point.y - drag.point.y
    setProject((p) => {
      const currentPreset = projectPreset(p)
      if (drag.target.type === 'background' && p.backgroundImage) {
        const rect = backgroundRect(p.backgroundImage, currentPreset, p.backgroundFit, drag.origin.x, drag.origin.y)
        const travelX = currentPreset.width - rect.width
        const travelY = currentPreset.height - rect.height
        const positionX = travelX === 0 ? p.backgroundPositionX : Math.max(0, Math.min(100, drag.origin.x + (dx / travelX) * 100))
        const positionY = travelY === 0 ? p.backgroundPositionY : Math.max(0, Math.min(100, drag.origin.y + (dy / travelY) * 100))
        return { ...p, backgroundPositionX: positionX, backgroundPositionY: positionY }
      }
      const x = Math.max(0, Math.min(currentPreset.width, drag.origin.x + dx))
      const y = Math.max(0, Math.min(currentPreset.height, drag.origin.y + dy))
      if (drag.target.type === 'subject') return { ...p, subject: { ...p.subject, x, y } }
      return { ...p, textLayers: p.textLayers.map((item, index) => index === drag.target.index ? { ...item, x, y } : item) }
    })
  }
  const endCanvasDrag = (event) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    dragRef.current = null
    setDragging(false)
  }
  const cancelUpload = () => setUploadingAsset(null)
  const upload = async (event, target) => {
    const input = event.currentTarget
    const file = event.target.files?.[0]
    if (!file) return cancelUpload()
    flushSync(() => setUploadingAsset(target))
    await afterNextPaint()
    try {
      const image = await readImage(file)
      const assetTarget = target === 'subjectImage' ? 'subjectAsset' : 'backgroundAsset'
      const readyPatch = target === 'subjectImage' ? { subjectCutoutReady: false } : { backgroundGeneratedReady: false, backgroundPositionX: 50, backgroundPositionY: 50 }
      setProject((p) => ({ ...p, [target]: image, [assetTarget]: file, ...readyPatch }))
      if (target === 'backgroundImage') setBackgroundGeneratorOpen(false)
      if (target === 'subjectImage') revealSubjectPlacement()
      message(target === 'subjectImage' ? 'subjectLoaded' : 'backgroundLoaded')
    } catch { message('badImage') }
    finally {
      await afterNextPaint()
      setUploadingAsset(null)
      input.value = ''
    }
  }
  const exportPng = () => {
    const link = document.createElement('a')
    link.download = `soul-pics-${project.preset}-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
    message('exported')
  }
  const saveAsset = (asset, stem, noticeKey) => {
    if (!asset) return
    const extension = asset.type === 'image/jpeg' ? 'jpg' : asset.type === 'image/webp' ? 'webp' : 'png'
    const url = URL.createObjectURL(asset)
    const link = document.createElement('a')
    link.download = `soul-pics-${stem}-${Date.now()}.${extension}`
    link.href = url
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    message(noticeKey)
  }
  const requireAi = (kind) => {
    const ready = kind === 'mask' ? serviceStatus?.localCutout?.available : serviceStatus?.background?.configured
    if (ready) return true
    message(kind === 'mask' ? 'localAiNotConfigured' : 'backgroundAiNotConfigured')
    return false
  }
  const responseError = async (response, fallbackKey) => {
    const payload = await response.json().catch(() => ({}))
    const known = {
      'Server is not configured with OPENAI_API_KEY.': 'backgroundAiNotConfigured',
      'Soul Pics local AI is not installed completely. Run npm run setup:local-ai.': 'localAiNotConfigured',
      'Upload one image file.': 'uploadSubjectFirst',
      'Describe what to keep in 3 to 500 characters.': 'describeKeep',
      'Describe the background in 3 to 1500 characters.': 'describeBackground',
    }
    return new Error(known[payload.error] ? tr[known[payload.error]] : payload.error || tr[fallbackKey])
  }
  const runMask = async () => {
    if (!requireAi('mask')) return
    if (!project.subjectImage) return message('uploadSubjectFirst')
    if (selectionPrompt.trim().length < 3) return message('describeKeep')
    let source = project.subjectAsset
    if (!(source instanceof Blob) || source.size > 48 * 1024 * 1024) {
      const canvas = document.createElement('canvas')
      const maxUploadDimension = 4096
      const uploadScale = Math.min(1, maxUploadDimension / Math.max(project.subjectImage.naturalWidth, project.subjectImage.naturalHeight))
      canvas.width = Math.max(1, Math.round(project.subjectImage.naturalWidth * uploadScale))
      canvas.height = Math.max(1, Math.round(project.subjectImage.naturalHeight * uploadScale))
      canvas.getContext('2d').drawImage(project.subjectImage, 0, 0, canvas.width, canvas.height)
      source = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    }
    if (!source) return message('sourcePrepareFailed')
    console.log('Local mask source prepared', { width: project.subjectImage.naturalWidth, height: project.subjectImage.naturalHeight, bytes: source.size, megabytes: Number((source.size / 1024 / 1024).toFixed(2)) })
    if (source.size > 50 * 1024 * 1024) return message('sourcePrepareFailed')
    const body = new FormData()
    body.append('image', source, source.type === 'image/png' ? 'source.png' : source.type === 'image/webp' ? 'source.webp' : 'source.jpg')
    body.append('prompt', selectionPrompt.trim())
    setMasking(true)
    message('masking')
    await afterNextPaint()
    try {
      const response = await fetch('/api/mask', { method: 'POST', body })
      if (!response.ok) throw await responseError(response, 'maskFailed')
      const maskedAsset = await response.blob()
      const masked = await readImage(new File([maskedAsset], 'masked-subject.png', { type: 'image/png' }))
      console.log('Mask result loaded', {
        bytes: maskedAsset.size,
        type: maskedAsset.type,
        width: masked.naturalWidth,
        height: masked.naturalHeight,
      })
      setProject((p) => ({ ...p, subjectImage: masked, subjectAsset: maskedAsset, subjectCutoutReady: true }))
      message('maskApplied')
    } catch (error) { setNotice({ text: error.message }) } finally { setMasking(false) }
  }
  const generateBackground = async () => {
    if (!requireAi('background')) return
    if (backgroundPrompt.trim().length < 3) return message('describeBackground')
    setGeneratingBackground(true)
    console.log('Background UI execution started', { startedAt: new Date().toISOString(), quality: backgroundQuality, promptLength: backgroundPrompt.trim().length })
    message('generatingBackground', { quality: backgroundQuality })
    try {
      const response = await fetch('/api/background', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: backgroundPrompt.trim(), width: preset.width, height: preset.height, quality: backgroundQuality }),
      })
      if (!response.ok) throw await responseError(response, 'backgroundFailed')
      const generatedAsset = await response.blob()
      const generated = await readImage(new File([generatedAsset], 'generated-background.png', { type: 'image/png' }))
      setProject((p) => ({ ...p, backgroundImage: generated, backgroundAsset: generatedAsset, backgroundGeneratedReady: true, backgroundPositionX: 50, backgroundPositionY: 50 }))
      setBackgroundGeneratorOpen(false)
      message('backgroundGenerated')
      console.log('Background UI execution completed', { bytes: generatedAsset.size, width: generated.naturalWidth, height: generated.naturalHeight })
    } catch (error) { console.error('Background UI execution failed', { message: error.message }); setNotice({ text: error.message }) } finally { setGeneratingBackground(false) }
  }
  const addTextLayer = () => {
    setProject((p) => ({ ...p, textLayers: [...p.textLayers, freshText(language === 'ja' ? '見出しを入力' : 'Your headline')] }))
    setSelectedText(project.textLayers.length)
  }
  const presetName = (key) => tr[`preset${key.charAt(0).toUpperCase()}${key.slice(1)}`]
  const processingMessage = masking ? tr.masking : generatingBackground ? formatMessage(tr.generatingBackground,{quality:backgroundQuality}) : uploadingAsset==='subjectImage' ? tr.loadingSubject : uploadingAsset==='backgroundImage' ? tr.loadingBackground : loadingFonts ? tr.loadingFontsProcessing : ''

  return <main className="app-shell">
    <header>
      <div className="brand-lockup">
        <img className="brand-logo" src="/brand/soul-pics-logo.svg" alt="" aria-hidden="true" />
        <div className="brand-copy"><p className="brand-meta"><span>SOUL NOTES PROJECT</span><span>{tr.eyebrow}</span></p><h1>Soul Pics <small className="app-version">{UI_VERSION}</small></h1><p className="subhead">{tr.subhead}</p></div>
      </div>
      <div className="header-actions"><div className="language-switch" role="group" aria-label="Language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'ja' ? 'active' : ''} onClick={() => setLanguage('ja')}>日本語</button></div><button className="primary" onClick={exportPng}>{tr.download}</button></div>
    </header>
    <section className="notice" role="status"><span>{noticeText}</span><span className={`api-status ${localCutoutReady ? 'ready' : ''}`}>{aiStatusText}</span></section>
    <section className="workspace">
      <aside className="panel controls">
        <PanelTabs active={leftTab} onChange={setLeftTab} tabs={[['background', tr.tabBackground], ['subject', tr.tabSubject]]} />
        <div className="panel-view" ref={subjectPanelRef}>
          {leftTab === 'background' && <section className="background-editor">
            <h2>{tr.canvas}</h2>
            <div className="background-basics">
              <label className="background-format">{tr.format}<select value={project.preset} onChange={(e) => resizeCanvas({ preset: e.target.value })}>{Object.entries(PRESETS).map(([key, value]) => <option key={key} value={key}>{presetName(key)} · {value.width}×{value.height}</option>)}<option value="custom">{tr.presetCustom}</option></select></label>
              {project.preset === 'custom' && <div className="custom-size-grid background-custom-size"><label>{tr.customWidth}<input type="number" min={CUSTOM_LIMITS.min} max={CUSTOM_LIMITS.max} value={project.customWidth} onChange={(e) => resizeCanvas({ customWidth: e.target.value })} /></label><span>×</span><label>{tr.customHeight}<input type="number" min={CUSTOM_LIMITS.min} max={CUSTOM_LIMITS.max} value={project.customHeight} onChange={(e) => resizeCanvas({ customHeight: e.target.value })} /></label><small>{tr.customHint}</small></div>}
              
              
            </div>
            {project.backgroundImage && project.backgroundFit !== 'stretch' && <div className="background-position"><div className="range-grid"><Range label={tr.backgroundPositionX} value={project.backgroundPositionX} min="0" max="100" onChange={(value) => setProject((p) => ({ ...p, backgroundPositionX: value }))}/><Range label={tr.backgroundPositionY} value={project.backgroundPositionY} min="0" max="100" onChange={(value) => setProject((p) => ({ ...p, backgroundPositionY: value }))}/></div><button className="secondary background-center" onClick={() => setProject((p) => ({ ...p, backgroundPositionX: 50, backgroundPositionY: 50 }))}>{tr.centerBackground}</button><p className="hint">{tr.backgroundPositionHint}</p></div>}
            <h2>{tr.background}</h2>
            <div className="background-source-switcher" role="tablist" aria-label={tr.backgroundSource || tr.canvas}>
              <button type="button" role="tab" aria-selected={backgroundGeneratorOpen} className={`background-source-tab ${backgroundGeneratorOpen ? 'is-active' : ''}`} onClick={() => { setBackgroundGeneratorOpen(true); setBackgroundUploadOpen(false) }}>{tr.generatePrompt}</button>
              <button type="button" role="tab" aria-selected={backgroundUploadOpen} className={`background-source-tab ${backgroundUploadOpen ? 'is-active' : ''}`} onClick={() => { setBackgroundGeneratorOpen(false); setBackgroundUploadOpen(true) }}>{tr.uploadBackground}</button>
            </div>
            {backgroundGeneratorOpen && <div className="background-generator background-source-panel">
              <label className="background-prompt"><textarea aria-label={tr.generatePrompt} value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} placeholder={tr.backgroundPlaceholder} /></label>
              <label>{tr.generationQuality}<select value={backgroundQuality} onChange={(e) => setBackgroundQuality(e.target.value)}><option value="low">{tr.low}</option><option value="medium">{tr.medium}</option><option value="high">{tr.high}</option></select></label>
              <div className="background-actions"><button className="ai-action key-action" disabled={generatingBackground} onClick={generateBackground}>{generatingBackground ? tr.generatingBackgroundButton : tr.generateBackgroundButton}</button><button className="secondary asset-save" disabled={!project.backgroundGeneratedReady} onClick={() => saveAsset(project.backgroundAsset, 'generated-background', 'backgroundSaved')}>{tr.saveBackground}</button></div>
            <p className="api-caution"><strong>{language === 'ja' ? '【注意】' : '[caution]'}</strong> {language === 'ja' ? 'プロンプトによるAI背景生成を実行した場合、別途API料金が発生します。' : 'Prompt-based AI background generation incurs a separate API charge.'}</p></div>}
            {backgroundUploadOpen && <div className="background-upload-block background-source-panel"><div className="background-display-settings"><label>{tr.backgroundFit}<select value={project.backgroundFit} onChange={(e) => setProject((p) => ({ ...p, backgroundFit: e.target.value }))}><option value="cover">{tr.fitCover}</option><option value="contain">{tr.fitContain}</option><option value="stretch">{tr.fitStretch}</option><option value="actual">{tr.fitActual}</option></select></label><label><span className="fallback-label">{tr.fallbackBackground}</span><input type="color" value={project.backgroundColor} onChange={(e) => setProject((p) => ({ ...p, backgroundColor: e.target.value }))} /></label></div><label className="upload key-upload"><input type="file" accept="image/*" onCancel={cancelUpload} onChange={(e) => upload(e, 'backgroundImage')} />{tr.uploadBackground}</label></div>}
          </section>}
          {leftTab === 'subject' && <section className="subject-editor"><h2>{tr.subject}</h2><label className="upload key-upload"><input type="file" accept="image/*" onCancel={cancelUpload} onChange={(e) => upload(e, 'subjectImage')} />{tr.uploadSource}</label><label className="subject-prompt" ref={subjectPromptRef}>{tr.keepQuestion}<textarea value={selectionPrompt} onChange={(e) => setSelectionPrompt(e.target.value)} placeholder={tr.keepPlaceholder} /></label><div className="subject-actions"><button className="ai-action key-action" disabled={masking} onClick={runMask}>{masking ? tr.creatingMask : tr.createMask}</button><button className="secondary asset-save" disabled={!project.subjectCutoutReady} onClick={() => saveAsset(project.subjectAsset, 'cutout-subject', 'subjectSaved')}>{tr.saveSubject}</button></div><p className="hint">{tr.maskHint}</p><div className="subject-placement"><h3>{tr.placement}</h3><div className="range-grid"><Range label={tr.size} value={project.subject.scale} min="0.1" max="1.8" step="0.01" onChange={(value) => updateSubject({ scale: value })}/><Range label={tr.rotation} value={project.subject.rotation} min="-180" max="180" onChange={(value) => updateSubject({ rotation: value })}/><Range label={tr.x} value={project.subject.x} min="0" max={preset.width} onChange={(value) => updateSubject({ x: value })}/><Range label={tr.y} value={project.subject.y} min="0" max={preset.height} onChange={(value) => updateSubject({ y: value })}/></div><div className="subject-flip-checks"><label className="check"><input type="checkbox" checked={project.subject.flip} onChange={(e) => updateSubject({ flip: e.target.checked })}/> {tr.flip}</label><label className="check"><input type="checkbox" checked={Boolean(project.subject.flipY)} onChange={(e) => updateSubject({ flipY: e.target.checked })}/> {tr.flipVertical}</label></div></div></section>}
        </div>
      </aside>
      <section className="stage-wrap"><div className="stage-heading"><span className="stage-heading-title">SOUL CANVAS / LIVE PREVIEW</span><p className="dimensions">{tr.dragHint}<br />{tr.output}: {preset.width} × {preset.height} px · {tr.outputHint}</p></div><div className={`stage ${processingMessage ? 'is-processing' : ''}`} aria-busy={Boolean(processingMessage)}><canvas ref={canvasRef} className={dragging ? 'dragging' : ''} aria-label={tr.previewLabel} onPointerDown={startCanvasDrag} onPointerMove={moveCanvasDrag} onPointerUp={endCanvasDrag} onPointerCancel={endCanvasDrag} />{processingMessage && <div className="processing-overlay" role="status" aria-live="polite"><div className="processing-spinner" aria-hidden="true"/><strong>{tr.processing}</strong><span>{processingMessage}</span><small>{tr.processingHint}</small></div>}</div><footer className="app-footer">© 2026 Jangroove</footer></section>
      <aside className="panel controls">
        <PanelTabs active={rightTab} onChange={setRightTab} tabs={[['content', tr.tabContent], ['blend', tr.tabBlend]]} />
        <div className={`panel-view ${rightTab === 'content' ? 'text-panel-view' : ''}`}>
          {rightTab === 'content' && <section className="text-editor">
            <h2>{tr.textLayers}</h2>
            <div className="layer-tabs">{project.textLayers.map((layer, index) => <button key={layer.id} className={index === selectedText ? 'selected' : ''} onClick={() => setSelectedText(index)}>{tr.layer} {index + 1}</button>)}<button className="layer-add" aria-label={tr.addLayer} onClick={addTextLayer}>＋</button></div>
            {activeText && <>
              <label className="text-content-field">{tr.text}<textarea value={activeText.value} onChange={(e) => updateText({ value: e.target.value })}/></label>
              <div className="editor-block text-style-block">
                <h3>{tr.textBlock}</h3>
                <div className="text-block-top">
                  <label className="block-color"><span className="block-color-label">{tr.blockColor}</span><input type="color" value={activeText.color} onChange={(e) => updateText({ color: e.target.value })}/></label>
                  <FontPicker tr={tr} options={fontOptions} value={activeText.font} loading={loadingFonts} onChange={(font) => updateText({ font })} onLoad={loadLocalFonts}/>
                </div>
                <div className="text-size-style-row"><Range label={tr.size} value={activeText.size} min="16" max="220" onChange={(value) => updateText({ size: value })}/><div className="compact-style-checks block-style-checks"><label title={tr.bold}><b>B</b><input type="checkbox" aria-label={tr.bold} checked={activeText.weight > 500} onChange={(e) => updateText({ weight: e.target.checked ? 800 : 400 })}/></label><label title={tr.italic}><i>I</i><input type="checkbox" aria-label={tr.italic} checked={activeText.italic} onChange={(e) => updateText({ italic: e.target.checked })}/></label><label title={tr.underline}><span className="underline-mark">U</span><input type="checkbox" aria-label={tr.underline} checked={Boolean(activeText.underline)} onChange={(e) => updateText({ underline: e.target.checked })}/></label></div></div>
                <div className="range-grid block-position-grid"><Range label={tr.x} value={activeText.x} min="0" max={preset.width} onChange={(value) => updateText({ x: value })}/><Range label={tr.y} value={activeText.y} min="0" max={preset.height} onChange={(value) => updateText({ y: value })}/></div>
              </div>
              <div className="editor-block backdrop-style-block">
                <h3>{tr.backgroundBlock}</h3>
                <div className="backdrop-primary-row"><label className="block-color backdrop-color"><span className="block-color-label">{tr.blockColor}</span><input type="color" value={activeText.backgroundColor || '#20252a'} onChange={(e) => updateText({ backgroundColor: e.target.value })}/></label><Range label={tr.blockOpacity} value={activeText.backgroundOpacity ?? 0} min="0" max="100" onChange={(value) => updateText({ backgroundOpacity: value })}/></div>
                <div className="range-grid backdrop-control-grid"><Range label={tr.blockPaddingX} value={activeText.backgroundPaddingX ?? 28} min="0" max="120" onChange={(value) => updateText({ backgroundPaddingX: value })}/><Range label={tr.blockPaddingY} value={activeText.backgroundPaddingY ?? 14} min="0" max="80" onChange={(value) => updateText({ backgroundPaddingY: value })}/><Range label={tr.blockRadius} value={activeText.backgroundRadius ?? 12} min="0" max="80" onChange={(value) => updateText({ backgroundRadius: value })}/><Range label={tr.blockBlur} value={activeText.backgroundBlur ?? 0} min="0" max="30" onChange={(value) => updateText({ backgroundBlur: value })}/></div>
              </div>
              <div className="editor-block outline-style-block">
                <h3>{tr.outlineBlock}</h3>
                <div className="block-color-range"><label className="block-color"><span className="block-color-label">{tr.blockColor}</span><input type="color" value={activeText.strokeColor} onChange={(e) => updateText({ strokeColor: e.target.value })}/></label><Range label={tr.blockWidth} value={activeText.stroke} min="0" max="20" onChange={(value) => updateText({ stroke: value })}/></div>
              </div>
              <div className="editor-block shadow-style-block">
                <h3>{tr.shadowBlock}</h3>
                <div className="shadow-primary-row"><label className="block-color shadow-color"><span className="block-color-label">{tr.blockColor}</span><input type="color" value={activeText.shadowColor} onChange={(e) => updateText({ shadowColor: e.target.value })}/></label><Range label={tr.blockOpacity} value={activeText.shadowOpacity ?? 45} min="0" max="100" onChange={(value) => updateText({ shadowOpacity: value })}/></div>
                <div className="range-grid shadow-control-grid"><Range label={tr.blockSpread} value={activeText.shadowSpread || 0} min="0" max="10" onChange={(value) => updateText({ shadowSpread: value })}/><Range label={tr.blockBlur} value={activeText.shadowBlur} min="0" max="50" onChange={(value) => updateText({ shadowBlur: value })}/><Range label={tr.x} value={activeText.shadowX} min="-50" max="50" onChange={(value) => updateText({ shadowX: value })}/><Range label={tr.y} value={activeText.shadowY} min="-50" max="50" onChange={(value) => updateText({ shadowY: value })}/></div>
              </div>
              <button className="danger" disabled={project.textLayers.length === 1} onClick={() => { setProject((p) => ({ ...p, textLayers: p.textLayers.filter((_, i) => i !== selectedText) })); setSelectedText(0) }}>{tr.removeLayer}</button>
            </>}
          </section>}
          {rightTab === 'blend' && <section className="blend-editor quality-editor"><h2>{tr.blend}</h2><p className="hint blend-description">{tr.blendHint}</p><div className="quality-primary-actions"><button className="secondary" onClick={resetQuality}>{tr.resetQuality}</button><button className="primary" disabled={!project.subjectImage} onClick={autoQuality}>{tr.autoQuality}</button></div><label className="quality-strength">{tr.adjustmentStrength}<select value={qualityStrength} onChange={(e)=>setQualityStrength(e.target.value)}><option value="weak">{tr.weak}</option><option value="standard">{tr.standard}</option><option value="strong">{tr.strong}</option></select></label><p className="hint local-quality-hint">{tr.qualityLocalHint}</p><QualityGroup title={tr.toneGroup}><Range label={tr.brightness} value={project.quality.brightness} min="-50" max="50" onChange={(v) => updateQuality({ brightness: v })}/><Range label={tr.contrast} value={project.quality.contrast} min="-50" max="50" onChange={(v) => updateQuality({ contrast: v })}/><Range label={tr.saturation} value={project.quality.saturation} min="-50" max="50" onChange={(v) => updateQuality({ saturation: v })}/><Range label={tr.temperature} value={project.quality.temperature} min="-100" max="100" onChange={(v) => updateQuality({ temperature: v })}/></QualityGroup><QualityGroup title={tr.depthGroup}><Range label={tr.backgroundBlur} value={project.quality.backgroundBlur} min="0" max="24" step=".5" onChange={(v) => updateQuality({ backgroundBlur: v })}/><Range label={tr.edgeSoftness} value={project.quality.edgeSoftness} min="0" max="5" step=".05" onChange={(v) => updateQuality({ edgeSoftness: v })}/><Range label={tr.colorSpill} value={project.quality.colorSpill} min="0" max="50" onChange={(v) => updateQuality({ colorSpill: v, spillColor: sampleBackgroundTint(project) })}/></QualityGroup><QualityGroup title={tr.textureGroup}><Range label={tr.sharpness} value={project.quality.sharpness} min="-50" max="50" onChange={(v) => updateQuality({ sharpness: v })}/><Range label={tr.grain} value={project.quality.grain} min="0" max="40" onChange={(v) => updateQuality({ grain: v })}/></QualityGroup><QualityGroup title={tr.shadowGroup}><Range label={tr.shadowDistance} value={project.quality.shadowDistance} min="0" max="60" onChange={(v) => updateQuality({ shadowDistance: v })}/><Range label={tr.shadowOpacity} value={project.quality.shadowOpacity} min="0" max="80" onChange={(v) => updateQuality({ shadowOpacity: v })}/><Range label={tr.shadowBlur} value={project.quality.shadowBlur} min="0" max="80" onChange={(v) => updateQuality({ shadowBlur: v })}/></QualityGroup></section>}
        </div>
      </aside>
    </section>
  </main>
}

function QualityGroup({title,children}) { return <div className="quality-group"><h3>{title}</h3><div className="range-grid">{children}</div></div> }

function PanelTabs({ tabs, active, onChange }) {
  return <div className="panel-tabs" role="tablist">{tabs.map(([id, label]) => <button key={id} role="tab" aria-selected={active === id} className={active === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>
}

function FontPicker({ tr, options, value, loading, onChange, onLoad }) {
  return <div className="font-picker"><span>{tr.font}<button type="button" className="font-load" disabled={loading} onClick={onLoad}>{loading ? tr.loadingFonts : tr.loadFonts}</button></span><select aria-label={tr.font} value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value} style={{ fontFamily: option.value }}>{option.name}</option>)}</select></div>
}

function Range({ label, value, min, max, step = 1, onChange }) {
  const formatValue = (nextValue) => Number(nextValue).toFixed(step < 1 ? 2 : 0)
  const [draft, setDraft] = useState(formatValue(value))
  useEffect(() => setDraft(formatValue(value)), [value, step])
  const updateNumber = (rawValue) => {
    setDraft(rawValue)
    if (rawValue.trim() === '') return
    const numericValue = Number(rawValue)
    if (!Number.isFinite(numericValue)) return
    const clampedValue = Math.min(Number(max), Math.max(Number(min), numericValue))
    if (clampedValue !== numericValue) setDraft(formatValue(clampedValue))
    onChange(clampedValue)
  }
  const nudge = (direction) => {
    const nextValue = Math.min(Number(max), Math.max(Number(min), Number(value) + direction * Number(step)))
    updateNumber(formatValue(nextValue))
  }
  const labelParts = { '影の広がり': ['影の', '広がり'], '影の濃度': ['影の', '濃度'] }[label]
  return <div className="range"><div className="range-header"><span className="range-title">{labelParts ? <>{labelParts[0]}<br />{labelParts[1]}</> : label}</span><span className="range-stepper"><button type="button" aria-label={`${label} −`} title={`−${step}`} disabled={Number(value) <= Number(min)} onClick={() => nudge(-1)}>−</button><input className="range-number" type="number" aria-label={label} value={draft} min={min} max={max} step={step} onChange={(e) => updateNumber(e.target.value)} onBlur={() => setDraft(formatValue(value))}/><button type="button" aria-label={`${label} ＋`} title={`＋${step}`} disabled={Number(value) >= Number(max)} onClick={() => nudge(1)}>＋</button></span></div><input type="range" aria-label={label} value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}/></div>
}

const rootElement = document.getElementById('root')
const appRoot = globalThis.__soulPicsRoot || createRoot(rootElement)
globalThis.__soulPicsRoot = appRoot
appRoot.render(<App />)
