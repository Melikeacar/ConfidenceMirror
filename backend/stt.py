# backend/stt.py
from __future__ import annotations

import logging
from typing import List

import whisper  # openai-whisper

from config import WHISPER_MODEL, WHISPER_DEVICE
from models import TranscriptData, TranscriptSegment

logger = logging.getLogger(__name__)

# Global model instance (loaded once)
_whisper_model = None


def get_whisper_model():
    """Get or create Whisper model instance (singleton pattern)"""
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Loading Whisper model: {WHISPER_MODEL} on {WHISPER_DEVICE}")

        # openai-whisper device values: "cpu" or "cuda"
        device = (WHISPER_DEVICE or "cpu").lower()
        if device not in ("cpu", "cuda"):
            logger.warning(f"Unsupported WHISPER_DEVICE='{WHISPER_DEVICE}', falling back to 'cpu'")
            device = "cpu"

        _whisper_model = whisper.load_model(WHISPER_MODEL, device=device)
        logger.info("Whisper model loaded successfully")

    return _whisper_model


def transcribe_audio(audio_path: str) -> TranscriptData:
    """
    Transcribe audio file to text with timestamps (openai-whisper)

    Args:
        audio_path: Path to WAV audio file

    Returns:
        TranscriptData with full text, segments, and metadata

    Raises:
        RuntimeError: If transcription fails
    """
    try:
        model = get_whisper_model()

        logger.info(f"Transcribing audio: {audio_path}")

        # openai-whisper:
        # - fp16 Windows CPU'da çalışmaz -> fp16=False
        # - segments result["segments"] içinde gelir
        # - language result["language"] döner (auto-detect)
        result = model.transcribe(
            audio_path,
            fp16=False,
            language=None,  # auto-detect
            verbose=False,
        )

        segments: List[TranscriptSegment] = []
        full_text_parts: List[str] = []

        for seg in result.get("segments", []) or []:
            text = (seg.get("text") or "").strip()
            start = float(seg.get("start") or 0.0)
            end = float(seg.get("end") or 0.0)

            if text:
                segments.append(TranscriptSegment(start=start, end=end, text=text))
                full_text_parts.append(text)

        full_text = " ".join(full_text_parts).strip()

        # duration: son segment end (yoksa 0)
        duration = segments[-1].end if segments else 0.0
        language = result.get("language") or "unknown"

        logger.info(
            f"Transcription complete: {len(segments)} segments, "
            f"{len(full_text.split())} words, "
            f"language: {language}"
        )

        return TranscriptData(
            text=full_text,
            segments=segments,
            duration=duration,
            language=language,
        )

    except Exception as e:
        logger.exception("Transcription failed")
        raise RuntimeError(f"Speech-to-text failed: {str(e)}") from e


def get_segment_text_at_time(segments: List[TranscriptSegment], time: float) -> str:
    """
    Get the transcript segment at a specific time
    """
    for segment in segments:
        if segment.start <= time <= segment.end:
            return segment.text
    return ""
