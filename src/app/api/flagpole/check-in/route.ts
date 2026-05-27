export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { calculateDistance } from "@/lib/geoDistance";
import { auth } from "@/lib/auth";
import { sendLineNotify } from "@/lib/lineNotify";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ObjectId } from "mongodb";

// พิกัดวิทยาลัย KTLTC (82 หมู่ 1 ต.จานใหญ่ อ.กันทรลักษ์ จ.ศรีสะเกษ)
const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
const DEFAULT_IN_SITE_DISTANCE = 200; // 200 เมตร

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
        { status: 401 },
      );
    }

    const data = await req.json();
    const { lat, lng, photoUrl, deviceId, address } = data;

    const serverTime = new Date();

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ดึงข้อมูลผู้ใช้เพื่อใช้แสดงใน Line Notify และฐานข้อมูล
    const userObjId = new ObjectId(userId);
    const user = await db.collection("users").findOne({ _id: userObjId });
    const userRole = (user?.role || "user").toLowerCase();

    // 2. ดึงการตั้งค่าพิกัดและช่วงเวลาเช็คชื่อจาก flagpole_settings
    const flagpoleSetting = await db
      .collection("flagpole_settings")
      .findOne({ key: "global_flagpole" });
    const inSiteThreshold = flagpoleSetting?.inSiteDistance ?? DEFAULT_IN_SITE_DISTANCE;

    // จุดพิกัดหน้าเสาธงแบบไดนามิกจากฐานข้อมูล หรือใช้ค่าเริ่มต้นของวิทยาลัย
    const targetLat = flagpoleSetting?.lat ?? COLLEGE_LOCATION.lat;
    const targetLng = flagpoleSetting?.lng ?? COLLEGE_LOCATION.lng;

    // 3. วิเคราะห์ระยะทางและระบุสถานะพิกัด (Geofencing) - ไม่บล็อกการเช็คชื่อ แต่บันทึกข้อมูลแม่นยำ
    let statusTag = "นอกพื้นที่ (Remote)";
    let distance = -1;

    // ใช้ null/undefined check แทน falsy เพื่อรองรับพิกัด 0 (เส้นศูนย์สูตร)
    if (lat != null && lng != null) {
      distance = calculateDistance(targetLat, targetLng, lat, lng);
      if (distance <= inSiteThreshold) {
        statusTag = "อยู่ในพื้นที่ (In-Site)";
      } else {
        statusTag = "นอกพื้นที่ (Remote/WFH)";
      }
    } else {
      // ไม่มีพิกัด GPS — ปฏิเสธการเช็คชื่อ
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลพิกัด GPS กรุณาเปิดสิทธิ์ตำแหน่งและลองใหม่อีกครั้ง" },
        { status: 400 }
      );
    }

    // ลบการบล็อกตามรัศมี - อนุญาตให้เช็คชื่อจากทุกที่ แต่บันทึกระยะห่างแม่นยำ

    // 4. คำนวณเวลาฝั่งประเทศไทย (ICT)
    const thTime = new Date(serverTime.getTime() + 7 * 60 * 60 * 1000);
    const thHours = thTime.getUTCHours();
    const thMinutes = thTime.getUTCMinutes();
    const currentTimeVal = thHours * 100 + thMinutes;

    // ขอบเขตเวลาสำหรับการเข้าแถวหน้าเสาธง (ดึงแบบไดนามิกจาก DB หรือใช้ค่าเริ่มต้น)
    const startStr = flagpoleSetting?.checkInStart || "07:00";
    const lateStr = flagpoleSetting?.lateThreshold || "08:00";
    const closeStr = flagpoleSetting?.checkInEnd || "08:45";

    const [startH, startM] = startStr.split(":").map(Number);
    const [lateH, lateM] = lateStr.split(":").map(Number);
    const [closeH, closeM] = closeStr.split(":").map(Number);

    const flagStart = startH * 100 + startM;
    const flagLate = lateH * 100 + lateM;
    const flagClose = closeH * 100 + closeM;

    // ⛔ 4.1 ตรวจสอบช่วงเวลาเข้าแถว
    if (currentTimeVal < flagStart) {
      return NextResponse.json(
        {
          success: false,
          message: `ยังไม่ถึงเวลาลงชื่อเข้าแถว (ระบบเปิดให้บริการเวลา ${startStr} น.)`,
        },
        { status: 403 },
      );
    }

    if (currentTimeVal > flagClose) {
      return NextResponse.json(
        {
          success: false,
          message: `หมดเวลาลงชื่อเข้าแถวหน้าเสาธงแล้ว (ปิดระบบเวลา ${closeStr} น.)`,
        },
        { status: 403 },
      );
    }

    // 4.2 วิเคราะห์สถานะมาสายหรือตรงเวลา
    const isLate = currentTimeVal > flagLate;
    const status = isLate ? "Late" : "Present";

    // วันที่ของวันนี้ฝั่งไทย (เวลา 00:00:00 ของวันที่)
    const today = new Date(thTime);
    today.setUTCHours(0, 0, 0, 0);

    // 5. ป้องกันการลงเวลาเช็คชื่อซ้ำ
    const existingAttendance = await db.collection("flagpole_attendances").findOne({
      userId: userObjId,
      date: today,
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          message: "คุณได้เช็คชื่อเข้าแถวหน้าเสาธงของวันนี้ไปแล้ว ไม่สามารถลงซ้ำได้",
        },
        { status: 400 },
      );
    }

    // 6. บันทึกประวัติเข้าคอลเลกชัน flagpole_attendances
    const newRecord = {
      userId: userObjId,
      date: today,
      status,
      checkIn: {
        time: serverTime,
        location: { lat, lng, address },
        photoUrl,
        statusTag,
        deviceId,
        distance,  // บันทึกระยะห่างจากเสาธง (เมตร) เพื่อแสดงในรายงาน
      },
      createdAt: serverTime,
    };

    await db.collection("flagpole_attendances").insertOne(newRecord);

    // 7. ยิงแจ้งเตือน Line Notify เข้ากลุ่ม
    try {
      const userName = user?.name || user?.username || "พนักงาน/อาจารย์";
      const timeStr = format(serverTime, "HH:mm", { locale: th });
      const statusEmoji = status === "Late" ? "⚠️" : "✅";
      const statusText = status === "Late" ? "มาเข้าแถวสาย" : "ตรงเวลา";

      const lineMessage = `\n🇹🇭 เช็คชื่อเข้าแถว\nชื่อ-สกุล: ${userName}\nเวลาเช็คชื่อ: ${timeStr} น.\nสถานะ: ${statusEmoji} ${statusText}\nพิกัด: ${statusTag} (${address || "ไม่ระบุพิกัดอย่างละเอียด"})`;

      await sendLineNotify(lineMessage);
    } catch (lineErr) {
      console.error("Line Notify flagpole notification failed:", lineErr);
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกเวลาเข้าแถวหน้าเสาธงสำเร็จ!",
      data: newRecord,
      distance,
      statusTag,
    });
  } catch (error: any) {
    console.error("Flagpole Check-in Endpoint Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการลงชื่อเข้าแถว" },
      { status: 500 },
    );
  }
}
