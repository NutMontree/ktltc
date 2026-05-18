export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

const DEFAULT_SETTINGS = {
  key: "global_flagpole",
  checkInStart: "07:00",
  lateThreshold: "08:00",
  checkInEnd: "08:45",
  inSiteDistance: 200, // เมตร (รัศมีลงเวลาหน้าเสาธง)
  closedDays: [0, 6], // 0 = วันอาทิตย์, 6 = วันเสาร์
  lat: 14.754043,     // พิกัดละติจูดวิทยาลัยเริ่มต้น
  lng: 104.65807,     // พิกัดลองจิจูดวิทยาลัยเริ่มต้น
};

/**
 * [GET] ดึงการตั้งค่าเวลาเข้าแถวเสาธงของนักเรียน
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const settings = await db.collection("flagpole_settings").findOne({ key: "global_flagpole" });

    // คืนค่าการตั้งค่าจาก DB หรือ Default ในกรณีที่ยังไม่มีการบันทึกข้อมูลมาก่อน
    const finalSettings = settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;

    return NextResponse.json(finalSettings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [PATCH] อัปเดตการตั้งค่าเวลาเข้าแถวเสาธง (เฉพาะ Admin และ Super Admin)
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();

    if (!session || !["super_admin", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Unauthorized: Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const updateData = {
      ...body,
      key: "global_flagpole",
      updatedAt: new Date(),
    };
    delete updateData._id; // ป้องกันการเซ็ต _id ทับซ้อน

    const result = await db.collection("flagpole_settings").updateOne(
      { key: "global_flagpole" },
      { $set: updateData },
      { upsert: true }
    );

    // บันทึกระบบ Audit Log
    await db.collection("logs").insertOne({
      userName: (session?.user as any)?.name || (session?.user as any)?.username || "Admin",
      action: "UPDATE_FLAGPOLE_SETTINGS",
      details: `อัปเดตเวลาเข้าแถวเสาธงนักศึกษา: เริ่ม ${body.checkInStart || "N/A"} | สายหลัง ${body.lateThreshold || "N/A"} | ปิด ${body.checkInEnd || "N/A"}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: userRole,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
