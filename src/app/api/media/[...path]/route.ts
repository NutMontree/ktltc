import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    const { existsSync, readFileSync } = require('fs');
    const localBase = join(process.cwd(), 'public');
    const networkBase = "\\\\192.168.6.118\\public";
    const mappedBase = "Z:"; // เพิ่มการรองรับไดรฟ์ Z: ที่มีการ Map ไว้
    
    // 1. ลองหาที่ไดรฟ์ Z: (Lenovo) เป็นอันดับแรก
    let filePath = join(mappedBase, ...pathSegments);
    let found = existsSync(filePath);
    
    // 2. ถ้าในเครื่องไม่มี ให้ลองหาที่ Network UNC
    if (!found) {
      const networkPath = join(networkBase, ...pathSegments);
      if (existsSync(networkPath)) {
        filePath = networkPath;
        found = true;
      }
    }

    // 3. สุดท้ายถ้ายังไม่เจออีก ให้ลองหาที่ Local (เผื่อเป็นไฟล์เก่าหรือไฟล์ระบบ)
    if (!found) {
      const localPath = join(localBase, ...pathSegments);
      if (existsSync(localPath)) {
        filePath = localPath;
        found = true;
      }
    }

    if (!found) {
      console.log(`❌ Not found anywhere:`);
      console.log(`   - Local: ${join(localBase, ...pathSegments)}`);
      console.log(`   - Network: ${join(networkBase, ...pathSegments)}`);
      console.log(`   - Mapped (Z:): ${join(mappedBase, ...pathSegments)}`);
      return new NextResponse('File not found', { status: 404 });
    }

    // Security check: ensure the file is within allowed directories
    const normalizedPath = filePath.toLowerCase();
    const isAllowed = normalizedPath.startsWith(localBase.toLowerCase()) || 
                      normalizedPath.startsWith(networkBase.toLowerCase()) ||
                      normalizedPath.startsWith(mappedBase.toLowerCase()) ||
                      normalizedPath.startsWith("\\\\192.168.6.118");

    if (!isAllowed) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = readFileSync(filePath);
    
    // Determine content type based on extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'blob': 'image/jpeg', // Fallback for the .blob files I saw
      // Video types
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'm4v': 'video/x-m4v',
    };

    if (ext && mimeMap[ext]) {
      contentType = mimeMap[ext];
    }

    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("download") === "1";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (isDownload) {
      const fileName = encodeURIComponent(pathSegments[pathSegments.length - 1]);
      headers["Content-Disposition"] = `attachment; filename*=UTF-8''${fileName}`;
    }

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Media serve error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
