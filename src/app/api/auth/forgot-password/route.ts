import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ตรวจสอบว่ามีผู้ใช้นี้อยู่ในระบบหรือไม่
    const user = await db.collection("users").findOne({
      $or: [{ email: email }, { username: email }], // รองรับทั้งกรอก email ตรงๆ หรือ username ที่เป็น email
    });

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีที่ใช้อีเมลนี้ในระบบ" },
        { status: 404 }
      );
    }

    // สร้าง Token รีเซ็ตรหัสผ่าน
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 นาที

    // บันทึก Token ลงใน Database
    await db.collection("reset_tokens").insertOne({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: tokenExpiry,
      createdAt: new Date(),
    });

    // สร้างลิงก์สำหรับรีเซ็ตรหัสผ่าน
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // ส่งอีเมลด้วย Resend
    // หมายเหตุ: สำหรับ Resend หากโดเมนยังไม่ยืนยัน อาจต้องใช้ onbaording@resend.dev ส่งไปหา email ตัวเองเท่านั้นในตอนเทส
    const { error: sendError } = await resend.emails.send({
      from: "onboarding@resend.dev", // แนะนำให้ใช้ onboarding@resend.dev ถ้าไม่ได้ยืนยัน Domain ใน resend.com
      to: [user.email],
      subject: "🔑 รีเซ็ตรหัสผ่านสำหรับระบบจัดการ KTLTC",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">รีเซ็ตรหัสผ่านของคุณ</h2>
          <p>สวัสดี <strong>${user.name || user.username}</strong>,</p>
          <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณในระบบจัดการ KTLTC</p>
          <p>หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              ตั้งรหัสผ่านใหม่
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            ลิงก์นี้จะหมดอายุภายใน 15 นาที เพื่อความปลอดภัยของบัญชีคุณ<br/>
            หากปุ่มไม่ทำงาน คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้:<br/>
            <a href="${resetUrl}" style="color: #3b82f6;">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">ระบบบริหารจัดการ KTLTC</p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend Error:", sendError);
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
