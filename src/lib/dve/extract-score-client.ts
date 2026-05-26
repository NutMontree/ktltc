import { buildExtractedFromOcrText, type ExtractedScore } from "./parse-score-text";

/** OCR บนเบราว์เซอร์ (ฟรี) — ใช้ตอนนักเรียนอัปโหลดรูป */
export async function extractScoreFromImageFile(file: File): Promise<ExtractedScore> {
  const { createWorker } = await import("tesseract.js");
  const langPath = typeof window !== "undefined"
    ? window.location.origin + "/tessdata"
    : "/tessdata";

  const worker = await createWorker("tha+eng", 1, {
    langPath,
    gzip: false,
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
