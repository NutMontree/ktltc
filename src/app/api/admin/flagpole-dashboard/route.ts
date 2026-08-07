import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth, hasPermission } from '@/lib/auth';
import { calculateDistance } from '@/lib/geoDistance';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    
    // Allow specific staff roles. (Make sure deputy_strategy is included!)
    const STAFF_ROLES = [
      "super_admin", "admin", "director", "deputy_director", 
      "deputy_academic", "deputy_student_affairs", "deputy_resource", "deputy_plan", "deputy_strategy",
      "hr", "head_department", "staff", "editor", "teacher"
    ];
    
    const hasAccess = STAFF_ROLES.includes(role) && role !== "student";
    
    console.log("FLAGPOLE DASHBOARD API - User Role:", role, "Has Access:", hasAccess);
                      
    if (!hasAccess) {
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
    const totalStudentsCount = await db.collection("users").countDocuments({ role: "student", isActive: { $ne: false } });

    // นับจำนวนนักศึกษาที่ออกฝึกงาน (isInternship === true หรือ "true")
    const internshipStudentsCount = await db.collection("users").countDocuments({ 
      role: "student", 
      isInternship: { $in: [true, "true"] },
      isActive: { $ne: false }
    });

    // นับจำนวนนักศึกษาที่เรียนปกติในวิทยาลัย (isInternship !== true)
    const inCollegeStudentsCount = Math.max(0, totalStudentsCount - internshipStudentsCount);

    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 2. ดึงสถิติจำนวนคนเช็คแถวเสาธงแยกตามสถานะ (Present / Late) และกลุ่มผู้เรียน (ปกติ / ฝึกงาน)
    const stats = await db.collection("flagpole_attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $sort: { "checkIn.time": -1 } },
      {
        $group: {
          _id: "$userId",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
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
      { $match: { "userDetails.isActive": { $ne: false } } },
      {
        $group: {
          _id: { status: "$status", isInternship: "$userDetails.isInternship" },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    let normalPresentCount = 0;
    let normalLateCount = 0;
    let internshipPresentCount = 0;
    let internshipLateCount = 0;

    stats.forEach(stat => {
      const isInternship = stat._id.isInternship === true || stat._id.isInternship === "true";
      if (isInternship) {
        if (stat._id.status === 'Present') internshipPresentCount += stat.count;
        else if (stat._id.status === 'Late') internshipLateCount += stat.count;
      } else {
        if (stat._id.status === 'Present') normalPresentCount += stat.count;
        else if (stat._id.status === 'Late') normalLateCount += stat.count;
      }
    });

    const normalReportedTotal = normalPresentCount + normalLateCount;
    const normalAbsentCount = Math.max(0, inCollegeStudentsCount - normalReportedTotal);

    const internshipReportedTotal = internshipPresentCount + internshipLateCount;
    const internshipAbsentCount = Math.max(0, internshipStudentsCount - internshipReportedTotal);

    const formattedData = [
      { name: 'ตรงเวลา (ปกติ)', value: normalPresentCount, color: '#10b981' }, 
      { name: 'มาสาย (ปกติ)', value: normalLateCount, color: '#f59e0b' },   
      { name: 'ขาดแถว (ปกติ)', value: normalAbsentCount, color: '#f43f5e' }    
    ];

    const internshipFormattedData = [
      { name: 'ตรงเวลา (ฝึกงาน)', value: internshipPresentCount, color: '#10b981' }, 
      { name: 'มาสาย (ฝึกงาน)', value: internshipLateCount, color: '#f59e0b' },   
      { name: 'ขาดแถว (ฝึกงาน)', value: internshipAbsentCount, color: '#f43f5e' }    
    ];

    const statsOnly = searchParams.get('statsOnly') === 'true';
    if (statsOnly) {
      return NextResponse.json({
        success: true,
        data: formattedData,
        internshipData: internshipFormattedData,
        totalStudents: totalStudentsCount,
        inCollegeStudents: inCollegeStudentsCount,
        internshipStudents: internshipStudentsCount,
      });
    }

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
          status: "$status",
          statusTag: "$checkIn.statusTag",
          distance: "$checkIn.distance"
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
        _id: { $hour: { date: "$doc.checkIn.time", timezone: "Asia/Bangkok" } },
        present: { $sum: { $cond: [{ $in: ["$doc.status", ["Present", "Late"]] }, 1, 0] } }
      };
    } else if (trendRange === 'month') {
      trendStartDate = new Date(targetDate);
      trendStartDate.setUTCDate(trendStartDate.getUTCDate() - 29);
      trendStartDate.setUTCHours(0, 0, 0, 0);
      trendGroup = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$doc.date" } },
        present: { $sum: { $cond: [{ $in: ["$doc.status", ["Present", "Late"]] }, 1, 0] } }
      };
    } else {
      // Default: week (7 วัน)
      trendStartDate = new Date(targetDate);
      trendStartDate.setUTCDate(trendStartDate.getUTCDate() - 6);
      trendStartDate.setUTCHours(0, 0, 0, 0);
      trendGroup = {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$doc.date" } },
        present: { $sum: { $cond: [{ $in: ["$doc.status", ["Present", "Late"]] }, 1, 0] } }
      };
    }

    let trends = await db.collection("flagpole_attendances").aggregate([
      { $match: { date: { $gte: trendStartDate, $lte: endOfDay } } },
      {
        $sort: { "checkIn.time": -1 }
      },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            userId: "$userId"
          },
          doc: { $first: "$$ROOT" }
        }
      },
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

    // 5. สถิติการเข้าแถวแบ่งตามระดับชั้นปีการศึกษา (Academic Level Stats) - แบบละเอียด
    const departmentStats = await db.collection("flagpole_attendances").aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
      { $sort: { "checkIn.time": -1 } },
      {
        $group: {
          _id: "$userId",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
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
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] } },
          inZone: { $sum: { $cond: [{ $eq: ["$checkIn.statusTag", "อยู่ในพื้นที่ (In-Site)"] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
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
          academicLevel: { $ifNull: ["$userDetails.academicLevel", "ไม่ระบุชั้นปี"] },
          lat: "$checkIn.location.lat",
          lng: "$checkIn.location.lng",
          status: "$status",
          time: "$checkIn.time",
          photoUrl: "$checkIn.photoUrl",
          image: "$userDetails.image",
          statusTag: "$checkIn.statusTag",  // "อยู่ในพื้นที่ (In-Site)" หรือ "นอกพื้นที่ (Remote/WFH)"
          distance: "$checkIn.distance"     // ระยะห่างจากเสาธง (เมตร)
        }
      }
    ]).toArray();

    const flagpoleSetting = await db.collection("flagpole_settings").findOne({ key: "global_flagpole" });
    const config = {
      lat: flagpoleSetting?.lat ?? 14.754043,
      lng: flagpoleSetting?.lng ?? 104.65807,
      radius: flagpoleSetting?.inSiteDistance ?? 200,
    };

    const validMarkers = markers
      .filter(m => m.lat != null && m.lng != null)
      .map(m => {
        // Recalculate distance from flagpole center for accuracy
        const calculatedDistance = m.lat && m.lng ? calculateDistance(
          flagpoleSetting?.lat ?? 14.754043,
          flagpoleSetting?.lng ?? 104.65807,
          m.lat,
          m.lng
        ) : null;

        const threshold = flagpoleSetting?.inSiteDistance ?? 200;

        // Use calculated distance for determining inZone status (more accurate)
        const inZone = calculatedDistance !== null
          ? calculatedDistance <= threshold
          : (m.statusTag?.includes("In-Site") ?? false);

        return {
          ...m,
          inZone,
          calculatedDistance
        };
      });



    return NextResponse.json({
      success: true,
      data: formattedData,
      internshipData: internshipFormattedData,
      markers: validMarkers,
      totalStudents: totalStudentsCount,
      internshipStudents: internshipStudentsCount,
      inCollegeStudents: inCollegeStudentsCount,
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
