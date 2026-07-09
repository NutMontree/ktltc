"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  HardDrive,
  Users,
  Image as ImageIcon,
  Newspaper,
  Loader2,
  ShieldAlert,
  Folder,
  FileText,
  Cloud,
  ChevronLeft,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import { Variants } from "framer-motion";
import { StatCard, UsageCard } from "@/components/dashboard/DashboardCards";
import { useRouter } from "next/navigation";

const container: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function TelemetryCard({ label, value, unit, subValue, icon: Icon, color }: any) {
  return (
    <motion.div
      variants={item}
      className="relative group p-6 rounded-4xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 hover:-translate-y-1 overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity ${color === "blue" ? "text-blue-500" : "text-purple-500"
          }`}
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
            className={`h-full ${color === "blue" ? "bg-blue-500 shadow-blue-500/50" : "bg-purple-500 shadow-purple-500/50"
              } rounded-full shadow-[0_0_15px]`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function TelemetryPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const router = useRouter();

  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [editingQuotaKey, setEditingQuotaKey] = useState<"storage_limit_mb" | "db_limit_mb">("storage_limit_mb");
  const [tempQuota, setTempQuota] = useState("");
  const [isSavingQuota, setIsSavingQuota] = useState(false);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const [activeUsersList, setActiveUsersList] = useState<any[]>([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(false);


  const fetchData = async () => {
    if (status !== "authenticated") return;
    try {
      const [statsRes, permRes] = await Promise.all([
        fetch("/api/admin/dashboard-stats?_t=" + Date.now()),
        fetch("/api/auth/permissions?_t=" + Date.now()),

      ]);

      if (!statsRes.ok) throw new Error("Failed to fetch statistics");
      const statsData = await statsRes.json();

      if (permRes.ok) {
        const permData = await permRes.json();
        let finalPerms = permData;
        const userRole = ((session?.user as any)?.role || "").toLowerCase();
        if (userRole === "super_admin") {
          finalPerms = new Proxy(permData || {}, {
            get: function (target, prop) {
              if (typeof prop === "string") return true;
              return Reflect.get(target, prop);
            },
          });
        }
        setPermissions(finalPerms);
        if (!finalPerms.access_telemetry && userRole !== "super_admin") {
          router.push("/dashboard");
          return;
        }
      }



      setStats(statsData);
      setLoading(false);

    } catch (err: any) {
      console.error("Telemetry Fetch Error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, session, router]);


  const handleViewActiveUsers = async () => {
    setIsActiveUsersModalOpen(true);
    setLoadingActiveUsers(true);
    try {
      const res = await fetch("/api/admin/active-users?_t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        setActiveUsersList(json.data || json.activeUsers || []);
      }
    } catch (error) {
      console.error("Error fetching active users:", error);
    } finally {
      setLoadingActiveUsers(false);
    }
  };

  const handleSaveQuota = async () => {
    if (!tempQuota || isNaN(parseFloat(tempQuota))) {
      alert("กรุณาระบุตัวเลขที่ถูกต้อง");
      return;
    }
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
        fetchData();
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-zinc-500 font-bold animate-pulse">กำลังโหลดข้อมูลระบบ...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || (!permissions?.access_telemetry && ((session?.user as any)?.role || "").toLowerCase() !== "super_admin")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-black">ไม่มีสิทธิ์เข้าถึง</h2>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12 relative min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
          <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">ข้อมูลโครงสร้างพื้นฐานระบบ (Telemetry)</h1>
          <p className="text-zinc-500 font-medium">ตรวจสอบสถานะเซิร์ฟเวอร์และการใช้งานทรัพยากรแบบเรียลไทม์</p>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TelemetryCard
            label="ภาระการประมวลผล (CPU)"
            value={stats?.cpuUsage || "0"}
            unit="%"
            icon={Database}
            color="blue"
          />
          <TelemetryCard
            label="หน่วยความจำ (RAM)"
            value={stats?.ramUsage?.percent || 0}
            unit="%"
            subValue={`ใช้งาน ${(stats?.ramUsage?.used / 1024 || 0).toFixed(1)} จาก ${(stats?.ramUsage?.total / 1024 || 0).toFixed(1)} GB`}
            icon={HardDrive}
            color="purple"
          />
          <StatCard
            label="User ในระบบ"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="emerald"
            unit=" Users"
            variants={item}
          />
          <div className="cursor-pointer" onClick={handleViewActiveUsers}>
            <StatCard
              label="User กำลังใช้งาน"
              value={stats?.activeUsers || 0}
              icon={Users}
              color="blue"
              unit=" Users"
              variants={item}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="จำนวนรูปภาพ" value={stats?.totalImagesCount || 0} icon={ImageIcon} color="indigo" unit=" ไฟล์" variants={item} />
          <StatCard label="ข่าวสารทั้งหมด" value={stats?.totalNews || 0} icon={Newspaper} color="blue" unit=" ข่าว" variants={item} />
          <StatCard label="แบนเนอร์" value={stats?.totalBanners || 0} icon={ImageIcon} color="pink" unit=" รูป" variants={item} />
          <StatCard label="ไฟล์ในคลัง" value={stats?.totalDriveFiles || 0} icon={HardDrive} color="orange" unit=" ไฟล์" variants={item} />
          <StatCard label="โฟลเดอร์" value={stats?.totalDriveFolders || 0} icon={Folder} color="amber" unit=" โฟลเดอร์" variants={item} />
          <StatCard label="เมนูหลัก" value={stats?.totalNav || 0} icon={Navigation} color="purple" unit=" เมนู" variants={item} />
          <StatCard label="หน้าเนื้อหา" value={stats?.totalPages || 0} icon={FileText} color="amber" unit=" หน้า" variants={item} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <UsageCard
            title="MongoDB"
            value={stats?.dbSizeMB || 0}
            max={stats?.dbLimitMB || 0}
            unit="MB"
            icon={Database}
            color="emerald"
            variants={item}
            isSuperAdmin={((session?.user as any)?.role || "").toLowerCase() === "super_admin"}
            serverTotalMB={stats?.serverTotalMB || 0}
            serverUsedMB={stats?.serverUsedMB || 0}
            serverAvailableMB={stats?.serverAvailableMB || 0}
            onEdit={() => {
              const currentGB = stats?.dbLimitMB === 0 ? "0" : ((stats?.dbLimitMB || 0) / 1024).toFixed(1);
              setEditingQuotaKey("db_limit_mb");
              setTempQuota(currentGB);
              setIsEditingQuota(true);
            }}
          />
          <UsageCard
            title="Storage & Drive"
            value={parseFloat(stats?.cloudUsageMB || "0")}
            max={parseFloat(stats?.cloudLimitMB || "20000")}
            unit="MB"
            icon={Cloud}
            color="blue"
            variants={item}
            isSuperAdmin={((session?.user as any)?.role || "").toLowerCase() === "super_admin"}
            serverTotalMB={stats?.serverTotalMB || 0}
            serverUsedMB={stats?.serverUsedMB || 0}
            serverAvailableMB={stats?.serverAvailableMB || 0}
            onEdit={() => {
              const currentGB = stats?.cloudLimitMB === 0 ? "0" : ((stats?.cloudLimitMB || 0) / 1024).toFixed(1);
              setEditingQuotaKey("storage_limit_mb");
              setTempQuota(currentGB);
              setIsEditingQuota(true);
            }}
          />
          {/* Registration Toggle Card */}

        </div>

        {/* Storage Breakdown */}
        {stats?.storageDetails && stats.storageDetails.length > 0 && (
          <motion.div variants={item} className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-4xl p-8 shadow-xl shadow-zinc-200/40 dark:shadow-none transition-all duration-500 overflow-hidden relative mt-8">
            <div className="absolute top-0 right-0 p-8 pointer-events-none">
              <Folder className="w-32 h-32 text-zinc-50 dark:text-zinc-800/30 -rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                รายละเอียดการใช้พื้นที่ (Storage Breakdown)
              </h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                ขนาดไฟล์แยกตามหมวดหมู่และโฟลเดอร์ในระบบ
              </p>
            </div>
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.storageDetails
                .sort((a: any, b: any) => b.size - a.size)
                .filter((d: any) => d.size > 0)
                .map((detail: any, index: number) => {
                  const sizeMB = detail.size / (1024 * 1024);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 truncate">{detail.folder}</p>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">
                            {sizeMB < 0.01 ? "< 0.01 MB" : `${sizeMB.toFixed(2)} MB`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </motion.div>


      {/* --- Active Users Modal --- */}
      <AnimatePresence>
        {isActiveUsersModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsActiveUsersModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 p-8 pointer-events-none">
                <Users className="w-12 h-12 text-blue-500/10" />
              </div>

              <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">
                ผู้ใช้งานระบบขณะนี้
              </h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                รายชื่อผู้ใช้งานที่มีการเคลื่อนไหวในช่วง 15 นาทีที่ผ่านมา
              </p>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {loadingActiveUsers ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : activeUsersList.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 font-bold">
                    ไม่พบผู้ใช้งานในระบบขณะนี้
                  </div>
                ) : (
                  activeUsersList.map((u) => (
                    <div key={u._id} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase overflow-hidden shrink-0">
                        {u.image ? (
                          <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          (u.name || u.username || "?")[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white truncate">{u.name || u.username}</p>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase truncate">{u.role} • {u.username}</p>
                        {u.lastActivePath && (
                          <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold mt-0.5 truncate">
                            กำลังใช้งาน: {u.lastActivePath}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                          Online
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setIsActiveUsersModalOpen(false)}
                  className="w-full py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quota Edit Modal */}
      <AnimatePresence>
        {isEditingQuota && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditingQuota(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">ตั้งค่าขนาดความจุ</h3>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                กำหนดพื้นที่จัดเก็บสูงสุด (GB) ระบบจะแปลงเป็น MB อัตโนมัติ ป้อนเลข 0 หากไม่ต้องการจำกัด
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={tempQuota}
                    onChange={(e) => setTempQuota(e.target.value)}
                    className="w-full pl-5 pr-16 py-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:border-blue-500 dark:focus:border-blue-500 text-2xl font-black tracking-tighter transition-all"
                    placeholder="0"
                    autoFocus
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">GB</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
                  <button 
                    onClick={() => setTempQuota("0")}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                  >
                    🚀 ไม่จำกัดความจุ (0)
                  </button>
                  {editingQuotaKey === "storage_limit_mb" && stats?.serverTotalMB > 0 && (
                    <button 
                      onClick={() => setTempQuota((stats.serverTotalMB / 1024).toFixed(1))}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      💻 เต็มความจุเซิร์ฟเวอร์ ({(stats.serverTotalMB / 1024).toFixed(1)} GB)
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditingQuota(false)} className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">ยกเลิก</button>
                  <button onClick={handleSaveQuota} disabled={isSavingQuota} className="flex-2 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSavingQuota ? <Loader2 className="w-4 h-4 animate-spin" /> : "บันทึกการตั้งค่า"}
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
