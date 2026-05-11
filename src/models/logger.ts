import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * ฟังก์ชันสำหรับการบันทึก Log กิจกรรมของผู้ใช้งานลงในฐานข้อมูล
 * 
 * หน้าที่: 
 * 1. บันทึกประวัติการกระทำต่างๆ ของผู้ใช้ลงในคอลเลกชัน 'logs'
 * 2. อัปเดตสถานะการใช้งานล่าสุดของผู้ใช้ลงในคอลเลกชัน 'users'
 * 
 * พารามิเตอร์:
 * - userId: ไอดีของผู้ใช้
 * - userName: ชื่อของผู้ใช้
 * - action: การกระทำที่เกิดขึ้น (เช่น LOGIN, UPDATE)
 * - details: รายละเอียดของการกระทำนั้นๆ
 * - req: วัตถุ Request ของ Next.js (ใช้สำหรับดึง IP Address)
 * 
 * ความเชื่อมโยง:
 * - เรียกใช้จาก API ต่างๆ เช่น /api/auth/login, /api/admin/users เป็นต้น
 */
export async function recordLog({
  userId,
  userName,
  action,
  details,
  req,
}: any) {
  // 1. เชื่อมต่อฐานข้อมูล MongoDB
  const client = await clientPromise;
  const db = client.db("ktltc_db");

  // 2. บันทึกกิจกรรมลงใน Collection "logs"
  await db.collection("logs").insertOne({
    userId: new ObjectId(userId), // แปลง string เป็น ObjectId
    userName,
    action, // LOGIN, UPDATE_USER_INFO, CHANGE_ROLE, etc.
    details,
    timestamp: new Date(), // บันทึกเวลาที่เกิดเหตุการณ์
    // ดึง IP Address จาก Headers (รองรับกรณีผ่าน Proxy/Vercel)
    ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
  });

  // 3. อัปเดตเวลาใช้งานล่าสุด (lastActive) ใน Collection "users" 
  // เพื่อใช้ในการแสดงผลว่าผู้ใช้งานออนไลน์ล่าสุดเมื่อไหร่ หรือคำนวณระยะเวลาที่อยู่ในระบบ
  await db
    .collection("users")
    .updateOne(
      { _id: new ObjectId(userId) },
      { $set: { lastActive: new Date() } },
    );
}

