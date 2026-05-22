import { readFile } from "fs/promises";
import { join } from "path";
import { isDveEvidenceImage } from "./evidence-file";
import { ocrImageSource } from "./ocr-tesseract";
import type { ExtractedScore } from "./parse-score-text";

export type { ExtractedScore } from "./parse-score-text";
export { parseScoreFromText, buildExtractedFromOcrText, formatScoreDisplay } from "./parse-score-text";

/** แปลง URL รูปในระบบ (/api/media/...) เป็น path ไฟล์ใน public */
export function resolveLocalMediaPath(imageUrl: string): string | null {
  const trimmed = imageUrl.trim();
  let pathPart = trimmed;
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const u = new URL(trimmed);
      pathPart = u.pathname;
    }
  } catch {
    return null;
  }

  const match = pathPart.match(/^\/api\/media\/(.+)$/);
  if (!match) return null;

  const rel = match[1].replace(/\\/g, "/");
  if (rel.includes("..")) return null;

  return join(process.cwd(), "public", rel);
}

/** อ่านคะแนนจากไฟล์รูปบนเซิร์ฟเวอร์ (Tesseract OCR ฟรี) */
export async function extractScoreFromLocalFile(filePath: string): Promise<ExtractedScore> {
  try {
    const buffer = await readFile(filePath);
    return ocrImageSource(buffer);
  } catch (err) {
    console.error("[DVE extract-score] local file read failed:", err);
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "ไม่พบหรือเข้าถึงไฟล์รูปหลักฐานในระบบไม่ได้",
      source: "ocr",
    };
  }
}

/** อ่านคะแนนจาก URL รูปในระบบ (/api/media/...) */
export async function extractScoreFromImageUrl(imageUrl: string): Promise<ExtractedScore> {
  const localPath = resolveLocalMediaPath(imageUrl);
  if (!localPath) {
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "URL รูปไม่รองรับ (ต้องเป็นไฟล์ที่อัปโหลดในระบบ)",
      source: "ocr",
    };
  }

  if (!isDveEvidenceImage(imageUrl)) {
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "OCR รองรับเฉพาะรูปภาพ — PDF/Word ให้กรอกคะแนนเอง",
      source: "ocr",
    };
  }

  try {
    return await extractScoreFromLocalFile(localPath);
  } catch (err) {
    console.error("[DVE extract-score] file read error:", err);
    return {
      score: null,
      maxScore: null,
      confidence: "low",
      note: "อ่านไฟล์รูปไม่สำเร็จ",
      source: "ocr",
    };
  }
}

/** อ่านคะแนนจากไฟล์ที่อัปโหลดมา (multipart) */
export async function extractScoreFromUpload(
  buffer: Buffer,
  _mimeType?: string,
): Promise<ExtractedScore> {
  return ocrImageSource(buffer);
}
