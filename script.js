const generateBtn = document.getElementById('generate');
const promptInput = document.getElementById('prompt');
const loading = document.getElementById('loading');
const output = document.getElementById('output');

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert('Enter a prompt!');

  loading.classList.remove('hidden');
  output.innerHTML = '';

  try {
    const res = await fetch(`http://localhost:3000/generate?prompt=${encodeURIComponent(prompt)}`);
    const data = await res.json();
    
    if (res.ok) {
      output.innerHTML = `<strong>Generated Ideas:</strong><br><br>${data.text.replace(/\n/g, '<br>')}`;
    } else {
      output.innerHTML = `<strong>Error:</strong> ${data.error}`;
    }
  } catch (error) {
    output.innerHTML = `<strong>Error:</strong> Connection failed—check if server is running.`;
  } finally {
    loading.classList.add('hidden');
  }
});

// Auto-generate on load for demo
window.addEventListener('load', () => generateBtn.click());