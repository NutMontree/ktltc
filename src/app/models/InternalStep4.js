import mongoose from "mongoose";

const InternalStep4Schema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
    docNumber: String, // ที่
    date: String, // วันที่
    subject: { type: String, default: "ขออนุมัติคำสั่งแต่งตั้งคณะกรรมการดำเนินงาน" }, // เรื่อง
    salutation: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" }, // เรียน

    // Dynamic Paragraphs
    paragraphs: { type: [String], default: [] },

    introPrefix: { type: String, default: "ในการนี้" }, // คำนำหน้าก่อนแผนก เช่น ในการนี้
    departmentName: String, // แผนกวิชา/งาน
    additionalIntroText: { type: String, default: "" }, // ข้อความเพิ่มเติมหลังชื่อแผนก
    projectName: String, // ชื่อโครงการ

    // Proposer (Right Side)
    signerName: String,
    signerPosition: { type: String, default: "หัวหน้างาน/หัวหน้าแผนก" },

    // Deputy Director (Right Column)
    deputy2Name: String,
    deputy2Position: { type: String, default: "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน" },
    deputy2Comment: String,

    // Director (Bottom Right)
    directorName: String,
    directorPosition: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" },
    directorComment: String,

    footerText: { type: String, default: "“เรียนดี มีคุณธรรม”" },
  },
  { timestamps: true },
);

export default mongoose.models.InternalStep4 ||
  mongoose.model("InternalStep4", InternalStep4Schema);
