import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [GET] ดึงข้อมูลบันทึกเข้าแถวเสาธงของนักเรียนตามตัวกรอง วัน/เดือน/ปี (สิทธิ์แอดมิน)
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
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const search = searchParams.get("search") || "";
    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let matchQuery: any = {};

    // 1. ตัวกรองวันที่ (วัน/เดือน/ปี)
    if (day || month || year) {
      const dateFilter: any = {};
      if (year) dateFilter[`$expr`] = { $eq: [{ $year: "$date" }, parseInt(year)] };
      if (month) {
        const mFilter = { $eq: [{ $month: "$date" }, parseInt(month)] };
        dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], mFilter] } : mFilter;
      }
      if (day) {
        const dFilter = { $eq: [{ $dayOfMonth: "$date" }, parseInt(day)] };
        dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], dFilter] } : dFilter;
      }
      matchQuery = { ...dateFilter };
    }

    // 2. ค้นหาผู้ใช้ (ชื่อ/รหัส/ชั้นเรียน)
    if (search) {
      let searchMatch: any = {};
      if (ObjectId.isValid(search)) {
        searchMatch = {
          $or: [
            { _id: new ObjectId(search) },
            { userId: new ObjectId(search) },
            { userId: search }
          ]
        };
      } else {
        const matchingUsers = await db.collection("users").find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { studentId: { $regex: search, $options: "i" } },
            { academicLevel: { $regex: search, $options: "i" } }
          ]
        }).project({ _id: 1 }).limit(20).toArray();

        const userIds = matchingUsers.map(u => u._id);
        const userIdsStrings = userIds.map(id => id.toString());

        searchMatch = {
          $or: [
            { userId: { $in: userIds } },
            { userId: { $in: userIdsStrings } }
          ]
        };
      }

      if (Object.keys(matchQuery).length > 0) {
        matchQuery = { $and: [matchQuery, searchMatch] };
      } else {
        matchQuery = searchMatch;
      }
    }

    const totalCount = await db.collection("flagpole_attendances").countDocuments(matchQuery);

    const attendances = await db.collection("flagpole_attendances").aggregate([
      { $match: matchQuery },
      { $sort: { date: -1, "checkIn.time": -1 } },
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
          _id: 1,
          date: 1,
          status: 1,
          checkIn: 1,
          user: {
            name: { $ifNull: ["$userDetails.name", "นักศึกษา"] },
            studentId: { $ifNull: ["$userDetails.studentId", "-"] },
            academicLevel: { $ifNull: ["$userDetails.academicLevel", "-"] },
            image: "$userDetails.image"
          }
        }
      }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: attendances,
      total: totalCount
    });
  } catch (error: any) {
    console.error("[API Flagpole Data GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * [PATCH] อัปเดตข้อมูลเข้าแถวของนักเรียนโดยตรง (สิทธิ์แอดมิน)
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ success: false, message: "พารามิเตอร์ไม่ครบถ้วน" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    delete updates._id;
    delete updates.user;

    // แปลงประเภทตัวแปรให้เป็นมาตรฐานฐานข้อมูล
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.checkIn?.time) updates.checkIn.time = new Date(updates.checkIn.time);
    if (updates.checkIn?.distance) updates.checkIn.distance = parseFloat(updates.checkIn.distance);

    let query: any = { _id: new ObjectId(id) };

    const result = await db.collection("flagpole_attendances").updateOne(query, { $set: updates });

    // บันทึกระบบ Audit Log
    await db.collection("logs").insertOne({
      userName: (session?.user as any)?.name || "Admin",
      action: "UPDATE_FLAGPOLE_DATA",
      details: `แก้ไขข้อมูลการเข้าแถวเสาธงนักศึกษา ID: ${id}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: role,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[API Flagpole Data PATCH Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * [DELETE] ลบประวัติการเข้าแถวของนักเรียน (สิทธิ์แอดมิน)
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role?.toLowerCase();
    if (!["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let result;
    if (deleteAll) {
      result = await db.collection("flagpole_attendances").deleteMany({});

      await db.collection("logs").insertOne({
        userName: (session?.user as any)?.name || "Admin",
        action: "BULK_DELETE_FLAGPOLE_DATA",
        details: `ล้างข้อมูลประวัติเข้าแถวของนักศึกษาทั้งหมดในวิทยาลัย (${result.deletedCount} รายการ)`,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        role: role,
      });
    } else {
      if (!id) return NextResponse.json({ success: false, message: "ไม่พบรหัสข้อมูลการลบ" }, { status: 400 });
      
      result = await db.collection("flagpole_attendances").deleteOne({ _id: new ObjectId(id) });

      await db.collection("logs").insertOne({
        userName: (session?.user as any)?.name || "Admin",
        action: "DELETE_FLAGPOLE_DATA",
        details: `ลบข้อมูลเช็คชื่อเข้าแถวนักศึกษา ID: ${id}`,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        role: role,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[API Flagpole Data DELETE Error]:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
