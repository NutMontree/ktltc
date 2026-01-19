"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileTextOutlined,
  HomeOutlined,
  HistoryOutlined,
  ArrowRightOutlined,
  NotificationOutlined,
} from "@ant-design/icons";

// 1. Data Configuration: จัดการข้อมูลปีการศึกษาของจดหมายข่าว
const newsletterData = [
  {
    year: "2569",
    label: "จดหมายข่าว ปีการศึกษา 2569",
    href: "/newsletter/newsletter2569",
    isLatest: true,
    icon: <NotificationOutlined />,
    desc: "ข้อมูลข่าวสารและกิจกรรมประชาสัมพันธ์ล่าสุด",
  },
  {
    year: "2568",
    label: "จดหมายข่าว ปีการศึกษา 2568",
    href: "/newsletter/newsletter2568",
    isLatest: false,
    icon: <FileTextOutlined />,
    desc: "รวบรวมเหตุการณ์สำคัญในรอบปีการศึกษา 2568",
  },
  {
    year: "2567",
    label: "จดหมายข่าว ปีการศึกษา 2567",
    href: "https://ktltcv1.vercel.app/newsletter/newsletter2567",
    isLatest: false,
    icon: <HistoryOutlined />,
    desc: "คลังข้อมูลจดหมายข่าวย้อนหลัง (Archive)",
  },
  {
    year: "2566",
    label: "จดหมายข่าว ปีการศึกษา 2566",
    href: "https://ktltcv1.vercel.app/newsletter/newsletter2566",
    isLatest: false,
    icon: <HistoryOutlined />,
    desc: "คลังข้อมูลจดหมายข่าวย้อนหลัง (Archive)",
  },
];

export default function NewsletterPage() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen pt-[100px] pb-20 font-sans">
      {/* --- 1. Header Section --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-16 px-4 text-center"
      >
        <h1 className="mb-2 text-2xl font-bold text-slate-800 md:text-3xl dark:text-white">
          จดหมายข่าว
        </h1>
        <h2 className="mb-8 text-xl font-semibold text-[#DAA520]">
          Newsletter Page
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
              Newsletter
            </li>
          </ul>
        </nav>

        {/* Decorative Divider */}
        <div className="mx-auto mt-10 h-px w-full max-w-2xl bg-linear-to-r from-transparent via-slate-200 to-transparent dark:via-neutral-800"></div>
      </motion.div>

      {/* --- 2. Content Grid --- */}
      <div className="mx-auto max-w-5xl px-4">
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 lg:gap-8"
        >
          {newsletterData.map((item, index) => (
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
                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 group-hover:border-transparent hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                  {/* Hover Gradient Border Effect */}
                  <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#6253e1] to-[#04befe] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute inset-px -z-10 rounded-[15px] bg-white dark:bg-neutral-900"></div>

                  {/* Icon & Badge Row */}
                  <div className="mb-6 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110 ${
                        item.isLatest
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-slate-50 text-slate-500 dark:bg-neutral-800 dark:text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.isLatest && (
                      <span className="animate-pulse rounded-full bg-red-50 px-4 py-1 text-xs font-bold text-red-500 ring-1 ring-red-100 dark:bg-red-900/20 dark:ring-red-900/50">
                        NEWEST
                      </span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 transition-all group-hover:bg-linear-to-r group-hover:from-[#6253e1] group-hover:to-[#04befe] group-hover:bg-clip-text group-hover:text-transparent dark:text-white">
                      {item.label}
                    </h3>
                    <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    อ่านรายละเอียด{" "}
                    <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
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
