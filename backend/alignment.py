from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple
import logging
from models import TranscriptData, AlignmentResult, AlignmentItem
from config import EMBEDDING_MODEL, settings

logger = logging.getLogger(__name__)

# Global model instance (loaded once)
_embedding_model = None


def get_embedding_model() -> SentenceTransformer:
    """Get or create sentence transformer model (singleton pattern)"""
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully")
    return _embedding_model


def split_outline_into_sections(outline_text: str) -> List[str]:
    """
    Split outline into meaningful sections
    
    Args:
        outline_text: Raw outline text
        
    Returns:
        List of outline sections
    """
    # Split by newlines and filter empty lines
    lines = [line.strip() for line in outline_text.split('\n') if line.strip()]
    
    # If no structure, split by sentences
    if len(lines) < 3:
        import re
        sentences = re.split(r'[.!?]+', outline_text)
        lines = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    return lines if lines else [outline_text]


def align_transcript_to_outline(
    transcript: TranscriptData,
    outline_text: str
) -> AlignmentResult:
    """
    Align transcript segments to outline sections using semantic similarity
    
    Args:
        transcript: TranscriptData with segments
        outline_text: Presentation outline/script
        
    Returns:
        AlignmentResult with matches and off-topic segments
    """
    try:
        model = get_embedding_model()
        
        # Prepare outline sections
        outline_sections = split_outline_into_sections(outline_text)
        
        if not outline_sections:
            logger.warning("Empty outline provided, skipping alignment")
            return AlignmentResult(items=[], off_topic_segments=[])
        
        logger.info(
            f"Aligning {len(transcript.segments)} segments "
            f"to {len(outline_sections)} outline sections"
        )
        
        # Encode outline sections
        outline_embeddings = model.encode(outline_sections)
        
        # Encode transcript segments
        segment_texts = [seg.text for seg in transcript.segments]
        segment_embeddings = model.encode(segment_texts)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(segment_embeddings, outline_embeddings)
        
        # Find best match for each segment
        alignment_items = []
        off_topic_segments = []
        
        for idx, segment in enumerate(transcript.segments):
            # Get similarity scores for this segment
            scores = similarity_matrix[idx]
            
            # Find best matching outline section
            best_idx = np.argmax(scores)
            best_score = float(scores[best_idx])
            best_match = outline_sections[best_idx]
            
            # Truncate long section names
            if len(best_match) > 80:
                best_match = best_match[:77] + "..."
            
            alignment_item = AlignmentItem(
                segment_idx=idx,
                segment_text=segment.text,
                best_match=best_match,
                similarity_score=round(best_score, 3)
            )
            
            alignment_items.append(alignment_item)
            
            # Check if off-topic (below threshold)
            if best_score < settings.SIMILARITY_THRESHOLD:
                off_topic_segments.append(alignment_item)
        
        logger.info(
            f"Alignment complete: {len(off_topic_segments)} "
            f"off-topic segments detected"
        )
        
        return AlignmentResult(
            items=alignment_items,
            off_topic_segments=off_topic_segments
        )
        
    except Exception as e:
        logger.error(f"Alignment failed: {str(e)}")
        raise RuntimeError(f"Failed to align transcript to outline: {str(e)}")


def get_coverage_summary(alignment: AlignmentResult) -> dict:
    """
    Get summary statistics about outline coverage
    
    Args:
        alignment: AlignmentResult object
        
    Returns:
        Dictionary with coverage statistics
    """
    if not alignment.items:
        return {
            "total_segments": 0,
            "on_topic_segments": 0,
            "off_topic_segments": 0,
            "coverage_rate": 0.0
        }
    
    total = len(alignment.items)
    off_topic = len(alignment.off_topic_segments)
    on_topic = total - off_topic
    
    return {
        "total_segments": total,
        "on_topic_segments": on_topic,
        "off_topic_segments": off_topic,
        "coverage_rate": round((on_topic / total) * 100, 1) if total > 0 else 0.0
    }