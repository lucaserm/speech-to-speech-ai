import { $ } from "zx";

export async function askOllama({ model, prompt }: {model: string, prompt: string}) {
  const { stdout } = await $`bash -c "echo ${prompt} | ollama run ${model}"`;
  return stdout.trim();
}
