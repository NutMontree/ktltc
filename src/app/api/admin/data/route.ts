import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [GET] ดึงข้อมูล Attendance, Leave, Survey สำหรับ Super Admin
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    // เงื่อนไข: super_admin เท่านั้นที่เข้าถึงได้
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "attendance";
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");
    const search = searchParams.get("search") || "";
    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let matchQuery: any = {};
    
    // 1. กรองด้วยตัวเลือก วัน/เดือน/ปี
    if (day || month || year) {
      const dateFilter: any = {};
      const targetField = type === "attendance" ? "date" : type === "leave" ? "startDate" : null;

      if (targetField) {
        if (year) dateFilter[`$expr`] = { $eq: [{ $year: `$${targetField}` }, parseInt(year)] };
        if (month) {
          const mFilter = { $eq: [{ $month: `$${targetField}` }, parseInt(month)] };
          dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], mFilter] } : mFilter;
        }
        if (day) {
          const dFilter = { $eq: [{ $dayOfMonth: `$${targetField}` }, parseInt(day)] };
          dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], dFilter] } : dFilter;
        }
      } else if (type === "suvery") {
        // สำหรับ suvery ใช้ _id (Timestamp)
        if (year) dateFilter[`$expr`] = { $eq: [{ $year: { $toDate: "$_id" } }, parseInt(year)] };
        if (month) {
          const mFilter = { $eq: [{ $month: { $toDate: "$_id" } }, parseInt(month)] };
          dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], mFilter] } : mFilter;
        }
        if (day) {
          const dFilter = { $eq: [{ $dayOfMonth: { $toDate: "$_id" } }, parseInt(day)] };
          dateFilter[`$expr`] = dateFilter[`$expr`] ? { $and: [dateFilter[`$expr`], dFilter] } : dFilter;
        }
      }
      matchQuery = { ...dateFilter };
    }

    // 2. กรองด้วยคำค้นหา (Search)
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
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }).project({ _id: 1 }).limit(20).toArray();
        
        const userIds = matchingUsers.map(u => u._id);
        const userIdsStrings = userIds.map(id => id.toString());
        
        searchMatch = {
          $or: [
            { userId: { $in: userIds } },
            { userId: { $in: userIdsStrings } },
            { fullName: { $regex: search, $options: "i" } },
            { studentId: { $regex: search, $options: "i" } }
          ]
        };
      }
      // รวม MatchQuery
      if (Object.keys(matchQuery).length > 0) {
        matchQuery = { $and: [matchQuery, searchMatch] };
      } else {
        matchQuery = searchMatch;
      }
    }

    if (type === "attendance") {
      const attendances = await db
        .collection("attendances")
        .aggregate([
          { $match: matchQuery },
          { $sort: { date: -1, "checkIn.time": -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              uId: { 
                $cond: {
                  if: { $eq: [{ $type: "$userId" }, "objectId"] },
                  then: "$userId",
                  else: {
                    $cond: {
                      if: { $and: [
                        { $ne: [{ $type: "$userId" }, "missing"] },
                        { $ne: [{ $type: "$userId" }, "null"] },
                        { $eq: [{ $strLenCP: { $toString: "$userId" } }, 24] }
                      ]},
                      then: { $toObjectId: "$userId" },
                      else: null
                    }
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "users",
              let: { u_id: "$uId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$u_id"] } } },
                { $project: { name: 1, username: 1, email: 1, image: 1, _id: 0 } }
              ],
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1, date: 1, status: 1,
              checkIn: { time: 1 }, checkOut: { time: 1 },
              user: 1
            },
          },
        ])
        .toArray();
      
      return NextResponse.json({ success: true, data: attendances });
    } 

    if (type === "leave") {
      const leaves = await db
        .collection("leave_requests")
        .aggregate([
          { $match: matchQuery },
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              uId: { 
                $cond: {
                  if: { $eq: [{ $type: "$userId" }, "objectId"] },
                  then: "$userId",
                  else: {
                    $cond: {
                      if: { $and: [
                        { $ne: [{ $type: "$userId" }, "missing"] },
                        { $ne: [{ $type: "$userId" }, "null"] },
                        { $eq: [{ $strLenCP: { $toString: "$userId" } }, 24] }
                      ]},
                      then: { $toObjectId: "$userId" },
                      else: null
                    }
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "users",
              let: { u_id: "$uId" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$u_id"] } } },
                { $project: { name: 1, username: 1, email: 1, image: 1, _id: 0 } }
              ],
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1, startDate: 1, endDate: 1, status: 1,
              reason: 1, leaveType: 1,
              user: 1
            },
          },
        ])
        .toArray();
      
      return NextResponse.json({ success: true, data: leaves });
    }

    if (type === "suvery") {
       const suverys = await db
        .collection("suvery")
        .find(matchQuery)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return NextResponse.json({ success: true, data: suverys });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * [DELETE] ลบข้อมูล
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const deleteAll = searchParams.get("deleteAll") === "true";

    if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collection = type === "attendance" ? "attendances" : type === "leave" ? "leave_requests" : "suvery";

    let result;
    if (deleteAll) {
      // Bulk Delete
      result = await db.collection(collection).deleteMany({});
      
      // Logging Bulk Action
      await db.collection("logs").insertOne({
        userName: session?.user?.name || "Super_Admin",
        action: `BULK_DELETE_${type.toUpperCase()}`,
        details: `ลบข้อมูล ${type} ทั้งหมดในระบบ (${result.deletedCount} รายการ)`,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        role: "super_admin"
      });
    } else {
      // Single Delete
      if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
      
      let query: any = { _id: id };
      if (ObjectId.isValid(id)) {
        query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
      }

      result = await db.collection(collection).deleteOne(query);

      // Logging Single Action
      await db.collection("logs").insertOne({
        userName: session?.user?.name || "Super_Admin",
        action: `DELETE_${type.toUpperCase()}`,
        details: `ลบข้อมูล ${type} ID: ${id}`,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
        role: "super_admin"
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * [PATCH] แก้ไขข้อมูล
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "super_admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { id, type, updates } = body;

    if (!id || !type || !updates) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collection = type === "attendance" ? "attendances" : type === "leave" ? "leave_requests" : "suvery";

    delete updates._id;

    // มาตรฐาน Date
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.checkIn?.time) updates.checkIn.time = new Date(updates.checkIn.time);
    if (updates.checkOut?.time) updates.checkOut.time = new Date(updates.checkOut.time);
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    let query: any = { _id: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }

    const result = await db.collection(collection).updateOne(query, { $set: updates });

    // Logging Unified
    await db.collection("logs").insertOne({
      userName: session?.user?.name || "Super_Admin",
      action: `UPDATE_${type.toUpperCase()}`,
      details: `แก้ไขข้อมูล ${type} ID: ${id}`,
      timestamp: new Date(),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      role: "super_admin"
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
