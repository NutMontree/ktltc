import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

/**
 * POST: บันทึกข้อมูลการติดต่อ/ข้อความจากหน้าเว็บ (Contact Form) ลงฐานข้อมูล
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // ตรวจสอบความถูกต้องของข้อมูลพื้นฐาน
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // บันทึกข้อความลงใน Collection: contact_messages
    const result = await db.collection("contact_messages").insertOne({
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
      status: "unread", // ค่าเริ่มต้น: ยังไม่ได้อ่าน
    });

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความเรียบร้อยแล้ว ข้อมูลถูกบันทึกสำเร็จ",
      messageId: result.insertedId,
    });
  } catch (error) {
    console.error("POST Contact Message Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดทางเทคนิค ไม่สามารถส่งข้อความได้" },
      { status: 500 }
    );
  }
}
