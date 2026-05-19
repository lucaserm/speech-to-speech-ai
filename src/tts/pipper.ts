import { spawn } from "child_process";
import { $ } from "zx";
import { env } from "../config/env";
import { fileExists } from "../utils/file-exists";
import { sleep } from "../utils/sleep";

let speakingProcess: any | null = null;

export async function speakWithPiper({
  bin,
  voice,
  text,
}: {
  bin: string;
  voice: string;
  text: string;
}) {
  if (env.SILENT_MODE) return;

  if (speakingProcess) {
    stopSpeaking();
    await sleep(80);
  }

  if (!(await fileExists(bin))) {
    console.warn("Piper não encontrado, apenas logando a fala:", text);
    console.log(`SPEAK: ${text}`);
    return;
  }

  return new Promise<void>((resolve, reject) => {
    try {
      speakingProcess = spawn(bin, [
        "--model",
        voice,
        "--output_file",
        "output.wav",
      ]);
      speakingProcess.on("error", (err: any) => {
        speakingProcess = null;
        console.error("Erro no processo Piper:", err);
        reject(err);
      });

      speakingProcess.stdin.write(text);
      speakingProcess.stdin.end();

      speakingProcess.on("close", async (code: number | null) => {
        speakingProcess = null;
        if (code !== 0) {
          console.error(`Piper finalizou com código ${code}`);
          return reject(new Error(`Piper exit ${code}`));
        }

        try {
          if (await fileExists("output.wav")) {
            await $`aplay output.wav`;
          } else {
            console.warn("output.wav não encontrado após Piper.");
          }
          resolve();
        } catch (e) {
          console.error("Erro ao reproduzir áudio:", e);
          reject(e);
        }
      });
    } catch (e) {
      speakingProcess = null;
      console.error("Erro ao iniciar TTS:", e);
      reject(e);
    }
  });
}

export function stopSpeaking() {
  if (speakingProcess) {
    try {
      speakingProcess.kill("SIGKILL");
    } catch (e) {
      // ignore
    }
    speakingProcess = null;
    console.log("🛑 Fala interrompida");
  }
}
