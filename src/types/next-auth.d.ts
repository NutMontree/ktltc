import NextAuth, { DefaultSession } from "next-auth";

/**
 * next-auth.d.ts: ไฟล์ประกาศประเภทข้อมูล (Declaration File) สำหรับ NextAuth
 * 
 * หน้าที่: 
 * - ขยาย (Extend) ประเภทข้อมูลเริ่มต้นของ NextAuth ให้รองรับฟิลด์ที่เราเพิ่มเข้ามาเอง
 * - เช่น ปกติ NextAuth จะไม่มี 'role' หรือ 'id' ใน session.user เราจึงต้องมาประกาศเพิ่มที่นี่
 * 
 * ผลลัพธ์: 
 * - ทำให้เวลาเราพิมพ์ `session.user.role` ในโค้ด VS Code จะไม่แจ้งเตือน Error และมี Auto-complete ขึ้นให้
 */

declare module "next-auth" {
  // ขยายประเภทข้อมูลของ Session
  interface Session {
    user: {
      id: string;   // เพิ่ม id เข้าไปใน User Session
      role: string; // เพิ่มบทบาท (Role) เข้าไปใน User Session
    } & DefaultSession["user"];
  }

  // ขยายประเภทข้อมูลของ User (ตอนที่ดึงมาจาก Database)
  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  // ขยายประเภทข้อมูลของ JWT Token (ที่เก็บไว้ใน Browser Cookie)
  interface JWT {
    id: string;
    role: string;
  }
}

