/** ประเภทไฟล์หลักฐานคะแนน DVE ที่รองรับ */
export const DVE_EVIDENCE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i;
const PDF_EXT = /\.pdf(\?.*)?$/i;
const WORD_EXT = /\.docx?(\?.*)?$/i;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isDveEvidenceImage(fileOrUrl: File | string): boolean {
  if (typeof fileOrUrl === "string") {
    if (PDF_EXT.test(fileOrUrl) || WORD_EXT.test(fileOrUrl)) return false;
    return IMAGE_EXT.test(fileOrUrl);
  }
  return fileOrUrl.type.startsWith("image/");
}

export function getDveEvidenceKind(url: string): "image" | "pdf" | "word" | "file" {
  if (PDF_EXT.test(url)) return "pdf";
  if (WORD_EXT.test(url)) return "word";
  if (IMAGE_EXT.test(url)) return "image";
  return "file";
}

export function getDveEvidenceLabel(url: string): string {
  const kind = getDveEvidenceKind(url);
  if (kind === "pdf") return "PDF";
  if (kind === "word") return "Word";
  if (kind === "image") return "รูปภาพ";
  return "ไฟล์";
}

export function getDveEvidenceFileName(url: string): string {
  try {
    const name = url.split("/").pop() || "ไฟล์แนบ";
    return decodeURIComponent(name.split("?")[0]);
  } catch {
    return "ไฟล์แนบ";
  }
}

/** ตรวจก่อนอัปโหลด — คืนข้อความ error หรือ null ถ้าผ่าน */
export function validateDveEvidenceFile(file: File): string | null {
  const extOk = /\.(jpe?g|png|gif|webp|pdf|doc|docx)$/i.test(file.name);
  if (!ALLOWED_MIME.has(file.type) && !extOk) {
    return "รองรับเฉพาะรูปภาพ, PDF หรือ Word (.doc, .docx)";
  }
  const maxMb = 20;
  if (file.size > maxMb * 1024 * 1024) {
    return `ไฟล์ใหญ่เกิน ${maxMb} MB`;
  }
  return null;
}
