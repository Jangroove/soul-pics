# Soul Pics Change Log

Versioning rule: after a minor-version milestone, each approved, meaningful application change increments the patch number by one. Historical evidence files keep the version under which they were created.
## v1.0.9 — 2026-10-31 (company runtime acceptance; no app version change)

- Reason: record acceptance of the existing v1.0.9 source in the company Windows execution environment.
- Target: runtime copy synchronized from the canonical project source; App Desk reported READY.
- Verification: per operator report, `npm ci` completed, UI and API returned HTTP 200, and API `sourceVersion` was `v1.0.9`. Local AI cutout is unavailable because Python and model files are not configured. No AI generation or cutout operation was run.
- Verdict: application files accepted at v1.0.9; local AI readiness remains pending. This records runtime acceptance only and does not increment the app version.
- Publication sanitization: inherited workstation identifiers and user-specific paths are omitted from this copy; the G-drive canonical source is unchanged.
## v1.0.9 — 2026-10-29 (local experiment; not published)

- Keep the UI and API source versions aligned. The v1.0.8 runtime reported `v1.0.8` while the UI still declared `v1.0.7`, which disabled the Codex cutout action behind its version-match guard.
- No image-processing behavior changed.

## v1.0.8 — 2026-10-29 (local runtime path; not published)

- Store Codex work-exchange files and temporary cutout masks under the Soul Pics runtime folder's `temp` directory instead of the global Windows temp directory.
- The selected runtime deployment path is a dedicated local application folder; no model cache, environment secret file, or old job data was found in the previous runtime copy.
- The v1.0.8 source and dependency-ready runtime were copied to the selected folder; the previous legacy runtime copy remains untouched. App Desk launch acceptance was pending at that checkpoint.

## 2026-10-28 — v1.0.7 home acceptance

- 理由: 会社のCodex画像処理変更を自宅へ反映。Gソースはv1.0.7だがルート入口はv1.0.1、自宅実行コピーは旧版だった。
- 対象: 自宅App Desk既定実行先へ共有ソース51ファイルを反映。環境設定・秘密情報・モデル・生成画像は移送せず、既存ローカル設定を保持。
- バックアップ: 作業端末上のローカルバックアップを保持（個人パスは公開用コピーから省略）。
- 検証: 反映51ファイルSHA-256一致、npm ci / npm run check成功、UI5173 HTTP200、API8787 sourceVersion=v1.0.7 / background.configured=true。Codex CLI検出・ChatGPTログイン状態確認。
- 判定: 自宅ソース反映・起動受入は採用。自宅での画像生成・切り抜き本処理およびApp Desk経由の再起動は未検証。会社記録の背景生成通し未検証も継承。アプリコードの変更・版数増加・Git commit/pushはなし。
## v1.0.7 — 2026-10-28 (local experiment; not published)

- Count Codex App Server `imageGeneration` item starts during subject cutout and save their lifecycle details to `codex-activity.json` in the temporary job folder.
- Include the image-generation call count in the completion notice and cutout status response.
- This measures image-generation tool invocations, including retries exposed as separate invocations; any retries hidden inside one tool invocation are not distinguishable.

## v1.0.6 — 2026-10-28 (local experiment; not published)

- Replace API-key-based GPT Image background generation with a signed-in Codex App Server task that receives only the prompt and canvas dimensions.
- Normalize the returned PNG to the exact canvas size and load it into the existing editable background layer.
- Remove the quality selector and API-key charge warning; explain Codex CLI sign-in and Codex plan usage instead.

## v1.0.5 — 2026-10-28 (local experiment; not published)

- Resolve the installed Codex CLI executable from its standard Windows installation directory when App Desk does not include that directory in PATH.
- Fixed the initial immediate failure: the managed API process could not resolve `codex` from PATH. A retry with the same source image and prompt completed, produced a transparent PNG, and returned it from the result endpoint.

