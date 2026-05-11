import clientPromise from "@/lib/db";

/**
 * ฟังก์ชันสำหรับการบันทึก Log กิจกรรมของผู้ใช้งาน (เวอร์ชัน JavaScript)
 * 
 * หน้าที่: บันทึกประวัติการกระทำต่างๆ ของผู้ใช้ลงในคอลเลกชัน 'logs'
 * 
 * ความเชื่อมโยง:
 * - ใช้ในส่วนของ API หรือไฟล์ JavaScript อื่นๆ ที่ยังไม่ได้เปลี่ยนเป็น TypeScript
 * - มีความคล้ายคลึงกับ src/models/logger.ts
 */
export async function recordLog({ userId, userName, action, details, req }) {
  try {
    // 1. เชื่อมต่อฐานข้อมูล MongoDB ผ่าน clientPromise
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 2. ดึง IP Address ของผู้ใช้งาน
    // ตรวจสอบทั้งจาก Header (x-forwarded-for) และ req.ip
    const ip = req?.headers?.get("x-forwarded-for") || req?.ip || "unknown";

    // 3. บันทึกข้อมูลลงในคอลเลกชัน "logs"
    await db.collection("logs").insertOne({
      userId,        // ไอดีผู้ใช้งาน
      userName,      // ชื่อผู้ใช้งาน
      action,        // กิจกรรมที่ทำ (เช่น LOGIN, UPDATE)
      details,       // รายละเอียดเพิ่มเติม
      ip,            // หมายเลข IP
      timestamp: new Date() // เวลาที่บันทึก
    });
  } catch (err) {
    // กรณีบันทึกไม่สำเร็จ ให้แสดง Error ใน Console
    console.error("Failed to record log:", err);
  }
}

