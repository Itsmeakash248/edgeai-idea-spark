
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt');
const chatContainer = document.getElementById('chat-container');
const loadingIndicator = document.getElementById('loading-indicator');

// Helper to show/hide loading spinner
function setLoading(visible) {
  if (visible) {
    loadingIndicator.classList.remove('hidden');
    window.componentHandler && window.componentHandler.upgradeDom();
  } else {
    loadingIndicator.classList.add('hidden');
  }
}

async function sendMessage(prompt) {
  appendMessage('user', prompt);
  setLoading(true);

  try {
    const res = await fetch(`http://localhost:3000/generate?prompt=${encodeURIComponent(prompt)}`);
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = { error: 'Invalid server response.' };
    }
    setLoading(false);
    if (res.ok) {
      appendMessage('ai', data.text);
    } else {
      appendMessage('ai', `Error: ${data.error}`);
    }
  } catch (error) {
    setLoading(false);
    appendMessage('ai', `Error: Connection failed—check if server is running.`);
  }
}

function appendMessage(sender, text, isLoading = false) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);

  const iconSpan = document.createElement('span');
  iconSpan.classList.add('message-icon');
  iconSpan.innerHTML = sender === 'user' ? '👤' : '🤖';

  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('message-bubble');
  bubbleDiv.innerHTML = isLoading ? text : (sender === 'ai' ? marked.parse(text) : text.replace(/\n/g, '<br>'));

  // Add copy button for AI messages (not loading)
  if (sender === 'ai' && !isLoading) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-button';
    copyBtn.type = 'button';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.innerHTML = '📋';
    copyBtn.setAttribute('aria-label', 'Copy AI message');
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '✅';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = '📋';
        }, 1200);
      });
    };
    bubbleDiv.appendChild(copyBtn);
  }

  if (sender === 'user') {
    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(iconSpan);
  } else {
    messageDiv.appendChild(iconSpan);
    messageDiv.appendChild(bubbleDiv);
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  window.componentHandler && window.componentHandler.upgradeDom();
  return messageDiv;
}

promptForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  sendMessage(prompt);
  promptInput.value = '';
});

// Initial message
window.addEventListener('load', () => {
  appendMessage('ai', 'Hello! How can I spark your EdgeAI ideas today?');
});