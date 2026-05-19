import vosk from "vosk";
// @ts-ignore
import Mic from "mic";
import { calculateRms } from "../utils/calculate-rms";

export function createVosk({
  modelPath,
  sampleRate,
}: {
  modelPath: string;
  sampleRate: number;
}) {
  vosk.setLogLevel(-1);
  const model = new vosk.Model(modelPath);

  return {
    model,
    async transcribe(): Promise<string> {
      return new Promise((resolve, reject) => {
        try {
          if (!model) {
            return reject(new Error("Vosk model not initialized"));
          }

          const WAKE_WORD = /\bassistente\b/i;

          const recognizer = new vosk.Recognizer({
            model: model,
            sampleRate,
          });

          const micInstance = Mic({
            rate: String(sampleRate),
            channels: "1",
            device: "default",
            fileType: "raw",
            encoding: "signed-integer",
            endian: "little",
            gain: 5,
            debug: false,
          });

          const micInputStream = micInstance.getAudioStream();

          const segments: string[] = [];
          let silenceTimer: NodeJS.Timeout | null = null;
          let state = "LISTENING" as "LISTENING" | "FINALIZING" | "DONE";
          const SILENCE_MS = 3000;
          const ENERGY_THRESHOLD = 0.016;
          const MAX_LISTEN_MS = 8_000;

          const hardTimeout = setTimeout(() => {
            if (state != "LISTENING") return;
            state = "FINALIZING";
            cleanup();
            resolve("");
          }, MAX_LISTEN_MS);

          const finalize = () => {
            if (state != "LISTENING") return;
            state = "FINALIZING";
            try {
              const final = recognizer.finalResult();

              if (!WAKE_WORD.test(final.text)) {
                cleanup();
                return resolve("");
              }

              const cleaned = final.text.replace(WAKE_WORD, "").trim();
              segments.push(cleaned);

              const text = segments
                .join(" ")
                .replace(/\s+/g, " ")
                .replace(/<unk>/gi, "")
                .trim();

              cleanup();
              resolve(text);
            } catch (e) {
              reject(e);
            }
          };

          const cleanup = () => {
            try {
              clearTimeout(hardTimeout);
            } catch {}
            try {
              micInstance.stop();
            } catch {}
            try {
              recognizer.free();
            } catch {}
          };

          micInputStream.on("data", (data: Buffer) => {
            if (state != "LISTENING") return;
            recognizer.acceptWaveform(data);
            const energy = calculateRms(data);

            if (energy > ENERGY_THRESHOLD) {
              if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
              }
              const { partial } = recognizer.partialResult();
              if (WAKE_WORD.test(partial)) {
                console.log("🔊 Wake word detectada");
              }
            } else if (!silenceTimer) {
              silenceTimer = setTimeout(finalize, SILENCE_MS);
            }
          });

          micInputStream.on("error", (err: any) => {
            cleanup();
            reject(err);
          });

          micInputStream.on("startComplete", () => {
            console.log("  Microfone ativo");
          });

          micInstance.start();
        } catch (e) {
          reject(e);
        }
      });
    },
    free() {
      model.free();
    },
  };
}
