# Soul Pics Demo Narration — Final English AI Voice Script

Welcome to Soul Pics, a bilingual browser-based image composition app created for OpenAI Build Week.

Soul Pics lets users cut out a subject from a photograph using a natural-language prompt, place it on a background, add styled text, make final quality adjustments, and export the exact preview as a PNG image.

In this demonstration, I switch between English and Japanese, select a canvas format, upload a photograph, and describe the subject to keep. The cutout runs locally using prompt conversion, Grounding DINO, SAM 2.1, and BiRefNet. This means subject cutout does not require an OpenAI API call or an additional API charge. Optional background generation is the only paid image API feature. Placement, text editing, compositing, and final quality adjustment are processed locally.

I used Codex throughout development to translate product requirements into the React and Canvas implementation, debug image formats, aspect ratios, edge quality, and transformation behavior, and create the bilingual interface, installation guides, user guides, and submission package.

GPT-5.6 was used during development with Codex to support architectural decisions, testing strategy, API-boundary validation, and iterative refinement. This collaboration helped replace an earlier API-based cutout approach with a higher-quality local workflow while keeping external API use explicit and limited.

The result is a practical Windows-ready creative tool that turns an ordinary photograph into a shareable composition.
