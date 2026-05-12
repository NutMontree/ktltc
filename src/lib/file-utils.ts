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
    const relativePath = url.replace('/api/media/', '');
    const parts = relativePath.split('/');
    
    const { existsSync } = require('fs');
    let filePath = join("Z:", ...parts);
    
    // ถ้าใน Z: ไม่มี ให้ลอง UNC
    if (!existsSync(filePath)) {
      filePath = join("\\\\192.168.6.118\\public", ...parts);
    }
    
    // สุดท้ายถ้ายังไม่มี ให้ลอง Local
    if (!existsSync(filePath)) {
      filePath = join(process.cwd(), 'public', ...parts);
    }

    // 2. ตรวจสอบความปลอดภัย (Security Check)
    const allowedPrefixes = [
      join(process.cwd(), 'public').toLowerCase(),
      "z:".toLowerCase(),
      "\\\\192.168.6.118\\public".toLowerCase()
    ];

    const normalizedPath = filePath.toLowerCase();
    const isAllowed = allowedPrefixes.some(prefix => normalizedPath.startsWith(prefix));

    if (!isAllowed) {
      console.warn(`Security warning: Attempted to delete file outside allowed directories: ${filePath}`);
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

