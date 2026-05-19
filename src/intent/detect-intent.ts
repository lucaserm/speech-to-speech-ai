export type Intent =
  | "remember"
  | "stop"
  | "study"
  | "code"
  | "rubber"
  | "general";

export function detectIntent(text: string): Intent {
  if (/lembra disso/i.test(text)) return "remember";
  if (/(^|\s)(para|pare|interrompe)/i.test(text)) return "stop";
  if (/explica|como funciona|o que é/i.test(text)) return "study";
  if (/classe|método|refatorar|função/i.test(text)) return "code";
  if (/pensa comigo|o que você acha/i.test(text)) return "rubber";
  return "general";
}
