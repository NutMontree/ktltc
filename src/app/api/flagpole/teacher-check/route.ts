import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { calculateDistance } from "@/lib/geoDistance";

export const dynamic = "force-dynamic";

const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
const DEFAULT_IN_SITE_DISTANCE = 200;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();

    if (!session || !["super_admin", "admin", "teacher", "director"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { userId, method, lat, lng } = data; // method can be "manual_tick" or "qr_scan"

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุรหัสนักเรียน (userId)" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let userObjId;
    try {
      userObjId = new ObjectId(userId);
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "รูปแบบรหัสนักเรียนไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Check if user exists and is a student
    const student = await db.collection("users").findOne({ _id: userObjId, role: "student" });
    if (!student) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลนักเรียน หรือไม่ใช่รหัสนักเรียน" },
        { status: 404 }
      );
    }

    const serverTime = new Date();
    
    // Calculate Thai Time
    const thTime = new Date(serverTime.getTime() + 7 * 60 * 60 * 1000);
    const thHours = thTime.getUTCHours();
    const thMinutes = thTime.getUTCMinutes();
    const currentTimeVal = thHours * 100 + thMinutes;

    // Get time settings
    const flagpoleSetting = await db.collection("flagpole_settings").findOne({ key: "global_flagpole" });
    const lateStr = flagpoleSetting?.lateThreshold || "08:00";
    const [lateH, lateM] = lateStr.split(":").map(Number);
    const flagLate = lateH * 100 + lateM;

    // Check GPS Distance
    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: "ไม่สามารถระบุตำแหน่งพิกัดของคุณครูได้ กรุณาเปิด GPS" },
        { status: 400 }
      );
    }

    const targetLat = Number(flagpoleSetting?.lat ?? COLLEGE_LOCATION.lat);
    const targetLng = Number(flagpoleSetting?.lng ?? COLLEGE_LOCATION.lng);
    const inSiteThreshold = flagpoleSetting?.inSiteDistance ?? DEFAULT_IN_SITE_DISTANCE;
    
    const distance = calculateDistance(targetLat, targetLng, Number(lat), Number(lng));
    if (distance > inSiteThreshold) {
      return NextResponse.json(
        { success: false, message: `คุณครูอยู่นอกพื้นที่โดม (ห่าง ${Math.round(distance)} ม.) ไม่สามารถเช็คชื่อให้เด็กได้` },
        { status: 403 }
      );
    }

    // Evaluate Late or Present
    const isLate = currentTimeVal > flagLate;
    const status = isLate ? "Late" : "Present";
    
    let statusTag = "Checked by Teacher";
    if (method === "qr_scan") {
      statusTag = "QR Code Scan (Teacher)";
    }

    const today = new Date(thTime);
    today.setUTCHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Prevent duplicate check-in
    const existingAttendance = await db.collection("flagpole_attendances").findOne({
      userId: userObjId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          message: "นักเรียนคนนี้เช็คชื่อไปแล้ว",
          studentName: student.name
        },
        { status: 400 }
      );
    }

    const newRecord = {
      userId: userObjId,
      date: today,
      status,
      checkIn: {
        time: serverTime,
        location: { lat: Number(lat), lng: Number(lng), address: "Manual/QR Check-in by Teacher" },
        photoUrl: "",
        statusTag: statusTag,
        deviceId: "teacher_manual",
        distance: distance,
      },
      createdAt: serverTime,
    };

    await db.collection("flagpole_attendances").insertOne(newRecord);

    return NextResponse.json({
      success: true,
      message: "บันทึกเวลาเข้าแถวสำเร็จ!",
      studentName: student.name,
      status: status,
    });
  } catch (error: any) {
    console.error("Teacher Check-in Endpoint Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการลงชื่อ" },
      { status: 500 }
    );
  }
}
