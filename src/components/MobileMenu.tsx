"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
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
  UserCog,
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
  GraduationCap,
  BookOpen,
  Download,
} from "lucide-react";
import { logoutAction } from "@/app/actions";
import { getMenuIcon } from "./NavbarClient";

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

  const roleLower = role?.toLowerCase() || "";
  const isSuperAdmin = roleLower === "super_admin";
  const isAdmin = roleLower === "admin" || isSuperAdmin;
  const isStaff = !["user", "student"].includes(roleLower);

  const canAccessDashboard = permissions?.access_dashboard || isAdmin || isStaff;
  const canManageNews = permissions?.manage_news || isAdmin;
  const canManageAttendance = permissions?.manage_attendance || isAdmin;
  const canManageUsers = permissions?.manage_users || isAdmin;
  const canManageSystem = permissions?.manage_system || isSuperAdmin;

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
    const IconComponent = getMenuIcon(item.label);

    return (
      <div className="mb-0.5">
        {hasChildren ? (
          <button
            onClick={() => toggleMenu(item._id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isExpanded
                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-7 h-7 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <IconComponent size={15} />
              </span>
              {item.label}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : "opacity-40"}`}
            />
          </button>
        ) : (
          <Link
            href={ensureAbsolute(item.path)}
            onClick={closeMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
          >
            <span className={`w-7 h-7 flex items-center justify-center rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
              <IconComponent size={15} />
            </span>
            {item.label}
          </Link>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-4 pl-3 border-l-2 border-blue-500/20 mt-1 space-y-0.5"
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
    <div className="mobile-menu-root shrink-0">
      {/* ปุ่มกดเปิดเมนู (Hamburger Button) */}
      <button
        type="button"
        aria-label="เปิดเมนู"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mounted && typeof document !== "undefined" ? createPortal(
        <AnimatePresence>
        {isOpen && (
          <>
            {/* ฉากหลังสีดำจางๆ (Overlay) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="mobile-menu-root fixed inset-0 bg-black/60 backdrop-blur-sm z-9999"
            />

            {/* ส่วนของเมนูข้าง (Menu Drawer) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="mobile-menu-root fixed top-0 right-0 bottom-0 w-[88%] max-w-sm bg-white dark:bg-zinc-950 z-10000 shadow-2xl flex flex-col"
            >
              {/* ส่วนหัวเมนู (Drawer Header) */}
              <div className="p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <img
                      src="/images/favicon.ico"
                      alt="KTLTC Logo"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                      KTL<span className="text-blue-600 dark:text-blue-500">TC</span>
                    </h2>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ส่วนเนื้อหาเมนู (Drawer Content) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* ข้อมูลผู้ใช้และบทบาท (User Profile Section) */}
                {userId ? (
                  <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md shrink-0">
                        {image ? (
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-lg font-black uppercase">
                            {username?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 inline-block">
                          {role}
                        </span>
                        <h3 className="text-base font-black text-zinc-900 dark:text-white leading-none truncate">
                          {username}
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/dashboard/profile/${userId}`}
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700 shadow-sm"
                      >
                        <UserCog className="w-3.5 h-3.5" /> โปรไฟล์
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await logoutAction();
                          } catch (err) {
                            console.error("Logout error:", err);
                            window.location.href = "/login";
                          }
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
                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    <User className="w-5 h-5" />
                    ลงชื่อเข้าใช้ระบบ
                  </Link>
                )}

                {/* ส่วนลัดจัดการระบบ & Tools (Matching PC User Dropdown) */}
                {userId && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] pl-2 flex items-center gap-2">
                      <Command className="w-3 h-3" /> เครื่องมือผู้ใช้
                    </h4>

                    {/* การ์ดจัดการข่าวสาร */}
                    {canManageNews && (
                      <Link
                        href="/dashboard/news"
                        onClick={closeMenu}
                        className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                      >
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                          <Newspaper size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">
                            Content Center
                          </p>
                          <h4 className="text-xs font-black uppercase tracking-tight">
                            จัดการข่าวสาร / ประชาสัมพันธ์
                          </h4>
                        </div>
                      </Link>
                    )}

                    {/* Super Admin & Permissions */}
                    {isSuperAdmin && (
                      <div className="bg-sky-50/70 dark:bg-sky-500/5 rounded-2xl p-2 border border-sky-100 dark:border-sky-500/10 space-y-1">
                        <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest px-2 py-0.5 flex items-center gap-1.5">
                          <Shield size={12} /> เครื่องมือผู้ดูแล
                        </p>
                        <Link
                          href="/dashboard/super-admin"
                          onClick={closeMenu}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl"
                        >
                          <Shield size={14} /> ศูนย์ควบคุมจัดการระบบ
                        </Link>
                        <Link
                          href="/dashboard/permissions"
                          onClick={closeMenu}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl"
                        >
                          <Shield size={14} /> จัดการสิทธิ์แต่ละระดับ
                        </Link>
                      </div>
                    )}

                    {/* Link Dashboard */}
                    {canAccessDashboard && (
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 rounded-2xl"
                      >
                        <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                          <Command size={16} />
                        </div>
                        เข้าสู่ระบบ Dashboard
                      </Link>
                    )}

                    {/* Chat & Drive */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/dashboard/chat"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 text-[12px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 rounded-xl border border-sky-100 dark:border-sky-800/30"
                      >
                        <MessageSquare size={14} /> ระบบแชท
                      </Link>
                      {isStaff && (
                        <Link
                          href="/dashboard/drive"
                          onClick={closeMenu}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 text-[12px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-800/30"
                        >
                          <HardDrive size={14} /> คลังไฟล์งาน
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* รายการเมนูหลัก (Navigation Group) */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-3 pl-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> เมนูหลัก
                    </h4>
                    <div className="space-y-1">
                      <Link
                        href="/"
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                      >
                        <span className={`w-7 h-7 flex items-center justify-center rounded-xl ${pathname === "/" ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                          <Home size={15} />
                        </span>
                        หน้าแรก
                      </Link>

                      <Link
                        href="/about"
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${pathname === "/about" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
                      >
                        <span className={`w-7 h-7 flex items-center justify-center rounded-xl ${pathname === "/about" ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
                          <Globe size={15} />
                        </span>
                        เกี่ยวกับเรา / ติดต่อเรา
                      </Link>
                    </div>
                  </div>

                  {menuTree && menuTree.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-3 pl-2 flex items-center gap-2">
                        <Globe className="w-3 h-3" /> เมนูเว็บไซต์
                      </h4>
                      <div className="space-y-0.5">
                        {menuTree.map((item: any) => (
                          <RecursiveMenuItem key={item._id} item={item} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ปุ่มติดตั้ง PWA */}
                  {deferredPrompt && (
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          if (onInstall) onInstall();
                          closeMenu();
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-800/30"
                      >
                        <Download size={18} />
                        ติดตั้งแอพพลิเคชั่น KTLTC
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ส่วนล่างสุดของเมนู (Footer) */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                  <span>KTL by AllMaster</span>
                  <span>v3.2026</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      ) : null}
    </div>
  );
}
