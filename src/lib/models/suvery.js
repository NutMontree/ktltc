// src/lib/models/suvery.js

import mongoose, { Schema } from "mongoose";

// กำหนดโครงสร้าง (Schema) สำหรับข้อมูลการสำรวจ
const suverySchema = new Schema(
    {
        // 1. ข้อมูลส่วนตัวและติดต่อ
        roomId: { type: String, required: true },
        studentId: {
            type: String,
            required: true,
            unique: true, // 👈 นี่คือจุดสำคัญที่ทำให้เกิด E11000
            trim: true
        },
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
        // 💡 แนะนำให้ใช้ Type ที่ชัดเจนสำหรับสถานะงาน
        currentStatus: {
            type: String,
            // enum: ['ไม่ได้ทำงาน', 'ทำงานแล้ว', 'ศึกษาต่อ'], // ถ้าต้องการจำกัดค่า
            required: true // ควรกำหนดเป็น required หากเป็นสถานะหลัก
        },

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
        submittedAt: { type: Date, required: true },
    },
    {
        timestamps: true // เพิ่ม createdAt และ updatedAt โดยอัตโนมัติ
    }
);

// ตรวจสอบว่า Model ชื่อ 'Suvery' ถูกสร้างไปแล้วหรือไม่
// 💡 เปลี่ยนชื่อตัวแปรที่ Export เป็น Suvery (ตัวใหญ่) ตาม Best Practice
const Suvery = mongoose.models.Suvery || mongoose.model("Suvery", suverySchema);

// 💡 Export ตัว Model ที่ชื่อ Suvery
export default Suvery;