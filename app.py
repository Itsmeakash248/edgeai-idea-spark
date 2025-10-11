import streamlit as st
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client()

st.set_page_config(page_title="EdgeAI Chat", layout="wide")

st.title("EdgeAI Idea Spark Chat")
st.caption("Powered by Google Gemini – Ask about edge AI ideas!")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("What's your edge AI question?"):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        thoughts = ""
        answer = ""
        first_thought = True
        first_answer = True

        for chunk in client.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    include_thoughts=True,
                    thinking_budget=1024
                )
            ),
        ):
            delta = ""
            for part in chunk.candidates[0].content.parts:
                if not part.text:
                    continue
                if part.thought:
                    if first_thought:
                        delta += "**Thoughts:**\n"
                        first_thought = False
                    delta += part.text
                    thoughts += part.text
                else:
                    if first_answer:
                        if thoughts:
                            delta += "\n\n"
                        delta += "**Answer:**\n"
                        first_answer = False
                    delta += part.text
                    answer += part.text
            full_response += delta
            message_placeholder.markdown(full_response + "▌")
        
        message_placeholder.markdown(full_response)
        st.session_state.messages.append({"role": "assistant", "content": full_response})

if st.button("Clear Chat"):
    st.session_state.messages = []
    st.rerun()
