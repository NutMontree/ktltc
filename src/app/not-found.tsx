"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex items-center justify-center overflow-hidden">
           <span className="text-8xl md:text-9xl font-black text-zinc-100 dark:text-zinc-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">404</span>
           <ShieldAlert size={64} className="text-blue-600 relative z-10" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-4"
      >
        ไม่พบหน้าที่คุณต้องการ
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 dark:text-zinc-400 font-medium max-w-md mb-10 leading-relaxed"
      >
        ขออภัย หน้านี้อาจถูกย้าย ลบออก หรือไม่เคยมีอยู่จริงในระบบ <br/>
        กรุณาตรวจสอบ URL อีกครั้ง หรือกลับไปยังหน้าหลัก
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/"
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
        >
          <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          กลับหน้าหลัก
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto px-10 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          ย้อนกลับ
        </button>
      </motion.div>
    </div>
  );
}
