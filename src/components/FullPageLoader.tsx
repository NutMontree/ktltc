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
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 dark:bg-zinc-950/90 backdrop-blur-2xl">
      {/* เอฟเฟกต์สีพื้นหลังไล่ระดับแบบนุ่มนวล (Animated Background Gradients) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* คอนเทนเนอร์ตัวหมุนโหลด (Main Spinner Container) */}
        <div className="relative">
          {/* เงาเรืองแสงด้านนอก (Subtle Outer Glow) */}
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative p-8 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl border border-white/20 flex flex-col items-center gap-6"
          >
            <div className="relative">
              <Loader2 
                size={48} 
                className="text-blue-500 animate-spin" 
                strokeWidth={2.5}
              />
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                {message}
              </h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed mx-auto">
                {subtitle}
              </p>
            </div>
          </motion.div>
        </div>

        {/* สถานะการทำงานของระบบ (System Operational Note) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
            KTLTC Systems Operational
          </span>
        </motion.div>
      </div>

      {/* ปิดการ Scroll หน้าเว็บ (Global Style Overlay) */}
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}

