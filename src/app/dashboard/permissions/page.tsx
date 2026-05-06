"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiSave,
  FiLoader,
  FiLock,
  FiLayout,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
  FiLayers,
  FiNavigation,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

const FEATURE_LABELS: {
  [key: string]: { label: string; icon: any; color: string; isSuperAdminOnly?: boolean };
} = {
  access_dashboard: { label: "เข้าสู่ระบบ Dashboard", icon: FiLayout, color: "text-blue-500" },
  manage_users: { label: "จัดการบัญชี / โปรไฟล์", icon: FiUsers, color: "text-indigo-500" },
  manage_news: { label: "จัดการข่าว / ประชาสัมพันธ์", icon: FiFileText, color: "text-emerald-500" },
  manage_pages: { label: "จัดการเนื้อหาหน้าเว็บ", icon: FiLayers, color: "text-sky-500" },
  manage_attendance: { label: "รายงานปฏิบัติงาน (WFH)", icon: FiCalendar, color: "text-amber-500" },
  manage_qa: { label: "จัดการคำถาม Q&A", icon: FiMessageSquare, color: "text-rose-500" },
  manage_system: {
    label: "ระบบจัดการ / สิทธิ์ (SA Only)",
    icon: FiShield,
    color: "text-red-500",
    isSuperAdminOnly: true,
  },
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any>(null);
  const [roleLabels, setRoleLabels] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // For Adding Role
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleID, setNewRoleID] = useState("");
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/permissions");
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions);
        setRoleLabels(data.labels);
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
        [feature]: !prev[role][feature],
      },
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSavingRole("all");
      const updates = Object.keys(permissions)
        .filter((role) => role !== "super_admin")
        .map((role) => ({
          role,
          permissions: permissions[role],
        }));

      const res = await fetch("/api/admin/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
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

  const handleAddRole = async () => {
    if (!newRoleID || !newRoleLabel) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const idRegex = /^[a-z0-9_]+$/;
    if (!idRegex.test(newRoleID)) {
      toast.error("Role ID ต้องเป็นภาษาอังกฤษพิมพ์เล็กและตัวเลขเท่านั้น (เช่น teacher_expert)");
      return;
    }

    try {
      setIsAdding(true);
      const res = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRoleID, label: newRoleLabel }),
      });

      if (res.ok) {
        toast.success("เพิ่มบทบาทใหม่เรียบร้อยแล้ว");
        setShowAddModal(false);
        setNewRoleID("");
        setNewRoleLabel("");
        fetchPermissions();
      } else {
        const err = await res.json();
        toast.error(err.error || "ไม่สามารถเพิ่มบทบาทได้");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <FiLoader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          กำลังดึงข้อมูลสิทธิ์การเข้าถึง...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[140px] dark:bg-blue-600/10 animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-600/10 blur-[140px] dark:bg-indigo-600/10 animate-pulse delay-700" />
      </div>

      <div className="max-w-[1600px] mx-auto p-6 md:p-12 relative z-10">
        <Toaster position="top-right" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8 pb-10 border-b border-zinc-200 dark:border-zinc-800">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-600 border border-blue-600/20 shadow-lg shadow-blue-500/10">
                <FiShield size={24} strokeWidth={3} />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Security Module
                </span>
              </div>
            </motion.div>
            <div>
              <h1 className="text-4xl sm:text-6xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none flex flex-wrap items-center gap-x-4">
                <span className="uppercase italic">Role</span>
                <span className="text-blue-600 uppercase">Permissions</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm sm:text-lg mt-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600/20 rounded-full" />
                กำหนดสิทธิ์การเข้าถึงเมนูและฟังก์ชันต่างๆ แยกตามระดับผู้ใช้งาน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="hidden lg:flex bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 px-5 py-2.5 rounded-2xl items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-sm">
              <FiLock className="shrink-0" />
              <span>สิทธิ์ของ Super Admin ถูกล็อกไว้เพื่อความปลอดภัย</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all border-2 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none active:scale-95"
            >
              <FiUsers size={16} />
              <span>เพิ่มบทบาทใหม่</span>
            </button>
            <button
              onClick={handleSaveAll}
              disabled={savingRole === "all"}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/40 disabled:opacity-50"
            >
              {savingRole === "all" ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <FiSave size={16} />
              )}
              <span>บันทึกทั้งหมด</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-12">
            <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
              <div className="overflow-auto max-h-[75vh]">
                <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50/95 dark:bg-zinc-800/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest min-w-[140px] sticky top-0 left-0 z-50 bg-slate-50 dark:bg-zinc-800 border-b border-r border-zinc-200 dark:border-zinc-800">
                        Role / ระดับ
                      </th>
                      {Object.keys(FEATURE_LABELS).map((key) => (
                        <th
                          key={key}
                          className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center min-w-[110px] sticky top-0 z-40 bg-slate-50/95 dark:bg-zinc-800/95 border-b border-zinc-200 dark:border-zinc-800"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm ${FEATURE_LABELS[key].color}`}
                            >
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
                    {Object.keys(permissions || {}).map((role) => (
                      <motion.tr
                        key={role}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${role === "super_admin" ? "bg-blue-50/20 dark:bg-blue-900/10" : ""}`}
                      >
                        <td className="p-4 sticky left-0 z-30 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-1.5 h-6 rounded-full ${
                                role === "super_admin"
                                  ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                                  : role === "admin"
                                    ? "bg-amber-500"
                                    : role === "student"
                                      ? "bg-cyan-500"
                                      : "bg-slate-300"
                              }`}
                            ></div>
                            <div>
                              <div className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-xs">
                                {role}
                              </div>
                              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                {roleLabels[role] || "บทบาททั่วไป"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {Object.keys(FEATURE_LABELS).map((feature) => (
                          <td
                            key={feature}
                            className="p-2 text-center border-b border-zinc-50 dark:border-zinc-800/50"
                          >
                            {role === "super_admin" ? (
                              <div className="flex justify-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-800/50">
                                  <FiCheckCircle size={20} />
                                </div>
                              </div>
                            ) : (
                              <button
                                disabled={FEATURE_LABELS[feature].isSuperAdminOnly}
                                onClick={() =>
                                  !FEATURE_LABELS[feature].isSuperAdminOnly &&
                                  handleToggle(role, feature)
                                }
                                className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                  FEATURE_LABELS[feature].isSuperAdminOnly
                                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                                    : permissions[role][feature]
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600 hover:border-emerald-300"
                                }`}
                              >
                                {permissions[role][feature] &&
                                !FEATURE_LABELS[feature].isSuperAdminOnly ? (
                                  <FiCheckCircle size={20} />
                                ) : (
                                  <FiXCircle size={20} />
                                )}
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

        <div className="flex justify-end mt-12">
          <button
            onClick={handleSaveAll}
            disabled={savingRole === "all"}
            className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/40 disabled:opacity-50"
          >
            {savingRole === "all" ? (
              <FiLoader className="animate-spin" size={16} />
            ) : (
              <FiSave size={16} />
            )}
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>

        <div className="mt-16 bg-blue-600 rounded-[3.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-6 italic leading-none">
              Dynamic_Permission_System
            </h2>
            <p className="text-blue-100 font-medium text-lg leading-relaxed mb-8">
              สิทธิ์ที่กำหนดในหน้านี้จะมีผลทันทีต่อการแสดงผลเมนู Navbar และการเข้าถึง API ในอนาคต
              กรุณาตรวจสอบให้แน่ใจก่อนทำการบันทึกข้อมูลเนื่องจากจะมีผลต่อความปลอดภัยของข้อมูลหลักของวิทยาลัย
            </p>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-100">
                    Active Module
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                  <span className="text-xs font-black uppercase tracking-widest">v2.1.0</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 -mr-20 -mb-20">
            <FiShield size={450} />
          </div>
        </div>
      </div>

      {/* --- Add Role Modal --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border-2 border-zinc-100 dark:border-zinc-800 max-w-xl w-full overflow-hidden"
            >
              {/* Modal Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -ml-32 -mb-32" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/40">
                    <FiUsers size={28} strokeWidth={3} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                      Add New Role
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      เพิ่มบทบาทการเข้าถึงระบบ
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <label className="text-[11px] font-black text-zinc-400 group-hover:text-blue-500 transition-colors uppercase tracking-[0.2em] mb-3 block">
                      Role ID (English Only) / ภาษาอังกฤษ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="เช่น teacher_admin"
                        value={newRoleID}
                        onChange={(e) =>
                          setNewRoleID(e.target.value.toLowerCase().replace(/\s/g, "_"))
                        }
                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700">
                        <FiLock size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[11px] font-black text-zinc-400 group-hover:text-blue-500 transition-colors uppercase tracking-[0.2em] mb-3 block">
                      Role Name (Thai) / ภาษาไทย
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="เช่น หัวหน้างานหลักสูตร"
                        value={newRoleLabel}
                        onChange={(e) => setNewRoleLabel(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-5 text-lg text-zinc-900 dark:text-white font-black outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-700">
                        <FiLayout size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-5 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-black text-xs uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-700 active:scale-95"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleAddRole}
                      disabled={isAdding}
                      className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-500/40 disabled:opacity-50 disabled:scale-100"
                    >
                      {isAdding ? "กำลังสร้าง..." : "สร้างบทบาทใหม่"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
