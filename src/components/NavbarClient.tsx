"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import { NavItem } from "@/types/nav";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "next-auth/react";
import {
  FileText,
  UserCog,
  ChevronDown,
  LogOut,
  Command,
  Shield,
  Download,
  Bell,
  Check,
  Home,
  HardDrive,
  ClipboardList,
  Clock,
  CalendarCheck,
  Settings,
  Newspaper,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

/**
 * NavbarClient.tsx: คอมโพเนนต์แถบเมนูฝั่ง Client (จัดการ UI และ Interaction)
 *
 * หน้าที่:
 * 1. แสดงผลแถบเมนูลัด (Desktop & Mobile) พร้อมแอนิเมชันเมื่อ Scroll
 * 2. จัดการเมนู Dropdown ของผู้ใช้ (User Profile, Dashboard, Logout)
 * 3. ตรวจสอบสิทธิ์ (Permissions) เพื่อแสดง/ซ่อนรายการเมนูตามบทบาทของผู้ใช้
 * 4. รองรับการติดตั้ง Web App (PWA - Progressive Web App) ผ่าน deferredPrompt
 * 5. รวมฟังก์ชัน Theme Switching และระบบแจ้งเตือน (NotificationBell)
 */

type MenuItem = NavItem & {
  _id: string;
  children?: MenuItem[];
};

interface NavbarClientProps {
  menuTree: MenuItem[];
  username?: string;
  role?: string;
  image?: string;
  userId?: string;
  permissions?: {
    access_dashboard?: boolean;
    manage_users?: boolean;
    manage_news?: boolean;
    manage_attendance?: boolean;
    manage_system?: boolean;
    manage_qa?: boolean;
    manage_pages?: boolean;
    manage_attendance_dashboard?: boolean;
    manage_attendance_report?: boolean;
    manage_attendance_work_reports?: boolean;
    manage_attendance_leave_approvals?: boolean;
    manage_attendance_settings?: boolean;
    manage_roles_advanced?: boolean;
    manage_home?: boolean;
    manage_navbar?: boolean;
  } | null;
}

export default function NavbarClient({
  menuTree = [],
  username,
  role,
  image,
  userId,
  permissions,
}: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const pathname = usePathname();

  /**
   * getRoleDisplayName: แปลงชื่อ Role ในฐานข้อมูลเป็นชื่อภาษาไทยที่อ่านง่าย
   */
  const getRoleDisplayName = (r: string) => {
    switch (r) {
      case "super_admin":
        return "ผู้ดูแลระบบสูงสุด";
      case "admin":
        return "ผู้ดูแลระบบ";
      case "editor":
        return "บรรณาธิการ";
      case "hr":
        return "บุคลากร";
      case "director":
        return "ผู้อำนวยการ";
      case "staff":
        return "เจ้าหน้าที่";
      case "user":
        return "สมาชิก";
      case "student":
        return "นักเรียน";
      default:
        return r ? r.replace("_", " ") : "Member";
    }
  };

  const displayRole = getRoleDisplayName(role?.toLowerCase() || "");

  // --- ระบบตรวจสอบสิทธิ์ (Permission Logic) ---
  // ใช้ค่าจากฐานข้อมูล (permissions) ถ้าไม่มีให้ใช้ระบบตรวจสอบตาม Role พื้นฐาน
  const canAccessDashboard =
    permissions?.access_dashboard ??
    [
      "admin",
      "editor",
      "super_admin",
      "hr",
      "director",
      "deputy_resource",
      "deputy_strategy",
      "deputy_academic",
      "deputy_student_affairs",
    ].includes(role?.toLowerCase() || "");

  const canManageUsers = permissions?.manage_users ?? role?.toLowerCase() === "super_admin";
  const canManageNews =
    permissions?.manage_news ??
    ["super_admin", "admin", "editor"].includes(role?.toLowerCase() || "");
  const canManageAttendance =
    permissions?.manage_attendance ??
    ["super_admin", "hr", "director"].includes(role?.toLowerCase() || "");
  const canManageSystem = permissions?.manage_system ?? role?.toLowerCase() === "super_admin";
  const canManageQA =
    permissions?.manage_qa ?? ["super_admin", "admin"].includes(role?.toLowerCase() || "");
  const canManagePages =
    permissions?.manage_pages ??
    ["super_admin", "editor", "teacher", "janitor", "staff"].includes(role?.toLowerCase() || "");
  const canManageHome = permissions?.manage_home ?? role?.toLowerCase() === "super_admin";
  const canManageNavbar = permissions?.manage_navbar ?? role?.toLowerCase() === "super_admin";

  const canManageAttendanceDashboard =
    permissions?.manage_attendance_dashboard ?? role?.toLowerCase() === "super_admin";
  const canManageAttendanceReport =
    permissions?.manage_attendance_report ?? role?.toLowerCase() === "super_admin";
  const canManageAttendanceWorkReports =
    permissions?.manage_attendance_work_reports ?? role?.toLowerCase() === "super_admin";
  const canManageAttendanceLeaveApprovals =
    permissions?.manage_attendance_leave_approvals ?? role?.toLowerCase() === "super_admin";
  const canManageAttendanceSettings =
    permissions?.manage_attendance_settings ?? role?.toLowerCase() === "super_admin";
  const canManageRolesAdvanced =
    permissions?.manage_roles_advanced ?? role?.toLowerCase() === "super_admin";

  const isSuperAdmin = role?.toLowerCase() === "super_admin";
  const isAdmin = role?.toLowerCase() === "admin";

  useEffect(() => {
    // จัดการ Event เมื่อ Scroll เพื่อเปลี่ยนหน้าตา Navbar (Floating Effect)
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    // ฉีด CSS Styles สำหรับ Custom Scrollbar
    const customScrollbarStyles = `
      .custom-scrollbar-thin::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 10px; }
      .dark .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(82, 82, 91, 0.5); }
      .btn-press { transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1); }
      .btn-press:active { transform: scale(0.96); }
    `;

    if (!document.getElementById("navbar-custom-styles")) {
      const style = document.createElement("style");
      style.id = "navbar-custom-styles";
      style.innerHTML = customScrollbarStyles;
      document.head.appendChild(style);
    }

    // ปิดเมนูเมื่อคลิกนอกพื้นที่ (Click Outside)
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".desktop-menu-container") &&
        !target.closest(".user-dropdown-container")
      ) {
        setActiveMenuId(null);
        setIsUserDropdownOpen(false);
      }
    };

    // จัดการระบบ PWA Install
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      if (!deferredPrompt) setDeferredPrompt(e);
    };

    const handleAppInstalled = () => setDeferredPrompt(null);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [deferredPrompt]);

  /**
   * handleInstallClick: เรียกหน้าต่างติดตั้ง App (PWA)
   */
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    setActiveMenuId(null);
  };

  /**
   * handleLogout: จัดการการออกจากระบบ
   */
  const handleLogout = async () => {
    try {
      await fetch("/api/attendance/logout", { method: "POST" });
    } catch (_) {}
    await signOut({ callbackUrl: "/login" });
  };

  const ensureAbsolute = (path: string) => {
    if (!path || path.startsWith("/") || path.startsWith("http") || path.startsWith("#"))
      return path || "#";
    return `/${path}`;
  };

  // กรองรายการเมนูตามสิทธิ์การเข้าถึงของผู้ใช้
  const filteredMenuTree = menuTree.filter((item) => {
    const path = item.path || "";
    const isStaff = !["user", "student"].includes(role?.toLowerCase() || "");
    if (path === "/wfh" && !isStaff) return false;
    if (path === "/dashboard/drive" && !isStaff) return false;
    if (path.startsWith("/dashboard") && !canAccessDashboard) return false;
    if (path.startsWith("/attendance-dashboard") && !canManageAttendanceDashboard) return false;
    if (path.startsWith("/attendance-report") && !canManageAttendanceReport) return false;
    if (path.startsWith("/leave-approvals") && !canManageAttendanceLeaveApprovals) return false;
    if (path.startsWith("/work-reports") && !canManageAttendanceWorkReports) return false;
    if (path.startsWith("/manage-roles") && !canManageRolesAdvanced) return false;
    if (path.startsWith("/attendance-settings") && !canManageAttendanceSettings) return false;
    return true;
  });

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-9999 transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled ? "pt-1 sm:pt-2 px-2 sm:px-2 lg:px-2" : ""}`}
    >
      <nav
        className={`w-full max-w-[1600px] mx-auto transition-[padding,background-color,box-shadow,border-radius,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "bg-white dark:bg-zinc-950 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 py-2 px-4 lg:px-6 ring-1 ring-zinc-900/5 dark:ring-white/5"
            : "py-3 px-4 lg:px-6 bg-white dark:bg-zinc-950 border border-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* --- 1. LOGO & BRANDING --- */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group outline-none">
            <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 drop-shadow-sm">
              <Image
                src="/images/favicon.ico"
                alt="KTL Logo"
                fill
                sizes="40px"
                priority
                className="object-contain"
              />
            </div>
            <span className="text-zinc-900 dark:text-white font-black text-[22px] tracking-tighter uppercase italic drop-shadow-sm hidden sm:block">
              KTL<span className="text-blue-600 dark:text-blue-500">TC</span>
            </span>
          </Link>

          {/* --- 2. DESKTOP NAVIGATION (รายการเมนูจาก DB) --- */}
          <div className="hidden lg:flex items-center gap-1.5 desktop-menu-container">
            {filteredMenuTree.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isActiveNode =
                pathname === ensureAbsolute(item.path) || activeMenuId === item._id;

              return (
                <div
                  key={item._id}
                  className="relative"
                  onMouseEnter={() => setActiveMenuId(item._id)}
                  onMouseLeave={() => setActiveMenuId(null)}
                >
                  <Link
                    href={hasChildren ? "#" : ensureAbsolute(item.path) || "#"}
                    className={`px-3 py-2 rounded-full flex items-center gap-1 text-[14px] font-bold transition-all whitespace-nowrap outline-none ${
                      isActiveNode
                        ? "text-blue-700 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-500/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100/80 dark:hover:text-white dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="px-1">{item.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${activeMenuId === item._id ? "rotate-180 text-blue-600 dark:text-blue-400" : "opacity-40"}`}
                      />
                    )}
                  </Link>

                  {/* Mega Menu / Dropdown Content */}
                  {hasChildren && (
                    <div
                      className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top ${
                        activeMenuId === item._id
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto z-9999"
                          : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                      }`}
                    >
                      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] min-w-[240px] p-2 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5">
                        {item.children!.map((child) => (
                          <Link
                            key={child._id}
                            href={ensureAbsolute(child.path) || "#"}
                            onClick={() => setActiveMenuId(null)}
                            className="block px-4 py-3 text-[14px] font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-blue-50/80 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-400 rounded-2xl transition-all"
                          >
                            {child.label}
                          </Link>
                        ))}
                        {/* ปุ่มติดตั้ง PWA เฉพาะในเมนู 'อื่นๆ' */}
                        {item.label === "อื่นๆ" && deferredPrompt && (
                          <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                            <button
                              onClick={handleInstallClick}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                            >
                              <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                <Download size={18} />
                              </div>
                              ติดตั้งแอพพลิเคชั่น
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- 3. ACTIONS & USER SECTION (ขวาสุด) --- */}
          <div className="flex items-center gap-3 shrink-0 h-10">
            {userId && (
              <div className="flex items-center justify-center w-10 h-10">
                <NotificationBell />
              </div>
            )}
            <div className="hidden sm:flex items-center justify-center w-10 h-10">
              <ThemeToggle />
            </div>

            <div className="hidden lg:block w-px h-6 bg-zinc-200/80 dark:bg-zinc-800/80 mx-1" />

            {userId ? (
              <div
                className="relative user-dropdown-container"
                onMouseEnter={() => setIsUserDropdownOpen(true)}
                onMouseLeave={() => setIsUserDropdownOpen(false)}
              >
                {/* ปุ่มแสดงโปรไฟล์ผู้ใช้ (User Profile Button) */}
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                    setActiveMenuId(null);
                  }}
                  className={`flex items-center gap-3 p-1.5 pr-4 rounded-full border transition-all duration-300 outline-none ${
                    isUserDropdownOpen
                      ? "bg-white dark:bg-zinc-900 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-2 ring-blue-500/20"
                      : "bg-white/50 dark:bg-zinc-900/30 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 shadow-sm hover:shadow"
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-sm shrink-0">
                    {image ? (
                      <Image
                        src={image}
                        alt={username || "User"}
                        fill
                        sizes="36px"
                        priority
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold uppercase">
                        {(username || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left hidden lg:block overflow-hidden">
                    <p
                      className={`text-[9px] font-black uppercase leading-none mb-0.5 tracking-widest ${isSuperAdmin ? "text-sky-600 dark:text-sky-400" : isAdmin ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {displayRole}
                    </p>
                    <p className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                      {username}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 hidden lg:block ${isUserDropdownOpen ? "rotate-180 text-blue-500" : "text-zinc-400"}`}
                  />
                </button>

                {/* เมนู Dropdown สำหรับผู้ใช้ (User Dropdown Menu) */}
                <div
                  className={`absolute right-0 top-full pt-3 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
                    isUserDropdownOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto z-60"
                      : "opacity-0 translate-y-3 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[28px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] overflow-hidden w-72 ring-1 ring-black/5 dark:ring-white/5 flex flex-col max-h-[85vh] custom-scrollbar-thin">
                    {/* ข้อมูลสรุปผู้ใช้ด้านบนสุด (Profile Header) */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md shrink-0">
                          {image ? (
                            <Image
                              src={image}
                              alt={username || "User"}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-lg font-black">
                              {(username || "U").charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-1 inline-block ${isSuperAdmin ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" : isAdmin ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}
                          >
                            {displayRole}
                          </span>
                          <h3 className="text-[15px] font-black text-zinc-900 dark:text-white leading-none truncate">
                            {username}
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={userId ? `/dashboard/profile/${userId}` : "/dashboard/profile"}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow transition-all"
                        >
                          <UserCog className="w-3.5 h-3.5" /> โปรไฟล์
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>

                    {/* รายการเมนูจัดการระบบ (Dashboard & Admin) */}
                    <div className="p-3 space-y-4 overflow-y-auto">
                      <div>
                        <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-2 pl-2 flex items-center gap-2">
                          <Command className="w-3 h-3" /> เมนูหลัก
                        </h4>

                        {/* ปุ่มจัดการข่าวสารแบบด่วน (Featured Quick Action) */}
                        {canManageNews && (
                          <Link
                            href="/dashboard/news"
                            className="group relative flex items-center gap-4 p-4 mb-4 rounded-[22px] bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                              <Newspaper size={48} strokeWidth={1.5} />
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-inner">
                              <Newspaper size={20} />
                            </div>
                            <div className="relative z-10">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">
                                Content Center
                              </p>
                              <h4 className="text-sm font-black uppercase tracking-tight">
                                จัดการข่าวสาร / ประชาสัมพันธ์
                              </h4>
                            </div>
                          </Link>
                        )}

                        <Link
                          href="/"
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                        >
                          <Home className="w-5 h-5" /> หน้าแรก
                        </Link>

                        <div className="space-y-0.5">
                          {canAccessDashboard && (
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-all group"
                            >
                              <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors shadow-sm">
                                <Command size={16} />
                              </div>
                              เข้าสู่ระบบ Dashboard
                            </Link>
                          )}
                          {!["student"].includes(role?.toLowerCase() || "") && (
                            <Link
                              href="/dashboard/drive"
                              className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-2xl transition-all group"
                            >
                              <div className="p-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors shadow-sm">
                                <HardDrive size={16} />
                              </div>
                              คลังไฟล์งาน (Drive)
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* ส่วนการจัดการระบบ (Admin & Executive Section) */}
                      {(canManageAttendance ||
                        canManageUsers ||
                        canManageSystem ||
                        canManageNews ||
                        canManageQA) && (
                        <div>
                          {!["user", "student"].includes(role?.toLowerCase() || "") && (
                            <h4 className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-[0.3em] mb-2 pl-2 flex items-center gap-2">
                              <Shield className="w-3 h-3" /> ระบบจัดการ
                            </h4>
                          )}

                          {/* การ์ดเมนูเฉพาะ Super Admin */}
                          {isSuperAdmin && (
                            <div className="bg-sky-50/70 dark:bg-sky-500/5 rounded-2xl p-2 mb-2 border border-sky-100 dark:border-sky-500/10 space-y-0.5">
                              <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest px-2 py-1 flex items-center gap-1.5">
                                <Shield size={12} /> เฉพาะ Super Admin
                              </p>
                              <Link
                                href="/dashboard/super-admin"
                                className="flex items-center gap-3 px-3 py-2 text-[16px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl transition-all"
                              >
                                <Shield size={14} /> ศูนย์ควบคุมจัดการระบบ
                              </Link>
                              <Link
                                href="/dashboard/permissions"
                                className="flex items-center gap-3 px-3 py-2 text-[13px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all"
                              >
                                <Shield size={14} /> จัดการสิทธิ์แต่ละระดับ
                              </Link>
                            </div>
                          )}

                          {/* ระบบลงเวลาและรายงาน (Attendance & Reports) */}
                          {(isSuperAdmin ||
                            canManageAttendanceDashboard ||
                            canManageAttendanceReport ||
                            canManageAttendanceWorkReports ||
                            canManageAttendanceLeaveApprovals ||
                            canManageRolesAdvanced ||
                            canManageAttendanceSettings) && (
                            <div className="space-y-0.5">
                              {(isSuperAdmin || canManageAttendanceDashboard) && (
                                <Link
                                  href="/attendance-dashboard"
                                  className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                                >
                                  <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shadow-sm">
                                    <Bell size={14} />
                                  </div>
                                  ภาพรวมลงเวลาบุคลากร
                                </Link>
                              )}
                              {isSuperAdmin && (
                                <Link
                                  href="/dashboard/data-management"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <ClipboardList size={14} className="opacity-40" /> ข้อมูลลงเวลา
                                </Link>
                              )}
                              {(isSuperAdmin || canManageAttendanceReport) && (
                                <Link
                                  href="/attendance-report"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <Clock size={14} className="opacity-40" /> ออกรายงานสรุป
                                </Link>
                              )}
                              {(isSuperAdmin || canManageAttendanceWorkReports) && (
                                <Link
                                  href="/work-reports"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <FileText size={14} className="opacity-40" /> ตรวจสอบรายงานงาน
                                </Link>
                              )}
                              {(isSuperAdmin || canManageAttendanceLeaveApprovals) && (
                                <Link
                                  href="/leave-approvals"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <CalendarCheck size={14} className="opacity-40" /> อนุมัติใบลา
                                </Link>
                              )}
                              {(isSuperAdmin || canManageRolesAdvanced) && (
                                <Link
                                  href="/manage-roles"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <UserCog size={14} className="opacity-40" /> กำหนดบทบาท
                                </Link>
                              )}
                              {(isSuperAdmin || canManageAttendanceSettings) && (
                                <Link
                                  href="/attendance-settings"
                                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                >
                                  <Settings size={14} className="opacity-40" /> ตั้งค่าเวลาเข้างาน
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ส่วนท้ายเมนู (Footer) */}
                    <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/30">
                      <div className="flex items-center justify-between text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest px-2">
                        <span>KTL Management</span>
                        <span>v3.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ปุ่มเข้าสู่ระบบ (Sign In Button) สำหรับ Guest */
              <Link
                href="/login"
                className="relative overflow-hidden px-6 py-2.5 rounded-full bg-linear-to-b from-blue-500 to-blue-600 text-white text-[15px] font-bold transition-all hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] active:scale-95 border border-blue-400/20 shadow-sm"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* ปุ่ม Mobile Menu (แสดงเฉพาะบนจอเล็ก) */}
            <div className="lg:hidden sm:pl-2">
              <MobileMenu
                menuTree={filteredMenuTree}
                image={image}
                deferredPrompt={deferredPrompt}
                onInstall={handleInstallClick}
                username={username}
                role={role}
                userId={userId}
                permissions={permissions}
              />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
