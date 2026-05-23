import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

function normalizeDept(value: string) {
  return (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
}

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function getDeptFromClassGroup(classGroupId: string): string {
  if (!classGroupId) return "";
  const clean = classGroupId.replace(/[^0-9a-zA-Zก-ฮ]/g, "").trim();
  if (clean.startsWith("ชย") || clean.startsWith("ชยธ")) return "แผนกวิชาช่างยนต์";
  if (clean.startsWith("ชฟ") || clean.startsWith("สชฟ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.startsWith("ชอ") || clean.startsWith("สชอ")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.startsWith("บช")) return "แผนกวิชาการบัญชี";
  if (clean.startsWith("ตล")) return "แผนกวิชาการตลาด";
  if (clean.startsWith("รแ") || clean.startsWith("กร") || clean.startsWith("ก.ร")) return "แผนกวิชาการโรงแรม";
  if (clean.includes("30201") || clean.includes("20201")) return "แผนกวิชาการบัญชี";
  if (clean.includes("30202") || clean.includes("20202")) return "แผนกวิชาการตลาด";
  if (clean.includes("30701") || clean.includes("20701")) return "แผนกวิชาการโรงแรม";
  if (clean.includes("31910") || clean.includes("31911") || clean.includes("21910") || clean.includes("21911")) {
    return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  }
  return "";
}

async function resolveStudentDept(db: any, userId: string) {
  const uDoc = await db.collection("users").findOne({ _id: new ObjectId(userId), role: "student" });
  if (!uDoc) return "";
  return (uDoc.department || "").trim() || getDeptFromClassGroup(uDoc.classGroupId || "");
}

async function isOwnedSubject(db: any, subjectId: string, userId: string) {
  if (!ObjectId.isValid(subjectId)) return false;
  const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
  return !!subject && subject.teacherId === userId;
}

async function isStudentAllowedSubject(db: any, subjectId: string, userId: string) {
  if (!ObjectId.isValid(subjectId)) return false;
  const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(subjectId) });
  if (!subject) return false;
  const studentDept = await resolveStudentDept(db, userId);
  if (!studentDept) return false;
  const subjectDept = normalizeDept(subject.department || "");
  const studentDeptNorm = normalizeDept(studentDept);
  return subjectDept.includes(studentDeptNorm) || studentDeptNorm.includes(subjectDept);
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId")?.trim();
    const date = searchParams.get("date")?.trim();
    const classGroupId = searchParams.get("classGroupId")?.trim();

    if (!subjectId) {
      return NextResponse.json({ error: "Missing subjectId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const role = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    if (role === "student") {
      if (!(await isStudentAllowedSubject(db, subjectId, userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = { subjectId };
    if (role === "student") {
      query.studentId = userId;
    } else {
      if (date) query.date = date;
      if (classGroupId) query.classGroupId = { $regex: escapeRegex(classGroupId), $options: "i" };
    }

    const logs = await db.collection("dve_attendances").find(query).sort({ date: -1, studentName: 1 }).toArray();

    return NextResponse.json({
      success: true,
      attendances: logs.map((l) => ({
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
      })),
    });
  } catch (error: any) {
    console.error("[DVE Attendances GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    const body = await req.json();
    const { subjectId, date, records } = body;

    if (!subjectId || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: "Missing required fields or invalid records format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (role === "student") {
      if (!(await isStudentAllowedSubject(db, subjectId, userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const isCheckingOthers = records.some((rec: any) => rec.studentId !== userId);
      if (isCheckingOthers) {
        return NextResponse.json({ error: "Forbidden: Students can only check in themselves" }, { status: 403 });
      }
    } else if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bulkOps = records.map((rec: any) => {
      const {
        studentId,
        studentName,
        studentIdNum,
        classGroupId,
        status,
        assignmentStatus,
        score,
        unitId,
        unitTitle,
        unitSequence,
      } = rec;

      return {
        updateOne: {
          filter: {
            subjectId,
            date,
            studentId,
            unitId: unitId || "",
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
              checkedBy: role === "student" ? "student_self_study" : userId,
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await db.collection("dve_attendances").bulkWrite(bulkOps);
    }

    return NextResponse.json({
      success: true,
      message:
        role === "student"
          ? "เช็คชื่อเข้าสู่ระบบเรียนรู้ด้วยตนเองสำเร็จ"
          : `บันทึกข้อมูลการเช็คชื่อเข้าเรียน ${bulkOps.length} คน เรียบร้อยแล้ว`,
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
    const date = searchParams.get("date")?.trim();
    const classGroupId = searchParams.get("classGroupId")?.trim();

    if (!subjectId || !date) {
      return NextResponse.json({ error: "Missing required parameters subjectId or date" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any)?.id || "";

    if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = { subjectId, date };
    if (classGroupId) {
      query.classGroupId = classGroupId;
    }

    const result = await db.collection("dve_attendances").deleteMany(query);

    return NextResponse.json({
      success: true,
      message: `ล้างประวัติการเช็คชื่อทั้งหมดจำนวน ${result.deletedCount} รายการเรียบร้อยแล้ว`,
    });
  } catch (error: any) {
    console.error("[DVE Attendances DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
