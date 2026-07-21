# Soul Pics — Submission Package Index

Version: v1.0.0
Status: production build and API-free local cutout path verified.

Soul Pics is a local-first visual composer for thumbnails and social graphics. Background, subject, and text remain separate editable layers, and preview/export share one Canvas renderer.

## Start here

1. [`01_INSTALL_GUIDE.md`](01_INSTALL_GUIDE.md) — exact Windows setup and startup
2. [`02_USER_GUIDE.md`](02_USER_GUIDE.md) — current controls and workflow
3. [`03_PROJECT_SPEC.md`](03_PROJECT_SPEC.md) — architecture, processing, and limitations
4. [`../ja/`](../ja/) — matching Japanese documents

## API boundary

OpenAI API is used only when the user explicitly generates a background with GPT Image 2. Prompt-based subject cutout runs locally with prompt conversion, Grounding DINO, SAM 2.1, and BiRefNet HR matting. Upload, placement, text, final-quality adjustment, preview, and PNG export are local and API-free. No automatic OpenAI call or retry is performed.

## Package contents

The archive includes source code, pinned npm metadata, scripts, bilingual documentation, submission/video drafts, and the verified `dist/` production build. The build can be regenerated with `npm run build`; normal startup still uses the two local processes described in the installation guide.

The archive excludes `.env`, API keys, billing notes, `node_modules`, `.local-ai`, downloaded model weights, personal test images, handoff material, temporary work files, and server logs.
