export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * [GET] ดึงการตั้งค่าเวลาเข้า-ออกงานตาม Role
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session?.user as any)?.role?.toLowerCase();
    
    // We allow all authenticated users to GET the settings so they can see their check-in rules.
    // The allowedRoles restriction will only apply to the PATCH method.

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const settings = (await db.collection("role_settings").find({}).toArray()) as any[];

    // กำหนดค่า Default ที่ต้องมีแน่ๆ
    const defaultRequired = [
      { role: "teacher", roleName: "ครู (Teacher)", checkInStart: "05:00", checkInLimit: "08:00", checkOutStart: "16:30", checkOutEnd: "18:00" },
      { role: "staff", roleName: "เจ้าหน้าที่ (Staff)", checkInStart: "05:00", checkInLimit: "07:30", checkOutStart: "16:30", checkOutEnd: "18:00" },
      { role: "janitor", roleName: "แม่บ้าน/นักการ (Maid/Janitor)", checkInStart: "05:00", checkInLimit: "07:00", checkOutStart: "16:00", checkOutEnd: "18:00" },
      { role: "student", roleName: "นักเรียน (Student)", checkInStart: "05:00", checkInLimit: "08:30", checkOutStart: "15:30", checkOutEnd: "18:00" },
      { 
        role: "system_global", 
        roleName: "การตั้งค่าระบบภาพรวม", 
        checkInStart: "05:00", 
        lateThreshold: "08:00",
        checkOutStart: "16:30", 
        checkOutEnd: "18:00", 
        systemLockStart: "18:01", 
        systemLockEnd: "04:59",
        // การตั้งค่าระยะทาง
        inSiteDistance: 200, // เมตร (ในพื้นที่)
        wfhMaxDistance: 200, // กิโลเมตร (นอกพื้นที่ / WFH)
      },
    ];

    // ผสานข้อมูล (Merge): ใช้ข้อมูลจาก DB ถ้ามี ถ้าไม่มีให้ใช้จาก Default
    const finalSettings = defaultRequired.map(def => {
      const found = settings.find(s => s.role === def.role);
      return found ? { ...def, ...found } : def;
    });

    // เพิ่มเติม: ถ้าใน DB มี Role อื่นๆ นอกเหนือจาก Default (เช่น อนาคตเพิ่ม Role เอง) ให้ส่งไปด้วย
    settings.forEach(s => {
      if (!defaultRequired.find(def => def.role === s.role)) {
        finalSettings.push(s);
      }
    });

    return NextResponse.json(finalSettings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [PATCH] อัปเดตการตั้งค่าเวลาตาม Role
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role?.toLowerCase();
    
    // Consistent with middleware's admin roles
    const allowedRoles = ["super_admin", "admin", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "editor", "staff"];

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.error(`[API/role-settings] Update Unauthorized: role=${userRole}`);
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const body = await req.json();
    const { role, roleName } = body;

    if (!role) {
      return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // สร้างก้อนข้อมูลที่จะ Update (กรองเอาเฉพาะที่มีค่าส่งมา)
    const updateData: any = { ...body, updatedAt: new Date() };
    delete updateData._id; // ป้องกันการ overwrite _id

    const result = await db.collection("role_settings").updateOne(
      { role },
      { $set: updateData },
      { upsert: true }
    );

    // บันทึก Log
    await db.collection("logs").insertOne({
      userName: (session?.user as any)?.name || "Admin",
      action: "UPDATE_ROLE_SETTINGS",
      details: `อัปเดตเวลาเข้างานของ ${roleName || role}: ${body.checkInLimit || "N/A"}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: userRole
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
