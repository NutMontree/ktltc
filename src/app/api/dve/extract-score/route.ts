import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDveEvidenceImage } from "@/lib/dve/evidence-file";
import {
  extractScoreFromImageUrl,
  extractScoreFromUpload,
} from "@/lib/dve/extract-score";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file || !isDveEvidenceImage(file)) {
        return NextResponse.json(
          { error: "OCR รองรับเฉพาะรูปภาพ — อัปโหลด PDF/Word ได้แต่ต้องกรอกคะแนนเอง" },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await extractScoreFromUpload(buffer, file.type);
      return NextResponse.json({ success: true, ...result });
    }

    const body = await req.json().catch(() => ({}));
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const result = await extractScoreFromImageUrl(imageUrl);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error("[DVE extract-score API] Error:", error);
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg, success: false }, { status: 500 });
  }
}
