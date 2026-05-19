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
          fetch("/api/auth/permissions?_t=" + Date.now()),
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
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
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
          {/* --- Statistics Section --- */}
          {(["super_admin", "admin", "editor"].includes(
            ((session?.user as any)?.role || "").toLowerCase(),
          ) ||
            permissions?.access_dashboard) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-4">
                  ข้อมูลโครงสร้างพื้นฐานระบบ (Telemetry)
                  <span className="h-px bg-blue-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  ตรวจสอบสถานะเซิร์ฟเวอร์และการใช้งานทรัพยากรแบบเรียลไทม์
                </span>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Status Dashboard */}
                <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <TelemetryCard
                    label="ภาระการประมวลผล (CPU)"
                    value={stats.cpuUsage}
                    unit="%"
                    icon={Database}
                    color="blue"
                  />
                  <TelemetryCard
                    label="หน่วยความจำ (RAM)"
                    value={stats.ramUsage.percent}
                    unit="%"
                    subValue={`ใช้งาน ${(stats.ramUsage.used / 1024).toFixed(1)} จาก ${(stats.ramUsage.total / 1024).toFixed(1)} GB`}
                    icon={HardDrive}
                    color="purple"
                  />
                  <StatCard
                    label="User ในระบบ"
                    value={stats.totalUsers}
                    icon={Users}
                    color="emerald"
                    unit=" Users"
                    variants={item}
                  />
                  <StatCard
                    label="จำนวนรูปภาพ"
                    value={stats.totalImagesCount}
                    icon={ImageIcon}
                    color="indigo"
                    unit=" ไฟล์"
                    variants={item}
                  />

                  <StatCard
                    label="ข่าวสารทั้งหมด"
                    value={stats.totalNews}
                    icon={Newspaper}
                    color="blue"
                    unit=" ข่าว"
                    variants={item}
                  />
                  <StatCard
                    label="แบนเนอร์"
                    value={stats.totalBanners}
                    icon={ImageIcon}
                    color="pink"
                    unit=" รูป"
                    variants={item}
                  />
                  <StatCard
                    label="ไฟล์ในคลัง"
                    value={stats.totalDriveFiles}
                    icon={HardDrive}
                    color="orange"
                    unit=" ไฟล์"
                    variants={item}
                  />
                  <StatCard
                    label="โฟลเดอร์"
                    value={stats.totalDriveFolders}
                    icon={Folder}
                    color="amber"
                    unit=" โฟลเดอร์"
                    variants={item}
                  />
                  <StatCard
                    label="เมนูหลัก"
                    value={stats.totalNav}
                    icon={Navigation}
                    color="purple"
                    unit=" เมนู"
                    variants={item}
                  />
                  <StatCard
                    label="หน้าเนื้อหา"
                    value={stats.totalPages}
                    icon={FileText}
                    color="amber"
                    unit=" หน้า"
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
                เมนูการจัดการข้อมูล (Administrative)
                <span className="h-px bg-indigo-500/10 flex-1" />
              </h2>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                เครื่องมือจัดการเนื้อหาและข่าวสารของวิทยาลัย
              </span>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {permissions?.manage_news && (
                <ActionCard
                  href="/dashboard/news"
                  title="จัดการข่าวสาร / ประชาสัมพันธ์"
                  icon={Newspaper}
                  desc="ลงข่าวประชาสัมพันธ์และกิจกรรมล่าสุด"
                  variants={item}
                />
              )}

              {(session?.user as any)?.role === "super_admin" || permissions?.manage_home ? (
                <ActionCard
                  href="/dashboard/manage-home"
                  title="ปรับแต่งหน้าหลัก"
                  icon={Globe}
                  desc="จัดการแบนเนอร์และประกาศหน้าแรก"
                  variants={item}
                />
              ) : null}
              {(session?.user as any)?.role === "super_admin" || permissions?.manage_navbar ? (
                <ActionCard
                  href="/dashboard/navbar"
                  title="เมนูเว็บไซต์"
                  icon={Navigation}
                  desc="ตั้งค่าโครงสร้างเมนูและลิงก์เชื่อมโยง"
                  variants={item}
                />
              ) : null}
              {permissions?.manage_pages && (
                <ActionCard
                  href="/dashboard/pages"
                  title="เนื้อหาหน้าเว็บ"
                  icon={FileText}
                  desc="จัดการข้อมูลและเนื้อหาในแต่ละหน้า"
                  variants={item}
                />
              )}
              {permissions?.manage_qa && (
                <ActionCard
                  href="/dashboard/questions"
                  title="ระบบถาม-ตอบ"
                  icon={MessageSquare}
                  desc="จัดการคำถามและข้อร้องเรียนจากผู้ใช้"
                  badge={stats.totalPendingQA > 0 ? stats.totalPendingQA : null}
                  variants={item}
                />
              )}
              <ActionCard
                href="/"
                title="ดูเว็บไซต์จริง"
                icon={ArrowUpRight}
                desc="เปิดหน้าเว็บไซต์หลักในแท็บใหม่"
                external
                variants={item}
              />
            </div>
          </div>

          {/* --- OIT Section --- */}
          {["super_admin", "admin", "editor", "hr", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "teacher", "staff"].includes(
            ((session?.user as any)?.role || "").toLowerCase()
          ) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400 flex items-center gap-4">
                  การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ (OIT)
                  <span className="h-px bg-teal-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือประเมินคุณธรรมและความโปร่งใสสำหรับการเผยแพร่ข้อมูลต่อสาธารณะ
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <ActionCard
                  href="/dashboard/ita"
                  title="จัดการข้อมูล ITA / OIT"
                  icon={ClipboardList}
                  desc="แก้ไขตัวชี้วัดความโปร่งใสรายหัวข้อ O1 - O37"
                  variants={item}
                />
              </div>
            </div>
          )}

          {/* --- Super Admin Management Section --- */}
          {(session?.user as any)?.role === "super_admin" && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400 flex items-center gap-4">
                  <Shield className="w-4 h-4" /> ระบบจัดการข้อมูล
                  <span className="h-px bg-sky-500/10 flex-1" />
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  เครื่องมือบริหารจัดการระบบและบุคลากร
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <ActionCard
                  href="/dashboard/permissions"
                  title="จัดการสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ"
                  icon={Shield}
                  desc="กำหนดสิทธิ์การเข้าถึงแยกตามรายบุคคล"
                  variants={item}
                />
                <ActionCard
                  href="/dashboard/data-management"
                  title="แก้ไขข้อมูลการลงเวลา"
                  icon={ClipboardList}
                  desc="ตรวจสอบและแก้ไขข้อมูลการเข้า-ออกงาน"
                  variants={item}
                />
                <ActionCard
                  href="/work-reports-management"
                  title="แก้ไขรายงานการปฏิบัติงาน"
                  icon={FileText}
                  desc="บริหารจัดการข้อมูลรายงานการปฏิบัติงาน"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-dashboard"
                  title="ภาพรวมการเข้างาน"
                  icon={CalendarCheck}
                  desc="สถิติการเข้างานภาพรวมของฝ่ายต่างๆ"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-report"
                  title="รายงานการเข้างาน"
                  icon={Clock}
                  desc="ระบบออกรายงานสรุปการเข้างานบุคลากร"
                  variants={item}
                />
                <ActionCard
                  href="/work-reports"
                  title="รายงานการปฏิบัติงาน"
                  icon={FileText}
                  desc="ตรวจสอบความถูกต้องของรายงานปฏิบัติงาน"
                  variants={item}
                />
                <ActionCard
                  href="/leave-approvals"
                  title="อนุมัติการลางาน"
                  icon={CalendarCheck}
                  desc="ระบบพิจารณาและอนุมัติใบลาอิเล็กทรอนิกส์"
                  variants={item}
                />
                <ActionCard
                  href="/manage-roles"
                  title="จัดการ สิทธิ์บุคลากร"
                  icon={UserCog}
                  desc="จัดการระดับผู้ใช้งานและบทบาทหน้าที่"
                  variants={item}
                />
                <ActionCard
                  href="/attendance-settings"
                  title="ตั้งค่าระบบลงเวลา"
                  icon={Settings}
                  desc="กำหนดตารางเวลาทำงานและเกณฑ์สาย"
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
                  title="คลังไฟล์ (Drive)"
                  icon={HardDrive}
                  desc="จัดการไฟล์เอกสารและสื่อดิจิทัลทั้งหมด"
                  variants={item}
                />

                {((session?.user as any)?.role || "").toLowerCase() === "super_admin" && (
                  <>
                    <motion.div variants={item}>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตจำนวนผู้เข้าชมทั้งหมดของทุกโฟลเดอร์ให้กลับเป็น 0?",
                            )
                          ) {
                            try {
                              const res = await fetch("/api/drive/folders?reset=true");
                              if (res.ok) {
                                alert("รีเซ็ตจำนวนผู้เข้าชมทั้งหมดเป็น 0 เรียบร้อยแล้ว!");
                              } else {
                                alert("เกิดข้อผิดพลาดในการรีเซ็ต");
                              }
                            } catch (e) {
                              alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
                            }
                          }
                        }}
                        className="text-left w-full h-full group relative flex flex-col p-px rounded-[2.5rem] bg-zinc-200 dark:bg-zinc-800 hover:bg-linear-to-br hover:from-amber-500 hover:to-orange-600 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:-translate-y-2 cursor-pointer"
                      >
                        <div className="relative flex flex-col h-full bg-white dark:bg-zinc-950 p-7 rounded-[2.45rem] overflow-hidden transition-colors group-hover:bg-white/95 dark:group-hover:bg-zinc-950/95">
                          <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <Settings size={120} />
                          </div>

                          <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-linear-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner text-amber-500">
                            <Settings size={24} />
                          </div>

                          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2 truncate">
                            รีเซ็ตยอดดูเป็น 0
                          </h3>
                          <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-snug mb-6">
                            รีเซ็ตยอดเข้าชมสะสมของโฟลเดอร์ทั้งหมดกลับเป็นศูนย์
                          </p>

                          <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                            ล้างค่าทันที <ArrowUpRight size={14} strokeWidth={3} />
                          </div>
                        </div>
                      </button>
                    </motion.div>

                    <motion.div
                      variants={item}
                      className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col justify-center p-6 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/30 rounded-[2.5rem]"
                    >
                      <h4 className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        💡 <strong>คำอธิบายระบบรีเซ็ต (Reset Views Junction)</strong>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-bold">
                        ปุ่มด้านซ้ายนี้จะทำหน้าที่ล้างยอดผู้เข้าชมสะสม (Views) ของทุกๆ
                        โฟลเดอร์ในระบบคลังเอกสาร Drive ให้กลับเป็น 0 เพื่อเริ่มเก็บสถิติใหม่ทั้งหมด
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 mt-2 font-medium">
                        โดยตัวปุ่มจะเรียกใช้ API เบื้องหลังซึ่งเข้าถึงได้ผ่าน URL เหล่านี้โดยตรง:
                      </p>
                      <div className="mt-1 space-y-1 font-mono text-[9px] break-all">
                        <p>
                          • Local:{" "}
                          <a
                            href="http://localhost:3000/api/drive/folders?reset=true"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            http://localhost:3000/api/drive/folders?reset=true
                          </a>
                        </p>
                        <p>
                          • Prod:{" "}
                          <a
                            href="https://ktltc.ac.th/api/drive/folders?reset=true"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            https://ktltc.ac.th/api/drive/folders?reset=true
                          </a>
                        </p>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* --- Student Section --- */}
          {(((session?.user as any)?.role || "").toLowerCase() === "student" ||
            ["super_admin", "admin"].includes(
              ((session?.user as any)?.role || "").toLowerCase(),
            )) && (
            <div>
              <motion.div variants={item} className="mb-8 flex flex-col gap-1">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 flex items-center gap-4">
                  <Clock className="w-4 h-4" /> สำหรับนักเรียน นักศึกษา
                  <span className="h-px bg-indigo-500/10 flex-1" />
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <ActionCard
                  href="/student/flagpole"
                  title="เช็คชื่อเข้าแถว"
                  icon={Clock}
                  desc="ระบบเช็คชื่อและสแกนพิกัดหน้าเสาธงของนักเรียน"
                  variants={item}
                />
                {["super_admin", "admin"].includes(
                  ((session?.user as any)?.role || "").toLowerCase(),
                ) && (
                  <>
                    <ActionCard
                      href="/dashboard/flagpole-dashboard"
                      title="ภาพรวมการเข้าแถว"
                      icon={Layers}
                      desc="รายงานสถิติ แผนที่ และภาพรวมการเข้าแถวหน้าเสาธง"
                      variants={item}
                    />
                    <ActionCard
                      href="/dashboard/flagpole-reports"
                      title="ระบบรายงานการเข้าแถว"
                      icon={FileText}
                      desc="ตรวจสอบ แก้ไข และออกรายงานสรุปประวัติเข้าแถวนักศึกษา"
                      variants={item}
                    />
                    <ActionCard
                      href="/dashboard/flagpole-data-management"
                      title="แก้ไขข้อมูลการเข้าแถว"
                      icon={ClipboardList}
                      desc="เครื่องมือปรับแก้พิกัด ระยะห่าง และวันเวลาลงชื่อของนักเรียน"
                      variants={item}
                    />
                    <ActionCard
                      href="/dashboard/flagpole-settings"
                      title="ตั้งค่าเวลาเข้าแถว"
                      icon={Settings}
                      desc="จัดการกฎและเวลาเข้าแถวเสาธงของนักเรียน"
                      variants={item}
                    />
                  </>
                )}
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

function StatCard({ label, value, icon: Icon, color, unit, variants }: any) {
  const colors: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    pink: "text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    orange: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
  };

  const glows: any = {
    blue: "group-hover:shadow-blue-500/20",
    purple: "group-hover:shadow-purple-500/20",
    amber: "group-hover:shadow-amber-500/20",
    pink: "group-hover:shadow-pink-500/20",
    emerald: "group-hover:shadow-emerald-500/20",
    indigo: "group-hover:shadow-indigo-500/20",
    orange: "group-hover:shadow-orange-500/20",
  };

  return (
    <motion.div
      variants={variants}
      className={`group relative p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500/30 ${glows[color]}`}
    >
      <div className="flex justify-between items-start mb-5">
        <div
          className={`p-3.5 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}
        >
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {value.toLocaleString()}
          </h3>
          {unit && (
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              {unit}
            </span>
          )}
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
    color === "emerald" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-blue-600 shadow-blue-600/50";
  const iconColor = color === "emerald" ? "text-emerald-500" : "text-blue-500";
  const bgColor = color === "emerald" ? "bg-emerald-500/10" : "bg-blue-500/10";

  return (
    <motion.div
      variants={variants}
      className="group relative p-7 rounded-[3rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:border-blue-500/30 overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={120} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${bgColor} ${iconColor} shadow-inner`}>
              <Icon size={20} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-blue-500 hover:border-blue-500/50 transition-all"
              >
                <Settings size={14} />
              </button>
            )}
            <div className={`px-3 py-1 rounded-full ${bgColor} ${iconColor} text-xs font-black`}>
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <h4 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
              {parseFloat(value).toLocaleString()}
            </h4>
            <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">
              {unit}
            </span>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest leading-relaxed">
              {isUnlimited
                ? `การใช้งานระบบ: ${(serverUsedMB / 1024).toFixed(1)}GB จากทั้งหมด ${(serverTotalMB / 1024).toFixed(1)}GB`
                : `การจัดสรรโควตา: ${((parseFloat(value) / max) * 100).toFixed(1)}% ของความจุ ${(max / 1024).toFixed(1)}GB`}
            </p>
            {/* <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                พื้นที่ว่างในเซิร์ฟเวอร์: {(serverAvailableMB / 1024).toFixed(2)} GB
              </p>
            </div> */}
          </div>
        </div>

        <div className="h-3 w-full bg-zinc-200/50 dark:bg-zinc-900 rounded-full p-1 border border-zinc-200/60 dark:border-zinc-800/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 2, ease: "circOut" }}
            className={`h-full ${colorClass} rounded-full shadow-[0_0_15px]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({ href, title, icon: Icon, desc, external, badge, variants }: any) {
  const gradients: any = [
    "from-blue-600 to-indigo-700",
    "from-purple-600 to-pink-700",
    "from-emerald-600 to-teal-700",
    "from-orange-600 to-red-700",
    "from-sky-600 to-blue-700",
    "from-zinc-800 to-black",
  ];
  // Simple hash for consistent color
  const colorIdx = title.length % gradients.length;

  return (
    <motion.div variants={variants}>
      <Link
        href={href}
        target={external ? "_blank" : "_self"}
        className="group relative flex flex-col h-full p-px rounded-[2.5rem] bg-zinc-200 dark:bg-zinc-800 hover:bg-linear-to-br hover:from-blue-500 hover:to-indigo-600 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2"
      >
        <div className="relative flex flex-col h-full bg-white dark:bg-zinc-950 p-7 rounded-[2.45rem] overflow-hidden transition-colors group-hover:bg-white/95 dark:group-hover:bg-zinc-950/95">
          {badge && (
            <div className="absolute top-5 right-5 px-2.5 py-1 bg-rose-500 text-white text-[10px] font-black rounded-lg shadow-lg shadow-rose-500/30 z-10 animate-bounce">
              {badge}
            </div>
          )}

          <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
            <Icon size={120} />
          </div>

          <div
            className={`w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-linear-to-br ${gradients[colorIdx]} group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}
          >
            <Icon size={24} />
          </div>

          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight mb-2 truncate">
            {title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-snug mb-6">
            {desc}
          </p>

          <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
            เข้าสู่ระบบจัดการ <ArrowUpRight size={14} strokeWidth={3} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
