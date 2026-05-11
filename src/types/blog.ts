/**
 * blog.ts: โครงสร้างข้อมูลสำหรับบทความหรือข่าวสาร (Blog Post)
 * ใช้กำหนดรูปแบบข้อมูลที่ดึงมาแสดงในหน้าข่าวประชาสัมพันธ์
 */
export type Blog = {
  id?: number;        // ID ของบทความ
  title?: string;     // หัวข้อบทความ
  slug?: string;      // URL Friendly Title (เช่น title-name)
  excerpt?: string;   // เนื้อหาโดยย่อ
  coverImage?: string; // พาธรูปภาพหน้าปก
  date: string;       // วันที่เผยแพร่
};

