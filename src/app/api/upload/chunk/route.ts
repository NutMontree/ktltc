import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { mkdir, writeFile, appendFile, unlink, rmdir, readdir } from "fs/promises";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const chunk = formData.get("chunk") as Blob;
    const fileId = formData.get("fileId") as string;
    const fileName = formData.get("fileName") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);

    if (!chunk || !fileId || !fileName || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: "Missing chunk parameters." }, { status: 400 });
    }

    const uploadDir = `${process.cwd()}/public/uploads`;
    const tempDir = `${uploadDir}/temp_${fileId}`;

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save this chunk
    const chunkPath = `${tempDir}/chunk_${chunkIndex}`;
    const buffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, buffer);

    // Check if all chunks are uploaded
    const files = await readdir(tempDir);
    if (files.length === totalChunks) {
      // All chunks are here, merge them
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const finalFileName = `${uniqueSuffix}-${safeFileName}`;
      const finalFilePath = `${uploadDir}/${finalFileName}`;
      const fileUrl = `/uploads/${finalFileName}`;

      // Create empty final file
      await writeFile(finalFilePath, "");

      // Append chunks sequentially
      for (let i = 0; i < totalChunks; i++) {
        const cPath = `${tempDir}/chunk_${i}`;
        const cBuffer = await fs.promises.readFile(cPath);
        await appendFile(finalFilePath, cBuffer);
        // Delete chunk after appending to save space
        await unlink(cPath);
      }

      // Remove temp directory
      await rmdir(tempDir);

      return NextResponse.json({ success: true, url: fileUrl, secure_url: fileUrl, merged: true });
    }

    return NextResponse.json({ success: true, merged: false });
  } catch (error) {
    console.error("Chunk Upload error:", error);
    return NextResponse.json({ error: "Failed to process chunk." }, { status: 500 });
  }
}
