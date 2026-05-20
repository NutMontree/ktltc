import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * upload-server.ts: ไฟล์ตัวช่วยสำหรับบันทึกไฟล์ลงบนเครื่อง Server (ฝั่ง Server-side)
 * 
 * หน้าที่: 
 * - รับข้อมูลไฟล์ในรูปแบบ Buffer หรือ Base64
 * - บันทึกไฟล์ลงในโฟลเดอร์ public/uploads (หรือโฟลเดอร์ที่ระบุ)
 * - คืนค่าเป็น URL สำหรับเข้าถึงไฟล์ผ่าน API Media
 */

/**
 * saveFileLocally: บันทึกไฟล์ลงบน Disk ของเครื่อง Server
 * @param data ข้อมูลไฟล์ (Buffer หรือ Base64 string)
 * @param folder ชื่อโฟลเดอร์ย่อยใน public
 * @param filenamePrefix คำนำหน้าชื่อไฟล์
 */
export async function saveFileLocally(
  data: string | Buffer,
  folder: string = "uploads",
  filenamePrefix: string = "file"
): Promise<string | null> {
  try {
    let buffer: Buffer;
    let ext = "jpg"; // ค่าเริ่มต้นนามสกุลไฟล์

    // 1. จัดการข้อมูล Base64 (กรณีส่งมาจาก Canvas หรือ WebCam)
    if (typeof data === "string" && data.startsWith("data:image")) {
      const matches = data.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error("รูปแบบ Base64 ไม่ถูกต้อง");
      }
      ext = matches[1]; // ดึงนามสกุลไฟล์ เช่น png, jpeg
      buffer = Buffer.from(matches[2], "base64");
    } 
    // 2. จัดการข้อมูลแบบ Buffer (กรณีอัปโหลดไฟล์ปกติ)
    else if (Buffer.isBuffer(data)) {
      buffer = data;
    } else {
      throw new Error("รูปแบบข้อมูลไม่รองรับ");
    }

    // 3. ตั้งชื่อไฟล์ใหม่เพื่อป้องกันการซ้ำกัน (Timestamp + Random)
    const filename = `${filenamePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    
    const baseDir = join(process.cwd(), "public");
    const uploadDir = join(baseDir, folder);

    // 4. ตรวจสอบและสร้างโฟลเดอร์หากยังไม่มี
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, filename);
    
    // 5. เขียนไฟล์ลงบน Disk
    await writeFile(filepath, buffer);
    console.log(`✅ Server-side file saved to: ${filepath}`);

    // คืนค่า URL ที่ชี้ไปที่ API Media ของเรา (เพื่อให้เข้าถึงไฟล์ได้ผ่าน HTTP)
    return `/api/media/${folder}/${filename}`;
  } catch (error) {
    console.error("❌ saveFileLocally Error:", error);
    return null;
  }
}

