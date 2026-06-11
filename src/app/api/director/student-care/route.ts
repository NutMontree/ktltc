import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const records = await db.collection("student_care_records").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch student care records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newRecord = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("student_care_records").insertOne(newRecord);
    return NextResponse.json({ ...newRecord, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create student care record" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { _id, notes, sdqType } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date() };
    if (notes !== undefined) updateData.notes = notes;
    if (sdqType) updateData.sdqType = sdqType;

    await db.collection("student_care_records").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student care record" }, { status: 500 });
  }
}
