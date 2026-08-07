import { NextResponse } from "next/server";
import { connectDB } from "@/app/models/InternalPdca";
import TeachingRecord from "@/app/models/TeachingRecord";

export async function POST(request) {
  try {
    const data = await request.json();
    await connectDB();
    const newRecord = await TeachingRecord.create(data);
    return NextResponse.json(
      { message: "Created successfully", record: newRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST /api/TeachingRecords:", error);
    return NextResponse.json({ message: "Error creating record" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const records = await TeachingRecord.find().sort({ createdAt: -1 });
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/TeachingRecords:", error);
    return NextResponse.json({ message: "Error fetching records" }, { status: 500 });
  }
}
