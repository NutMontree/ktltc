"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Image as ImageIcon,
  Users,
  Navigation,
  FileText,
  Database,
  Cloud,
  MessageSquare,
  Globe,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Layers,
  Search,
  Settings,
  HardDrive,
  Folder,
  Shield,
  Clock,
  ClipboardList,
  UserCog,
  CalendarCheck,
  BookOpen,
  ShieldCheck,
  Bell,
  Layout,
  ScanLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";
import { StatCard, UsageCard, ActionCard } from "@/components/dashboard/DashboardCards";
import StudentMenus from "@/components/dashboard/menus/StudentMenus";
import TeacherMenus from "@/components/dashboard/menus/TeacherMenus";
import StaffMenus from "@/components/dashboard/menus/StaffMenus";
import ExecutiveMenus from "@/components/dashboard/menus/ExecutiveMenus";
import SuperAdminMenus from "@/components/dashboard/menus/SuperAdminMenus";
import { DashboardContext } from "@/components/dashboard/DashboardContext";

// Framer Motion Variants
const container: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export default function DashboardClient({ initialStats, initialPermissions, initialCustomMenus, isStudent }: any) {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(initialPermissions);
  const [customMenus, setCustomMenus] = useState<any[]>(initialCustomMenus || []);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editingQuotaKey, setEditingQuotaKey] = useState<"storage_limit_mb" | "db_limit_mb">(
    "storage_limit_mb",
  );
  const [tempQuota, setTempQuota] = useState("");
  const [isSavingQuota, setIsSavingQuota] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Restore active tab from sessionStorage on mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem("dashboardActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("dashboardActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    // If permissions needs super_admin proxy, apply it here
    if (status === "authenticated" && initialPermissions) {
      const userRole = (session?.user?.role || "").toLowerCase();
      if (userRole === "super_admin") {
        const finalPerms = new Proxy(initialPermissions || {}, {
          get: function (target, prop) {
            if (typeof prop === "string") return true;
            return Reflect.get(target, prop);
          }
        });
        setPermissions(finalPerms);
      }
    }
  }, [status, session, initialPermissions]);

  const handleSaveQuota = async () => {
    if (!tempQuota || isNaN(parseFloat(tempQuota))) {
      alert("กรุณาระบุตัวเลขที่ถูกต้อง");
      return;
    }

    // Convert GB input to MB for database storage
    const quotaInMB = Math.round(parseFloat(tempQuota) * 1024);

    try {
      setIsSavingQuota(true);
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: editingQuotaKey,
          value: tempQuota === "0" ? "0" : quotaInMB.toString(),
        }),
      });

      if (res.ok) {
        // Refresh stats
        const statsRes = await fetch("/api/admin/dashboard-stats?_t=" + Date.now());
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        setIsEditingQuota(false);
      } else {
        alert("บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Save Quota Error:", err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSavingQuota(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
          <div className="w-[300px] h-[300px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute w-[200px] h-[200px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[80px] animate-pulse delay-500" />
        </div>

        <div className="relative group mt-10">
          {/* Outer fading ring */}
          <motion.div
            className="absolute -inset-6 rounded-full border border-blue-500/30 dark:border-blue-400/30"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner fading ring */}
          <motion.div
            className="absolute -inset-3 rounded-full border border-indigo-500/40 dark:border-indigo-400/40"
            animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.8, 0.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Main Icon Container */}
          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/50 dark:border-zinc-800/50">
            <Layout className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400" />

            {/* Ping effect on icon */}
            <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        <div className="text-center space-y-3 z-10 mt-4">
          <h2 className="text-xl md:text-2xl font-black bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            กำลังเตรียมพื้นที่ทำงาน
          </h2>
          <div className="flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <p className="font-bold uppercase tracking-widest text-[11px] animate-pulse">
              กำลังเริ่มต้นใช้งานแดชบอร์ด...
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-64 h-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full overflow-hidden relative shadow-inner">
          <motion.div
            className="absolute top-0 bottom-0 w-1/3 bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full"
            animate={{
              x: ["-100%", "300%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-xl shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            เซสชันหมดอายุ
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            กดปุ่มรีเฟรชเพื่อตรวจสอบสถานะการเชื่อมต่อ
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          รีเฟรชหน้าเว็บ 1 ครั้ง
        </button>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-12 h-12 text-amber-500" />
        <p className="text-zinc-500 font-bold italic">
          {error || "Unable to sync dashboard data. Please try again."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 font-black uppercase text-xs hover:underline"
        >
          ระบบรีเฟรช
        </button>
      </div>
    );
  }

  const user = {
    username: session?.user?.name || session?.user?.username,
    role: session?.user?.role,
    image: session?.user?.image,
  };

  const userRole = (session?.user?.role || "").toLowerCase();
  const hasStudentAccess = permissions?.access_student_workspace ?? (permissions?.student_dashboard || userRole === "student" || ["super_admin", "admin"].includes(userRole || ""));
  const hasTeacherAccess = permissions?.access_teacher_workspace ?? ["super_admin", "admin", "editor", "teacher"].includes(userRole || "");
  const hasStaffAccess = permissions?.access_staff_workspace ?? ["super_admin", "admin", "editor", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "teacher", "staff"].includes(userRole || "");
  const hasExecAccess = permissions?.access_exec_workspace ?? (permissions?.access_teacher_verification || permissions?.access_teacher_dashboard || permissions?.access_lesson_plans || permissions?.access_dpa_evaluation || permissions?.access_plc || permissions?.access_student_care || ["super_admin", "admin", "director", "hr"].includes(userRole || ""));
  const hasSuperAdminAccess = permissions?.access_superadmin_workspace ?? userRole === "super_admin";

  return (
    <DashboardContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="relative min-h-screen bg-transparent transition-colors duration-500">
        {/* Background Mesh Gradients */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/10 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/10 animate-pulse delay-700" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] dark:bg-purple-600/5" />
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12 relative">
          {/* --- Header Section --- */}
          <DashboardHeader user={user} />

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
            {/* --- Quick Actions Section --- */}
            {/* --- Search & Actions Bar (Not Sticky) --- */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full mb-2 -mt-2">
              <motion.div variants={item} className="relative w-full sm:w-64 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-400" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาเมนู..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />
              </motion.div>

              {hasSuperAdminAccess && (
                <motion.div variants={item} className="shrink-0 h-[42px]">
                  <Link
                    href="/dashboard/permissions"
                    className="flex items-center justify-center gap-2 px-6 h-full rounded-full bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
                  >
                    <Layout className="w-4 h-4" />
                    เพิ่มเมนูใหม่
                  </Link>
                </motion.div>
              )}
            </div>

            {/* --- Quick Actions Tabs (Sticky) --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-start w-full sticky top-16 md:top-20 z-40 pt-2 pb-4 -mx-4 px-4 md:-mx-8 md:px-8 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
              <motion.div variants={item} className="flex flex-nowrap overflow-x-auto hide-scrollbar scrollbar-hide gap-3 p-1.5 w-full md:w-fit [&>button]:shrink-0 [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "all" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 ring-2 ring-zinc-900/20 dark:ring-white/20" : "bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"}`}
                >
                  <Layers size={18} />
                  <span>ทั้งหมด</span>
                </button>
                {hasStudentAccess && (
                  <button
                    onClick={() => setActiveTab("student")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "student" ? "bg-indigo-600 text-white ring-2 ring-indigo-600/20" : "bg-white text-zinc-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <Users size={18} />
                    <span>นักเรียน</span>
                  </button>
                )}
                {hasTeacherAccess && (
                  <button
                    onClick={() => setActiveTab("teacher")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "teacher" ? "bg-violet-600 text-white ring-2 ring-violet-600/20" : "bg-white text-zinc-600 hover:bg-violet-50 hover:text-violet-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-violet-900/30 dark:hover:text-violet-400 border border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <BookOpen size={18} />
                    <span>ครูผู้สอน</span>
                  </button>
                )}
                {hasStaffAccess && (
                  <button
                    onClick={() => setActiveTab("staff")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "staff" ? "bg-teal-600 text-white ring-2 ring-teal-600/20" : "bg-white text-zinc-600 hover:bg-teal-50 hover:text-teal-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-teal-900/30 dark:hover:text-teal-400 border border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <UserCog size={18} />
                    <span>บุคลากร / HR</span>
                  </button>
                )}
                {hasExecAccess && (
                  <button
                    onClick={() => setActiveTab("executive")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "executive" ? "bg-rose-600 text-white ring-2 ring-rose-600/20" : "bg-white text-zinc-600 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <ShieldCheck size={18} />
                    <span>ผู้บริหาร</span>
                  </button>
                )}
                {hasSuperAdminAccess && (
                  <button
                    onClick={() => setActiveTab("superadmin")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${activeTab === "superadmin" ? "bg-sky-600 text-white ring-2 ring-sky-600/20" : "bg-white text-zinc-600 hover:bg-sky-50 hover:text-sky-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-sky-900/30 dark:hover:text-sky-400 border border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <Shield size={18} />
                    <span>ผู้ดูแลระบบ</span>
                  </button>
                )}
              </motion.div>
            </div>

            {/* StudentMenus */}
            <StudentMenus permissions={permissions} customMenus={customMenus} item={item} userRole={userRole} hasAccess={hasStudentAccess} activeTab={activeTab} stats={stats} />

            {/* TeacherMenus */}
            <TeacherMenus permissions={permissions} customMenus={customMenus} item={item} userRole={userRole} hasAccess={hasTeacherAccess} activeTab={activeTab} stats={stats} />

            {/* StaffMenus */}
            <StaffMenus permissions={permissions} customMenus={customMenus} item={item} userRole={userRole} hasAccess={hasStaffAccess} activeTab={activeTab} stats={stats} />

            {/* ExecutiveMenus */}
            <ExecutiveMenus permissions={permissions} customMenus={customMenus} item={item} userRole={userRole} hasAccess={hasExecAccess} activeTab={activeTab} stats={stats} />

            {/* SuperAdminMenus */}
            <SuperAdminMenus permissions={permissions} customMenus={customMenus} item={item} userRole={userRole} hasAccess={hasSuperAdminAccess} activeTab={activeTab} stats={stats} />

            {/* ============================== */}
            {/* 6. MANUALS & GUIDES */}
            {/* ============================== */}
            {(activeTab === "all") && (
              <div>
                <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 flex items-center gap-4">
                    <BookOpen className="w-4 h-4" /> คู่มือการใช้งาน (Manuals & Guides)
                    <span className="h-px bg-amber-500/10 flex-1" />
                  </h2>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    เอกสารและคู่มือแนะนำการใช้งานระบบต่างๆ
                  </span>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <ActionCard
                    href="/manual/gate-pass"
                    title="คู่มือระบบ Gate Pass"
                    icon={BookOpen}
                    desc="เอกสารคู่มือการใช้งานระบบสแกนเข้า-ออกและติดตาม GPS"
                    variants={item}
                  />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700">
              KTL by AllMaster • Core v3.2026
            </p>
          </motion.div>
        </div>



        {/* --- Quota Edit Modal --- */}
        <AnimatePresence>
          {isEditingQuota && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditingQuota(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8">
                  <Database className="w-12 h-12 text-blue-500/10" />
                </div>

                <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                  {editingQuotaKey === "db_limit_mb" ? "Database Quota" : "Storage Quota"}
                </h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8">
                  {editingQuotaKey === "db_limit_mb"
                    ? "กำหนดขีดจำกัดฐานข้อมูล (GB)"
                    : "กำหนดขีดจำกัดพื้นที่จัดเก็บข้อมูล (GB)"}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        ไม่จำกัด{editingQuotaKey === "db_limit_mb" ? "ฐานข้อมูล" : "พื้นที่"}{" "}
                        (Unlimited)
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        เปิดการใช้งาน{editingQuotaKey === "db_limit_mb" ? "ฐานข้อมูล" : "พื้นที่"}
                        ทั้งหมดของเซิร์ฟเวอร์
                      </p>
                    </div>
                    <button
                      onClick={() => setTempQuota(tempQuota === "0" ? "20" : "0")}
                      className={`w-12 h-6 rounded-full transition-all relative ${tempQuota === "0" ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${tempQuota === "0" ? "left-7" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {tempQuota !== "0" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block">
                        ความจุสูงสุด (GigaBytes - GB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={tempQuota}
                        onChange={(e) => setTempQuota(e.target.value)}
                        placeholder="ระบุจำนวน GB เช่น 20"
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                      <p className="mt-2 text-[10px] text-zinc-400 font-medium">
                        * ระบุเป็นหน่วย GB (เช่น 20 หมายถึง 20GB)
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditingQuota(false)}
                      className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveQuota}
                      disabled={isSavingQuota}
                      className="flex-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSavingQuota ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "บันทึกการตั้งค่า"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardContext.Provider>
  );
}

// --- Premium Sub-Components ---

function TelemetryCard({ label, value, unit, subValue, icon: Icon, color }: any) {
  return (
    <div className="relative group p-6 rounded-4xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 hover:-translate-y-1 overflow-hidden">
      <div
        className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${color === "blue" ? "text-blue-500" : "text-purple-500"}`}
      >
        <Icon size={80} strokeWidth={1} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-3">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {value}
          </h3>
          <span className="text-xs font-bold text-zinc-500 uppercase">{unit}</span>
        </div>
        {subValue && (
          <p className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mt-2 bg-zinc-100 dark:bg-zinc-900/50 w-fit px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 uppercase tracking-tight">
            {subValue}
          </p>
        )}
        <div className="mt-5 h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value, 100)}%` }}
            transition={{ duration: 2, ease: "circOut" }}
            className={`h-full ${color === "blue" ? "bg-blue-500 shadow-blue-500/50" : "bg-purple-500 shadow-purple-500/50"} rounded-full shadow-[0_0_15px]`}
          />
        </div>
      </div>
    </div>
  );
}

