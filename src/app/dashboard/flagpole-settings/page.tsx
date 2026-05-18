"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Save, Clock, ShieldCheck, Loader2, Calendar, MapPin, AlertCircle, Settings as SettingsIcon } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";

// โหลดคอมโพเนนต์แผนที่ระบุพิกัดเสาธงเฉพาะฝั่งไคลเอนต์
const MapFlagpoleSetting = dynamicImport(() => import("@/components/MapFlagpoleSetting"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">กำลังโหลดแผนที่ปักหมุดเสาธง...</p>
      </div>
    </div>
  ),
});

interface FlagpoleSetting {
  checkInStart: string; // HH:mm
  lateThreshold: string; // HH:mm
  checkInEnd: string; // HH:mm
  inSiteDistance: number; // เมตร
  closedDays: number[]; // วันอาทิตย์ = 0, วันเสาร์ = 6
  lat: number;          // ละติจูดของจุดเข้าแถวเสาธง
  lng: number;          // ลองจิจูดของจุดเข้าแถวเสาธง
}

export default function FlagpoleSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<FlagpoleSetting>({
    checkInStart: "07:00",
    lateThreshold: "08:00",
    checkInEnd: "08:45",
    inSiteDistance: 200,
    closedDays: [0, 6],
    lat: 14.754043,
    lng: 104.65807,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ตรวจจับสิทธิ์การเข้าถึงระดับแอดมิน
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role?.toLowerCase();
      if (!["super_admin", "admin"].includes(role)) {
        router.replace("/");
      }
    }
  }, [status, session]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/flagpole-settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error("ดึงข้อมูลการตั้งค่าเข้าแถวล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/flagpole-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("บันทึกกฎเวลาและพิกัดเสาธงสำเร็จ");
        fetchSettings();
      } else {
        toast.error("บันทึกการตั้งค่าล้มเหลว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
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
        <label className="block text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {label}
        </label>
        <div className="flex items-center bg-slate-50 dark:bg-zinc-800/50 rounded-2xl px-3 py-1 border border-slate-200 dark:border-zinc-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-sm group-hover:shadow-md">
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

  if (loading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">กำลังโหลดการตั้งค่าเสาธง...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:p-8 space-y-8 font-sans text-left">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-900 px-6 py-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none text-indigo-500">
          <SettingsIcon size={180} />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-5 bg-linear-to-br from-indigo-500 to-blue-600 text-white rounded-3xl shadow-lg shadow-indigo-500/20">
            <Clock size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              ตั้งค่าเวลาเข้าแถวหน้าเสาธง
            </h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-indigo-500" />
              เฉพาะผู้ดูแลระบบเสาธงนักศึกษา
            </p>
          </div>
        </div>
      </div>

      {/* Rule Controls Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Time Bounds Settings */}
          <div className="space-y-6 md:col-span-2">
            <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <Clock size={14} /> ช่วงเวลาเช็คชื่อเข้าแถวยามเช้า
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TimeInput
                label="เริ่มให้ลงเวลาเข้าแถว"
                value={settings.checkInStart || "07:00"}
                onChange={(val) => setSettings({ ...settings, checkInStart: val })}
              />
              <TimeInput
                label="เริ่มนับสถานะมาสาย (Late)"
                value={settings.lateThreshold || "08:00"}
                onChange={(val) => setSettings({ ...settings, lateThreshold: val })}
              />
              <TimeInput
                label="หมดเวลา/ปิดระบบเสาธง"
                value={settings.checkInEnd || "08:45"}
                onChange={(val) => setSettings({ ...settings, checkInEnd: val })}
              />
            </div>
          </div>

          {/* GPS Site Settings with Leaflet Interactive Map */}
          <div className="space-y-6 md:col-span-2 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <MapPin size={14} /> พิกัดและรัศมีลงเวลาหน้าเสาธง
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
                  <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <MapPin size={16} /> ระยะรัศมีพิกัด (เมตร)
                  </label>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-500 mb-4 leading-relaxed">
                    ระยะทางสูงสุดที่ระบุให้เป็น "หน้าเสาธง (In-Site)" หากพิกัด GPS นักเรียนห่างเกินค่านี้ ระบบจะไม่ยอมให้เช็คชื่อสำเร็จ
                  </p>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    value={settings.inSiteDistance || 200}
                    onChange={(e) => setSettings({ ...settings, inSiteDistance: parseInt(e.target.value) || 200 })}
                    className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800/50 text-xl font-black text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">ละติจูด (Latitude)</span>
                    <input
                      type="number"
                      step="any"
                      value={settings.lat}
                      onChange={(e) => setSettings({ ...settings, lat: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-sm font-black text-slate-800 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">ลองจิจูด (Longitude)</span>
                    <input
                      type="number"
                      step="any"
                      value={settings.lng}
                      onChange={(e) => setSettings({ ...settings, lng: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-sm font-black text-slate-800 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  💡 คำแนะนำ: ท่านสามารถลากหมุดสีน้ำเงินบนแผนที่ทางขวา หรือคลิกตำแหน่งใดๆ บนแผนที่เพื่อเลือกจุดศูนย์กลางของกิจกรรมเข้าแถวเสาธงได้โดยตรง ระบบจะอัปเดตละติจูดและลองจิจูดให้อัตโนมัติ!
                </p>
              </div>

              {/* Map Container selector */}
              <div className="h-[300px] lg:h-auto min-h-[320px] relative rounded-3xl overflow-hidden shadow-inner border border-slate-100 dark:border-zinc-850">
                <MapFlagpoleSetting
                  lat={settings.lat}
                  lng={settings.lng}
                  radius={settings.inSiteDistance}
                  onChange={(newLat, newLng) => setSettings({ ...settings, lat: newLat, lng: newLng })}
                />
              </div>
            </div>
          </div>

          {/* Weekly Closure Setup */}
          <div className="space-y-6 md:col-span-2 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <Calendar size={14} /> วันระงับเช็คชื่อเข้าแถว (Weekly Breaks)
            </h3>
            <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
              เลือกวันที่ต้องการระงับกิจกรรมหน้าเสาธง (ระบบจะไม่ยอมให้นักเรียนเช็คชื่อในวันนั้นๆ)
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
                const isSelected = (settings.closedDays || []).includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const current = settings.closedDays || [];
                      const next = isSelected
                        ? current.filter((d) => d !== idx)
                        : [...current, idx];
                      setSettings({ ...settings, closedDays: next });
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500/50 dark:text-indigo-400 shadow-md shadow-indigo-500/10"
                        : "bg-slate-50 border-slate-100 dark:bg-zinc-800/50 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 hover:border-slate-300 dark:hover:border-zinc-650"
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase mb-3 tracking-tighter">
                      {day}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-indigo-500 border-indigo-400" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/50 flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-blue-600 text-white px-8 py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            บันทึกกฎและพิกัดเสาธง
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-6 rounded-[2.5rem]">
        <p className="text-sm font-black text-indigo-800 dark:text-indigo-300 flex items-center gap-2 uppercase tracking-widest">
          <AlertCircle size={16} /> แนะนำการตั้งค่าพิกัดเสาธง
        </p>
        <ul className="mt-4 space-y-3 text-xs text-indigo-700/80 dark:text-indigo-400/80 font-bold leading-relaxed">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            การตั้งค่าช่วงเวลานี้ จะถูกนำไปตรวจสอบสิทธิ์แบบเรียลไทม์ฝั่งพอร์ทัลลงชื่อนักศึกษาทันทีที่มีการกดส่งข้อมูล
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            รัศมีเสาธงแนะนำควรปรับไว้ที่ 200 - 300 เมตร เพื่อให้รองรับกรณีคลาดเคลื่อนของ GPS บนเบราว์เซอร์ของโทรศัพท์มือถือเด็กนักเรียน
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
            การลากหมุดบนแผนที่ทำให้ปรับพิกัดได้อย่างอิสระ หากย้ายพิกัดเสาธงจริงของสถานศึกษา สามารถมาลากวางและกดบันทึก พิกัด geofencing ก็จะเปลี่ยนตามทันทีครับ
          </li>
        </ul>
      </div>
    </div>
  );
}
