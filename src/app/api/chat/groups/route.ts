import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// Helper to safely parse MongoDB ObjectIds
function toObjectId(id: string) {
  try {
    return ObjectId.isValid(id) ? new ObjectId(id) : id;
  } catch (_) {
    return id;
  }
}

// 1. POST: Create a new Group Chat
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { groupName, participantIds = [] } = body;

    if (!groupName || !groupName.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const creatorObjectId = toObjectId(userId);

    // Build unique participant list (ensuring creator is included)
    const rawParticipants = [userId, ...participantIds];
    const uniqueIds = Array.from(new Set(rawParticipants.map(id => id.toString())));
    const participantObjectIds = uniqueIds.map(id => toObjectId(id));

    // Create Group Chat Document in 'chats'
    const newChatDoc = {
      isGroup: true,
      groupName: groupName.trim(),
      groupAvatar: "",
      creatorId: creatorObjectId,
      participants: participantObjectIds,
      lastMessage: `สร้างกลุ่มแชท "${groupName.trim()}" สำเร็จ 🎉`,
      lastMessageAt: new Date(),
      lastMessageSender: creatorObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const chatInsertResult = await db.collection("chats").insertOne(newChatDoc);
    const chatId = chatInsertResult.insertedId;

    // Create initial welcome message inside the group
    await db.collection("messages").insertOne({
      chatId: chatId,
      senderId: creatorObjectId,
      text: `สร้างกลุ่มแชท "${groupName.trim()}" สำเร็จ 🎉`,
      images: [],
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      chat: {
        ...newChatDoc,
        _id: chatId.toString(),
        participants: uniqueIds,
        creatorId: userId,
        lastMessageSender: userId,
      },
    });
  } catch (error: any) {
    console.error("Create group chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. PUT: Add or Remove members in a Group Chat
export async function PUT(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { chatId, action, targetUserId } = body;

    if (!chatId || !action || !targetUserId) {
      return NextResponse.json({ error: "Missing required fields: chatId, action, targetUserId" }, { status: 400 });
    }

    if (action !== "add" && action !== "remove") {
      return NextResponse.json({ error: "Invalid action. Must be 'add' or 'remove'" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const chatObjectId = toObjectId(chatId);
    const userObjectId = toObjectId(userId);
    const targetUserObjectId = toObjectId(targetUserId);

    // Fetch the group conversation
    const chat = await db.collection("chats").findOne({ _id: chatObjectId });

    if (!chat) {
      return NextResponse.json({ error: "Group chat not found" }, { status: 404 });
    }

    if (!chat.isGroup) {
      return NextResponse.json({ error: "This action is only supported for Group Chats" }, { status: 400 });
    }

    // Verify the current authenticated user is an active participant in this group
    const isParticipant = chat.participants.some(
      (pId: any) => pId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied. You are not a member of this group" }, { status: 403 });
    }

    // Fetch names of actor and target for system notifications
    const actorUser = await db.collection("users").findOne({ _id: userObjectId });
    const targetUser = await db.collection("users").findOne({ _id: targetUserObjectId });

    const actorName = actorUser?.name || "ผู้ใช้งาน";
    const targetName = targetUser?.name || "สมาชิก";

    // 2a. ACTION: ADD MEMBER (Open to all group members)
    if (action === "add") {
      // Add target user to participants if they aren't already in it
      const updateResult = await db.collection("chats").updateOne(
        { _id: chatObjectId },
        {
          $addToSet: { participants: targetUserObjectId } as any,
          $set: {
            lastMessage: `📢 ${actorName} ได้เชิญ ${targetName} เข้าร่วมกลุ่ม`,
            lastMessageAt: new Date(),
            lastMessageSender: userObjectId,
            updatedAt: new Date(),
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        // Write system message to conversation log
        await db.collection("messages").insertOne({
          chatId: chatObjectId,
          senderId: new ObjectId("000000000000000000000000"), // System sender ID
          text: `📢 ${actorName} ได้เชิญ ${targetName} เข้าร่วมกลุ่ม`,
          images: [],
          createdAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: `${targetName} has been invited successfully`,
      });
    }

    // 2b. ACTION: REMOVE MEMBER (Strictly restricted to creator/founder)
    if (action === "remove") {
      const isCreator = chat.creatorId && chat.creatorId.toString() === userId.toString();

      if (!isCreator) {
        return NextResponse.json({ error: "Forbidden. Only the group creator can remove members" }, { status: 403 });
      }

      // Remove target user from participants list
      const updateResult = await db.collection("chats").updateOne(
        { _id: chatObjectId },
        {
          $pull: { participants: targetUserObjectId } as any,
          $set: {
            lastMessage: `📢 ${actorName} ได้นำ ${targetName} ออกจากกลุ่ม`,
            lastMessageAt: new Date(),
            lastMessageSender: userObjectId,
            updatedAt: new Date(),
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        // Write system message to conversation log
        await db.collection("messages").insertOne({
          chatId: chatObjectId,
          senderId: new ObjectId("000000000000000000000000"), // System sender ID
          text: `📢 ${actorName} ได้นำ ${targetName} ออกจากกลุ่ม`,
          images: [],
          createdAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        message: `${targetName} has been removed successfully`,
      });
    }

    return NextResponse.json({ error: "Operation failed" }, { status: 400 });
  } catch (error: any) {
    console.error("Manage group members error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
