const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt');
const chatContainer = document.getElementById('chat-container');

async function sendMessage(prompt) {
  // Display user message
  appendMessage('user', prompt);

  // Display loading indicator
  const loadingMessage = appendMessage('ai', 'Generating... ✨', true);

  try {
    const res = await fetch(`http://localhost:3000/generate?prompt=${encodeURIComponent(prompt)}`);
    const data = await res.json();
    
    // Remove loading indicator
    chatContainer.removeChild(loadingMessage);

    if (res.ok) {
      appendMessage('ai', data.text);
    } else {
      appendMessage('ai', `Error: ${data.error}`);
    }
  } catch (error) {
    chatContainer.removeChild(loadingMessage);
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
  bubbleDiv.innerHTML = isLoading ? text : text.replace(/\n/g, '<br>');

  if (sender === 'user') {
    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(iconSpan);
  } else {
    messageDiv.appendChild(iconSpan);
    messageDiv.appendChild(bubbleDiv);
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
  return messageDiv; // Return the message element for potential removal (e.g., loading)
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