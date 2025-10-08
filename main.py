from dotenv import load_dotenv
import os
from google import genai
from google.genai import types

# Load environment variables from .env file
load_dotenv()

# Check for API key
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("No GOOGLE_API_KEY found in environment variables. Please set it in the .env file.")

client = genai.Client(api_key=api_key)  # Explicitly pass the key for clarity

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in a 100 words",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # Disables thinking
    ),
)
print(response.text)