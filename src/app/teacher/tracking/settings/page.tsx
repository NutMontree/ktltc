"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Save, Map as MapIcon, ShieldCheck, Loader2, MapPin, AlertCircle, Settings as SettingsIcon, Clock, ChevronLeft } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamicImport from "next/dynamic";
import Link from "next/link";

// โหลดคอมโพเนนต์แผนที่ระบุพิกัดแบบเดียวกับ flagpole
const MapSetting = dynamicImport(() => import("@/components/MapFlagpoleSetting"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 dark:bg-zinc-900 animate-pulse flex items-center justify-center text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest">กำลังโหลดแผนที่ปักหมุด...</p>
      </div>
    </div>
  ),
});

interface TrackingSetting {
  campusCenterLat: number;
  campusCenterLng: number;
  geofenceRadius: number;
  refreshIntervalSeconds: number;
}

export default function TrackingSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<TrackingSetting>({
    campusCenterLat: 14.754043,
    campusCenterLng: 104.65807,
    geofenceRadius: 500,
    refreshIntervalSeconds: 15,
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
        router.replace("/teacher/tracking");
      }
    }
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/tracking/config", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setSettings({
            campusCenterLat: data.data.campusCenterLat,
            campusCenterLng: data.data.campusCenterLng,
            geofenceRadius: data.data.geofenceRadius,
            refreshIntervalSeconds: data.data.refreshIntervalSeconds
          });
        }
      }
    } catch (error) {
      toast.error("ดึงข้อมูลการตั้งค่าล้มเหลว");
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
      const res = await fetch("/api/tracking/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("บันทึกการตั้งค่าแผนที่ติดตามสำเร็จ");
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

  if (loading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">กำลังโหลดการตั้งค่าแผนที่...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-24 md:p-8 md:pt-24 space-y-8 font-sans text-left">
      <Toaster position="top-right" />
      
      <Link href="/teacher/tracking" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors text-sm font-bold">
        <ChevronLeft size={16} /> กลับไปหน้าแผนที่
      </Link>

      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-900 px-6 py-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none text-blue-500">
          <SettingsIcon size={180} />
        </div>
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-5 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-500/20">
            <MapIcon size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              ตั้งค่าแผนที่ระบบติดตามนักเรียน
            </h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" />
              เฉพาะผู้ดูแลระบบ (Admin)
            </p>
          </div>
        </div>
      </div>

      {/* Rule Controls Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
        <div className="grid grid-cols-1 gap-8 relative z-10">
          
          {/* GPS Site Settings with Leaflet Interactive Map */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <MapPin size={14} /> พิกัดและรัศมีวิทยาลัย
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
                  <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <MapPin size={16} /> รัศมีขอบเขตวิทยาลัย (เมตร)
                  </label>
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-500 mb-4 leading-relaxed">
                    ปรับขนาดของวงกลมสีฟ้าที่แสดงขอบเขตของวิทยาลัยบนแผนที่
                  </p>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    value={settings.geofenceRadius || 500}
                    onChange={(e) => setSettings({ ...settings, geofenceRadius: parseInt(e.target.value) || 500 })}
                    className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800/50 text-xl font-black text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">ละติจูด (Latitude)</span>
                    <input
                      type="number"
                      step="any"
                      value={settings.campusCenterLat}
                      onChange={(e) => setSettings({ ...settings, campusCenterLat: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-sm font-black text-slate-800 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2 ml-1">ลองจิจูด (Longitude)</span>
                    <input
                      type="number"
                      step="any"
                      value={settings.campusCenterLng}
                      onChange={(e) => setSettings({ ...settings, campusCenterLng: parseFloat(e.target.value) || 0 })}
                      className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-sm font-black text-slate-800 dark:text-zinc-100 outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-slate-400 leading-relaxed italic bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  💡 คำแนะนำ: ท่านสามารถลากหมุดบนแผนที่ทางขวา หรือคลิกตำแหน่งใดๆ บนแผนที่เพื่อเลือกจุดศูนย์กลางของวิทยาลัยได้โดยตรง ระบบจะอัปเดตละติจูดและลองจิจูดให้อัตโนมัติ!
                </p>
              </div>

              {/* Map Container selector */}
              <div className="h-[300px] lg:h-auto min-h-[320px] relative rounded-3xl overflow-hidden shadow-inner border border-slate-100 dark:border-zinc-850">
                <MapSetting
                  lat={settings.campusCenterLat}
                  lng={settings.campusCenterLng}
                  radius={settings.geofenceRadius}
                  onChange={(newLat, newLng) => setSettings({ ...settings, campusCenterLat: newLat, campusCenterLng: newLng })}
                />
              </div>
            </div>
          </div>

          {/* Refresh Config */}
          <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-zinc-800/50">
            <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <Clock size={14} /> การรีเฟรชข้อมูลแผนที่
            </h3>
            
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm max-w-sm">
              <label className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                ความถี่ในการรีเฟรช (วินาที)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={settings.refreshIntervalSeconds || 15}
                onChange={(e) => setSettings({ ...settings, refreshIntervalSeconds: parseInt(e.target.value) || 15 })}
                className="w-full px-5 py-3 mt-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-lg font-black text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
              <p className="text-[10px] text-slate-500 mt-2 font-medium">แนะนำที่ 15 วินาที เพื่อไม่ให้โหลดฐานข้อมูลหนักเกินไป</p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/50 flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white px-8 py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            บันทึกการตั้งค่าแผนที่
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-6 rounded-[2.5rem]">
        <p className="text-sm font-black text-blue-800 dark:text-blue-300 flex items-center gap-2 uppercase tracking-widest">
          <AlertCircle size={16} /> แนะนำการใช้งานแผนที่ติดตาม
        </p>
        <ul className="mt-4 space-y-3 text-xs text-blue-700/80 dark:text-blue-400/80 font-bold leading-relaxed">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            พิกัดที่ตั้งค่าในหน้านี้ จะเป็นจุดเริ่มต้นเวลาที่โหลดหน้าต่างระบบติดตามนักเรียนเสมอ
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            การตั้งความถี่ในการรีเฟรช (Refresh Interval) เร็วเกินไป อาจจะทำให้เกิดการเรียกใช้ API มากเกินไปและเปลืองทรัพยากรเครื่องเซิร์ฟเวอร์
          </li>
        </ul>
      </div>
    </div>
  );
}
