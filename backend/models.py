from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class TranscriptSegment(BaseModel):
    """Single segment of transcribed speech"""
    start: float = Field(description="Start time in seconds")
    end: float = Field(description="End time in seconds")
    text: str = Field(description="Transcribed text")


class TranscriptData(BaseModel):
    """Complete transcription result"""
    text: str = Field(description="Full transcript")
    segments: List[TranscriptSegment] = Field(description="Time-stamped segments")
    duration: float = Field(description="Total duration in seconds")
    language: str = Field(description="Detected language")


class FillerWord(BaseModel):
    """Filler word occurrence"""
    word: str
    count: int


class SpeechMetrics(BaseModel):
    """Speech analysis metrics"""
    duration_sec: float
    word_count: int
    wpm: float = Field(description="Words per minute")
    filler_count: int
    filler_words: List[FillerWord]


class AlignmentItem(BaseModel):
    """Alignment between transcript segment and outline"""
    segment_idx: int
    segment_text: str
    best_match: str
    similarity_score: float


class AlignmentResult(BaseModel):
    """Complete alignment analysis"""
    items: List[AlignmentItem]
    off_topic_segments: List[AlignmentItem]


class FeedbackTip(BaseModel):
    """Specific actionable tip"""
    section: str
    tip: str


class Feedback(BaseModel):
    """LLM-generated feedback"""
    strengths: List[str] = Field(max_length=3)
    improvements: List[str] = Field(max_length=3)
    tips: List[FeedbackTip]
    ethical_note: str = Field(
        default="Bu bir sunum geri bildirim aracıdır. Psikolojik değerlendirme değildir."
    )


# ============================================================================
# NEW MODELS FOR SLIDE-BY-SLIDE ALIGNMENT (PRO FEATURE)
# ============================================================================

class SlideAlignmentDetail(BaseModel):
    """Individual slide alignment result"""
    slide_number: int = Field(description="Slide number (1-indexed)")
    title: str = Field(description="Slide title")
    bullets: str = Field(description="Key points from slide")
    status: str = Field(description="covered | partial | missing")
    talking_points: List[str] = Field(default=[], description="Suggested talking points (if needed)")
    needs_suggestion: bool = Field(description="Whether this slide needs talking points")


class SlideBySlideAlignment(BaseModel):
    """Slide-by-slide alignment analysis (PRO feature)"""
    slides: List[SlideAlignmentDetail] = Field(description="Analysis for each slide")
    overall_coverage: float = Field(description="Percentage of slides covered (0-100)")
    language: str = Field(description="Detected language (tr/en)")


# ============================================================================
# MAIN RESPONSE MODEL
# ============================================================================

class AnalysisResponse(BaseModel):
    """Complete analysis result"""
    transcript: TranscriptData
    metrics: SpeechMetrics
    alignment: AlignmentResult
    feedback: Feedback
    hitl_focus_options: List[str] = Field(
        default=["İçerik uyumu", "Hitabet & vurgu", "Hız & netlik"]
    )
    # NEW: Slide-by-slide alignment (optional, PRO only)
    slide_alignment: Optional[SlideBySlideAlignment] = Field(
        default=None,
        description="Detailed slide-by-slide analysis (PRO feature)"
    )