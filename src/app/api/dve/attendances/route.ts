import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId")?.trim();
    const date = searchParams.get("date")?.trim(); // YYYY-MM-DD
    const classGroupId = searchParams.get("classGroupId")?.trim();

    if (!subjectId) {
      return NextResponse.json({ error: "Missing subjectId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const role = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    const query: any = { subjectId };

    if (role === "student") {
      // Students can only see their own attendance logs
      query.studentId = userId;
    } else {
      // Teachers can filter by date and class group
      if (date) query.date = date;
      if (classGroupId) query.classGroupId = { $regex: classGroupId, $options: "i" };
    }

    const logs = await db.collection("dve_attendances")
      .find(query)
      .sort({ date: -1, studentName: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      attendances: logs.map(l => ({
        id: l._id.toString(),
        subjectId: l.subjectId,
        studentId: l.studentId,
        studentName: l.studentName,
        studentIdNum: l.studentIdNum,
        classGroupId: l.classGroupId,
        date: l.date,
        status: l.status,
        assignmentStatus: l.assignmentStatus,
        imageUrl: l.imageUrl || "",
        score: l.score || "",
        unitId: l.unitId || "",
        unitTitle: l.unitTitle || "",
        unitSequence: l.unitSequence !== undefined ? l.unitSequence : "",
        checkedBy: l.checkedBy,
        updatedAt: l.updatedAt,
      }))
    });
  } catch (error: any) {
    console.error("[DVE Attendances GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = ((session.user as any)?.role || "").toLowerCase();

    const body = await req.json();
    const { subjectId, date, records } = body; // records: Array of student attendance updates

    if (!subjectId || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing required fields or invalid records format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const isStudent = role === "student";
    const isAllowedRole = ALLOWED_ROLES.includes(role);

    if (!isAllowedRole && !isStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Authenticate student cannot check in others
    if (isStudent) {
      const isCheckingOthers = records.some((rec: any) => rec.studentId !== (session.user as any).id);
      if (isCheckingOthers) {
        return NextResponse.json({ error: "Forbidden: Students can only check in themselves" }, { status: 403 });
      }
    }

    // Authenticate owner if teacher
    if (role === "teacher") {
      const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
      if (subject && subject.teacherId !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
      }
    }

    const bulkOps = records.map((rec: any) => {
      const { studentId, studentName, studentIdNum, classGroupId, status, assignmentStatus, score, unitId, unitTitle, unitSequence } = rec;

      return {
        updateOne: {
          filter: {
            subjectId,
            date,
            studentId,
            unitId: unitId || ""
          },
          update: {
            $set: {
              studentName: studentName || "",
              studentIdNum: studentIdNum || "",
              classGroupId: classGroupId || "",
              status: status || "Absent",
              assignmentStatus: assignmentStatus || "None",
              score: score !== undefined ? score : "",
              imageUrl: rec.imageUrl !== undefined ? rec.imageUrl : "",
              unitId: unitId || "",
              unitTitle: unitTitle || "",
              unitSequence: unitSequence !== undefined ? unitSequence : "",
              checkedBy: isStudent ? "student_self_study" : (session.user as any).id,
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await db.collection("dve_attendances").bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message: isStudent 
        ? "เช็คชื่อเข้าเรียนแบบเรียนรู้ด้วยตัวเองเสร็จสิ้น" 
        : `บันทึกข้อมูลการเช็คชื่อเข้าเรียน ${bulkOps.length} คน เรียบร้อยแล้ว`
    });
  } catch (error: any) {
    console.error("[DVE Attendances POST API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId")?.trim();
    const date = searchParams.get("date")?.trim(); // YYYY-MM-DD
    const classGroupId = searchParams.get("classGroupId")?.trim();

    if (!subjectId || !date) {
      return NextResponse.json({ error: "Missing required parameters subjectId or date" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Authenticate owner if teacher
    if (role === "teacher") {
      const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
      if (subject && subject.teacherId !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
      }
    }

    const query: any = { subjectId, date };
    if (classGroupId) {
      query.classGroupId = classGroupId;
    }

    const result = await db.collection("dve_attendances").deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `ล้างประวัติการเช็คชื่อทั้งหมดจำนวน ${result.deletedCount} รายการเรียบร้อยแล้ว`
    });
  } catch (error: any) {
    console.error("[DVE Attendances DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

