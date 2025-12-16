"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  FileProtectOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

// นำเข้าข้อมูล (ตรวจสอบ path ให้ถูกต้อง)
import { dataBidding } from "../bidding/data/data";

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
  hidden: { y: 30, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 50 },
  },
};

export default function ShowBidding() {
  // ดึง 3 รายการล่าสุด
  // ตรวจสอบว่า dataBidding.navitems มีอยู่จริงก่อนเรียกใช้
  const biddingItems = dataBidding?.navitems?.slice(0, 3) || [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white py-16 font-sans dark:bg-neutral-950">
      {/* Background Decoration (Modern Style) */}
      <div className="absolute top-1/4 right-0 h-96 w-96 translate-x-1/2 rounded-full bg-blue-50/80 blur-3xl dark:bg-blue-900/10" />
      <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-yellow-50/80 blur-3xl dark:bg-yellow-900/10" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVar}
          className="space-y-10"
        >
          {/* --- Header Section --- */}
          <div className="flex flex-col items-start gap-4 border-l-4 border-blue-600 pl-6 md:flex-row md:items-end md:justify-between md:gap-0">
            <div>
              <motion.div
                variants={itemVar}
                className="flex items-center gap-2 text-sm font-bold tracking-wider text-blue-600 uppercase"
              >
                <FileProtectOutlined />
                <span>Procurement News</span>
              </motion.div>
              <motion.h2
                variants={itemVar}
                className="mt-2 text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-slate-100"
              >
                ข่าว<span className="text-blue-600">ประกวดราคา</span>
              </motion.h2>
              <motion.p
                variants={itemVar}
                className="text-slate-500 dark:text-slate-400"
              >
                Bidding & Purchasing Announcements
              </motion.p>
            </div>

            {/* Desktop Button */}
            <motion.div variants={itemVar} className="hidden md:block">
              <ViewAllButton />
            </motion.div>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {biddingItems.map((item, index) => (
              <motion.div key={index} variants={itemVar} className="h-full">
                <Link href={item.href} className="group flex h-full flex-col">
                  <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
                    {/* Image Area */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />

                      {/* Date Badge (Floating) */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded bg-white/95 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-sm dark:bg-neutral-800 dark:text-slate-300">
                        <CalendarOutlined className="text-blue-600" />
                        {"ล่าสุด"}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-3 line-clamp-2 text-lg leading-snug font-bold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-slate-100">
                        {item.name}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Bottom Action */}
                      <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4 dark:border-neutral-800">
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors group-hover:text-blue-500">
                          <ContainerOutlined /> รายละเอียด
                        </span>
                        <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                          <ArrowRightOutlined className="text-slate-300 group-hover:text-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-linear-to-r from-blue-600 to-blue-400 transition-transform duration-300 group-hover:scale-x-100" />
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Button */}
          <motion.div
            variants={itemVar}
            className="flex justify-center md:hidden"
          >
            <ViewAllButton />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Component ปุ่มกดดูทั้งหมด
function ViewAllButton() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563eb", // Blue-600
          borderRadius: 6, // Square-ish for professional look
        },
      }}
    >
      <Button
        type="primary"
        size="large"
        href="/bidding"
        icon={<FileProtectOutlined />}
        className="h-12 px-8 font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
      >
        ดูรายการทั้งหมด
      </Button>
    </ConfigProvider>
  );
}
