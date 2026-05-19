import { env } from "../config/env";
import { askCopilot } from "./copilot";
import { askGemini } from "./gemini";
import { askOllama } from "./ollama";

export async function makeLLM({ prompt }: { prompt: string }): Promise<string> {
  if (env.LLM_MODEL === "gemini") {
    return await askGemini({
      prompt,
    });
  }

  if (env.LLM_MODEL === "copilot") {
    return await askCopilot({
      model: env.COPILOT_MODEL,
      prompt,
    });
  }

  if (env.LLM_MODEL === "ollama") {
    return await askOllama({
      model: env.OLLAMA_MODEL,
      prompt,
    });
  }

  throw new Error(`Modelo LLM desconhecido: ${env.LLM_MODEL}`);
}
