import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    // 1. 🔒 Authentication & Authorization Check
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "default_secret_key_change_me",
    );

    let payload;
    try {
      // แยก try-catch เฉพาะส่วน Verify เพื่อแยก Error 401 กับ 500
      const verified = await jwtVerify(token, secret);
      payload = verified.payload;
    } catch (jwtError) {
      return NextResponse.json(
        { error: "Token ไม่ถูกต้องหรือหมดอายุ" },
        { status: 401 },
      );
    }

    // เช็ค Role: อนุญาตเฉพาะ super_admin, admin, teacher, hr, director และ editor
    const allowedRoles = ["super_admin", "admin", "teacher", "hr", "director", "editor"];
    const userRole = String(payload.role || "").toLowerCase().trim();
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 },
      );
    }

    // 2. 📡 Database Operations
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูลและจัดการลำดับ
    const users = await db
      .collection("users")
      .find({})
      .sort({
        orderIndex: 1, // เรียงตามลำดับที่จัดไว้
        createdAt: -1, // ถ้าลำดับเท่ากัน ให้เอาคนใหม่ขึ้นก่อน
      })
      .project({
        password: 0, // สำคัญมาก: ห้ามส่งรหัสผ่านออกไปเด็ดขาด
        __v: 0, // (ถ้ามี) ฟิลด์ version ของ mongoose
      })
      .toArray();

    // 3. 🛠️ Data Transformation (Safe Formatting)
    const safeUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(), // แปลง ObjectId เป็น String
      // ตรวจสอบ fallback สำหรับฟิลด์ที่อาจจะว่าง
      name: user.name || "Unknown User",
      role: user.role || "user",
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    }));

    return NextResponse.json(safeUsers, {
      headers: {
        "Cache-Control": "no-store, max-age=0", // ป้องกัน Browser แคชข้อมูล User
      },
    });
  } catch (error: any) {
    console.error("Critical API Error (GET Users):", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", message: error.message },
      { status: 500 },
    );
  }
}
