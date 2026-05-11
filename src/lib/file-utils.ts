import { unlink } from 'fs/promises';
import { join } from 'path';

/**
 * file-utils.ts: ไฟล์ตัวช่วยสำหรับจัดการไฟล์บนระบบ (File System)
 * 
 * หน้าที่: 
 * - ลบไฟล์ออกจากโฟลเดอร์ public โดยอ้างอิงจาก URL ของไฟล์
 * - ตรวจสอบความปลอดภัยเพื่อป้องกันการลบไฟล์นอกขอบเขตที่อนุญาต
 */

/**
 * deleteFileFromUrl: ลบไฟล์ออกจากระบบโดยใช้ URL ที่ได้มาจาก API Media
 * 
 * รูปแบบ URL: /api/media/folder/subfolder/filename.ext
 */
export async function deleteFileFromUrl(url: string): Promise<boolean> {
  // ตรวจสอบเบื้องต้นว่าเป็น URL ของไฟล์สื่อในระบบเราหรือไม่
  if (!url || !url.startsWith('/api/media/')) {
    return false;
  }

  try {
    // 1. แปลง URL เป็น Path จริงในเครื่อง Server
    // ลบส่วน '/api/media/' ออกเพื่อให้เหลือแต่เส้นทางไฟล์ในโฟลเดอร์ public
    const relativePath = url.replace('/api/media/', '');
    const parts = relativePath.split('/');
    const filePath = join(process.cwd(), 'public', ...parts);

    // 2. ตรวจสอบความปลอดภัย (Security Check)
    // ป้องกันกรณีผู้ใช้อาจจะส่ง URL หลอกเพื่อพยายามลบไฟล์ระบบ (เช่น ../../.env)
    const publicDir = join(process.cwd(), 'public');
    if (!filePath.startsWith(publicDir)) {
      console.warn(`Security warning: Attempted to delete file outside public directory: ${filePath}`);
      return false;
    }

    // 3. ทำการลบไฟล์จริงออกจาก Disk
    await unlink(filePath);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // ถ้าหาไฟล์ไม่พบ (อาจจะถูกลบไปก่อนแล้ว) ให้ถือว่าสำเร็จ
      return true;
    }
    console.error(`Error deleting file: ${url}`, error);
    return false;
  }
}

