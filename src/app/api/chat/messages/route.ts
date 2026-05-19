import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let chatObjectId: any = chatId;
    try {
      if (ObjectId.isValid(chatId)) {
        chatObjectId = new ObjectId(chatId);
      }
    } catch (_) {}

    // Verify user is a participant of this chat
    let userObjectId: any = userId;
    try {
      if (ObjectId.isValid(userId)) {
        userObjectId = new ObjectId(userId);
      }
    } catch (_) {}

    const chat = await db.collection("chats").findOne({
      _id: chatObjectId,
      participants: { $in: [userObjectId, userId] },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat conversation not found or access denied" }, { status: 404 });
    }

    // Retrieve messages
    const messages = await db
      .collection("messages")
      .find({
        chatId: chatObjectId,
      })
      .sort({ createdAt: 1 })
      .toArray();

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      _id: msg._id.toString(),
      chatId: msg.chatId.toString(),
      senderId: msg.senderId.toString(),
    }));

    return NextResponse.json({ success: true, messages: formattedMessages });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let { chatId, receiverId, text, images, files } = body;

    if (!chatId && !receiverId) {
      return NextResponse.json({ error: "Either chatId or receiverId must be provided" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let userObjectId: any = userId;
    try {
      if (ObjectId.isValid(userId)) {
        userObjectId = new ObjectId(userId);
      }
    } catch (_) {}

    let finalChatId = chatId;

    // 1. If chatId is not provided, look up or create a chat between user and receiver
    if (!finalChatId && receiverId) {
      let receiverObjectId: any = receiverId;
      try {
        if (ObjectId.isValid(receiverId)) {
          receiverObjectId = new ObjectId(receiverId);
        }
      } catch (_) {}

      // Find an existing chat with exactly these two participants
      const existingChat = await db.collection("chats").findOne({
        participants: {
          $all: [userObjectId, receiverObjectId],
          $size: 2,
        },
      });

      if (existingChat) {
        finalChatId = existingChat._id.toString();
      } else {
        // Create new direct chat conversation
        const newChatResult = await db.collection("chats").insertOne({
          participants: [userObjectId, receiverObjectId],
          lastMessage: "",
          lastMessageAt: new Date(),
          lastMessageSender: userObjectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        finalChatId = newChatResult.insertedId.toString();
      }
    }

    let chatObjectId: any = finalChatId;
    try {
      if (ObjectId.isValid(finalChatId)) {
        chatObjectId = new ObjectId(finalChatId);
      }
    } catch (_) {}

    // Verify user is a participant of this chat before posting
    if (chatId) {
      const chat = await db.collection("chats").findOne({
        _id: chatObjectId,
        participants: { $in: [userObjectId, userId] },
      });

      if (!chat) {
        return NextResponse.json({ error: "Chat conversation not found or access denied" }, { status: 404 });
      }
    }

    // Determine preview text
    let previewText = text || "";
    if (!previewText && images && images.length > 0) {
      previewText = "ส่งรูปภาพ 📷";
    } else if (!previewText && files && files.length > 0) {
      previewText = `ส่งไฟล์เอกสาร 📁 (${files[0].name || "ดาวน์โหลด"})`;
    }

    // 2. Insert new message
    const messageDoc = {
      chatId: chatObjectId,
      senderId: userObjectId,
      text: text || "",
      images: images || [],
      files: files || [],
      createdAt: new Date(),
    };

    const insertResult = await db.collection("messages").insertOne(messageDoc);

    // 3. Update the conversation metadata
    await db.collection("chats").updateOne(
      { _id: chatObjectId },
      {
        $set: {
          lastMessage: previewText,
          lastMessageAt: new Date(),
          lastMessageSender: userObjectId,
          updatedAt: new Date(),
        },
      }
    );

    const createdMessage = {
      ...messageDoc,
      _id: insertResult.insertedId.toString(),
      chatId: finalChatId,
      senderId: userId,
    };

    return NextResponse.json({
      success: true,
      chatId: finalChatId,
      message: createdMessage,
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
