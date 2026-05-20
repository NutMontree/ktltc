import { NextResponse } from 'next/server';
import { existsSync, readFileSync, statSync, readdirSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';

export const dynamic = 'force-dynamic';

let migrated = false;

function copyRecursiveSync(src: string, dest: string) {
  if (!existsSync(src)) return;
  const stats = statSync(src);
  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    // Only copy if file doesn't exist or is different size
    if (!existsSync(dest) || statSync(src).size !== statSync(dest).size) {
      const destDir = dirname(dest);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      copyFileSync(src, dest);
      console.log(`[Migration] Copied file: ${src} -> ${dest}`);
    }
  }
}

function ensureMigration() {
  if (migrated) return;
  migrated = true;
  try {
    const cwd = process.cwd();
    // Path to the literal \\192.168.6.179\public folder
    const sourceDir = join(cwd, "\\\\192.168.6.179\\public");
    const targetDir = join(cwd, "public");
    if (existsSync(sourceDir)) {
      console.log(`🚀 [Migration] Found legacy network base: ${sourceDir}. Merging into local public...`);
      copyRecursiveSync(sourceDir, targetDir);
      console.log("✅ [Migration] Merging finished successfully.");
    }
  } catch (err: any) {
    console.error("❌ [Migration] Error during self-migration:", err.message);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Run migration check once when a media request comes in
    ensureMigration();

    const { path: pathSegments } = await params;
    
    // We only use the local public directory now
    const localBase = join(process.cwd(), 'public');
    const filePath = join(localBase, ...pathSegments);
    let found = existsSync(filePath);

    if (!found) {
      // Fallback for Local Dev environment: try to fetch from production
      if (process.env.NODE_ENV === 'development') {
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
    const normalizedPath = filePath.toLowerCase();
    const isAllowed = normalizedPath.startsWith(localBase.toLowerCase());

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

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Media serve error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
