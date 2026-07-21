# Soul Pics Change Log

Versioning rule: after a minor-version milestone, each approved, meaningful application change increments the patch number by one. Historical evidence files keep the version under which they were created.

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
