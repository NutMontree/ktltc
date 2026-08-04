import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();
    const { action } = body;

    if (!action || !["follow", "hire", "like"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    
    // Check if target user exists
    const targetUser = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateQueryTarget: any = {};
    let updateQuerySource: any = {};
    let isAdded = false;

    if (action === "follow") {
      const followers = targetUser.followers || [];
      if (followers.includes(userId)) {
        // Unfollow
        updateQueryTarget = { $pull: { followers: userId } };
        updateQuerySource = { $pull: { following: id } };
      } else {
        // Follow
        updateQueryTarget = { $addToSet: { followers: userId } };
        updateQuerySource = { $addToSet: { following: id } };
        isAdded = true;
      }
      
      // Update target user's followers
      await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        updateQueryTarget
      );
      
      // Update current user's following
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        updateQuerySource
      );

    } else if (action === "hire") {
      const hireRequests = targetUser.hireRequests || [];
      if (hireRequests.includes(userId)) {
        // Cancel Hire Request
        updateQueryTarget = { $pull: { hireRequests: userId } };
      } else {
        // Hire Request
        updateQueryTarget = { $addToSet: { hireRequests: userId } };
        isAdded = true;
      }
      
      await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        updateQueryTarget
      );

    } else if (action === "like") {
      const profileLikes = targetUser.profileLikes || [];
      if (profileLikes.includes(userId)) {
        // Unlike
        updateQueryTarget = { $pull: { profileLikes: userId } };
      } else {
        // Like
        updateQueryTarget = { $addToSet: { profileLikes: userId } };
        isAdded = true;
      }
      
      await db.collection("users").updateOne(
        { _id: new ObjectId(id) },
        updateQueryTarget
      );
    }

    // Record Activity Log
    try {
      const actionName = action === "follow" ? "FOLLOW_USER" : action === "hire" ? "HIRE_USER" : "LIKE_PROFILE";
      const detailMsg = isAdded 
        ? `Added ${action} to user ${targetUser.name || id}`
        : `Removed ${action} from user ${targetUser.name || id}`;
        
      await db.collection("logs").insertOne({
        userId: new ObjectId(userId),
        userName: session.user.name || "User", 
        action: actionName,
        details: detailMsg,
        timestamp: new Date(),
        ip: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      });
    } catch (logError) {
      console.error(`Failed to record ${action} log:`, logError);
    }

    return NextResponse.json({ success: true, isAdded });
  } catch (error) {
    console.error("Action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
