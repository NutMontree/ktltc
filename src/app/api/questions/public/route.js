import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const questions = await db
      .collection("questions")
      .find({ status: { $ne: "hidden" } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(questions);
  } catch (error) {
    console.error("❌ [API QUESTIONS PUBLIC GET ERROR]:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { guestName, subject, content } = await req.json();
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const forwarded = req.headers.get("x-forwarded-for");
    const posterIp = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

    // ตรวจสอบว่า login อยู่หรือไม่
    let session = null;
    try {
      session = await auth();
    } catch (_) {
      // ไม่ได้ login — ถือว่าเป็น guest
    }

    const isLoggedIn = !!session?.user;
    const displayName = isLoggedIn ? (session.user.name || "User") : (guestName || "บุคคลทั่วไป");

    const newQuestion = {
      guestName: displayName,
      subject,
      content,
      status: "pending",
      answer: null,
      repliedBy: null,
      createdAt: new Date(),
      posterIp,
      // ข้อมูลผู้ใช้ที่ล็อกอิน
      ...(isLoggedIn && {
        userId: new ObjectId(session.user.id),
        userName: session.user.name,
        userImage: session.user.image || null,
        userRole: session.user.role || "user",
        isRegistered: true,
      }),
      ...(!isLoggedIn && {
        isRegistered: false,
      }),
    };

    const result = await db.collection("questions").insertOne(newQuestion);

    // ✅ บันทึก Log: ใส่ userName ให้ตรงกับชื่อคนถาม จะได้ไม่ขึ้น SYSTEM
    await db.collection("logs").insertOne({
      userName: displayName,
      action: "GUEST_QUESTION",
      details: `คำถามใหม่: ${subject}`,
      link: `/dashboard/questions#${result.insertedId}`,
      module: "Q&A",
      targetId: result.insertedId,
      timestamp: new Date(),
      ip: posterIp,
    });

    // ✅ แจ้งเตือนไปยังผู้ดูแล Q&A ทุกคน
    try {
      // หา role ที่มีสิทธิ์ manage_qa
      const qaRoles = await db.collection("role_permissions")
        .find({ "permissions.manage_qa": true })
        .toArray();
      const roleNames = qaRoles.map(r => r.role);
      // เพิ่ม super_admin เสมอ
      if (!roleNames.includes("super_admin")) roleNames.push("super_admin");

      // หา users ที่มี role ตรง
      const qaAdmins = await db.collection("users")
        .find({ role: { $in: roleNames } })
        .project({ _id: 1, name: 1 })
        .toArray();

      if (qaAdmins.length > 0) {
        const notifications = qaAdmins.map(admin => ({
          userId: admin._id,
          title: `❓ คำถามใหม่จาก ${displayName}`,
          message: subject,
          type: "info",
          fromName: displayName,
          targetUrl: `/dashboard/questions`,
          isRead: false,
          read: false,
          createdAt: new Date(),
        }));
        await db.collection("notifications").insertMany(notifications);
      }
    } catch (notifErr) {
      console.error("⚠️ Failed to send Q&A notifications:", notifErr);
    }

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("❌ [API QUESTIONS PUBLIC POST ERROR]:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ error: "Post failed" }, { status: 500 });
  }
}
