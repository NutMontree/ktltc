import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const records = await db.collection("plc_records").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PLC records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newRecord = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("plc_records").insertOne(newRecord);
    return NextResponse.json({ ...newRecord, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create PLC record" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { _id, status } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("plc_records").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update PLC record" }, { status: 500 });
  }
}
