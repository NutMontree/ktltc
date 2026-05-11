import type { JSX } from "react";

/**
 * feature.ts: โครงสร้างข้อมูลสำหรับกล่องคุณสมบัติ (Feature Blocks)
 * ใช้ในหน้าแรกหรือหน้าแนะนำบริการเพื่อแสดงจุดเด่นของระบบ
 */
export type Feature = {
  id: number;          // ID ลำดับ
  icon: JSX.Element;   // คอมโพเนนต์ไอคอน (เช่น Lucide หรือ FontAwesome)
  title: string;       // หัวข้อหลัก
  paragraph: string;   // รายละเอียดประกอบ
  btn: string;         // ข้อความบนปุ่ม
  btnLink: string;     // ลิงก์ปลายทางของปุ่ม
};

