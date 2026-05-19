import { env } from "./config/env";
import { fileExists } from "./utils/file-exists";
import { commandExists } from "./utils/command-exists";
import { createVosk } from "./stt/vosk";
import { detectIntent } from "./intent/detect-intent";
import { getMemory } from "./state/memory";
import { getClipboard } from "./utils/get-clipboard";
import { buildPrompt } from "./prompt/build-prompt";
import { speakWithPiper, stopSpeaking } from "./tts/pipper";
import { sleep } from "./utils/sleep";
import { makeLLM } from "./llm/make-llm";

let voskModel: any = null;

async function ensureStartupChecks() {
  const toCheck = [env.VOSK_MODEL, env.PIPER_BIN, env.PIPER_VOICE];
  for (const p of toCheck) {
    if (!(await fileExists(p))) {
      console.warn(`⚠️  Aviso: arquivo não encontrado: ${p}`);
    }
  }

  if (!(await commandExists("arecord"))) {
    console.warn(
      "⚠️ Aviso: 'arecord' não encontrado. O gravador de áudio pode não funcionar.",
    );
  }
}

async function main() {
  await ensureStartupChecks();

  console.log("📦 Inicializando Vosk...");
  try {
    voskModel = createVosk({
      modelPath: env.VOSK_MODEL,
      sampleRate: env.SAMPLE_RATE,
    });
    console.log("✅ Vosk inicializado com sucesso");
  } catch (e) {
    console.error(`❌ Erro ao carregar modelo Vosk em ${env.VOSK_MODEL}:`, e);
    console.error(
      "📥 Baixe um modelo de https://alphacephei.com/vosk/models e extraia para ./models/vosk/",
    );
    process.exit(1);
  }

  console.log("🎯 Iniciando assistente (Ctrl-C para sair)");

  while (true) {
    try {
      const text = await voskModel.transcribe();
      console.log("📝 Você:", text || "<vazio>");

      if (!text) {
        console.log("Nada detectado. Tente novamente.");
        await sleep(200);
        continue;
      }

      const intent = detectIntent(text);

      if (intent === "stop") {
        stopSpeaking();
        continue;
      }

      if (intent === "remember") {
        const toRemember = text.replace(/lembra disso/i, "").trim();
        if (toRemember) {
          getMemory().push(toRemember);
          console.log("🧠 Lembrado:", toRemember);
        } else {
          console.log(
            "Comando 'lembra disso' recebido, mas nada para lembrar.",
          );
        }
        continue;
      }

      const clipboard = await getClipboard();
      const prompt = buildPrompt(intent, text, clipboard);

      console.log("🤖 Pensando...");

      let answer: string = await makeLLM({ prompt });

      console.log("🤖 IA:", answer);

      await speakWithPiper({
        bin: env.PIPER_BIN,
        voice: env.PIPER_VOICE,
        text: answer,
      });

      await sleep(300);
    } catch (e) {
      console.error("Erro no loop principal:", e);
      await sleep(1000);
    }
  }
}

process.on("SIGINT", () => {
  console.log("\nSaindo...");
  stopSpeaking();
  if (voskModel) {
    voskModel.free();
  }
  process.exit(0);
});

main().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
