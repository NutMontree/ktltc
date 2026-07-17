import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ค้นหาผู้ใช้
    const user = await db.collection("users").findOne({ username });

    // 2. ตรวจสอบรหัสผ่าน
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    // 3. ตรวจสอบสถานะการใช้งาน
    if (user.isActive === false) {
      return NextResponse.json(
        { error: "บัญชีของคุณยังไม่ได้รับการอนุมัติ" },
        { status: 403 },
      );
    }

    // 4. เตรียม JWT Secret
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key_ktltc_2024",
    );

    // 5. สร้าง Token
    const token = await new SignJWT({
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    // ✅ 6. บันทึก Activity Log ลง Database โดยตรง (สำคัญมากเพื่อให้ชื่อ siripan ขึ้น)
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

      await db.collection("logs").insertOne({
        userId: user._id, // ID ของ siripan
        userName: user.name, // ชื่อจริงของผู้ใช้
        action: "LOGIN", // กิจกรรม
        details: `เข้าสู่ระบบสำเร็จ (สิทธิ์: ${user.role})`,
        timestamp: new Date(),
        ip: ip,
      });
    } catch (logError) {
      console.error("Direct Log Error:", logError);
    }

    // 7. ตั้งค่า Cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        name: user.name,
        role: user.role,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
