import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs"; // แนะนำให้ใช้ bcryptjs เพื่อความเสถียรบน Serverless
import { recordLog } from "@/models/logger"; // นำเข้าฟังก์ชันบันทึก Log

export async function POST(req: Request) {
  try {
    // 1. รับค่าจากหน้าบ้าน
    const { username, password, name, email, phone, lineId, department } = await req.json();

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !password || !name || !email || !phone) {
      return NextResponse.json(
        {
          error:
            "กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, อีเมล, เบอร์โทร)",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 3. ตรวจสอบว่ามี Username หรือ Email หรือเบอร์โทร นี้อยู่แล้วหรือไม่
    const existingUser = await db.collection("users").findOne({
      $or: [
        { username: { $regex: new RegExp(`^${(username as string).trim()}$`, "i") } }, 
        { email }, 
        { phone }
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้, อีเมล หรือเบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว" },
        { status: 400 },
      );
    }

    // 4. เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. เตรียมข้อมูลผู้ใช้ใหม่ตามโครงสร้างระบบ ktltc
    const newUser = {
      username,
      password: hashedPassword,
      name,
      email,
      phone,
      lineId: lineId || "",
      department: department || "ไม่มีสังกัด",
      role: "user", // ปรับเป็น 'user'
      isActive: false, // ตั้งเป็น false เพื่อให้รอ super_admin อนุมัติการใช้งานก่อน
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6. บันทึกลงฐานข้อมูล
    const result = await db.collection("users").insertOne(newUser);

    // 7. บันทึก Activity Log (เพื่อรายงานประจำเดือน)
    try {
      await recordLog({
        userId: result.insertedId,
        userName: name,
        action: "REGISTER",
        details: `สมัครสมาชิกใหม่ รอการอนุมัติ (Username: ${username})`,
        req: req,
      });
    } catch (logError) {
      console.error("Failed to record register log:", logError);
    }

    return NextResponse.json(
      {
        message:
          "สมัครสมาชิกสำเร็จ! ท่านสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ ไม่สามารถลงทะเบียนได้ในขณะนี้" },
      { status: 500 },
    );
  }
}
