import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 10; // Revalidate every 10 seconds (attendances change frequently)

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

function normalizeDept(value: string) {
  return (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
}

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function standardizeClassGroupName(name: string): string {
  if (!name) return "";
  let clean = name.trim();
  const stripped = clean.replace(/[\s\.-]+/g, "");
  const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    if (rest) {
      return `${prefix}.${rest}`;
    }
    return prefix;
  }
  return stripped;
}

function buildFlexibleClassGroupRegex(classGroupId: string): string {
  if (!classGroupId) return "";
  const clean = classGroupId.trim();
  let pattern = "^";
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === " " || char === "." || char === "-") {
      continue;
    }
    const escapedChar = char.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    pattern += `${escapedChar}[\\s\\.-]*`;
  }
  pattern += "$";
  return pattern;
}

const CLASS_GROUP_FIELDS = ["classGroupId", "groupCode", "classroomName"] as const;

function resolveStudentClassGroup(student: any): string {
  for (const field of CLASS_GROUP_FIELDS) {
    const value = student?.[field];
    if (value && String(value).trim()) {
      return standardizeClassGroupName(String(value).trim());
    }
  }
  return "";
}

function toBangkokDateString(value?: string | Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const day = parts.find((part) => part.type === "day")?.value || "";
  return year && month && day ? `${year}-${month}-${day}` : "";
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
  return (uDoc.department || "").trim() || getDeptFromClassGroup(resolveStudentClassGroup(uDoc));
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
    // console.log("API attendances GET - classGroupId:", classGroupId);

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
      const studentId = searchParams.get("studentId")?.trim();
      if (studentId) query.studentId = studentId;
      if (date) query.date = date;
      if (classGroupId) {
        // Use standardized class group name for matching
        const classGroupTargets = Array.from(
          new Set([classGroupId, standardizeClassGroupName(classGroupId)].filter(Boolean)),
        );
        query.$or = ["classGroupId", "groupCode", "classroomName"].flatMap((field) =>
          classGroupTargets.flatMap((target) => [
            { [field]: target },
            { [field]: { $regex: buildFlexibleClassGroupRegex(target), $options: "i" } },
          ]),
        );
      }
    }

    // console.log("API attendances GET - query:", JSON.stringify(query));
    const logs = await db.collection("dve_attendances").find(query).sort({ date: -1, studentName: 1 }).toArray();

    // Get student information to fill in missing classGroupId
    const studentIds = logs.map((l) => l.studentId).filter((id) => ObjectId.isValid(id));
    const students = studentIds.length > 0
      ? await db.collection("users").find({ _id: { $in: studentIds.map((id) => new ObjectId(id)) } }).toArray()
      : [];
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    return NextResponse.json({
      success: true,
      attendances: logs.map((l) => {
        const student = studentMap.get(l.studentId);
        return {
          id: l._id.toString(),
          subjectId: l.subjectId,
          studentId: l.studentId,
          studentName: l.studentName,
          studentIdNum: l.studentIdNum,
          classGroupId: standardizeClassGroupName(l.classGroupId || resolveStudentClassGroup(student) || ""),
          studentImage: student?.image || "",
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
        };
      }),
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

    const unitIds = Array.from(
      new Set(
        records
          .map((rec: any) => String(rec.unitId || "").trim())
          .filter((unitId: string) => unitId && ObjectId.isValid(unitId)),
      ),
    );
    const unitMap = new Map<string, any>();
    if (unitIds.length > 0) {
      const units = await db
        .collection("dve_units")
        .find({ _id: { $in: unitIds.map((unitId) => new ObjectId(unitId)) } })
        .project({ dueDate: 1, createdAt: 1 })
        .toArray();
      units.forEach((unit) => {
        unitMap.set(unit._id.toString(), unit);
      });
    }

    const requestDate = String(date).slice(0, 10);

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
      const unitDoc = unitId ? unitMap.get(String(unitId)) : null;
      const dueDate = toBangkokDateString(unitDoc?.dueDate || "");
      const createdDate = toBangkokDateString(unitDoc?.createdAt || "");
      let finalStatus = status || "Absent";
      if (finalStatus !== "Absent") {
        if (dueDate) {
          if (requestDate > dueDate) finalStatus = "Late";
        } else if (createdDate && requestDate > createdDate) {
          finalStatus = "Late";
        }
      }

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
              status: finalStatus,
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
    const id = searchParams.get("id")?.trim();
    const subjectId = searchParams.get("subjectId")?.trim();
    const date = searchParams.get("date")?.trim();
    const classGroupId = searchParams.get("classGroupId")?.trim();
    const studentId = searchParams.get("studentId")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any)?.id || "";

    // Delete by individual record ID
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid record ID" }, { status: 400 });
      }

      // Fetch the attendance record to check subject ownership
      const record = await db.collection("dve_attendances").findOne({ _id: new ObjectId(id) });
      if (!record) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }

      if (!(await isOwnedSubject(db, record.subjectId, userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await db.collection("dve_attendances").deleteOne({ _id: new ObjectId(id) });
      return NextResponse.json({
        success: true,
        message: "ลบบันทึกการส่งงานเรียบร้อยแล้ว",
      });
    }

    // Bulk deletion by subjectId, date, classGroupId, studentId
    if (!subjectId || !date) {
      return NextResponse.json({ error: "Missing required parameters subjectId or date" }, { status: 400 });
    }

    if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const query: any = { subjectId, date };
    if (classGroupId) {
      query.classGroupId = classGroupId;
    }
    if (studentId) {
      query.studentId = studentId;
    }

    if (studentId) {
      await db.collection("dve_attendances").deleteOne(query);
      return NextResponse.json({
        success: true,
        message: "ลบประวัติการเช็คชื่อรายบุคคลเรียบร้อยแล้ว",
      });
    } else {
      const result = await db.collection("dve_attendances").deleteMany(query);
      return NextResponse.json({
        success: true,
        message: `ล้างประวัติการเช็คชื่อทั้งหมดจำนวน ${result.deletedCount} รายการเรียบร้อยแล้ว`,
      });
    }
  } catch (error: any) {
    console.error("[DVE Attendances DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
