# Third-party local AI models

Soul Pics downloads these model repositories during `npm run setup:local-ai`. Model weights are not included in the source ZIP.

| Model | Role | Upstream |
|---|---|---|
| Helsinki-NLP/opus-mt-ja-en | Local Japanese-to-English normalization | https://huggingface.co/Helsinki-NLP/opus-mt-ja-en |
| IDEA-Research/grounding-dino-tiny | Open-vocabulary object detection | https://huggingface.co/IDEA-Research/grounding-dino-tiny |
| facebook/sam2.1-hiera-small | Box-guided subject segmentation | https://huggingface.co/facebook/sam2.1-hiera-small |
| ZhengPeng7/BiRefNet_HR-matting | High-resolution alpha refinement | https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting |

Review the license metadata and model cards at the linked upstream repositories before redistribution. The setup script downloads weights directly from their publishers; Soul Pics does not relicense or embed them.

