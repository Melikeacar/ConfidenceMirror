import google.generativeai as genai
from models import Feedback, FeedbackTip
import json
import logging
import time
from typing import Dict, Any
from google.api_core import exceptions
from models import (
    TranscriptData, 
    SpeechMetrics, 
    AlignmentResult, 
    Feedback, 
    FeedbackTip
)
from config import settings

logger = logging.getLogger(__name__)

# Global Gemini model instance
_gemini_model = None


def get_gemini_model():
    """Initialize and return Gemini model (singleton pattern)"""
    global _gemini_model
    if _gemini_model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        logger.info(f"Gemini model initialized: {settings.GEMINI_MODEL}")
    return _gemini_model


def detect_language(outline_text: str, transcript_text: str) -> str:
    """
    Detect language from outline or transcript
    
    Args:
        outline_text: Presentation outline
        transcript_text: Transcript text
        
    Returns:
        Language code ('tr' or 'en')
    """
    # Simple heuristic: check for Turkish characters
    combined_text = (outline_text + " " + transcript_text).lower()
    
    turkish_chars = ['ğ', 'ü', 'ş', 'ı', 'ö', 'ç']
    turkish_words = ['ve', 'bir', 'bu', 'için', 'ile', 'var', 'olan']
    
    # Check for Turkish-specific characters
    has_turkish_chars = any(char in combined_text for char in turkish_chars)
    
    # Check for common Turkish words
    has_turkish_words = any(word in combined_text.split() for word in turkish_words)
    
    if has_turkish_chars or has_turkish_words:
        return 'tr'
    return 'en'


def build_feedback_prompt(
    outline_text: str,
    transcript: TranscriptData,
    metrics: SpeechMetrics,
    alignment: AlignmentResult,
    language: str
) -> str:
    """
    Build structured prompt for Gemini API
    
    Args:
        outline_text: Presentation outline
        transcript: Transcript data
        metrics: Speech metrics
        alignment: Alignment results
        language: Target language ('tr' or 'en')
        
    Returns:
        Formatted prompt string
    """
    # Language-specific prompts
    if language == 'tr':
        system_instruction = """Sen bir sunum koçusun. Görün: yapıcı, somut ve destekleyici geri bildirim vermek.

KURALLAR:
1. Kesinlikle JSON formatında yanıt ver (başka hiçbir metin ekleme)
2. Psikolojik teşhis koyma, terapi yapma
3. Her madde MAX 1 cümle olsun
4. Somut ve eyleme dönük ol
5. Yargılama, küçümseme yapma"""
        
        json_format = """{
  "strengths": [
    "Güçlü yön 1 (kanıt ile)",
    "Güçlü yön 2",
    "Güçlü yön 3"
  ],
  "improvements": [
    "İyileştirme 1 (nasıl yapacağı ile)",
    "İyileştirme 2",
    "İyileştirme 3"
  ],
  "tips": [
    {"section": "Giriş", "tip": "Spesifik öneri"},
    {"section": "Ana Kısım", "tip": "Spesifik öneri"},
    {"section": "Genel", "tip": "Genel öneri"}
  ]
}"""
    else:
        system_instruction = """You are a presentation coach. Your role: provide constructive, specific, and supportive feedback.

RULES:
1. Respond ONLY in JSON format (no other text)
2. No psychological diagnosis or therapy
3. Each point MAX 1 sentence
4. Be specific and actionable
5. No judgment or condescension"""
        
        json_format = """{
  "strengths": [
    "Strength 1 (with evidence)",
    "Strength 2",
    "Strength 3"
  ],
  "improvements": [
    "Improvement 1 (with how-to)",
    "Improvement 2",
    "Improvement 3"
  ],
  "tips": [
    {"section": "Introduction", "tip": "Specific suggestion"},
    {"section": "Main Part", "tip": "Specific suggestion"},
    {"section": "General", "tip": "General suggestion"}
  ]
}"""
    
    # Build data summary
    off_topic_count = len(alignment.off_topic_segments)
    off_topic_examples = []
    if off_topic_count > 0:
        off_topic_examples = [
            f"- Segment {item.segment_idx + 1}: '{item.segment_text[:50]}...'"
            for item in alignment.off_topic_segments[:3]
        ]
    
    filler_summary = ", ".join([
        f"{fw.word} ({fw.count}x)"
        for fw in metrics.filler_words[:5]
    ]) if metrics.filler_words else "Yok / None"
    
    prompt = f"""{system_instruction}

{"SUNUM METNİ (Outline):" if language == 'tr' else "PRESENTATION OUTLINE:"}
{outline_text}

{"KONUŞULAN METİN (Transcript):" if language == 'tr' else "SPOKEN TEXT (Transcript):"}
{transcript.text}

{"METRİKLER:" if language == 'tr' else "METRICS:"}
- {"Konuşma hızı" if language == 'tr' else "Speaking pace"}: {metrics.wpm} {"kelime/dakika" if language == 'tr' else "words/min"}
- {"Dolgu kelimeleri" if language == 'tr' else "Filler words"}: {metrics.filler_count} {"adet" if language == 'tr' else "total"} ({filler_summary})
- {"Konu dışı segmentler" if language == 'tr' else "Off-topic segments"}: {off_topic_count} {"adet" if language == 'tr' else "total"}

{f"{'KONU DIŞI ÖRNEKLER:' if language == 'tr' else 'OFF-TOPIC EXAMPLES:'}" if off_topic_examples else ""}
{chr(10).join(off_topic_examples) if off_topic_examples else ""}

{"ZORUNLU FORMAT (sadece bu JSON'u dön, başka hiçbir şey ekleme):" if language == 'tr' else "REQUIRED FORMAT (return ONLY this JSON, nothing else):"}
{json_format}"""
    
    return prompt


