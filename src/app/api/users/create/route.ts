import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. รับข้อมูลจาก Frontend
    const body = await req.json();
    const { username, password, name, email, role } = body;

    // 2. Validation เบื้องต้น
    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 3. ตรวจสอบว่ามี Username หรือ Email นี้อยู่แล้วหรือไม่
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username หรือ Email นี้ถูกใช้งานแล้ว" },
        { status: 409 }, // 409 Conflict
      );
    }

    // 4. เข้ารหัสรหัสผ่าน (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. บันทึกลงฐานข้อมูล
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      passwordText: password,
      name,
      email,
      role, // 'super_admin', 'admin', 'editor'
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "สร้างผู้ใช้งานสำเร็จ" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" },
      { status: 500 },
    );
  }
}
