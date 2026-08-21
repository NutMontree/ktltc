import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import { MentalHealthAssessment } from "@/app/models/MentalHealthAssessment";

// บันทึกข้อมูลแบบประเมิน (POST)
export async function POST(req: Request) {
  try {
    await connectMongoose();
    const data = await req.json();

    const newAssessment = new MentalHealthAssessment({
      type: data.type,
      age: data.age,
      gender: data.gender,
      status: data.status,
      st5Score: data.st5Score,
      q9Score: data.q9Score,
    });

    await newAssessment.save();

    return NextResponse.json({ success: true, data: newAssessment }, { status: 201 });
  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ดึงข้อมูลประเมินทั้งหมดไปโชว์ใน Dashboard (GET)
export async function GET() {
  try {
    await connectMongoose();
    const assessments = await MentalHealthAssessment.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: assessments });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
