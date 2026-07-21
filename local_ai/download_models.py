from pathlib import Path
import os

from transformers import (
    AutoModelForImageSegmentation, AutoModelForSeq2SeqLM,
    AutoModelForZeroShotObjectDetection, AutoProcessor, AutoTokenizer,
    Sam2Model, Sam2Processor,
)

CACHE = Path(os.environ.get("SOUL_PICS_MODEL_CACHE", Path(__file__).parent / "model_cache"))
CACHE.mkdir(parents=True, exist_ok=True)

print(f"Soul Pics model cache: {CACHE}")
AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-ja-en", cache_dir=CACHE)
AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-ja-en", cache_dir=CACHE)
AutoProcessor.from_pretrained("IDEA-Research/grounding-dino-tiny", cache_dir=CACHE)
AutoModelForZeroShotObjectDetection.from_pretrained("IDEA-Research/grounding-dino-tiny", cache_dir=CACHE)
Sam2Processor.from_pretrained("facebook/sam2.1-hiera-small", cache_dir=CACHE)
Sam2Model.from_pretrained("facebook/sam2.1-hiera-small", cache_dir=CACHE)
AutoModelForImageSegmentation.from_pretrained("ZhengPeng7/BiRefNet_HR-matting", trust_remote_code=True, cache_dir=CACHE)
print("Soul Pics local AI models are ready.")
