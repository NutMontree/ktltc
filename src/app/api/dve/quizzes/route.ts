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

    const quizzes = await db.collection("dve_quizzes").find({ subjectId }).sort({ createdAt: -1 }).toArray();

    // Check student submissions in database
    let studentSubmissionsMap: Record<string, any> = {};
    if (role === "student") {
      const subs = await db
        .collection("dve_quiz_submissions")
        .find({ studentId: userId, quizId: { $in: quizzes.map((q) => q._id.toString()) } })
        .project({ quizId: 1, fileUrl: 1, fileName: 1 })
        .toArray();
      subs.forEach((s: any) => {
        studentSubmissionsMap[s.quizId] = {
          isSubmitted: true,
          fileUrl: s.fileUrl || "",
          fileName: s.fileName || "",
        };
      });
    }

    return NextResponse.json({
      success: true,
      quizzes: quizzes.map((q) => ({
        id: q._id.toString(),
        subjectId: q.subjectId,
        title: q.title,
        googleFormUrl: q.googleFormUrl || "",
        isBuiltIn: !!q.isBuiltIn,
        questions: q.questions || [],
        deadline: q.deadline || "",
        startDate: q.startDate || "",
        unitId: q.unitId || "",
        isShuffle: !!q.isShuffle,
        quizType: q.quizType || "general",
        createdAt: q.createdAt,
        isSubmitted: !!studentSubmissionsMap[q._id.toString()]?.isSubmitted,
        fileUrl: studentSubmissionsMap[q._id.toString()]?.fileUrl || "",
        fileName: studentSubmissionsMap[q._id.toString()]?.fileName || "",
      })),
    });
  } catch (error: any) {
    console.error("[DVE Quizzes GET API] Error:", error);
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
    const { subjectId, title, googleFormUrl, deadline, startDate, unitId, isBuiltIn, questions, isShuffle, quizType } = body;

    if (!subjectId || !title || (!isBuiltIn && !googleFormUrl)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any).id || "";

    if (!(await isOwnedSubject(db, subjectId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db.collection("dve_quizzes").insertOne({
      subjectId,
      title,
      googleFormUrl: googleFormUrl || "",
      isBuiltIn: !!isBuiltIn,
      questions: questions || [],
      deadline: deadline || "",
      startDate: startDate || "",
      unitId: unitId || "",
      isShuffle: !!isShuffle,
      quizType: quizType || "general",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "สร้างแบบทดสอบสำเร็จ",
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("[DVE Quizzes POST API] Error:", error);
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
    const { id, title, googleFormUrl, deadline, startDate, unitId, isBuiltIn, questions, isShuffle, quizType } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }
    if (!title || (!isBuiltIn && !googleFormUrl)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const existingQuiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(id) });
    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!(await isOwnedSubject(db, existingQuiz.subjectId, (session.user as any).id || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_quizzes").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          googleFormUrl: googleFormUrl || "",
          isBuiltIn: !!isBuiltIn,
          questions: questions || [],
          deadline: deadline || "",
          startDate: startDate || "",
          unitId: unitId || "",
          isShuffle: !!isShuffle,
          quizType: quizType || "general",
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ success: true, message: "แก้ไขแบบทดสอบสำเร็จ" });
  } catch (error: any) {
    console.error("[DVE Quizzes PUT API] Error:", error);
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
    const existingQuiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(id) });
    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (!(await isOwnedSubject(db, existingQuiz.subjectId, (session.user as any).id || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_quizzes").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "ลบแบบทดสอบสำเร็จ" });
  } catch (error: any) {
    console.error("[DVE Quizzes DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
