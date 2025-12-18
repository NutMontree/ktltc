"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  NotificationOutlined,
  HomeOutlined,
  HistoryOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// 1. Data Configuration: รวมข้อมูลปีการศึกษาไว้ที่นี่ แก้ไขง่าย
const academicYears = [
  {
    year: "2568",
    label: "ปีการศึกษา 2568",
    href: "/pressrelease/2568",
    isLatest: true, // ใช้สำหรับใส่ Badge "ล่าสุด"
    icon: <NotificationOutlined />,
    desc: "ข่าวสารและกิจกรรมล่าสุดประจำปีปัจจุบัน",
  },
  {
    year: "2567",
    label: "ปีการศึกษา 2567",
    href: "https://ktltcv1.vercel.app/pressrelease/2567",
    isLatest: false,
    icon: <HistoryOutlined />,
    desc: "Archive ข้อมูลย้อนหลัง",
  },
  {
    year: "2566",
    label: "ปีการศึกษา 2566",
    href: "https://ktltcv1.vercel.app/pressrelease/2566",
    isLatest: false,
    icon: <HistoryOutlined />,
    desc: "Archive ข้อมูลย้อนหลัง",
  },
];

export default function PressReleasePage() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="pt-[100px] pb-20 font-sans">
      {/* --- 1. Header Section --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-16 px-4 text-center"
      >
        {/* Decorative Line */}
        <div className="absolute bottom-0 left-0 h-px w-full from-transparent via-slate-300 to-transparent opacity-50 dark:via-neutral-700"></div>

        <h1 className="mb-2 text-2xl font-bold text-slate-800 md:text-3xl dark:text-white">
          ข่าวประชาสัมพันธ์
        </h1>
        <h2 className="mb-8 text-xl font-semibold text-[#DAA520]">
          Press Release Page
        </h2>

        {/* Breadcrumb */}
        <nav className="flex justify-center">
          <ul className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-6 py-2 text-sm shadow-sm md:text-base dark:border-neutral-800 dark:bg-neutral-900">
            <li>
              <Link
                href="/"
                className="flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <HomeOutlined /> Home
              </Link>
            </li>
            <li className="text-slate-300">/</li>
            <li className="font-medium text-slate-800 dark:text-white">
              pressrelease
            </li>
          </ul>
        </nav>
      </motion.div>

      {/* --- 2. Content Grid --- */}
      <div className="container mx-auto max-w-5xl px-4">
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {academicYears.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVar}
              className="group relative"
            >
              <Link
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                className="block h-full"
              >
                {/* Card Container */}
                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 group-hover:border-transparent hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                  {/* Gradient Border Effect on Hover */}
                  <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#6253e1] to-[#04befe] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute inset-px -z-10 rounded-2xl bg-white dark:bg-neutral-900"></div>

                  {/* Header: Icon & Year */}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-colors ${
                        item.isLatest
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-slate-50 text-slate-500 dark:bg-neutral-800 dark:text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.isLatest && (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500 ring-1 ring-red-100 dark:bg-red-900/20 dark:ring-red-900/50">
                        LATEST
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 transition-all group-hover:bg-linear-to-r group-hover:from-[#6253e1] group-hover:to-[#04befe] group-hover:bg-clip-text group-hover:text-transparent dark:text-white">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>

                  {/* Footer: Arrow */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    เข้าสู่เนื้อหา <ArrowRightOutlined />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
