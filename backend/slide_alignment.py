"""
Slide-by-Slide Alignment Module

This module analyzes alignment between presentation slides and spoken content.
It identifies which slides were covered, partially covered, or missed entirely.
"""

import logging
from typing import List, Dict, Any
import google.generativeai as genai
from config import settings

logger = logging.getLogger(__name__)

# Singleton Gemini model
_gemini_model = None


def get_gemini_model():
    """Initialize and return Gemini model (singleton pattern)"""
    global _gemini_model
    if _gemini_model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        logger.info(f"Gemini model initialized for slide alignment: {settings.GEMINI_MODEL}")
    return _gemini_model


def split_transcript_into_blocks(transcript_text: str, block_size: int = 3) -> List[str]:
    """
    Split transcript into smaller blocks (2-4 sentences each)
    
    Args:
        transcript_text: Full transcript
        block_size: Number of sentences per block
        
    Returns:
        List of transcript blocks
    """
    # Simple sentence splitting (. ! ?)
    import re
    sentences = re.split(r'[.!?]+', transcript_text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Group into blocks
    blocks = []
    for i in range(0, len(sentences), block_size):
        block = ' '.join(sentences[i:i + block_size])
        if block:
            blocks.append(block)
    
    return blocks


def check_alignment_for_slide(
    slide_title: str,
    slide_bullets: str,
    spoken_block: str,
    language: str = 'en'
) -> Dict[str, Any]:
    """
    Check if a spoken block aligns with a slide's content
    
    Args:
        slide_title: Slide title
        slide_bullets: Key points from slide
        spoken_block: Block of transcript text
        language: Target language ('tr' or 'en')
        
    Returns:
        Dict with alignment status and reason
        Example: {"alignment": "high", "reason": "..."}
    """
    if language == 'tr':
        prompt = f"""Sen bir sunum analiz asistanısın.

SLAYT:
Başlık: {slide_title}
Ana Noktalar: {slide_bullets}

KONUŞULAN BÖLÜM:
"{spoken_block}"

SORU: Konuşulan bölüm, bu slaydın ana fikriyle örtüşüyor mu?

SADECE JSON formatında yanıt ver:
{{
  "alignment": "high | partial | none",
  "reason": "kısa açıklama"
}}

KURALLAR:
- high = konuşulan bölüm slaydın konusunu açıkça işliyor
- partial = slaytla ilgili ama yüzeysel veya eksik
- none = tamamen farklı konu veya slayttan hiç bahsetmiyor
"""
    else:
        prompt = f"""You are a presentation analysis assistant.

SLIDE:
Title: {slide_title}
Key Points: {slide_bullets}

SPOKEN PART:
"{spoken_block}"

QUESTION: Does the spoken part align with this slide's main idea?

Answer ONLY in JSON format:
{{
  "alignment": "high | partial | none",
  "reason": "short explanation"
}}

RULES:
- high = spoken part clearly addresses the slide's topic
- partial = related to slide but superficial or incomplete
- none = completely different topic or slide not mentioned
"""
    
    try:
        model = get_gemini_model()
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,  # Low temp for consistent classification
                max_output_tokens=200,
                response_mime_type="application/json"
            )
        )
        
        import json
        result = json.loads(response.text.strip())
        
        # Validate response
        if "alignment" not in result or result["alignment"] not in ["high", "partial", "none"]:
            logger.warning(f"Invalid alignment response: {result}")
            return {"alignment": "none", "reason": "Invalid response from AI"}
        
        return result
        
    except Exception as e:
        logger.error(f"Alignment check failed: {e}")
        return {"alignment": "none", "reason": f"Error: {str(e)}"}


def determine_slide_status(alignment_results: List[Dict[str, Any]]) -> str:
    """
    Determine overall slide status based on multiple block checks
    
    Args:
        alignment_results: List of alignment results for this slide
        
    Returns:
        Status: "covered" (🟢), "partial" (🟡), "missing" (🔴)
    """
    if not alignment_results:
        return "missing"
    
    high_count = sum(1 for r in alignment_results if r.get("alignment") == "high")
    partial_count = sum(1 for r in alignment_results if r.get("alignment") == "partial")
    
    # At least 1 high match = covered
    if high_count >= 1:
        return "covered"
    
    # Only partial matches = partial
    if partial_count > 0:
        return "partial"
    
    # No matches = missing
    return "missing"


def analyze_slide_by_slide_alignment(
    slides_data: List[Dict[str, str]],
    transcript_text: str,
    language: str = 'en'
) -> List[Dict[str, Any]]:
    """
    Analyze alignment for each slide against the full transcript
    
    Args:
        slides_data: List of slides with 'title' and 'bullets' keys
        transcript_text: Full transcript text
        language: Target language
        
    Returns:
        List of slide analysis results
        
    Example:
        [
            {
                "slide_number": 1,
                "title": "Introduction",
                "status": "covered",  # covered | partial | missing
                "alignment_details": [...],
                "needs_suggestion": False
            },
            ...
        ]
    """
    logger.info(f"Analyzing {len(slides_data)} slides against transcript...")
    
    # Split transcript into blocks
    blocks = split_transcript_into_blocks(transcript_text, block_size=3)
    logger.info(f"Transcript split into {len(blocks)} blocks")
    
    results = []
    
    for idx, slide in enumerate(slides_data, start=1):
        slide_title = slide.get('title', f'Slide {idx}')
        slide_bullets = slide.get('bullets', '')
        
        logger.info(f"Analyzing Slide {idx}: {slide_title}")
        
        # Check alignment against all transcript blocks
        alignment_checks = []
        for block in blocks:
            check_result = check_alignment_for_slide(
                slide_title,
                slide_bullets,
                block,
                language
            )
            alignment_checks.append(check_result)
        
        # Determine overall status
        status = determine_slide_status(alignment_checks)
        
        # Store result
        slide_result = {
            "slide_number": idx,
            "title": slide_title,
            "bullets": slide_bullets,
            "status": status,  # covered | partial | missing
            "alignment_details": alignment_checks,
            "needs_suggestion": status in ["partial", "missing"]
        }
        
        results.append(slide_result)
        logger.info(f"Slide {idx} status: {status}")
    
    return results