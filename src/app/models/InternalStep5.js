import mongoose from "mongoose";

const CommitteeMemberSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  position: { type: String, default: "" }, // e.g. ครูพิเศษสอน
  duty: { type: String, default: "" }, // e.g. ผู้ช่วยงานอาคารสถานที่
});

const CommitteeSubGroupSchema = new mongoose.Schema({
  subGroupName: { type: String, default: "" }, // e.g. งานอาคารสถานที่
  members: { type: [CommitteeMemberSchema], default: [] }
});

const CommitteeGroupSchema = new mongoose.Schema({
  groupName: { type: String, default: "" }, // e.g. คณะกรรมการฝ่ายอำนวยการ
  subGroups: { type: [CommitteeSubGroupSchema], default: [] },
  members: { type: [CommitteeMemberSchema], default: [] }
});

const InternalStep5Schema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "InternalPdca", required: true },
  orderNumber: { type: String, default: "" }, // คำสั่งที่
  subject: { type: String, default: "แต่งตั้งคณะกรรมการดำเนินงาน" }, // เรื่อง
  projectName: { type: String, default: "" }, // ชื่อโครงการ
  rationale: { type: String, default: "" }, // ความเป็นมา/เนื้อหาของคำสั่ง
  
  // Committee Groups
  committeeGroups: { type: [CommitteeGroupSchema], default: [] },
  
  // Signer
  signerName: { type: String, default: "นางสาวทักษิณา ชมจันทร์" },
  signerPosition: { type: String, default: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์" },
  orderDate: { type: String, default: "" }, // สั่ง ณ วันที่
  footerText: { type: String, default: "“เรียนดี มีคุณธรรม”" },
}, { timestamps: true });

export default mongoose.models.InternalStep5 || mongoose.model("InternalStep5", InternalStep5Schema);
