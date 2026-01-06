"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  ReadOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// นำเข้าข้อมูล (เช็ค path ให้ถูกต้อง)
import { Data } from "../newsletter/newsletter2569/newsletter6901/data";

// --- Animation Variants ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVar = {
  hidden: { y: 40, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 60, damping: 15 },
    // transition: { type: "spring" as const, stiffness: 50 },
  },
};

export default function ShowNewsletter() {
  // ดึง 3 ฉบับล่าสุด
  const newsletters = Data?.navItems?.slice(0, 3) || [];

  return (
    <section className="rounded-3xl bg-slate-50/30 py-16 font-sans dark:bg-neutral-950">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVar}
          className="space-y-12"
        >
          {/* --- Header Section --- */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              variants={itemVar}
              className="mb-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold tracking-wider text-yellow-700 uppercase dark:bg-yellow-900/30 dark:text-yellow-400"
            ></motion.div>
            <motion.h2
              variants={itemVar}
              className="text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-slate-100"
            >
              จดหมายข่าว <span className="text-yellow-500">ประชาสัมพันธ์</span>
            </motion.h2>
            <motion.p
              variants={itemVar}
              className="mt-4 max-w-2xl text-slate-500 dark:text-slate-400"
            >
              ติดตามวารสารและข่าวสารกิจกรรมต่างๆ
              ผ่านรูปแบบจดหมายข่าวอิเล็กทรอนิกส์
            </motion.p>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {newsletters.map((item, index) => (
              <motion.div key={index} variants={itemVar}>
                <Link href={item.href} className="group block h-full">
                  <article className="relative h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-neutral-900 dark:ring-neutral-800">
                    {/* Image Section (Vertical Aspect Ratio for Newsletter) */}
                    <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

                      {/* Image */}
                      <div
                        className="h-full w-full bg-cover bg-top transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />

                      {/* Floating Category/Date Badge */}
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-black/80 dark:text-slate-200">
                        <CalendarOutlined className="text-yellow-500" />
                        {item.date}
                      </div>

                      {/* Content Overlay (Bottom) */}
                      <div className="absolute bottom-0 left-0 z-20 w-full p-6 text-white">
                        <h3 className="mb-2 line-clamp-2 text-xl leading-snug font-bold text-white group-hover:text-yellow-400">
                          {item.name}
                        </h3>
                        <p className="line-clamp-2 text-sm text-slate-200 opacity-90">
                          {item.description}
                        </p>

                        {/* Read More Indicator */}
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-yellow-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                          อ่านต่อ <ArrowRightOutlined />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* --- Footer Button --- */}
          <motion.div variants={itemVar} className="flex justify-center pt-4">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: "#eab308", // Yellow-500
                  borderRadius: 50,
                  controlHeightLG: 48,
                },
              }}
            >
              <Button
                type="primary"
                size="large"
                href="/newsletter"
                icon={<ReadOutlined />}
                className="px-10 text-base font-semibold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
              >
                ดูจดหมายข่าวทั้งหมด
              </Button>
            </ConfigProvider>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
