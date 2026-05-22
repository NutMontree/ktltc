import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { DEPARTMENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department")?.trim();
    const teacherId = searchParams.get("teacherId")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. If no query, return distinct departments and all teachers
    if (!department && !teacherId) {
      const combinedDepts = DEPARTMENTS.filter(
        (d) => d.startsWith("แผนกวิชา") || d.includes("การจัดการ")
      );

      const teachers = await db.collection("users")
        .find({ role: "teacher" })
        .project({ _id: 1, name: 1, department: 1 })
        .sort({ name: 1 })
        .toArray();

      // Fetch currently logged in user profile from DB
      const userId = (session.user as any)?.id;
      let userProfile = null;
      if (userId && ObjectId.isValid(userId)) {
        const uDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (uDoc) {
          userProfile = {
            id: uDoc._id.toString(),
            name: uDoc.name,
            role: uDoc.role,
            department: uDoc.department || "",
            studentId: uDoc.studentId || "",
            classGroupId: uDoc.classGroupId || ""
          };
        }
      }

      return NextResponse.json({
        success: true,
        departments: combinedDepts,
        teachers: teachers.map(t => ({ id: t._id.toString(), name: t.name, department: t.department })),
        userProfile
      });
    }

    // 2. If department is provided, return teachers from that department and subjects
    if (department && !teacherId) {
      // Find subjects matching the department
      const subjects = await db.collection("dve_subjects")
        .find({ department: { $regex: department, $options: "i" } })
        .sort({ name: 1 })
        .toArray();

      // Find teachers in users collection matching this department
      const deptTeachers = await db.collection("users")
        .find({ role: "teacher", department: { $regex: department, $options: "i" } })
        .project({ _id: 1, name: 1, department: 1 })
        .toArray();

      // Find teachers who actually own subjects in this department (even if their user profile department is different)
      const teacherIdsFromSubjects = subjects
        .map(s => s.teacherId)
        .filter((id): id is string => typeof id === "string");

      const subjectTeacherObjectIds = teacherIdsFromSubjects
        .map(id => {
          try { return new ObjectId(id); } catch (e) { return null; }
        })
        .filter((id): id is ObjectId => id !== null);

      const subjectTeachers = subjectTeacherObjectIds.length > 0
        ? await db.collection("users")
            .find({ role: "teacher", _id: { $in: subjectTeacherObjectIds } })
            .project({ _id: 1, name: 1, department: 1 })
            .toArray()
        : [];

      // Combine both sets of teachers uniquely
      const uniqueTeachersMap = new Map();
      deptTeachers.forEach(t => uniqueTeachersMap.set(t._id.toString(), t));
      subjectTeachers.forEach(t => uniqueTeachersMap.set(t._id.toString(), t));
      
      const teachersList = Array.from(uniqueTeachersMap.values())
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      return NextResponse.json({
        success: true,
        teachers: teachersList.map(t => ({ id: t._id.toString(), name: t.name, department: t.department })),
        subjects: subjects.map(s => ({
          id: s._id.toString(),
          code: s.code,
          name: s.name,
          curriculum: s.curriculum,
          teacherId: s.teacherId,
          teacherName: s.teacherName
        }))
      });
    }

    // 3. If teacherId is provided, return subjects by that teacher
    if (teacherId) {
      const subjects = await db.collection("dve_subjects")
        .find({ teacherId: teacherId })
        .sort({ name: 1 })
        .toArray();

      return NextResponse.json({
        success: true,
        subjects: subjects.map(s => ({
          id: s._id.toString(),
          code: s.code,
          name: s.name,
          curriculum: s.curriculum,
          department: s.department,
          teacherId: s.teacherId,
          teacherName: s.teacherName
        }))
      });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("[DVE Search API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
