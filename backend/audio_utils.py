import os
import tempfile
from pathlib import Path
from pydub import AudioSegment
import logging

logger = logging.getLogger(__name__)


def convert_webm_to_wav(input_path: str, output_path: str = None) -> str:
    """
    Convert WebM audio to WAV format using pydub (which uses FFmpeg)
    
    Args:
        input_path: Path to input WebM file
        output_path: Optional path for output WAV file
        
    Returns:
        Path to converted WAV file
        
    Raises:
        RuntimeError: If FFmpeg is not installed or conversion fails
    """
    try:
        # Create output path if not provided
        if output_path is None:
            temp_dir = tempfile.gettempdir()
            output_path = os.path.join(temp_dir, f"audio_{os.getpid()}.wav")
        
        logger.info(f"Converting {input_path} to WAV format...")
        
        # Load audio file (pydub auto-detects format)
        audio = AudioSegment.from_file(input_path)
        
        # Convert to WAV: 16kHz mono (optimal for Whisper)
        audio = audio.set_frame_rate(16000).set_channels(1)
        
        # Export as WAV
        audio.export(output_path, format="wav")
        
        logger.info(f"Conversion successful: {output_path}")
        return output_path
        
    except FileNotFoundError as e:
        if "ffmpeg" in str(e).lower() or "ffprobe" in str(e).lower():
            raise RuntimeError(
                "FFmpeg not found! Please install FFmpeg:\n"
                "Windows: choco install ffmpeg\n"
                "Or download from: https://www.gyan.dev/ffmpeg/builds/"
            )
        raise
    except Exception as e:
        logger.error(f"Audio conversion failed: {str(e)}")
        raise RuntimeError(f"Audio conversion failed: {str(e)}")


def get_audio_duration(file_path: str) -> float:
    """
    Get audio file duration in seconds
    
    Args:
        file_path: Path to audio file
        
    Returns:
        Duration in seconds
    """
    try:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000.0  # Convert milliseconds to seconds
    except Exception as e:
        logger.error(f"Failed to get audio duration: {str(e)}")
        return 0.0


def cleanup_temp_file(file_path: str) -> None:
    """
    Safely delete temporary audio file
    
    Args:
        file_path: Path to file to delete
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.debug(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {str(e)}")