import { buildExtractedFromOcrText, type ExtractedScore } from "./parse-score-text";

/** OCR บนเบราว์เซอร์ (ฟรี) — ใช้ตอนนักเรียนอัปโหลดรูป */
export async function extractScoreFromImageFile(file: File): Promise<ExtractedScore> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("tha+eng", 1, {
    langPath: "https://cdn.jsdelivr.net/npm/tesseract.js-data@1.0.1",
    logger: (m: any) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[DVE OCR Client]", m);
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    const extracted = buildExtractedFromOcrText(data.text || "");
    extracted.rawText = data.text || "";
    return extracted;
  } catch (err) {
    console.error("[DVE OCR client] error:", err);
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "อ่านข้อความจากรูปไม่สำเร็จ — กรุณากรอกคะแนนเอง",
      source: "ocr",
    };
  } finally {
    await worker.terminate();
  }
}
