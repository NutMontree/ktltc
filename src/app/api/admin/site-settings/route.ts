import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET: ดึงข้อมูลการตั้งค่าข้อความทั้งหมด (Site Settings)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูลทั้งหมดจาก collection site_settings
    const settings = await db.collection("site_settings").find().toArray();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET Site Settings Error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลการตั้งค่าได้" },
      { status: 500 },
    );
  }
}

/**
 * POST: บันทึกหรืออัปเดตข้อความ (Upsert)
 * รับข้อมูลในรูปแบบ { key: string, value: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Check dynamic permissions
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageSystem = rolePerms?.permissions?.manage_system || userRole === "super_admin";

    if (!session || !canManageSystem) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการเปลี่ยนค่าระบบ" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: "กรุณาระบุ Key ที่ต้องการบันทึก" },
        { status: 400 },
      );
    }

    // เจาะจงให้เฉพาะ super_admin เท่านั้นที่สามารถสลับการรับสมัครสมาชิกทั่วไปได้
    if (key === "registration_enabled" && userRole !== "super_admin") {
      return NextResponse.json(
        { error: "เฉพาะผู้ดูแลระบบระดับสูง (Super Admin) เท่านั้นที่มีสิทธิ์เปิด-ปิดการรับสมัครสมาชิกทั่วไป" },
        { status: 403 },
      );
    }

    // ใช้ updateOne พร้อม upsert: true (ถ้าไม่มีให้สร้างใหม่ ถ้ามีให้ทับค่าเดิม)
    const result = await db.collection("site_settings").updateOne(
      { key: key },
      {
        $set: {
          value: value,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อยแล้ว",
      result,
    });
  } catch (error) {
    console.error("POST Site Settings Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 },
    );
  }
}
