import FormConfig from "@/app/models/FormConfig";
import { NextResponse } from "next/server";

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

const DEFAULT_FISCAL_YEARS = ["2567", "2568", "2569", "2570"];

export async function GET() {
  try {
    let config = await FormConfig.findOne({ type: "pdca_form" });
    if (!config) {
      config = await FormConfig.create({
        type: "pdca_form",
        pdcaItems: DEFAULT_ITEMS.map((label, index) => ({ id: index + 1, label })),
        departments: DEFAULT_DEPARTMENTS,
        fiscalYears: DEFAULT_FISCAL_YEARS,
      });
    }
    return NextResponse.json(config, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching config", error: err.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { pdcaItems, departments, fiscalYears } = body;

    const config = await FormConfig.findOneAndUpdate(
      { type: "pdca_form" },
      { pdcaItems, departments, fiscalYears },
      { new: true, upsert: true },
    );

    return NextResponse.json({ message: "Config updated", config }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Error updating config", error: err.message },
      { status: 500 },
    );
  }
}
