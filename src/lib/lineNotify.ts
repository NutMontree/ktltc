/**
 * lineNotify.ts: ไฟล์สำหรับส่งการแจ้งเตือนไปยังแอปพลิเคชัน LINE
 * 
 * หน้าที่: 
 * - ส่งข้อความแจ้งเตือนผ่านบริการ LINE Notify API
 * - ใช้แจ้งเตือนเหตุการณ์สำคัญ เช่น มีการแจ้งลางานใหม่ หรือมีคำถามใหม่ในระบบ
 */

/**
 * sendLineNotify: ส่งข้อความไปยังกลุ่มหรือแชท LINE ที่ตั้งค่าไว้
 * @param message ข้อความที่ต้องการส่ง
 */
export async function sendLineNotify(message: string) {
  const token = process.env.LINE_NOTIFY_TOKEN; // ดึง Token จากไฟล์ .env
  
  if (!token) {
    console.warn("⚠️ LINE_NOTIFY_TOKEN ไม่ได้ถูกตั้งค่าในระบบ");
    return false;
  }

  try {
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}` // ส่ง Token เพื่อยืนยันตัวตน
      },
      body: new URLSearchParams({ message }) // ส่งข้อความในรูปแบบ URL Params
    });
    return res.ok;
  } catch (error) {
    console.error("❌ Line Notify Error:", error);
    return false;
  }
}

