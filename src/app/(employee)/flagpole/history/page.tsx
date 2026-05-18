"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ChevronRight,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function FlagpoleHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/flagpole/history");
      if (res.ok) {
        const result = await res.json();
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching flagpole history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatusConfig = (status: string) => {
    if (status === "Present") {
      return { color: "emerald", icon: CheckCircle2, label: "มาตรงเวลา" };
    } else {
      return { color: "amber", icon: AlertTriangle, label: "มาเข้าแถวสาย" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 font-sans selection:bg-indigo-500/30 relative overflow-hidden text-left">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/wfh"
            className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mb-2">
              ประวัติเข้าแถว <span className="text-indigo-600">เสาธง</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em] pl-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              บันทึกกิจกรรมหน้าเสาธงรายวัน
            </p>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-3xl p-4 border border-slate-100 dark:border-zinc-800 animate-pulse h-28"
                />
              ))}
            </motion.div>
          ) : history.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-4xl border border-dashed border-slate-200 dark:border-zinc-800 shadow-inner"
            >
              <CalendarDays className="w-16 h-16 text-slate-200 dark:text-zinc-800 mx-auto mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs mb-2">
                ไม่พบประวัติการเข้าแถว
              </p>
              <p className="text-[10px] text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                ลงชื่อเข้าแถวเพื่อบันทึกประวัติของคุณ
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="history-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {history.map((record, index) => {
                const cfg = getStatusConfig(record.status);
                const checkInDate = record.checkIn?.time ? new Date(record.checkIn.time) : new Date(record.date);
                return (
                  <motion.div
                    key={record._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-slate-100 dark:border-zinc-800 shadow-xl shadow-black/2 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {/* Date Badge */}
                      <div className="bg-slate-50 dark:bg-zinc-950 w-20 h-20 rounded-4xl flex flex-col items-center justify-center shadow-inner border border-slate-100 dark:border-zinc-800 group-hover:scale-105 transition-all">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                          {format(checkInDate, "MMM", { locale: th })}
                        </span>
                        <span className="text-3xl font-black text-slate-800 dark:text-white leading-none mt-1 tracking-tighter">
                          {format(checkInDate, "dd")}
                        </span>
                      </div>

                      {/* Detail */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                            {format(checkInDate, "EEEE", { locale: th })}
                          </h3>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                              cfg.color === "emerald"
                                ? "border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "border-amber-100 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            }`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-bold text-slate-400">
                          {record.checkIn?.time && (
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-indigo-500" />
                              <span>
                                เวลาสแกน: {format(new Date(record.checkIn.time), "HH:mm:ss")} น.
                              </span>
                            </div>
                          )}
                          {record.checkIn?.statusTag && (
                            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-zinc-800 pl-6">
                              <MapPin size={12} className="text-indigo-500" />
                              <span>{record.checkIn.statusTag}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image preview & Arrow */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t border-slate-50 dark:border-zinc-800 md:border-none pt-4 md:pt-0">
                      {record.checkIn?.photoUrl && (
                        <Link
                          href={record.checkIn.photoUrl}
                          target="_blank"
                          className="w-10 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-md hover:scale-105 transition-all block shrink-0"
                        >
                          <img
                            src={record.checkIn.photoUrl}
                            alt="Capture"
                            className="w-full h-full object-cover"
                          />
                        </Link>
                      )}
                      <ChevronRight className="text-slate-300" size={20} />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-12 pb-8 text-center border-t border-slate-100 dark:border-zinc-900/50">
          <p className="text-[9px] text-slate-300 dark:text-zinc-800 font-black uppercase tracking-[0.4em] leading-loose">
            ระบบตรวจสอบสิทธิ์เช็คชื่อเข้าแถวเสาธง KTLTC <br />
            จัดเก็บและตรวจสอบข้อมูลความถูกต้องฝั่งเซิร์ฟเวอร์
          </p>
        </div>
      </div>
    </div>
  );
}
