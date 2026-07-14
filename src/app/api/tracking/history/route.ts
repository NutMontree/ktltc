import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only authorized staff can track
    if (!["super_admin", "admin", "director", "teacher", "deputy_student_affairs"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "1000", 10);

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Get latest sessions (both ACTIVE and COMPLETED)
    const historySessions = await db.collection("off_campus_sessions")
      .find({})
      .sort({ scannedOutAt: -1 })
      .limit(limit)
      .toArray();

    if (historySessions.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const studentIds = [...new Set(historySessions.map(session => session.studentId))];

    // Fetch the students whose IDs are in the sessions
    const students = await db.collection("users").find({
      _id: { $in: studentIds }
    }, {
      projection: { password: 0 }
    }).toArray();

    // Merge session data with student information
    const enrichedHistory = historySessions.map(sess => {
      const student = students.find(s => s._id.toString() === sess.studentId.toString());
      return {
        _id: sess._id,
        status: sess.status,
        scannedOutAt: sess.scannedOutAt,
        scannedInAt: sess.scannedInAt || null,
        durationMinutes: sess.durationMinutes || null,
        student: student ? {
          _id: student._id,
          name: student.name,
          username: student.username,
          image: student.image,
          department: student.department,
          academicLevel: student.academicLevel,
          classroomName: student.classroomName,
          groupCode: student.groupCode,
          phone: student.phone
        } : null
      };
    });

    return NextResponse.json({ success: true, data: enrichedHistory });
  } catch (error) {
    console.error("Fetch Tracking History Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
