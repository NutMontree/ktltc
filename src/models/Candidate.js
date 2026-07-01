/**
 * ไฟล์นี้ใช้สำหรับกำหนดโครงสร้างข้อมูลของผู้สมัครรับเลือกตั้ง (Candidate Model)
 * เนื่องจากโปรเจกต์นี้ใช้ Native MongoDB Driver จึงไม่มี Schema เหมือน Mongoose
 * แต่ใช้ไฟล์นี้เป็นเอกสาร (Documentation)
 */

/**
 * รายละเอียดฟิลด์ข้อมูลใน MongoDB (candidates collection):
 * - _id: ObjectId
 * - electionId: ObjectId (อ้างอิงไปยัง elections collection)
 * - number: หมายเลขผู้สมัคร (number)
 * - name: ชื่อ-นามสกุล หรือ ชื่อพรรค (string)
 * - imageUrl: URL ของรูปภาพผู้สมัคร (string)
 * - policy: นโยบาย (string - Markdown or HTML)
 * - createdAt: วันที่สร้าง (Date)
 * - updatedAt: วันที่อัปเดต (Date)
 */
