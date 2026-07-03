"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, Map as MapIcon, Users, RefreshCw, Settings, Search, UserCircle, Clock, ExternalLink } from "lucide-react";
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
    let interval: NodeJS.Timeout;
    
    const init = async () => {
      const intervalSec = await fetchConfig();
      await fetchLiveLocations();
      
      interval = setInterval(fetchLiveLocations, intervalSec * 1000);
    };
    
    init();
    return () => clearInterval(interval);
  }, []);

  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (student.name && student.name.toLowerCase().includes(q)) ||
      (student.username && student.username.toLowerCase().includes(q))
    );
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-full mx-auto w-full px-2 md:px-6 py-6 md:py-8 relative h-screen flex flex-col pt-20 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <MapIcon size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              ระบบติดตามตำแหน่ง <span className="text-blue-500">(Live Tracking)</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-zinc-500 max-w-xl">
              ติดตามตำแหน่งและข้อมูลของนักเรียนที่ถูกสแกนอนุญาตให้ออกนอกวิทยาลัยแบบเรียลไทม์
            </p>
            <Link href="/teacher/tracking/settings" className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 transition-all flex items-center gap-2">
              <Settings size={14} /> ตั้งค่าแผนที่
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none shrink-0"
        >
          <div className="flex flex-col items-end border-r border-zinc-200 dark:border-zinc-800 pr-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">อยู่ข้างนอก</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-rose-500">{students.length}</span>
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

      {/* Main Content Layout (Grid Split) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        
        {/* Left Side: Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-2 shadow-2xl relative flex flex-col overflow-hidden"
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
            <div className="flex-1 w-full rounded-4xl overflow-hidden relative">
              <MapComponent students={students} config={trackingConfig} />
            </div>
          )}
        </motion.div>

        {/* Right Side: Active Students List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1 rounded-[2.5rem] bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col"
        >
          {/* Header of the list */}
          <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              <Users size={18} className="text-blue-500" />
              รายชื่อนักศึกษาที่อยู่ข้างนอก
            </h2>
            
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
                      
                      {/* Time out badge + Google Maps */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg w-fit border border-rose-100 dark:border-rose-900/50">
                          <Clock size={12} />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            ออกเมื่อ: {formatTime(student.scannedOutAt)}
                          </span>
                        </div>
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
