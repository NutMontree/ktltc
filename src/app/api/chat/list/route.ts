import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

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

    // Collect all unique participant IDs across all chats
    const uniqueParticipantIds = new Set<any>();
    chats.forEach((chat) => {
      (chat.participants || []).forEach((pId: any) => {
        try {
          uniqueParticipantIds.add(ObjectId.isValid(pId) ? new ObjectId(pId) : pId);
        } catch (_) {
          uniqueParticipantIds.add(pId);
        }
      });
    });

    // Bulk fetch all participants
    const allParticipants = await db
      .collection("users")
      .find({ _id: { $in: Array.from(uniqueParticipantIds) } })
      .project({ _id: 1, name: 1, username: 1, image: 1, role: 1, department: 1 })
      .toArray();

    // Create a dictionary for O(1) lookup
    const participantMap = new Map(
      allParticipants.map((u) => [
        u._id.toString(),
        { ...u, _id: u._id.toString() }
      ])
    );

    // Bulk fetch unread notifications for this user
    // We only care about chat notifications for this user
    const unreadNotifs = await db.collection("notifications")
      .find({
        userId: userObjectId,
        type: "chat_message",
        read: false
      })
      .toArray();

    const notifTargetUrls = new Set(unreadNotifs.map(n => n.targetUrl));

    // Map through conversations in memory
    const formattedChats = chats.map((chat) => {
      const participantIds = chat.participants || [];

      const resolvedParticipants = participantIds
        .map((pId: any) => participantMap.get(pId.toString()))
        .filter(Boolean);

      // Filter out the logged-in user for DMs convenience
      const otherParticipants = resolvedParticipants.filter(
        (u: any) => u._id.toString() !== userId.toString()
      );
      const recipient = otherParticipants[0] || null;

      // Check if there are any unread chat notifications for this chat
      const hasUnread = 
        notifTargetUrls.has("/dashboard/chat") || 
        notifTargetUrls.has(`/dashboard/chat?c=${chat._id.toString()}`);

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
          hasUnread: hasUnread,
          unreadCount: hasUnread ? 1 : 0, // Simplify to binary state or fetch actual count if needed
        };
    });

    return NextResponse.json({ success: true, chats: formattedChats });
  } catch (error: any) {
    console.error("Fetch chat list error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
