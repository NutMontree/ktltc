export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { calculateDistance } from '@/lib/geoDistance';
import { auth } from '@/lib/auth';
import { sendLineNotify } from '@/lib/lineNotify';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ObjectId } from 'mongodb';

// พิกัดวิทยาลัย KTLTC (82 หมู่ 1 ต.จานใหญ่ อ.กันทรลักษ์ จ.ศรีสะเกษ)
const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
// ค่า Default จะถูก override โดยค่าจาก DB
const DEFAULT_IN_SITE_DISTANCE = 200; // 200 Meters
const DEFAULT_WFH_MAX_DISTANCE = 200000; // 200 Kilometers (WFH/Remote Limit)

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const data = await req.json();
    const { lat, lng, photoUrl, deviceId, address } = data;

    const serverTime = new Date();
    
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ดึงข้อมูล User และ Role
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    const userRole = (user?.role || "user").toLowerCase();

    // 2. ดึงการตั้งค่า (Global และ Role)
    const [globalSetting, roleSetting] = await Promise.all([
      db.collection("role_settings").findOne({ role: "system_global" }),
      db.collection("role_settings").findOne({ role: userRole })
    ]);

    // 2.1 ค่า Default สำหรับ Global (ถ้าใน DB ยังไม่มี)
    const config = {
      checkInStart: globalSetting?.checkInStart || "05:00",
      lateThreshold: roleSetting?.checkInLimit || globalSetting?.lateThreshold || "08:00",
      systemLockStart: globalSetting?.systemLockStart || "18:01",
      systemLockEnd: globalSetting?.systemLockEnd || "04:59",
      // ค่าระยะทางจาก DB หรือค่า Default
      inSiteDistance: globalSetting?.inSiteDistance || DEFAULT_IN_SITE_DISTANCE,
      wfhMaxDistance: (globalSetting?.wfhMaxDistance || 200) * 1000, // แปลง กม. เป็น เมตร
    };

    // Geofencing - ใช้ค่าระยะทางจาก DB
    let statusTag = 'Remote';
    let distance = -1;
    if (lat && lng) {
      distance = calculateDistance(COLLEGE_LOCATION.lat, COLLEGE_LOCATION.lng, lat, lng);
      // ตรวจสอบระยะทางจาก DB
      const inSiteThreshold = config.inSiteDistance; // เมตร
      const maxAllowedDistance = config.wfhMaxDistance; // เมตร (จาก กม. * 1000)
      
      if (distance <= inSiteThreshold) {
        statusTag = 'อยู่ในพื้นที่ (In-Site)';
      } else if (distance <= maxAllowedDistance) {
        statusTag = 'นอกพื้นที่ (Remote/WFH)';
      } else {
        statusTag = 'อยู่นอกพื้นที่';
      }
    }
    const thTime = new Date(serverTime.getTime() + (7 * 60 * 60 * 1000));
    const thHours = thTime.getUTCHours();
    const thMinutes = thTime.getUTCMinutes();
    const currentTimeVal = thHours * 100 + thMinutes;

    // Helper: แปลง "HH:mm" เป็นตัวเลข HHmm เพื่อเปรียบเทียบ
    const toNum = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 100 + m;
    };

    const lockStart = toNum(config.systemLockStart);
    const lockEnd = toNum(config.systemLockEnd);
    const inStart = toNum(config.checkInStart);
    const lateLimit = toNum(config.lateThreshold);
    const thDay = thTime.getUTCDay(); // 0=Sunday, 1=Monday...

    // ⛔ 0. ตรวจสอบวันปิดระบบ (Closed Days)
    const closedDays = globalSetting?.closedDays || [];
    if (closedDays.includes(thDay)) {
      const dayNames = [
        "อาทิตย์",
        "จันทร์",
        "อังคาร",
        "พุธ",
        "พฤหัสบดี",
        "ศุกร์",
        "เสาร์",
      ];
      return NextResponse.json(
        {
          success: false,
          message: `วันนี้เป็นวัน${dayNames[thDay]} ซึ่งเป็นวันปิดระบบ ไม่สามารถลงเวลาได้`,
        },
        { status: 403 },
      );
    }

    // ⛔ 0.1 ตรวจสอบวันหยุด (Holidays)
    const today = new Date(thTime);
    today.setUTCHours(0, 0, 0, 0);
    const holiday = await db.collection("holidays").findOne({ date: today });
    if (holiday) {
      return NextResponse.json(
        {
          success: false,
          message: `วันนี้เป็นวันหยุด: ${holiday.name} ไม่ต้องลงเวลาเข้างาน`,
        },
        { status: 403 },
      );
    }

    // ⛔ 1. ตรวจสอบช่วงเวลาปิดระบบ (System Lockout)
    // กรณีข้ามคืน (เช่น 18:01 ถึง 04:59)
    const isLocked = lockStart > lockEnd 
      ? (currentTimeVal >= lockStart || currentTimeVal < lockEnd)
      : (currentTimeVal >= lockStart && currentTimeVal < lockEnd);

    if (isLocked) {
      return NextResponse.json({ 
        success: false, 
        message: `ขณะนี้อยู่นอกเวลาให้บริการ (ระบบปิดระหว่าง ${config.systemLockStart} - ${config.systemLockEnd} น.)` 
      }, { status: 403 });
    }

    // ⛔ 2. ตรวจสอบเวลาเริ่มเข้างาน
    if (currentTimeVal < inStart) {
      return NextResponse.json({ 
        success: false, 
        message: `ยังไม่ถึงเวลาลงเวลาเข้างาน (เริ่ม ${config.checkInStart} น.)` 
      }, { status: 403 });
    }

    // 3. ตรวจสอบสถานะสาย (Late)
    const isLate = currentTimeVal > lateLimit; 
    const status = isLate ? 'Late' : 'Present';

    // วันที่ของวันนี้ (เวลาประเทศไทย)
    // today is already defined above

    const userObjId = new ObjectId(userId);

    // ป้องกันการลงเวลาเข้างานซ้ำ
    const existingAttendance = await db.collection("attendances").findOne({ 
      userId: { $in: [userId, userObjId] }, 
      date: today 
    });

    if (existingAttendance && (existingAttendance as any).checkIn?.time) {
      return NextResponse.json({ 
        success: false, 
        message: 'คุณได้ลงเวลาเข้างานของวันนี้ไปแล้ว ไม่สามารถลงซ้ำได้' 
      }, { status: 400 });
    }

    const updateDoc = {
      $setOnInsert: { userId: userObjId, date: today, status },
      $set: {
        'checkIn.time': serverTime,
        'checkIn.location': { lat, lng, address },
        'checkIn.photoUrl': photoUrl,
        'checkIn.statusTag': statusTag,
        'checkIn.deviceId': deviceId
      }
    };

    const result = await db.collection("attendances").findOneAndUpdate(
      { userId: { $in: [userId, userObjId] }, date: today },
      updateDoc,
      { upsert: true, returnDocument: 'after' }
    );

    const newCheckIn = result;

    try {
      const user = await db.collection("users").findOne({ _id: userObjId });
      const userName = user?.name || user?.username || "พนักงาน";
      const timeStr = format(serverTime, 'HH:mm', { locale: th });
      const statusEmoji = status === "Late" ? "⚠️" : "✅";
      const lineMessage = `\n${statusEmoji} แจ้งเข้างาน\nพนักงาน: ${userName}\nเวลาเข้า: ${timeStr} น.\nพิกัด: ${statusTag} (${address || 'ไม่ระบุ'})`;
      await sendLineNotify(lineMessage);
    } catch (lineErr) {
      console.error("Line Notify fail:", lineErr);
    }

    return NextResponse.json({ success: true, data: newCheckIn, distance, statusTag });
  } catch (error: any) {
    console.error("Check-in Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
