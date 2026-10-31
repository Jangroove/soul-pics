import React, { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { FontPicker, PanelTabs, QualityGroup, Range } from './components/Controls.jsx'
import {
  cachedFontOptions,
  CUSTOM_LIMITS,
  DEFAULT_QUALITY,
  fontOption,
  formatMessage,
  freshText,
  PRESETS,
  projectPreset,
  storedLanguage,
  UI_VERSION,
} from './projectConfig.js'
import {
  analyzeFinalQuality,
  backgroundRect,
  canvasPoint,
  canvasTarget,
  renderProject,
  sampleBackgroundTint,
} from './canvasRenderer.js'
import './styles.css'
import './uiRefinements.css'

const COPY = {
  en: {
    generateButton: 'Generate AI', cutoutButton: 'Local cutout', saveAssetButton: 'Save image', uploadBackgroundTab: 'Upload image',
    presetYoutubeLandscape: 'YouTube thumbnail · Landscape', presetYoutubeVertical: 'YouTube Shorts · Vertical', presetInstagram: 'Instagram post · Portrait', presetXHeader: 'X profile header', presetSocialIcon: 'Social profile icon', presetCustom: 'Custom size', customWidth: 'Width', customHeight: 'Height', customHint: '64–4096 px',
    eyebrow: 'OPENAI BUILD WEEK · APPS FOR YOUR LIFE', subhead: 'Say what to keep. Place it anywhere. Add the words that make it yours.', download: 'Download PNG',
    checkingAi: 'Checking AI…', localAiReady: 'Local cutout ready', localAiRequired: 'Local AI setup required', backgroundAiReady: 'BG Codex ready', backgroundCodexRequired: 'Codex setup required',
    canvas: '1. Canvas & background', format: 'Format', fallbackBackground: 'Padding / transparent area color',
    tabCanvas: 'Canvas', tabBackground: 'Canvas/BG', tabSubject: 'Subject', tabPlacement: 'Place', tabContent: 'Text', tabStyle: 'Style', tabLayout: 'Position', tabInfo: 'Info', tabBlend: 'Quality',
    canvas: '1. Canvas', background: '2. Background', backgroundFit: 'Background fit', fitCover: 'Cover · fill without distortion', fitContain: 'Contain · show the whole image', fitStretch: 'Stretch · fill with distortion', fitActual: 'Actual size · 1:1 pixels', backgroundPositionX: 'BG X', backgroundPositionY: 'BG Y', centerBackground: 'Center background', backgroundPositionHint: 'Drag an empty area of the preview to reposition the background.', generatePrompt: 'Generate from a prompt', backgroundPlaceholder: 'e.g. Neon blue and violet AI studio, cinematic light, open space on the left', generatingBackgroundButton: 'Generating…', generateBackgroundButton: 'Generate AI background', saveBackground: 'Save background image', or: 'or', uploadBackground: 'Upload background image', backgroundHint: 'Uses your signed-in Codex plan. No Soul Pics OpenAI API key required.',
    subject: '3. Subject & placement', uploadSource: 'Upload source image', keepQuestion: 'What should Soul Pics keep?', keepPlaceholder: 'e.g. Keep only the person and the product in their hands', creatingMask: 'Cutting out…', createMask: 'Create local AI cutout', workCutout: 'Try with ChatGPT Work', workPreparing: 'Preparing Work job…', workWaiting: 'Waiting for result.png in the opened folder…', workOpenFolder: 'Open Work folder', workInstructions: 'Open and grant this folder to ChatGPT Work, then paste these instructions. Do not attach the image for this test.', workCopy: 'Copy instructions', workCopied: 'Instructions copied. Paste them into ChatGPT Work.', workJobReady: 'Folder opened. In ChatGPT Work, open and grant access to this folder, then paste the copied instructions without attaching the image.', workApplied: 'ChatGPT Work cutout loaded into Soul Pics.', workFailed: 'Work cutout experiment failed.', workHint: 'Path-access test: in ChatGPT Work, open and grant access to the local folder, then paste the copied instructions. Do not attach source.*; the prompt contains its full path.', codexCutout: 'Cut out with Codex', codexPreparing: 'Starting Codex cutout…', codexWaiting: 'Codex is processing the image and creating a transparent cutout…', codexApplied: 'Codex cutout loaded into Soul Pics.', codexAppliedWithAttempts: 'Codex cutout loaded into Soul Pics. Image generation calls: {count}.', codexFailed: 'Codex cutout failed.', codexHint: 'Sends the selected image and prompt to a new local Codex task. Requires the Codex CLI to be signed in. This uses your Codex plan, not an OpenAI API key.', codexRestartRequired: 'Restart the Soul Pics API server and reload this tab to enable Codex cutout.', saveSubject: 'Save cutout image', maskHint: 'The prompt instructions are converted on this PC and processed with Grounding DINO, SAM 2.1, and BiRefNet. Everything runs locally, so there are no additional charges.',
    placement: 'Placement controls', size: 'Size', x: 'X', y: 'Y', rotation: 'Rotation', brightness: 'Brightness', contrast: 'Contrast', flip: 'Flip horizontally', flipVertical: 'Flip vertically',
    output: 'Output', outputHint: 'Preview and download share one Canvas renderer.', dragHint: 'Drag the background, subject, or text directly on the preview.', previewLabel: 'Soul Pics output preview', processing: 'Processing', processingHint: 'Please keep this tab open. The preview will update automatically when finished.', loadingBackground: 'Loading and preparing the background image…', loadingSubject: 'Loading and preparing the subject image…', loadingFontsProcessing: 'Loading the fonts installed on this PC…',
    textLayers: '4. Text layers', textBlock: 'Text', backgroundBlock: 'Text background', outlineBlock: 'Outline', shadowBlock: 'Shadow', blockColor: 'Color', blockWidth: 'Width', blockOpacity: 'Opacity', blockSpread: 'Spread', blockBlur: 'Blur', blockPaddingX: 'Padding X', blockPaddingY: 'Padding Y', blockRadius: 'Radius', layer: 'Layer', addLayer: 'Add text layer', text: 'Text', font: 'Font', loadFonts: 'PC fonts', loadingFonts: 'Loading…', textColor: 'Text color', outlineColor: 'Outline color', shadowColor: 'Shadow color', outline: 'Outline', shadowSize: 'Shadow spread', textShadowOpacity: 'Shadow opacity', textShadowX: 'Shadow X', textShadowY: 'Shadow Y', textShadowBlur: 'Blur', shadowX: 'Shadow X', shadowY: 'Shadow Y', shadowBlur: 'Shadow blur', bold: 'Bold', italic: 'Italic', underline: 'Underline', removeLayer: 'Remove selected layer', fontsLoaded: '{count} installed font families loaded.', noFontsFound: 'This browser returned no local fonts. The fallback list remains available.', fontAccessUnsupported: 'This browser cannot list installed fonts. Use desktop Chrome or Edge.', fontAccessDenied: 'Font access was not allowed. You can enable Local fonts in the site permissions and try again.',
    blend: '5. Final quality adjustment', blendHint: 'Analyze the original background and subject locally, then fine-tune every visible value while watching the preview.', resetQuality: 'Reset to initial state', autoQuality: 'Recommended auto adjust', adjustmentStrength: 'Auto strength', weak: 'Weak', standard: 'Standard', strong: 'Strong', qualityLocalHint: 'All analysis and rendering are processed locally in this browser, so there are no additional charges.', toneGroup: 'Color & tone', depthGroup: 'Depth & edges', textureGroup: 'Texture', shadowGroup: 'Shadow', backgroundBlur: 'Background blur', brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation', temperature: 'Color temperature', edgeSoftness: 'Edge softness', colorSpill: 'BG color spill', sharpness: 'Sharpness', grain: 'Global grain', shadowDistance: 'Shadow distance', shadowOpacity: 'Shadow opacity', shadowBlur: 'Shadow blur', qualityApplied: 'Original assets analyzed locally; recommended values applied.', qualityReset: 'Final quality adjustments reset. Images, placement, and text were preserved.',
    promise: 'Build Week promise', promiseLocal: 'Original images remain local during editing.', promiseExplicit: 'AI runs only when you press an AI button.', promiseMatch: 'Download matches this preview.',
    start: 'Start with a background or a subject image.', subjectLoaded: 'Subject loaded. Original pixels stay local in this browser.', backgroundLoaded: 'Background loaded. Original pixels stay local in this browser.', badImage: 'That image could not be read. Try PNG, JPEG, or WebP.', exported: 'PNG exported from the exact same canvas used for the preview.', subjectSaved: 'The cutout/source image was saved without compositing.', backgroundSaved: 'The background image was saved without compositing.', localAiNotConfigured: 'Local cutout is not installed. Run npm run setup:local-ai, then restart the server.', backgroundAiNotConfigured: 'Background generation needs the Codex CLI installed and signed in. Restart Soul Pics after setup.', uploadSubjectFirst: 'Upload a source image first.', describeKeep: 'Describe what to keep before creating the local cutout.', sourcePrepareFailed: 'The source image could not be prepared.', masking: 'Local AI is translating the prompt, detecting the subject, and refining its edges. The first run can take several minutes.', maskApplied: 'Local transparent cutout completed. Original RGB pixels and image proportions were preserved.', maskFailed: 'The local cutout failed.', describeBackground: 'Describe the background you want to generate.', generatingBackground: 'Codex is generating a {width}×{height} background. This can take several minutes.', backgroundGenerated: 'AI background generated and loaded. It is now edited locally like an uploaded background.', backgroundFailed: 'Background generation failed.',
  },
  ja: {
    generateButton: 'AI背景を生成', cutoutButton: 'AI切り抜き', saveAssetButton: '素材を保存', uploadBackgroundTab: '背景をアップロード',
    presetYoutubeLandscape: 'YouTube サムネイル・横', presetYoutubeVertical: 'YouTube Shorts・縦', presetInstagram: 'Instagram 投稿・縦', presetXHeader: 'X プロフィールヘッダー', presetSocialIcon: 'SNS プロフィールアイコン', presetCustom: '自由指定', customWidth: '幅', customHeight: '高さ', customHint: '64〜4096 px',
    eyebrow: 'OPENAI BUILD WEEK · 暮らしのためのアプリ', subhead: '残したいものを伝える。好きな場所に置く。自分の言葉を加える。', download: 'PNGを保存',
    checkingAi: 'AI接続を確認中…', localAiReady: 'ローカル切り抜き利用可能', localAiRequired: 'ローカルAI要セットアップ', backgroundAiReady: '背景Codex利用可能', backgroundCodexRequired: 'Codexのセットアップが必要',
    canvas: '1. キャンバス・背景', format: '形式', fallbackBackground: '余白・透明部分の色',
    tabCanvas: 'キャンバス', tabBackground: '背景', tabSubject: '被写体', tabPlacement: '配置', tabContent: 'テキスト', tabStyle: '装飾', tabLayout: '位置', tabInfo: '情報', tabBlend: '画質調整',
    canvas: '1. キャンバス', background: '2. 背景', backgroundFit: '背景の表示方法', fitCover: '全面を埋める・比率維持', fitContain: '全体を収める・比率維持', fitStretch: '全面に引き伸ばす', fitActual: '素材サイズのまま・1:1', backgroundPositionX: '背景X', backgroundPositionY: '背景Y', centerBackground: '背景を中央に戻す', backgroundPositionHint: 'プレビューの空いている場所をドラッグして背景位置を変更できます。', generatePrompt: 'プロンプトから生成', backgroundPlaceholder: '例：青と紫のネオンが光るAIスタジオ、映画的な照明、左側に余白', generatingBackgroundButton: '生成中…', generateBackgroundButton: 'AI背景を生成', saveBackground: '背景素材を保存', or: 'または', uploadBackground: '背景画像をアップロード', backgroundHint: 'Codexプランを使って背景を生成します。Soul PicsのOpenAI APIキーは使いません。',
    subject: '3. 被写体・配置', uploadSource: '元画像をアップロード', keepQuestion: 'Soul Picsに何を残しますか？', keepPlaceholder: '例：人物と手に持っている製品だけを残す', creatingMask: '切り抜き中…', createMask: 'ローカルAIで切り抜く', workCutout: 'ChatGPT Workで試す', workPreparing: 'Work用フォルダを準備中…', workWaiting: 'フォルダ内にresult.pngが保存されるのを待っています…', workOpenFolder: 'Work用フォルダを開く', workInstructions: 'このフォルダをChatGPT Workで開いてアクセスを許可し、指示を貼り付けてください。今回のテストでは画像を添付しません。', workCopy: '指示をコピー', workCopied: '指示をコピーしました。ChatGPT Workに貼り付けてください。', workJobReady: 'フォルダを開きました。ChatGPT Work内でこのフォルダを開いてアクセスを許可し、画像を添付せずにコピー済みの指示を貼り付けてください。', workApplied: 'ChatGPT Workの切り抜きをSoul Picsに読み込みました。', workFailed: 'Work切り抜き実験に失敗しました。', workHint: 'パス参照テスト：ChatGPT Work内でローカルフォルダを開いてアクセスを許可し、コピー済みの指示を貼り付けます。source.*は添付せず、指示に書かれた絶対パスから読めるか試します。', codexCutout: 'Codexで切り抜く', codexPreparing: 'Codexの切り抜き処理を開始しています…', codexWaiting: 'Codexが画像を処理し、透過PNGを作成しています…', codexApplied: 'Codexの切り抜きをSoul Picsに読み込みました。', codexAppliedWithAttempts: 'Codexの切り抜きをSoul Picsに読み込みました。画像生成の呼び出し回数: {count}回。', codexFailed: 'Codexの切り抜きに失敗しました。', codexHint: '選択画像とプロンプトをCodexの新しいローカルタスクへ送り、完成画像を自動で読み込みます。Codex CLIへのサインインが必要です。Codexのプラン利用枠を使い、OpenAI APIキーは使いません。', codexRestartRequired: 'Codex連携を有効にするには、Soul Pics APIサーバーを再起動してこのタブを再読み込みしてください。', saveSubject: '切り抜き素材を保存', maskHint: 'プロンプトの指示内容をPC内で変換し、Grounding DINO・SAM 2.1・BiRefNetで処理します。すべてローカルで行うため、別途料金は発生しません。',
    placement: '配置調整', size: 'サイズ', x: 'X位置', y: 'Y位置', rotation: '回転', brightness: '明るさ', contrast: 'コントラスト', flip: '左右反転', flipVertical: '上下反転',
    output: '出力', outputHint: 'プレビューと保存画像は同じCanvasレンダラーを使用します。', dragHint: 'プレビュー上の背景・被写体・テキストを直接ドラッグして移動できます。', previewLabel: 'Soul Pics出力プレビュー', processing: '処理中', processingHint: 'このタブを閉じずにお待ちください。完了するとプレビューが自動更新されます。', loadingBackground: '背景画像を読み込んで準備しています…', loadingSubject: '被写体画像を読み込んで準備しています…', loadingFontsProcessing: 'このPCにインストールされたフォントを読み込んでいます…',
    textLayers: '4. テキストレイヤー', textBlock: '文字', backgroundBlock: 'テキスト背景', outlineBlock: '縁取り', shadowBlock: '影', blockColor: '色', blockWidth: '幅', blockOpacity: '透明度', blockSpread: '広がり', blockBlur: 'ぼかし', blockPaddingX: '左右余白', blockPaddingY: '上下余白', blockRadius: '角丸', layer: 'レイヤー', addLayer: 'テキストレイヤーを追加', text: 'テキスト', font: 'フォント', loadFonts: 'PCフォント', loadingFonts: '読込中…', textColor: '文字色', outlineColor: '縁取り色', shadowColor: '影の色', outline: '線幅', shadowSize: '影の広がり', textShadowOpacity: '影の濃度', textShadowX: '影X', textShadowY: '影Y', textShadowBlur: 'ぼかし', shadowX: '影のX位置', shadowY: '影のY位置', shadowBlur: '影のぼかし', bold: '太字', italic: '斜体', underline: '下線', removeLayer: '選択中のレイヤーを削除', fontsLoaded: 'インストール済みフォントを{count}ファミリー読み込みました。', noFontsFound: 'このブラウザからローカルフォントが返されませんでした。標準候補は引き続き使用できます。', fontAccessUnsupported: 'このブラウザではPCフォントを列挙できません。デスクトップ版ChromeまたはEdgeをお使いください。', fontAccessDenied: 'フォント参照が許可されませんでした。サイトの権限で「ローカル フォント」を許可して再実行できます。',
    blend: '5. 最終画質調整', blendHint: '元の背景と被写体をローカル解析し、表示された推奨値をプレビューを見ながら微調整できます。', resetQuality: '初期状態に戻す', autoQuality: 'おすすめ自動調整', adjustmentStrength: '自動調整の強さ', weak: '弱', standard: '標準', strong: '強', qualityLocalHint: '解析と描画はすべてこのブラウザ内でローカル処理するため、別途料金は発生しません。', toneGroup: '色・トーン', depthGroup: '奥行き・輪郭', textureGroup: '質感', shadowGroup: '影', backgroundBlur: '背景ぼかし', brightness: '明るさ', contrast: 'コントラスト', saturation: '彩度', temperature: '色温度', edgeSoftness: '輪郭の柔らかさ', colorSpill: '背景色の回り込み', sharpness: 'シャープネス', grain: '全体の粒状感', shadowDistance: '影の距離', shadowOpacity: '影の濃さ', shadowBlur: '影のぼかし', qualityApplied: '元画像をローカル解析し、推奨値を反映しました。', qualityReset: '画質調整を初期化しました。画像・配置・文字は保持されています。',
    promise: 'Build Weekでの約束', promiseLocal: '編集中の元画像はローカルに保持します。', promiseExplicit: 'AIはAIボタンを押したときだけ実行します。', promiseMatch: '保存画像はこのプレビューと一致します。',
    start: '背景画像または被写体画像から始めましょう。', subjectLoaded: '被写体を読み込みました。元画像はこのブラウザ内に保持されます。', backgroundLoaded: '背景を読み込みました。元画像はこのブラウザ内に保持されます。', badImage: '画像を読み込めませんでした。PNG、JPEG、WebPをお試しください。', exported: 'プレビューと同じCanvasからPNGを保存しました。', subjectSaved: '合成前の切り抜き／被写体素材を保存しました。', backgroundSaved: '合成前の背景素材を保存しました。', localAiNotConfigured: 'ローカル切り抜きが未導入です。npm run setup:local-aiを実行し、サーバーを再起動してください。', backgroundAiNotConfigured: '背景生成にはCodex CLIのインストールとサインインが必要です。設定後にSoul Picsを再起動してください。', uploadSubjectFirst: '最初に元画像をアップロードしてください。', describeKeep: 'ローカル切り抜きを実行する前に、残したい対象を入力してください。', sourcePrepareFailed: '元画像を処理用に準備できませんでした。', masking: '日本語指示の変換、被写体検出、輪郭精製をPC内で実行しています。初回は数分かかる場合があります。', maskApplied: 'ローカル切り抜きが完了しました。元画像のRGB画素と縦横比を維持しています。', maskFailed: 'ローカル切り抜き処理に失敗しました。', describeBackground: '生成したい背景を入力してください。', generatingBackground: 'Codexが{width}×{height}の背景を生成しています。数分かかる場合があります。', backgroundGenerated: 'AI背景を生成して読み込みました。以後はアップロード背景と同じようにローカルで編集できます。', backgroundFailed: '背景生成に失敗しました。',
  },
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
    const [qualityStrength, setQualityStrength] = useState('standard')
  const [backgroundGeneratorOpen, setBackgroundGeneratorOpen] = useState(true)
  const [backgroundUploadOpen, setBackgroundUploadOpen] = useState(false)
  const [masking, setMasking] = useState(false)
  const [workCutout, setWorkCutout] = useState(null)
  const [cutoutMode, setCutoutMode] = useState(null)
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
    : `${localCutoutReady ? tr.localAiReady : tr.localAiRequired} · ${backgroundAiReady ? tr.backgroundAiReady : tr.backgroundCodexRequired}`
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
      'Codex CLI is unavailable. Install and sign in to Codex, then restart Soul Pics.': 'backgroundAiNotConfigured',
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
    setCutoutMode('local')
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
    } catch (error) { setNotice({ text: error.message }) } finally { setMasking(false); setCutoutMode(null) }
  }
  const startWorkCutout = async () => {
    if (!project.subjectImage) return message('uploadSubjectFirst')
    if (selectionPrompt.trim().length < 3) return message('describeKeep')
    let source = project.subjectAsset
    if (!(source instanceof Blob) || source.size > 48 * 1024 * 1024) {
      const canvas = document.createElement('canvas')
      const uploadScale = Math.min(1, 4096 / Math.max(project.subjectImage.naturalWidth, project.subjectImage.naturalHeight))
      canvas.width = Math.max(1, Math.round(project.subjectImage.naturalWidth * uploadScale))
      canvas.height = Math.max(1, Math.round(project.subjectImage.naturalHeight * uploadScale))
      canvas.getContext('2d').drawImage(project.subjectImage, 0, 0, canvas.width, canvas.height)
      source = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    }
    if (!source || source.size > 50 * 1024 * 1024) return message('sourcePrepareFailed')
    const body = new FormData()
    body.append('image', source, source.type === 'image/png' ? 'source.png' : source.type === 'image/webp' ? 'source.webp' : 'source.jpg')
    body.append('prompt', selectionPrompt.trim())
    setMasking(true)
    setCutoutMode('work')
    setWorkCutout(null)
    message('workPreparing')
    await afterNextPaint()
    try {
      const response = await fetch('/api/work-cutout', { method: 'POST', body })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || tr.workFailed)
      const job = await response.json()
      setWorkCutout(job)
      await fetch(`/api/work-cutout/${job.id}/open-folder`, { method: 'POST' })
      await navigator.clipboard?.writeText(job.instructions).catch(() => {})
      message('workJobReady')
      const deadline = Date.now() + 60 * 60 * 1000
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const status = await fetch(`/api/work-cutout/${job.id}/status`).then((result) => result.json())
        if (!status.ready) continue
        const result = await fetch(`/api/work-cutout/${job.id}/result`)
        if (!result.ok) continue
        const asset = await result.blob()
        const image = await readImage(new File([asset], 'work-cutout.png', { type: 'image/png' }))
        setProject((current) => ({ ...current, subjectImage: image, subjectAsset: asset, subjectCutoutReady: true }))
        message('workApplied')
        setWorkCutout(null)
        return
      }
      throw new Error(tr.workFailed)
    } catch (error) {
      setNotice({ text: error.message || tr.workFailed })
      setWorkCutout(null)
    } finally {
      setMasking(false)
      setCutoutMode(null)
    }
  }
  const startCodexCutout = async () => {
    if (serviceStatus?.sourceVersion !== UI_VERSION) return setNotice({ text: tr.codexRestartRequired })
    if (!project.subjectImage) return message('uploadSubjectFirst')
    if (selectionPrompt.trim().length < 3) return message('describeKeep')
    let source = project.subjectAsset
    if (!(source instanceof Blob) || source.size > 48 * 1024 * 1024) {
      const canvas = document.createElement('canvas')
      const uploadScale = Math.min(1, 4096 / Math.max(project.subjectImage.naturalWidth, project.subjectImage.naturalHeight))
      canvas.width = Math.max(1, Math.round(project.subjectImage.naturalWidth * uploadScale))
      canvas.height = Math.max(1, Math.round(project.subjectImage.naturalHeight * uploadScale))
      canvas.getContext('2d').drawImage(project.subjectImage, 0, 0, canvas.width, canvas.height)
      source = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    }
    if (!source || source.size > 50 * 1024 * 1024) return message('sourcePrepareFailed')
    const body = new FormData()
    body.append('image', source, source.type === 'image/png' ? 'source.png' : source.type === 'image/webp' ? 'source.webp' : 'source.jpg')
    body.append('prompt', selectionPrompt.trim())
    setMasking(true)
    setCutoutMode('codex')
    message('codexPreparing')
    await afterNextPaint()
    try {
      const response = await fetch('/api/codex-cutout', { method: 'POST', body })
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || tr.codexFailed)
      const job = await response.json()
      const deadline = Date.now() + 60 * 60 * 1000
      let imageGenerationAttempts = 0
      message('codexWaiting')
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const statusResponse = await fetch(`/api/work-cutout/${job.id}/status`)
        const status = await statusResponse.json()
        imageGenerationAttempts = status.imageGenerationAttempts ?? imageGenerationAttempts
        if (!statusResponse.ok || status.status === 'failed') throw new Error(status.error || tr.codexFailed)
        if (!status.ready) continue
        const result = await fetch(`/api/work-cutout/${job.id}/result`)
        if (!result.ok) continue
        const asset = await result.blob()
        const image = await readImage(new File([asset], 'codex-cutout.png', { type: 'image/png' }))
        setProject((current) => ({ ...current, subjectImage: image, subjectAsset: asset, subjectCutoutReady: true }))
        message('codexAppliedWithAttempts', { count: imageGenerationAttempts })
        return
      }
      throw new Error(tr.codexFailed)
    } catch (error) {
      setNotice({ text: error.message || tr.codexFailed })
    } finally {
      setMasking(false)
      setCutoutMode(null)
    }
  }
  const generateBackground = async () => {
    if (!requireAi('background')) return
    if (backgroundPrompt.trim().length < 3) return message('describeBackground')
    setGeneratingBackground(true)
    console.log('Background UI execution started', { startedAt: new Date().toISOString(), width: preset.width, height: preset.height, promptLength: backgroundPrompt.trim().length })
    message('generatingBackground', { width: preset.width, height: preset.height })
    try {
      const response = await fetch('/api/background', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: backgroundPrompt.trim(), width: preset.width, height: preset.height }),
      })
      if (!response.ok) throw await responseError(response, 'backgroundFailed')
      const job = await response.json()
      const deadline = Date.now() + 60 * 60 * 1000
      let generatedAsset
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const statusResponse = await fetch(`/api/background/${job.id}/status`)
        const status = await statusResponse.json()
        if (!statusResponse.ok || status.status === 'failed') throw new Error(status.error || tr.backgroundFailed)
        if (!status.ready) continue
        const result = await fetch(`/api/background/${job.id}/result`)
        if (!result.ok) continue
        generatedAsset = await result.blob()
        break
      }
      if (!generatedAsset) throw new Error(tr.backgroundFailed)
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
  const processingMessage = masking ? (cutoutMode === 'codex' ? tr.codexWaiting : cutoutMode === 'work' ? (workCutout ? tr.workWaiting : tr.workPreparing) : tr.masking) : generatingBackground ? formatMessage(tr.generatingBackground,{width:preset.width,height:preset.height}) : uploadingAsset==='subjectImage' ? tr.loadingSubject : uploadingAsset==='backgroundImage' ? tr.loadingBackground : loadingFonts ? tr.loadingFontsProcessing : ''

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
              <button type="button" role="tab" aria-selected={backgroundUploadOpen} className={`background-source-tab ${backgroundUploadOpen ? 'is-active' : ''}`} onClick={() => { setBackgroundGeneratorOpen(false); setBackgroundUploadOpen(true) }}>{tr.uploadBackgroundTab}</button>
            </div>
            {backgroundGeneratorOpen && <div className="background-generator background-source-panel">
              <label className="background-prompt"><textarea aria-label={tr.generatePrompt} value={backgroundPrompt} onChange={(e) => setBackgroundPrompt(e.target.value)} placeholder={tr.backgroundPlaceholder} /></label>
              <div className="background-actions"><button className="ai-action key-action" title={tr.generateBackgroundButton} aria-label={tr.generateBackgroundButton} disabled={generatingBackground} onClick={generateBackground}>{generatingBackground ? tr.generatingBackgroundButton : tr.generateButton}</button><button className="secondary asset-save" title={tr.saveBackground} aria-label={tr.saveBackground} disabled={!project.backgroundGeneratedReady} onClick={() => saveAsset(project.backgroundAsset, 'generated-background', 'backgroundSaved')}>{tr.saveAssetButton}</button></div>
            <p className="hint">{tr.backgroundHint}</p></div>}
            {backgroundUploadOpen && <div className="background-upload-block background-source-panel"><div className="background-display-settings"><label>{tr.backgroundFit}<select value={project.backgroundFit} onChange={(e) => setProject((p) => ({ ...p, backgroundFit: e.target.value }))}><option value="cover">{tr.fitCover}</option><option value="contain">{tr.fitContain}</option><option value="stretch">{tr.fitStretch}</option><option value="actual">{tr.fitActual}</option></select></label><label><span className="fallback-label">{tr.fallbackBackground}</span><input type="color" value={project.backgroundColor} onChange={(e) => setProject((p) => ({ ...p, backgroundColor: e.target.value }))} /></label></div><label className="upload key-upload"><input type="file" accept="image/*" onCancel={cancelUpload} onChange={(e) => upload(e, 'backgroundImage')} />{tr.uploadBackground}</label></div>}
          </section>}
          {leftTab === 'subject' && <section className="subject-editor"><h2>{tr.subject}</h2><label className="upload key-upload"><input type="file" accept="image/*" onCancel={cancelUpload} onChange={(e) => upload(e, 'subjectImage')} />{tr.uploadSource}</label><label className="subject-prompt" ref={subjectPromptRef}>{tr.keepQuestion}<textarea value={selectionPrompt} onChange={(e) => setSelectionPrompt(e.target.value)} placeholder={tr.keepPlaceholder} /></label><div className="subject-actions"><button className="ai-action key-action" title={tr.createMask} aria-label={tr.createMask} disabled={masking} onClick={runMask}>{masking && cutoutMode === 'local' ? tr.creatingMask : tr.cutoutButton}</button><button className="ai-action" title={tr.workCutout} aria-label={tr.workCutout} disabled={masking} onClick={startWorkCutout}>{masking && cutoutMode === 'work' ? tr.workPreparing : tr.workCutout}</button><button className="ai-action" title={tr.codexCutout} aria-label={tr.codexCutout} disabled={masking || serviceStatus?.sourceVersion !== UI_VERSION} onClick={startCodexCutout}>{masking && cutoutMode === 'codex' ? tr.codexPreparing : tr.codexCutout}</button><button className="secondary asset-save" title={tr.saveSubject} aria-label={tr.saveSubject} disabled={!project.subjectCutoutReady} onClick={() => saveAsset(project.subjectAsset, 'cutout-subject', 'subjectSaved')}>{tr.saveAssetButton}</button></div><p className="hint">{tr.maskHint}</p><p className="hint">{serviceStatus?.sourceVersion && serviceStatus.sourceVersion !== UI_VERSION ? tr.codexRestartRequired : tr.codexHint}</p><p className="hint">{tr.workHint}</p>{workCutout && <div className="work-cutout-job"><code>{workCutout.folder}</code><div className="subject-actions"><button className="secondary" onClick={() => fetch(`/api/work-cutout/${workCutout.id}/open-folder`, { method: 'POST' })}>{tr.workOpenFolder}</button><button className="secondary" onClick={async () => { try { await navigator.clipboard.writeText(workCutout.instructions); message('workCopied') } catch { setNotice({ text: tr.workInstructions }) } }}>{tr.workCopy}</button></div></div>}<div className="subject-placement"><h3>{tr.placement}</h3><div className="range-grid"><Range label={tr.size} value={project.subject.scale} min="0.1" max="1.8" step="0.01" onChange={(value) => updateSubject({ scale: value })}/><Range label={tr.rotation} value={project.subject.rotation} min="-180" max="180" onChange={(value) => updateSubject({ rotation: value })}/><Range label={tr.x} value={project.subject.x} min="0" max={preset.width} onChange={(value) => updateSubject({ x: value })}/><Range label={tr.y} value={project.subject.y} min="0" max={preset.height} onChange={(value) => updateSubject({ y: value })}/></div><div className="subject-flip-checks"><label className="check"><input type="checkbox" checked={project.subject.flip} onChange={(e) => updateSubject({ flip: e.target.checked })}/> {tr.flip}</label><label className="check"><input type="checkbox" checked={Boolean(project.subject.flipY)} onChange={(e) => setProject((p) => ({ ...p, subject: { ...p.subject, flipY: e.target.checked } }))}/> {tr.flipVertical}</label></div></div></section>}
        </div>
      </aside>
      <section className="stage-wrap"><div className="stage-heading"><span className="stage-heading-title">SOUL CANVAS / LIVE PREVIEW</span><p className="dimensions"><span className="preview-instructions">{tr.dragHint}</span><span className="preview-output">{tr.output}: {preset.width} × {preset.height} px · {tr.outputHint}</span></p></div><div className={`stage ${processingMessage ? 'is-processing' : ''}`} aria-busy={Boolean(processingMessage)}><canvas ref={canvasRef} className={dragging ? 'dragging' : ''} aria-label={tr.previewLabel} onPointerDown={startCanvasDrag} onPointerMove={moveCanvasDrag} onPointerUp={endCanvasDrag} onPointerCancel={endCanvasDrag} />{processingMessage && <div className="processing-overlay" role="status" aria-live="polite"><div className="processing-spinner" aria-hidden="true"/><strong>{tr.processing}</strong><span>{processingMessage}</span><small>{tr.processingHint}</small></div>}</div><footer className="app-footer">© 2026 Jangroove</footer></section>
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

const rootElement = document.getElementById('root')
const appRoot = globalThis.__soulPicsRoot || createRoot(rootElement)
globalThis.__soulPicsRoot = appRoot
appRoot.render(<App />)
