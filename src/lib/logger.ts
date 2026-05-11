/**
 * src/lib/logger.ts: ไฟล์ตัวช่วยสำหรับบันทึกกิจกรรมฝั่ง Client (Browser)
 * 
 * หน้าที่: 
 * - ส่งข้อมูลกิจกรรมที่ผู้ใช้ทำ (เช่น กดแก้ไขข้อมูล, ลบข้อมูล) ไปบันทึกใน Audit Log ผ่าน API
 * - ใช้สำหรับติดตามความเคลื่อนไหวภายในระบบเพื่อความโปร่งใส
 */

export async function recordActivity(data: {
  userId: string;
  userName: string;
  action: string;
  details: string;
}) {
  try {
    // ส่งข้อมูลไปยัง API Route เพื่อบันทึกลงฐานข้อมูล MongoDB
    await fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("❌ Audit Log Error:", error);
  }
}

