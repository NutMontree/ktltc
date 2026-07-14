export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { calculateDistance } from '@/lib/geoDistance';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// พิกัดวิทยาลัย KTLTC
const COLLEGE_LOCATION = { lat: 14.754043, lng: 104.65807 };
const MAX_ALLOWED_DISTANCE = 200000; // 200 Kilometers

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const data = await req.json();
    const { lat, lng, photoUrl, address } = data;

    // Note: We process distance but no longer block check-outs if they are > 200km.
    // The policy is to label them, but check-out doesn't store a statusTag right now.
    // If needed, we can store checkout statusTag in the future.
    if (lat && lng) {
      const distance = calculateDistance(COLLEGE_LOCATION.lat, COLLEGE_LOCATION.lng, lat, lng);
      // Just allowing it through based on requirements.
    }

    const serverTime = new Date();
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // 1. ดึงการตั้งค่า Global
    const globalSetting = await db.collection("role_settings").findOne({ role: "system_global" });
    const config = {
      checkOutStart: globalSetting?.checkOutStart || "16:30",
      checkOutEnd: globalSetting?.checkOutEnd || "18:00",
      systemLockStart: globalSetting?.systemLockStart || "18:01",
      systemLockEnd: globalSetting?.systemLockEnd || "04:59",
    };

    // Thailand is UTC+7
    const thTime = new Date(serverTime.getTime() + (7 * 60 * 60 * 1000));
    const thHours = thTime.getUTCHours();
    const thMinutes = thTime.getUTCMinutes();
    const currentTimeVal = thHours * 100 + thMinutes;

    // Helper: แปลง "HH:mm" เป็นตัวเลข HHmm
    const toNum = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 100 + m;
    };

    const lockStart = toNum(config.systemLockStart);
    const lockEnd = toNum(config.systemLockEnd);
    const outStart = toNum(config.checkOutStart);
    const outEnd = toNum(config.checkOutEnd);
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

    // ⛔ 1. ตรวจสอบช่วงเวลาปิดระบบ (System Lockout)
    const isLocked = lockStart > lockEnd 
      ? (currentTimeVal >= lockStart || currentTimeVal < lockEnd)
      : (currentTimeVal >= lockStart && currentTimeVal < lockEnd);

    if (isLocked) {
      return NextResponse.json({ 
        success: false, 
        message: `ขณะนี้อยู่นอกเวลาให้บริการ (ระบบปิดระหว่าง ${config.systemLockStart} - ${config.systemLockEnd} น.)` 
      }, { status: 403 });
    }

    // ⛔ 2. ตรวจสอบเวลาออกงาน (ห้ามออกก่อนเวลาที่กำหนด)
    if (currentTimeVal < outStart) {
      return NextResponse.json({ 
        success: false, 
        message: `ยังไม่ถึงเวลาลงเวลาออกงาน (ลงได้ตั้งแต่ ${config.checkOutStart} น. เป็นต้นไป)` 
      }, { status: 403 });
    }

    // ⛔ 3. ตรวจสอบเวลาสิ้นสุดการออกงาน
    if (currentTimeVal > outEnd) {
       return NextResponse.json({ 
        success: false, 
        message: `เลยเวลาลงเวลาออกงานแล้ว (สิ้นสุด ${config.checkOutEnd} น.) โปรดติดต่อเจ้าหน้าที่` 
      }, { status: 403 });
    }

    // วันที่ของวันนี้ (เวลาประเทศไทย)
    const today = new Date(thTime);
    today.setUTCHours(0, 0, 0, 0);

    const userObjId = new ObjectId(userId);

    // ดึงข้อมูล User และ Role
    const user = await db.collection("users").findOne({ _id: userObjId });
    const userRole = user?.role || "user";

    // ดึงการตั้งค่าเวลาออกงานของ Role นี้ (ถ้าไม่มีให้ใช้ Default 16:30)
    const roleSetting = await db.collection("role_settings").findOne({ role: userRole });
    let otLimitHours = 16;
    let otLimitMinutes = 30;

    if (roleSetting && roleSetting.checkOutTime) {
      const [h, m] = roleSetting.checkOutTime.split(":").map(Number);
      otLimitHours = h;
      otLimitMinutes = m;
    }

    const existingAttendance = await db.collection("attendances").findOne({ 
      userId: { $in: [userId, userObjId] }, 
      date: today 
    });
    
    // ตรวจสอบว่าเช็คอินหรือยัง
    if (!existingAttendance || !(existingAttendance as any).checkIn?.time) {
      return NextResponse.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลเข้างาน กรุณาลงเวลาเข้างานก่อนครับ' 
      }, { status: 400 });
    }

    // ป้องกันการลงเวลาออกงานซ้ำ
    if ((existingAttendance as any).checkOut?.time) {
      return NextResponse.json({ 
        success: false, 
        message: 'คุณได้ลงเวลาออกงานของวันนี้ไปแล้ว ไม่สามารถลงซ้ำได้' 
      }, { status: 400 });
    }

    // คำนวณ OT ตามเวลาประเทศไทย
    const standardEndOfDay = new Date(thTime);
    standardEndOfDay.setUTCHours(otLimitHours, otLimitMinutes, 0, 0);

    let otHours = 0;
    if (thTime.getTime() > standardEndOfDay.getTime()) {
      const diffInMs = thTime.getTime() - standardEndOfDay.getTime();
      otHours = Number((diffInMs / (1000 * 60 * 60)).toFixed(2));
    }

    const result = await db.collection("attendances").findOneAndUpdate(
      { userId: { $in: [userId, userObjId] }, date: today },
      {
        $set: {
          'checkOut.time': serverTime,
          'checkOut.location': { lat, lng, address },
          'checkOut.photoUrl': photoUrl,
          'checkOut.otHours': otHours
        }
      },
      { returnDocument: 'after' }
    );

    const updatedCheckOut = result;

    if (!updatedCheckOut) {
      return NextResponse.json({ success: false, message: 'No check-in record found for today.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCheckOut, otHours });
  } catch (error: any) {
    console.error("Check-out Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
