import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน กรุณาลองใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ตรวจสอบ Token ใน Database
    const resetRecord = await db.collection("reset_tokens").findOne({
      token: token,
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือถูกใช้งานไปแล้ว" },
        { status: 400 }
      );
    }

    // ตรวจสอบวันหมดอายุของ Token
    if (new Date() > new Date(resetRecord.expiresAt)) {
      await db.collection("reset_tokens").deleteOne({ _id: resetRecord._id });
      return NextResponse.json(
        { error: "ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุแล้ว กรุณาทำรายการใหม่" },
        { status: 400 }
      );
    }

    // เข้ารหัส (Hash) รหัสผ่านใหม่
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // อัปเดตรหัสผ่านใหม่ให้กับ User
    const updateResult = await db.collection("users").updateOne(
      { _id: resetRecord.userId },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "ไม่สามารถอัปเดตรหัสผ่านได้ กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 500 }
      );
    }

    // ลบ Token ทิ้งเพื่อไม่ให้ใช้ซ้ำ
    await db.collection("reset_tokens").deleteOne({ _id: resetRecord._id });

    // (Optional) อาจจะมีการเตะ User ออกจากระบบทุกอุปกรณ์ด้วย
    await db.collection("users").updateOne(
      { _id: resetRecord.userId },
      { $set: { logoutAllBefore: Date.now() } }
    );

    return NextResponse.json(
      { message: "รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
