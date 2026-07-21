# Soul Pics — Build Week scope (v0.7.20)

## Implemented

- React/Vite editor and one Canvas renderer for preview and PNG export.
- Independent background, subject, and text layers with local non-destructive controls.
- API-free prompt cutout using local Japanese normalization, Grounding DINO, SAM 2.1, and BiRefNet HR matting.
- Prompt-driven GPT Image 2 background generation with explicit quality selection.
- API-free final-quality adjustment.
- English/Japanese UI and documentation.

## Acceptance criteria

1. A user can upload a source image and specify the subject in Japanese or English.
2. Local cutout returns an original-size RGBA PNG without an OpenAI API call.
3. A user can upload a background or explicitly generate one through GPT Image 2.
4. Subject transforms, text editing, final adjustment, preview, and export remain local.
5. The downloaded PNG is rendered by the same Canvas code as the preview.
6. The OpenAI key stays server-side and is used only for background generation.

## Out of scope

- Accounts and cloud project sync.
- Automatic OpenAI retries or autonomous API calls.
- Manual mask painting and undo/redo.
- AI relighting or regeneration during final-quality adjustment.
