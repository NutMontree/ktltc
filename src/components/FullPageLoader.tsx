"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Strands from "./Strands";

/**
 * FullPageLoader.tsx: พรีเมียม Loading Overlay
 * 
 * ดีไซน์: Glassmorphism, Cinematic Gradients, Micro-animations
 */

interface FullPageLoaderProps {
  message?: string;
  subtitle?: string;
}

export default function FullPageLoader({
  message = "กำลังเปลี่ยนหน้า...",
  subtitle = "ระบบกำลังเตรียมเนื้อหาหน้าถัดไปสำหรับคุณ"
}: FullPageLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake progress for visual feedback
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-zinc-50/70 dark:bg-zinc-950/80 backdrop-blur-3xl overflow-hidden"
    >
      {/* Background Cinematic Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-linear-to-tr from-blue-600/30 via-indigo-600/20 to-transparent rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-linear-to-bl from-purple-600/30 via-pink-600/20 to-transparent rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-6 max-w-sm">
        <div className="relative flex items-center justify-center mb-12 w-full h-48 sm:h-64">
          <Strands
            colors={["#4f46e5", "#3b82f6", "#06b6d4"]} // Indigo, Blue, Cyan
            count={3}
            speed={0.5}
            amplitude={1}
            waviness={1}
            thickness={0.7}
            glow={2.6}
            taper={3}
            spread={1}
            intensity={0.6}
            saturation={1.5}
            opacity={1}
            scale={1.5}
            glass={false}
          />
        </div>

        {/* Text Typography */}
        <div className="text-center space-y-4 w-full">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="text-2xl md:text-3xl font-black bg-linear-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent tracking-tight"
          >
            {message}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
            className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Cinematic Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner"
        >
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
          />
          {/* Sweeping Light Ray */}
          <motion.div
            className="absolute top-0 bottom-0 w-24 bg-linear-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 inline-flex items-center gap-3 px-5 py-2.5 bg-white/40 dark:bg-zinc-900/40 rounded-full border border-white/60 dark:border-zinc-800/60 backdrop-blur-md shadow-lg shadow-black/5"
        >
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </div>
          <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
            KTLTC SYSTEM ACTIVE
          </span>
        </motion.div>
      </div>

      <style jsx global>{`
        body { overflow: hidden !important; }
      `}</style>
    </motion.div>
  );
}
