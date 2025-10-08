import streamlit as st
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables (your API key)
load_dotenv()

# Initialize Gemini client
client = genai.Client()

# Streamlit page config for a clean, ChatGPT-like look
st.set_page_config(page_title="EdgeAI Chat", page_icon="🤖", layout="wide")

# Title
st.title("🤖 EdgeAI Idea Spark Chat")
st.caption("Powered by Google Gemini – Ask about edge AI ideas!")

# Initialize chat history in session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("What's your edge AI question?"):
    # Add user message to history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate response from Gemini
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,  # Simple prompt; extend with history if needed
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)
                ),
            )
            st.markdown(response.text)
        # Add assistant response to history
        st.session_state.messages.append({"role": "assistant", "content": response.text})

# Optional: Clear chat button
if st.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun()