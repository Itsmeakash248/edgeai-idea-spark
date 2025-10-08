import streamlit as st
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json
from datetime import datetime
import io

load_dotenv()

# Initialize GenAI client
client = genai.Client()

# --- Streamlit page setup ---
st.set_page_config(page_title="EdgeAI Chat", layout="wide")
st.title("EdgeAI Idea Spark Chat")
st.caption("Powered by Google Gemini – Ask about edge AI ideas!")

# --- Session state defaults ---
if "messages" not in st.session_state:
    st.session_state.messages = []  # list of {role, content, ts}

if "saved_chats" not in st.session_state:
    st.session_state.saved_chats = {}  # name -> list(messages)

if "system_prompt" not in st.session_state:
    st.session_state.system_prompt = "You are a helpful assistant specializing in edge AI ideas and practical implementation guidance. Be concise and give concrete next steps when appropriate."

if "model" not in st.session_state:
    st.session_state.model = "gemini-2.5-flash"

if "thinking_budget" not in st.session_state:
    st.session_state.thinking_budget = 0

# --- Sidebar: controls, examples, save/load ---
with st.sidebar:
    st.header("Session controls")
    # Model selector
    st.session_state.model = st.selectbox(
        "Model",
        options=["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.0"],
        index=0,
    )

    # Thinking budget slider
    st.session_state.thinking_budget = st.slider(
        "Thinking budget (ms, 0 = default)", 0, 1000, st.session_state.thinking_budget, step=50
    )

    # System prompt (applies to every request)
    st.text_area("System prompt (applies to every message)", value=st.session_state.system_prompt, key="system_prompt_area", height=120)
    st.session_state.system_prompt = st.session_state.get("system_prompt_area", st.session_state.system_prompt)

    st.markdown("---")
    st.subheader("Quick examples")
    examples = [
        "Low-power object detection pipeline for drone inspections",
        "TinyML approach for predictive maintenance on HVAC compressors",
        "On-device model selection for multi-sensor fusion (accelerometer + microphone)",
    ]
    for i, ex in enumerate(examples):
        if st.button(f"Try: {ex}", key=f"example_{i}"):
            # directly send example as a message
            st.session_state._just_triggered_example = ex

    st.markdown("---")
    st.subheader("File / context")
    uploaded_file = st.file_uploader("Attach context file (TXT or JSON)", type=["txt", "json"])
    if uploaded_file is not None:
        try:
            raw = uploaded_file.getvalue().decode("utf-8")
            st.session_state.uploaded_context = raw
            st.success("File loaded into session context (will be included with your next prompt).")
        except Exception as e:
            st.error("Could not read file: {}".format(e))

    st.markdown("---")
    st.subheader("Save / load chat")
    save_name = st.text_input("Save current chat as", key="save_name")
    if st.button("Save chat"):
        if save_name:
            st.session_state.saved_chats[save_name] = json.loads(json.dumps(st.session_state.messages))
            st.success(f"Saved chat as '{save_name}'.")
        else:
            st.error("Please provide a name to save the chat.")

    if st.session_state.saved_chats:
        load_name = st.selectbox("Load saved chat", options=list(st.session_state.saved_chats.keys()))
        if st.button("Load chat"):
            st.session_state.messages = json.loads(json.dumps(st.session_state.saved_chats[load_name]))
            safe_rerun()

    st.markdown("---")
    st.subheader("Export")
    if st.session_state.messages:
        json_bytes = json.dumps(st.session_state.messages, indent=2).encode("utf-8")
        txt_bytes = "\n\n".join([f"[{m['role']}] {m['content']}" for m in st.session_state.messages]).encode("utf-8")
        st.download_button("Download JSON", data=json_bytes, file_name="edgeai_chat.json", mime="application/json")
        st.download_button("Download TXT", data=txt_bytes, file_name="edgeai_chat.txt", mime="text/plain")

    st.markdown("---")
    if st.button("Clear saved chats"):
        st.session_state.saved_chats = {}
        st.success("All saved chats cleared.")

# --- Helper: send message / call API ---

