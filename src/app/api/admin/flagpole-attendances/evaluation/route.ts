import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    const allowedRoles = [
      "super_admin", "admin", "editor", "teacher", "hr", "director", "staff",
      "deputy_student_affairs", "deputy_academic", "deputy_strategy", "deputy_resource"
    ];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const departmentFilter = searchParams.get('department') || '';
    const classGroupFilter = searchParams.get('classGroupId') || '';

    if (!startDateParam || !endDateParam) {
      return NextResponse.json({ success: false, message: "กรุณาระบุวันที่เริ่มต้นและสิ้นสุด" }, { status: 400 });
    }

    const startD = new Date(`${startDateParam}T00:00:00.000+07:00`);
    const endD = new Date(`${endDateParam}T23:59:59.999+07:00`);

    if (startD > endD) {
      return NextResponse.json({ success: false, message: "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด" }, { status: 400 });
    }

    const diffDays = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      return NextResponse.json({ success: false, message: "ช่วงเวลาต้องไม่เกิน 365 วัน" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ค้นหานักศึกษาตามตัวกรอง
    const userQuery: any = { role: "student" };
    if (departmentFilter) userQuery.department = departmentFilter;
    if (classGroupFilter) userQuery.classGroupId = classGroupFilter;

    const allMatchingUsers = await db.collection("users")
      .find(userQuery)
      .project({ name: 1, academicLevel: 1, studentId: 1, department: 1, classGroupId: 1, email: 1 })
      .toArray();

    if (allMatchingUsers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userMap = new Map<string, any>();
    const userIdsStr: string[] = [];
    const userIdsObj: any[] = [];

    allMatchingUsers.forEach(u => {
      const idStr = u._id.toString();
      userIdsStr.push(idStr);
      userIdsObj.push(u._id);
      userMap.set(idStr, u);
    });

    // 2. คำนวณจำนวนวันเข้าแถว (เฉพาะวันจันทร์-ศุกร์)
    let totalDays = 0;
    const current = new Date(startD.getTime() + 7 * 60 * 60 * 1000);
    current.setUTCHours(0, 0, 0, 0);
    const limitD = new Date(endD.getTime() + 7 * 60 * 60 * 1000);
    limitD.setUTCHours(0, 0, 0, 0);

    while (current <= limitD) {
      const dayOfWeek = current.getUTCDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // 3. ดึงรายการเข้าแถวของนักศึกษาในกลุ่มนี้ในช่วงเวลา
    const attendances = await db.collection("flagpole_attendances").find({
      date: { $gte: startD, $lte: endD },
      userId: { $in: [...userIdsStr, ...userIdsObj] }
    }).project({ userId: 1, date: 1, status: 1 }).toArray();

    // 4. จัดกลุ่มการเช็คชื่อตามนักศึกษา (แยกวัน)
    const userStats: Record<string, { presentDates: Set<string>; lateDates: Set<string> }> = {};

    attendances.forEach(a => {
      if (!a.userId) return;
      const uIdStr = a.userId.toString();
      if (!userMap.has(uIdStr)) return;

      if (!userStats[uIdStr]) {
        userStats[uIdStr] = { presentDates: new Set(), lateDates: new Set() };
      }

      const d = new Date(a.date);
      const thaiTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const dStr = thaiTime.toISOString().split('T')[0];

      if (a.status === "Present") {
        userStats[uIdStr].presentDates.add(dStr);
      } else if (a.status === "Late") {
        userStats[uIdStr].lateDates.add(dStr);
      }
    });

    // 5. สรุปผลรายนักศึกษา
    const evaluatedList = allMatchingUsers.map(u => {
      const uIdStr = u._id.toString();
      const stats = userStats[uIdStr] || { presentDates: new Set(), lateDates: new Set() };
      
      const present = stats.presentDates.size;
      const late = stats.lateDates.size;
      const presentLate = present + late;
      const absent = Math.max(0, totalDays - presentLate);
      const total = totalDays;
      const percent = total > 0 ? ((presentLate / total) * 100).toFixed(2) : "0.00";

      return {
        id: uIdStr,
        studentId: u.studentId || "-",
        name: u.name || "-",
        department: u.department || "-",
        classGroupId: u.classGroupId || "-",
        academicLevel: u.academicLevel || "-",
        present,
        late,
        absent,
        total,
        percent
      };
    });

    // เรียงตาม แผนกวิชา -> ห้องเรียน -> ชื่อ
    evaluatedList.sort((a, b) => {
      if (a.department !== b.department) return a.department.localeCompare(b.department, 'th');
      if (a.classGroupId !== b.classGroupId) return a.classGroupId.localeCompare(b.classGroupId, 'th');
      return a.name.localeCompare(b.name, 'th');
    });

    return NextResponse.json({ success: true, data: evaluatedList, totalStudents: evaluatedList.length });
  } catch (error: any) {
    console.error("Flagpole evaluation API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
