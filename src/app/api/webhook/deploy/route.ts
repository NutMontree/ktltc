import { NextResponse } from "next/server";
import { exec } from "child_process";
import crypto from "crypto";

/**
 * Webhook สำหรับ GitHub เพื่อสั่ง Deploy ทันทีเมื่อมีการ Push
 */
export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const secret = process.env.GITHUB_WEBHOOK_SECRET || "ktltc_secret_2026"; // แนะนำให้ตั้งใน .env

    // 1. ตรวจสอบ Signature เพื่อความปลอดภัย (ถ้ามีการตั้ง Secret ใน GitHub)
    if (signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(payload).digest("hex");
      
      if (signature !== digest) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    // 2. ตรวจสอบว่าเป็น Event 'push' หรือไม่
    const event = req.headers.get("x-github-event");
    if (event !== "push") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const body = JSON.parse(payload);
    
    // ตรวจสอบว่าเป็น branch production หรือไม่
    if (body.ref !== "refs/heads/production") {
      return NextResponse.json({ message: "Not production branch, ignore" });
    }

    console.log("[Webhook] Push detected on production. Triggering auto-deploy...");

    // 3. รันสคริปต์ Deploy ใน Background (เพื่อไม่ให้ Request ค้าง)
    // ใช้สคริปต์เดิมที่เรามีอยู่แล้ว
    exec("bash /home/ktltc/ktltc/scripts/auto-deploy.sh >> /home/ktltc/ktltc/deploy.log 2>&1 &");

    // 4. ส่งการแจ้งเตือนให้ super_admin และ admin ผ่านระบบ Notification
    try {
      const clientPromise = (await import("@/lib/db")).default;
      const client = await clientPromise;
      const db = client.db("ktltc_db");
      
      const targetRoles = ["super_admin", "admin"];
      const targetUsers = await db.collection("users").find({ role: { $in: targetRoles } }).project({ _id: 1 }).toArray();

      if (targetUsers.length > 0) {
        const notifications = targetUsers.map(user => ({
          userId: user._id,
          type: "system_deploy",
          title: "มีการอัปโหลดโค้ดใหม่",
          message: `ระบบมีการอัปโหลดโค้ดใหม่ขึ้น Server ใน branch production แล้ว (อัปเดตเมื่อ ${new Date().toLocaleString('th-TH')})`,
          from: "SYSTEM",
          fromName: "System",
          fromImage: "/images/logo.png",
          targetUrl: "/dashboard/notifications",
          isRead: false,
          read: false,
          createdAt: new Date(),
        }));

        await db.collection("notifications").insertMany(notifications);
      }
    } catch (notifError) {
      console.error("Failed to send deployment notification:", notifError);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Deployment triggered successfully" 
    });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
