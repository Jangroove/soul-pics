# Soul Pics v1.0.0 インストールガイド

## 1. 対応環境

- Windows 10 / 11（64bit）
- デスクトップ版 Chrome または Edge
- Node.js 22.12.0 以上
- Python 3.12（Python Launcher の `py` コマンドを推奨）
- NVIDIA GPU、最新ドライバー、CUDA 12.8対応環境
- 初回セットアップ用のインターネット接続と数GB以上の空き容量

Gitはソース取得時のみ任意です。OpenAI APIキーは背景自動生成を使う場合だけ必要です。被写体切り抜き、編集、画質調整、PNG保存には不要です。

## 2. 展開と依存関係の導入

ZIPを任意の書き込み可能なフォルダーへ展開し、CMDでプロジェクトフォルダーへ移動します。

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm ci --no-audit --no-fund
```

`npm ci` は同梱の `package-lock.json` に固定された構成を再現します。

## 3. ローカルAIの初回セットアップ

```bat
npm run setup:local-ai
```

この処理はPython仮想環境を `.local-ai` に作成し、日本語入力の変換、Grounding DINO、SAM 2.1、BiRefNet HR mattingに必要なモデルを取得します。完了まで時間がかかる場合があります。通常の切り抜き実行はPC内で完結し、OpenAI API料金は発生しません。

`.local-ai` とモデルキャッシュは端末固有のため提出ZIPには含めません。別のPCでは初回セットアップを再実行してください。

## 4. 起動

最も簡単な方法は次のファイルをダブルクリックすることです。

```text
scripts\start-soul-pics.cmd
```

手動起動ではCMDを2つ開き、先にAPIサーバー、次に画面を起動します。

CMD 1:

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm run server
```

CMD 2:

```bat
cd /d C:\path\to\Soul_Pics_v1.0.0
npm run dev
```

ブラウザで `http://127.0.0.1:5173/` を開きます。ローカルAPIは `http://127.0.0.1:8787` で待機します。終了時は各CMDで `Ctrl+C` を押してください。

## 5. 背景自動生成を使う場合だけAPIキーを設定

```bat
copy .env.example .env
notepad .env
```

`.env` の次の値だけを設定します。

```text
OPENAI_API_KEY=自分のAPIキー
PORT=8787
```

設定後はAPIサーバーを再起動します。キーはブラウザへ渡されず、明示的に「AI背景を生成」を押したときだけサーバー側で使われます。`.env` をGit、スクリーンショット、録画、提出ZIPへ含めないでください。OpenAI APIの自動実行・自動再試行はありません。

## 6. 動作確認

```bat
npm run build
```

画面上部の状態表示では、ローカル切り抜きと任意の背景APIを別々に確認できます。APIキーがなくてもローカル切り抜きと通常編集は利用できます。

## 7. トラブルシューティング

- `npm` が見つからない：Node.js 22.12.0以上を導入し、CMDを開き直します。
- Python 3.12が見つからない：Python 3.12とPython Launcherを導入します。既存のPython 3.12を使う場合は、同じCMDで `set SOUL_PICS_PYTHON=C:\full\path\to\python.exe` を実行してからセットアップします。
- ローカルAIが未準備：`npm run setup:local-ai` を完了し、`npm run server` を再起動します。
- 初回切り抜きが遅い：モデルの初回ロードを含むため、数分かかる場合があります。
- CUDA、VRAM、ドライバー関連のエラー：NVIDIAドライバーと空きVRAMを確認し、他のGPUアプリを終了して再起動します。
- `127.0.0.1:5173` に接続できない：`npm run dev` のCMDが起動中か確認します。
- `127.0.0.1:8787` に接続できない：`npm run server` のCMDとポート競合を確認します。
- PCフォントが表示されない：ChromeまたはEdgeでサイトの「ローカル フォント」権限を許可します。
- 背景生成の認証・quotaエラー：`.env` とOpenAI側の利用枠を確認してサーバーを再起動します。確認が終わるまで再実行しないでください。
