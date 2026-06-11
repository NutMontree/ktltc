import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const records = await db.collection("plc_records").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PLC records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any || { name: "System", id: "system" };
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    const newRecord = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("plc_records").insertOne(newRecord);

    // Notify directors and super_admins
    const targetUsers = await db.collection("users").find({
      role: { $in: ["director", "super_admin"] }
    }).project({ _id: 1 }).toArray();

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        userId: new ObjectId(u._id),
        title: "รายงาน PLC ใหม่",
        message: `ครู ${newRecord.teacherName || user.name || 'ไม่ระบุชื่อ'} ได้ส่งรายงาน PLC ใหม่`,
        type: "info",
        isRead: false,
        read: false,
        from: user.id || "system",
        fromName: user.name || "System",
        targetUrl: "/dashboard/director/plc",
        createdAt: new Date()
      }));
      await db.collection("notifications").insertMany(notifications);
    }

    return NextResponse.json({ ...newRecord, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create PLC record" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const { _id, status } = await req.json();
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await db.collection("plc_records").updateOne(
      { _id: new ObjectId(_id) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update PLC record" }, { status: 500 });
  }
}
