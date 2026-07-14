import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

/**
 * PATCH: สำหรับจัดลำดับแบนเนอร์ใหม่ (Reorder)
 * รับข้อมูลเป็น Array ของวัตถุที่มี id และ order ใหม่
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. ตรวจสอบสิทธิ์การเข้าถึง (Authentication & Authorization)
    const session = await auth();

    // ตรวจสอบว่า Login หรือไม่ และมีสิทธิ์ที่เหมาะสมหรือไม่
    if (
      !session ||
      !session.user.role ||
      !["super_admin", "admin", "editor"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "สิทธิ์การเข้าถึงไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    // 2. รับข้อมูลจาก Body
    const body = await req.json();
    const { orders } = body; // คาดหวังรูปแบบ: [{ id: "...", order: 1 }, { id: "...", order: 2 }]

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: "รูปแบบข้อมูลไม่ถูกต้อง (ต้องเป็น Array)" },
        { status: 400 },
      );
    }

    // 3. เชื่อมต่อฐานข้อมูล
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 4. เตรียม Operation สำหรับ BulkWrite เพื่อประสิทธิภาพสูงสุด
    const bulkOps = orders.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: new ObjectId(item.id) },
        update: { $set: { order: item.order, updatedAt: new Date() } },
      },
    }));

    // 5. ดำเนินการอัปเดตแบบกลุ่ม (Bulk Execution)
    const result = await db.collection("banners").bulkWrite(bulkOps);

    // 6. บันทึก Log การทำงาน (Audit Log)
    await db.collection("logs").insertOne({
      userName: session.user?.name || "System_Kernel",
      action: "REORDER_BANNERS",
      details: `จัดลำดับแบนเนอร์ใหม่จำนวน ${orders.length} รายการ`,
      module: "BANNERS",
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: "จัดลำดับแบนเนอร์สำเร็จ",
      modifiedCount: result.modifiedCount,
    });
  } catch (error: any) {
    console.error("Reorder API Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการจัดลำดับข้อมูล" },
      { status: 500 },
    );
  }
}
