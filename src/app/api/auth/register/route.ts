import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs"; // แนะนำให้ใช้ bcryptjs เพื่อความเสถียรบน Serverless
import { recordLog } from "@/models/logger"; // นำเข้าฟังก์ชันบันทึก Log

import { getStudentAcademicYear } from "@/lib/student";

export async function POST(req: Request) {
  try {
    // 1. รับค่าจากหน้าบ้าน
    const body = await req.json();
    const { 
      username, 
      password, 
      name, 
      email, 
      phone, 
      lineId, 
      department, 
      role,
      citizenId,
      classGroupId,
      academicLevel,
      studentIdNum
    } = body;

    // Debug log (remove in production)
    console.log("[Register] Received body:", {
      username, name, email, phone, lineId, department, role,
      citizenId, classGroupId, academicLevel,
      password: password ? `[set, length=${String(password).length}]` : "[missing]",
    });

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !password || !name || !email || !phone) {
      console.log("[Register] 400 – missing basic fields:", { username: !!username, password: !!password, name: !!name, email: !!email, phone: !!phone });
      return NextResponse.json(
        {
          error:
            "กรุณากรอกข้อมูลพื้นฐานให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, อีเมล, เบอร์โทร)",
        },
        { status: 400 },
      );
    }

    // ตรวจสอบความถูกต้องของข้อมูลสําหรับนักเรียน/นักศึกษา
    if (role === "student") {
      if (!citizenId || citizenId.length !== 13 || isNaN(Number(citizenId))) {
        console.log("[Register] 400 – citizenId invalid:", { citizenId, length: citizenId?.length });
        return NextResponse.json(
          { error: "รหัสบัตรประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น" },
          { status: 400 }
        );
      }
      if (!classGroupId) {
        console.log("[Register] 400 – classGroupId missing");
        return NextResponse.json(
          { error: "กรุณาระบุรหัสกลุ่มเรียน" },
          { status: 400 }
        );
      }
      const validLevels = ["ปวช 1", "ปวช 2", "ปวช 3", "ปวส 1", "ปวส 2"];
      if (!academicLevel || !validLevels.includes(academicLevel)) {
        console.log("[Register] 400 – academicLevel invalid:", JSON.stringify(academicLevel), "valid:", validLevels.map(v => JSON.stringify(v)));
        return NextResponse.json(
          { error: "กรุณาเลือกชั้นปีให้ถูกต้องตามเงื่อนไข (ปวช 1-3, ปวส 1-2)" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 2.5 ตรวจสอบว่าระบบเปิดให้สมัครสมาชิกหรือไม่ (ยกเว้นนักเรียน ที่อนุญาตให้ลงทะเบียนได้เสมอ)
    const regSetting = await db.collection("site_settings").findOne({ key: "registration_enabled" });
    if (regSetting && regSetting.value === "false" && role !== "student") {
      console.log("[Register] Blocked: General registration is currently closed.");
      return NextResponse.json(
        { error: "ขณะนี้วิทยาลัยปิดรับสมัครสมาชิกทั่วไปชั่วคราว กรุณาติดต่อผู้ดูแลระบบ" },
        { status: 403 }
      );
    }

    // 3. ตรวจสอบว่ามี Username หรือ Email หรือเบอร์โทร หรือรหัสประชาชน นี้อยู่แล้วหรือไม่
    const searchConditions: any[] = [
      { username: { $regex: new RegExp(`^${(username as string).trim()}$`, "i") } }, 
      { email }, 
      { phone }
    ];

    if (role === "student" && citizenId) {
      searchConditions.push({ citizenId });
    }

    const existingUser = await db.collection("users").findOne({
      $or: searchConditions,
    });

    if (existingUser) {
      console.log("[Register] 400 – duplicate user found:", {
        matchedId: existingUser._id,
        citizenIdMatch: existingUser.citizenId === citizenId,
        usernameMatch: existingUser.username?.toLowerCase() === (username as string).toLowerCase(),
        emailMatch: existingUser.email === email,
        phoneMatch: existingUser.phone === phone,
      });
      if (role === "student" && existingUser.citizenId === citizenId) {
        return NextResponse.json(
          { error: "รหัสประจำตัวประชาชนนี้ถูกใช้งานในระบบแล้ว" },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "ชื่อผู้ใช้, อีเมล หรือเบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว" },
        { status: 400 },
      );
    }

    // 4. เข้ารหัสรหัสผ่าน (Hash Password)
    const hashedPassword = await bcrypt.hash(password, 12);

    // กำหนดการเข้าใช้งานทันที (student = เข้าใช้งานได้เลย, บทบาทอื่น = ต้องอนุมัติโดย super_admin)
    const userIsActive = role === "student";

    // 5. เตรียมข้อมูลผู้ใช้ใหม่ตามโครงสร้างระบบ ktltc
    const newUser: any = {
      username,
      password: hashedPassword,
      passwordText: password,
      name,
      email,
      phone,
      lineId: lineId || "",
      department: department || "ไม่มีสังกัด",
      role: role || "user", // รับค่า role จากหน้าบ้าน
      isActive: userIsActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // เพิ่มข้อมูลเฉพาะสำหรับนักเรียน / นักศึกษา (student)
    if (role === "student") {
      newUser.citizenId = citizenId;
      newUser.studentIdNum = studentIdNum;
      newUser.classGroupId = classGroupId;
      newUser.academicLevel = academicLevel;
      newUser.studentStatus = "กำลังศึกษา"; // ล็อคสถานะเป็นกำลังศึกษา
      newUser.learnerType = "ทวิภาคี"; // ล็อคประเภทผู้เรียนเป็นทวิภาคี
      newUser.lastPromotedYear = getStudentAcademicYear(new Date());
    }

    // 6. บันทึกลงฐานข้อมูล
    const result = await db.collection("users").insertOne(newUser);

    // 7. บันทึก Activity Log (เพื่อรายงานประจำเดือน)
    try {
      await recordLog({
        userId: result.insertedId,
        userName: name,
        action: "REGISTER",
        details: userIsActive
          ? `สมัครสมาชิกใหม่ อนุมัติเข้าใช้งานอัตโนมัติ (Role: student, Username: ${username})`
          : `สมัครสมาชิกใหม่ รอการอนุมัติจากผู้ดูแลระบบ (Role: ${role}, Username: ${username})`,
        req: req,
      });
    } catch (logError) {
      console.error("Failed to record register log:", logError);
    }

    return NextResponse.json(
      {
        message: userIsActive
          ? "สมัครสมาชิกสำเร็จ! ท่านสามารถเข้าสู่ระบบและเริ่มใช้งานได้ทันที"
          : "สมัครสมาชิกสำเร็จ! กรุณารอการอนุมัติการเข้าใช้งานจากผู้ดูแลระบบ",
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
