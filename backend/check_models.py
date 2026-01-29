import google.generativeai as genai
import os
import sys

# Add current directory to path to allow importing config
sys.path.append(os.getcwd())

try:
    from config import settings
    print(f"API Key configured: {bool(settings.GEMINI_API_KEY)}")
    if settings.GEMINI_API_KEY:
        print(f"Key start: {settings.GEMINI_API_KEY[:4]}...")
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    print("\nAvailable Models:")
    found_flash = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            if 'gemini-1.5-flash' in m.name:
                found_flash = True
                
    if found_flash:
        print("\nSUCCESS: gemini-1.5-flash found!")
    else:
        print("\nWARNING: gemini-1.5-flash NOT found in the list.")

except Exception as e:
    print(f"\nERROR: {e}")
