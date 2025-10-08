import streamlit as st
import json
import base64
from io import BytesIO
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

# Load environment variables (your API key)
load_dotenv()

# Initialize Gemini client
client = genai.Client()

# Streamlit page config
st.set_page_config(page_title="EdgeAI Chat", page_icon="🤖", layout="wide")

# Title
st.title("🤖 EdgeAI Idea Spark Chat")
st.caption("Powered by Google Gemini – Multimodal chats for edge AI innovation!")

# Sidebar for presets and image upload
with st.sidebar:
    st.header("Quick Tools")
    
    # Preset prompts for edge AI
    preset_prompts = {
        "IoT Device Optimization": "Suggest ways to optimize power usage in battery-powered IoT sensors using edge AI.",
        "TinyML Model Ideas": "Brainstorm lightweight ML models for real-time anomaly detection on microcontrollers.",
        "Edge vs. Cloud Tradeoffs": "Compare edge computing vs. cloud for a smart camera surveillance system.",
        "Hardware Acceleration": "How can NPUs accelerate computer vision tasks on edge devices?"
    }
    selected_preset = st.selectbox("Pick a Starter Prompt:", list(preset_prompts.keys()))
    if st.button("Use Preset"):
        st.session_state.preset_prompt = preset_prompts[selected_preset]
    
    # Image upload for multimodal
    uploaded_file = st.file_uploader("Upload Image (e.g., diagram):", type=["jpg", "jpeg", "png"])
    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image", use_column_width=True)
        # Store image bytes in session for use
        image_bytes = uploaded_file.getvalue()
        st.session_state.image_bytes = image_bytes
        st.session_state.image_mime = uploaded_file.type

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Preset handling
if "preset_prompt" in st.session_state:
    prompt = st.session_state.preset_prompt
    del st.session_state.preset_prompt  # Clear after use
else:
    prompt = None

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if not prompt:
    prompt = st.chat_input("What's your edge AI question?")

# Handle input (text or preset)
if prompt:
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Prepare contents: history + current prompt + optional image
    contents = []
    for msg in st.session_state.messages:
        contents.append({"role": msg["role"], "parts": [{"text": msg["content"]}]})
    
    # Add current prompt as text part
    contents[-1]["parts"].append({"text": prompt})  # Ensure last is user
    
    # Add image if uploaded
    if "image_bytes" in st.session_state:
        image_part = types.Part.from_bytes(
            data=st.session_state.image_bytes,
            mime_type=st.session_state.image_mime
        )
        contents[-1]["parts"].append(image_part)

    # Generate response
    with st.chat_message("assistant"):
        with st.spinner("Generating..."):
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ),
            )
            st.markdown(response.text)
        # Add to history
        st.session_state.messages.append({"role": "assistant", "content": response.text})

# Persistence controls
col1, col2 = st.columns(2)
with col1:
    if st.button("💾 Save Chat"):
        chat_json = json.dumps(st.session_state.messages, indent=2)
        st.download_button("Download Chat History", chat_json, "chat_history.json", "application/json")
with col2:
    uploaded_json = st.file_uploader("📁 Load Chat History", type="json")
    if uploaded_json:
        loaded_messages = json.load(uploaded_json)
        st.session_state.messages = loaded_messages
        st.rerun()

# Clear button
if st.button("Clear Chat"):
    st.session_state.messages = []
    if "image_bytes" in st.session_state:
        del st.session_state.image_bytes
        del st.session_state.image_mime
    st.rerun()