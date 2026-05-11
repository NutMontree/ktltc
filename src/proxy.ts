import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * proxy.ts: ไฟล์ที่เป็น Middleware ตัวจริงของระบบ (ชื่อเดิมคือ middleware.ts)
 * 
 * หน้าที่: 
 * 1. ตรวจสอบ Session ของผู้ใช้ในทุกการร้องขอ (Request) ตามที่ระบุไว้ใน matcher
 * 2. ทำงานร่วมกับ auth.config.ts เพื่อตัดสินใจว่าจะอนุญาตให้เข้าถึงหน้านั้นๆ หรือไม่
 * 3. ป้องกันหน้าเว็บไซต์ที่ต้องมีการ Login ก่อนเข้าใช้งาน
 * 
 * ทำไมต้องชื่อ proxy.ts?: 
 * - ใน Next.js บางเวอร์ชันหรือการตั้งค่าบางอย่าง การใช้ชื่อ middleware.ts อาจติดปัญหาเรื่องการจดจำ
 * - การแยกออกมาเป็นไฟล์เฉพาะช่วยให้จัดการการส่งผ่าน (Proxy) ของการตรวจสอบสิทธิ์ได้ง่ายขึ้น
 */

export default NextAuth(authConfig).auth;

export const config = {
  // matcher: กำหนดเส้นทาง (Path) ที่ Middleware จะทำงาน
  // ในที่นี้คือทำงานทุกหน้า "ยกเว้น" api, _next/static, _next/image, images, และ favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};

