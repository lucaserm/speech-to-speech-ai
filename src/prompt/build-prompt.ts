import { getMemory } from "../state/memory";

export function buildPrompt(intent: string, text: string, clipboard: string) {
  let base = `
    Você é meu assistente pessoal.
    Seja direto, técnico e prático.
    Não quero formatação no texto.
    Responda curto.
    `;

  const memory = getMemory();

  if (memory.length) {
    base += `\nContexto lembrado:\n- ${memory.join("\n- ")}\n`;
  }

  if (clipboard) {
    base += `\nCódigo do clipboard:\n${clipboard}\n`;
  }

  const intentMap: Record<string, string> = {
    study: "Explique com exemplos simples.",
    code: "Responda como dev sênior.",
    rubber: "Questione decisões.",
    general: "",
  };

  return `${base}\n${intentMap[intent]}\nPergunta: ${text}`;
}
