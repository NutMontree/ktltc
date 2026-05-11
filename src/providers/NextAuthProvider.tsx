"use client";

import { SessionProvider } from "next-auth/react";

/**
 * NextAuthProvider: ตัวจัดการสถานะการเข้าสู่ระบบ (Authentication Context)
 * 
 * หน้าที่: 
 * - หุ้มแอปพลิเคชันเพื่อให้ทุกคอมโพเนนต์สามารถเข้าถึงข้อมูล User ที่ Login อยู่ได้
 * - ใช้ Client Component เพราะต้องทำงานร่วมกับ React Context
 * 
 * วิธีใช้: 
 * นำไปหุ้ม children ใน layout.tsx (ถ้าต้องการแยก Logic ออกมาเป็นระเบียบ)
 */
export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
