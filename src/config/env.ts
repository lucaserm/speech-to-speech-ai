import type { CopilotModel } from "../constants/copilot-models";
import type { GeminiModels } from "../constants/gemini-models";

export const env = {
  VOSK_MODEL: "./models/vosk/pt-br",
  PIPER_BIN: "./bin/piper/piper",
  PIPER_VOICE: "./models/piper/pt_BR-faber-medium.onnx",
  OLLAMA_MODEL: "mistral:7b",
  COPILOT_MODEL: "gpt-5" as CopilotModel,

  GEMINI_MODEL: "gemma-3-27b-it" as GeminiModels,
  GEMINI_API_KEY: "",

  LLM_MODEL: "gemini" as "copilot" | "ollama" | "gemini",

  SAMPLE_RATE: 16000,
  SILENT_MODE: false,
};
