# Soul Pics — Submission Summary

## One-line description

Soul Pics lets users say what to keep, place it anywhere, and add the words that make it theirs.

## Problem

General image generation can change a subject or composition when a user only wants to adjust a background or layout. Soul Pics separates AI-assisted asset creation from local, non-destructive composition.

## What is implemented

The app supports independent background, subject, and text layers; API-free local prompt cutout; optional prompt-based background generation; local final-quality adjustment; responsive editing; bilingual UI; and matching Canvas preview/PNG export.

## API and cost disclosure

OpenAI API is used only for the explicit prompt-based background generation action. Subject cutout uses local Japanese normalization, Grounding DINO, SAM 2.1, and BiRefNet HR matting. Final-quality adjustment, normal editing, preview, and export are also local and API-free. No automatic OpenAI calls or retries are performed.

## Current verification

- Locked dependency metadata: Node.js 22.12+ and Vite 8.1.5
- `npm run build`: passed with Vite 8.1.5
- Local cutout direct path and actual `/api/mask` route: passed on a 5712×4284 Japanese-prompt test
- Paid background-generation test: optional and pending an explicit release-test decision
- Demo video: exported at 2:35 with English AI voice covering the product, Codex, and GPT-5.6; uploaded publicly to https://youtu.be/pDBDTgWetPk. End-to-end playback review and Devpost URL entry remain external submission actions.

## Translation disclosure

This video and its accompanying materials were originally created in Japanese. The English translation and language polishing were assisted by ChatGPT and reviewed by the creator. Minor differences in wording may remain; the product demo, specifications, and source code are authoritative.
