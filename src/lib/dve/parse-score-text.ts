export type ExtractedScore = {
  score: string | null;
  maxScore: string | null;
  confidence: "high" | "medium" | "low";
  note: string;
  source: "ocr";
  rawText?: string;
};

export function formatScoreDisplay(score: string | null, maxScore: string | null): string | null {
  if (!score) return null;
  if (maxScore) return `${score}/${maxScore}`;
  return score;
}

/** ดึงคะแนนจากข้อความ OCR — เน้น Google Forms 「คะแนนรวม」 */
export function parseScoreFromText(text: string): Pick<ExtractedScore, "score" | "maxScore"> {
  if (!text?.trim()) return { score: null, maxScore: null };

  const normalized = text.replace(/\s+/g, " ");

  // Preprocess common Thai OCR errors:
  // - "ก" (Kor Kai) often visually merges from "/" and "1", so "1ก" is actually "1/1"
  // - "+" is often read instead of "1"
  // - Curly quotes like "”" or "“" are often read instead of "1"
  const preprocessed = normalized
    .replace(/(\d+)\s*ก/g, "$1/1")
    .replace(/\+/g, "1")
    .replace(/[””“]/g, "1");

  const googleTotal = preprocessed.match(/คะแนนรวม[\s\S]{0,120}?(\d+)\s*[\/|\\lI]\s*(\d+)/i);
  if (googleTotal) {
    return { score: googleTotal[1], maxScore: googleTotal[2] };
  }

  const patterns: { re: RegExp; combined?: boolean }[] = [
    { re: /(?:คะแนนรวม|total\s*score)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*[\/|\\lI]\s*(\d+(?:\.\d+)?)/i, combined: true },
    { re: /(?:คะแนนรวม|total\s*score)\s*[:：]?\s*(\d+(?:\.\d+)?)/i },
    { re: /(?:คะแนน|score)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*[\/|\\lI]\s*(\d+(?:\.\d+)?)/i, combined: true },
    { re: /(?:คะแนน|score)\s*[:：]?\s*(\d+(?:\.\d+)?)/i },
    { re: /(?:รวม|total)\s*[:：]?\s*(\d+(?:\.\d+)?)/i },
  ];

  for (const { re, combined } of patterns) {
    const m = preprocessed.match(re);
    if (!m?.[1]) continue;
    const n = parseFloat(m[1]);
    if (Number.isNaN(n) || n < 0 || n > 1000) continue;
    if (combined && m[2]) {
      return { score: String(m[1]), maxScore: String(m[2]) };
    }
    return { score: String(m[1]), maxScore: null };
  }

  const fractions = [...preprocessed.matchAll(/(\d+)\s*[\/|\\lI]\s*(\d+)/g)];
  if (fractions.length === 1) {
    return { score: fractions[0][1], maxScore: fractions[0][2] };
  }
  if (fractions.length > 1) {
    const last = fractions[fractions.length - 1];
    return { score: last[1], maxScore: last[2] };
  }

  return { score: null, maxScore: null };
}

/** สร้างผลลัพธ์จากข้อความที่ OCR อ่านได้ */
export function buildExtractedFromOcrText(text: string): ExtractedScore {
  const parsed = parseScoreFromText(text);
  const display = formatScoreDisplay(parsed.score, parsed.maxScore);

  let confidence: ExtractedScore["confidence"] = "low";
  if (display) {
    confidence = /คะแนนรวม/i.test(text) ? "high" : "medium";
  }

  return {
    score: display,
    maxScore: parsed.maxScore,
    confidence,
    note: display
      ? `อ่านจากรูปอัตโนมัติ (OCR ฟรี): คะแนนรวม ${display}`
      : "ไม่พบคะแนนในรูป — กรุณากรอกคะแนนเอง หรือถ่ายให้ชัดขึ้น",
    source: "ocr",
  };
}
