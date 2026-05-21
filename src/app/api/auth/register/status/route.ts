import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงค่าการเปิดรับสมัครจาก site_settings
    const regSetting = await db.collection("site_settings").findOne({ key: "registration_enabled" });
    
    // หากไม่ได้ระบุ หรือไม่มีใน DB ให้มีค่าเริ่มต้นเป็น true (เปิด)
    const enabled = regSetting ? regSetting.value !== "false" : true;

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error("GET Register Status Error:", error);
    return NextResponse.json({ enabled: true }, { status: 500 });
  }
}
