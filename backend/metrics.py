import re
from typing import List, Dict
from collections import Counter
import logging
from models import SpeechMetrics, FillerWord, TranscriptData
from config import settings

logger = logging.getLogger(__name__)


def calculate_wpm(word_count: int, duration_seconds: float) -> float:
    """
    Calculate words per minute
    
    Args:
        word_count: Total number of words
        duration_seconds: Duration in seconds
        
    Returns:
        Words per minute (0 if duration is 0)
    """
    if duration_seconds == 0:
        return 0.0
    return round((word_count / duration_seconds) * 60, 1)


def detect_filler_words(text: str) -> Dict[str, int]:
    """
    Detect and count filler words in text
    
    Args:
        text: Transcript text
        
    Returns:
        Dictionary of filler word counts
    """
    # Get filler words list from config
    filler_words = settings.filler_words_list
    
    # Normalize text: lowercase and preserve spaces
    text_lower = text.lower()
    
    # Count each filler word
    filler_counts = {}
    
    for filler in filler_words:
        filler_lower = filler.lower()
        
        # Use word boundaries for multi-word fillers like "you know"
        if " " in filler_lower:
            pattern = r'\b' + re.escape(filler_lower) + r'\b'
        else:
            # For single words, match whole word
            pattern = r'\b' + re.escape(filler_lower) + r'\b'
        
        count = len(re.findall(pattern, text_lower))
        
        if count > 0:
            filler_counts[filler] = count
    
    return filler_counts


def count_words(text: str) -> int:
    """
    Count words in text (excluding punctuation)
    
    Args:
        text: Input text
        
    Returns:
        Word count
    """
    # Remove punctuation and split
    words = re.findall(r'\b\w+\b', text.lower())
    return len(words)


def calculate_metrics(transcript: TranscriptData) -> SpeechMetrics:
    """
    Calculate all speech metrics from transcript
    
    Args:
        transcript: TranscriptData object
        
    Returns:
        SpeechMetrics with WPM and filler word analysis
    """
    try:
        # Count words (excluding filler words for more accurate metric)
        word_count = count_words(transcript.text)
        
        # Detect filler words
        filler_counts = detect_filler_words(transcript.text)
        total_fillers = sum(filler_counts.values())
        
        # Calculate WPM
        wpm = calculate_wpm(word_count, transcript.duration)
        
        # Convert to FillerWord objects (sorted by count, descending)
        filler_words = [
            FillerWord(word=word, count=count)
            for word, count in sorted(
                filler_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ]
        
        logger.info(
            f"Metrics calculated: {word_count} words, "
            f"{wpm} WPM, {total_fillers} fillers"
        )
        
        return SpeechMetrics(
            duration_sec=round(transcript.duration, 1),
            word_count=word_count,
            wpm=wpm,
            filler_count=total_fillers,
            filler_words=filler_words
        )
        
    except Exception as e:
        logger.error(f"Metrics calculation failed: {str(e)}")
        raise RuntimeError(f"Failed to calculate speech metrics: {str(e)}")


def analyze_speaking_pace(wpm: float) -> str:
    """
    Analyze speaking pace quality
    
    Args:
        wpm: Words per minute
        
    Returns:
        Pace description (Turkish or English based on context)
    """
    if wpm < 120:
        return "yavaş"  # slow
    elif wpm > 160:
        return "hızlı"  # fast
    else:
        return "dengeli"  # balanced