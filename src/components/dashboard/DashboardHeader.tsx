"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Activity, LayoutDashboard, ExternalLink } from "lucide-react";
import NotificationBell from "../NotificationBell";

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
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                System Live
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none flex flex-wrap items-center gap-x-4">
              <span className="uppercase italic">Over</span>
              <span className="text-blue-600 uppercase">view</span>
              <LayoutDashboard className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-200 dark:text-zinc-800 hidden sm:block" />
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm sm:text-lg flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-600/20 rounded-full" />
              วิทยาลัยเทคนิคกันทรลักษ์ • แผงควบคุมระบบบริหารจัดการ
            </p>
          </motion.div>
        </div>

        {/* ส่วนขวา: การ์ดโปรไฟล์ผู้ใช้และกระดิ่งแจ้งเตือน */}
        <motion.div variants={itemVariants} className="w-full lg:w-auto flex items-center gap-4">
          <div className="hidden sm:block">
            <NotificationBell />
          </div>
          
          <div className="group relative p-px rounded-4xl bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 hover:from-blue-500 hover:to-indigo-600 transition-all duration-500 shadow-xl shadow-zinc-200/50 dark:shadow-none">
            <div className="relative flex items-center gap-5 p-5 rounded-[1.95rem] bg-white dark:bg-zinc-950 group-hover:bg-white/95 dark:group-hover:bg-zinc-950/95 transition-colors">
              
              {/* รูปโปรไฟล์ */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xl font-black uppercase">
                      {user.username?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                {/* จุดสีเขียวแสดงสถานะ Online */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-zinc-950 rounded-full shadow-sm" />
              </div>

              {/* รายละเอียดผู้ใช้ */}
              <div className="flex flex-col min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {user.role || "MEMBER"}
                  </span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                  {user.username}
                </p>
                <div className="flex items-center gap-2 mt-1 text-zinc-400 dark:text-zinc-500">
                  <User className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Active Session</span>
                </div>
              </div>

              {/* ปุ่มทางลัดไปหน้าโปรไฟล์ */}
              <Link
                href="/dashboard/profile"
                className="ml-4 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

