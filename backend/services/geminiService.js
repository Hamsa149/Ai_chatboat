// services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

let model;

/**
 * Initialize Gemini AI with API key.
 * @param {string} apiKey - Your Gemini API key (from .env or passed manually)
 */
export const initGemini = async (apiKey = process.env.GEMINI_API_KEY) => {
  try {
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY not found. Using mock responses.");
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("✅ Gemini AI initialized successfully");
  } catch (err) {
    console.error("❌ Failed to initialize Gemini AI:", err);
    throw err;
  }
};

/**
 * Generate a response using Gemini AI.
 * @param {string} message - The user's question/message
 * @param {Array<{text: string}>} contextPassages - Relevant context snippets
 * @returns {Promise<string>}
 */
export const generateResponse = async (message, contextPassages = []) => {
  if (!model) {
    // Return mock response when model is not initialized
    return `🔧 Mock response: "${message}" (Gemini not initialized)`;
  }

  try {
    // Build context string
    const contextText = contextPassages
      .map((p, i) => `(${i + 1}) ${p.text ?? p.content ?? ""}`)
      .join("\n");

    const prompt = `
      You are a news chatbot. Use the following relevant news snippets (if any)
      to answer the user's question clearly.

      Relevant Articles:
      ${contextText || "No relevant context found."}

      User Question:
      ${message}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Error generating response with Gemini AI:", err);
    return "⚠️ Sorry, I couldn't process your request right now. Please try again.";
  }
};
