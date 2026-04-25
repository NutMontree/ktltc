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

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("id");
  if (!targetUserId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  if (userId === targetUserId) {
    return NextResponse.json({ status: "me" });
  }

  const client = await clientPromise;
  const db = client.db("ktltc_db");

  // Check if they are already friends
  const [currentUser, targetUser] = await Promise.all([
    db.collection("users").findOne({ _id: new ObjectId(userId) }),
    db.collection("users").findOne({ _id: new ObjectId(targetUserId) })
  ]);
  
  const isFriendA = currentUser?.friends?.some((fId: any) => String(fId) === String(targetUserId));
  const isFriendB = targetUser?.friends?.some((fId: any) => String(fId) === String(userId));

  if (isFriendA || isFriendB) {
    return NextResponse.json({ status: "friends" });
  }


  // Check for pending request
  const request = await db.collection("friendRequests").findOne({
    $or: [
      { from: new ObjectId(userId), to: new ObjectId(targetUserId), status: "pending" },
      { from: new ObjectId(targetUserId), to: new ObjectId(userId), status: "pending" },
    ],
  });

  if (request) {
    const fromIdStr = request.from.toString();
    if (fromIdStr === userId) {
      return NextResponse.json({ status: "request_sent", requestId: request._id });
    } else {
      return NextResponse.json({ status: "request_received", requestId: request._id });
    }
  }

  return NextResponse.json({ status: "none" });
}

