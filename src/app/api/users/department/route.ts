import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentStr = searchParams.get("name") || "";

    if (!departmentStr) {
      return NextResponse.json({ users: [] }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const users = await db
      .collection("users")
      .find({ department: departmentStr, isActive: true })
      .project({ password: 0 }) 
      .toArray();

    // ลำดับสิทธิ์การเข้าถึง (เรียงจากระดับบริหารลงมา)
    const roleOrder: Record<string, number> = {
      super_admin: 1,
      director: 2,
      deputy_resource: 3,
      deputy_strategy: 4,
      deputy_academic: 5,
      deputy_student_affairs: 6,
      admin: 7,
      hr: 8,
      editor: 9,
      teacher: 10,
      user: 11,
      staff: 12,
      janitor: 13,
    };

    users.sort((a, b) => {
      // 1. เรียงตาม Role
      const roleA = roleOrder[a.role] || 99;
      const roleB = roleOrder[b.role] || 99;
      if (roleA !== roleB) return roleA - roleB;
      
      // 2. ให้ความสำคัญกับผู้ที่มีตำแหน่งหัวหน้าและรองหัวหน้าขึ้นก่อน (เผื่อ Role เท่ากันเช่นเป็น Teacher เหมือนกัน)
      const isHeadA = a.position?.includes("หัวหน้าแผนก") ? 0 : 1;
      const isHeadB = b.position?.includes("หัวหน้าแผนก") ? 0 : 1;
      if (isHeadA !== isHeadB) return isHeadA - isHeadB;
      
      const isViceA = a.position?.includes("รองหัวหน้าแผนก") ? 0 : 1;
      const isViceB = b.position?.includes("รองหัวหน้าแผนก") ? 0 : 1;
      if (isViceA !== isViceB) return isViceA - isViceB;
      
      // 3. เรียงตาม orderIndex (ถ้ามีการเซ็ตไว้ในระบบ)
      if (a.orderIndex !== b.orderIndex) return (a.orderIndex || 999) - (b.orderIndex || 999);
      
      // 4. เรียงตามตัวอักษรของชื่อภาษาไทย
      return (a.name || "").localeCompare(b.name || "", 'th');
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch department users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", users: [] },
      { status: 500 }
    );
  }
}
