# Soul Pics Development Guide

This guide defines the post-v1.0 maintenance structure. The submitted v1.0.0 release is the behavior baseline; refactoring must preserve its visible output and processing boundaries.

## Architecture

| Area | File | Responsibility |
|---|---|---|
| Application | src/main.jsx | React state, event handlers, local/API orchestration, and page composition |
| Rendering | src/canvasRenderer.js | Preview/export rendering, text effects, quality analysis, coordinate conversion, and hit testing |
| Configuration | src/projectConfig.js | Canvas presets, default project values, UI version, font helpers, and language persistence |
| Shared controls | src/components/Controls.jsx | Reusable tabs, sliders, font picker, and quality groups |
| Styling | src/styles.css | Responsive layout and visual presentation |
| UI refinement | src/uiRefinements.css | Shared typography, readable lime palette, adaptive controls; loaded after styles.css |
| Local server | server/index.js | Health/font/background endpoints, local-cutout worker coordination, ChatGPT Work file exchange, and Codex App Server tasks |
| Local AI | local_ai/ | Prompt normalization, Grounding DINO, SAM 2.1, and BiRefNet processing |

The Canvas renderer is the single source of truth for both the live preview and PNG export. Do not add an export-only drawing path.

## Processing boundary

- Subject cutout is local: prompt normalization, Grounding DINO, SAM 2.1, and BiRefNet.
- Codex cutout and background generation use a signed-in local Codex App Server task; background input is only the prompt and canvas dimensions. Neither requires the Soul Pics OpenAI API key.
- The experimental ChatGPT Work cutout path uses a local temp folder and filesystem polling; the user grants Work local-folder access and starts Work. The prompt references absolute paths and does not require a source attachment. It does not call the OpenAI API.
- The Codex cutout path starts a new local Codex App Server thread, passes the selected image as a local-image input with the user prompt, and polls the exchange folder for a completed transparent PNG. It uses the signed-in Codex plan, not the Soul Pics OpenAI API key.
- Placement, text, final-quality adjustment, preview, and export stay local.
- Never add an automatic API retry or an API call during startup, preview, or final adjustment.

## Change workflow

1. Keep the v1.0.0 tag as the immutable submitted baseline.
2. Make post-release work on a feature branch.
3. Put rendering changes in canvasRenderer.js, reusable controls in components/, and defaults in projectConfig.js.
4. Record user-visible changes in CHANGELOG.md; do not increment the displayed version for a behavior-neutral refactor.
5. Run npm run check.
6. Confirm both English and Japanese UI, preview/export parity, text background effects, subject flipping, and file-picker cancellation.
7. Commit only after the working tree passes the checks.

## Regression checklist

- The app starts without browser-console errors.
- UI and server versions agree (current local development: v1.0.7); the submitted v1.0.0 tag stays unchanged.
- Japanese and English labels contain no mixed-language leftovers.
- Subject horizontal/vertical flips act on the currently displayed rotation.
- Text B/I/U and caption-background controls render in preview and exported PNG.
- The processing overlay appears during local cutout and Work result waiting, and clears after completion, failure, or picker cancellation.
- Preview and exported PNG use the same dimensions, fit mode, layers, effects, and quality settings.
- The background generation hint identifies Codex plan usage and does not mention OpenAI API billing.

Current v1.0.1 evidence and the Google Drive installation limitation are recorded in [the UI refinement report](ja/09_UI_REFINEMENT_2026-09-30.md). The v1.0.2 Work handoff remains an experimental flow; the v1.0.5 Codex App Server cutout has completed an end-to-end run. The v1.0.6 Codex background task is implemented but awaits end-to-end app verification. v1.0.7 records image-generation tool invocation counts during Codex cutout. The before-change working source is preserved separately; do not overwrite the current checkout to restore it.

## 日本語要約

提出済み v1.0.0 は固定し、以降は機能ブランチで開発します。描画は canvasRenderer.js、初期値やプリセットは projectConfig.js、共通UIは components/ に置きます。被写体切り抜きと背景生成はユーザーが明示実行した場合だけCodex App Serverへ渡します。Soul PicsのOpenAI APIキーは使いません。変更後は必ず npm run check と上記回帰項目を確認してください。
