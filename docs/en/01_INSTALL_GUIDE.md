# Soul Pics v1.0.0 Installation Guide

## 1. Requirements

- 64-bit Windows 10 or 11
- Desktop Chrome or Edge
- Node.js 22.12.0 or newer
- Python 3.12; the `py` Python Launcher command is recommended
- NVIDIA GPU, a current driver, and a CUDA 12.8-compatible environment
- Internet access for first-time setup and several gigabytes of free disk space

Git is optional and needed only when obtaining the source from a repository. An OpenAI API key is needed only for optional background generation. Subject cutout, editing, quality adjustment, and PNG export do not require it.

## 2. Extract and install dependencies

Extract the ZIP to a writable folder, open Command Prompt, and move to the project folder.

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm ci --no-audit --no-fund
```

`npm ci` reproduces the dependency versions pinned in the included `package-lock.json`.

## 3. One-time local AI setup

```bat
npm run setup:local-ai
```

This creates a Python environment under `.local-ai` and downloads the models used for Japanese prompt conversion, Grounding DINO, SAM 2.1, and BiRefNet HR matting. It can take a while. Normal subject cutout then runs entirely on the PC and incurs no OpenAI API charge.

`.local-ai` and downloaded model caches are machine-specific and are not included in the submission ZIP. Run the setup again on each new PC.

## 4. Start Soul Pics

The easiest method is to double-click:

```text
scripts\start-soul-pics.cmd
```

For manual startup, open two Command Prompt windows and start the API server before the UI.

Command Prompt 1:

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm run server
```

Command Prompt 2:

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm run dev
```

Open `http://127.0.0.1:5173/`. The local API listens on `http://127.0.0.1:8787`. Press `Ctrl+C` in each Command Prompt window to stop the app.

## 5. Configure an API key only for background generation

```bat
copy .env.example .env
notepad .env
```

Set only the following local values:

```text
OPENAI_API_KEY=your_api_key
PORT=8787
```

Restart the API server after changing `.env`. The key is never sent to the browser and is used only when the user explicitly presses **Generate AI background**. Never place `.env` in Git, screenshots, recordings, or a submission ZIP. Soul Pics performs no automatic OpenAI calls or retries.

## 6. Verify the build

```bat
npm run build
```

The status banner reports local cutout readiness separately from optional background API readiness. Normal editing and local cutout remain available without an API key.

## 7. Troubleshooting

- `npm` not found: install Node.js 22.12.0 or newer, then reopen Command Prompt.
- Python 3.12 not found: install Python 3.12 with Python Launcher. To use an existing Python 3.12 executable, first run `set SOUL_PICS_PYTHON=C:\full\path\to\python.exe` in the same Command Prompt.
- Local AI not ready: finish `npm run setup:local-ai`, then restart `npm run server`.
- First cutout is slow: the first model load can take several minutes.
- CUDA, VRAM, or driver error: update the NVIDIA driver, free GPU memory, and restart the server.
- Cannot reach `127.0.0.1:5173`: confirm that `npm run dev` is still running.
- Cannot reach `127.0.0.1:8787`: confirm that `npm run server` is running and the port is free.
- PC fonts are unavailable: use Chrome or Edge and allow the site's **Local fonts** permission.
- Background authentication or quota error: check `.env` and the OpenAI account limit, restart the server, and do not retry until the cause is resolved.