# Compatibility helper for triggering a Streamlit rerun.
# Newer Streamlit versions provide `st.rerun()`. Older versions used `safe_rerun()`.
# Use `safe_rerun()` wherever you previously called `safe_rerun()`.
def safe_rerun():
    """Try the modern st.rerun API, fall back to experimental_rerun if necessary.
    If neither works (very old or very new incompatible versions), this function will
    toggle a small session-state flag as a last-resort no-op that may help in some
    environments. For best results, upgrade Streamlit to a recent stable release.
    """
    try:
        # preferred new API
        st.rerun()
    except AttributeError:
        try:
            # older API (deprecated in newer versions)
            safe_rerun()
        except Exception:
            # Last resort: flip a session-state value so the UI sees a change.
            st.session_state["_rerun_fallback"] = not st.session_state.get("_rerun_fallback", False)
            return


def _append_message(role: str, content: str):
    st.session_state.messages.append({
        "role": role,
        "content": content,
        "ts": datetime.utcnow().isoformat() + "Z",
    })


def send_message(prompt: str, replace_last_assistant: bool = False):
    # Build full prompt including system prompt and optional uploaded context
    parts = [st.session_state.get("system_prompt", ""),]
    if st.session_state.get("uploaded_context"):
        # keep the context concise when sending to the model
        parts.append("Context start:\n" + st.session_state.uploaded_context + "\nContext end:\n")
    parts.append(prompt)
    full_prompt = "\n\n".join([p for p in parts if p])

    # Append user message to UI state
    _append_message("user", prompt)

    # Call the model
    with st.spinner("Thinking..."):
        try:
            response = client.models.generate_content(
                model=st.session_state.model,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=st.session_state.thinking_budget)
                ),
            )
            assistant_text = response.text
        except Exception as e:
            assistant_text = f"[Error calling model] {e}"

    # Add assistant message
    if replace_last_assistant:
        # remove last assistant if exists
        for i in range(len(st.session_state.messages) - 1, -1, -1):
            if st.session_state.messages[i]["role"] == "assistant":
                st.session_state.messages.pop(i)
                break
    _append_message("assistant", assistant_text)
    # clear uploaded context after sending (optional)
    if st.session_state.get("uploaded_context"):
        del st.session_state["uploaded_context"]


# --- Main chat area (two columns) ---
col1, col2 = st.columns([3, 1])

with col1:
    # If user clicked an example in the sidebar, send it
    if st.session_state.get("_just_triggered_example"):
        ex = st.session_state.pop("_just_triggered_example")
        send_message(ex)
        safe_rerun()

    # Render chat messages in order
    for i, message in enumerate(st.session_state.messages):
        role = message.get("role")
        content = message.get("content")
        ts = message.get("ts", "")
        with st.chat_message(role):
            st.markdown(content)
            st.caption(f"{role} • {ts} • {len(content)} chars")

    # Input area
    prompt = st.chat_input("What's your edge AI question?")
    if prompt:
        # Normal send
        send_message(prompt)
        safe_rerun()

    # Buttons: Regenerate last assistant reply
    if st.session_state.messages:
        if st.button("Regenerate last assistant reply"):
            # find last user message
            last_user = None
            for m in reversed(st.session_state.messages):
                if m["role"] == "user":
                    last_user = m["content"]
                    break
            if last_user:
                send_message(last_user, replace_last_assistant=True)
                safe_rerun()

    if st.button("Clear Chat"):
        st.session_state.messages = []
        safe_rerun()

with col2:
    st.markdown("### Conversation tools")
    if st.session_state.messages:
        # show last 5 messages summary
        st.markdown("**Last 5 messages (summary)**")
        for m in st.session_state.messages[-5:]:
            st.write(f"- {m['role']}: {m['content'][:120].replace('\n', ' ')}")

    st.markdown("---")
    st.markdown("**Session stats**")
    total_chars = sum(len(m["content"]) for m in st.session_state.messages)
    st.write(f"Messages: {len(st.session_state.messages)}")
    st.write(f"Total characters: {total_chars}")

    st.markdown("---")
    st.markdown("**Quick actions**")
    if st.button("Export as JSON (quick)"):
        st.download_button("Download JSON", data=json.dumps(st.session_state.messages, indent=2), file_name="edgeai_chat.json")

    st.markdown("---")
    st.markdown("Need more features? Reply with a prioritized list (1-5) and I'll extend the app.")

# End of file
