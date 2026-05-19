import { $ } from "zx";
import type { CopilotModel } from "../constants/copilot-models";

export async function askCopilot({
  model,
  prompt,
}: {
  model: CopilotModel;
  prompt: string;
}) {
  const { stdout } = await $`copilot -p ${prompt} --model ${model}`;
  return stdout.trim();
}
