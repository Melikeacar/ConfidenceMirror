from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
import logging
from typing import Optional

from models import AnalysisResponse
from config import settings
from audio_utils import convert_webm_to_wav, cleanup_temp_file, get_audio_duration
from stt import transcribe_audio
from metrics import calculate_metrics
from alignment import align_transcript_to_outline
from llm_feedback import generate_feedback

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ConfidenceMirror API",
    description="AI-powered presentation practice feedback system",
    version="1.0.0"
)

# CORS middleware (allow frontend to call this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "ConfidenceMirror API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze (POST)"
        }
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    
    # Check if Gemini API key is configured
    api_key_configured = bool(settings.GEMINI_API_KEY)
    
    return {
        "status": "healthy",
        "api_key_configured": api_key_configured,
        "model": settings.GEMINI_MODEL,
        "max_audio_duration": settings.MAX_AUDIO_DURATION,
        "debug_mode": settings.DEBUG
    }


from file_utils import extract_text_from_pptx, extract_text_from_pdf

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_presentation(
    audio: UploadFile = File(..., description="Audio file (webm, wav, mp3)"),
    outline_text: Optional[str] = Form(None, description="Presentation outline/script"),
    outline_file: Optional[UploadFile] = File(None, description="Presentation file (pptx, pdf)")
):
    """
    Analyze a presentation practice session
    
    Args:
        audio: Audio recording of the practice (webm/wav/mp3)
        outline_text: What the presentation should cover (optional if file provided)
        outline_file: Presentation file (optional if text provided)
        
    Returns:
        Complete analysis with transcript, metrics, alignment, and feedback
    """
    
    temp_audio_path = None
    converted_wav_path = None
    temp_outline_path = None
    
    try:
        # Extract text from file if provided
        final_outline_text = outline_text
        
        if outline_file:
            logger.info(f"Received outline file: {outline_file.filename}")
            suffix = os.path.splitext(outline_file.filename)[1].lower()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                content = await outline_file.read()
                temp_file.write(content)
                temp_outline_path = temp_file.name
                
            try:
                if suffix == '.pptx':
                    final_outline_text = extract_text_from_pptx(temp_outline_path)
                elif suffix == '.pdf':
                    final_outline_text = extract_text_from_pdf(temp_outline_path)
                else:
                    raise HTTPException(status_code=400, detail="Unsupported file format. Use .pptx or .pdf")
            except Exception as e:
                logger.error(f"File parsing error: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to parse presentation file: {str(e)}")
        
        # Validate inputs
        if not final_outline_text or len(final_outline_text.strip()) < 20:
            raise HTTPException(
                status_code=400,
                detail="Outline text too short (minimum 20 characters) or file extraction failed"
            )
        
        logger.info(f"Received audio file: {audio.filename} ({audio.content_type})")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_audio_path = temp_file.name
        
        logger.info(f"Audio saved to: {temp_audio_path}")
        
        # Check duration
        duration = get_audio_duration(temp_audio_path)
        if duration > settings.MAX_AUDIO_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"Audio too long ({duration}s). Maximum: {settings.MAX_AUDIO_DURATION}s"
            )
        
        # Convert to WAV if needed
        if not audio.filename.endswith('.wav'):
            logger.info("Converting audio to WAV format...")
            converted_wav_path = convert_webm_to_wav(temp_audio_path)
        else:
            converted_wav_path = temp_audio_path
        
        # Step 1: Speech-to-Text
        logger.info("Step 1/4: Transcribing audio...")
        transcript = transcribe_audio(converted_wav_path)
        
        # Step 2: Calculate Metrics
        logger.info("Step 2/4: Calculating speech metrics...")
        metrics = calculate_metrics(transcript)
        
        # Step 3: Alignment Analysis
        logger.info("Step 3/4: Analyzing content alignment...")
        alignment = align_transcript_to_outline(transcript, final_outline_text)
        
        # Step 4: Generate Feedback
        logger.info("Step 4/4: Generating AI feedback...")
        feedback = generate_feedback(final_outline_text, transcript, metrics, alignment)
        
        # Build response
        response = AnalysisResponse(
            transcript=transcript,
            metrics=metrics,
            alignment=alignment,
            feedback=feedback
        )
        
        logger.info("Analysis complete!")
        return response
        
    except HTTPException:
        raise
    
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
    
    finally:
        # Cleanup temporary files
        if temp_audio_path:
            cleanup_temp_file(temp_audio_path)
        if converted_wav_path and converted_wav_path != temp_audio_path:
            cleanup_temp_file(converted_wav_path)
        if temp_outline_path:
            cleanup_temp_file(temp_outline_path)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Check if API key is configured
    if not settings.GEMINI_API_KEY:
        logger.error(
            "⚠️  GEMINI_API_KEY not found in .env file!\n"
            "Please create a .env file with your Gemini API key.\n"
            "Example: GEMINI_API_KEY=your_key_here"
        )
    
    logger.info("🚀 Starting ConfidenceMirror API server...")
    logger.info(f"📝 Using Gemini model: {settings.GEMINI_MODEL}")
    logger.info(f"🔊 Max audio duration: {settings.MAX_AUDIO_DURATION}s")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info" if settings.DEBUG else "warning"
    )