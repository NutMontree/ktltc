import type { NextAuthConfig } from "next-auth";

/**
 * auth.config.ts: ไฟล์ตั้งค่าพื้นฐานสำหรับ NextAuth (Auth.js v5)
 * 
 * หน้าที่: 
 * - กำหนดการทำงานของ JWT และ Session
 * - กำหนด Callback ฟังก์ชันหลังจากมีการ Login หรือตรวจสอบสิทธิ์
 * - ระบุหน้า Login ที่ต้องการใช้
 * 
 * ความเชื่อมโยง:
 * - ถูกเรียกใช้ในไฟล์ src/lib/auth.ts (ไฟล์หลักของ Auth)
 * - ถูกเรียกใช้ใน Middleware เพื่อตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บ
 */

const callbacks: NextAuthConfig["callbacks"] = {
  // 1. jwt callback: ทำงานเมื่อมีการสร้างหรืออัปเดต JWT (JSON Web Token)
  // เราใช้ส่วนนี้เพื่อฝังข้อมูลเพิ่มเติมลงใน Token (เช่น role, username)
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role;
      token.username = (user as any).username;
      token.image = (user as any).image;
      token.sessionId = (user as any).sessionId;
      token.loginTimestamp = Date.now(); // บันทึกเวลาที่ Login
    }
    return token;
  },

  // 2. session callback: ทำงานเมื่อแอปพลิเคชันเรียกใช้ข้อมูล Session (เช่น useSession())
  // เราจะดึงข้อมูลจาก JWT Token มาใส่ใน session.user เพื่อให้ฝั่ง Client เรียกใช้ได้
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).username = token.username;
      (session.user as any).image = token.image;
    }
    return session;
  },

  // 3. authorized: ใช้สำหรับตัดสินใจว่าผู้ใช้มีสิทธิ์เข้าถึงหน้านั้นๆ หรือไม่ผ่าน Middleware
  authorized({ auth, request: { nextUrl } }) {
    // ปิดการจัดการ Redirect อัตโนมัติใน Middleware ชั่วคราวเพื่อป้องกันปัญหา Redirect Loop
    // การเช็คสิทธิ์จะทำในแต่ละหน้าโดยตรงแทน
    return true;
  },

  // 4. redirect: กำหนด URL ที่จะส่งผู้ใช้ไปหลังจาก Login หรือLogout
  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    else if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },
};

// การตั้งค่า NextAuth หลัก
export const authConfig = {
  providers: [], // ปล่อยว่างไว้ที่นี่ เพราะจะไปกำหนดใน src/lib/auth.ts
  callbacks,
  session: { 
    strategy: "jwt", // ใช้ JWT เป็นกลยุทธ์ในการเก็บ Session
    maxAge: 30 * 24 * 60 * 60 // หมดอายุภายใน 30 วัน
  },
  pages: {
    signIn: "/login", // กำหนดหน้า Custom Login
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET, // รหัสลับสำหรับเข้ารหัส Token (จาก .env)
  debug: true, // เปิดโหมด Debug เพื่อดู Error ใน Console (ปิดได้เมื่อขึ้น Production)
} satisfies NextAuthConfig;

