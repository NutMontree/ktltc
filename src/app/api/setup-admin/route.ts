import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // เข้ารหัสผ่าน 12345678
    const hashedPassword = await bcrypt.hash("12345678", 12);

    const user = {
      username: "admin",
      password: hashedPassword,
      name: "Super Admin", 
      role: "super_admin",
      isActive: true,
      image: "https://ui-avatars.com/api/?name=Admin",
      updatedAt: new Date(),
    };

    // อัปเดตหรือสร้างใหม่ถ้ายังไม่มี
    await db
      .collection("users")
      .updateOne({ username: "admin" }, { $set: user }, { upsert: true });

    return NextResponse.json({
      message: "Super Admin 'admin' created/updated with password '12345678'",
    });
  } catch (error: any) {
    console.error("Setup Admin Error:", error);
    return NextResponse.json({ error: "Failed", message: error.message }, { status: 500 });
  }
}
