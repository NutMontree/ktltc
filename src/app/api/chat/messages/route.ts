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

    // Mark notifications as read for this user and this chat (Matches both new precise and legacy URLs)
    try {
      await db.collection("notifications").updateMany(
        {
          userId: userObjectId,
          type: "chat_message",
          $or: [
            { targetUrl: "/dashboard/chat" },
            { targetUrl: `/dashboard/chat?c=${chatId}` }
          ],
          read: false,
        },
        { $set: { read: true, isRead: true } }
      );
    } catch (_) {}

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

      // Find an existing direct chat (1-on-1) with exactly these two participants
      const existingChat = await db.collection("chats").findOne({
        isGroup: { $ne: true },
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

    // 4. Create Notifications for recipients (excluding the sender themselves)
    try {
      const fullChat = await db.collection("chats").findOne({ _id: chatObjectId });
      if (fullChat) {
        const recipients = fullChat.participants.filter(
          (p: any) => p.toString() !== userObjectId.toString() && p.toString() !== userId.toString()
        );

        if (recipients.length > 0) {
          const senderName = session?.user?.name || "เพื่อนร่วมสถาบัน";
          const senderImage = session?.user?.image || "";
          const notifTitle = fullChat.isGroup 
            ? `ข้อความใหม่ในกลุ่ม "${fullChat.groupName}"`
            : `ข้อความใหม่จากคุณ ${senderName}`;
          
          let notifMessage = text || "";
          if (!notifMessage && images && images.length > 0) {
            notifMessage = "ส่งรูปภาพ 📷";
          } else if (!notifMessage && files && files.length > 0) {
            notifMessage = `ส่งไฟล์เอกสาร 📁 (${files[0].name || "ดาวน์โหลด"})`;
          }

          const notificationDocs = recipients.map((recipientId: any) => ({
            userId: recipientId,
            type: "chat_message",
            from: userObjectId,
            fromName: senderName,
            fromImage: senderImage,
            title: notifTitle,
            message: notifMessage,
            targetUrl: `/dashboard/chat?c=${chatObjectId.toString()}`,
            read: false,
            createdAt: new Date(),
          }));

          await db.collection("notifications").insertMany(notificationDocs);
        }
      }
    } catch (notifErr) {
      console.error("Failed to create message notifications:", notifErr);
    }

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
