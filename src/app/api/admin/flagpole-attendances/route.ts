import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

/**
 * [GET] ดึงประวัติรายการเช็คชื่อเข้าแถวของนักเรียนตามตัวกรอง (สิทธิ์แอดมิน)
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin", "editor", "teacher"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const statusFilter = searchParams.get('status') || 'all'; // all, Present, Late, Absent
    const studentType = searchParams.get('studentType') || 'all'; // all, normal, internship
    const searchQuery = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const classGroupId = searchParams.get('classGroupId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // สร้างเงื่อนไขการค้นหาช่วงเวลา
    let query: any = {};
    if (startDateParam && startDateParam !== "undefined" && endDateParam && endDateParam !== "undefined") {
      const start = new Date(startDateParam);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setUTCHours(23, 59, 59, 999);
      
      // รองรับทั้ง Date object และ String (เผื่อในฐานข้อมูลมีการเก็บทั้งสองแบบ)
      const startStr = start.toISOString();
      const endStr = end.toISOString();
      
      query.$or = [
        { date: { $gte: start, $lte: end } },
        { date: { $gte: startStr, $lte: endStr } },
        { date: { $gte: startDateParam, $lte: endDateParam + "T23:59:59.999Z" } }
      ];
    }

    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    // สร้างเงื่อนไขการกรองผู้ใช้ (ตามคำค้นหา แผนกวิชา หรือห้องเรียน)
    let userFilterQuery: any = { role: "student" };
    let hasUserFilters = false;

    if (department && department !== "undefined") {
      userFilterQuery.department = department;
      hasUserFilters = true;
    }
    if (classGroupId && classGroupId !== "undefined") {
      userFilterQuery.classGroupId = classGroupId;
      hasUserFilters = true;
    }

    if (searchQuery && searchQuery !== "undefined") {
      const searchRegex = { $regex: searchQuery, $options: "i" };
      userFilterQuery.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { academicLevel: searchRegex }
      ];
      hasUserFilters = true;
    }

    if (studentType === "normal") {
      userFilterQuery.isInternship = { $ne: true };
      hasUserFilters = true;
    } else if (studentType === "internship") {
      userFilterQuery.isInternship = true;
      hasUserFilters = true;
    }

    if (hasUserFilters) {
      // ค้นหารายชื่อนักเรียนที่ตรงตามตัวกรองทั้งหมด (ไม่จำกัดจำนวนเพื่อให้เช็คสถิติรายห้องได้ครบ)
      const matchingUsers = await db.collection("users")
        .find(userFilterQuery)
        .project({ _id: 1 })
        .toArray();

      const userIds = matchingUsers.map(u => u._id);
      const userIdsStrings = userIds.map(id => id.toString());

      const userMatch = {
        $or: [
          { userId: { $in: userIds } },
          { userId: { $in: userIdsStrings } },
          { uId: { $in: userIds } }
        ]
      };

      if (Object.keys(query).length > 0) {
        query = { $and: [query, userMatch] };
      } else {
        query = userMatch;
      }
    }

    // ดึงห้องเรียนทั้งหมดที่สังกัดในแผนกเพื่อเอาไปทำตัวกรอง (Class Groups Dropdown)
    let classGroups: string[] = [];
    try {
      const distinctFilter: any = { role: "student" };
      if (department) {
        distinctFilter.department = department;
      }
      classGroups = await db.collection("users").distinct("classGroupId", distinctFilter);
      classGroups = classGroups.filter(Boolean).sort();
    } catch (err) {
      console.error("Fetch distinct class groups error:", err);
    }

    if (statusFilter === "Absent") {
      // For Absent, if not explicitly querying internship, we usually ignore interns
      if (studentType !== "internship" && studentType !== "all") {
        userFilterQuery.isInternship = { $ne: true };
      } else if (studentType === "all") {
        userFilterQuery.isInternship = { $ne: true }; // Default to not showing interns absent by default, unless they specifically want 'all'
        // Actually, if studentType === "all", let's respect it and show absent for both. 
        // But usually interns don't have to check in. Let's just use what's already set in userFilterQuery.
      }
      const students = await db.collection("users").find(userFilterQuery).project({
        _id: 1, name: 1, academicLevel: 1, studentId: 1, department: 1, classGroupId: 1, image: 1
      }).toArray();

      const attendances = await db.collection("flagpole_attendances").find(
        { date: { $gte: startDateParam, $lte: endDateParam + "T23:59:59.999Z" } }
      ).project({ userId: 1, uId: 1, date: 1 }).toArray();

      const attendanceSet = new Set();
      for (const a of attendances) {
        const id = a.userId ? a.userId.toString() : (a.uId ? a.uId.toString() : "");
        let dateStr = "";
        if (typeof a.date === 'string') {
          dateStr = a.date.split('T')[0];
        } else if (a.date instanceof Date) {
          dateStr = a.date.toISOString().split('T')[0];
        }
        if (id && dateStr) {
          attendanceSet.add(`${id}_${dateStr}`);
        }
      }

      const dates = [];
      if (startDateParam && endDateParam) {
        const startD = new Date(startDateParam);
        const endD = new Date(endDateParam);
        while(startD <= endD) {
          dates.push(startD.toISOString().split('T')[0]);
          startD.setUTCDate(startD.getUTCDate() + 1);
        }
      } else {
        dates.push(new Date().toISOString().split('T')[0]);
      }

      if (dates.length > 31) {
        return NextResponse.json({ success: false, message: "ช่วงวันที่กว้างเกินไปสำหรับการค้นหาผู้ที่ไม่ได้เข้าแถว (จำกัด 31 วัน)" }, { status: 400 });
      }

      const absentRecords = [];
      for (const student of students) {
        const sId = student._id.toString();
        for (const d of dates) {
          if (!attendanceSet.has(`${sId}_${d}`)) {
            absentRecords.push({
              id: `absent_${sId}_${d}`,
              date: d,
              status: "Absent",
              photoUrl: null,
              time: null,
              distance: undefined,
              deviceId: null,
              address: null,
              lat: null,
              lng: null,
              statusTag: null,
              user: {
                name: student.name || "นักศึกษา",
                academicLevel: student.academicLevel || "ไม่ระบุชั้นปี",
                studentId: student.studentId || "-",
                department: student.department || "-",
                classGroupId: student.classGroupId || "-",
                image: student.image
              }
            });
          }
        }
      }

      const totalCount = absentRecords.length;
      const paginatedRecords = absentRecords.slice(skip, skip + limit);

      return NextResponse.json({
        success: true,
        data: paginatedRecords,
        hasMore: skip + paginatedRecords.length < totalCount,
        total: totalCount,
        classGroups
      });
    }

    //Aggregate เพื่อ Join ข้อมูลผู้ใช้
    const totalCount = await db.collection("flagpole_attendances").countDocuments(query);
    const attendances = await db.collection("flagpole_attendances").aggregate([
      { $match: query },
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
      { $sort: { "checkIn.time": -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          id: { $toString: "$_id" },
          date: "$date",
          status: "$status",
          photoUrl: "$checkIn.photoUrl",
          time: "$checkIn.time",
          distance: "$checkIn.distance",
          deviceId: "$checkIn.deviceId",
          // address เก็บใน checkIn.location.address ไม่ใช่ checkIn.address
          address: {
            $ifNull: [
              "$checkIn.location.address",
              { $ifNull: ["$checkIn.address", "$checkIn.statusTag"] }
            ]
          },
          lat: "$checkIn.location.lat",
          lng: "$checkIn.location.lng",
          statusTag: "$checkIn.statusTag",
          user: {
            name: { $ifNull: ["$userDetails.name", "นักศึกษา"] },
            academicLevel: { $ifNull: ["$userDetails.academicLevel", "ไม่ระบุชั้นปี"] },
            studentId: { $ifNull: ["$userDetails.studentId", "-"] },
            department: { $ifNull: ["$userDetails.department", "-"] },
            classGroupId: { $ifNull: ["$userDetails.classGroupId", "-"] },
            image: "$userDetails.image"
          }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: attendances,
      hasMore: skip + attendances.length < totalCount,
      total: totalCount,
      classGroups,
      debugQuery: query
    });
  } catch (error: any) {
    console.error("Flagpole Attendances GET Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * [PATCH] ปรับปรุงสถานะการเข้าแถวของนักเรียนด้วยตนเอง (สิทธิ์แอดมิน)
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin", "editor", "teacher"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !["Present", "Late"].includes(status)) {
      return NextResponse.json({ success: false, message: "ข้อมูลพารามิเตอร์ไม่ครบถ้วน" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const result = await db.collection("flagpole_attendances").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    // บันทึกระบบ Audit Log
    await db.collection("logs").insertOne({
      userName: (session?.user as any)?.name || "Admin",
      action: "UPDATE_FLAGPOLE_ATTENDANCE",
      details: `ปรับปรุงสถานะการเข้าแถวเสาธง ID: ${id} เป็น: ${status === "Present" ? "ตรงเวลา" : "สาย"}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: userRole,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Flagpole Attendances PATCH Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * [DELETE] ลบรายการบันทึกการเข้าแถวของนักศึกษา (สิทธิ์แอดมิน)
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin"].includes(userRole)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (deleteAll === 'true') {
      // ลบทั้งหมดในระบบเสาธง
      const result = await db.collection("flagpole_attendances").deleteMany({});
      
      await db.collection("logs").insertOne({
        userName: (session?.user as any)?.name || "Admin",
        action: "DELETE_ALL_FLAGPOLE_ATTENDANCES",
        details: "ล้างฐานข้อมูลประวัติการเข้าเสาธงนักศึกษาทั้งหมดในวิทยาลัย",
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        role: userRole,
      });

      return NextResponse.json({ success: true, message: `ลบรายงานเสาธงทั้งหมดเรียบร้อยแล้ว (${result.deletedCount} รายการ)` });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: "กรุณาระบุ ID บันทึกที่จะลบ" }, { status: 400 });
    }

    const result = await db.collection("flagpole_attendances").deleteOne({ _id: new ObjectId(id) });

    await db.collection("logs").insertOne({
      userName: (session?.user as any)?.name || "Admin",
      action: "DELETE_FLAGPOLE_ATTENDANCE",
      details: `ลบบันทึกการเข้าเสาธงนักศึกษา ID: ${id}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: userRole,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Flagpole Attendances DELETE Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
