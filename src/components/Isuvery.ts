// src/components/Isuvery.ts

// 💡 Interface หลักสำหรับข้อมูลการสำรวจ
export interface Isuvery {
    _id: string;
    // ข้อมูลหลักสำหรับ List
    studentId: string;
    fullName: string;
    graduationYear: number;
    currentStatus: '1' | '2'; // 1: ไม่ได้ทำงาน, 2: ทำงานแล้ว
    submittedAt: string; // ISO Date string

    // ข้อมูลเพิ่มเติมสำหรับ Modal
    major: string;
    employmentStatus: string;
    companyName: string | null; // อาจไม่มีถ้า currentStatus = '1'
    salary: number | null; // อาจเป็น null
    satisfaction: number | null; // อาจเป็น null
    createdAt: string;

    // Field ที่เป็น Optional และสามารถเป็น null ได้
    roomId?: string | null;
    age?: number | null;
    contactTel?: string | null;
    contactEmail?: string | null;
}