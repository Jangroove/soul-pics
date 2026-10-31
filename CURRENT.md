# Soul Pics — Current checkpoint

<img src="public/brand/soul-pics-logo.png" alt="Soul Pics official logo" width="120">

Updated: 2026-10-31
Status: v1.0.9 remains the current app version. The canonical source is the G-drive project source; the company Windows runtime copy is aligned to it. App Desk reported READY, UI and API returned HTTP 200, and the API reported sourceVersion v1.0.9. Local AI cutout remains unavailable because Python and model setup are absent; no AI job was run.

## Home acceptance — 2026-10-28

- Device: home PC. Previous runtime: legacy AppData copy. New App Desk runtime: dedicated local application folder.
- v1.0.7 source deployed with 51 matching file hashes; local npm ci and npm run check passed. UI HTTP 200, API health v1.0.7, Codex CLI detected and logged in with ChatGPT.
- Backup: local copy retained on the source workstation; user-specific path omitted from this public copy.
- No image job executed at home. New v1.0.8 runtime is deployed; App Desk launch acceptance is pending. Earlier v1.0.1 next-work notes below are historical.
- Shared root CURRENT.md/START_HERE.md now point to this version. Git remains dirty at c991d11; no commit or publication.
## Version history

- v1.0.1: unified UI typography, readable lime palette, range-label layout, contextual button labels, and responsive panel layout; no Canvas/AI algorithm change.
- v1.0.2: added a manual ChatGPT Work handoff with a local temporary exchange folder, transparent PNG watcher, and automatic subject import; no API call. End-to-end app verification is pending the missing Vite dependency.
- v1.0.3: changed the Work prompt to reference the exact local source and result paths, with no source attachment; adds explicit Work-local-folder access guidance and a visible folder path/reopen control.
- v1.0.4: added a Codex App Server task that receives the selected image and prompt, writes a transparent PNG into the exchange folder, and lets Soul Pics import it automatically. The first app-server run exposed a PATH issue, fixed in v1.0.5.
- v1.0.5: resolve the Windows Codex executable from its standard install directory if PATH does not include it. Verified a full App Server cutout and PNG result response.
- v1.0.6: replace the background OpenAI API route with a Codex App Server job. The prompt and target canvas size are sent without an input image; the returned PNG is resized/cropped to exact dimensions and imported to the background layer. End-to-end background generation remains to be tried.
- v1.0.7: count image-generation item starts from App Server notifications during Codex cutout, show the count on completion, and record event details in the temporary job folder's `codex-activity.json`.
- v1.0.9: align the UI and API version identifiers after finding that the v1.0.8 runtime's API reported `v1.0.8` while its UI still declared `v1.0.7`, disabling the Codex cutout button.
- v1.0.0: promoted the project to its first formal release and added per-text caption backgrounds with color, opacity, padding, corner radius, and local blur controls.
- v0.7.20: synchronized final guides and submission materials with the v0.7.19 UI and the assembled sub-three-minute English AI-voice demo.
- v0.7.19: localized the remaining Japanese-only labels in the English Background upload panel.
- v0.7.18: made horizontal/vertical flips mirror the currently displayed rotated subject and aligned hit-testing.
- v0.7.17: guaranteed the cutout processing overlay, fixed file-picker cancellation state, and removed stale placement-disclosure code.
- v0.7.16: removed the test-specific Japanese default Subject prompt so each UI language starts with an empty field and localized placeholder.
- v0.7.15: reconciled the final code with bilingual installation/user/specification/submission documents, pinned dependencies, and hardened release packaging.
- v0.7.14: aligned the lower edge of the B/I/U control group with the lower edge of the text-size slider.
- v0.7.13: added vertical subject flipping and text underlining; reorganized B/I/U as vertically stacked title-and-checkbox controls beside a narrower size slider.
- v0.7.12: renamed the English final-quality tab from Finish to Quality and aligned the English guide and narration terminology.
- v0.7.11: changed the copyright footer from restrained lime green to white, matching the primary Soul Pics title color.
- v0.7.10: restyled the copyright footer with a restrained lime green and matched its font size to standard explanatory copy.
- v0.7.9: rearranged subject placement controls to Size/Rotation and X/Y rows; normalized all four control sizes; kept Japanese and English labels on one line above unobscured controls.
- v0.7.8: extended the text-block heading design to Subject placement and the Color & tone, Depth & edges, Texture, and Shadow quality groups.
- v0.7.7: removed the Subject placement disclosure and made all placement controls permanently visible.
- v0.7.6: revised the bilingual final-quality local-processing notice to state clearly that no additional charges occur.
- v0.7.5: aligned the Canvas-top operation/output guidance color, size, and line height with the standard explanatory copy.
- v0.7.4: aligned the Subject local-processing explanation color, size, and line height with the final-quality explanation.
- v0.7.3: changed no-charge local-processing guidance to the normal explanation color while reserving orange for paid background generation.
- v0.7.2: revised the bilingual Subject explanation to describe local prompt conversion and Grounding DINO, SAM 2.1, and BiRefNet processing without additional charges.
- v0.7.1: repaired Japanese and English final-quality control headings so labels remain horizontal, visible, and clear of the stepper buttons.
- v0.7.0: replaced paid subject extraction with local Japanese normalization, Grounding DINO, SAM 2.1, and BiRefNet HR matting; preserved original dimensions/RGB; restricted OpenAI API use to background generation.
- v0.6.7: unified text-block hierarchy, centered all color labels, compacted crowded X/Y/spread/blur steppers, and moved outline-width/shadow-opacity labels next to their controls.
- v0.6.6: compacted the three text-style blocks into a one-screen 1080p layout while retaining the 28x30 px minus/plus controls.
- v0.6.5: reorganized text styling into Text / Outline / Shadow blocks with short contextual labels and a full-width font-size control.
- v0.6.4: replaced tiny native number spinners with explicit large minus/plus controls across all sliders and expanded the text-control layout for easier operation.

