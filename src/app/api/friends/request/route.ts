import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetUserId } = await req.json();
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  if (userId === targetUserId) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("ktltc_db");

  // Check if already friends or request exists
  const existing = await db.collection("friendRequests").findOne({
    $or: [
      { from: new ObjectId(userId), to: new ObjectId(targetUserId), status: "pending" },
      { from: new ObjectId(targetUserId), to: new ObjectId(userId), status: "pending" },
    ],
  });

  if (existing) {
    return NextResponse.json({ error: "Request already exists" }, { status: 400 });
  }

  // Create request
  const request = {
    from: new ObjectId(userId),
    to: new ObjectId(targetUserId),
    status: "pending",
    createdAt: new Date(),
  };

  const result = await db.collection("friendRequests").insertOne(request);

  // Create notification
  const notification = {
    userId: new ObjectId(targetUserId),
    type: "friend_request",
    from: new ObjectId(userId),
    fromName: (session.user as any).name,
    fromImage: (session.user as any).image,
    requestId: result.insertedId,
    read: false,
    createdAt: new Date(),
  };

  await db.collection("notifications").insertOne(notification);

  return NextResponse.json({ success: true });
}
