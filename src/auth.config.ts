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
    const isLoggedIn = !!auth?.user;
    const { pathname } = nextUrl;
    const folderId = nextUrl.searchParams.get("folderId");

    // อนุญาตให้ทุกคน (รวมถึงผู้ที่ไม่สิทธิ์ หรือผู้ที่ยังไม่ได้ Login) สามารถเข้าถึงโฟลเดอร์แชร์ใน Drive ได้โดยตรง
    if (pathname === "/dashboard/drive" && folderId) {
      return true;
    }

    // รายการเส้นทางที่ต้องมีการเข้าสู่ระบบก่อน (Protected Routes)
    const protectedPrefixes = [
      "/dashboard",
      "/manage-roles",
      "/attendance-dashboard",
      "/attendance-report",
      "/leave-approvals",
      "/attendance-settings",
      "/work-reports",
      "/work-reports-management",
      "/flagpole",
    ];

    // หน้าของนักเรียน/นักศึกษา
    if (pathname.startsWith("/student")) {
      // ยกเว้นหน้าตรวจสอบประวัติเรียน (verify) ให้เข้าถึงได้แบบสาธารณะสำหรับผู้ปกครอง
      if (pathname === "/student/verify") {
        return true;
      }
      if (!isLoggedIn) {
        return false; // บังคับให้เข้าสู่ระบบก่อน
      }
      return true;
    }

    const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (isProtected) {
      if (!isLoggedIn) {
        // หากยังไม่ได้เข้าสู่ระบบ ให้ส่งไปหน้า Login โดย NextAuth จะจัดการ Redirect พร้อม callbackUrl ให้อัตโนมัติ
        return false;
      }

      // ดึงสิทธิ์/บทบาทของผู้ใช้งาน
      const role = (auth?.user as any)?.role?.toLowerCase();

      // สิทธิ์พื้นฐานอย่าง 'student' หรือ 'user' ไม่มีสิทธิ์เข้าถึงหน้าควบคุมระบบ (Dashboard/Admin) ใดๆ ทั้งสิ้น
      // ยกเว้นหน้าโปรไฟล์ (/dashboard/profile), หน้าแชท (/dashboard/chat) และหน้าสมาชิก (/dashboard/members)
      if (role === "student" || role === "user") {
        if (!pathname.startsWith("/dashboard/profile") && !pathname.startsWith("/dashboard/chat") && !pathname.startsWith("/dashboard/members")) {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      // หน้าที่มีความปลอดภัยสูงและจำเป็นต้องเป็น Super Admin เท่านั้น
      const superAdminOnlyRoutes = [
        "/dashboard/permissions",
        "/dashboard/super-admin",
        "/manage-roles",
        "/attendance-settings",
      ];
      const isSuperAdminRoute = superAdminOnlyRoutes.some((route) => pathname.startsWith(route));

      if (isSuperAdminRoute && role !== "super_admin") {
        // ถ้าไม่ใช่ super_admin แต่พยายามเข้าหน้าสำหรับ super_admin ให้เด้งกลับไปที่หน้า dashboard ทั่วไป
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
    }

    // หากผู้ใช้ Login อยู่แล้ว และพยายามจะเข้าหน้า Login ให้ Redirect ไปหน้าหลัก
    if (pathname === "/login") {
      if (isLoggedIn) {
        const role = (auth?.user as any)?.role?.toLowerCase();
        const callbackUrl = nextUrl.searchParams.get("callbackUrl");

        if (callbackUrl) {
          if (role === "student") {
            // ถ้านักเรียนมี callbackUrl ไปที่หน้า student, หน้าโปรไฟล์, หน้าแชท หรือหน้าสมาชิก ให้เข้าได้ หรือถ้าไม่ใช่ ให้ดีดไปหน้าแรก
            if (callbackUrl.startsWith("/student") || callbackUrl.startsWith("/dashboard/profile") || callbackUrl.startsWith("/dashboard/chat") || callbackUrl.startsWith("/dashboard/members")) {
              return Response.redirect(new URL(callbackUrl, nextUrl));
            }
            return Response.redirect(new URL("/", nextUrl));
          }
          // สิทธิ์ปกติ (user) ไม่ควรเข้าหน้าควบคุมระบบ (Dashboard/Admin) ยกเว้นหน้าโปรไฟล์, หน้าแชท และหน้าสมาชิก
          if (
            role === "user" &&
            !callbackUrl.startsWith("/dashboard/profile") &&
            !callbackUrl.startsWith("/dashboard/chat") &&
            !callbackUrl.startsWith("/dashboard/members") &&
            (callbackUrl.startsWith("/dashboard") ||
              callbackUrl.startsWith("/manage-roles") ||
              callbackUrl.startsWith("/attendance-"))
          ) {
            return Response.redirect(new URL("/", nextUrl));
          }
          return Response.redirect(new URL(callbackUrl, nextUrl));
        }

        if (role === "student") {
          return Response.redirect(new URL("/", nextUrl));
        } else if (role === "user") {
          return Response.redirect(new URL("/", nextUrl));
        } else {
          return Response.redirect(new URL("/", nextUrl));
        }
      }
    }

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
    maxAge: 30 * 24 * 60 * 60, // หมดอายุภายใน 30 วัน
  },
  pages: {
    signIn: "/login", // กำหนดหน้า Custom Login
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET, // รหัสลับสำหรับเข้ารหัส Token (จาก .env)
  debug: true, // เปิดโหมด Debug เพื่อดู Error ใน Console (ปิดได้เมื่อขึ้น Production)
} satisfies NextAuthConfig;
