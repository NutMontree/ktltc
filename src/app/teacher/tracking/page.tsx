"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Map as MapIcon, Users, RefreshCw, Settings, Search, UserCircle, Clock, ExternalLink, ChevronDown, ChevronUp, List, Wifi, WifiOff, Phone, History } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Dynamically import map to avoid SSR issues with window/document
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 min-h-[500px]">
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
  const [searchQuery, setSearchQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [trackingConfig, setTrackingConfig] = useState({
    campusCenterLat: 14.754043,
    campusCenterLng: 104.65807,
    geofenceRadius: 500,
    refreshIntervalSeconds: 15
  });

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/tracking/config");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setTrackingConfig(data.data);
          return data.data.refreshIntervalSeconds;
        }
      }
    } catch (err) {
      console.error("Failed to fetch tracking config");
    }
    return 15;
  };

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
    // Fetch config on mount
    fetchConfig().then((intervalSeconds) => {
      fetchLiveLocations();

      const interval = setInterval(() => {
        fetchLiveLocations();
      }, intervalSeconds * 1000);

      return () => clearInterval(interval);
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(q)) ||
      (student.username && student.username.toLowerCase().includes(q))
    );
  });

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeStr = date.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `วันนี้ ${timeStr}`;
    }

    const dateStr = date.toLocaleDateString("th-TH", {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
    });
    return `${dateStr} ${timeStr}`;
  };

  // Check if GPS is stale (no update for 30+ seconds = student closed browser)
  const isGpsOnline = (student: any) => {
    if (!student.currentLocation?.updatedAt) return false;
    const lastUpdate = new Date(student.currentLocation.updatedAt).getTime();
    const now = Date.now();
    return (now - lastUpdate) < 30000; // 30 seconds threshold
  };

  return (
    <div className="max-w-full mx-auto w-full px-2 md:px-6 py-4 md:py-6 relative h-screen flex flex-col  overflow-hidden">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-8 shrink-0 relative z-10">
        {/* Left side: Title & Description */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-4 border border-blue-100 dark:border-blue-800/50">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Live GPS Tracking
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 tracking-tight mb-3">
            ระบบติดตามตำแหน่ง <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-green-600">(Live Tracking)</span>
          </h1>
          <p className="text-zinc-500 font-medium max-w-2xl text-sm md:text-base">
            ติดตามตำแหน่งและข้อมูลของนักเรียนที่ถูกสแกนอนุญาตให้ออกนอกวิทยาลัยแบบเรียลไทม์ผ่านระบบพิกัด GPS ความแม่นยำสูง
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/teacher/tracking/history" className="px-5 py-2.5 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 transition-all flex items-center gap-2 hover:-translate-y-0.5">
              <History size={16} /> ประวัติการเข้า-ออก
            </Link>
            <Link href="/teacher/tracking/settings" className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-bold shadow-md shadow-zinc-200/20 dark:shadow-none border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-2 hover:-translate-y-0.5">
              <Settings size={16} /> ตั้งค่าแผนที่
            </Link>
          </div>
        </motion.div>

        {/* Right side: Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl p-5 rounded-3xl border border-white dark:border-zinc-800 shadow-2xl shadow-blue-500/10 shrink-0"
        >
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">อยู่ข้างนอกตอนนี้</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-br from-rose-500 to-orange-500 drop-shadow-sm">{students.length}</span>
              <span className="text-sm font-bold text-zinc-500">คน</span>
            </div>
          </div>

          <div className="w-px h-16 bg-linear-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent"></div>

          <div className="flex flex-col items-start px-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">อัปเดตตำแหน่งล่าสุด</span>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 font-mono font-bold text-lg tracking-wider border border-blue-100 dark:border-blue-800/50">
                {mounted ? lastUpdated.toLocaleTimeString("th-TH") : "--:--:--"}
              </div>
              <button
                onClick={fetchLiveLocations}
                className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-md border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-blue-500 hover:border-blue-200 transition-all hover:rotate-180 duration-500"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content: Map fills all space, List overlays on top */}
      <div className="flex-1 relative rounded-[2.5rem] overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl">

        {/* Full-size Map */}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <MapIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">ไม่สามารถโหลดข้อมูลแผนที่ได้</h3>
            <p className="text-zinc-500">{error}</p>
          </div>
        ) : (
          <div className="absolute inset-0">
            <MapComponent students={students} config={trackingConfig} />
          </div>
        )}

        {/* Floating Student List Panel (overlay) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`absolute top-4 right-4 w-[min(340px,calc(100%-2rem))] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col z-500 transition-all duration-300 ${listOpen ? 'max-h-[calc(100%-2rem)]' : 'max-h-[48px]'
            }`}
        >
          {/* Header - always visible, acts as toggle */}
          <button
            onClick={() => setListOpen(!listOpen)}
            className="p-3 px-4 flex items-center gap-2 w-full text-left shrink-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <Users size={16} className="text-blue-500" />
            <span className="text-sm font-black text-zinc-900 dark:text-white">รายชื่อ</span>
            <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] font-black px-2 py-0.5 rounded-full">{students.length} คน</span>
            <span className="ml-auto text-zinc-400">
              {listOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </span>
          </button>

          {/* Expandable content */}
          {listOpen && (
            <>
              <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ หรือ รหัส..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* List Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading && students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                    <p className="text-xs font-bold uppercase tracking-widest">กำลังดึงข้อมูล...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-400 px-4">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                      <Users size={24} className="opacity-50" />
                    </div>
                    <h3 className="font-bold text-zinc-600 dark:text-zinc-300 mb-1">ไม่พบรายชื่อ</h3>
                    <p className="text-xs">
                      {searchQuery ? "ไม่พบนักเรียนที่ค้นหา" : "ตอนนี้นักเรียนทุกคนอยู่ในวิทยาลัยครับ!"}
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredStudents.map((student) => (
                      <motion.div
                        key={student._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md transition-all group flex items-start gap-4"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {student.image ? (
                            <Image src={student.image} alt={student.name || "Student"} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <UserCircle size={24} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm text-zinc-900 dark:text-white truncate">
                            {student.name || "ไม่ทราบชื่อ"}
                          </h4>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5 truncate">
                            {student.username || "N/A"}
                          </p>
                          {student.phone && (
                            <a href={`tel:${student.phone}`} className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 mt-0.5 transition-colors">
                              <Phone size={10} />
                              {student.phone}
                            </a>
                          )}

                          {/* Department and Level Info */}
                          {(student.department || student.academicLevel || student.classroomName) && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {student.department && (
                                <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded shrink-0 truncate max-w-full">
                                  {student.department}
                                </span>
                              )}
                              {(student.academicLevel || student.classroomName) && (
                                <span className="text-[10px] bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-1.5 py-0.5 rounded shrink-0">
                                  {student.academicLevel} {student.classroomName || student.groupCode}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Time out badge + GPS status + Google Maps */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg w-fit border border-rose-100 dark:border-rose-900/50">
                              <Clock size={12} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                ออกเมื่อ: {formatDateTime(student.scannedOutAt)}
                              </span>
                            </div>
                            {/* GPS Status Badge */}
                            {isGpsOnline(student) ? (
                              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                <Wifi size={10} />
                                <span className="text-[10px] font-black uppercase tracking-wider">GPS</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                <WifiOff size={10} />
                                <span className="text-[10px] font-black uppercase tracking-wider">GPS ปิด</span>
                              </div>
                            )}
                            <a
                              href={`https://www.google.com/maps?q=${student.currentLocation?.latitude || trackingConfig.campusCenterLat},${student.currentLocation?.longitude || trackingConfig.campusCenterLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <ExternalLink size={10} />
                              <span className="text-[10px] font-black uppercase tracking-wider">Maps</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}</style>
    </div>
  );
}
