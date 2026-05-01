import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [GET] ดึงการแจ้งเตือนของผู้ใช้
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const notifications = await db.collection("notifications")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [PATCH] ทำเครื่องหมายว่าอ่านแล้ว
 */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notificationId, readAll } = body;
    const userId = (session.user as any).id;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (readAll) {
      await db.collection("notifications").updateMany(
        { userId: new ObjectId(userId), $or: [{ isRead: false }, { read: false }] },
        { $set: { isRead: true, read: true } }
      );
    } else if (notificationId) {
      await db.collection("notifications").updateOne(
        { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
        { $set: { isRead: true, read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * [DELETE] ลบการแจ้งเตือน
 */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";
    const userId = (session.user as any).id;

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    if (deleteAll) {
      await db.collection("notifications").deleteMany({
        userId: new ObjectId(userId)
      });
    } else if (notificationId) {
      await db.collection("notifications").deleteOne({
        _id: new ObjectId(notificationId),
        userId: new ObjectId(userId)
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
