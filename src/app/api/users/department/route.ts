import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = 'force-dynamic';

// Normalize department name for better matching
function normalizeDept(value: string) {
  if (!value) return "";
  let normalized = (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
  normalized = normalized.replace(/แผนกวิชา/g, "").trim();
  normalized = normalized.replace(/\s+/g, " ").trim();
  return normalized;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentStr = searchParams.get("name") || "";

    if (!departmentStr) {
      return NextResponse.json({ users: [] }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Get all users with the specified roles
    const allUsers = await db
      .collection("users")
      .find({
        isActive: true,
        role: { $nin: ["student", "user", "member", "members"] }
      })
      .project({ password: 0 })
      .toArray();

    // Filter by department using normalized comparison
    const normalizedFilter = normalizeDept(departmentStr);
    const users = allUsers.filter((user: any) => {
      const normalizedDept = normalizeDept(user.department || "");
      const normalizedFaction = normalizeDept(user.faction || "");
      
      const matchDept = normalizedDept && (normalizedDept.includes(normalizedFilter) || normalizedFilter.includes(normalizedDept));
      const matchFaction = normalizedFaction && (normalizedFaction.includes(normalizedFilter) || normalizedFilter.includes(normalizedFaction));
      
      return matchDept || matchFaction;
    });

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
