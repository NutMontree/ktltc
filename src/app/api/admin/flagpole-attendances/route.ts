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
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const statusFilter = searchParams.get('status') || 'all'; // all, Present, Late
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // สร้างเงื่อนไขการค้นหาช่วงเวลา
    const query: any = {};
    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    //Aggregate เพื่อ Join ข้อมูลผู้ใช้
    const totalCount = await db.collection("flagpole_attendances").countDocuments(query);
    const attendances = await db.collection("flagpole_attendances").aggregate([
      { $match: query },
      { $sort: { "checkIn.time": -1 } },
      { $skip: skip },
      { $limit: limit },
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
          date: "$date",
          status: "$status",
          photoUrl: "$checkIn.photoUrl",
          time: "$checkIn.time",
          distance: "$checkIn.distance",
          deviceId: "$checkIn.deviceId",
          address: "$checkIn.address",
          lat: "$checkIn.location.lat",
          lng: "$checkIn.location.lng",
          user: {
            name: { $ifNull: ["$userDetails.name", "นักศึกษา"] },
            academicLevel: { $ifNull: ["$userDetails.academicLevel", "ไม่ระบุชั้นปี"] },
            studentId: { $ifNull: ["$userDetails.studentId", "-"] },
            image: "$userDetails.image"
          }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: attendances,
      hasMore: skip + attendances.length < totalCount,
      total: totalCount
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
    if (!["super_admin", "admin"].includes(userRole)) {
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
