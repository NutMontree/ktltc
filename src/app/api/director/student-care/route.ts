import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const records = await db.collection("student_care_records").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch student care records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any || { name: "System", id: "system" };
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    
    let teacherDepartment = "ไม่ระบุ";
    if (user.id && user.id !== "system" && ObjectId.isValid(user.id)) {
      const dbUser = await db.collection("users").findOne({ _id: new ObjectId(user.id) });
      if (dbUser && dbUser.department) {
        teacherDepartment = dbUser.department;
      }
    }
    
    const newRecord = {
      ...body,
      teacherDepartment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("student_care_records").insertOne(newRecord);

    // Notify directors and super_admins
    const targetUsers = await db.collection("users").find({
      role: { $in: ["director", "super_admin"] }
    }).project({ _id: 1 }).toArray();

    if (targetUsers.length > 0) {
      const notifications = targetUsers.map(u => ({
        userId: u._id,
        title: "ระบบดูแลผู้เรียนใหม่",
        message: `ครู ${newRecord.teacherName || user.name || 'ไม่ระบุชื่อ'} ได้เพิ่มข้อมูลการดูแลนักเรียนใหม่`,
        type: "info",
        isRead: false,
        read: false,
        from: user.id || "system",
        fromName: user.name || "System",
        targetUrl: "/dashboard/director/student-care",
        createdAt: new Date()
      }));
      await db.collection("notifications").insertMany(notifications);
    }

    return NextResponse.json({ ...newRecord, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    console.error("Save record error:", error);
    return NextResponse.json({ error: "Failed to create student care record: " + error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const body = await req.json();
    const { _id, ...updateFields } = body;
    
    if (!_id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const updateData: any = { updatedAt: new Date(), ...updateFields };

    await db.collection("student_care_records").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student care record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    await db.collection("student_care_records").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student care record" }, { status: 500 });
  }
}