- v0.6.3: replaced the coupled text shadow size control with an independent Shadow spread / 影の広がり silhouette pass; spread no longer increases blur.

- v0.6.2: fixed text shadows by drawing an opaque text silhouette during the Canvas shadow pass before repainting the editable stroke and fill.

- v0.6.1: renamed the local recommendation button to Recommended auto adjust / おすすめ自動調整.

- v0.6.0: replaced prompt/button-based blending and paid AI lighting with non-destructive local final-quality analysis, Weak/Standard/Strong presets, visible real-time controls, and a reset that preserves assets, placement, and text.

- v0.5.2: removed the redundant local-blending checkbox so the three action buttons and reset controls determine the active blending method.
- v0.5.1: clarified the Japanese and English quality selectors as GPT Image 2 quality controls for background generation and AI lighting.
- v0.5.0: added paid GPT Image 2 whole-scene lighting while preserving the no-API local lighting path, original layers, editable text, and AI-result ON/OFF comparison.

- v0.4.4: added the background section heading, vertical upload controls, visible upload label, prompt-cutout API caution, and brighter blend guidance.
- v0.4.3: extended the selected background source panel border to cover the available display area by making the editor a flex column.
- v0.4.2: extended the selected background source panel border to cover the available display area.
- v0.4.1: expanded the left control viewport so the selected source panel can use the full available height.
- v0.4.0: started alternate exclusive background-source switcher layout with left/right controls and one expanded panel.
- v0.2.17: unified the prompt-generation and background-upload disclosure summaries so their font family, size, weight, line height, and alignment match.
- v0.2.18: unified collapsed background source button dimensions and left alignment.

## Canonical project state

- Canonical app root: `G:\マイドライブ\03_Projects\Soul Pics\Source\Soul_Pics`
- App: Vite + React frontend with local Express API server
- UI languages: English / Japanese switch
- Codex CLI: signed-in local installation used by Codex subject cutout and background generation; Soul Pics does not need an OpenAI API key for either.
- Image viewer: `.codex-image-preview/preview_viewer.html`

## Official logo

- Adopted design: centered SP monogram V11 with a subtly darker P
- Canonical SVG: `public/brand/soul-pics-logo.svg`
- Canonical PNG: `public/brand/soul-pics-logo.png`
- App icon: `public/brand/soul-pics-logo-192.png`
- Candidate source: `work/logo-candidates/soul-pics-sp-centered-p-darker10-v11.*`
- Adoption commit: `92796ec`
- Applied to the app header, favicon, Apple Touch Icon, and every current Markdown document

## Implemented application capabilities

- Canvas presets, custom size, background fit/position controls
- Uploaded or AI-generated background workflow
- Uploaded subject and API-free local prompt-cutout workflow
- Subject placement, rotation, flip, brightness, contrast, and asset saving
- Multiple draggable text layers with font, color, outline, shadow, bold, italic, and underline controls
- Local no-API final-quality analysis with Weak / Standard / Strong recommendations
- Real-time background blur, tone, temperature, edge, color-spill, sharpness, grain, and shadow controls
- Non-destructive reset that preserves original assets, placement, and text
- Processing overlay timed to actual user-to-computer work
- Preview and PNG export share the same Canvas renderer
- Responsive tab-oriented editor: desktop panels scroll internally; narrower screens use page scrolling

## Verification completed

### v1.0.1 — 2026-09-30

- `npm run check` passed on an equivalent source copy in local temporary storage; Google Drive dependency extraction failed with UNKNOWN/EBADF errors.
- 112 states: Japanese/English, 14 widths from 320px to 1920px, four panel states; no measured horizontal overflow or label/stepper/B-I-U overlap.
- Range labels and numeric inputs stay at 13px across those widths.
- Text effects, layer add/delete, upload, flips, drag, picker cancellation, quality reset, custom/portrait Canvas, and language switch passed.
- PNG bytes matched the displayed Canvas data URL in both languages. No AI operation was requested; health was mocked.
- Evidence: `work/ui-v1.0.1-verification-2026-09-30/`; detailed report: `docs/ja/09_UI_REFINEMENT_2026-09-30.md`.
- Pre-change source: `../../Archive/2026-09-30_v1.0.0_before_ui_refinement/`.

### Historical v1.0.0 verification (not rerun for this UI-only change)

- `npm run build` passes with Vite 8.1.5
- Japanese prompt normalized locally to `red bass guitar`; Grounding DINO confidence 0.9029
- Direct local processing and real `/api/mask` route produced byte-identical 5712×4284 RGBA PNGs
- Full-frame, headstock, body-edge, and alpha-matte quality gate passed; peg bags remain as an accepted limitation
- Official app logo loads at 640×640 and renders at 64×64 in the header
- Browser console has no warnings or errors in the verified initial screen
- All current Markdown files reference the official logo
- Official 640px PNG is byte-identical to the adopted V11 candidate
- UI verification image: `work/qa-official-logo-app.png`

## Next meaningful work

1. Review the v1.0.1 appearance with the user on the intended display.
2. Resolve Google Drive dependency-installation errors before claiming direct startup from G: works on this PC.
3. Preserve the v1.0.0 submission; publish or commit only when explicitly requested.

## Continuity note

Earlier logo candidates and comparison images remain under `work/logo-candidates/` as design history. Continue from the official V11 assets above; do not resume candidate exploration unless the user explicitly requests it.
