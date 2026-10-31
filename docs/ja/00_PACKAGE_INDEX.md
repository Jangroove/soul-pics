# Soul Pics 資料・パッケージ案内

現行開発バージョン：v1.0.7 / 提出保存版：v1.0.0
状態：Codex App Serverを使う被写体切り抜きと背景生成を実装。切り抜きは実画像でエンドツーエンド確認済み。背景生成は実アプリでの動作確認待ち。公開・提出物は変更していない。

Soul Picsは、背景・被写体・テキストを独立レイヤーとして編集するローカル優先の画像制作アプリです。プレビューとPNG保存は同じCanvasレンダラーを使います。

## 最初に読むファイル

1. [`01_INSTALL_GUIDE.md`](01_INSTALL_GUIDE.md) — Windowsでの正確な導入・起動手順
2. [`02_USER_GUIDE.md`](02_USER_GUIDE.md) — 現在の画面と操作手順
3. [`03_PROJECT_SPEC.md`](03_PROJECT_SPEC.md) — 構成、処理境界、制約
4. [`06_CURRENT_IMPLEMENTATION_SPEC.md`](06_CURRENT_IMPLEMENTATION_SPEC.md) — 現行コードに基づく詳細実装仕様
5. [`07_UI_DESIGN_REVIEW_2026-09-30.md`](07_UI_DESIGN_REVIEW_2026-09-30.md) — 文字サイズ・はみ出し・改行の画面点検結果
6. [`08_COLOR_REVIEW_2026-09-30.md`](08_COLOR_REVIEW_2026-09-30.md) — 配色・視認性の点検とライム系の比較案
7. [`09_UI_REFINEMENT_2026-09-30.md`](09_UI_REFINEMENT_2026-09-30.md) — 今回の実装内容・検証・復元手順
8. [`../en/`](../en/) — 提出版の英語文書（v1.0.1差分は詳細仕様・実装報告を参照）

## API利用範囲

被写体切り抜き・背景生成のCodex機能は、ユーザーが明示実行した場合だけCodex App Serverへ指示を送ります。切り抜きは選択画像とプロンプト、背景生成はプロンプトとCanvas寸法を渡します。いずれもCodexプランを使い、Soul PicsのOpenAI APIキーは使いません。

## 提出保存版ZIPの内容（v1.0.0。今回再生成していない）

ソースコード、固定済みnpm情報、スクリプト、日英資料、提出・動画原稿、検証済みの本番ビルド `dist/` を含みます。`dist/` は `npm run build` で再生成でき、通常の起動はインストールガイド記載のローカル2プロセスで行います。

`.env`、APIキー、請求情報、`node_modules`、`.local-ai`、モデル本体、個人的なテスト画像、引継ぎ資料、内部作業ファイル、サーバーログは含みません。
