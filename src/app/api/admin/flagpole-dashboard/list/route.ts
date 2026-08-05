import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    
    const STAFF_ROLES = [
      "super_admin", "admin", "director", "deputy_director", 
      "deputy_academic", "deputy_student_affairs", "deputy_resource", "deputy_plan",
      "hr", "head_department", "staff", "editor", "teacher"
    ];
    
    const hasAccess = STAFF_ROLES.includes(role) && role !== "student";
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
    }
    targetDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const students = await db.collection("users").aggregate([
      { 
        $match: { 
          role: "student", 
          isActive: { $ne: false } 
        } 
      },
      {
        $lookup: {
          from: "flagpole_attendances",
          let: { userIdStr: { $toString: "$_id" } },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: ["$userId", "$$userIdStr"] },
                date: { $gte: startOfDay, $lte: endOfDay }
              }
            },
            { $sort: { "checkIn.time": -1 } },
            { $limit: 1 }
          ],
          as: "attendance"
        }
      },
      {
        $project: {
          userId: { $toString: "$_id" },
          name: { $ifNull: ["$name", "นักศึกษา"] },
          department: { $ifNull: ["$academicLevel", "ไม่ระบุชั้นปี"] },
          image: "$image",
          isInternship: { $in: ["$isInternship", [true, "true"]] },
          attendanceRecord: { $arrayElemAt: ["$attendance", 0] }
        }
      },
      {
        $project: {
          id: "$userId",
          userId: "$userId",
          name: 1,
          department: 1,
          image: 1,
          isInternship: 1,
          status: { $ifNull: ["$attendanceRecord.status", "Absent"] },
          time: "$attendanceRecord.checkIn.time",
          statusTag: "$attendanceRecord.checkIn.statusTag",
          photoUrl: "$attendanceRecord.checkIn.photoUrl"
        }
      },
      { $sort: { status: -1, time: -1, name: 1 } }
    ]).toArray();

    return NextResponse.json({ success: true, data: students });
  } catch (error: any) {
    console.error("Flagpole list API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
