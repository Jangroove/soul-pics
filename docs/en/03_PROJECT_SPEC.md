# Soul Pics — Project Specification v0.7.20

## Product

Soul Pics is a local-first React/Vite image composer using Canvas 2D for preview and PNG export. The local Express server coordinates one local-AI route and one optional OpenAI route.

## API routes

| Route | Purpose | External model |
|---|---|---|
| `/api/health` | Local server/configuration status only | None |
| `/api/mask` | Prompt-based subject cutout; returns original-size transparent PNG | Local translation + Grounding DINO + SAM 2.1 + BiRefNet |
| `/api/background` | Prompt-based background generation | GPT Image 2 `images.generate` |

Only `/api/background` calls OpenAI. `/api/mask`, upload, local composition, final-quality adjustment, and PNG export do not.

## Data handling

Normal editing keeps source images in the browser. Local cutout sends the source image only to the loopback Node/Python service. Background generation sends only its prompt and settings to OpenAI. The API key is server-side only.

## Current capabilities

- YouTube landscape, Shorts portrait, Instagram portrait, X header, profile icon, and custom canvas sizes
- Background upload, fit modes, positioning, and optional prompt generation
- Subject upload, local prompt cutout, size, position, rotation, and horizontal/vertical flip
- Multiple draggable text layers with fill, outline, shadow, bold, italic, and underline controls
- Local final-quality adjustment with recommendations and manual controls
- Shared Canvas renderer for preview and PNG export
- English/Japanese UI switch

## Limitations

Local cutout requires downloaded model weights and benefits from a CUDA-capable NVIDIA GPU. Unusual transparent, reflective, or very fine structures still require visual review. Manual mask painting, undo/redo, cloud project sync, and automatic retries are not implemented.

## Runtime and release constraints

- Windows 10/11, Node.js 22.12 or newer, Python 3.12, and an NVIDIA CUDA-capable GPU
- Initial network access and several gigabytes of disk space for local model download
- OpenAI SDK retries are disabled (`maxRetries: 0`); the app never retries a paid request automatically
- `.env`, API keys, local model caches, billing notes, and internal test assets are excluded from the submission package
