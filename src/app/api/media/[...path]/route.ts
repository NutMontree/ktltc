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
    const filePath = join("\\\\192.168.6.118\\public", ...pathSegments);

    // Security check: ensure the file is within the Lenovo shared folder
    if (!filePath.toLowerCase().startsWith('\\\\192.168.6.118\\public')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await readFile(filePath);
    
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

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
