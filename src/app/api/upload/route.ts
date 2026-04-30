import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Dynamic import เพื่อไม่ให้ Vercel bundle fs เข้าไปใน client chunk
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${ext}`;
    
    // Ensure we are saving in public directory
    const uploadDir = join(process.cwd(), 'public', folder);
    
    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the relative path which is accessible from public
    const secure_url = `/${folder}/${filename}`;

    return NextResponse.json({ 
      success: true, 
      secure_url: secure_url,
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
