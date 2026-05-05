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
    
    // ตรวจสอบว่าเป็น branch main หรือไม่
    if (body.ref !== "refs/heads/main") {
      return NextResponse.json({ message: "Not main branch, ignore" });
    }

    console.log("[Webhook] Push detected on main. Triggering auto-deploy...");

    // 3. รันสคริปต์ Deploy ใน Background (เพื่อไม่ให้ Request ค้าง)
    // ใช้สคริปต์เดิมที่เรามีอยู่แล้ว
    exec("bash /home/ktltc/ktltc/scripts/auto-deploy.sh >> /home/ktltc/ktltc/deploy.log 2>&1 &");

    return NextResponse.json({ 
      success: true, 
      message: "Deployment triggered successfully" 
    });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
