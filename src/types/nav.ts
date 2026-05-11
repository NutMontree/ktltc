/**
 * nav.ts: แม่แบบข้อมูลสำหรับเมนูนำทาง (Navigation)
 */
export interface NavItem {
  _id?: string;        // ID จาก MongoDB (ถ้ามี)
  title: string;       // ชื่อเมนูที่จะแสดง
  url: string;         // ลิงก์ปลายทาง
  order: number;       // ลำดับการแสดงผล
  isOpenNewTab?: boolean; // ให้เปิดแท็บใหม่หรือไม่

  // รองรับฟิลด์อื่นๆ ที่อาจมีเพิ่มเข้ามาแบบ Dynamic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

