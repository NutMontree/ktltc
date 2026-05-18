import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * middleware.ts: ไฟล์ที่เป็น Middleware ของระบบตรวจสอบสิทธิ์และกรองเส้นทาง (Next.js Middleware)
 * 
 * หน้าที่: 
 * 1. ตรวจสอบ Session ของผู้ใช้ในทุกการเข้าถึง (Request) ตามเส้นทางที่ระบุใน matcher
 * 2. ทำงานร่วมกับ auth.config.ts เพื่อควบคุมการนำทาง (Routing) และระบบรักษาความปลอดภัยฝั่ง Server
 * 3. ดักและป้องกันหน้าควบคุมระบบ (Dashboard/Admin) ไม่ให้ผู้ใช้ที่ไม่มีสิทธิ์เข้าถึงได้โดยตรง
 */

export default NextAuth(authConfig).auth;

export const config = {
  // matcher: กำหนดเส้นทาง (Path) ที่ Middleware จะทำงาน
  // ในที่นี้คือทำงานทุกหน้า "ยกเว้น" api, _next/static, _next/image, images, และ favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};

