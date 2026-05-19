import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET: ดึงข้อมูล ITA ทั้งหมดของปีที่กำหนด
 * Query Parameter: ?year=2568 หรือ ?year=2569
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") || "2568";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูล OIT ทั้งหมดของปีที่เลือก
    const items = await db
      .collection("ita_items")
      .find({ year: year })
      .toArray();

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET ITA Items Error:", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูล ITA ได้" },
      { status: 500 }
    );
  }
}

/**
 * POST: บันทึกหรืออัปเดตข้อมูล ITA รายหัวข้อ (O1 - O37)
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role?.toLowerCase();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ตรวจสอบสิทธิ์การเข้าถึง (เฉพาะ super_admin, admin, editor หรือผู้ที่ได้รับอนุญาต)
    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageSystem =
      rolePerms?.permissions?.manage_system ||
      ["super_admin", "admin", "editor", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "teacher", "staff"].includes(userRole);

    if (!canManageSystem) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูล ITA/OIT" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { year, oitCode, title, description, links } = body;

    if (!year || !oitCode) {
      return NextResponse.json(
        { error: "กรุณาระบุปีงบประมาณและรหัสหัวข้อ OIT (เช่น O1)" },
        { status: 400 }
      );
    }

    // บันทึกหรืออัปเดตข้อมูล (Upsert) โดยค้นหาจาก year และ oitCode
    const result = await db.collection("ita_items").updateOne(
      { year: year, oitCode: oitCode },
      {
        $set: {
          title: title || "",
          description: description || "",
          links: Array.isArray(links) ? links : [],
          updatedAt: new Date(),
          updatedBy: session.user?.name || (session.user as any)?.username || "System",
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `บันทึกข้อมูล ${oitCode} เรียบร้อยแล้ว`,
      result,
    });
  } catch (error) {
    console.error("POST ITA Item Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล ITA" },
      { status: 500 }
    );
  }
}
