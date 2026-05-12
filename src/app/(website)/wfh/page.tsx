"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  LogOut,
  Clock,
  CalendarDays,
  User,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  History,
  ClipboardList,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function WFHHubPage() {
  const { data: session } = useSession();

  const [time, setTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<{
    name: string;
    image: string | null;
  }>({
    name: "",
    image: null,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Fetch latest profile data
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfileData({
            name: data.name || data.username || "",
            image: data.image || null,
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();

    return () => clearInterval(timer);
  }, []);

  const userName = profileData.name || session?.user?.name || "พนักงาน (คุณ)";
  const userImage = profileData.image || session?.user?.image || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 px-2 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto relative z-10 space-y-8">
        {/* Profile Card - Premium ID Badge Look */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden border border-slate-100 dark:border-zinc-800 p-6 relative group transition-all hover:shadow-2xl hover:shadow-blue-500/5"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all group-hover:rotate-12">
            <User size={100} className="text-blue-500" />
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
            <div className="relative group/avatar">
              <div className="h-24 w-24 rounded-4xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-2xl shadow-black/10 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-300 dark:text-zinc-700" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck size={14} className="text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h1
                className="font-black text-2xl sm:text-3xl text-slate-800 dark:text-white leading-none tracking-tight truncate max-w-[280px] mx-auto md:mx-0"
                title={userName}
              >
                {userName}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> WFH ACTIVE
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clock Section - Modern Minimalist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-blue-500/5 overflow-hidden border border-slate-100 dark:border-zinc-800 p-10 text-center relative group"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 to-indigo-600 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-slate-400">
              <Clock size={28} />
            </div>
          </div>
          <div className="text-7xl font-black tracking-tighter text-slate-800 dark:text-white font-mono flex items-baseline justify-center gap-1 drop-shadow-sm">
            {mounted
              ? time.toLocaleTimeString("th-TH", {
                  timeZone: "Asia/Bangkok",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
            <span className="text-3xl text-blue-500/40 font-bold ml-1">
              {mounted ? time.getSeconds().toString().padStart(2, "0") : "--"}
            </span>
          </div>
          <div className="flex items-center justify-center text-slate-400 dark:text-zinc-500 gap-3 mt-6">
            <CalendarDays size={18} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              {mounted
                ? time.toLocaleDateString("th-TH", {
                    timeZone: "Asia/Bangkok",
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "LOADING..."}
            </span>
          </div>
        </motion.div>

        {/* Action Buttons - Tactile & Color Coded */}
        <div className="grid grid-cols-1 gap-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-2 px-6">
            ลงเวลาการปฏิบัติงาน (Punch-In/Out)
          </h3>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/check-in?action=in" className="block group">
              <div className="bg-linear-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 p-6 rounded-4xl flex items-center justify-between transition shadow-2xl shadow-emerald-500/20 active:shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-150 rotate-12">
                  <LogIn size={80} className="text-white" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner">
                    <LogIn size={28} />
                  </div>
                  <div className="text-left space-y-1">
                    <h2 className="font-black text-2xl text-white uppercase tracking-tight">
                      ลงเวลาเข้างาน
                    </h2>
                    <p className="text-emerald-50/70 text-[10px] font-bold uppercase tracking-widest">
                      Punch in for today session
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md group-hover:translate-x-1 transition-transform relative z-10">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/check-in?action=out" className="block group">
              <div className="bg-linear-to-r from-orange-500 to-rose-600 dark:from-orange-600 dark:to-rose-700 p-6 rounded-4xl flex items-center justify-between transition shadow-2xl shadow-orange-500/20 active:shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-150 -rotate-12">
                  <LogOut size={80} className="text-white" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white shadow-inner">
                    <LogOut size={28} />
                  </div>
                  <div className="text-left space-y-1">
                    <h2 className="font-black text-2xl text-white uppercase tracking-tight">
                      ลงเวลาออกงาน
                    </h2>
                    <p className="text-rose-50/70 text-[10px] font-bold uppercase tracking-widest">
                      Punch out and end shift
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 p-2.5 rounded-full text-white backdrop-blur-md group-hover:translate-x-1 transition-transform relative z-10">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid - Themed Icons */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-2 px-6">
            เมนูเพิ่มเติม (Management)
          </h3>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/leave-request" className="block h-full">
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-4xl flex items-center gap-4 transition shadow-xl shadow-slate-200/50 dark:shadow-black/20 group hover:border-indigo-200 dark:hover:border-indigo-900/40">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                  <CalendarDays size={24} />
                </div>
                <div className="text-left">
                  <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight line-none">
                    แจ้งลางาน
                  </h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Leave Request
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="sm:col-span-2"
          >
            <Link href="/work-report" className="block h-full">
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-4xl flex items-center justify-between transition shadow-xl shadow-slate-200/50 dark:shadow-black/20 group hover:border-blue-200 dark:hover:border-blue-900/60 overflow-hidden relative">
                <div className="absolute right-0 top-0 p-6 opacity-0 group-hover:opacity-5 transition-all group-hover:rotate-12 translate-x-4 -translate-y-4">
                  <ClipboardList size={120} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-3xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                    <FileText size={28} />
                  </div>
                  <div className="text-left space-y-1">
                    <h2 className="font-black text-xl text-slate-800 dark:text-zinc-100 uppercase tracking-tight">
                      แบบสรุปรายงานผลการปฏิบัติงาน
                    </h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                      Daily activity & Project reporting
                    </p>
                  </div>
                </div>
                <div className="bg-blue-500 text-white p-2.5 rounded-full shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform relative z-10">
                  <Plus size={20} />
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/wfh/history" className="block h-full">
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-4xl flex items-center gap-4 transition shadow-xl shadow-slate-200/50 dark:shadow-black/20 group hover:border-pink-200 dark:hover:border-pink-900/40">
                <div className="bg-pink-50 dark:bg-pink-500/10 p-4 rounded-2xl text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm">
                  <History size={24} />
                </div>
                <div className="text-left">
                  <h2 className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">
                    ประวัติของฉัน
                  </h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                    My History
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="pt-10 pb-6 text-center">
          <p className="text-[10px] text-slate-300 dark:text-zinc-700 font-black uppercase tracking-[0.4em]">
            KTL by AllMaster • Workplace Portal
          </p>
        </div>
      </div>
    </div>
  );
}
