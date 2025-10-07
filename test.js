import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';  // Remove if not using .env

// Uses GEMINI_API_KEY from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Explain how AI works in a few words");
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();