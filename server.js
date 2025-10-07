import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';  // For .env API key
import { marked } from 'marked';

const app = express();
app.use(cors());
app.use(express.json());  // For POST if needed

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/generate', async (req, res) => {
  try {
    const { prompt } = req.query;  // Get prompt from URL query
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ text: marked.parse(response.text()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));