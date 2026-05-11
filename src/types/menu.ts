/**
 * menu.ts: โครงสร้างข้อมูลสำหรับเมนูนำทางพื้นฐาน
 * รองรับการทำเมนูย่อย (Submenu) ได้ไม่จำกัดชั้น
 */
export type Menu = {
  id: number;           // ID ลำดับ
  title: string;        // ชื่อเมนู
  path?: string;        // ลิงก์ปลายทาง (ถ้ามี)
  newTab: boolean;      // กำหนดให้เปิดแท็บใหม่หรือไม่
  submenu?: Menu[];     // รายการเมนูย่อย (ถ้ามี)
};

