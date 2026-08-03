import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const classGroups = await db.collection("users").distinct("classGroupId", { role: "student" });
    const classrooms = await db.collection("users").distinct("classroomName", { role: "student" });
    
    let all = [...new Set([...classGroups, ...classrooms])].filter(c => c && isNaN(Number(c)));
    all.sort();

    return NextResponse.json({ success: true, classrooms: all });
  } catch (error) {
    console.error("Fetch classrooms error:", error);
    return NextResponse.json({ success: false, classrooms: [] }, { status: 500 });
  }
}
