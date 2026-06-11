import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const plans = await db.collection("lesson_plans").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lesson plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newPlan = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("lesson_plans").insertOne(newPlan);
    return NextResponse.json({ ...newPlan, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson plan" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    const { _id, status, feedback, subject, title, fileUrl, semester, academicYear } = body;
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;
    
    // For teacher edits
    if (subject) updateData.subject = subject;
    if (title) updateData.title = title;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (semester) updateData.semester = semester;
    if (academicYear) updateData.academicYear = academicYear;


    await db.collection("lesson_plans").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lesson plan" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("lesson_plans").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lesson plan" }, { status: 500 });
  }
}
