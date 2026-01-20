"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CustomerServiceOutlined,
  AppstoreOutlined,
  EditOutlined,
  ArrowRightOutlined,
  BlockOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

// 1. จัดการข้อมูลเกม (Updated Titles & Icons)
const games = [
  {
    title: "เกมงู (Snake)",
    description: "สะสมคะแนนจากการกินอาหารและระวังอย่าชนกำแพง",
    href: "/snakegame",
    icon: <CustomerServiceOutlined />,
    color: "from-emerald-400 to-cyan-500",
  },
  {
    title: "จับคู่ภาพ (Memory)",
    description: "ทดสอบความจำของคุณด้วยการจับคู่ภาพที่เหมือนกัน",
    href: "/picturematching",
    icon: <AppstoreOutlined />,
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "เกมตัวต่อ (Tetris)",
    description: "จัดเรียงบล็อกที่หล่นลงมาให้เต็มแถวเพื่อทำคะแนนสูงสุด",
    href: "/Tetris",
    icon: <BlockOutlined />,
    color: "from-blue-600 to-blue-400",
  },
  {
    title: "เอ็กซ์โอ (XO Game)",
    description: "ดวลฝีมือกับ AI ที่ไม่มีวันแพ้ ในเกมคลาสสิกสุดท้าทาย",
    href: "/XO",
    icon: <CloseCircleOutlined />,
    color: "from-rose-500 to-orange-400",
  },
  {
    title: "พิมพ์เร็ว (Typing Test)",
    description: "ฝึกฝนทักษะการพิมพ์และวัดความเร็ว WPM ของคุณ",
    href: "/TypingTestApp",
    icon: <EditOutlined />,
    color: "from-amber-400 to-orange-500",
  },
];

export default function MiniGame() {
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-20 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-bold tracking-[0.2em] text-[#DAA520] uppercase"
          >
            Entertainment Center
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 mb-6 text-5xl font-black text-slate-900 md:text-6xl dark:text-white"
          >
            MINI <span className="text-[#DAA520]">GAMES</span>
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="mx-auto h-1 w-20 rounded-full bg-[#DAA520]"
          />
        </div>

        {/* Game Grid - ปรับ Responsive ให้ดูสมดุล */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {games.map((game, index) => (
            <motion.div key={index} variants={itemVar}>
              <Link href={game.href} className="group block h-full">
                <div className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-white bg-white/70 p-8 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#DAA520]/10 dark:border-neutral-800 dark:bg-neutral-900/50">
                  {/* Glassmorphism Background Decoration */}
                  <div
                    className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-linear-to-br ${game.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
                  />

                  {/* Icon Box */}
                  <div
                    className={`mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${game.color} text-2xl text-white shadow-lg shadow-blue-500/20`}
                  >
                    {game.icon}
                  </div>

                  {/* Content */}
                  <div className="grow">
                    <h3 className="mb-3 text-2xl font-extrabold text-slate-800 transition-colors group-hover:text-[#DAA520] dark:text-white">
                      {game.title}
                    </h3>
                    <p className="mb-8 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {game.description}
                    </p>
                  </div>

                  {/* Play Button */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-black tracking-widest text-[#DAA520] uppercase">
                      Start Mission
                      <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                    <span className="text-4xl font-black text-slate-100 dark:text-neutral-800">
                      0{index + 1}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
