import { $ } from "zx";

/**
 * Check if a command exists in PATH (uses `which`).
 * Returns true when found, false otherwise.
 */
export async function commandExists(cmd: string) {
  try {
    const { stdout } = await $`which ${cmd}`;
    return !!stdout.trim();
  } catch {
    return false;
  }
}
