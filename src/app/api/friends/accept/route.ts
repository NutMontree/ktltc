import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await req.json();
  if (!requestId) {
    return NextResponse.json({ error: "Missing request ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("ktltc_db");

  const request = await db.collection("friendRequests").findOne({
    _id: new ObjectId(requestId),
    status: "pending",
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const userId = (session.user as any).id;
  // Ensure the current user is the one who received the request
  if (request.to.toString() !== userId) {
    return NextResponse.json({ error: "Unauthorized to accept this request" }, { status: 401 });
  }

  // Update request status
  await db.collection("friendRequests").updateOne(
    { _id: request._id },
    { $set: { status: "accepted", acceptedAt: new Date() } }
  );

  // Add to friends lists (ensure we use ObjectIds)
  const fromId = new ObjectId(request.from);
  const toId = new ObjectId(request.to);

  await Promise.all([
    db.collection("users").updateOne(
      { _id: fromId },
      { $addToSet: { friends: toId } }
    ),
    db.collection("users").updateOne(
      { _id: toId },
      { $addToSet: { friends: fromId } }
    )
  ]);


  // Create "Accepted" notification for the sender
  await db.collection("notifications").insertOne({
    userId: request.from,
    type: "friend_accepted",
    from: request.to,
    fromName: (session.user as any).name,
    fromImage: (session.user as any).image,
    read: false,
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}
