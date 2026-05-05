/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavItem } from "@/types/nav";
import ThemeToggle from "./ThemeToggle";
import { useSession, signOut } from "next-auth/react";
import {
  Clock,
  UserCog,
  ChevronRight,
  CheckCircle,
  FileText,
  Command,
  Shield,
  Home,
  Menu,
  X,
  LogOut,
  Download,
} from "lucide-react";

type MenuItem = NavItem & {
  children?: MenuItem[];
  _id: string;
};

export default function MobileMenu({
  menuTree = [],
  image,
  deferredPrompt,
  onInstall,
  userId,
}: {
  menuTree?: MenuItem[];
  image?: string;
  deferredPrompt?: any;
  onInstall?: () => void;
  userId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = (user as any)?.role?.toLowerCase() || "";
  const username = user?.name || (user as any)?.username || "ผู้ใช้งาน";

  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const ensureAbsolute = (path?: string) => {
    if (
      !path ||
      path.startsWith("/") ||
      path.startsWith("http") ||
      path.startsWith("#")
    )
      return path || "#";
    return `/${path}`;
  };

  const closeMenu = () => {
    setIsOpen(false);
    setTimeout(() => setOpenSubMenuId(null), 300);
  };

  const toggleSubMenu = (id: string) => {
    setOpenSubMenuId(openSubMenuId === id ? null : id);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const safeMenuTree = menuTree || [];

  const isSuperAdmin = userRole === "super_admin";
  const isAdmin = userRole === "admin" || userRole === "editor";
  const isHR = userRole === "hr" || userRole === "deputy_resource";
  const isExecutive =
    userRole === "director" ||
    [
      "deputy_resource",
      "deputy_strategy",
      "deputy_academic",
      "deputy_student_affairs",
    ].includes(userRole);

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
        return r.replace("_", " ");
    }
  };

  return (
    <div className="lg:hidden">
      {/* 1. Hamburger Button (Glass UI) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mounted &&
        createPortal(
          <div className="relative z-99999">
            {/* 2. Backdrop Overlay */}
            {isOpen && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={closeMenu}
              />
            )}

            {/* 3. Sliding Drawer */}
            <div
              className={`fixed inset-y-0 right-0 w-[85%] max-w-[340px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-2xl transform transition-transform duration-500 cubic-bezier(0.3, 0, 0, 1) flex flex-col ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              {/* Header - Close Button & Theme Toggle */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800/60 shadow-sm z-10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
                <ThemeToggle />
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors hover:scale-105 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-thin pb-12">
                {/* User Profile Section (Premium Glass Card) */}
                {status !== "loading" && user ? (
                  <div className="px-5 py-6 bg-linear-to-b from-blue-50/80 to-white dark:from-blue-950/20 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-xl shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            alt={username}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-bold uppercase">
                            {username.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-extrabold text-zinc-900 dark:text-white text-lg truncate tracking-tight">
                          {username}
                        </span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mt-0.5">
                          {getRoleDisplayName(userRole)}
                        </span>
                      </div>
                    </div>

                    {/* User Info Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-2.5">
                      <Link
                        href={userId ? `/dashboard/profile/${userId}` : "/dashboard/profile"}
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] transition-all group"
                      >
                        <UserCog className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        <span className="text-[10px] font-bold mt-1.5 text-zinc-600 dark:text-zinc-400">
                          โปรไฟล์
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] transition-all group"
                      >
                        <LogOut className="w-4 h-4 text-red-500/70 group-hover:text-red-500 transition-colors" />
                        <span className="text-[10px] font-bold mt-1.5 text-zinc-600 dark:text-zinc-400">
                          ออกจากระบบ
                        </span>
                      </button>
                    </div>
                  </div>
                ) : status !== "loading" && !user ? (
                  <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="flex items-center justify-center w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                ) : null}

                {/* MAIN NAVIGATION */}
                <div className="px-4 py-5 space-y-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-3">
                    เมนูหลัก
                  </p>

                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-3 py-3.5 rounded-xl font-bold text-[15px] transition-all group ${
                      pathname === "/"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${pathname === "/" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"}`}
                    >
                      <Home className="w-4 h-4" />
                    </div>
                    หน้าแรก
                  </Link>

                  {safeMenuTree.map((item) => {
                    const hasChildren =
                      item.children && item.children.length > 0;
                    const isSubMenuOpen = openSubMenuId === item._id;

                    return (
                      <div key={item._id} className="relative">
                        {hasChildren ? (
                          <>
                            <button
                              onClick={() => toggleSubMenu(item._id)}
                              className={`flex items-center justify-between px-3 py-3.5 w-full rounded-xl font-bold text-[15px] transition-all group ${
                                isSubMenuOpen
                                  ? "bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              }`}
                            >
                              <span className="flex items-center gap-3">
                                <span className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 transition-colors group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700">
                                  <Command className="w-4 h-4 opacity-70" />
                                </span>
                                {item.label}
                              </span>
                              <ChevronRight
                                className={`w-4 h-4 opacity-50 transition-transform duration-300 ${isSubMenuOpen ? "rotate-90" : ""}`}
                              />
                            </button>

                            <div
                              className={`grid transition-all duration-300 ease-in-out ${
                                isSubMenuOpen
                                  ? "grid-rows-[1fr] opacity-100"
                                  : "grid-rows-[0fr] opacity-0"
                              }`}
                            >
                              <div className="overflow-hidden flex flex-col pl-11 pr-2 pt-1 pb-2 space-y-1">
                                {item.children!.map((subItem) => (
                                  <Link
                                    key={subItem._id}
                                    href={ensureAbsolute(subItem.path)}
                                    onClick={closeMenu}
                                    className="px-4 py-3 rounded-lg text-[14px] font-semibold text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-zinc-800 transition-colors relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-zinc-300 dark:before:bg-zinc-700"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                                {item.label === "อื่นๆ" && deferredPrompt && (
                                  <button
                                    onClick={() => {
                                      if (onInstall) onInstall();
                                      closeMenu();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full before:bg-blue-300 dark:before:bg-blue-700"
                                  >
                                    <Download
                                      size={14}
                                      className="opacity-70"
                                    />
                                    ติดตั้งแอพพลิเคชั่น
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <Link
                            href={ensureAbsolute(item.path)}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 px-3 py-3.5 w-full rounded-xl font-bold text-[15px] transition-all group ${
                              pathname === ensureAbsolute(item.path)
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            }`}
                          >
                            <span
                              className={`p-1.5 rounded-lg transition-colors ${pathname === ensureAbsolute(item.path) ? "bg-blue-100 dark:bg-blue-900/30" : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"}`}
                            >
                              <CheckCircle className="w-4 h-4 opacity-70" />
                            </span>
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ADMIN / SYSTEM CONTROLS (Restored and Designed) */}
                {user && (isSuperAdmin || isAdmin || isHR || isExecutive) && (
                  <div className="px-4 py-6 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1 bg-zinc-50/30 dark:bg-zinc-900/10">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2 mb-4 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      ระบบจัดการองค์กรเฉพาะเจ้าหน้าที่
                    </p>

                    {/* Super Admin Area */}
                    {isSuperAdmin && (
                      <div className="mb-4 space-y-1 bg-sky-50 dark:bg-sky-500/5 rounded-2xl p-2 border border-sky-100 dark:border-sky-500/10">
                        <p className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest px-2 py-1">
                          เฉพาะ Super Admin
                        </p>
                        <Link
                          href="/dashboard/super-admin"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-[14px] text-sky-700 hover:bg-white dark:text-sky-300 dark:hover:bg-sky-900/40 transition-colors shadow-sm"
                        >
                          <Shield className="w-4 h-4" /> ศูนย์ควบคุมจัดการระบบ
                        </Link>
                        <Link
                          href="/dashboard/data-management"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-rose-700 dark:text-rose-400 hover:bg-white transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> แก้ไขข้อมูลการเข้างาน / ลา
                        </Link>
                        <Link
                          href="/work-reports-management"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-white transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> รายงานปฏิบัติงานทุกแผนก
                        </Link>
                        <Link
                          href="/dashboard/permissions"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-blue-700 dark:text-blue-400 hover:bg-white transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" /> จัดการสิทธิ์แต่ละระดับ
                        </Link>
                      </div>
                    )}

                    {/* Admin / Editor Dashboard */}
                    {(isSuperAdmin || isAdmin) && (
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3.5 rounded-xl font-black text-[14px] text-blue-700 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 transition-all active:scale-95 border border-blue-100 dark:border-blue-800/30"
                      >
                        <Command className="w-4 h-4" /> เข้าสู่ระบบ Dashboard
                      </Link>
                    )}

                    {/* HR / Executive Area */}
                    {(isSuperAdmin || isHR || isExecutive) && (
                      <div className="pt-2 space-y-1">
                        <Link
                          href="/attendance-dashboard"
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-[14px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          ภาพรวมลงเวลาบุคลากร
                        </Link>

                        {(isSuperAdmin || isHR || userRole === "director") && (
                          <>
                            <Link
                              href="/attendance-report"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              ระบบรายงานการเข้างาน
                            </Link>
                            <Link
                              href="/work-reports"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              ระบบรายงานปฏิบัติงาน
                            </Link>
                            <Link
                              href="/leave-approvals"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              จัดการอนุมัติใบลา
                            </Link>
                          </>
                        )}

                        {(isSuperAdmin || isHR) && (
                          <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">
                            <Link
                              href="/manage-roles"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <UserCog className="w-4 h-4" /> จัดการสิทธิ์บุคลากร
                            </Link>
                            <Link
                              href="/attendance-settings"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Clock className="w-4 h-4" /> ตั้งค่าเวลาเข้างาน
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
