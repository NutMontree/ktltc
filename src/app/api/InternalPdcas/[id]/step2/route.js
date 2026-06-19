import ProjectApproval from "@/app/models/ProjectApproval";
import { connectDB } from "@/app/models/InternalPdca";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await ProjectApproval.findOne({ projectId: id });
    return NextResponse.json({ data: data || {} }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    const data = await ProjectApproval.findOneAndUpdate(
      { projectId: id },
      { ...body, projectId: id },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Success", data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
