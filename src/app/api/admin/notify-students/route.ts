import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [POST] Send notifications to students with data validation errors
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role;
    if (!["super_admin", "admin", "hr"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { studentIds, customMessage } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "Invalid student IDs" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const senderId = (session.user as any).id;
    const sender = await db.collection("users").findOne({ _id: new ObjectId(senderId) });

    const defaultTitle = "แจ้งเตือน: กรุณาตรวจสอบและแก้ไขข้อมูลส่วนตัว";
    const defaultMessage = "เรียน นักเรียน/นักศึกษาที่เกียรติ\n\n" +
      "ระบบตรวจพบว่าข้อมูลส่วนตัวของคุณยังไม่ครบถ้วนหรือไม่ถูกต้อง กรุณาตรวจสอบและแก้ไขข้อมูลดังนี้:\n" +
      "• รหัสบัตรประจำตัวประชาชน (13 หลัก)\n" +
      "• รหัสนักศึกษา (11 ตัว)\n" +
      "• รหัสกลุ่มเรียน (9 ตัว)\n\n" +
      "กรุณาเข้าไปแก้ไขข้อมูลให้เรียบร้อย เพื่อประโยชน์ในการติดตามผลการศึกษาและการจัดการข้อมูลของทางวิทยาลัย\n\n" +
      "ขอบคุณค่ะ/ครับ";

    const title = customMessage?.title || defaultTitle;
    const message = customMessage?.message || defaultMessage;

    // Create notifications for each student
    const notifications = studentIds.map((studentId: string) => ({
      userId: new ObjectId(studentId),
      title: title,
      message: message,
      type: "warning",
      isRead: false,
      read: false,
      from: senderId,
      fromName: sender?.name || "ผู้ดูแลระบบ",
      fromImage: sender?.image || null,
      targetUrl: `/dashboard/profile/${studentId}`,
      createdAt: new Date(),
    }));

    const result = await db.collection("notifications").insertMany(notifications);

    return NextResponse.json({
      success: true,
      message: `ส่งการแจ้งเตือนไปยังนักเรียน ${studentIds.length} คนเรียบร้อยแล้ว`,
      insertedCount: result.insertedCount,
    });
  } catch (error: any) {
    console.error("[Notify Students API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
