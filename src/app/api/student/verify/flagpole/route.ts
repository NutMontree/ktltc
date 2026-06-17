import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ success: false, error: "กรุณาระบุรหัสผู้เรียน" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("ktltc_db");

    let queryConditions = [];
    queryConditions.push({ userId: studentId });
    if (ObjectId.isValid(studentId)) {
      queryConditions.push({ userId: new ObjectId(studentId) });
    }

    // ดึงข้อมูล 30 วันย้อนหลัง (ตามเวลาไทย)
    const today = new Date();
    const limitD = new Date(today.getTime() + 7 * 60 * 60 * 1000);
    limitD.setUTCHours(23, 59, 59, 999);
    
    const startD = new Date(limitD);
    startD.setUTCDate(startD.getUTCDate() - 30);
    startD.setUTCHours(0, 0, 0, 0);

    const flagpoleHistory = await db
      .collection("flagpole_attendances")
      .find({
        $or: queryConditions,
        date: { $gte: startD, $lte: limitD }
      })
      .toArray();

    // จัดกลุ่มตามวันที่
    const attendancesByDate: Record<string, any> = {};
    flagpoleHistory.forEach(a => {
      const d = new Date(a.date);
      const thaiTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const dStr = thaiTime.toISOString().split('T')[0];
      // เก็บตัวล่าสุดของวันนั้น
      if (!attendancesByDate[dStr] || new Date(a.date) > new Date(attendancesByDate[dStr].date)) {
        attendancesByDate[dStr] = a;
      }
    });

    const mappedHistory = [];
    let current = new Date(limitD); // เริ่มจากวันนี้ ถอยหลังไป 30 วัน
    current.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const dStr = current.toISOString().split('T')[0];
      const dayOfWeek = current.getUTCDay(); // 0 = Sun, 6 = Sat

      if (attendancesByDate[dStr]) {
        // มีการเข้าแถว
        const item = attendancesByDate[dStr];
        mappedHistory.push({
          id: item._id.toString(),
          date: item.date,
          status: item.status || "Present",
          time: item.checkIn?.time || null,
          address: item.checkIn?.address || null,
          photoUrl: item.checkIn?.photoUrl || null,
          deviceId: item.checkIn?.deviceId || null,
        });
      } else {
        // ไม่มีข้อมูลการเข้าแถว -> ตรวจสอบว่าไม่ใช่วันเสาร์อาทิตย์ จึงจะบันทึกว่าขาด
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          const mockDate = new Date(`${dStr}T08:00:00.000+07:00`);
          mappedHistory.push({
            id: `absent-${dStr}`,
            date: mockDate,
            status: "Absent",
            time: null,
            address: null,
            photoUrl: null,
            deviceId: null,
          });
        }
      }

      // ถอยหลัง 1 วัน
      current.setUTCDate(current.getUTCDate() - 1);
    }

    return NextResponse.json({ success: true, history: mappedHistory });
  } catch (error: any) {
    console.error("[Verify Flagpole API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติเข้าแถวหน้าเสาธง" },
      { status: 500 }
    );
  }
}
