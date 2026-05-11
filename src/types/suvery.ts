/**
 * suvery.ts: แม่แบบข้อมูลสำหรับระบบแบบสำรวจ (Survey)
 * 
 * หน้าที่: 
 * - กำหนดโครงสร้างข้อมูลของผู้ตอบแบบสำรวจ (ผู้สำเร็จการศึกษา)
 * - กำหนดประเภทข้อมูลสำหรับ Props ที่ใช้ในคอมโพเนนต์แสดงรายการแบบสำรวจ
 */

export interface SuveryItem {
  _id: string;            // ID ผู้กรอกแบบสำรวจ
  studentId: string;      // รหัสนักเรียน/นักศึกษา
  fullName: string;       // ชื่อ-นามสกุล
  graduationYear: number; // ปีที่จบการศึกษา

  // ข้อมูลสถานะการทำงาน
  currentStatus: string;  // '1' = ยังไม่ได้ทำงาน, '2' = ทำงานแล้ว
  submittedAt: string;    // วันที่ส่งแบบสำรวจ (ISO Date string)

  // รายละเอียดเพิ่มเติม (แสดงใน Modal)
  major: string;            // สาขาวิชา
  employmentStatus: string; // ลักษณะการจ้างงาน
  companyName: string;      // ชื่อสถานประกอบการ
  salary: number;           // เงินเดือนเดือนแรก
  satisfaction: number;     // ระดับความพึงพอใจ (1-5)

  // รองรับฟิลด์อื่นๆ แบบ Dynamic
  [key: string]: any; 
}

/**
 * SuveryListItemProps: กำหนดค่า Props สำหรับคอมโพเนนต์แสดงผลแบบสำรวจแต่ละแถว
 */
interface SuveryListItemProps {
  suvery: SuveryItem; 
  onDetailClick: (suvery: SuveryItem) => void; // ฟังก์ชันสำหรับเปิดดูรายละเอียด
}

/**
 * SuveryListProps: กำหนดค่า Props สำหรับคอมโพเนนต์แสดงรายการแบบสำรวจทั้งหมด
 */
interface SuveryListProps {
  suverys: SuveryItem[]; 
}

