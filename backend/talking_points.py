"""
Talking Points Generator Module

Generates professional, actionable talking points for slides that weren't
adequately covered in the presentation.
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
        logger.info(f"Gemini model initialized for talking points: {settings.GEMINI_MODEL}")
    return _gemini_model


def generate_talking_points_for_slide(
    slide_title: str,
    slide_bullets: str,
    language: str = 'en'
) -> List[str]:
    """
    Generate 2-3 suggested talking points for a slide
    
    Args:
        slide_title: Slide title
        slide_bullets: Key points from slide
        language: Target language ('tr' or 'en')
        
    Returns:
        List of 2-3 talking point suggestions (strings)
    """
    if language == 'tr':
        prompt = f"""Sen bir profesyonel sunum koçusun.

SLAYT:
Başlık: {slide_title}
Ana Noktalar: {slide_bullets}

Sunucu bu slaydı yeterince işlemedi veya hiç bahsetmedi.

GÖREV: Sunucunun bu slayt için söyleyebileceği 2-3 kısa cümle yaz.

KURALLAR:
- Profesyonel ton
- Net ve somut ol
- Öğreticilik yapma, vaaz verme
- Konuşma diline uygun
- Her cümle MAX 25 kelime

SADECE JSON formatında yanıt ver:
{{
  "talking_points": [
    "Öneri cümle 1",
    "Öneri cümle 2",
    "Öneri cümle 3"
  ]
}}
"""
    else:
        prompt = f"""You are a professional presentation coach.

SLIDE:
Title: {slide_title}
Key Points: {slide_bullets}

The speaker did NOT adequately cover this slide.

TASK: Write 2-3 short sentences the speaker could say for this slide.

RULES:
- Professional tone
- Clear and concrete
- No lecturing or preaching
- Suitable for spoken language
- Each sentence MAX 25 words

Answer ONLY in JSON format:
{{
  "talking_points": [
    "Suggested sentence 1",
    "Suggested sentence 2",
    "Suggested sentence 3"
  ]
}}
"""
    
    try:
        model = get_gemini_model()
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.5,  # Medium creativity
                max_output_tokens=500,
                response_mime_type="application/json"
            )
        )
        
        import json
        result = json.loads(response.text.strip())
        
        talking_points = result.get("talking_points", [])
        
        # Validate and limit to 3
        if not talking_points or len(talking_points) < 2:
            logger.warning(f"Invalid talking points response: {result}")
            return [
                "Focus on the key message of this slide.",
                "Explain why this topic matters to your audience.",
                "Connect this point to your overall presentation theme."
            ] if language == 'en' else [
                "Bu slaydın ana mesajına odaklanın.",
                "Bu konunun neden önemli olduğunu açıklayın.",
                "Bu noktayı genel sunum temanızla ilişkilendirin."
            ]
        
        return talking_points[:3]  # Max 3 points
        
    except Exception as e:
        logger.error(f"Talking points generation failed: {e}")
        # Fallback generic points
        return [
            "Address the main topic clearly and concisely.",
            "Provide specific examples or evidence.",
            "Explain the relevance to your audience."
        ] if language == 'en' else [
            "Ana konuyu net ve öz bir şekilde ele alın.",
            "Spesifik örnekler veya kanıtlar sunun.",
            "Dinleyicileriniz için önemini açıklayın."
        ]


def generate_talking_points_batch(
    slides_analysis: List[Dict[str, Any]],
    language: str = 'en'
) -> List[Dict[str, Any]]:
    """
    Generate talking points for all slides that need suggestions
    
    Args:
        slides_analysis: Results from analyze_slide_by_slide_alignment()
        language: Target language
        
    Returns:
        Enhanced slides_analysis with talking_points added
    """
    logger.info("Generating talking points for slides needing suggestions...")
    
    enhanced_results = []
    
    for slide in slides_analysis:
        # Only generate for partial/missing slides
        if slide.get("needs_suggestion", False):
            logger.info(f"Generating talking points for Slide {slide['slide_number']}: {slide['title']}")
            
            talking_points = generate_talking_points_for_slide(
                slide['title'],
                slide['bullets'],
                language
            )
            
            slide['talking_points'] = talking_points
        else:
            slide['talking_points'] = []
        
        enhanced_results.append(slide)
    
    logger.info("Talking points generation complete")
    return enhanced_results