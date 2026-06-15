import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();

    // Ensure only authorized staff can track
    if (!["super_admin", "admin", "director", "teacher", "deputy_student_affairs"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Get all active sessions
    const activeSessions = await db.collection("off_campus_sessions").find({
      status: "ACTIVE"
    }).toArray();

    if (activeSessions.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const studentIds = activeSessions.map(session => session.studentId);

    // Fetch the students whose IDs are in activeSessions
    const activeStudents = await db.collection("users").find({
      _id: { $in: studentIds }
    }, {
      projection: { password: 0 }
    }).toArray();

    return NextResponse.json({ success: true, data: activeStudents });
  } catch (error) {
    console.error("Fetch Live Tracking Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
