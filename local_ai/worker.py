from __future__ import annotations

import gc
import json
import os
import re
import sys
import traceback
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from transformers import (
    AutoModelForImageSegmentation,
    AutoModelForSeq2SeqLM,
    AutoModelForZeroShotObjectDetection,
    AutoProcessor,
    AutoTokenizer,
    Sam2Model,
    Sam2Processor,
)


SOURCE_VERSION = "v1.0.0"
TRANSLATION_MODEL = "Helsinki-NLP/opus-mt-ja-en"
GROUNDING_MODEL = "IDEA-Research/grounding-dino-tiny"
SAM_MODEL = "facebook/sam2.1-hiera-small"
BIREF_MODEL = "ZhengPeng7/BiRefNet_HR-matting"
CACHE = Path(os.environ.get("SOUL_PICS_MODEL_CACHE", Path(__file__).parent / "model_cache"))
CACHE.mkdir(parents=True, exist_ok=True)


def log(message: str) -> None:
    print(f"[Soul Pics local AI] {message}", file=sys.stderr, flush=True)


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def release_cuda() -> None:
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def fill_small_enclosed_holes(mask: np.ndarray, max_area: int) -> np.ndarray:
    foreground = (mask > 0).astype(np.uint8)
    inverse = 1 - foreground
    count, labels, stats, _ = cv2.connectedComponentsWithStats(inverse, connectivity=8)
    height, width = foreground.shape
    filled = foreground.copy()
    for index in range(1, count):
        x, y, component_width, component_height, area = stats[index]
        touches_border = x == 0 or y == 0 or x + component_width == width or y + component_height == height
        if not touches_border and area <= max_area:
            filled[labels == index] = 1
    return filled * 255


def has_japanese(text: str) -> bool:
    return bool(re.search(r"[\u3040-\u30ff\u3400-\u9fff]", text))


def spatial_hint(text: str) -> str:
    value = text.lower()
    rules = (
        ("top_left", ("左上", "upper left", "top left")),
        ("top_right", ("右上", "upper right", "top right")),
        ("bottom_left", ("左下", "lower left", "bottom left")),
        ("bottom_right", ("右下", "lower right", "bottom right")),
        ("center", ("中央", "真ん中", "center", "middle")),
        ("left", ("左側", "左の", "left")),
        ("right", ("右側", "右の", "right")),
        ("top", ("上側", "上部", "top", "upper")),
        ("bottom", ("下側", "下部", "bottom", "lower")),
    )
    for name, words in rules:
        if any(word in value for word in words):
            return name
    return "auto"


def strip_japanese_instruction(text: str) -> str:
    value = text.strip()
    patterns = (
        r"画像の?", r"写真の?", r"中央に写っている", r"中央にある", r"中央の",
        r"左側に写っている", r"右側に写っている", r"左側の", r"右側の",
        r"だけを?残して(?:ください)?", r"だけを?切り抜いて(?:ください)?",
        r"を?切り抜いて(?:ください)?", r"を?切り抜く", r"を?抽出して(?:ください)?",
        r"それ以外は?透過(?:にして(?:ください)?)?", r"背景を?削除して(?:ください)?",
        r"背景を?透明にして(?:ください)?", r"お願いします", r"ください",
    )
    for pattern in patterns:
        value = re.sub(pattern, " ", value)
    return re.sub(r"\s+", " ", value).strip(" 。、,.　") or text.strip()


