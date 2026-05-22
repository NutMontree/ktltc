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

    const units = await db.collection("dve_units")
      .find({ subjectId })
      .sort({ sequence: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      units: units.map(u => ({
        id: u._id.toString(),
        subjectId: u.subjectId,
        title: u.title,
        content: u.content,
        files: u.files || [],
        sequence: u.sequence || 0,
        studyMinutes: u.studyMinutes || 0,
      }))
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
    const { subjectId, title, content, files, sequence, studyMinutes } = body;

    if (!subjectId || !title) {
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

    const newUnit = {
      subjectId,
      title,
      content: content || "",
      files: files || [],
      sequence: Number(sequence) || 0,
      studyMinutes: Number(studyMinutes) || 0,
      createdAt: new Date()
    };

    const result = await db.collection("dve_units").insertOne(newUnit);

    return NextResponse.json({
      success: true,
      message: "สร้างหน่วยเรียนเสร็จสิ้น",
      id: result.insertedId.toString()
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
    const { id, title, content, files, sequence, studyMinutes } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Authenticate owner if teacher
    if (role === "teacher") {
      const existingUnit = await db.collection("dve_units").findOne({ _id: new ObjectId(id) });
      if (existingUnit) {
        const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(existingUnit.subjectId) });
        if (subject && subject.teacherId !== (session.user as any).id) {
          return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
        }
      }
    }

    const updateDoc = {
      $set: {
        title,
        content: content || "",
        files: files || [],
        sequence: Number(sequence) || 0,
        studyMinutes: Number(studyMinutes) || 0,
        updatedAt: new Date()
      }
    };

    await db.collection("dve_units").updateOne({ _id: new ObjectId(id) }, updateDoc);

    return NextResponse.json({
      success: true,
      message: "แก้ไขหน่วยเรียนเสร็จสิ้น"
    });
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

    // Authenticate owner if teacher
    if (role === "teacher") {
      const existingUnit = await db.collection("dve_units").findOne({ _id: new ObjectId(id) });
      if (existingUnit) {
        const subject = await db.collection("dve_subjects").findOne({ _id: new ObjectId(existingUnit.subjectId) });
        if (subject && subject.teacherId !== (session.user as any).id) {
          return NextResponse.json({ error: "Forbidden: Not the owner" }, { status: 403 });
        }
      }
    }

    await db.collection("dve_units").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "ลบหน่วยเรียนเสร็จสิ้น"
    });
  } catch (error: any) {
    console.error("[DVE Units DELETE API] Error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}
