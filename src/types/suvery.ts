// แนะนำ: ควรย้าย Interface นี้ไปไว้ในไฟล์ Type กลาง เช่น src/types/suvery.ts หรือ src/types/index.ts

// 💡 อัปเดต: เปลี่ยนชื่อเป็น SuveryItem และเพิ่ม Field ที่ Modal ต้องใช้
export interface SuveryItem {
  _id: string;
  studentId: string;
  fullName: string;
  graduationYear: number;

  // ข้อมูลที่แสดงใน List
  currentStatus: string; // '1' (ไม่ได้ทำงาน) หรือ '2' (ทำงานแล้ว)
  submittedAt: string; // ISO Date string (วันที่กรอก)

  // ข้อมูลที่ Modal ต้องใช้ (จาก Mongoose Schema)
  major: string;
  employmentStatus: string; // สถานะการจ้างงาน
  companyName: string;
  salary: number; // หรือ string, ตามที่คุณเก็บใน DB
  satisfaction: number; // 1-5 (ความพึงพอใจ)

  // 💡 หากใช้ submittedAt แทน createdAt ให้เปลี่ยนชื่อใน Modal ด้วย
  [key: string]: any; // ใช้สำหรับ Field อื่นๆ และหลีกเลี่ยง Error 7053
}

// 💡 กำหนด Type สำหรับ Props ของ suveryListItem
interface SuveryListItemProps {
  // ใช้ PascalCase
  suvery: SuveryItem; // 💡 ใช้ SuveryItem
  onDetailClick: (suvery: SuveryItem) => void; // 💡 ใช้ SuveryItem
}

// 💡 กำหนด Type สำหรับ Props ของ suveryList หลัก
interface SuveryListProps {
  // ใช้ PascalCase
  suverys: SuveryItem[]; // 💡 ใช้ SuveryItem
}
