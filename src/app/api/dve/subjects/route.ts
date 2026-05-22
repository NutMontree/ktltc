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
    const id = searchParams.get("id")?.trim();
    const department = searchParams.get("department")?.trim();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. Fetch single subject details
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
      }
      const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(id) });
      if (!subject) {
        return NextResponse.json({ error: "Subject not found" }, { status: 404 });
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

    // 2. Fetch list of subjects
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const userId = (session.user as any)?.id || "";

    const query: any = {};

    // If user is a teacher and not admin, restrict list to their own subjects
    if (userRole === "teacher") {
      query.teacherId = userId;
    } else if (department) {
      query.department = { $regex: department, $options: "i" };
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

    // Check ownership if not admin
    if (role === "teacher") {
      const existing = await db.collection("dve_subjects").findOne({ _id: new ObjectId(id) });
      if (existing && existing.teacherId !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
      }
    }

    const updateDoc = {
      $set: {
        code,
        name,
        department,
        curriculum,
        semester,
        academicYear,
        updatedAt: new Date(),
      },
    };

    await db.collection("dve_subjects").updateOne({ _id: new ObjectId(id) }, updateDoc);

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

    // Check ownership if not admin
    if (role === "teacher") {
      const existing = await db.collection("dve_subjects").findOne({ _id: new ObjectId(id) });
      if (existing && existing.teacherId !== (session.user as any).id) {
        return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
      }
    }

    // Delete DVE Subject
    await db.collection("dve_subjects").deleteOne({ _id: new ObjectId(id) });

    // Cascade Delete associated Units, Quizzes, Attendances
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
