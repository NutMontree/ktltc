/**
 * ไฟล์นี้ใช้สำหรับกำหนดโครงสร้างข้อมูลการลงคะแนนเสียง (Vote Model)
 * เนื่องจากโปรเจกต์นี้ใช้ Native MongoDB Driver จึงไม่มี Schema เหมือน Mongoose
 * แต่ใช้ไฟล์นี้เป็นเอกสาร (Documentation)
 */

/**
 * รายละเอียดฟิลด์ข้อมูลใน MongoDB (votes collection):
 * - _id: ObjectId
 * - electionId: ObjectId (อ้างอิงไปยัง elections collection)
 * - userId: ObjectId (อ้างอิงไปยัง users collection - นักเรียนที่โหวต)
 * - candidateId: ObjectId (อ้างอิงไปยัง candidates collection, เป็น null หากงดออกเสียง)
 * - ipAddress: IP ที่ใช้โหวต (string, optional)
 * - userAgent: Browser agent (string, optional)
 * - createdAt: วันที่ทำการโหวต (Date)
 */
