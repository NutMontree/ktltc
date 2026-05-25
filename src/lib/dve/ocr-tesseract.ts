import { createWorker, type Worker } from "tesseract.js";
import { buildExtractedFromOcrText, type ExtractedScore } from "./parse-score-text";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        const worker = await createWorker("tha+eng", 1, {
          logger: (m) => {
            if (process.env.NODE_ENV === "development") {
              console.log("[DVE OCR Worker]", m);
            }
          },
        });
        return worker;
      } catch (err) {
        console.error("[DVE OCR Worker] Init error, resetting workerPromise:", err);
        workerPromise = null;
        throw err;
      }
    })();
  }
  return workerPromise;
}

/** OCR รูปบนเซิร์ฟเวอร์ (ฟรี — ไม่ใช้ OpenAI) */
export async function ocrImageSource(
  source: string | Buffer,
): Promise<ExtractedScore> {
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(source);
    
    // Log the OCR output to the server terminal to help debugging
    console.log("-----------------------------------------");
    console.log("[DVE OCR Text read]:");
    console.log(data.text || "(no text found)");
    console.log("-----------------------------------------");
    
    const extracted = buildExtractedFromOcrText(data.text || "");
    extracted.rawText = data.text || "";
    return extracted;
  } catch (err) {
    console.error("[DVE OCR] error:", err);
    // Reset workerPromise on recognition failure to be safe
    workerPromise = null;
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "อ่านข้อความจากรูปไม่สำเร็จ — กรุณากรอกคะแนนเอง",
      source: "ocr",
    };
  }
}
