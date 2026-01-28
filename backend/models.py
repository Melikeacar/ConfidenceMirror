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


class AnalysisResponse(BaseModel):
    """Complete analysis result"""
    transcript: TranscriptData
    metrics: SpeechMetrics
    alignment: AlignmentResult
    feedback: Feedback
    hitl_focus_options: List[str] = Field(
        default=["İçerik uyumu", "Hitabet & vurgu", "Hız & netlik"]
    )