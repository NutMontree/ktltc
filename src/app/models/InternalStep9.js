import mongoose from "mongoose";

const InternalStep9Schema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
    docNumber: String,
    date: String,
    subject: { type: String, default: "ขอรายงานการประชุม" },
    salutation: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" },
    paragraphs: { type: [String], default: [] },
    introPrefix: { type: String, default: "ในการนี้" },
    departmentName: String,
    additionalIntroText: { type: String, default: "" },
    projectName: String,
    signerName: String,
    signerPosition: { type: String, default: "หัวหน้างาน/หัวหน้าแผนก" },
    deputy2Name: String,
    deputy2Position: { type: String, default: "รองผู้อำนวยการฝ่ายยุทธศาสตร์และแผนงาน" },
    deputy2Comment: String,
    directorName: String,
    directorPosition: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" },
    directorComment: String,
    footerText: { type: String, default: "“เรียนดี มีคุณธรรม”" },
  },
  { timestamps: true },
);

export default mongoose.models.InternalStep9 ||
  mongoose.model("InternalStep9", InternalStep9Schema);
