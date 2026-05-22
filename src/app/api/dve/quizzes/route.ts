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

    if (!subjectId) {
      return NextResponse.json({ error: "Missing subjectId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const quizzes = await db.collection("dve_quizzes")
      .find({ subjectId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      quizzes: quizzes.map(q => ({
        id: q._id.toString(),
        subjectId: q.subjectId,
        title: q.title,
        googleFormUrl: q.googleFormUrl,
        deadline: q.deadline || "",
        createdAt: q.createdAt,
      }))
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
    const { subjectId, title, googleFormUrl, deadline } = body;

    if (!subjectId || !title || !googleFormUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const newQuiz = {
      subjectId,
      title,
      googleFormUrl,
      deadline: deadline || "",
      createdAt: new Date()
    };

    const result = await db.collection("dve_quizzes").insertOne(newQuiz);

    return NextResponse.json({
      success: true,
      message: "สร้างแบบทดสอบเรียบร้อยแล้ว",
      id: result.insertedId.toString()
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
    const { id, title, googleFormUrl, deadline } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    if (!title || !googleFormUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Authenticate owner if teacher
    if (role === "teacher") {
      const existingQuiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(id) });
      if (existingQuiz) {
        const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(existingQuiz.subjectId) });
        if (subject && subject.teacherId !== (session.user as any).id) {
          return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
        }
      }
    }

    const updateDoc = {
      $set: {
        title,
        googleFormUrl,
        deadline: deadline || "",
        updatedAt: new Date()
      }
    };

    await db.collection("dve_quizzes").updateOne({ _id: new ObjectId(id) }, updateDoc);

    return NextResponse.json({
      success: true,
      message: "แก้ไขแบบทดสอบเรียบร้อยแล้ว"
    });
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

    // Authenticate owner if teacher
    if (role === "teacher") {
      const existingQuiz = await db.collection("dve_quizzes").findOne({ _id: new ObjectId(id) });
      if (existingQuiz) {
        const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(existingQuiz.subjectId) });
        if (subject && subject.teacherId !== (session.user as any).id) {
          return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
        }
      }
    }

    await db.collection("dve_quizzes").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "ลบแบบทดสอบเรียบร้อยแล้ว"
    });
  } catch (error: any) {
    console.error("[DVE Quizzes DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
