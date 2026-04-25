import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const hasAuthError = !!(req.auth as any)?.error;
  const userRoleRaw = (req.auth?.user as any)?.role || "";
  const userRole = userRoleRaw.toLowerCase().replace(/[\s_]/g, ""); // ลบช่องว่างและขีดล่าง เพื่อความแม่นยำในการเช็ค (เช่น super admin -> superadmin)
  const pathname = nextUrl.pathname;

  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isWfhPage = pathname.startsWith("/wfh") || pathname.startsWith("/check-in") || pathname.startsWith("/leave-request");
  
  // แบ่งหมวดหมู่หน้า Admin เพื่อจัดการสิทธิ์แยกตามระดับ
  const isAttendanceDashboard = pathname.startsWith("/attendance-dashboard");
  const isFullAdminAttendance = pathname.startsWith("/attendance-report") || 
                               pathname.startsWith("/leave-approvals") || 
                               pathname.startsWith("/attendance-settings") ||
                               pathname.startsWith("/work-reports") ||
                               pathname.startsWith("/manage-roles");

  // 1. จัดการหน้า Login/Register (ถ้าเข้าแล้วให้ไป Dashboard)
  if (isAuthPage) {
    if (isLoggedIn && !hasAuthError) {
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
    return NextResponse.next();
  }

  // 2. ตรวจสอบการ Login สำหรับหน้าที่ต้องป้องกัน
  const isProtectedPath = isDashboardPage || isWfhPage || isAttendanceDashboard || isFullAdminAttendance;
  
  if (isProtectedPath && !isLoggedIn) {
    // เก็บ URL เดิมไว้เพื่อ redirect กลับมาหลัง login (ถ้าต้องการ)
    const loginUrl = new URL("/login", nextUrl.origin);
    // loginUrl.searchParams.set("callbackUrl", nextUrl.pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 3. การจัดการสิทธิ์ (RBAC)
  if (isLoggedIn) {
    // 3.1 สิทธิ์เข้าหน้า Dashboard (เฉพาะ Admin/Director/Staff/Deputy/HR)
    if (isAttendanceDashboard) {
      const allowedDashboardRoles = ["super_admin", "superadmin", "super admin", "admin", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "editor", "staff"];
      if (!allowedDashboardRoles.includes(userRoleRaw.toLowerCase())) {
        return NextResponse.redirect(new URL("/wfh", nextUrl.origin));
      }
    }

    // 3.2 สิทธิ์เข้าหน้าจัดการเต็มรูปแบบ (Report, Approvals, Settings, Work Reports, Manage Roles)
    if (isFullAdminAttendance) {
      const allowedFullAdminRoles = ["super_admin", "superadmin", "super admin", "admin", "hr", "director", "deputy_resource", "editor", "staff"];
      if (!allowedFullAdminRoles.includes(userRoleRaw.toLowerCase())) {
        return NextResponse.redirect(new URL("/attendance-dashboard", nextUrl.origin));
      }

      // 3.2b เฉพาะ super_admin เท่านั้นสำหรับฟีเจอร์ "จัดการรายงานลูกน้องทุกแผนก"
      if (pathname.startsWith("/work-reports-management")) {
        const superAdminRoles = ["super_admin", "superadmin", "super admin"];
        if (!superAdminRoles.includes(userRoleRaw.toLowerCase())) {
          return NextResponse.redirect(new URL("/attendance-dashboard", nextUrl.origin));
        }
      }
    }

    // 3.3 สิทธิ์เข้าหน้า Dashboard และหน้าจัดการระบบ
    if (isDashboardPage) {
      // ยกเว้นหน้า Profile ให้ทุกคนเข้าได้
      if (pathname === "/dashboard/profile") {
        return NextResponse.next();
      }

      const allowedDashboardRoles = ["super_admin", "superadmin", "super admin", "admin", "editor"];
      if (!allowedDashboardRoles.includes(userRoleRaw.toLowerCase())) {
        // ถ้าเป็นกลุ่มบริหาร/อาจารย์ ให้ไปหน้า Attendance Dashboard แทน
        const isStaffGroup = ["hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "staff", "teacher"].includes(userRoleRaw.toLowerCase());
        return NextResponse.redirect(new URL(isStaffGroup ? "/attendance-dashboard" : "/wfh", nextUrl.origin));
      }

      // 3.3b จำกัดเฉพาะ super_admin เท่านั้นสำหรับบางหน้า
      if (pathname.startsWith("/dashboard/users") || 
          pathname.startsWith("/dashboard/settings") ||
          pathname.startsWith("/dashboard/data-management")) {
        if (userRole !== "superadmin") {
          return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
        }
      }
    }

    // 3.4 กั้นหน้าจัดการเนื้อหาภาพรวม (ถ้าเป็น user ทั่วไปให้ดีดออก)
    if (pathname.startsWith("/dashboard/manage-all")) {
      if (userRole === "user") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/wfh/:path*",
    "/check-in/:path*",
    "/attendance-dashboard/:path*",
    "/attendance-report/:path*",
    "/attendance-settings/:path*",
    "/leave-approvals/:path*",
    "/work-reports/:path*",
    "/manage-roles/:path*",
    "/login",
    "/register",
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
