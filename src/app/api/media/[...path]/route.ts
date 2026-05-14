import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    const localBase = join(process.cwd(), 'public');
    const networkBase = "\\\\192.168.6.118\\public";
    const mappedBase = "Z:\\"; // ใช้ Z:\ เพื่อให้เป็น Absolute Path ที่ถูกต้องบน Windows
    
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
      // 4. Fallback สำหรับเครื่อง Local (Dev): ถ้าหาไฟล์ไม่เจอ ให้ลองดึงจาก Server จริง (Production) มาแสดง
      if (process.env.NODE_ENV === 'development') {
        try {
          const prodUrl = `https://ktltc.ac.th/api/media/${pathSegments.join('/')}`;
          const prodRes = await fetch(prodUrl);
          
          if (prodRes.ok) {
            console.log(`🌐 Proxying Media from Production: ${prodUrl}`);
            const arrayBuffer = await prodRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // ดึง Content-Type กลับมา
            const ext = prodUrl.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeMap: Record<string, string> = {
              'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp'
            };
            
            return new NextResponse(buffer, {
              headers: {
                "Content-Type": mimeMap[ext] || 'application/octet-stream',
                "Cache-Control": "public, max-age=31536000, immutable",
              }
            });
          }
        } catch (fetchErr) {
          console.error("Proxy fetch error:", fetchErr);
        }
      }

      console.log(`❌ Media Not Found [${new Date().toLocaleString()}]:`);
      console.log(`   - Requested: ${pathSegments.join('/')}`);
      console.log(`   - Attempted Local: ${join(localBase, ...pathSegments)}`);
      console.log(`   - Attempted Network: ${join(networkBase, ...pathSegments)}`);
      console.log(`   - Attempted Mapped (Z:): ${join(mappedBase, ...pathSegments)}`);
      return new NextResponse('File not found', { status: 404 });
    }

    console.log(`✅ Media Found: ${filePath}`);

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
