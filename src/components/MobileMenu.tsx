"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Home,
  Newspaper,
  Calendar,
  Users,
  MessageSquare,
  LayoutDashboard,
  Shield,
  FileText,
  User,
  LogOut,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Bell,
  Settings,
  Command,
  Activity,
  Globe,
  HardDrive,
  Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";

/**
 * MobileMenu.tsx: ระบบเมนูแบบ Drawer สำหรับอุปกรณ์พกพา
 *
 * หน้าที่:
 * 1. แสดงผลแถบเมนูข้าง (Drawer) เมื่อผู้ใช้คลิกปุ่มแฮมเบอร์เกอร์
 * 2. รองรับการแสดงผลเมนูแบบลำดับขั้น (Nested/Recursive Menu) จากฐานข้อมูล
 * 3. จัดการการเข้าถึงเมนูต่างๆ ตามสิทธิ์และบทบาทของผู้ใช้ (Permissions/Roles)
 * 4. รวมปุ่มลัดสำหรับ Dashboard, โปรไฟล์ และการออกจากระบบ
 * 5. ใช้ Framer Motion เพื่อสร้างแอนิเมชันการสไลด์เปิด-ปิดที่ลื่นไหล
 */

interface MobileMenuProps {
  menuTree: any[];
  image?: string;
  deferredPrompt?: any;
  onInstall?: () => void;
  username?: string;
  role?: string;
  userId?: string;
  permissions?: any;
}

export default function MobileMenu({
  menuTree,
  image,
  deferredPrompt,
  onInstall,
  username,
  role,
  userId,
  permissions,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const roleLower = role?.toLowerCase() || "user";
  const isSuperAdmin = roleLower === "super_admin";
  const isAdmin = roleLower === "admin" || isSuperAdmin;
  const isHR = roleLower === "hr" || roleLower === "director" || isSuperAdmin;
  const isExecutive = roleLower === "director" || roleLower?.startsWith("deputy_") || isSuperAdmin;

  const canAccessDashboard = permissions?.access_dashboard || isAdmin || isHR || isExecutive;

  const closeMenu = () => setIsOpen(false);

  // สลับการแสดงผลเมนูย่อย (Expand/Collapse)
  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const ensureAbsolute = (path: string) => {
    if (!path || path.startsWith("/") || path.startsWith("http") || path.startsWith("#"))
      return path || "#";
    return `/${path}`;
  };

  /**
   * RecursiveMenuItem: คอมโพเนนต์ย่อยสำหรับเรนเดอร์เมนูที่ซ้อนกันหลายชั้น
   */
  const RecursiveMenuItem = ({ item, level = 0 }: { item: any; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item._id);
    const isActive = pathname === ensureAbsolute(item.path);

    return (
      <div className="mb-0.5">
        {hasChildren ? (
          <button
            onClick={() => toggleMenu(item._id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              isExpanded
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <span className="flex items-center gap-3">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isExpanded ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
              />
              {item.label}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : "opacity-40"}`}
            />
          </button>
        ) : (
          <Link
            href={ensureAbsolute(item.path)}
            onClick={closeMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-zinc-300 dark:bg-zinc-700"}`}
            />
            {item.label}
          </Link>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-5 pl-4 border-l-2 border-blue-500/20 mt-1 space-y-0.5"
            >
              {item.children.map((child: any) => (
                <RecursiveMenuItem key={child._id} item={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* ปุ่มกดเปิดเมนู (Hamburger Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* ฉากหลังสีดำจางๆ (Overlay) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-998"
            />

            {/* ส่วนของเมนูข้าง (Menu Drawer) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-zinc-950 z-999 shadow-2xl flex flex-col"
            >
              {/* ส่วนหัวเมนู (Drawer Header) */}
              <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-600/20">
                    K
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                      KTLTC
                    </h2>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* ส่วนเนื้อหาเมนู (Drawer Content) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* ข้อมูลผู้ใช้และบทบาท (User Profile Section) */}
                {userId ? (
                  <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md">
                        {image ? (
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-black">
                            {username?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 inline-block">
                          {role}
                        </span>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-none truncate max-w-[150px]">
                          {username}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard/profile"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 shadow-sm"
                      >
                        <User className="w-3.5 h-3.5" /> โปรไฟล์
                      </Link>
                      <button
                        onClick={async () => {
                          signOut({ callbackUrl: "/login" });
                        }}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    <User className="w-5 h-5" /> Sign In to System
                  </Link>
                )}

                {/* รายการเมนูหลัก (Navigation Group) */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> เมนูหลัก
                    </h4>
                    <div className="space-y-1">
                      <Link
                        href="/"
                        onClick={closeMenu}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                      >
                        <Home className="w-5 h-5" /> หน้าแรก
                      </Link>

                      {userId && (
                        <Link
                          href="/dashboard/chat"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/dashboard/chat" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                        >
                          <MessageSquare className="w-5 h-5" /> ระบบแชท / กล่องข้อความ
                        </Link>
                      )}

                      {canAccessDashboard && (
                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                        >
                          <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                      )}

                      {!["student"].includes(roleLower) && (
                        <Link
                          href="/dashboard/drive"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/dashboard/drive" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                        >
                          <HardDrive className="w-5 h-5" /> คลังไฟล์งาน (Drive)
                        </Link>
                      )}

                      {roleLower === "student" && (
                        <Link
                          href="/student/flagpole"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/student/flagpole" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                        >
                          <Activity className="w-5 h-5" /> เช็คชื่อเข้าแถว
                        </Link>
                      )}

                      {/* รายการจัดการพิเศษสำหรับ Super Admin */}
                      {isSuperAdmin && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                          <Link
                            href="/dashboard/super-admin"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[16px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/40 transition-colors"
                          >
                            <Shield className="w-4 h-4" /> ศูนย์ควบคุมจัดการระบบ
                          </Link>
                          <Link
                            href="/dashboard/permissions"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[16px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/40 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" /> จัดการสิทธิ์แต่ละระดับ
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* เมนูเว็บไซต์ที่ดึงจากฐานข้อมูล (Dynamic Menu) */}
                  {menuTree && menuTree.length > 0 && (
                    <div>
                      {!["user", "student"].includes(roleLower) && (
                        <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-2 flex items-center gap-2">
                          <Globe className="w-3 h-3" /> เมนูเว็บไซต์
                        </h4>
                      )}
                      <div className="space-y-0.5">
                        {menuTree.map((item: any) => (
                          <RecursiveMenuItem key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ส่วนล่างสุดของเมนู (Footer) */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                  <span>KTL by AllMaster</span>
                  <span>v3.2026</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