## v1.0.4 — 2026-10-28 (local experiment; not published)

- Added a Codex cutout action that sends the selected image and prompt to a new local Codex App Server task.
- Codex writes a transparent `result.png` in the per-job exchange folder; Soul Pics validates the alpha channel and imports the result automatically.
- Kept the manual ChatGPT Work path available. The Codex task uses the signed-in Codex plan and does not require the Soul Pics OpenAI API key.
- No end-to-end app-server cutout run has been performed yet.

## v1.0.3 — 2026-10-28 (local experiment; not published)

- Changed the ChatGPT Work experiment to test access to the source image by its absolute local path, with no image attachment.
- Added explicit Work-local-folder access guidance, visible folder path, and controls to reopen the folder or recopy the prompt.
- Fixed the Windows folder opener so it launches visibly.
- No OpenAI API calls are made by the experiment.

## v1.0.2 — 2026-10-28 (local experiment; not published)

- Added an experimental ChatGPT Work cutout handoff that stores the source image and a prompt-specific instruction file in a temporary per-job folder.
- Opens the folder and copies the Work instructions, then watches for a complete, decodable transparent PNG named `result.png` and imports it into the subject layer automatically.
- Keeps the existing local cutout path available; Work still requires the user to attach the source image and run the prompt manually.
- Removes exchange folders older than 24 hours. No API calls are made by this feature.

## v1.0.1 — 2026-09-30 (local development; not published)

- Preserved the pre-change v1.0.0 working source and complete Git history before implementation.
- Unified operating labels/values at 13px, supporting copy at 12px, and panel headings at 14px in a separate UI refinement stylesheet.
- Preserved the lime brand color; made selected controls pale lime and improved placeholders and disabled-control readability.
- Stacked range labels above numeric controls, shortened contextual action labels, and removed obsolete forced label breaks.
- Adapted the editor to three columns above 1240px, preview-first/two-control columns at 761–1240px, and one column below that.
- Verified 112 bilingual layout states, editing interactions, and byte-identical preview/PNG output without invoking AI operations.
- Updated the detailed implementation specification and added the implementation/verification report. The Canvas renderer and AI processing behavior are unchanged.

### Inherited post-v1.0 maintenance

- Split the shared form controls from the application component into src/components/Controls.jsx.
- Moved presets, default project state, font helpers, and UI configuration into src/projectConfig.js.
- Moved Canvas rendering, quality analysis, coordinate conversion, and hit testing into src/canvasRenderer.js.
- Reduced src/main.jsx to application state, orchestration, and page composition without changing the v1.0.0 UI or processing boundary.
- Added a post-release development guide and a repeatable verification command.

## v1.0.0 — 2026-07-22

- Promoted Soul Pics to its first formal release.
- Added per-text-layer caption backgrounds with adjustable color, opacity, horizontal and vertical padding, corner radius, and local background blur.
- Rendered the new background plate through the same Canvas pipeline used by both preview and PNG export.
- Renamed the Japanese text outline section from **線** to the clearer **縁取り**.

## v0.7.20 — 2026-07-22

- Synchronized the English user guide with the final Background upload labels introduced in v0.7.19.
- Replaced the draft demo narration with the final sub-three-minute English AI-voice script and its Japanese reference translation.
- Updated submission documentation to reflect the assembled demo and the remaining external export, YouTube, repository, and Devpost actions.

## v0.7.19 — 2026-07-22

- Removed the remaining hard-coded Japanese labels from the English Background upload panel.
- Localized the padding/transparent-area color label and background-image upload control through the shared Japanese/English copy table.

## v0.7.18 — 2026-07-22

- Changed horizontal and vertical subject flips to mirror the currently displayed, rotated subject in canvas coordinates instead of the original cutout coordinate system.
- Aligned subject hit-testing with the displayed rotation after a single-axis flip.

## v0.7.17 — 2026-07-22

