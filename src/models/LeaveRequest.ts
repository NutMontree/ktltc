import { ObjectId } from 'mongodb';

/**
 * อินเตอร์เฟซสำหรับคำขอลาพักผ่อน/ลาป่วย (Leave Request Interface)
 * 
 * หน้าที่: กำหนดโครงสร้างข้อมูลสำหรับการยื่นใบลาอิเล็กทรอนิกส์
 * การทำงาน: 
 * - รองรับประเภทการลาต่างๆ (ป่วย, กิจ, พักร้อน, คลอดบุตร)
 * - มีระบบสถานะ (รออนุมัติ, อนุมัติแล้ว, ปฏิเสธ)
 * - บันทึกผู้อนุมัติ (ApprovedBy) เพื่อความโปร่งใส
 * 
 * ความเชื่อมโยง:
 * - userId: เชื่อมโยงกับบุคลากรที่ยื่นคำขอ (users collection)
 * - approvedBy: เชื่อมโยงกับผู้บริหารหรือหัวหน้างานที่มีอำนาจอนุมัติ (users collection)
 * - ใช้ใน API Routes สำหรับการจัดการใบลา (CRUD Leave Requests)
 */
export interface ILeaveRequest {
  _id?: ObjectId;           // ไอดีของใบลา
  userId: ObjectId;         // ไอดีผู้ลา (Foreign Key -> User)
  
  // ประเภทการลา
  leaveType: 'sick' | 'personal' | 'vacation' | 'maternity' | 'other';
  // sick: ลาป่วย, personal: ลากิจ, vacation: ลาพักผ่อน, maternity: ลาคลอด, other: อื่นๆ
  
  startDate: Date;          // วันที่เริ่มต้นลา
  endDate: Date;            // วันที่สิ้นสุดการลา
  reason: string;           // เหตุผลการลา
  attachmentUrl?: string;   // URL แนบไฟล์หลักฐาน (เช่น ใบรับรองแพทย์)
  
  // สถานะคำขอ
  status: 'pending' | 'approved' | 'rejected'; 
  // pending: รอการตรวจสอบ, approved: อนุมัติแล้ว, rejected: ไม่อนุมัติ/ตีกลับ
  
  approvedBy?: ObjectId;    // ไอดีผู้อนุมัติ (Foreign Key -> User)
  createdAt: Date;          // วันที่ยื่นคำขอ
  updatedAt: Date;          // วันที่แก้ไขข้อมูลล่าสุด
}

