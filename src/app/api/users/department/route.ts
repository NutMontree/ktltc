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

    // Smart Matching to separate Staff ("งาน...") from Teachers ("แผนกวิชา...") while tolerating sloppy data entry
    const users = allUsers.filter((user: any) => {
      const userDept = (user.department || "").trim();
      const userFaction = (user.faction || "").trim();
      
      // 1. ถ้าค้นหา Staff (เช่น "งานการบัญชี")
      if (departmentStr.startsWith("งาน")) {
         // ต้องมีคำว่า "งาน..." ชัดเจน เพื่อไม่ให้ไปดึง "การบัญชี" เฉยๆ ของฝั่งครูมา
         const matchDept = userDept.includes(departmentStr);
         const matchFaction = userFaction.includes(departmentStr);
         return matchDept || matchFaction;
      }
      
      // 2. ถ้าค้นหา Teacher (เช่น "แผนกวิชาการบัญชี" หรือ "การบัญชี" ที่ส่งมาจากหน้าเว็บ)
      const academicKeywords = ["การบัญชี", "การตลาด", "ช่างยนต์", "ช่างกลโรงงาน", "ช่างเชื่อมโลหะ", "ช่างไฟฟ้ากำลัง", "ช่างอิเล็กทรอนิกส์", "เทคนิคพื้นฐาน", "ช่างก่อสร้าง", "เทคโนโลยีธุรกิจดิจิทัล", "การโรงแรม", "สามัญสัมพันธ์", "ยานยนต์ไฟฟ้า", "การจัดการสำนักงานดิจิทัล", "การจัดการโลจิสติกส์และซัพพลายเชน", "โลจิสติก์"];
      const isAcademicQuery = departmentStr.startsWith("แผนกวิชา") || academicKeywords.some(kw => departmentStr.includes(kw));
      
      if (isAcademicQuery && !departmentStr.startsWith("งาน")) {
         const coreSubject = departmentStr.replace("แผนกวิชา", "").trim(); // เช่น "การบัญชี"
         
         const checkMatch = (val: string) => {
            if (!val) return false;
            // ถ้าข้อมูลของ user มีคำว่า "งาน" (เช่น "งานการบัญชี") แปลว่าเป็นฝั่งบริหาร (Staff) ไม่ใช่ครู!
            if (val.includes("งาน")) return false;
            // ถ้าไม่มีคำว่า "งาน" และมีคำหลัก (coreSubject) ถือว่าแมตช์
            return val.includes(coreSubject);
         };
         
         return checkMatch(userDept) || checkMatch(userFaction);
      }

      // 3. Fallback สำหรับฝ่ายอื่นๆ
      return userDept.includes(departmentStr) || userFaction.includes(departmentStr);
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
