import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [GET] Check current student's data validation status
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const userRole = (session.user as any)?.role;

    if (userRole !== "student") {
      return NextResponse.json({ error: "This endpoint is for students only" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Get student data
    const student = await db.collection("users").findOne({ _id: new ObjectId(userId) });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Validate data
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

    // Check classGroupId (Room Name) — stored as groupCode or classGroupId in DB
    const classGroupId = student.groupCode || student.classGroupId || "";
    if (!classGroupId) {
      errors.push(`กรุณาระบุชื่อห้องเรียน`);
    }

    return NextResponse.json({
      success: true,
      isValid: errors.length === 0,
      errors: errors,
      data: {
        citizenId: citizenId || "ไม่ระบุ",
        studentId: studentId || "ไม่ระบุ",
        classGroupId: classGroupId || "ไม่ระบุ",
      },
    });
  } catch (error: any) {
    console.error("[Student Validation Status API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
