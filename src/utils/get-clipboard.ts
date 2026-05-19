import { $ } from "zx";

export async function getClipboard(): Promise<string> {
  try {
    const { stdout } = await $`wl-paste`;
    return stdout.trim();
  } catch {
    try {
      const { stdout } = await $`xclip -o`;
      return stdout.trim();
    } catch {
      return "";
    }
  }
}
