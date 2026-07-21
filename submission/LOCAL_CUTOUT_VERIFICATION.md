# Local Cutout Verification — v0.7.0

Date: 2026-07-22  
Machine: NVIDIA GeForce RTX 2060, 6GB VRAM  
OpenAI API calls: 0

## Test

- Input: `IMG_7432.JPG`
- Input size: 5712×4284
- Prompt: `画像の中央に写っている赤いベースギターを切り抜いてください。`
- Local normalization: `red bass guitar`
- Position hint: `center`
- Grounding confidence: `0.9029`
- BiRefNet inference size: `2048×2048`
- Output: 5712×4284 RGBA PNG

Direct worker output and the real `POST /api/mask` response were byte-identical.

SHA-256: `4F54432EDFB4B8C27539B98BA24C29720417589DB0AC1E9A625BDBDA8E575E22`

## Image quality gate

画像: `local_app_route_v0.7.0.png`  
判定: 合格  
視覚検査: 全体、ボディ外周、ネック、ヘッド、ペグ周辺、アルファマットを白・マゼンタ背景で確認  
検出事項: 商品利用を妨げる外周ジャギーなし。黒い内部パーツの透明欠けは保護処理で解消。ペグの保護袋は残るが、事前合意の許容範囲  
構造検査: 5712×4284、RGBA、alpha 0–255、元画像と同一比率、実API経路と直接処理のSHA-256一致  
次の処置: v0.7.0の採用基準画像として使用