def clean_english_label(text: str) -> str:
    value = text.lower().strip()
    patterns = (
        r"\bplease\b", r"\bcut out\b", r"\bextract\b", r"\bkeep only\b",
        r"\bremove the background\b", r"\bmake the background transparent\b",
        r"\bfrom (?:the|this) (?:image|photo|picture)\b", r"\bin (?:the|this) (?:image|photo|picture)\b",
        r"\bshown\b", r"\blocated\b", r"\bthat is\b", r"\bwhich is\b",
        r"\bin the center\b", r"\bat the center\b", r"\bon the left(?: side)?\b",
        r"\bon the right(?: side)?\b", r"\bthank you\b",
    )
    for pattern in patterns:
        value = re.sub(pattern, " ", value)
    value = re.sub(r"[^a-z0-9' -]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip(" -.,")
    return value[:180]


class LocalCutoutEngine:
    def __init__(self) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.translation_tokenizer = None
        self.translation_model = None
        self.grounding_processor = None
        self.grounding_model = None
        self.sam_processor = None
        self.sam_model = None
        self.biref_model = None
        log(f"worker ready; device={self.device}; cache={CACHE}")

    def ensure_translation(self) -> None:
        if self.translation_model is not None:
            return
        log(f"loading translation model {TRANSLATION_MODEL} on CPU")
        self.translation_tokenizer = AutoTokenizer.from_pretrained(TRANSLATION_MODEL, cache_dir=CACHE)
        self.translation_model = AutoModelForSeq2SeqLM.from_pretrained(TRANSLATION_MODEL, cache_dir=CACHE)
        self.translation_model.eval().to("cpu")

    def translate_label(self, prompt: str) -> tuple[str, str, bool]:
        position = spatial_hint(prompt)
        if not has_japanese(prompt):
            label = clean_english_label(prompt) or prompt.strip()
            return label, position, False
        source = strip_japanese_instruction(prompt)
        self.ensure_translation()
        inputs = self.translation_tokenizer(source, return_tensors="pt", truncation=True, max_length=256)
        with torch.inference_mode():
            generated = self.translation_model.generate(**inputs, max_new_tokens=80, num_beams=4)
        translated = self.translation_tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
        label = clean_english_label(translated) or translated.strip()
        log(f"prompt normalized: {prompt!r} -> {label!r}; position={position}")
        return label, position, True

    def ensure_grounding(self) -> None:
        if self.grounding_model is not None:
            return
        log(f"loading {GROUNDING_MODEL} on CPU")
        self.grounding_processor = AutoProcessor.from_pretrained(GROUNDING_MODEL, cache_dir=CACHE)
        self.grounding_model = AutoModelForZeroShotObjectDetection.from_pretrained(GROUNDING_MODEL, cache_dir=CACHE)
        self.grounding_model.eval().to("cpu")

    @staticmethod
    def location_score(boxes: np.ndarray, image_size: tuple[int, int], position: str) -> np.ndarray:
        width, height = image_size
        cx = (boxes[:, 0] + boxes[:, 2]) / (2 * width)
        cy = (boxes[:, 1] + boxes[:, 3]) / (2 * height)
        targets = {
            "center": (0.5, 0.5), "left": (0.2, 0.5), "right": (0.8, 0.5),
            "top": (0.5, 0.2), "bottom": (0.5, 0.8),
            "top_left": (0.2, 0.2), "top_right": (0.8, 0.2),
            "bottom_left": (0.2, 0.8), "bottom_right": (0.8, 0.8),
        }
        if position not in targets:
            return np.ones(len(boxes), dtype=np.float32)
        tx, ty = targets[position]
        distance = np.sqrt((cx - tx) ** 2 + (cy - ty) ** 2)
        return np.clip(1.35 - distance, 0.35, 1.35).astype(np.float32)

    def detect(self, image: Image.Image, label: str, position: str) -> tuple[np.ndarray, float, str]:
        self.ensure_grounding()
        model = self.grounding_model.to(self.device)
        inputs = self.grounding_processor(images=image, text=[[label]], return_tensors="pt").to(self.device)
        with torch.inference_mode():
            outputs = model(**inputs)
        result = self.grounding_processor.post_process_grounded_object_detection(
            outputs, inputs.input_ids, threshold=0.20, text_threshold=0.18, target_sizes=[image.size[::-1]]
        )[0]
        if len(result["boxes"]) == 0:
            model.to("cpu")
            release_cuda()
            raise RuntimeError(f"No subject matched the normalized label: {label}")
        boxes = result["boxes"].detach().cpu().numpy().astype(np.float32)
        scores = result["scores"].detach().cpu().numpy().astype(np.float32)
        areas = np.maximum(1.0, (boxes[:, 2] - boxes[:, 0]) * (boxes[:, 3] - boxes[:, 1]))
        rank = scores * np.sqrt(areas) * self.location_score(boxes, image.size, position)
        index = int(np.argmax(rank))
        text_labels = result.get("text_labels")
        detected_label = str(text_labels[index]) if text_labels is not None else label
        box = boxes[index]
        score = float(scores[index])
        log(f"detected {detected_label!r}; confidence={score:.3f}; box={box.round(1).tolist()}")
        model.to("cpu")
        del inputs, outputs, result
        release_cuda()
        return box, score, detected_label

    def ensure_sam(self) -> None:
        if self.sam_model is not None:
            return
        log(f"loading {SAM_MODEL} on CPU")
        self.sam_processor = Sam2Processor.from_pretrained(SAM_MODEL, cache_dir=CACHE)
        self.sam_model = Sam2Model.from_pretrained(SAM_MODEL, cache_dir=CACHE)
        self.sam_model.eval().to("cpu")

    def segment(self, image: Image.Image, box: np.ndarray) -> np.ndarray:
        self.ensure_sam()
        model = self.sam_model.to(self.device)
        inputs = self.sam_processor(images=image, input_boxes=[[box.tolist()]], return_tensors="pt").to(self.device)
        with torch.inference_mode():
            outputs = model(**inputs, multimask_output=False)
        masks = self.sam_processor.post_process_masks(outputs.pred_masks.cpu(), inputs["original_sizes"])[0]
        mask = masks[0, 0].numpy().astype(np.float32)
        if mask.min() < 0 or mask.max() > 1:
            mask = 1.0 / (1.0 + np.exp(-mask))
        model.to("cpu")
        del inputs, outputs, masks
        release_cuda()
        return np.clip(mask, 0.0, 1.0)

    def ensure_biref(self) -> None:
        if self.biref_model is not None:
            return
        log(f"loading {BIREF_MODEL} on CPU")
        self.biref_model = AutoModelForImageSegmentation.from_pretrained(
            BIREF_MODEL, trust_remote_code=True, cache_dir=CACHE
        )
        self.biref_model.eval().half().to("cpu")

    def matte(self, image: Image.Image) -> tuple[np.ndarray, int]:
        self.ensure_biref()
        model = self.biref_model.to(self.device)
        last_error = None
        for size in (2048, 1536, 1024):
            transform = transforms.Compose([
                transforms.Resize((size, size)), transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
            tensor = transform(image).unsqueeze(0).to(self.device)
            if self.device.type == "cuda":
                tensor = tensor.half()
            try:
                log(f"BiRefNet inference at {size}x{size}")
                with torch.inference_mode():
                    pred = model(tensor)[-1].sigmoid().float().cpu()[0, 0].numpy()
                matte = cv2.resize(pred, image.size, interpolation=cv2.INTER_CUBIC)
                model.to("cpu")
                del tensor, pred
                release_cuda()
                return np.clip(matte, 0.0, 1.0), size
            except torch.OutOfMemoryError as error:
                last_error = error
                del tensor
                release_cuda()
                log(f"VRAM insufficient at {size}; retrying smaller")
        model.to("cpu")
        release_cuda()
        raise RuntimeError("BiRefNet could not run within available GPU memory") from last_error

    def process(self, input_path: str, output_path: str, prompt: str) -> dict:
        image = Image.open(input_path).convert("RGB")
        rgb = np.asarray(image).copy()
        label, position, translated = self.translate_label(prompt)
        if len(label) < 2:
            raise ValueError("The prompt did not contain a recognizable subject")
        box, confidence, detected_label = self.detect(image, label, position)
        sam_mask = self.segment(image, box)
        biref_mask, biref_size = self.matte(image)
        height, width = sam_mask.shape
        radius = max(3, round(max(height, width) * 0.0015))
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius * 2 + 1, radius * 2 + 1))
        sam_binary = (sam_mask >= 0.5).astype(np.uint8) * 255
        sam_gate = cv2.dilate(sam_binary, kernel).astype(np.float32) / 255.0
        sam_gate = cv2.GaussianBlur(sam_gate, (0, 0), sigmaX=max(1.0, radius / 2))
        foreground_seed = ((biref_mask >= 0.50) | (sam_mask >= 0.50)).astype(np.uint8) * 255
        foreground_seed = fill_small_enclosed_holes(foreground_seed, max_area=round(height * width * 0.002))
        inner_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (radius * 4 + 1, radius * 4 + 1))
        protected_interior = cv2.erode(foreground_seed, inner_kernel).astype(np.float32) / 255.0
        alpha = np.clip(np.maximum(biref_mask * sam_gate, protected_interior), 0.0, 1.0)
        rgba = np.dstack((rgb, np.clip(alpha * 255.0, 0, 255).astype(np.uint8)))
        Image.fromarray(rgba, "RGBA").save(output_path)
        return {
            "normalizedPrompt": label, "position": position, "translatedLocally": translated,
            "detectedLabel": detected_label, "confidence": round(confidence, 4),
            "width": image.width, "height": image.height, "birefInferenceSize": biref_size,
            "device": str(self.device),
        }


def main() -> None:
    engine = LocalCutoutEngine()
    emit({"type": "ready", "version": SOURCE_VERSION, "device": str(engine.device)})
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            action = request.get("action")
            if action == "health":
                result = {"device": str(engine.device), "cuda": torch.cuda.is_available(), "version": SOURCE_VERSION}
            elif action == "mask":
                result = engine.process(request["inputPath"], request["outputPath"], request["prompt"])
            else:
                raise ValueError(f"Unknown worker action: {action}")
            emit({"id": request_id, "ok": True, "result": result})
        except Exception as error:
            traceback.print_exc(file=sys.stderr)
            emit({"id": request_id, "ok": False, "error": str(error), "errorType": type(error).__name__})


if __name__ == "__main__":
    os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
    main()
