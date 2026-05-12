import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth, hasPermission } from '@/lib/auth';
 
export const dynamic = 'force-dynamic';
 
export async function GET(req: Request) {
  console.log(`[API] Dashboard Stats Request: ${req.url}`);
  const start = Date.now();
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    const canAccess = await hasPermission(role, "manage_attendance_dashboard");
    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden: No permission for Attendance Dashboard" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const midConn = Date.now();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    // จัดการเรื่องวันที่ให้แม่นยำ (เป้าหมายคือ ISO 00:00:00.000Z)
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
    }
    targetDate.setUTCHours(0, 0, 0, 0);
    
    console.log(`[API] Filtering by date: ${targetDate.toISOString()}`);

    // 1. Get Total Personnel Count from Users collection
    const totalUsersCount = await db.collection("users").countDocuments();

    // 2. Aggregate Stats using Native Driver - Using Range Match for consistency
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const stats = await db.collection("attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const formattedData = [
      { name: 'มาทำงานตรงเวลา', value: 0, color: '#10b981' }, // Emerald 500
      { name: 'มาสาย', value: 0, color: '#f59e0b' },         // Amber 500
      { name: 'ลา / ขาด', value: 0, color: '#f43f5e' }       // Rose 500
    ];

    let presentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    stats.forEach(stat => {
      if (stat._id === 'Present') presentCount = stat.count;
      else if (stat._id === 'Late') lateCount = stat.count;
      else if (stat._id === 'Leave' || stat._id === 'Absent') leaveCount += stat.count;
    });

    // 3. Calculate Accurate Absent (Total - (Present + Late + Leave))
    const reportedTotal = presentCount + lateCount + leaveCount;
    const realAbsent = Math.max(0, totalUsersCount - reportedTotal);
    
    formattedData[0].value = presentCount;
    formattedData[1].value = lateCount;
    formattedData[2].value = leaveCount + realAbsent;

    // 4. Fetch Recent Check-ins (Latest 5)
    const recentCheckIns = await db.collection("attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $sort: { "checkIn.time": -1 } },
      { $limit: 10 },
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
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: "$_id" },
          name: { $ifNull: ["$userDetails.name", "พนักงาน"] },
          department: { $ifNull: ["$userDetails.department", "ทั่วไป"] },
          image: "$userDetails.image",
          time: "$checkIn.time",
          status: "$status"
        }
      }
    ]).toArray();

    // 5. Attendance Trends
    const trendRange = searchParams.get('range') || 'week'; // day, week, month
    let trendStartDate: Date;
    let trendGroup: any;

    if (trendRange === 'day') {
      trendStartDate = startOfDay;
      trendGroup = {
        _id: { $hour: { date: "$checkIn.time", timezone: "Asia/Bangkok" } },
        present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } }
      };
    } else if (trendRange === 'month') {
      trendStartDate = new Date(targetDate);
      trendStartDate.setUTCDate(trendStartDate.getUTCDate() - 29);
      trendStartDate.setUTCHours(0, 0, 0, 0);
      trendGroup = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } }
      };
    } else {
      // Default: week (7 days)
      trendStartDate = new Date(targetDate);
      trendStartDate.setUTCDate(trendStartDate.getUTCDate() - 6);
      trendStartDate.setUTCHours(0, 0, 0, 0);
      trendGroup = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } }
      };
    }

    let trends = await db.collection("attendances").aggregate([
      { $match: { date: { $gte: trendStartDate, $lte: endOfDay } } },
      { $group: trendGroup },
      { $sort: { "_id": 1 } }
    ]).toArray();

    // If day, ensure all hours are represented (0-23 or limited range)
    if (trendRange === 'day') {
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        _id: i,
        present: 0
      }));
      trends.forEach(t => {
        if (t._id !== null) {
          const hour = t._id;
          if (hourlyData[hour]) hourlyData[hour].present = t.present;
        }
      });
      trends = hourlyData;
    }

    // 6. Department Breakdown
    const departmentStats = await db.collection("attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
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
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$userDetails.department", "ทั่วไป"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // 2. Fetch Markers with efficient $lookup instead of populate
    const markers = await db.collection("attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
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
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: "$_id" },
          name: { $ifNull: ["$userDetails.name", "พนักงาน"] },
          lat: "$checkIn.location.lat",
          lng: "$checkIn.location.lng",
          status: "$status",
          time: "$checkIn.time",
          photoUrl: "$checkIn.photoUrl"
        }
      }
    ]).toArray();

    // Filter markers with valid coordinates
    const validMarkers = markers.filter(m => m.lat && m.lng);

    const end = Date.now();
    console.log(`[API] Dashboard Stats took ${end - start}ms (DB: ${end - midConn}ms)`);

    return NextResponse.json({ 
      success: true, 
      data: formattedData, 
      markers: validMarkers,
      totalEmployees: totalUsersCount,
      recentCheckIns,
      trends,
      departmentStats
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
