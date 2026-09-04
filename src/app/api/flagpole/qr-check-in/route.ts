import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { calculateDistance } from "@/lib/geoDistance";

export const dynamic = "force-dynamic";

const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
const DEFAULT_IN_SITE_DISTANCE = 200;

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "ktltc-secret-key-12345";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const role = (session?.user?.role || "").toLowerCase();

    if (!userId || role !== "student") {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง หรือไม่ได้เข้าสู่ระบบในฐานะนักเรียน" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { token, lat, lng } = data;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "กรุณาสแกน QR Code ที่ถูกต้อง" },
        { status: 400 }
      );
    }

    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "QR Code ไม่ถูกต้อง หรือหมดอายุแล้ว" },
        { status: 400 }
      );
    }

    if (decodedToken.type !== "flagpole_qr_checkin") {
      return NextResponse.json(
        { success: false, message: "QR Code นี้ไม่ใช่สำหรับการเช็คชื่อ" },
        { status: 400 }
      );
    }

    const serverTime = new Date();
    const thTime = new Date(serverTime.getTime() + 7 * 60 * 60 * 1000);
    const todayDateStr = thTime.toISOString().split('T')[0];
    
    if (decodedToken.date !== todayDateStr) {
      return NextResponse.json(
        { success: false, message: "QR Code นี้เป็นของวันอื่น ไม่สามารถใช้งานได้แล้ว" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const userObjId = new ObjectId(userId);

    // Verify if student is in the department and class group specified in the token
    const student = await db.collection("users").findOne({ _id: userObjId, role: "student" });
    if (!student) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลนักเรียนในระบบ" }, { status: 404 });
    }

    // Even if they are from a different class, they scanned the teacher's screen, meaning they are there.
    // However, it's safer to only allow checking in if they match, or just allow it and record it.
    // We will allow it but verify later if needed. (Optional: check student.department === decodedToken.department)

    const thHours = thTime.getUTCHours();
    const thMinutes = thTime.getUTCMinutes();
    const currentTimeVal = thHours * 100 + thMinutes;

    const flagpoleSetting = await db.collection("flagpole_settings").findOne({ key: "global_flagpole" });
    const lateStr = flagpoleSetting?.lateThreshold || "08:00";
    const [lateH, lateM] = lateStr.split(":").map(Number);
    const flagLate = lateH * 100 + lateM;

    // Check GPS Distance
    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถระบุตำแหน่งพิกัดของคุณได้ กรุณาเปิด GPS" },
        { status: 400 }
      );
    }

    const targetLat = Number(flagpoleSetting?.lat ?? COLLEGE_LOCATION.lat);
    const targetLng = Number(flagpoleSetting?.lng ?? COLLEGE_LOCATION.lng);
    const inSiteThreshold = flagpoleSetting?.inSiteDistance ?? DEFAULT_IN_SITE_DISTANCE;
    
    const distance = calculateDistance(targetLat, targetLng, Number(lat), Number(lng));
    if (distance > inSiteThreshold) {
      return NextResponse.json(
        { success: false, message: `คุณอยู่นอกพื้นที่โดม (ห่าง ${Math.round(distance)} ม.) ไม่สามารถเช็คชื่อเข้าแถวได้` },
        { status: 403 }
      );
    }

    const isLate = currentTimeVal > flagLate;
    const status = isLate ? "Late" : "Present";
    
    const today = new Date(thTime);
    today.setUTCHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await db.collection("flagpole_attendances").findOne({
      userId: userObjId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: "คุณเช็คชื่อของวันนี้ไปแล้ว" },
        { status: 400 }
      );
    }

    const newRecord = {
      userId: userObjId,
      date: today,
      status,
      checkIn: {
        time: serverTime,
        location: { lat: Number(lat), lng: Number(lng), address: "QR Check-in via Teacher Screen" },
        photoUrl: "",
        statusTag: "QR Code Scan (Student)",
        deviceId: "student_qr_scan",
        distance: distance,
        teacherId: decodedToken.teacherId, // Optional tracking of who checked them in
      },
      createdAt: serverTime,
    };

    await db.collection("flagpole_attendances").insertOne(newRecord);

    return NextResponse.json({
      success: true,
      message: "เช็คชื่อเข้าแถวสำเร็จ!",
      status: status,
    });
  } catch (error: any) {
    console.error("Student QR Check-in Endpoint Error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการเช็คชื่อ" },
      { status: 500 }
    );
  }
}
