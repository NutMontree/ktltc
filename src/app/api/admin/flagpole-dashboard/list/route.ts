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
      "deputy_academic", "deputy_student_affairs", "deputy_resource", "deputy_plan", "deputy_strategy",
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
    const tab = searchParams.get('tab') || 'AllNormal';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    const isInternshipMatch = tab.includes('Intern');
    
    let targetStatus = null;
    if (tab.startsWith('Present')) targetStatus = 'Present';
    if (tab.startsWith('Late')) targetStatus = 'Late';
    if (tab.startsWith('Absent')) targetStatus = 'Absent';

    const pipeline: any[] = [
      { 
        $match: { 
          role: "student", 
          isActive: { $ne: false },
          isInternship: isInternshipMatch ? { $in: [true, "true"] } : { $nin: [true, "true"] }
        } 
      },
      {
        $lookup: {
          from: "flagpole_attendances",
          let: { uId: "$_id", uIdStr: { $toString: "$_id" } },
          pipeline: [
            { 
              $match: { 
                date: { $gte: startOfDay, $lte: endOfDay },
                $expr: {
                  $or: [
                    { $eq: ["$userId", "$$uId"] },
                    { $eq: ["$userId", "$$uIdStr"] }
                  ]
                }
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
      }
    ];

    if (targetStatus) {
      pipeline.push({
        $match: {
          status: targetStatus
        }
      });
    }

    pipeline.push({ $sort: { status: -1, time: -1, name: 1 } });
    
    // Total count for the filtered list
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await db.collection("users").aggregate(countPipeline).toArray();
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Apply pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const students = await db.collection("users").aggregate(pipeline).toArray();

    return NextResponse.json({ 
      success: true, 
      data: students,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: (page * limit) < totalCount
      }
    });
  } catch (error: any) {
    console.error("Flagpole list API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}