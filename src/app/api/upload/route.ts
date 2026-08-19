import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // 200MB Limit fallback (200 * 1024 * 1024)
    const maxSize = parseInt(process.env.MAX_FILE_SIZE_BYTES || "209715200");
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 200MB." }, { status: 413 });
    }

    // All file types are allowed
    // The chunk upload API handles larger files, this is for files < 200MB
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');

    // Ensure uploads directory exists
    // ใช้ string interpolation แทน path.join เพื่อหลบเลี่ยง Turbopack analyzer
    const uploadDir = `${process.cwd()}/public/uploads`;
    if (!fs.existsSync(uploadDir)) {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    }

    const filepath = `${uploadDir}/${filename}`;
    await fs.promises.writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl, secure_url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
