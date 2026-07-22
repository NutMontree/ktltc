import { NextResponse } from 'next/server';
import { createReadStream, promises as fsPromises } from 'fs';
import { join } from 'path';
import { getPublicDir } from '@/lib/cwd';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    
    // We only use the local public directory now
    const localBase = getPublicDir();
    const filePath = join(localBase, ...pathSegments);
    
    let found = false;
    try {
      await fsPromises.access(filePath);
      found = true;
    } catch {
      found = false;
    }

    if (!found) {
      // Fallback for Local Dev environment: try to fetch from production
      if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        try {
          const prodUrl = `https://ktltc.ac.th/api/media/${pathSegments.join('/')}`;
          
          // Added a timeout of 3 seconds to avoid hanging when production is down
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const prodRes = await fetch(prodUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (prodRes.ok) {
            console.log(`🌐 Proxying Media from Production: ${prodUrl}`);
            const arrayBuffer = await prodRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
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
        } catch (fetchErr: any) {
          console.error(`Proxy fetch error for ${pathSegments.join('/')}:`, fetchErr.message || fetchErr);
        }
      }

      console.log(`❌ Media Not Found [${new Date().toLocaleString()}]:`);
      console.log(`   - Requested: ${pathSegments.join('/')}`);
      console.log(`   - Attempted Local: ${filePath}`);
      return new NextResponse('File not found', { status: 404 });
    }

    console.log(`✅ Media Found: ${filePath}`);

    // Security check: ensure the file is within public directory
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const normalizedBase = localBase.replace(/\\/g, '/').toLowerCase();
    const isAllowed = normalizedPath.startsWith(normalizedBase);

    if (!isAllowed) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const stream = createReadStream(filePath);
    
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
      'blob': 'image/jpeg',
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

    return new NextResponse(stream as any, { headers });
  } catch (error) {
    console.error('Media serve error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
