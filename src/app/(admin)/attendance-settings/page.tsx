"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Save, Clock, ShieldCheck, Loader2 } from "lucide-react";
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
}

export default function AttendanceSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<RoleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchSettings();
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
      <div className="flex flex-col">
        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
        <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-2xl px-2">
          <select
            className="bg-transparent px-2 py-3 text-lg font-black text-zinc-800 dark:text-zinc-100 outline-none appearance-none cursor-pointer"
            value={h}
            onChange={(e) => onChange(`${e.target.value}:${m}`)}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i.toString().padStart(2, "0")}>
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="font-black text-zinc-400">:</span>
          <select
            className="bg-transparent px-2 py-3 text-lg font-black text-zinc-800 dark:text-zinc-100 outline-none appearance-none cursor-pointer"
            value={m}
            onChange={(e) => onChange(`${h}:${e.target.value}`)}
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <option key={i} value={i.toString().padStart(2, "0")}>
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
    <div className="max-w-4xl mx-auto px-2 py-4 md:p-10 font-sans overflow-x-hidden">
      <Toaster />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl md:rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm shadow-blue-500/5">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-500/20">
            <Clock size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              ตั้งค่าระบบลงเวลา
            </h1>
            <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              {session?.user
                ? (session.user as any).role.replace("_", " ")
                : "HR / Administrator"}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Global Settings Section */}
      {globalSetting && (
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 ml-2">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">
              กฎภาพรวมระบบ (Global Rules)
            </h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} className="text-blue-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                  ช่วงเวลาการเข้างาน
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
                <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg inline-block">
                  ช่วงเวลาการออกงาน
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

              <div className="md:col-span-2 space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg inline-block">
                  ช่วงเวลาปิดระบบ (System Lockout)
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

              <div className="md:col-span-2 space-y-6 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1 rounded-lg inline-block">
                  วันปิดระบบ (System Closure Days)
                </h3>
                <p className="text-xs font-bold text-zinc-400 -mt-4 ml-1">
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
                        className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300"
                            : "bg-zinc-50 border-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase mb-2 tracking-tighter">
                          {day}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/20" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"}`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => handleUpdate(globalSetting)}
                disabled={saving}
                className="flex items-center gap-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                บันทึกกฎภาพรวม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Role-Specific Settings Section */}
      <div className="mb-6 ml-2 flex items-center gap-3">
        <div className="w-2 h-8 bg-zinc-400 rounded-full" />
        <h2 className="text-2xl font-black text-zinc-800 dark:text-white uppercase tracking-tight">
          การตั้งค่ารายตำแหน่ง (Role Specific)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roleSettings.map((item) => (
          <div
            key={item.role}
            className="bg-white dark:bg-zinc-900 p-4 rounded-3xl md:rounded-4xl border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5 group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-black text-zinc-800 dark:text-zinc-100 mb-1">
                  {item.roleName}
                </h3>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  บทบาทสิทธิ์:{" "}
                  <span className="text-blue-500">{item.role}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full sm:w-auto">
                <TimeInput
                  label="เริ่มให้ลงเวลาเข้า"
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
                  label="เริ่มให้ลงเวลาออก"
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
                  label="สิ้นสุดการลงออกงาน"
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

              <button
                onClick={() => handleUpdate(item)}
                disabled={saving}
                className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
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
        ))}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 p-4 rounded-3xl">
        <p className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
          💡 คำแนะนำ:
        </p>
        <ul className="mt-3 space-y-2 text-xs text-blue-700/70 dark:text-blue-400/70 font-medium">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
            การตั้งค่า "เวลาเข้างาน" จะมีผลทันทีต่อการประมวลผลสถานะ "มาสาย"
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
            กฎภาพรวมระบบ (Global Rules)
            จะใช้ควบคุมเวลาเปิด-ปิดการกดลงเวลาทั่วทั้งวิทยาลัยฯ
          </li>
        </ul>
      </div>
    </div>
  );
}
