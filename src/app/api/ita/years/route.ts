import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    let yearsDoc = await db.collection("ita_years").find({}).toArray();
    
    // Ensure "2568" and "2569" are seeded
    const has2568 = yearsDoc.some(y => y.year === "2568");
    const has2569 = yearsDoc.some(y => y.year === "2569");
    
    if (!has2568 || !has2569) {
      const toInsert = [];
      if (!has2568) toInsert.push({ year: "2568", createdAt: new Date() });
      if (!has2569) toInsert.push({ year: "2569", createdAt: new Date() });
      if (toInsert.length > 0) {
        await db.collection("ita_years").insertMany(toInsert);
      }
      yearsDoc = await db.collection("ita_years").find({}).toArray();
    }
    
    const years = yearsDoc.map(y => y.year).sort();
    
    return NextResponse.json({ years });
  } catch (error: any) {
    console.error("GET ITA Years Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session?.user as any)?.role?.toLowerCase();
    const ALLOWED_OIT_ROLES = [
      "super_admin",
      "admin",
      "editor",
      "hr",
      "director",
      "deputy_resource",
      "deputy_strategy",
      "deputy_academic",
      "deputy_student_affairs",
      "teacher",
      "staff"
    ];

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const rolePerms = await db.collection("role_permissions").findOne({ role: userRole });
    const canManageSystem =
      rolePerms?.permissions?.manage_system ||
      ALLOWED_OIT_ROLES.includes(userRole);

    if (!canManageSystem) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ในการเพิ่มปีงบประมาณ" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { year } = body;

    if (!year || !/^\d{4}$/.test(year)) {
      return NextResponse.json(
        { error: "กรุณาระบุปีงบประมาณเป็นตัวเลข 4 หลัก (เช่น 2570)" },
        { status: 400 }
      );
    }

    const existing = await db.collection("ita_years").findOne({ year });
    if (existing) {
      return NextResponse.json(
        { error: `ปีงบประมาณ ${year} มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    await db.collection("ita_years").insertOne({ year, createdAt: new Date() });

    await db.collection("logs").insertOne({
      userName: session.user?.name || (session.user as any)?.username || "System",
      action: "ADD_ITA_YEAR",
      details: `เพิ่มปีงบประมาณสำหรับการประเมิน OIT: ${year}`,
      timestamp: new Date(),
      role: userRole
    });

    return NextResponse.json({ success: true, message: `เพิ่มปีงบประมาณ ${year} เรียบร้อยแล้ว` });
  } catch (error: any) {
    console.error("POST ITA Year Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
