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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const roleLower = role?.toLowerCase() || "user";
  const userRole = roleLower;
  const isSuperAdmin = roleLower === "super_admin";
  const isAdmin = roleLower === "admin" || isSuperAdmin;
  const isHR = roleLower === "hr" || roleLower === "director" || isSuperAdmin;
  const isExecutive = roleLower === "director" || roleLower?.startsWith("deputy_") || isSuperAdmin;

  const canAccessDashboard = permissions?.access_dashboard || isAdmin || isHR || isExecutive;

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-zinc-950 z-[999] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-blue-600/20">
                    K
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">KTLTC</h2>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Management v2</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* User Section */}
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
                        onClick={() => signOut()}
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

                {/* Navigation Group */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-2 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Main Modules
                    </h4>
                    <div className="space-y-1">
                      <Link
                        href="/"
                        onClick={closeMenu}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                          pathname === "/"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <Home className="w-5 h-5" /> หน้าแรก
                      </Link>
                      
                      {canAccessDashboard && (
                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                            pathname === "/dashboard"
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                              : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </Link>
                      )}

                      {!["user", "student"].includes(roleLower) && (
                        <Link
                          href="/dashboard/drive"
                          onClick={closeMenu}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                            pathname === "/dashboard/drive"
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                              : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <HardDrive className="w-5 h-5" /> คลังไฟล์งาน (Drive)
                        </Link>
                      )}

                      {/* Super Admin Restricted Area */}
                      {isSuperAdmin && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                          <Link
                            href="/dashboard/permissions"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[14px] text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/40 transition-colors"
                          >
                            <Shield className="w-4 h-4" /> ศูนย์ควบคุมจัดการระบบ
                          </Link>
                          
                          <Link
                            href="/dashboard/data-management"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> แก้ไขข้อมูลการเข้างาน / ลา
                          </Link>

                          <Link
                            href="/work-reports-management"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> รายงานปฏิบัติงานทุกแผนก
                          </Link>

                          <Link
                            href="/attendance-dashboard"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-[14px] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 transition-colors"
                          >
                            <Activity className="w-4 h-4" /> ภาพรวมลงเวลาบุคลากร
                          </Link>

                          <Link
                            href="/attendance-report"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> ระบบรายงานการเข้างาน
                          </Link>

                          <Link
                            href="/work-reports"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> ระบบรายงานปฏิบัติงาน
                          </Link>

                          <Link
                            href="/leave-approvals"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> จัดการอนุมัติใบลา
                          </Link>

                          <Link
                            href="/manage-roles"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" /> ตั้งค่าเวลาเข้างาน
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* News & Activity Group */}
                  <div>
                    <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4 pl-2 flex items-center gap-2">
                      <Newspaper className="w-3 h-3" /> Content Management
                    </h4>
                    <div className="space-y-1">
                      {permissions?.manage_news && (
                        <Link
                          href="/dashboard/news"
                          onClick={closeMenu}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                          <Newspaper className="w-5 h-5 text-emerald-500" /> จัดการส่วนข่าว
                        </Link>
                      )}
                      {permissions?.manage_qa && (
                        <Link
                          href="/dashboard/questions"
                          onClick={closeMenu}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                        >
                          <MessageSquare className="w-5 h-5 text-rose-500" /> ระบบถาม-ตอบ
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-[10px] font-black text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
                  <span>KTL Management</span>
                  <span>v2.0.26</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
