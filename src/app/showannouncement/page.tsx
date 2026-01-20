"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  NotificationOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  SoundOutlined,
} from "@ant-design/icons";

// นำเข้าข้อมูล (ตรวจสอบ path ให้ถูกต้อง)
import { DataAnnouncement } from "../announcement/announcement2569/announcement6901/data";

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

export default function ShowAnnouncement() {
  // ดึง 3 ประกาศล่าสุด
  const announcementItems = DataAnnouncement?.navItems?.slice(0, 3) || [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-50 py-16 font-sans dark:bg-neutral-950">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-100/50 blur-3xl dark:bg-rose-900/20" />
      <div className="absolute right-0 bottom-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-100/50 blur-3xl dark:bg-orange-900/20" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVar}
          className="space-y-10"
        >
          {/* --- Header Section --- */}
          <div className="flex flex-col items-start gap-4 border-l-4 border-rose-500 pl-6 md:flex-row md:items-end md:justify-between md:gap-0">
            <div>
              <motion.div
                variants={itemVar}
                className="flex items-center gap-2 text-sm font-bold tracking-wider text-rose-500 uppercase"
              >
                <SoundOutlined />
                <span>Latest Updates</span>
              </motion.div>
              <motion.h2
                variants={itemVar}
                className="mt-2 text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-slate-100"
              >
                ข่าว<span className="text-rose-500">ประกาศ</span>
              </motion.h2>
              <motion.p
                variants={itemVar}
                className="text-slate-500 dark:text-slate-400"
              >
                Announcement & General News
              </motion.p>
            </div>

            {/* Desktop Button */}
            <motion.div variants={itemVar} className="hidden md:block">
              <ViewAllButton />
            </motion.div>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {announcementItems.map((item, index) => (
              <motion.div key={index} variants={itemVar} className="h-full">
                <Link href={item.href} className="group flex h-full flex-col">
                  <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-neutral-900 dark:ring-neutral-800">
                    {/* Image Area */}
                    <div className="relative aspect-video overflow-hidden bg-slate-200">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Date Badge (Floating) */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-black/80 dark:text-slate-200">
                        <CalendarOutlined className="text-rose-500" />
                        {item.date}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-3 line-clamp-2 text-xl leading-tight font-bold text-slate-800 transition-colors group-hover:text-rose-600 dark:text-slate-100">
                        {item.name}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Bottom Link */}
                      <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-rose-500 transition-all group-hover:gap-3">
                        อ่านประกาศ <ArrowRightOutlined />
                      </div>
                    </div>

                    {/* Decorative bottom bar */}
                    <div className="h-1 w-0 bg-rose-500 transition-all duration-500 group-hover:w-full" />
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

// แยก Component ปุ่ม
function ViewAllButton() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f43f5e", // Rose-500
          borderRadius: 50,
        },
      }}
    >
      <Button
        type="primary"
        size="large"
        href="/announcement"
        icon={<NotificationOutlined />}
        className="h-12 px-8 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
      >
        ดูประกาศทั้งหมด
      </Button>
    </ConfigProvider>
  );
}
