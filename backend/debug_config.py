from config import settings
import os

print(f"Current settings.GEMINI_MODEL: '{settings.GEMINI_MODEL}'")
print(f"Environment variable GEMINI_MODEL: '{os.environ.get('GEMINI_MODEL')}'")
