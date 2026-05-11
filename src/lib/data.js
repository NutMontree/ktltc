import clientPromise from "@/lib/db";

/**
 * data.js: ไฟล์สำหรับฟังก์ชันดึงข้อมูลดิบ (Data Fetching Helpers)
 * 
 * หน้าที่: 
 * - รวบรวมฟังก์ชันสำหรับดึงข้อมูลจากฐานข้อมูลโดยตรง (Server-side) 
 * - เพื่อใช้ใน Server Components หรือ API Routes
 */

/**
 * getAllTickets: ดึงรายการตั๋ว (Tickets) ทั้งหมดจากฐานข้อมูล
 */
export async function getAllTickets() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const tickets = await db.collection("tickets").find({}).toArray();

    return { tickets };
  } catch (error) {
    console.error("❌ Error fetching tickets directly:", error);
    return { tickets: [] };
  }
}

