import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { targetUserId } = await req.json();

  if (!targetUserId) {
    return NextResponse.json({ error: "Target User ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // Remove from both friends lists
    await Promise.all([
      db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { friends: new ObjectId(targetUserId) } } as any
      ),
      db.collection("users").updateOne(
        { _id: new ObjectId(targetUserId) },
        { $pull: { friends: new ObjectId(userId) } } as any
      ),
      // Also delete any existing accepted requests to be clean
      db.collection("friendRequests").deleteOne({
        $or: [
          { from: new ObjectId(userId), to: new ObjectId(targetUserId) },
          { from: new ObjectId(targetUserId), to: new ObjectId(userId) },
        ],
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfriend error:", error);
    return NextResponse.json({ error: "Failed to unfriend" }, { status: 500 });
  }
}
