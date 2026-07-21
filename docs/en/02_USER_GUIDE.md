# Soul Pics v1.0.0 User Guide

Soul Pics is a local web app that keeps background, subject, and text as independent layers and uses the same Canvas renderer for preview and PNG export. Switch the interface with `EN / 日本語` at the top right.

## 1. Choose a canvas

Open the **Canvas/BG** tab and choose **Format**.

- YouTube thumbnail · Landscape: 1280×720
- YouTube Shorts · Vertical: 1080×1920
- Instagram post · Portrait: 1080×1440
- X profile header: 1500×500
- Social profile icon: 400×400
- Custom size: width and height from 64 to 4096 px

**Padding / transparent area color** fills areas that are not covered by the background image and transparent background pixels.

## 2. Add a background

### Upload an image

Choose **Upload background image**, then select a PNG, JPEG, or WebP file. **Background fit** can fill without distortion, show the whole image, stretch to fill, or keep actual 1:1 pixels. Drag an empty part of the preview to reposition the background.

### Generate from a prompt

Enter a description, choose Low, Mid, or High, and press **Generate AI background**. This explicit action is the only one that uses the OpenAI API and incurs a separate charge. Editing and saving the result afterward are local. Use Low for drafts and cost checks; reserve High for final candidates.

## 3. Create a subject cutout

1. Open **Subject** and upload the source image.
2. Describe what to keep in Japanese or English.
3. Press **Create local cutout**.
4. Review the result and optionally press **Save cutout**.

The app converts the prompt locally and processes it with Grounding DINO, SAM 2.1, and BiRefNet. Because every step is local, there is no additional charge. The result preserves the source resolution, aspect ratio, and RGB pixels while generating transparency. The first model load can take several minutes.

**Placement controls** provide Size, Rotation, X, Y, Flip horizontally, and Flip vertically. You can also drag the subject directly on the preview.

## 4. Add text

The **Text** tab supports multiple layers. Adjust text, font, color, size, position, Bold B, Italic I, Underline U, outline, and shadow. Each layer also has a **Text background** with color, opacity, horizontal and vertical padding, corner radius, and blur controls. Drag text directly on the preview.

**PC fonts** can list installed fonts after Chrome or Edge receives Local fonts permission. The built-in fallback list remains available without that permission.

## 5. Adjust quality

The **Quality** tab offers Weak, Standard, and Strong recommendations, plus manual controls:

- Color & tone: brightness, contrast, saturation, color temperature
- Depth & edges: background blur, edge softness, background color spill
- Texture: subject sharpness, global grain
- Shadow: distance, opacity, blur

All analysis and rendering are processed locally in this browser, so there are no additional charges. These are non-destructive Canvas 2D appearance adjustments, not physical relighting or image regeneration. **Reset to initial state** clears quality values while preserving images, placement, and text.

## 6. Save

Press **Download PNG** at the top right to export at the current canvas dimensions. Preview and export share the same Canvas renderer. Background and cutout assets can also be saved separately from their tabs before compositing.

## 7. API cost boundary

| Action | Processing | OpenAI API charge |
|---|---|---|
| Prompt-based subject cutout | Local AI on the PC | No |
| Prompt-based background generation | GPT Image 2 | Yes, explicit button only |
| Placement, text, quality, preview, PNG export | Browser | No |

There are no automatic OpenAI calls or retries. Confirm the prompt and quality before generating a background, and run only the attempts you intend to pay for.
