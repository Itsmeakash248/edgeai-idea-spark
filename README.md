# EdgeAI Idea Spark

🚀 **Generate innovative AI business ideas for edge devices** using Google's Gemini AI. Perfect for sparking concepts in IoT, embedded systems, wearables, and sustainable tech. This full-stack app features a sleek web UI powered by Node.js, Express, and the Gemini SDK.

## Features
- **AI-Powered Generation**: Input a prompt (e.g., "Smart farming with AI sensors") and get creative, concise business ideas from Gemini 2.5 Flash.
- **Responsive UI**: Clean, mobile-friendly interface with loading states and error handling.
- **Secure Backend**: API key stays server-side—no client exposure.
- **Easy Setup**: Runs locally with VSCode/Live Server; deployable to Vercel/Netlify.

![UI Preview](https://via.placeholder.com/800x400/1e3c72/ffffff?text=EdgeAI+Idea+Spark+UI)  
*(Replace with a screenshot once you have one!)*

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+; includes npm) – Install via your package manager (e.g., `sudo pacman -S nodejs npm` on Arch Linux).
- [VSCode](https://code.visualstudio.com/) with extensions: Live Server (for frontend preview).
- A free [Google Gemini API Key](https://aistudio.google.com/app/apikey) (sign in with Google account).

## Installation
1. Clone or create the project folder:
   ```
   mkdir edgeai-idea-spark
   cd edgeai-idea-spark
   ```

2. Initialize npm and install dependencies:
   ```
   npm init -y
   npm install @google/generative-ai express cors dotenv
   ```
   - Edit `package.json` to add `"type": "module"` for ES modules.

3. Create the files:
   - `server.js` (backend – see below).
   - `index.html`, `style.css`, `script.js` (frontend – see below).
   - `.env` for your API key: `GEMINI_API_KEY=your-api-key-here`.

4. Add to `.gitignore` (create if needed):
   ```
   node_modules/
   .env
   ```

## Project Structure
```
edgeai-idea-spark/
├── package.json
├── .env                 # API key (git ignore this!)
├── server.js            # Node/Express backend
├── index.html           # Main UI page
├── style.css            # Styling
├── script.js            # Frontend logic
└── node_modules/        # Dependencies (git ignore)
```

### Key Files
#### server.js (Backend)
```javascript
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/generate', async (req, res) => {
  try {
    const { prompt } = req.query;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

#### index.html (Frontend)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EdgeAI Idea Spark</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>🚀 EdgeAI Idea Spark</h1>
    <p>Generate innovative AI business ideas for edge devices (IoT, embedded systems, etc.)</p>
    
    <div class="input-group">
      <input type="text" id="prompt" placeholder="e.g., 'Smart farming with AI sensors'" value="Explain edge AI for sustainable agriculture in 3 ideas">
      <button id="generate">Spark Ideas!</button>
    </div>
    
    <div id="loading" class="loading hidden">Generating... ✨</div>
    <div id="output" class="output"></div>
  </div>
  
  <script type="module" src="script.js"></script>
</body>
</html>
```

#### style.css (Styling)
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #fff;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
  opacity: 0.9;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

input[type="text"] {
  flex: 1;
  max-width: 500px;
  padding: 15px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  background: rgba(255,255,255,0.1);
  color: #fff;
  text-align: center;
}

input::placeholder {
  color: rgba(255,255,255,0.7);
}

button {
  padding: 15px 30px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}

.loading {
  font-size: 1.1em;
  margin: 20px 0;
}

.hidden {
  display: none;
}

.output {
  background: rgba(255,255,255,0.1);
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  text-align: left;
  font-size: 1.1em;
  line-height: 1.6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
}

@media (max-width: 600px) {
  .input-group {
    flex-direction: column;
  }
  input[type="text"] {
    max-width: none;
  }
}
```

#### script.js (Frontend Logic)
```javascript
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
```

## Usage
1. Start the backend:
   ```
   node server.js
   ```
   - Output: "Server running on http://localhost:3000"

2. Open the frontend:
   - Right-click `index.html` in VSCode > "Open with Live Server".
   - Or open `index.html` in your browser (ensure server is running).

3. Interact:
   - The page auto-generates a demo idea on load.
   - Type a prompt (e.g., "Edge AI for wearables in healthcare") and click "Spark Ideas!".
   - Results appear below with formatting.

### Example Prompts
- "3 business ideas for edge AI in smart cities"
- "Sustainable agriculture using IoT sensors"
- "Wearable tech for fitness tracking with privacy focus"

## Troubleshooting
- **"Cannot find package 'express'"**: Run `npm install express cors dotenv`.
- **API Errors (e.g., 404 Model Not Found)**: Use `gemini-2.5-flash` in `server.js`; check [Gemini docs](https://ai.google.dev/gemini-api/docs/models/gemini).
- **CORS Issues**: Ensure `cors` is imported and used in `server.js`.
- **No Output**: Verify API key in `.env` and export if needed (`export GEMINI_API_KEY=your-key`).
- **Port Conflict**: Change `PORT` in `server.js` to 3001+.

## Deployment
- **Vercel**: Push to GitHub, connect repo at vercel.com (serverless auto-deploys).
- **Netlify**: Drag `index.html` folder; add server as a function.
- **Env Vars**: Set `GEMINI_API_KEY` in platform settings.

## Contributing
Fork, PR ideas! Add features like idea saving (localStorage) or multi-model support.

## License
MIT – Feel free to build on it for your edgeAI ventures.

**Built with ❤️ using Gemini AI. Spark away!** 🌟

---

*Last updated: October 07, 2025*