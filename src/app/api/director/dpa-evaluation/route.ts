import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const dpa = await db.collection("dpa_evaluations").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(dpa);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch DPA evaluations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newDpa = {
      ...body,
      status: body.status || "draft",
      evaluatorScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("dpa_evaluations").insertOne(newDpa);
    return NextResponse.json({ ...newDpa, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create DPA evaluation" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { _id, status, evaluatorScore, evaluatorFeedback } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (evaluatorScore !== undefined) updateData.evaluatorScore = evaluatorScore;
    if (evaluatorFeedback !== undefined) updateData.evaluatorFeedback = evaluatorFeedback;

    await db.collection("dpa_evaluations").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update DPA evaluation" }, { status: 500 });
  }
}
