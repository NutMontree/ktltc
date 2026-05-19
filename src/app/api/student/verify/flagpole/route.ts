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

    const flagpoleHistory = await db
      .collection("flagpole_attendances")
      .find({ $or: queryConditions })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    // Map history to clean, simple, and PDPA-safe data structures
    const mappedHistory = flagpoleHistory.map((item: any) => ({
      id: item._id.toString(),
      date: item.date,
      status: item.status || "Present", // Present (ตรงเวลา), Late (สาย), Absent (ขาด), Leave (ลา)
      time: item.checkIn?.time || null,
      address: item.checkIn?.address || null,
      photoUrl: item.checkIn?.photoUrl || null,
    }));

    return NextResponse.json({ success: true, history: mappedHistory });
  } catch (error: any) {
    console.error("[Verify Flagpole API] Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติเข้าแถวหน้าเสาธง" },
      { status: 500 }
    );
  }
}
