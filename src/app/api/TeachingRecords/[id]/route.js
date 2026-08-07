import { NextResponse } from "next/server";
import { connectDB } from "@/app/models/InternalPdca";
import TeachingRecord from "@/app/models/TeachingRecord";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const record = await TeachingRecord.findById(id);
    if (!record) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error(`Error GET /api/TeachingRecords/${id}:`, error);
    return NextResponse.json({ message: "Error fetching" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const data = await request.json();
    await connectDB();
    const updated = await TeachingRecord.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Updated", record: updated }, { status: 200 });
  } catch (error) {
    console.error(`Error PUT /api/TeachingRecords/${id}:`, error);
    return NextResponse.json({ message: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await connectDB();
    const deleted = await TeachingRecord.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error(`Error DELETE /api/TeachingRecords/${id}:`, error);
    return NextResponse.json({ message: "Error deleting" }, { status: 500 });
  }
}
