"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Save, Clock, ShieldCheck, Loader2, Calendar, Trash2, Plus, MapPin, Globe, AlertCircle, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";

interface RoleSetting {
  role: string;
  roleName: string;
  checkInLimit?: string; // HH:mm
  checkOutStart?: string; // HH:mm
  checkOutEnd?: string; // HH:mm
  checkOutTime?: string; // Deprecated fallback
  // Global Fields
  checkInStart?: string;
  lateThreshold?: string;
  globalCheckOutStart?: string;
  globalCheckOutEnd?: string;
  systemLockStart?: string;
  systemLockEnd?: string;
  closedDays?: number[];
  inSiteDistance?: number;
  wfhMaxDistance?: number;
}

interface Holiday {
  _id?: string;
  date: string;
  name: string;
  type: string;
}

export default function AttendanceSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<RoleSetting[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });

  const fetchSettings = async () => {
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/admin/role-settings?t=${timestamp}`, {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error("ดึงข้อมูลการตั้งค่าล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/admin/holidays");
      if (res.ok) {
        const data = await res.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchHolidays();
  }, []);

  const handleUpdate = async (item: RoleSetting) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/role-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        toast.success(`บันทึกการตั้งค่าสำหรับ ${item.roleName} สำเร็จ`);
        fetchSettings();
      } else {
        toast.error("บันทึกข้อมูลล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const TimeInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
  }) => {
    const [h, m] = (value || "00:00").split(":");
    return (
      <div className="flex flex-col group">
        <label className="block text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {label}
        </label>
        <div className="flex items-center bg-slate-50 dark:bg-zinc-800/50 rounded-2xl px-3 py-1 border border-slate-200 dark:border-zinc-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm group-hover:shadow-md">
          <select
            className="bg-transparent py-2 text-lg font-black text-slate-800 dark:text-zinc-100 outline-none appearance-none cursor-pointer text-center w-full"
            value={h}
            onChange={(e) => onChange(`${e.target.value}:${m}`)}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i.toString().padStart(2, "0")} className="text-base">
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="font-black text-slate-300 dark:text-zinc-600 px-1">:</span>
          <select
            className="bg-transparent py-2 text-lg font-black text-slate-800 dark:text-zinc-100 outline-none appearance-none cursor-pointer text-center w-full"
            value={m}
            onChange={(e) => onChange(`${h}:${e.target.value}`)}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <option key={i} value={i.toString().padStart(2, "0")} className="text-base">
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold">กำลังโหลดข้อมูลการตั้งค่า...</p>
      </div>
    );
  }

  const globalSetting = settings.find((s) => s.role === "system_global");
  const roleSettings = settings.filter((s) => s.role !== "system_global");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:p-8 space-y-8 font-sans">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-900 px-4 py-8 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
          <SettingsIcon size={180} />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-3xl shadow-lg shadow-indigo-500/20">
            <Clock size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              ตั้งค่าระบบลงเวลา
            </h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" />
              {session?.user
                ? (session.user as any).role.replace("_", " ")
                : "HR / Administrator"}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Global Settings Section */}
      {globalSetting && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              กฎภาพรวมระบบ (Global Rules)
            </h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <Clock size={14} /> ช่วงเวลาการเข้างาน
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <TimeInput
                    label="เริ่มให้ลงเวลาเข้า"
                    value={globalSetting.checkInStart || "05:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, checkInStart: val }
                            : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="ตัดสาย (Late Threshold)"
                    value={globalSetting.lateThreshold || "08:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, lateThreshold: val }
                            : s,
                        ),
                      );
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <Clock size={14} /> ช่วงเวลาการออกงาน
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <TimeInput
                    label="เริ่มให้ลงเวลาออก"
                    value={globalSetting.checkOutStart || "16:30"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, checkOutStart: val }
                            : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="สิ้นสุดการลงออกงาน"
                    value={globalSetting.checkOutEnd || "18:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, checkOutEnd: val }
                            : s,
                        ),
                      );
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <ShieldCheck size={14} /> ช่วงเวลาปิดระบบ (System Lockout)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <TimeInput
                    label="เริ่มปิดระบบ"
                    value={globalSetting.systemLockStart || "18:01"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, systemLockStart: val }
                            : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="สิ้นสุดการปิดระบบ"
                    value={globalSetting.systemLockEnd || "04:59"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === "system_global"
                            ? { ...s, systemLockEnd: val }
                            : s,
                        ),
                      );
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <Calendar size={14} /> วันปิดระบบ (System Closure Days)
                </h3>
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                  เลือกวันที่ต้องการระงับการใช้งานระบบ (พนักงานจะไม่สามารถลงเวลาได้ในวันที่เลือก)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {[
                    "อาทิตย์",
                    "จันทร์",
                    "อังคาร",
                    "พุธ",
                    "พฤหัสบดี",
                    "ศุกร์",
                    "เสาร์",
                  ].map((day, idx) => {
                    const isSelected = (globalSetting.closedDays || []).includes(
                      idx,
                    );
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const current = globalSetting.closedDays || [];
                          const next = isSelected
                            ? current.filter((d) => d !== idx)
                            : [...current, idx];
                          setSettings(
                            settings.map((s) =>
                              s.role === "system_global"
                                ? { ...s, closedDays: next }
                                : s,
                            ),
                          );
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-4xl border-2 transition-all active:scale-95 ${
                          isSelected
                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500/50 dark:text-blue-400 shadow-md shadow-blue-500/10"
                            : "bg-slate-50 border-slate-100 dark:bg-zinc-800/50 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase mb-3 tracking-tighter">
                          {day}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 border-blue-400" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"}`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* การตั้งค่าระยะทาง */}
              <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
                <h3 className="text-xs font-black text-violet-600 uppercase tracking-[0.2em] bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <MapPin size={14} /> การตั้งค่าระยะทาง (Distance Settings)
                </h3>
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                  กำหนดระยะทางสำหรับตรวจสอบและประเมินสถานะการลงเวลา
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                    <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <MapPin size={16} /> ระยะทางในพื้นที่ (เมตร)
                    </label>
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-500 mb-4">
                      ระยะทางสูงสุดจากวิทยาลัยที่ถือว่า "อยู่ในพื้นที่ (In-Site)"
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={globalSetting.inSiteDistance || 200}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 200;
                        setSettings(
                          settings.map((s) =>
                            s.role === "system_global"
                              ? { ...s, inSiteDistance: val }
                              : s,
                          ),
                        );
                      }}
                      className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-700 text-xl font-black text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                    />
                  </div>
                  <div className="bg-violet-50 dark:bg-violet-900/10 p-5 rounded-3xl border border-violet-100 dark:border-violet-800/30 shadow-sm">
                    <label className="text-xs font-black text-violet-700 dark:text-violet-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Globe size={16} /> ระยะทาง WFH/Remote (กิโลเมตร)
                    </label>
                    <p className="text-[11px] font-medium text-violet-600 dark:text-violet-500 mb-4">
                      หากเกินกว่านี้ ระบบจะติดแท็ก "อยู่นอกพื้นที่"
                    </p>
                    <input
                      type="number"
                      min="1"
                      max="20000"
                      value={globalSetting.wfhMaxDistance || 200}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 200;
                        setSettings(
                          settings.map((s) =>
                            s.role === "system_global"
                              ? { ...s, wfhMaxDistance: val }
                              : s,
                          ),
                        );
                      }}
                      className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-violet-200 dark:border-violet-700 text-xl font-black text-violet-800 dark:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/50 flex justify-end">
              <button
                onClick={() => handleUpdate(globalSetting)}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                บันทึกกฎภาพรวม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1.1 Holiday Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-8 bg-rose-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            จัดการวันหยุดนักขัตฤกษ์ (Holidays)
          </h2>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Holiday Form */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mb-2">
                <Plus size={14} /> เพิ่มวันหยุดใหม่
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">วันที่</label>
                  <input 
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none font-bold focus:ring-2 focus:ring-rose-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">ชื่อวันหยุด</label>
                  <input 
                    type="text"
                    placeholder="เช่น วันขึ้นปีใหม่"
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 outline-none font-bold focus:ring-2 focus:ring-rose-500/50 transition-all"
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (!newHoliday.date || !newHoliday.name) return toast.error("กรุณากรอกข้อมูลให้ครบ");
                    setSaving(true);
                    try {
                      const res = await fetch("/api/admin/holidays", {
                        method: "POST",
                        body: JSON.stringify(newHoliday)
                      });
                      if (res.ok) {
                        toast.success("เพิ่มวันหยุดเรียบร้อย");
                        setNewHoliday({ date: "", name: "" });
                        fetchHolidays();
                      }
                    } catch (e) { toast.error("เกิดข้อผิดพลาด"); }
                    finally { setSaving(false); }
                  }}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> บันทึกวันหยุด
                </button>
              </div>
            </div>

            {/* Holiday List */}
            <div className="lg:col-span-8">
              <h3 className="text-xs font-black text-slate-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-4">
                รายการวันหยุดทั้งหมด
              </h3>
              <div className="h-[320px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {holidays.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl">
                    <Calendar size={48} className="mb-4 opacity-50" />
                    <span className="font-bold">ไม่มีข้อมูลวันหยุด</span>
                  </div>
                ) : (
                  holidays.map((h) => (
                    <div key={h._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-4xl border border-slate-100 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-zinc-100 text-lg">{h.name}</p>
                          <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                            {new Date(h.date).toLocaleDateString("th-TH", { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!confirm("ลบวันหยุดนี้ใช่หรือไม่?")) return;
                          await fetch(`/api/admin/holidays?id=${h._id}`, { method: 'DELETE' });
                          fetchHolidays();
                          toast.success("ลบวันหยุดเรียบร้อย");
                        }}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Role-Specific Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-8 bg-blue-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            การตั้งค่ารายตำแหน่ง (Role Specific)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {roleSettings.map((item) => (
            <div
              key={item.role}
              className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 group"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1 w-full lg:w-auto pb-4 lg:pb-0 border-b lg:border-b-0 border-slate-100 dark:border-zinc-800/50 pr-4">
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 mb-2">
                    {item.roleName}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck size={12} /> {item.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
                  <TimeInput
                    label="เริ่มลงเวลาเข้า"
                    value={item.checkInStart || "05:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === item.role ? { ...s, checkInStart: val } : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="เข้างาน (ตัดสาย)"
                    value={item.checkInLimit || "08:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === item.role ? { ...s, checkInLimit: val } : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="เริ่มลงเวลาออก"
                    value={item.checkOutStart || item.checkOutTime || "16:30"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === item.role ? { ...s, checkOutStart: val } : s,
                        ),
                      );
                    }}
                  />
                  <TimeInput
                    label="สิ้นสุดลงออกงาน"
                    value={item.checkOutEnd || "18:00"}
                    onChange={(val) => {
                      setSettings(
                        settings.map((s) =>
                          s.role === item.role ? { ...s, checkOutEnd: val } : s,
                        ),
                      );
                    }}
                  />
                </div>

                <div className="w-full lg:w-auto pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-800/50">
                  <button
                    onClick={() => handleUpdate(item)}
                    disabled={saving}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 dark:text-black dark:hover:text-white text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-6 rounded-[2.5rem]">
        <p className="text-sm font-black text-blue-800 dark:text-blue-300 flex items-center gap-2 uppercase tracking-widest">
          <AlertCircle size={16} /> คำแนะนำ
        </p>
        <ul className="mt-4 space-y-3 text-xs text-blue-700/80 dark:text-blue-400/80 font-bold">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            การตั้งค่า "เวลาเข้างาน" จะมีผลทันทีต่อการประมวลผลสถานะ "มาสาย"
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            กฎภาพรวมระบบ (Global Rules) จะใช้ควบคุมเวลาเปิด-ปิดการกดลงเวลาทั่วทั้งวิทยาลัยฯ ในหน้า Dashboard ของพนักงานทุกคน
          </li>
        </ul>
      </div>
    </div>
  );
}
