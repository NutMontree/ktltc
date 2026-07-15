import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = 'force-dynamic';

/**
 * [GET] ดึงประวัติรายการเช็คชื่อเข้าแถวของนักเรียนตามตัวกรอง (สิทธิ์แอดมิน)
 * รองรับการสร้างสถานะ 'ไม่ได้เข้าแถว' (Absent) แบบจำลองรายวัน
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    const allowedRoles = [
      "super_admin", "admin", "editor", "teacher", "hr", "director", "staff",
      "deputy_student_affairs", "deputy_academic", "deputy_strategy", "deputy_resource"
    ];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const statusFilter = searchParams.get('status') || 'all';
    const studentTypeFilter = searchParams.get('studentType') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const departmentFilter = searchParams.get('department') || '';
    const classGroupFilter = searchParams.get('classGroupId') || '';
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ค้นหานักศึกษาทั้งหมดที่ตรงตามฟิลเตอร์
    const userQuery: any = { role: "student" };
    if (departmentFilter) userQuery.department = departmentFilter;
    if (classGroupFilter) userQuery.classGroupId = classGroupFilter;
    if (studentTypeFilter === 'normal') userQuery.isInternship = { $ne: true };
    else if (studentTypeFilter === 'internship') userQuery.isInternship = true;
    
    if (searchQuery) {
      userQuery.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { studentId: { $regex: searchQuery, $options: 'i' } },
        { classGroupId: { $regex: searchQuery, $options: 'i' } },
        { academicLevel: { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    const allMatchingUsers = await db.collection("users").find(userQuery).project({ name: 1, academicLevel: 1, studentId: 1, image: 1, department: 1, classGroupId: 1, learnerType: 1 }).toArray();
    const matchingUserIdsStr = allMatchingUsers.map(u => u._id.toString());
    const matchingUserIdsObj = allMatchingUsers.map(u => u._id);

    // 2. สร้าง List ของ Class Groups ให้ตัวกรอง
    let classGroups: string[] = [];
    if (departmentFilter) {
      const cgSet = new Set<string>();
      allMatchingUsers.forEach(u => {
         if (u.classGroupId) cgSet.add(u.classGroupId);
      });
      classGroups = Array.from(cgSet).sort();
    }

    // 3. ค้นหาประวัติการเข้าแถวทั้งหมดในช่วงเวลา (อิงตามเวลาไทย +07:00)
    let startD = new Date();
    let endD = new Date();
    
    if (startDateParam && endDateParam) {
      startD = new Date(`${startDateParam}T00:00:00.000+07:00`);
      endD = new Date(`${endDateParam}T23:59:59.999+07:00`);
    } else {
      // Fallback to today in Thai time
      const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
      startD = new Date(`${today}T00:00:00.000+07:00`);
      endD = new Date(`${today}T23:59:59.999+07:00`);
    }

    const attendances = await db.collection("flagpole_attendances").find({
      date: { $gte: startD, $lte: endD },
      userId: { $in: [...matchingUserIdsStr, ...matchingUserIdsObj] }
    }).toArray();

    const attendancesByDate: Record<string, any[]> = {};
    attendances.forEach(a => {
      // แปลง date เป็นเวลาไทยเพื่อจัดกลุ่ม
      const d = new Date(a.date);
      const thaiTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const dStr = thaiTime.toISOString().split('T')[0];
      if (!attendancesByDate[dStr]) attendancesByDate[dStr] = [];
      attendancesByDate[dStr].push(a);
    });

    const finalData: any[] = [];
    
    // ตั้งค่าลูปวันแบบเวลาไทย เพื่อให้ string วิ่งตรงกับ dateRange
    const current = new Date(startD.getTime() + 7 * 60 * 60 * 1000);
    current.setUTCHours(0, 0, 0, 0);
    const limitD = new Date(endD.getTime() + 7 * 60 * 60 * 1000);
    limitD.setUTCHours(0, 0, 0, 0);

    // 4. ลูปเพื่อสร้างและรวมข้อมูลแบบรายวัน
    while (current <= limitD) {
      const dStr = current.toISOString().split('T')[0];
      const dayAttend = attendancesByDate[dStr] || [];
      const presentUserIds = new Set(dayAttend.map(a => a.userId?.toString()));

      // 4.1 ใส่ข้อมูลคนที่มีสถานะ (Present / Late)
      if (statusFilter === 'all' || statusFilter === 'Present' || statusFilter === 'Late') {
        const filteredDayAttend = dayAttend.filter(a => statusFilter === 'all' || a.status === statusFilter);
        filteredDayAttend.forEach(a => {
           const u = allMatchingUsers.find(user => user._id.toString() === a.userId?.toString());
           finalData.push({
             id: a._id.toString(),
             date: a.date,
             status: a.status,
             photoUrl: a.checkIn?.photoUrl,
             time: a.checkIn?.time,
             distance: a.checkIn?.distance,
             deviceId: a.checkIn?.deviceId,
             address: a.checkIn?.address,
             lat: a.checkIn?.location?.lat,
             lng: a.checkIn?.location?.lng,
             user: {
               name: u ? u.name : "นักศึกษา",
               academicLevel: u ? u.academicLevel : "ไม่ระบุชั้นปี",
               studentId: u ? u.studentId : "-",
               image: u ? u.image : undefined,
               department: u ? u.department : undefined,
               classGroupId: u ? u.classGroupId : undefined,
               learnerType: u ? u.learnerType : undefined
             }
           });
        });
      }

      // 4.2 สร้างข้อมูลสมมติให้คนที่ไม่มีสถานะ (Absent)
      if (statusFilter === 'all' || statusFilter === 'Absent') {
        allMatchingUsers.forEach(u => {
          const uIdStr = u._id.toString();
          if (!presentUserIds.has(uIdStr)) {
            // วันที่จำลองสำหรับ Absent ให้อยู่ในช่วงเช้าของวันนั้นตามเวลาไทย
            const mockDate = new Date(`${dStr}T08:00:00.000+07:00`);
            finalData.push({
              id: `absent-${dStr}-${uIdStr}`,
              date: mockDate,
              status: "Absent",
              photoUrl: null,
              time: null,
              distance: null,
              deviceId: null,
              address: null,
              lat: null,
              lng: null,
              user: {
               name: u.name || "นักศึกษา",
               academicLevel: u.academicLevel || "ไม่ระบุชั้นปี",
               studentId: u.studentId || "-",
               image: u.image,
               department: u.department,
               classGroupId: u.classGroupId,
               learnerType: u.learnerType
             }
            });
          }
        });
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }

    // 5. จัดเรียงข้อมูล (วันที่ล่าสุดขึ้นก่อน, ตามด้วยชื่อตัวอักษร)
    finalData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA; // Date Desc
      return a.user.name.localeCompare(b.user.name); // Name Asc
    });

    const totalCount = finalData.length;
    const paginatedData = finalData.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      hasMore: skip + paginatedData.length < totalCount,
      total: totalCount,
      classGroups: classGroups
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
    if (!["super_admin", "admin"].includes(userRole || "")) {
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
      userName: session?.user?.name || "Admin",
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
    if (!["super_admin", "admin"].includes(userRole || "")) {
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
        userName: session?.user?.name || "Admin",
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
      userName: session?.user?.name || "Admin",
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
