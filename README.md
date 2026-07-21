# Soul Pics v0.7.20

![Soul Pics — OpenAI Build Week thumbnail](submission/Soul_Pics_Devpost_Thumbnail.png)

<img src="public/brand/soul-pics-logo.png" alt="Soul Pics official logo" width="120">

**Say what to keep. Place it anywhere. Add the words that make it yours.**

Soul Pics is a local-first image composer for posters, social assets, and thumbnails. Backgrounds, subjects, and text stay as independent layers, and preview/export share one Canvas renderer.

## What changed in v0.7.1-v0.7.20

- Refined bilingual explanatory copy and made local/no-charge versus paid/API guidance visually distinct.
- Standardized explanatory text color, size, and line height across the Subject, Canvas, and final-quality areas.
- Made Subject placement controls permanently visible and reorganized them into Size/Rotation and X/Y rows.
- Unified block-heading design across Text, Subject placement, and all final-quality groups.
- Normalized placement control dimensions and prevented Japanese and English labels from wrapping or colliding with buttons.
- Aligned the copyright footer size with explanatory copy and finalized its color as white to match the Soul Pics title.
- Renamed the English final-quality tab from **Finish** to the clearer **Quality**.
- Added vertical subject flipping and text underlining, with compact B/I/U controls aligned beside the size slider.
- Matched the B/I/U control-group lower edge precisely to the text-size slider.
- Reconciled the bilingual installation, user, specification, and submission documents with the final UI and hardened the submission ZIP contents.
- Removed the test-specific default cutout prompt so each UI language starts cleanly with its localized placeholder.
- Fixed processing-overlay timing and file-picker cancellation cleanup before final recording.
- Made horizontal and vertical flips mirror the currently displayed rotated subject.
- Removed the final hard-coded Japanese labels from the English Background upload panel.

See [`CHANGELOG.md`](CHANGELOG.md) for the recovered per-change version history.

日本語の導入手順は [`docs/ja/00_PACKAGE_INDEX.md`](docs/ja/00_PACKAGE_INDEX.md) から始めてください。

## What is new in v0.7.0

- Prompt-based subject cutout now runs locally with Japanese-to-English normalization, Grounding DINO, SAM 2.1, and BiRefNet HR matting.
- The cutout preserves the source dimensions, aspect ratio, and RGB pixels while generating a refined alpha channel.
- OpenAI API use is limited to the explicit **Generate AI background** action.
- Final-quality adjustment, normal editing, cutout, preview, and PNG export are API-free.
- Local models are downloaded during setup and loaded offline during normal use.

## Windows setup

```bat
cd /d C:\path\to\Soul_Pics_v0.7.20
npm ci --no-audit --no-fund
npm run setup:local-ai
```

The local AI setup requires Python 3.12, an NVIDIA GPU with a current driver, internet access for the initial model download, and several gigabytes of free disk space.

To enable optional background generation only:

```bat
copy .env.example .env
notepad .env
```

Set `OPENAI_API_KEY` in `.env`. Never include `.env` in source control, screenshots, recordings, or a submission ZIP.

## Run

Double-click `scripts\start-soul-pics.cmd`, or open two terminals in the project folder:

```bat
npm run server
```

```bat
npm run dev
```

Open the Vite URL, normally `http://127.0.0.1:5173/`.

## AI and cost boundary

| Action | Processing | OpenAI API |
|---|---|---|
| Prompt subject cutout | Local translation + Grounding DINO + SAM 2.1 + BiRefNet | No |
| Prompt background generation | GPT Image 2 | Yes, explicit click only |
| Placement, text, final adjustment, export | Browser / Canvas 2D | No |

There are no automatic OpenAI calls or automatic retries.

## Verify

```bat
npm run build
```

Model licenses and attribution links are listed in [`THIRD_PARTY_MODELS.md`](THIRD_PARTY_MODELS.md).

## License

Soul Pics source code is released under the [MIT License](LICENSE). Third-party models and dependencies remain subject to their respective licenses; see [`THIRD_PARTY_MODELS.md`](THIRD_PARTY_MODELS.md).

## Build Week submission links

- Public source repository: https://github.com/Jangroove/soul-pics
- Public 2:35 YouTube demo with English audio: https://youtu.be/pDBDTgWetPk
- Judge test path: clone this repository and follow `docs/en/01_INSTALL_GUIDE.md`
- Primary Codex Session ID: `019f753f-dc7e-7a10-b2f6-61f2fa4d3f07`
- The Devpost thumbnail was composed and exported in Soul Pics itself.
