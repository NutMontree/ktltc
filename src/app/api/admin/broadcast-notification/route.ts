import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * [POST] Send broadcast notifications to users by department/role
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any)?.role;
    if (userRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden - Super Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, targetDepartments, targetRoles, targetAll } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    if (!targetAll && (!targetDepartments || targetDepartments.length === 0) && (!targetRoles || targetRoles.length === 0)) {
      return NextResponse.json({ error: "Please select target departments, roles, or all users" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const senderId = (session.user as any).id;
    const sender = await db.collection("users").findOne({ _id: new ObjectId(senderId) });

    // Build query for target users
    const query: any = {};

    if (targetAll) {
      // Send to all users
      query.role = { $exists: true };
    } else {
      const conditions = [];

      if (targetDepartments && targetDepartments.length > 0) {
        conditions.push({ department: { $in: targetDepartments } });
      }

      if (targetRoles && targetRoles.length > 0) {
        conditions.push({ role: { $in: targetRoles } });
      }

      if (conditions.length > 0) {
        query.$or = conditions;
      }
    }

    // Get target users
    const targetUsers = await db
      .collection("users")
      .find(query)
      .project({ _id: 1 })
      .toArray();

    if (targetUsers.length === 0) {
      return NextResponse.json({ error: "No target users found" }, { status: 404 });
    }

    // Create notifications
    const notifications = targetUsers.map((user: any) => ({
      userId: new ObjectId(user._id),
      title: title,
      message: message,
      type: "info",
      isRead: false,
      read: false,
      from: senderId,
      fromName: sender?.name || "ผู้ดูแลระบบสูงสุด",
      fromImage: sender?.image || null,
      targetUrl: "/dashboard/notifications",
      createdAt: new Date(),
    }));

    const result = await db.collection("notifications").insertMany(notifications);

    return NextResponse.json({
      success: true,
      message: `ส่งการแจ้งเตือนไปยังผู้ใช้ ${targetUsers.length} คนเรียบร้อยแล้ว`,
      sentCount: targetUsers.length,
      insertedCount: result.insertedCount,
    });
  } catch (error: any) {
    console.error("[Broadcast Notification API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
