import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim();
    const classGroupId = searchParams.get("classGroupId")?.trim();
    const academicLevel = searchParams.get("academicLevel")?.trim();

    if (!department) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุแผนกวิชา" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const query: any = {
      role: "student",
      department: { $regex: department, $options: "i" },
    };

    if (classGroupId) query.classGroupId = { $regex: classGroupId, $options: "i" };
    if (academicLevel) query.academicLevel = { $regex: academicLevel, $options: "i" };

    const students = await db
      .collection("users")
      .find(query)
      .project({
        _id: 1,
        name: 1,
        academicLevel: 1,
        department: 1,
        classGroupId: 1,
        studentStatus: 1,
        learnerType: 1,
        image: 1,
        phone: 1,
        email: 1,
      })
      .sort({ classGroupId: 1, name: 1 })
      .toArray();

    // Get distinct class groups for this department (for filter dropdown)
    const allGroups = await db
      .collection("users")
      .distinct("classGroupId", {
        role: "student",
        department: { $regex: department, $options: "i" },
      });

    const result = students.map((s: any) => ({
      id: s._id.toString(),
      name: s.name || "ไม่ระบุ",
      academicLevel: s.academicLevel || "ไม่ระบุ",
      department: s.department || "ไม่ระบุ",
      classGroupId: s.classGroupId || "ไม่ระบุ",
      studentStatus: s.studentStatus || "กำลังศึกษา",
      learnerType: s.learnerType || "ไม่ระบุ",
      image: s.image || null,
      phone: s.phone || null,
      email: s.email || null,
    }));

    return NextResponse.json({
      success: true,
      students: result,
      totalCount: result.length,
      classGroups: allGroups.filter(Boolean).sort(),
    });
  } catch (error: any) {
    console.error("[Teacher Students API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
