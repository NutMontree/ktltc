import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * API นี้ทำหน้าที่เป็น Proxy เพื่อดึงไฟล์จาก Network Drive (Z:) 
 * มาแสดงผลบนหน้าเว็บโดยที่ไม่ต้องก๊อบปี้ไฟล์ลงในเครื่อง PC
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 1. รับค่า Path ของไฟล์ที่ต้องการ (เช่น uploads/image.jpg)
    const { path: filePathArray } = await params;
    const filePath = filePathArray.join("/");
    
    // 2. กำหนดตำแหน่งไฟล์บน Lenovo Network Drive (UNC Path)
    const fullPath = path.join("\\\\192.168.6.179\\public", filePath);

    // 3. ตรวจสอบว่าไฟล์มีอยู่จริงหรือไม่
    if (!fs.existsSync(fullPath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    // 4. อ่านไฟล์
    const fileBuffer = fs.readFileSync(fullPath);
    
    // 5. ตรวจสอบประเภทไฟล์ (Manual Mime Type Detection)
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    // 6. ส่งไฟล์กลับไปแสดงผล
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Lenovo Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
