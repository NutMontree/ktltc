import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log(`[API] Attendance Report Request: ${req.url}`);
  const start = Date.now();
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const midConn = Date.now();

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const roleParam = searchParams.get('role');

    // Create Date Range
    const startD = startDateParam ? new Date(startDateParam + "T00:00:00.000Z") : new Date();
    const endD = endDateParam ? new Date(endDateParam + "T23:59:59.999Z") : new Date();

    if (!startDateParam) {
      startD.setUTCHours(0,0,0,0);
      endD.setUTCHours(23,59,59,999);
    }

    const pipeline: any[] = [
      { $match: { date: { $gte: startD, $lte: endD } } },
      {
        $addFields: {
          uId: { 
            $cond: {
              if: { $ne: [{ $type: "$userId" }, "missing"] },
              then: { $toObjectId: "$userId" },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "uId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } }
    ];

    if (roleParam && roleParam !== "all") {
      pipeline.push({ $match: { "userDetails.role": roleParam } });
    }

    pipeline.push({
      $project: {
        id: { $toString: "$_id" },
        date: 1,
        userId: { $toString: "$uId" },
        user: {
          name: { $ifNull: ["$userDetails.name", { $ifNull: ["$userDetails.username", "Unknown User"] }] },
          email: { $ifNull: ["$userDetails.email", ""] },
          role: { $ifNull: ["$userDetails.role", ""] },
          department: { $ifNull: ["$userDetails.department", "ไม่มีสังกัด"] }
        },
        checkInTime: "$checkIn.time",
        checkOutTime: "$checkOut.time",
        status: "$status",
        otHours: { $ifNull: ["$checkOut.otHours", 0] },
        photoUrl: "$checkIn.photoUrl",
        checkOutPhotoUrl: "$checkOut.photoUrl"
      }
    });

    const attendanceRecords = await db.collection("attendances").aggregate(pipeline).toArray();

    // ✅ Get All Active Users to find who is missing (Absent)
    const userQuery: any = { isActive: true };
    if (roleParam && roleParam !== "all") {
      userQuery.role = roleParam;
    }
    const allUsers = await db.collection("users").find(userQuery).toArray();
    
    // ✅ Get Holidays in range
    const holidays = await db.collection("holidays").find({
      date: { $gte: startD, $lte: endD }
    }).toArray();
    const holidaysByDate: Record<string, any> = {};
    holidays.forEach(h => {
      const dStr = new Date(h.date).toISOString().split('T')[0];
      holidaysByDate[dStr] = h;
    });

    // Create full list including Absent
    const finalData: any[] = [];
    
    // Group attendance by date
    const attendanceByDate: Record<string, any[]> = {};
    attendanceRecords.forEach(r => {
      const dStr = new Date(r.date).toISOString().split('T')[0];
      if (!attendanceByDate[dStr]) attendanceByDate[dStr] = [];
      attendanceByDate[dStr].push(r);
    });

    // Iterate over each day in range
    const current = new Date(startD);
    const limit = new Date(endD);
    while (current <= limit) {
      const dStr = current.toISOString().split('T')[0];
      const dayAttend = attendanceByDate[dStr] || [];
      const presentUserIds = new Set(dayAttend.map(r => r.userId));

      // 1. Add those who have attendance records
      finalData.push(...dayAttend.map(r => ({
        ...r,
        group: r.status === "Absent" ? 2 : 1 // Absent goes last
      })));

      // 2. Find and add those missing
      const holiday = holidaysByDate[dStr];
      allUsers.forEach(u => {
        const uIdStr = u._id.toString();
        if (!presentUserIds.has(uIdStr)) {
          finalData.push({
            id: `${holiday ? 'holiday' : 'absent'}-${dStr}-${uIdStr}`,
            date: new Date(dStr + "T00:00:00.000Z").toISOString(),
            user: {
              name: u.name || u.username || "Unknown",
              email: u.email || "",
              role: u.role || "",
              department: u.department || "ไม่มีสังกัด"
            },
            checkInTime: null,
            checkOutTime: null,
            status: holiday ? "Holiday" : "Absent",
            holidayName: holiday ? holiday.name : null,
            otHours: 0,
            photoUrl: null,
            checkOutPhotoUrl: null,
            group: holiday ? 1 : 2 // Holiday group with Present
          });
        }
      });

      current.setDate(current.getDate() + 1);
    }

    // ✅ Final Sorting: Date DESC, Group ASC (Present/Late/Leave first, Absent last), Name ASC
    finalData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA; // Date Desc
      
      if (a.group !== b.group) return a.group - b.group; // Group Asc

      return a.user.name.localeCompare(b.user.name); // Name Asc
    });

    const end = Date.now();
    console.log(`[API] Attendance Report took ${end - start}ms. Total records: ${finalData.length}`);

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    console.error("Report API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
