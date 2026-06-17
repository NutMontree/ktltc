"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * FullPageLoader.tsx: คอมโพเนนต์หน้าจอโหลดแบบเต็มจอ (Loading Overlay)
 * 
 * หน้าที่: 
 * 1. แสดงผลทับเนื้อหาทั้งหมดเมื่อระบบกำลังทำงานเบื้องหลัง (เช่น การส่งข้อมูลหรือเปลี่ยนหน้า)
 * 2. ปรับสไตล์อัตโนมัติทั้ง Light/Dark Mode พร้อมเอฟเฟกต์ Glassmorphism
 * 3. ใช้ Framer Motion เพื่อสร้างแอนิเมชันการปรากฏตัวที่นุ่มนวล
 * 4. บังคับไม่ให้ผู้ใช้ Scroll หน้าเว็บขณะที่ยังโหลดไม่เสร็จ
 */

interface FullPageLoaderProps {
  message?: string;
  subtitle?: string;
}

export default function FullPageLoader({
  message = "กำลังจัดเตรียมข้อมูล...",
  subtitle = "กรุณารอสักครู่ ระบบกำลังรวบรวมข้อมูลทั้งหมดเพื่อคุณ"
}: FullPageLoaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/90 backdrop-blur-2xl overflow-hidden"
    >
      {/* Background glow (Animated Gradients) */}
      <div className="absolute inset-0 z-[-1] pointer-events-none flex items-center justify-center">
        <div className="absolute top-1/4 -left-1/4 w-[400px] h-[400px] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[300px] h-[300px] bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-[80px] animate-pulse delay-500" />
      </div>

      <div className="relative flex flex-col items-center w-full px-4">
        {/* Main Icon Container with Animated Rings */}
        <div className="relative group mb-10 mt-6">
          {/* Outer fading ring */}
          <motion.div 
            className="absolute -inset-8 rounded-full border border-blue-500/40 dark:border-blue-400/30"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner fading ring */}
          <motion.div 
            className="absolute -inset-4 rounded-full border border-indigo-500/50 dark:border-indigo-400/40"
            animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Main Container */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-24 h-24 md:w-28 md:h-28 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 border border-white/60 dark:border-zinc-800/60"
          >
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 animate-spin" strokeWidth={2.5} />
            
            {/* Ping effect */}
            <div className="absolute inset-0 rounded-[2rem] border-2 border-blue-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-3 z-10 max-w-md w-full">
          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl font-black bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm tracking-tight"
          >
            {message}
          </motion.h2>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] md:text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-[0.15em] leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>
        
        {/* Animated Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 w-64 md:w-80 h-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full overflow-hidden relative shadow-inner"
        >
          <motion.div 
            className="absolute top-0 bottom-0 w-1/3 bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Operational Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center gap-2.5 px-5 py-2.5 bg-white/50 dark:bg-zinc-900/50 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md shadow-sm"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest">
            ระบบ KTLTC กำลังประมวลผล
          </span>
        </motion.div>
      </div>

      {/* ปิดการ Scroll หน้าเว็บ */}
      <style jsx global>{`
        body { overflow: hidden !important; }
      `}</style>
    </motion.div>
  );
}

