import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";
import type { GeminiModels } from "../constants/gemini-models";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function askGemini({
  model = "gemma-3-27b-it",
  prompt,
}: {
  model?: GeminiModels;
  prompt: string;
}) {
  const gemini = genAI.getGenerativeModel({ model });

  const result = await gemini.generateContent(prompt);
  return result.response.text();
}
