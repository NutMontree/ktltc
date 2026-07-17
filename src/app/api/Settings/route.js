import Settings from "@/app/models/Settings";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const DEFAULT_ITEMS = [
  "บันทึกข้อความขออนุมัติโครงการ",
  "บันทึกข้อความขออนุญาติดำเนินโครงการ",
  "โครงการ ที่ผู้บริหารลงนามแล้ว",
  "บันทึกขออนุมัติคำสั่ง",
  "คำสั่งแต่งตั้งคณะกรรมการดำเนินงาน",
  "บันทึกข้อความขออนุญาตประชุม",
  "บันทึกข้อความขอเชิญประชุม",
  "บันทึกข้อความขอรายงานการประชุม",
  "บันทึกข้อความขอความอนุเคราะห์ประชาสัมพันธ์โครงการ",
  "บันทึกข้อความรายงานการประชาสัมพันธ์โครงการ",
  "กำหนดการจัดกิจกรรม",
  "หนังสือเชิญเป็นวิทยากร/หนังสือตอบรับเป็นวิทยากร/หนังสือขอบคุณวิทยากร",
  "ลายมือชื่อผู้เข้าร่วมโครงการ",
  "รูปภาพการดำเนินงานโครงการ",
  "บันทึกข้อความรายงานสรุปการใช้งบประมาณ",
  "เอกสารชุดเบิกโครงการ",
  "แบบสอบถามประเมินความพึงพอใจผู้เข้าร่วมโครงการ Google from / QR Code",
  "บันทึกข้อความรายงานสรุปผลการวิเคราะห์ข้อมูลการดำเนินโครงการ",
  "ผลการวิเคราะห์ข้อมูล",
  "บันทึกกข้อความรายงานสรุปผลการดำเนินโครงการ",
];

const DEFAULT_DEPARTMENTS = [
  "ฝ่ายยุทธศาสตร์และแผนงาน",
  "ฝ่ายพัฒนากิจการนักเรียน",
  "ฝ่ายวิชาการ",
  "ฝ่ายบริหารทรัพยากร",
];

export async function GET() {
  try {
    let settings = await Settings.findOne({ type: "pdca_config" });
    if (!settings) {
      settings = await Settings.create({
        type: "pdca_config",
        pdcaItems: DEFAULT_ITEMS.map((label, index) => ({ id: index + 1, label })),
        departments: DEFAULT_DEPARTMENTS,
      });
    }
    return NextResponse.json(settings, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching settings", error: err.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    const role = (session?.user?.role || "").toLowerCase();
    
    if (!session || !["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pdcaItems, departments } = body;

    const settings = await Settings.findOneAndUpdate(
      { type: "pdca_config" },
      { pdcaItems, departments },
      { new: true, upsert: true },
    );

    return NextResponse.json({ message: "Settings updated", settings }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error updating settings", error: err.message },
      { status: 500 },
    );
  }
}
