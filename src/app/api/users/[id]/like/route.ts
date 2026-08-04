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

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const targetUserObjId = new ObjectId(targetUserId);

    // Check if target user exists
    const targetUser = await db.collection("users").findOne({ _id: targetUserObjId });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Check if already liked (currentUserId in targetUser's profileLikes array)
    const isLiked = (targetUser.profileLikes || []).map((id: any) => String(id)).includes(currentUserId);

    if (isLiked) {
      // Unlike
      await db.collection("users").updateOne(
        { _id: targetUserObjId },
        { $pull: { profileLikes: currentUserId } as any } // storing strings to avoid ObjectId issues, or store ObjectIds? Wait, usually we store strings or ObjectIds. Let's use string.
      );
      return NextResponse.json({ message: "Unliked successfully", isLiked: false });
    } else {
      // Like
      await db.collection("users").updateOne(
        { _id: targetUserObjId },
        { $addToSet: { profileLikes: currentUserId } as any }
      );
      
      // Optional: Add notification
      if (targetUserId !== currentUserId) {
        await db.collection("notifications").insertOne({
          recipientId: targetUserObjId,
          senderId: new ObjectId(currentUserId),
          type: "PROFILE_LIKE",
          read: false,
          createdAt: new Date()
        });
      }
      
      return NextResponse.json({ message: "Liked successfully", isLiked: true });
    }
  } catch (error) {
    console.error("Like Error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
