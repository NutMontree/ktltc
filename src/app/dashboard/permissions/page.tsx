"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  FiShield, 
  FiCheckCircle, 
  FiXCircle, 
  FiSave, 
  FiLoader,
  FiInfo,
  FiLock,
  FiLayout,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiSettings,
  FiMessageSquare
} from "react-icons/fi";
import { motion } from "framer-motion";

const FEATURE_LABELS: { [key: string]: { label: string, icon: any, color: string } } = {
  access_dashboard: { label: "เข้าถึง Dashboard", icon: FiLayout, color: "text-blue-500" },
  manage_users: { label: "จัดการผู้ใช้งาน", icon: FiUsers, color: "text-indigo-500" },
  manage_news: { label: "จัดการส่วนข่าว", icon: FiFileText, color: "text-emerald-500" },
  manage_pages: { label: "จัดการเนื้อหาหน้า", icon: FiLayout, color: "text-sky-500" },
  manage_attendance: { label: "จัดการการลงเวลา/รายงาน", icon: FiCalendar, color: "text-amber-500" },
  manage_qa: { label: "จัดการคำถาม Q&A", icon: FiMessageSquare, color: "text-rose-500" },
};

const ROLE_LABELS: { [key: string]: string } = {
  super_admin: "ผู้ดูแลระบบสูงสุด",
  admin: "ผู้ดูแลระบบ",
  editor: "บรรณาธิการ",
  hr: "ฝ่ายบุคคล",
  director: "ผู้อำนวยการ",
  deputy_resource: "รอง ผอ. (บริหารทรัพยากร)",
  deputy_strategy: "รอง ผอ. (ยุทธศาสตร์)",
  deputy_academic: "รอง ผอ. (วิชาการ)",
  deputy_student_affairs: "รอง ผอ. (กิจการนักเรียน)",
  teacher: "ครู",
  janitor: "แม่บ้าน/นักการ",
  staff: "เจ้าหน้าที่",
  student: "นักเรียน",
  user: "สมาชิกทั่วไป",
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลสิทธิ์ได้");
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleToggle = (role: string, feature: string) => {
    if (role === "super_admin") return; // Protection

    setPermissions((prev: any) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [feature]: !prev[role][feature]
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSavingRole("all");
      const updates = Object.keys(permissions)
        .filter(role => role !== "super_admin")
        .map(role => ({
          role,
          permissions: permissions[role]
        }));

      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });

      if (res.ok) {
        toast.success("บันทึกการตั้งค่าทั้งหมดเรียบร้อยแล้ว");
      } else {
        const err = await res.json();
        toast.error(err.error || "บันทึกล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSavingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          กำลังดึงข้อมูลสิทธิ์การเข้าถึง...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 md:p-10">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <FiShield className="text-blue-600" /> Role_Permissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            กำหนดสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ แยกตามระดับผู้ใช้งาน
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 px-4 py-2 rounded-2xl items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <FiInfo className="shrink-0" />
            <span>สิทธิ์ของ Super Admin ถูกล็อกไว้</span>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={savingRole === "all"}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {savingRole === "all" ? <FiLoader className="animate-spin" /> : <FiSave />}
            <span>บันทึกทั้งหมด</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-12">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">
                      Role / ระดับผู้ใช้
                    </th>
                    {Object.keys(FEATURE_LABELS).map(key => (
                      <th key={key} className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${FEATURE_LABELS[key].color}`}>
                            {(() => {
                              const Icon = FEATURE_LABELS[key].icon;
                              return <Icon size={18} />;
                            })()}
                          </div>
                          <span className="max-w-[100px] text-center leading-tight">
                            {FEATURE_LABELS[key].label}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {Object.keys(permissions || {}).map(role => (
                    <motion.tr 
                      key={role}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${role === 'super_admin' ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${
                            role === 'super_admin' ? 'bg-rose-500' :
                            role === 'admin' ? 'bg-amber-500' :
                            role === 'student' ? 'bg-cyan-500' : 'bg-slate-300'
                          }`}></div>
                          <div>
                            <div className="font-black text-slate-800 dark:text-white uppercase tracking-tight">
                              {role}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {ROLE_LABELS[role] || "บทบาททั่วไป"}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {Object.keys(FEATURE_LABELS).map(feature => (
                        <td key={feature} className="p-6 text-center">
                          {role === 'super_admin' ? (
                            <div className="flex justify-center">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-800/50">
                                <FiCheckCircle size={20} />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggle(role, feature)}
                              className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                permissions[role][feature] 
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 hover:border-emerald-300"
                              }`}
                            >
                              {permissions[role][feature] ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                            </button>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-blue-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">
            Dynamic_Permission_System
          </h2>
          <p className="text-blue-100 font-medium text-lg leading-relaxed mb-6">
            สิทธิ์ที่กำหนดในหน้านี้จะมีผลทันทีต่อการแสดงผลเมนู Navbar และการเข้าถึง API ในอนาคต 
            กรุณาตรวจสอบให้แน่ใจก่อนทำการบันทึกข้อมูลเนื่องจากจะมีผลต่อความปลอดภัยของข้อมูล
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-sm font-bold uppercase tracking-wider text-emerald-100">Active</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
              <span className="text-sm font-bold uppercase tracking-wider">v1.2.0</span>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 -mr-20 -mb-20">
          <FiShield size={400} />
        </div>
      </div>
    </div>
  );
}
