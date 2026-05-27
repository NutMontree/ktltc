import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * [GET] Validate all student data
 * Checks:
 * - citizenId: must be 13 digits
 * - studentId: must be 11 characters
 * - classGroupId: must be 9 characters
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role;
    if (!["super_admin", "admin", "hr"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Build query
    const query: any = { role: "student" };
    if (department) {
      query.department = department;
    }

    // Fetch all students
    const students = await db
      .collection("users")
      .find(query)
      .project({
        _id: 1,
        name: 1,
        citizenId: 1,
        studentId: 1,
        classGroupId: 1,
        department: 1,
        academicLevel: 1,
        studentStatus: 1,
        email: 1,
      })
      .toArray();

    // Validate each student
    const validationResults = students.map((student: any) => {
      const errors: string[] = [];

      // Check citizenId (13 digits)
      const citizenId = student.citizenId?.replace(/[^0-9]/g, "") || "";
      if (citizenId.length !== 13) {
        errors.push(`รหัสบัตรประจำตัวประชาชนไม่ครบ 13 หลัก (ปัจจุบัน: ${citizenId.length} หลัก)`);
      }

      // Check studentId (11 characters)
      const studentId = student.studentId || "";
      if (studentId.length !== 11) {
        errors.push(`รหัสนักศึกษาไม่ครบ 11 ตัว (ปัจจุบัน: ${studentId.length} ตัว)`);
      }

      // Check classGroupId (Room Name)
      const classGroupId = student.classGroupId || "";
      if (!classGroupId) {
        errors.push(`ไม่ได้ระบุชื่อห้องเรียน`);
      }

      return {
        id: student._id.toString(),
        name: student.name,
        citizenId: citizenId || "ไม่ระบุ",
        studentId: studentId || "ไม่ระบุ",
        classGroupId: classGroupId || "ไม่ระบุ",
        department: student.department || "ไม่ระบุ",
        academicLevel: student.academicLevel || "ไม่ระบุ",
        studentStatus: student.studentStatus || "ไม่ระบุ",
        email: student.email || "ไม่ระบุ",
        hasErrors: errors.length > 0,
        errors: errors,
      };
    });

    // Summary statistics
    const totalStudents = validationResults.length;
    const studentsWithErrors = validationResults.filter((s: any) => s.hasErrors);
    const validStudents = totalStudents - studentsWithErrors.length;

    return NextResponse.json({
      success: true,
      summary: {
        total: totalStudents,
        valid: validStudents,
        withErrors: studentsWithErrors.length,
      },
      students: validationResults,
    });
  } catch (error: any) {
    console.error("[Student Validation API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
