import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application configuration from environment variables"""
    
    # API Keys
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Application
    DEBUG: bool = True
    MAX_AUDIO_DURATION: int = 180  # seconds
    MAX_FILE_SIZE: int = 20  # MB
    
    # Alignment
    SIMILARITY_THRESHOLD: float = 0.45
    
    # Filler Words
    FILLER_WORDS_TR: str = "yani,şey,işte,hani,ee,ııı,mmm,aaa"
    FILLER_WORDS_EN: str = "um,uh,like,you know,basically,actually,literally,so"
    
    class Config:
        env_file = ".env.example"
        case_sensitive = True
    
    @property
    def filler_words_list(self) -> List[str]:
        """Combined Turkish and English filler words"""
        tr_words = [w.strip() for w in self.FILLER_WORDS_TR.split(",")]
        en_words = [w.strip() for w in self.FILLER_WORDS_EN.split(",")]
        return tr_words + en_words


# Global settings instance
settings = Settings()


# Whisper Model Config
WHISPER_MODEL = "tiny"  # Options: tiny, base, small, medium, large
WHISPER_DEVICE = "cpu"  # Use CPU for Windows compatibility

# Sentence Transformer Model
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"