def generate_feedback(
    outline_text: str,
    transcript: TranscriptData,
    metrics: SpeechMetrics,
    alignment: AlignmentResult
) -> Feedback:
    """
    Generate structured feedback using Gemini API
    
    Args:
        outline_text: Presentation outline
        transcript: Transcript data
        metrics: Speech metrics
        alignment: Alignment results
        
    Returns:
        Feedback object with strengths, improvements, and tips
        
    Raises:
        RuntimeError: If API call fails or response is invalid
    """
    try:
        # Detect language
        language = detect_language(outline_text, transcript.text)
        logger.info(f"Detected language: {language}")
        
        # Build prompt
        prompt = build_feedback_prompt(
            outline_text, 
            transcript, 
            metrics, 
            alignment, 
            language
        )
        
        logger.info("Generating feedback with Gemini API...")
        
        # Call Gemini API with retry logic
        model = get_gemini_model()
        
        max_retries = 3
        retry_delay = 5  # Start with 5 seconds
        
        response = None
        for attempt in range(max_retries):
            try:
                response = model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=8192,
                        response_mime_type="application/json",
                    )
                )
                break  # Success, exit loop
                
            except exceptions.ResourceExhausted as e:
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (2 ** attempt)  # 5, 10, 20 seconds
                    logger.warning(f"Quota exceeded (429). Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    logger.error("Max retries exceeded for Gemini API.")
                    raise e
                    
        if not response:
            raise RuntimeError("Failed to get response from Gemini API after retries")
        
        # Extract response text
        response_text = response.text.strip()
        
        # Parse JSON
        feedback_data = json.loads(response_text)
        
        # Validate structure
        if not all(key in feedback_data for key in ['strengths', 'improvements', 'tips']):
            raise ValueError("Missing required fields in LLM response")
        
        # Convert to Feedback model
        tips = [
            FeedbackTip(section=tip['section'], tip=tip['tip'])
            for tip in feedback_data['tips']
        ]
        
        ethical_note = (
            "Bu bir sunum geri bildirim aracıdır. Psikolojik değerlendirme değildir."
            if language == 'tr'
            else "This is a presentation feedback tool. Not a psychological evaluation."
        )
        
        feedback = Feedback(
            strengths=feedback_data['strengths'][:3],
            improvements=feedback_data['improvements'][:3],
            tips=tips[:3],
            ethical_note=ethical_note
        )
        
        logger.info("Feedback generated successfully")
        return feedback
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        logger.error(f"Response was: {response_text}")
        raise RuntimeError("LLM returned invalid JSON format")
    
    except Exception as e:
        logger.error(f"Feedback generation failed: {str(e)}")
        raise RuntimeError(f"Failed to generate feedback: {str(e)}")