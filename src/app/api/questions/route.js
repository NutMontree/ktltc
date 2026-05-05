import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function POST(req) {
  try {
    const { customerName, subject, details } = await req.json();
    const forwarded = req.headers.get("x-forwarded-for");
    const posterIp = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const newQuestion = await db.collection("questions").insertOne({
      customerName,
      subject,
      details,
      status: "pending",
      createdAt: new Date(),
      posterIp,
    });

    await db.collection("logs").insertOne({
      userName: customerName || "GUEST",
      action: "GUEST_QUESTION",
      details: `คำถามใหม่: ${subject}`,
      module: "Q&A",
      timestamp: new Date(),
      ip: posterIp,
      targetId: newQuestion.insertedId,
    });

    // ✅ แจ้งเตือนไปยังผู้ดูแล Q&A
    try {
      const qaRoles = await db.collection("role_permissions")
        .find({ "permissions.manage_qa": true })
        .toArray();
      const roleNames = qaRoles.map(r => r.role);
      if (!roleNames.includes("super_admin")) roleNames.push("super_admin");

      const qaAdmins = await db.collection("users")
        .find({ role: { $in: roleNames } })
        .project({ _id: 1 })
        .toArray();

      if (qaAdmins.length > 0) {
        const displayName = customerName || "GUEST";
        await db.collection("notifications").insertMany(
          qaAdmins.map(admin => ({
            userId: admin._id,
            title: `❓ คำถามใหม่จาก ${displayName}`,
            message: subject,
            type: "info",
            fromName: displayName,
            targetUrl: "/dashboard/questions",
            isRead: false,
            read: false,
            createdAt: new Date(),
          }))
        );
      }
    } catch (notifErr) {
      console.error("⚠️ Q&A notification error:", notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
