import InternalFormConfig from "@/app/models/InternalFormConfig";
import { connectDB } from "@/app/models/InternalPdca";
import { NextResponse } from "next/server";

const DEFAULT_ITEMS = [
  "การจัดทำรูปเล่ม PDCA",
  "แบบฟอร์มขออนุมัติโครงการ (งานวางแผน)",
  "แบบฟอร์มขออนุมัติโครงการ (ทั่วไป)",
  "แบบฟอร์มขออนุญาตดำเนินโครงการ",
  "การขอปรับเพิ่มงบประมาณโครงการ",
  "การปรับโครงการเข้าแผนปฏิบัติการ",
  "แบบฟอร์มโครงการมาตรฐาน",
  "บันทึกข้อความรายงานผลการดำเนินงาน",
  "แบบรายงานผลการดำเนินงาน (สรุปย่อ)",
  "เอกสารติดตามและประเมินผล PDCA",
  "รูปภาพและรายงานสรุปผลฉบับสมบูรณ์",
];

export async function GET() {
  try {
    await connectDB();
    let config = await InternalFormConfig.findOne({ type: "internal_pdca_form" });
    if (!config) {
      config = await InternalFormConfig.create({
        type: "internal_pdca_form",
        pdcaItems: DEFAULT_ITEMS.map((label, index) => ({ id: index + 1, label })),
        departments: [
          "ฝ่ายยุทธศาสตร์และแผนงาน",
          "ฝ่ายพัฒนากิจการนักเรียน",
          "ฝ่ายวิชาการ",
          "ฝ่ายบริหารทรัพยากร",
        ],
        fiscalYears: ["2567", "2568", "2569", "2570"],
      });
    }
    return NextResponse.json(config, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { pdcaItems, departments, fiscalYears } = body;

    const config = await InternalFormConfig.findOneAndUpdate(
      { type: "internal_pdca_form" },
      { pdcaItems, departments, fiscalYears },
      { new: true, upsert: true },
    );

    return NextResponse.json({ message: "Success", config }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error", error: err.message }, { status: 500 });
  }
}
