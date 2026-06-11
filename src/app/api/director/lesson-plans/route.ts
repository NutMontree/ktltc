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
    const { _id, status, feedback } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (feedback !== undefined) updateData.feedback = feedback;

    await db.collection("lesson_plans").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lesson plan" }, { status: 500 });
  }
}
