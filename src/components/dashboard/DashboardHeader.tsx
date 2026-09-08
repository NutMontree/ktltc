"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Activity, LayoutDashboard, ExternalLink } from "lucide-react";
import GlassSurface from "@/components/ui/GlassSurface";

/**
 * DashboardHeader.tsx (Client Component): ส่วนหัวของหน้า Dashboard
 * 
 * หน้าที่: 
 * 1. แสดงชื่อหน้า (Overview) พร้อม Animation สวยงาม
 * 2. แสดงสถานะระบบ (System Live)
 * 3. แสดงการ์ดข้อมูลส่วนตัวของผู้ใช้ (User Profile Card) 
 * 4. มีปุ่มทางลัดไปหน้าแก้ไขโปรไฟล์และกระดิ่งแจ้งเตือน
 */

interface DashboardHeaderProps {
  user: {
    username?: string;
    role?: string;
    image?: string | null;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  // การตั้งค่า Animation สำหรับการปรากฏตัวของ Element
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1, // ให้คอมโพเนนต์ลูกค่อยๆ โผล่ตามกันมา
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-12"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-zinc-200/60 dark:border-zinc-800/60">
        
        {/* ส่วนซ้าย: หัวข้อหน้า และสถานะระบบ */}
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            {/* ไฟสถานะสีเขียว (Pulse) */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-4 h-4 rounded-full bg-emerald-500/20 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none flex flex-wrap items-center gap-x-2 sm:gap-x-4">
              <span className="uppercase italic pr-2 sm:pr-4">Over</span>
              <span className="text-blue-600 uppercase">view</span>
              <LayoutDashboard className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-200 dark:text-zinc-800 hidden sm:block" />
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm sm:text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600/20 rounded-full" />
              {new Date().getHours() < 12 ? "สวัสดีตอนเช้า 🌅" : new Date().getHours() < 18 ? "สวัสดีตอนบ่าย ☀️" : "สวัสดีตอนค่ำ 🌙"} • วิทยาลัยเทคนิคกันทรลักษ์
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

