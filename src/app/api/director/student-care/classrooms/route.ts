import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const classGroups = await User.distinct("classGroupId", { role: "student" });
    const classrooms = await User.distinct("classroomName", { role: "student" });
    
    let all = [...new Set([...classGroups, ...classrooms])].filter(c => c && isNaN(Number(c)));
    all.sort();

    return NextResponse.json({ success: true, classrooms: all });
  } catch (error) {
    console.error("Fetch classrooms error:", error);
    return NextResponse.json({ success: false, classrooms: [] }, { status: 500 });
  }
}
