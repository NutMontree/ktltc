import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    if (!ObjectId.isValid(targetUserId) || !ObjectId.isValid(currentUserId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const currentUserObjId = new ObjectId(currentUserId);
    const targetUserObjId = new ObjectId(targetUserId);

    // Check if target user exists
    const targetUser = await db.collection("users").findOne({ _id: targetUserObjId });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if already following (currentUserId in targetUser's followers array)
    const isFollowing = (targetUser.followers || []).map((id: any) => String(id)).includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await db.collection("users").updateOne(
        { _id: targetUserObjId },
        { $pull: { followers: currentUserObjId } as any }
      );
      await db.collection("users").updateOne(
        { _id: currentUserObjId },
        { $pull: { following: targetUserObjId } as any }
      );
      return NextResponse.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await db.collection("users").updateOne(
        { _id: targetUserObjId },
        { $addToSet: { followers: currentUserObjId } as any }
      );
      await db.collection("users").updateOne(
        { _id: currentUserObjId },
        { $addToSet: { following: targetUserObjId } as any }
      );
      return NextResponse.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    console.error("Follow Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
