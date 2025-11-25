import mongoose, { Schema } from "mongoose";

// กำหนดโครงสร้าง (Schema) สำหรับข้อมูลการสำรวจ
const suverySchema = new Schema(
  {
    // 1. ข้อมูลส่วนตัวและติดต่อ
    roomId: { type: String, required: true },
    studentId: {
      type: String,
      required: [true, "กรุณาระบุรหัสนักศึกษา"], // Message เมื่อลืมใส่
      unique: true, // ⚠️ สำคัญ: ทำให้เกิด error E11000 ถ้าซ้ำ
      trim: true,
    },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number },

    // ที่อยู่ที่ติดต่อได้
    addrNumber: String,
    addrBuilding: String,
    addrMoo: String,
    addrSoi: String,
    addrRoad: String,
    addrSubDistrict: String,
    addrDistrict: String,
    addrProvince: String,
    addrZipCode: String,
    contactTel: { type: String, required: true }, // ควรบังคับใส่เบอร์โทร
    contactEmail: String,

    // 2. ข้อมูลการศึกษา
    homeProvince: String,
    college: { type: String, default: "วิทยาลัยเทคนิคกันทรลักษ์" },
    collegeProvince: { type: String, default: "ศรีสะเกษ" },
    graduationYear: Number,
    educationLevel: String, // ปวช./ปวส.
    gender: String, // ชาย/หญิง
    gpa: Number, // เกรดเฉลี่ยสะสม

    // 3. สถานการณ์ทำงานปัจจุบัน
    currentStatus: {
      type: String,
      required: true, // บังคับระบุสถานะ
    },

    // 3.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
    notWorkingReasonGroup: String,
    unemployedReason: String,
    unemployedReasonOther: String,
    jobSearchProblem: String,

    // 3.2 ข้อมูลเมื่อ "ทำงานแล้ว"
    employmentType: String,
    employmentTypeOther: String,
    jobTitle: String,
    workplaceName: String,
    workplaceTel: String,
    // ที่อยู่สถานที่ทำงาน
    workplaceAddrNumber: String,
    workplaceAddrMoo: String,
    workplaceAddrSoi: String,
    workplaceAddrRoad: String,
    workplaceAddrSubDistrict: String,
    workplaceAddrDistrict: String,
    workplaceAddrProvince: String,
    workplaceAddrZipCode: String,

    // 4. รายได้และความพึงพอใจ
    salaryRange: String,
    salaryRangeOther: String,
    jobMatch: String,
    jobSatisfaction: String,

    // 5. การศึกษาต่อ
    furtherStudyIntention: String,
    furtherStudyLevel: String,
    furtherStudyMajor: String,
    furtherStudyMajorDetail: String,
    furtherStudyReason: String,
    furtherStudyReasonOther: String,

    // 6. ข้อเสนอแนะ
    suggestion: String,

    // 7. ข้อมูลวันเวลา
    submittedAt: { type: Date, default: Date.now }, // ใช้ default จะสะดวกกว่าตอน create
  },
  {
    timestamps: true, // เพิ่ม createdAt และ updatedAt โดยอัตโนมัติ
  },
);

// ✅ ใช้ชื่อ Model ว่า 'Suvery' ตามที่คุณระบุ
const Suvery = mongoose.models.Suvery || mongoose.model("Suvery", suverySchema);

export default Suvery;