- Guaranteed that the full processing overlay is painted before local subject cutout begins.
- Removed premature upload-state activation on window focus so canceling a file chooser cannot leave the processing overlay stuck.
- Removed a stale call to the deleted collapsible-placement state from the successful Subject upload path.

## v0.7.16 — 2026-07-22

- Removed the test-specific Japanese bass-guitar instruction from the Subject prompt's initial value.
- Subject prompts now start empty and show only the language-appropriate placeholder; user-entered text remains unchanged when switching UI language.

## v0.7.15 — 2026-07-22

- Reconciled the Japanese and English installation guides, user guides, specifications, package indexes, and submission documents with the final UI and processing boundary.
- Pinned runtime dependencies and documented the actual Windows, Node.js, Python, GPU, first-run download, and startup requirements.
- Made local-AI setup detect Python 3.12 through an explicit path, Python Launcher, or the `python` command, with a clear failure message.
- Hardened submission packaging so secrets, billing notes, internal work images, handoff files, logs, model caches, and duplicate legacy documents are excluded.
- Added a final package secret/content scan and regenerated release evidence.

## v0.7.14 — 2026-07-22

- Raised the B/I/U control group by 4px so its lower edge aligns precisely with the text-size slider.

## v0.7.13 — 2026-07-22

- Added vertical subject flipping alongside horizontal flipping.
- Added text underlining to the Canvas renderer and text controls.
- Reorganized B/I/U controls with each title above its checkbox and narrowed the size-slider area so all controls remain on one row.
- Updated the Japanese and English user guides and specifications.

## v0.7.12 — 2026-07-22

- Renamed the English final-quality tab from **Finish** to **Quality** for a clearer match with the Japanese `画質調整` label.
- Updated the English user guide and narration terminology to match.

## v0.7.11 — 2026-07-22

- Changed the copyright footer from restrained lime green to white, matching the primary Soul Pics title color.
- Retained the `.7rem` size established in v0.7.10.

## v0.7.10 — 2026-07-22

- Restyled the copyright footer with a restrained lime-green accent.
- Increased the footer from `.68rem` to `.7rem`, matching the standard explanatory copy.

## v0.7.9 — 2026-07-22

- Rearranged Subject placement controls to Size/Rotation on the first row and X/Y on the second row.
- Normalized all four control dimensions.
- Kept Japanese and English labels on one line above the controls so buttons cannot obscure them.

## v0.7.8 — 2026-07-22

- Extended the Text-tab block-heading design to Subject placement and all four final-quality groups.

## v0.7.7 — 2026-07-22

- Removed the collapsible Subject placement disclosure and made the controls permanently visible.

## v0.7.6 — 2026-07-22

- Revised the Japanese and English final-quality notice to state that browser-local processing has no additional charge.

## v0.7.5 — 2026-07-22

- Aligned the Canvas-top guidance color, size, and line height with standard explanatory copy.

## v0.7.4 — 2026-07-22

- Aligned the Subject local-processing explanation color, size, and line height with final-quality guidance.

## v0.7.3 — 2026-07-22

- Returned no-charge local-processing guidance to the normal explanation color.
- Reserved orange emphasis for the paid AI background-generation warning.

## v0.7.2 — 2026-07-22

- Revised the bilingual Subject explanation to describe local prompt conversion and processing by Grounding DINO, SAM 2.1, and BiRefNet.
- Clarified that the local cutout incurs no additional charge.

## v0.7.1 — 2026-07-22

- Repaired Japanese and English final-quality control-heading layout so labels stay horizontal, visible, and clear of stepper buttons.

## v0.7.0 — 2026-07-22

- Replaced paid subject extraction with local Japanese normalization, Grounding DINO, SAM 2.1, and BiRefNet HR matting.
- Preserved original image dimensions and RGB data while generating a refined alpha channel.
- Restricted OpenAI API use to explicit background generation.

Earlier version history remains in [`CURRENT.md`](CURRENT.md).
