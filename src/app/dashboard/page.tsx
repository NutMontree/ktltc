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
  Settings,
  HardDrive,
  Folder,
  Shield,
  Clock,
  ClipboardList,
  UserCog,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";

// Framer Motion Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardLoader() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editingQuotaKey, setEditingQuotaKey] = useState<"storage_limit_mb" | "db_limit_mb">(
    "storage_limit_mb",
  );
  const [tempQuota, setTempQuota] = useState("");
  const [isSavingQuota, setIsSavingQuota] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return;
      try {
        setLoading(true);
        const [statsRes, permRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats?_t=" + Date.now()),
          fetch("/api/auth/permissions"),
        ]);

        if (!statsRes.ok) throw new Error("Failed to fetch dashboard statistics");
        const statsData = await statsRes.json();
        setStats(statsData);

        if (permRes.ok) {
          const permData = await permRes.json();
          setPermissions(permData);
        }
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status]);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          Initializing Executive Dashboard...
        </p>
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
            การเข้าถึงโดยไม่ได้รับอนุญาต
          </h2>
          <p className="text-zinc-500 mt-2 font-medium">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงศูนย์บัญชาการผู้บริหาร
          </p>
        </div>
        <Link
          href="/login"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
        >
          Go to Login
        </Link>
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
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  return (
    <div className="max-w-[1600px] mx-auto bg-transparent transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12">
        {/* --- Header Section --- */}
        <DashboardHeader user={user} />

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
          {/* --- Statistics Section --- */}
          {((session?.user as any)?.role === "super_admin" || permissions?.manage_users) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-4">
                  Core Infrastructure Telemetry
                  <span className="h-px bg-blue-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  การตรวจสอบความพร้อมของระบบและฐานข้อมูล
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Stat Grid */}
                <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard
                    label="ข่าวสารทั้งหมด"
                    value={stats.totalNews}
                    icon={Newspaper}
                    color="blue"
                    variants={item}
                  />
                  <StatCard
                    label="แบนเนอร์ประชาสัมพันธ์"
                    value={stats.totalBanners}
                    icon={ImageIcon}
                    color="pink"
                    variants={item}
                  />
                  <StatCard
                    label="User ในระบบ"
                    value={stats.totalUsers}
                    icon={Users}
                    color="emerald"
                    variants={item}
                  />
                  <StatCard
                    label="โครงสร้างเมนู"
                    value={stats.totalNav}
                    icon={Navigation}
                    color="purple"
                    variants={item}
                  />
                  <StatCard
                    label="หน้าเนื้อเมนู"
                    value={stats.totalPages}
                    icon={FileText}
                    color="amber"
                    variants={item}
                  />
                  <StatCard
                    label="จำนวนรูปภาพในระบบ"
                    value={stats.totalImagesCount}
                    icon={Layers}
                    color="indigo"
                    unit=" ไฟล์"
                    variants={item}
                  />
                  <StatCard
                    label="ไฟล์ในคลังข้อมูล"
                    value={stats.totalDriveFiles}
                    icon={HardDrive}
                    color="orange"
                    unit=" ไฟล์"
                    variants={item}
                  />
                  <StatCard
                    label="โฟลเดอร์ในคลัง"
                    value={stats.totalDriveFolders}
                    icon={Folder}
                    color="amber"
                    unit=" โฟลเดอร์"
                    variants={item}
                  />
                </div>

                {/* Usage Cards */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  <UsageCard
                    title="MongoDB"
                    value={stats.dbSizeMB}
                    max={stats.dbLimitMB}
                    unit="MB"
                    icon={Database}
                    color="emerald"
                    variants={item}
                    isSuperAdmin={session?.user?.role === "super_admin"}
                    serverTotalMB={stats.serverTotalMB}
                    serverUsedMB={stats.serverUsedMB}
                    serverAvailableMB={stats.serverAvailableMB}
                    onEdit={() => {
                      const currentGB =
                        stats.dbLimitMB === 0 ? "0" : (stats.dbLimitMB / 1024).toFixed(1);
                      setEditingQuotaKey("db_limit_mb");
                      setTempQuota(currentGB);
                      setIsEditingQuota(true);
                    }}
                  />
                  <UsageCard
                    title="Storage & Drive"
                    value={stats.cloudUsageMB}
                    max={stats.cloudLimitMB}
                    unit="MB"
                    icon={Database}
                    color="blue"
                    variants={item}
                    isSuperAdmin={session?.user?.role === "super_admin"}
                    serverTotalMB={stats.serverTotalMB}
                    serverUsedMB={stats.serverUsedMB}
                    serverAvailableMB={stats.serverAvailableMB}
                    onEdit={() => {
                      // Convert MB to GB for display in modal
                      const currentGB =
                        stats.cloudLimitMB === 0 ? "0" : (stats.cloudLimitMB / 1024).toFixed(1);
                      setEditingQuotaKey("storage_limit_mb");
                      setTempQuota(currentGB);
                      setIsEditingQuota(true);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- Quick Actions Section --- */}
          <div>
            <motion.div variants={item} className="mb-8 flex flex-col gap-1">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 flex items-center gap-4">
                Administrative Operations
                <span className="h-px bg-indigo-500/10 flex-1" />
              </h2>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                การจัดการและบริหารข้อมูลเว็บไซต์
              </span>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {permissions?.manage_news && (
                <ActionCard
                  href="/dashboard/news"
                  title="จัดการส่วนข่าว"
                  icon={Newspaper}
                  desc="Manage all news & activities"
                  variants={item}
                />
              )}
              {(session?.user as any)?.role === "super_admin" && (
                <ActionCard
                  href="/dashboard/manage-home"
                  title="จัดการหน้าแรก"
                  icon={Globe}
                  desc="Hero sections & Visibility"
                  variants={item}
                />
              )}
              {(session?.user as any)?.role === "super_admin" && (
                <ActionCard
                  href="/dashboard/navbar"
                  title="จัดการเมนูหลัก"
                  icon={Navigation}
                  desc="Website navigation tree"
                  variants={item}
                />
              )}
              {permissions?.manage_pages && (
                <ActionCard
                  href="/dashboard/pages"
                  title="จัดการเนื้อหาหน้า"
                  icon={FileText}
                  desc="Independent page builder"
                  variants={item}
                />
              )}
              {permissions?.manage_qa && (
                <ActionCard
                  href="/dashboard/questions"
                  title="ระบบถาม-ตอบ"
                  icon={MessageSquare}
                  desc="User Q&A & Support"
                  badge={stats.totalPendingQA > 0 ? stats.totalPendingQA : null}
                  variants={item}
                />
              )}
              <ActionCard
                href="/"
                title="เข้าสู่หน้าหลัก"
                icon={ArrowUpRight}
                desc="View production site"
                external
                variants={item}
              />
            </div>
          </div>

          {/* --- Super Admin Management Section --- */}
          {(session?.user as any)?.role === "super_admin" && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 flex items-center gap-4">
                  <Shield className="w-4 h-4" /> ระบบจัดการ (Super Admin)
                  <span className="h-px bg-sky-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือบริหารจัดการระบบและบุคลากร
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <ActionCard
                  href="/dashboard/permissions"
                  title="จัดการสิทธิ์แต่ละระดับ"
                  icon={Shield}
                  desc="Role-based permission control"
                  variants={item}
                />
                <ActionCard
                  href="/dashboard/data-management"
                  title="แก้ไขข้อมูลเข้า/ออกงาน"
                  icon={ClipboardList}
                  desc="Attendance data correction"
                  variants={item}
                />
                <ActionCard
                  href="/work-reports-management"
                  title="แก้ไขรายงานปฏิบัติงาน"
                  icon={FileText}
                  desc="Work report management"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-dashboard"
                  title="ภาพรวมลงเวลาบุคลากร"
                  icon={CalendarCheck}
                  desc="Personnel attendance overview"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-report"
                  title="ระบบรายงานการเข้างาน"
                  icon={Clock}
                  desc="Attendance reporting system"
                  variants={item}
                />
                <ActionCard
                  href="/work-reports"
                  title="ระบบรายงานปฏิบัติงาน"
                  icon={FileText}
                  desc="Work performance reports"
                  variants={item}
                />
                <ActionCard
                  href="/leave-approvals"
                  title="จัดการอนุมัติใบลา"
                  icon={CalendarCheck}
                  desc="Leave request approvals"
                  variants={item}
                />
                <ActionCard
                  href="/manage-roles"
                  title="จัดการสิทธิ์บุคลากร"
                  icon={UserCog}
                  desc="Personnel role settings"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-settings"
                  title="ตั้งค่าเวลาเข้างาน"
                  icon={Settings}
                  desc="Working hours configuration"
                  variants={item}
                />
              </div>
            </div>
          )}

          {/* --- Drive Section --- */}
          {!["user", "student"].includes(((session?.user as any)?.role || "").toLowerCase()) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 flex items-center gap-4">
                  <HardDrive className="w-4 h-4" /> คลังไฟล์งาน
                  <span className="h-px bg-amber-500/10 flex-1" />
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <ActionCard
                  href="/dashboard/drive"
                  title="คลังไฟล์งาน (Drive)"
                  icon={HardDrive}
                  desc="File storage & management"
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
            KTL Management System • Core v2026.03
          </p>
        </motion.div>
      </div>

      {/* --- Quota Edit Modal --- */}
      <AnimatePresence>
        {isEditingQuota && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
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
  );
}

// --- Premium Sub-Components ---

function StatCard({ label, value, icon: Icon, color, unit, variants }: any) {
  const colors: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-500/5 dark:bg-pink-500/10 border-pink-500/20",
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20",
    indigo:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20",
  };

  const glow: any = {
    blue: "group-hover:shadow-blue-500/20",
    purple: "group-hover:shadow-purple-500/20",
    amber: "group-hover:shadow-amber-500/20",
    pink: "group-hover:shadow-pink-500/20",
    emerald: "group-hover:shadow-emerald-500/20",
    indigo: "group-hover:shadow-indigo-500/20",
  };

  return (
    <motion.div
      variants={variants}
      className={`group relative p-6 rounded-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${glow[color]}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {value.toLocaleString()}
          </h3>
          {unit && <span className="text-[10px] font-bold text-zinc-400 uppercase">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function UsageCard({
  title,
  value,
  max,
  unit,
  icon: Icon,
  color,
  variants,
  isSuperAdmin,
  onEdit,
  serverTotalMB = 0,
  serverUsedMB = 0,
  serverAvailableMB = 0,
}: any) {
  const isUnlimited = max <= 0;
  const displayValue = isUnlimited ? serverUsedMB : value;
  const effectiveMax = isUnlimited ? serverTotalMB || 1 : max;
  const percentage = Math.min((parseFloat(displayValue) / effectiveMax) * 100, 100);
  const colorClass =
    color === "emerald" ? "bg-emerald-500 shadow-emerald-500/40" : "bg-blue-500 shadow-blue-500/40";
  const iconColor = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  const bgColor = color === "emerald" ? "bg-emerald-500/5" : "bg-blue-500/5";

  return (
    <motion.div
      variants={variants}
      className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between group relative overflow-hidden backdrop-blur-sm"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${bgColor} ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-blue-500 transition-all"
                title="ตั้งค่าพื้นที่"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}
            <span className={`text-sm font-black ${iconColor}`}>{percentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
            {value}
            <span className="text-sm text-zinc-400 font-bold ml-1.5">{unit}</span>
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-wide">
              {isUnlimited
                ? `การใช้งานเครื่อง: ${percentage.toFixed(1)}% (${(serverUsedMB / 1024).toFixed(1)} GB / ${(serverTotalMB / 1024).toFixed(1)} GB)`
                : `โควตาที่ใช้: ${((parseFloat(value) / max) * 100).toFixed(1)}% ของ ${(max / 1024).toFixed(1)} GB`}
            </p>
            {/* <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
               พื้นที่ว่างจริง (Available): {(serverAvailableMB/1024).toFixed(2)} GB
             </p> */}
            {!isUnlimited && (
              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 italic">
                * เหลือตามโควตา: {Math.max(0, (max - parseFloat(value)) / 1024).toFixed(2)} GB
              </p>
            )}
          </div>
        </div>

        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-[2px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
            className={`h-full ${colorClass} rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({ href, title, icon: Icon, desc, external, badge, variants }: any) {
  return (
    <motion.div variants={variants}>
      <Link
        href={href}
        target={external ? "_blank" : "_self"}
        className="group relative flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-4xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
      >
        {badge && (
          <div className="absolute top-4 right-4 px-2 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-rose-500/30 animate-bounce">
            {badge}
          </div>
        )}
        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-1 truncate">
          {title}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-tight leading-none mb-4">
          {desc}
        </p>
        <div className="mt-auto pt-2 flex items-center text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Launch Module <ArrowUpRight className="w-3 h-3 ml-1" />
        </div>
      </Link>
    </motion.div>
  );
}
