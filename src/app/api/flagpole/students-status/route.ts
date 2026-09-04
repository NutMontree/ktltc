import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    // Allow teacher, admin, super_admin, director
    if (!session || !["super_admin", "admin", "teacher", "director"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim();
    const classGroupId = searchParams.get("classGroupId")?.trim();

    if (!department || !classGroupId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุแผนกวิชาและห้องเรียน" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Get all students in the specified department and class group
    const students = await db
      .collection("users")
      .find({
        role: "student",
        department: { $regex: escapeRegex(department), $options: "i" },
        classGroupId: { $regex: escapeRegex(classGroupId), $options: "i" }
      })
      .project({
        _id: 1,
        name: 1,
        studentId: 1,
        citizenId: 1,
        department: 1,
        classGroupId: 1,
      })
      .sort({ studentId: 1 })
      .toArray();

    const studentIds = students.map(s => s._id);

    // 2. Get today's attendance records for these students
    const today = new Date();
    today.setUTCHours(today.getUTCHours() + 7); // Convert to ICT roughly
    today.setUTCHours(0, 0, 0, 0); // Start of day

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendances = await db.collection("flagpole_attendances").find({
      userId: { $in: studentIds },
      date: { $gte: today, $lt: tomorrow }
    }).toArray();

    // Map attendances by userId
    const attendanceMap = new Map();
    attendances.forEach(a => {
      attendanceMap.set(a.userId.toString(), a);
    });

    // 3. Merge data
    const result = students.map((s: any) => {
      const attendance = attendanceMap.get(s._id.toString());
      return {
        id: s._id.toString(),
        name: s.name || "ไม่ระบุ",
        studentId: s.studentId || "ไม่ระบุ",
        department: s.department || "ไม่ระบุ",
        classGroupId: s.classGroupId || "ไม่ระบุ",
        checkInStatus: attendance ? attendance.status : null,
        checkInMethod: attendance?.checkIn?.statusTag || null,
        checkInTime: attendance?.checkIn?.time || null,
      };
    });

    return NextResponse.json({
      success: true,
      students: result,
      totalCount: result.length,
    });
  } catch (error: any) {
    console.error("[Flagpole Students Status API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
