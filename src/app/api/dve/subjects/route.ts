import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

function getDeptFromClassGroup(classGroupId: string): string {
  if (!classGroupId) return "";
  const clean = classGroupId.replace(/[^0-9a-zA-Zก-ฮ]/g, "").trim();

  if (clean.startsWith("ชย") || clean.startsWith("ชยธ")) return "แผนกวิชาช่างยนต์";
  if (clean.startsWith("ชฟ") || clean.startsWith("สชฟ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.startsWith("ชอ") || clean.startsWith("สชอ")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.startsWith("บช")) return "แผนกวิชาการบัญชี";
  if (clean.startsWith("ตล")) return "แผนกวิชาการตลาด";
  if (clean.startsWith("รแ") || clean.startsWith("กร") || clean.startsWith("ก.ร")) return "แผนกวิชาการโรงแรม";

  if (clean.includes("30101") || clean.includes("20101")) return "แผนกวิชาช่างยนต์";
  if (clean.includes("30102") || clean.includes("20102")) return "แผนกวิชากลโรงงาน";
  if (clean.includes("30103") || clean.includes("20103")) return "แผนกวิชาช่างเชื่อมโลหะ";
  if (clean.includes("30104") || clean.includes("20104")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (clean.includes("30105") || clean.includes("20105")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (clean.includes("30120") || clean.includes("30121") || clean.includes("20120") || clean.includes("20121")) return "แผนกวิชาก่อสร้าง";
  if (clean.includes("30201") || clean.includes("20201")) return "แผนกวิชาการบัญชี";
  if (clean.includes("30202") || clean.includes("20202")) return "แผนกวิชาการตลาด";
  if (clean.includes("30701") || clean.includes("20701")) return "แผนกวิชาการโรงแรม";

  if (
    clean.includes("31910") ||
    clean.includes("31911") ||
    clean.includes("21910") ||
    clean.includes("21911") ||
    clean.includes("31905") ||
    clean.includes("31901") ||
    clean.includes("31401") ||
    clean.includes("21919") ||
    clean.includes("69219") ||
    clean.includes("68219") ||
    clean.includes("69319") ||
    clean.includes("69314") ||
    clean.includes("62127")
  ) {
    return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  }

  return "";
}

function normalizeDept(value: string) {
  return (value || "").replace(/^(แผนกวิชา|แผนก)/, "").trim().toLowerCase();
}

function escapeRegex(text: string): string {
  return (text || "").replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
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
  return normalizeDept(subject.department || "").includes(normalizeDept(studentDept)) ||
    normalizeDept(studentDept).includes(normalizeDept(subject.department || ""));
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();
    const department = searchParams.get("department")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }

      const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(id) });
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
      }

      if (userRole === "student") {
        const allowed = await isStudentAllowedSubject(db, id, userId);
        if (!allowed) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (subject.teacherId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        subject: {
          id: subject._id.toString(),
          code: subject.code,
          name: subject.name,
          department: subject.department,
          curriculum: subject.curriculum,
          semester: subject.semester,
          academicYear: subject.academicYear,
          teacherId: subject.teacherId,
          teacherName: subject.teacherName,
        },
      });
    }

    if (userRole === "student") {
      const studentDept = await resolveStudentDept(db, userId);
      if (!studentDept) {
        return NextResponse.json({ success: true, subjects: [] });
      }

      const subjects = await db
        .collection("dve_subjects")
        .find({ department: { $regex: escapeRegex(studentDept), $options: "i" } })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        success: true,
        subjects: subjects.map((s) => ({
          id: s._id.toString(),
          code: s.code,
          name: s.name,
          department: s.department,
          curriculum: s.curriculum,
          semester: s.semester,
          academicYear: s.academicYear,
          teacherId: s.teacherId,
          teacherName: s.teacherName,
        })),
      });
    }

    const query: any = {};
    if (userRole !== "student") {
      query.teacherId = userId;
    } else if (department) {
      query.department = { $regex: escapeRegex(department), $options: "i" };
    }

    const subjects = await db
      .collection("dve_subjects")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      subjects: subjects.map((s) => ({
        id: s._id.toString(),
        code: s.code,
        name: s.name,
        department: s.department,
        curriculum: s.curriculum,
        semester: s.semester,
        academicYear: s.academicYear,
        teacherId: s.teacherId,
        teacherName: s.teacherName,
      })),
    });
  } catch (error: any) {
    console.error("[DVE Subjects GET API] Error:", error);
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
    const { code, name, department, curriculum, semester, academicYear } = body;

    if (!code || !name || !department || !curriculum || !semester || !academicYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newSubject = {
      code,
      name,
      department,
      curriculum,
      semester,
      academicYear,
      teacherId: (session.user as any).id,
      teacherName: session.user.name || "คุณครู",
      createdAt: new Date(),
    };

    const result = await db.collection("dve_subjects").insertOne(newSubject);

    return NextResponse.json({
      success: true,
      message: "สร้างรายวิชาทวิภาคีสำเร็จ",
      id: result.insertedId.toString(),
    });
  } catch (error: any) {
    console.error("[DVE Subjects POST API] Error:", error);
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
    const { id, code, name, department, curriculum, semester, academicYear } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    if (!code || !name || !department || !curriculum || !semester || !academicYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userId = (session.user as any).id || "";

    if (!(await isOwnedSubject(db, id, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_subjects").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          code,
          name,
          department,
          curriculum,
          semester,
          academicYear,
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "แก้ไขรายวิชาทวิภาคีสำเร็จ",
    });
  } catch (error: any) {
    console.error("[DVE Subjects PUT API] Error:", error);
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
    const userId = (session.user as any).id || "";

    if (!(await isOwnedSubject(db, id, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.collection("dve_subjects").deleteOne({ _id: new ObjectId(id) });
    await db.collection("dve_units").deleteMany({ subjectId: id });
    await db.collection("dve_quizzes").deleteMany({ subjectId: id });
    await db.collection("dve_attendances").deleteMany({ subjectId: id });

    return NextResponse.json({
      success: true,
      message: "ลบรายวิชาทวิภาคีและข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ",
    });
  } catch (error: any) {
    console.error("[DVE Subjects DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
