import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    // วันที่เป้าหมายฝั่งไทย (เวลา 00:00:00.000Z)
    let targetDate: Date;
    if (dateParam) {
      targetDate = new Date(dateParam);
    } else {
      targetDate = new Date();
    }
    targetDate.setUTCHours(0, 0, 0, 0);

    // 1. นับจำนวนนักเรียนทั้งหมดในระบบ (role === "student")
    const totalStudentsCount = await db.collection("users").countDocuments({ role: "student" });

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 2. ดึงสถิติจำนวนคนเช็คแถวเสาธงแยกตามสถานะ (Present / Late)
    const stats = await db.collection("flagpole_attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const formattedData = [
      { name: 'ตรงเวลา', value: 0, color: '#10b981' }, // เขียว
      { name: 'มาสาย', value: 0, color: '#f59e0b' },   // ส้ม
      { name: 'ขาดแถว', value: 0, color: '#f43f5e' }    // แดง
    ];

    let presentCount = 0;
    let lateCount = 0;

    stats.forEach(stat => {
      if (stat._id === 'Present') presentCount = stat.count;
      else if (stat._id === 'Late') lateCount = stat.count;
    });

    const reportedTotal = presentCount + lateCount;
    const realAbsent = Math.max(0, totalStudentsCount - reportedTotal);

    formattedData[0].value = presentCount;
    formattedData[1].value = lateCount;
    formattedData[2].value = realAbsent;

    // 3. กิจกรรมลงชื่อเข้าแถวล่าสุด 10 รายการ
    const recentCheckIns = await db.collection("flagpole_attendances").aggregate([
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
          name: { $ifNull: ["$userDetails.name", "นักศึกษา"] },
          department: { $ifNull: ["$userDetails.academicLevel", "ไม่ระบุชั้นปี"] },
          image: "$userDetails.image",
          time: "$checkIn.time",
          status: "$status"
        }
      }
    ]).toArray();

    // 4. สถิติแนวโน้มการเข้าแถว (Trends)
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
      // Default: week (7 วัน)
      trendStartDate = new Date(targetDate);
      trendStartDate.setUTCDate(trendStartDate.getUTCDate() - 6);
      trendStartDate.setUTCHours(0, 0, 0, 0);
      trendGroup = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $in: ["$status", ["Present", "Late"]] }, 1, 0] } }
      };
    }

    let trends = await db.collection("flagpole_attendances").aggregate([
      { $match: { date: { $gte: trendStartDate, $lte: endOfDay } } },
      { $group: trendGroup },
      { $sort: { "_id": 1 } }
    ]).toArray();

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

    // 5. สถิติการเข้าแถวแบ่งตามระดับชั้นปีการศึกษา (Academic Level Stats)
    const departmentStats = await db.collection("flagpole_attendances").aggregate([
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
          _id: { $ifNull: ["$userDetails.academicLevel", "ไม่ระบุชั้นปี"] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // 6. ดึงพิกัด GPS นักเรียนเพื่อปักหมุดบนแผนที่หน้าเสาธง
    const markers = await db.collection("flagpole_attendances").aggregate([
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
          name: { $ifNull: ["$userDetails.name", "นักศึกษา"] },
          lat: "$checkIn.location.lat",
          lng: "$checkIn.location.lng",
          status: "$status",
          time: "$checkIn.time",
          photoUrl: "$checkIn.photoUrl"
        }
      }
    ]).toArray();

    const validMarkers = markers.filter(m => m.lat && m.lng);

    const flagpoleSetting = await db.collection("flagpole_settings").findOne({ key: "global_flagpole" });
    const config = {
      lat: flagpoleSetting?.lat ?? 14.754043,
      lng: flagpoleSetting?.lng ?? 104.65807,
      radius: flagpoleSetting?.inSiteDistance ?? 200,
    };

    return NextResponse.json({
      success: true,
      data: formattedData,
      markers: validMarkers,
      totalStudents: totalStudentsCount,
      recentCheckIns,
      trends,
      departmentStats,
      config
    });
  } catch (error: any) {
    console.error("Flagpole Dashboard API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
