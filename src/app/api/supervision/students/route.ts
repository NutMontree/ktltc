import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Fetch all students who are in internship / DVE
    const students = await db
      .collection("users")
      .find({ role: "student", isInternship: true })
      .project({ _id: 1, name: 1, studentId: 1, classGroup: 1, department: 1, companyName: 1 })
      .sort({ studentId: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      students: students.map((s: any) => ({
        id: s._id.toString(),
        name: s.name || "ไม่ระบุชื่อ",
        studentIdNum: s.studentId || "ไม่ระบุรหัส",
        classGroupId: s.classGroup || "ไม่ระบุห้อง",
        department: s.department || "ไม่ระบุแผนก",
        companyName: s.companyName || "ไม่ระบุสถานประกอบการ",
      })),
    });
  } catch (error: any) {
    console.error("Supervision students error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
