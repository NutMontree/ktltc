import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let userObjectId: any = userId;
    try {
      if (ObjectId.isValid(userId)) {
        userObjectId = new ObjectId(userId);
      }
    } catch (_) {}

    // Find chats where the logged-in user is a participant
    // Using string and ObjectId compatibility
    const chats = await db
      .collection("chats")
      .find({
        participants: { $in: [userObjectId, userId] },
      })
      .sort({ lastMessageAt: -1 })
      .toArray();

    // Map through conversations and fetch participant details
    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const participantIds = chat.participants || [];

        // Fetch all participants details from the users collection
        const participants = await db
          .collection("users")
          .find({
            _id: {
              $in: participantIds.map((pId: any) => {
                try {
                  return ObjectId.isValid(pId) ? new ObjectId(pId) : pId;
                } catch (_) {
                  return pId;
                }
              }),
            },
          })
          .project({
            _id: 1,
            name: 1,
            username: 1,
            image: 1,
            role: 1,
            department: 1,
          })
          .toArray();

        const resolvedParticipants = participants.map((u) => ({
          ...u,
          _id: u._id.toString(),
        }));

        // Filter out the logged-in user for DMs convenience
        const otherParticipants = resolvedParticipants.filter(
          (u) => u._id.toString() !== userId.toString()
        );
        const recipient = otherParticipants[0] || null;

        // Check if there are any unread chat notifications for the logged-in user for this chat
        const unreadNotif = await db.collection("notifications").findOne({
          userId: userObjectId,
          type: "chat_message",
          $or: [
            { targetUrl: "/dashboard/chat" },
            { targetUrl: `/dashboard/chat?c=${chat._id.toString()}` }
          ],
          read: false,
        });

        return {
          _id: chat._id.toString(),
          participants: chat.participants.map((p: any) => p.toString()),
          recipient, // Convenience object for Direct Messaging
          isGroup: chat.isGroup || false,
          groupName: chat.groupName || "",
          groupAvatar: chat.groupAvatar || "",
          creatorId: chat.creatorId ? chat.creatorId.toString() : null,
          participantsDetails: resolvedParticipants, // All profiles including current logged-in user
          lastMessage: chat.lastMessage || "",
          lastMessageAt: chat.lastMessageAt || chat.updatedAt || chat.createdAt,
          lastMessageSender: chat.lastMessageSender ? chat.lastMessageSender.toString() : null,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          hasUnread: !!unreadNotif,
        };
      })
    );

    return NextResponse.json({ success: true, chats: formattedChats });
  } catch (error: any) {
    console.error("Fetch chat list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
