// src/lib/models/suvery.js

import mongoose, { Schema } from "mongoose";

// กำหนดโครงสร้าง (Schema) สำหรับข้อมูลการสำรวจ
const suverySchema = new Schema(
    {
        // 1. ข้อมูลส่วนตัวและติดต่อ
        roomId: { type: String, required: true },
        studentId: { type: String, required: true, unique: true }, // 💡 แนะนำให้รหัสนักศึกษาไม่ซ้ำกัน
        fullName: { type: String, required: true },
        age: String, // 💡 เปลี่ยนจาก Number เป็น String ให้สอดคล้องกับ Isuvery
        gender: String, // ชาย/หญิง

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
        graduationYear: String, // 💡 เปลี่ยนจาก Number เป็น String ให้สอดคล้องกับ Isuvery
        educationLevel: String, // ปวช./ปวส.
        gpa: String, // 💡 เปลี่ยนจาก Number เป็น String ให้สอดคล้องกับ Isuvery

        // 3. สถานการณ์ทำงานปัจจุบัน
        currentStatus: {
            type: String,
            required: true
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
        submittedAt: { type: Date, default: Date.now }, // 💡 กำหนดค่าเริ่มต้นเป็นวันปัจจุบัน
    },
    {
        timestamps: true // เพิ่ม createdAt และ updatedAt โดยอัตโนมัติ
    }
);

// ตรวจสอบว่า Model ชื่อ 'Suvery' ถูกสร้างไปแล้วหรือไม่
const Suvery = mongoose.models.Suvery || mongoose.model("Suvery", suverySchema);

// 💡 Export ตัว Model ที่ชื่อ Suvery
export default Suvery;