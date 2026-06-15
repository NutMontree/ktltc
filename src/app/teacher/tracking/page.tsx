"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Map as MapIcon, Users, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

// Dynamically import map to avoid SSR issues with window/document
const MapComponent = dynamic(() => import("./MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">กำลังโหลดแผนที่ระบบ...</p>
    </div>
  )
});

export default function TrackingDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchLiveLocations = async () => {
    try {
      const res = await fetch("/api/tracking/live?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStudents(data.data || []);
          setLastUpdated(new Date());
          setError(null);
        } else {
          setError(data.message || "Failed to fetch locations");
        }
      }
    } catch (err) {
      console.error("Tracking Fetch Error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveLocations();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchLiveLocations, 15000);
    return () => clearInterval(interval);
  }, []);

  const outOfCampusCount = 0; // Future enhancement: Calculate distance from center to determine if out of bounds

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 py-8 md:py-12 relative h-screen flex flex-col pt-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <MapIcon size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              ระบบติดตามตำแหน่งนักเรียน <span className="text-blue-500">(Live GPS Tracking)</span>
            </h1>
          </div>
          <p className="text-sm font-medium text-zinc-500 max-w-2xl">
            ตรวจสอบตำแหน่งของนักเรียนที่เชื่อมต่อผ่านแอปพลิเคชันมือถือในรัศมีวิทยาลัย (อัปเดตอัตโนมัติทุก 15 วินาที)
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none"
        >
          <div className="flex flex-col items-end border-r border-zinc-200 dark:border-zinc-800 pr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">นักเรียนออนไลน์</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-500">{students.length}</span>
              <span className="text-xs font-bold text-zinc-500">คน</span>
            </div>
          </div>
          <div className="flex flex-col items-start pl-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">อัปเดตล่าสุด</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              {lastUpdated.toLocaleTimeString("th-TH")}
              <button onClick={fetchLiveLocations} className="text-blue-500 hover:text-blue-600 transition-colors" title="รีเฟรชข้อมูล">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Map Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 min-h-[500px] w-full rounded-4xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-4 relative shadow-2xl flex flex-col"
      >
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <MapIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">ไม่สามารถโหลดข้อมูลแผนที่ได้</h3>
            <p className="text-zinc-500">{error}</p>
          </div>
        ) : (
          <MapComponent students={students} />
        )}
      </motion.div>
    </div>
  );
}
