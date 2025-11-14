import mongoose, { Schema } from "mongoose";

// กำหนดโครงสร้าง (Schema) สำหรับข้อมูลการสำรวจ
const surveySchema = new Schema(
    {
        // 1. ข้อมูลส่วนตัวและติดต่อ
        studentId: { type: String, required: true },
        fullName: { type: String, required: true },
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
        contactTel: String,
        contactEmail: String,

        // 2. ข้อมูลการศึกษา
        homeProvince: String,
        college: { type: String, default: 'วิทยาลัยเทคนิคกันทรลักษ์' },
        collegeProvince: { type: String, default: 'ศรีสะเกษ' },
        graduationYear: Number,
        educationLevel: String, // ปวช./ปวส.
        gender: String, // ชาย/หญิง
        gpa: Number, // เกรดเฉลี่ยสะสม

        // 3. สถานการณ์ทำงานปัจจุบัน
        currentStatus: String, // 1 ไม่ได้ทำงาน / 2 ทำงานแล้ว

        // 3.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
        notWorkingReasonGroup: String, // ศึกษาต่อ, หางานทำไม่ได้, รอฟังคำตอบ, ไม่ประสงค์จะทำงาน
        unemployedReason: String, // สาเหตุที่ยังไม่ได้ทำงาน (1, 2, 3, 4)
        unemployedReasonOther: String, // อื่นๆ (โปรดระบุ)
        jobSearchProblem: String, // ปัญหาในการหางานทำ (สำหรับกรณี "หางานทำไม่ได้")

        // 3.2 ข้อมูลเมื่อ "ทำงานแล้ว"
        employmentType: String, // ข้าราชการ, รัฐวิสาหกิจ, พนักงานบริษัท, อื่นๆ
        employmentTypeOther: String, // อื่นๆ (โปรดระบุ)
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
        salaryRange: String, // 1, 2, 3, 4, 5
        salaryRangeOther: String, // อื่นๆ (โปรดระบุ)
        jobMatch: String, // 1 ตรง / 2 ไม่ตรง
        jobSatisfaction: String, // 1 พึงพอใจ / 2 ไม่พึงพอใจ

        // 5. การศึกษาต่อ
        furtherStudyIntention: String, // ต้องการศึกษาต่อ / ไม่ต้องการศึกษาต่อ
        furtherStudyLevel: String, // ระดับปริญญาตรี, โท, เอก
        furtherStudyMajor: String, // สาขาเดิม / ระบุสาขา
        furtherStudyMajorDetail: String, // ระบุสาขา (text input)
        furtherStudyReason: String, // 1, 2, 3, 4
        furtherStudyReasonOther: String, // อื่นๆ (โปรดระบุ)

        // 6. ข้อเสนอแนะ
        suggestion: String,

        // 7. ข้อมูลวันเวลา
        submittedAt: { type: Date, required: true }, // 1 สิงหาคม 2568 เวลา 13:58
    },
    {
        timestamps: true // เพิ่ม createdAt และ updatedAt โดยอัตโนมัติ
    }
);

// ตรวจสอบว่า Model ชื่อ 'Survey' ถูกสร้างไปแล้วหรือไม่
const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema);

export default Survey;