/**
 * ไฟล์นี้ใช้สำหรับกำหนดโครงสร้างข้อมูลของการเลือกตั้ง (Election Model)
 * เนื่องจากโปรเจกต์นี้ใช้ Native MongoDB Driver จึงไม่มี Schema เหมือน Mongoose
 * แต่ใช้ไฟล์นี้เป็นเอกสาร (Documentation)
 */

/**
 * รายละเอียดฟิลด์ข้อมูลใน MongoDB (elections collection):
 * - _id: ObjectId
 * - title: ชื่อการเลือกตั้ง (string)
 * - description: รายละเอียด (string)
 * - startDate: วันเวลาที่เริ่มโหวต (Date)
 * - endDate: วันเวลาที่สิ้นสุดการโหวต (Date)
 * - status: สถานะการเลือกตั้ง ('draft', 'active', 'closed') (string)
 * - createdAt: วันที่สร้าง (Date)
 * - updatedAt: วันที่อัปเดต (Date)
 */

export const ElectionStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed'
};
