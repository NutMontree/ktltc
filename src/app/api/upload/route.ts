import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Dynamic import เพื่อไม่ให้ Vercel bundle fs เข้าไปใน client chunk
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const sharp = (await import('sharp')).default;

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file received.' }, { status: 400 });
    }

    // Basic server-side validation
    // Read limits from environment variables (bytes). Fallback to sensible defaults.
    const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE_BYTES) || 10 * 1024 * 1024; // 10 MB
    const MAX_VIDEO_SIZE = Number(process.env.MAX_VIDEO_SIZE_BYTES) || 200 * 1024 * 1024; // 200 MB
    const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_BYTES) || 500 * 1024 * 1024; // 500 MB for other files

    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];

    const fileSize = (file as any).size || 0;
    const fileType = file.type || 'application/octet-stream';

    // Folder sanitization: reject attempts to traverse out of public folder
    const rawFolder = folder || 'uploads';
    if (typeof rawFolder !== 'string' || rawFolder.includes('..') || rawFolder.startsWith('/')) {
      return NextResponse.json({ success: false, message: 'Invalid folder' }, { status: 400 });
    }
    const sanitizedFolder = rawFolder.replace(/[^a-zA-Z0-9_\-/]/g, '');

    // Validate size only (Allow everything else)
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: `File exceeds size limit (${MAX_FILE_SIZE} bytes)` }, { status: 413 });
    }

    const isImage = fileType.startsWith('image/');
    const isVideo = fileType.startsWith('video/');

    const buffer = Buffer.from(await file.arrayBuffer());
    // Detect extension from mime type if file name is generic "blob"
    let ext = file.name.split('.').pop() || 'jpg';
    if (ext === 'blob') {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
      };
      ext = mimeToExt[file.type] || 'jpg';
    }
    
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`;
    
    // Ensure we are saving in public directory
    const uploadDir = join(process.cwd(), 'public', sanitizedFolder);
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Optionally generate a thumbnail for videos/gifs
    let thumbnail_url: string | null = null;
    try {
      const shouldGenThumb = (process.env.ENABLE_VIDEO_THUMBNAIL || '1') === '1';
      if (shouldGenThumb) {
        const thumbName = `${filename}.thumb.jpg`;
        const thumbPath = join(uploadDir, thumbName);

        if (isVideo) {
          try {
            const { spawn } = await import('child_process');
            // Run ffmpeg to capture a frame at 1 second
            await new Promise<void>((resolve, reject) => {
              const ff = spawn('ffmpeg', ['-ss', '00:00:01', '-i', filepath, '-frames:v', '1', '-q:v', '2', thumbPath]);
              ff.on('error', (err) => reject(err));
              ff.on('close', (code) => {
                if (code === 0) resolve(); else reject(new Error(`ffmpeg exited with ${code}`));
              });
            });
            thumbnail_url = `/api/media/${sanitizedFolder}/${thumbName}`;
          } catch (fferr) {
            console.warn('Video thumbnail generation failed:', fferr);
          }
        } else if (fileType === 'image/gif') {
          try {
            // Generate a static thumbnail for GIF using sharp (first frame)
            await sharp(filepath)
              .resize(400, 400, { fit: 'cover' })
              .toFormat('jpg')
              .toFile(thumbPath);
            thumbnail_url = `/api/media/${sanitizedFolder}/${thumbName}`;
          } catch (gifErr) {
            console.warn('GIF thumbnail generation failed:', gifErr);
          }
        }
      }
    } catch (thumbErr) {
      console.warn('Thumbnail generation skipped:', thumbErr);
    }

    // Return the URL pointing to our media API route
    const secure_url = `/api/media/${folder}/${filename}`;

    return NextResponse.json({ 
      success: true, 
      secure_url: secure_url,
      thumbnail_url: thumbnail_url,
      message: 'File uploaded successfully' 
    });
  } catch (error: any) {
    console.error('Local upload error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    }, { status: 500 });
  }
}
