"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  ArrowRightOutlined,
  CalendarOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Image } from "@heroui/react"; // หรือใช้ next/image ก็ได้ถ้าต้องการ performance สูงสุด

// นำเข้าข้อมูล (ตรวจสอบ path ให้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ)
import { DataPressrelease } from "../pressrelease/2569/press6901/data";

// --- Animation Variants ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // เล่น animation ทีละลูก
    },
  },
};

const itemVar = {
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 50 },
  },
};

export default function ShowPressRelease() {
  // ดึงข้อมูล 8 ข่าวล่าสุด
  const newsItems = DataPressrelease?.navItems?.slice(0, 4) || [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-50/50 py-16 font-sans dark:bg-neutral-950">
      {/* --- Background Decoration (Modern Blobs instead of raw SVG) --- */}
      <div className="pointer-events-none absolute top-20 -left-20 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl filter dark:bg-orange-900/10" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl filter dark:bg-blue-900/10" />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVar}
          className="relative z-10"
        >
          {/* --- Header Section --- */}
          <div className="mb-12 flex flex-col items-start justify-between gap-4 border-l-4 border-orange-500 pl-6 md:flex-row md:items-end">
            <div>
              <motion.span
                variants={itemVar}
                className="text-sm font-semibold tracking-wider text-orange-500 uppercase"
              >
                Update News
              </motion.span>
              <motion.h2
                variants={itemVar}
                className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl dark:text-slate-100"
              >
                ข่าวประชาสัมพันธ์
              </motion.h2>
              <motion.p
                variants={itemVar}
                className="text-slate-500 dark:text-slate-400"
              >
                ติดตามข่าวสารและกิจกรรมล่าสุดของเรา
              </motion.p>
            </div>

            <motion.div variants={itemVar} className="hidden md:block">
              {/* ปุ่มดูทั้งหมดแบบ Desktop */}
              <ViewAllButton />
            </motion.div>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newsItems.map((item, index) => (
              <motion.div key={index} variants={itemVar}>
                <Link href={item.href} className="group relative block h-full">
                  <article className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Image Cover */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-3 p-5">
                      {/* Date Badge */}
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <CalendarOutlined className="text-orange-500" />
                        <span>{item.date || "ไม่ระบุวันที่"}</span>
                      </div>

                      {/* Title */}
                      <h3 className="line-clamp-2 text-lg leading-tight font-bold text-slate-800 transition-colors group-hover:text-orange-600 dark:text-slate-100 dark:group-hover:text-orange-400">
                        {item.name}
                      </h3>

                      {/* Description */}
                      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Read More Link (Decoration) */}
                      <div className="mt-auto flex items-center gap-2 pt-2 text-sm font-semibold text-orange-500 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                        อ่านต่อ <ArrowRightOutlined />
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* --- Mobile Button Section --- */}
          <motion.div
            variants={itemVar}
            className="mt-10 flex justify-center md:hidden"
          >
            <ViewAllButton />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// แยก Component ปุ่มออกมาเพื่อให้ Code สะอาดขึ้น
function ViewAllButton() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f97316", // orange-500
          borderRadius: 50,
        },
      }}
    >
      <Button
        type="primary"
        size="large"
        href="/pressrelease"
        icon={<ReadOutlined />}
        className="h-12 px-8 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
      >
        ดูข่าวทั้งหมด
      </Button>
    </ConfigProvider>
  );
}
