import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userRole = (session?.user?.role || "").toLowerCase();

    // Ensure only authorized staff can manage gate sessions
    if (!["super_admin", "admin", "director", "teacher", "deputy_student_affairs"].includes(userRole)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json({ success: false, message: "Missing student ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Verify student exists
    const student = await db.collection("users").findOne({ _id: new ObjectId(studentId), role: "student" });
    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
    }

    // Check for an active session
    const activeSession = await db.collection("off_campus_sessions").findOne({
      studentId: new ObjectId(studentId),
      status: "ACTIVE"
    });

    if (activeSession) {
      // -----------------------------------------
      // STOP TRACKING (Scan IN)
      // -----------------------------------------
      const scannedInAt = new Date();
      
      // Calculate straight-line distance from last location to campus (Optional enhancement later)
      // Calculate duration in minutes
      const durationMs = scannedInAt.getTime() - new Date(activeSession.scannedOutAt).getTime();
      const durationMinutes = Math.floor(durationMs / 60000);

      await db.collection("off_campus_sessions").updateOne(
        { _id: activeSession._id },
        { 
          $set: { 
            status: "COMPLETED", 
            scannedInAt,
            durationMinutes,
            // Capture their last known location before closing
            finalLocation: student.currentLocation || null
          } 
        }
      );

      return NextResponse.json({ 
        success: true, 
        action: "stopped", 
        studentName: student.name || student.username,
        durationMinutes,
        message: "สแกนรับกลับเข้าโรงเรียนและยกเลิกการติดตามเรียบร้อยแล้ว"
      });

    } else {
      // -----------------------------------------
      // START TRACKING (Scan OUT)
      // -----------------------------------------
      const newSession = {
        studentId: new ObjectId(studentId),
        scannedOutAt: new Date(),
        status: "ACTIVE",
        teacherId: new ObjectId(session?.user?.id), // Record who scanned them out
      };

      await db.collection("off_campus_sessions").insertOne(newSession);

      return NextResponse.json({ 
        success: true, 
        action: "started", 
        studentName: student.name || student.username,
        message: "สแกนออกจากโรงเรียนและเริ่มการติดตามเรียบร้อยแล้ว"
      });
    }

  } catch (error) {
    console.error("Tracking Session Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
