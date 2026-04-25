import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const client = await clientPromise;
  const db = client.db("ktltc_db");

  const notifications = await db.collection("notifications")
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return NextResponse.json(notifications);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const client = await clientPromise;
  const db = client.db("ktltc_db");

  const { notificationId, markAll } = await req.json();

  if (markAll) {
    await db.collection("notifications").updateMany(
      { userId: new ObjectId(userId), read: false },
      { $set: { read: true } }
    );
  } else if (notificationId) {
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
      { $set: { read: true } }
    );
  }

  return NextResponse.json({ success: true });
}
