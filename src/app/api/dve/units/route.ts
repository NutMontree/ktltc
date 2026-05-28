import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

function normalizeDept(value: string) {
  return (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
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

    const units = await db.collection("dve_units").find({ subjectId }).sort({ sequence: 1, createdAt: 1 }).toArray();

    return NextResponse.json({
      success: true,
      units: units.map((u) => ({
        id: u._id.toString(),
        subjectId: u.subjectId,
        title: u.title,
        content: u.content,
        files: u.files || [],
        sequence: u.sequence || 0,
        studyMinutes: u.studyMinutes || 0,
        totalMinutes: u.totalMinutes || 0,
      })),
    });
  } catch (error: any) {
    console.error("[DVE Units GET API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, title, content, files, sequence, studyMinutes, totalMinutes } = body;

    if (!subjectId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any).id || "";

    if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.collection("dve_units").insertOne({
      subjectId,
      title,
      content: content || "",
      files: files || [],
      sequence: Number(sequence) || 0,
      studyMinutes: Number(studyMinutes) || 0,
      totalMinutes: Number(totalMinutes) || 0,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "สร้างหน่วยเรียนสำเร็จ",
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("[DVE Units POST API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const role = ((session?.user as any)?.role || "").toLowerCase();

    if (!session || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, content, files, sequence, studyMinutes, totalMinutes } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const existingUnit = await db.collection("dve_units").findOne({ _id: new ObjectId(id) });
    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (!(await isOwnedSubject(db, existingUnit.subjectId, (session.user as any).id || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_units").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content: content || "",
          files: files || [],
          sequence: Number(sequence) || 0,
          studyMinutes: Number(studyMinutes) || 0,
          totalMinutes: Number(totalMinutes) || 0,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true, message: "แก้ไขหน่วยเรียนสำเร็จ" });
  } catch (error: any) {
    console.error("[DVE Units PUT API] Error:", error);
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

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const existingUnit = await db.collection("dve_units").findOne({ _id: new ObjectId(id) });
    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    if (!(await isOwnedSubject(db, existingUnit.subjectId, (session.user as any).id || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_units").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "ลบหน่วยเรียนสำเร็จ" });
  } catch (error: any) {
    console.error("[DVE Units DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
