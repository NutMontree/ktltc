"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  AuditOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// นำเข้าข้อมูล (ตรวจสอบ path ให้ถูกต้อง)
import { Data } from "../technicalcollegeorders/Technical2567/technical6712/data";

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

export default function ShowTechnicalcollegeorders() {
  // ดึง 3-4 รายการล่าสุด
  const orderItems = Data?.navItems?.slice(0, 4) || [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-50/50 py-16 font-sans dark:bg-neutral-950">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-0 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-100/50 blur-3xl dark:bg-violet-900/10" />
      <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-100/50 blur-3xl dark:bg-fuchsia-900/10" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVar}
          className="space-y-10"
        >
          {/* --- Header Section --- */}
          <div className="flex flex-col items-start gap-4 border-l-4 border-violet-600 pl-6 md:flex-row md:items-end md:justify-between md:gap-0">
            <div>
              <motion.div
                variants={itemVar}
                className="flex items-center gap-2 text-sm font-bold tracking-wider text-violet-600 uppercase"
              >
                <AuditOutlined />
                <span>Official KTLTC</span>
              </motion.div>
              <motion.h2
                variants={itemVar}
                className="mt-2 text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-slate-100"
              >
                คำสั่ง<span className="text-violet-600">วิทยาลัยเทคนิค</span>
              </motion.h2>
              <motion.p
                variants={itemVar}
                className="text-slate-500 dark:text-slate-400"
              >
                Technical College Official & Commands
              </motion.p>
            </div>

            {/* Desktop Button */}
            <motion.div variants={itemVar} className="hidden md:block">
              <ViewAllButton />
            </motion.div>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {orderItems.map((item, index) => (
              <motion.div key={index} variants={itemVar}>
                <Link href={item.href} className="group block h-full">
                  <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-100 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Image Area */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                      <div
                        className="h-full w-full bg-cover bg-top transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />
                      {/* Icon Overlay */}
                      <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/0" />

                      {/* Document Type Badge */}
                      <div className="absolute top-2 right-2 rounded-md bg-white/90 p-1.5 text-violet-600 shadow-sm backdrop-blur-sm dark:bg-neutral-800 dark:text-violet-400">
                        <FileTextOutlined />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col p-4">
                      {/* Date */}
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <CalendarOutlined className="text-violet-500" />
                        <span>{"ไม่ระบุวันที่"}</span>
                      </div>

                      <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-slate-100">
                        {item.name}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Read More */}
                      <div className="mt-auto flex items-center gap-1 text-xs font-bold text-violet-600 transition-all group-hover:gap-2">
                        อ่านคำสั่ง <ArrowRightOutlined />
                      </div>
                    </div>
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

// Component ปุ่ม
function ViewAllButton() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#7c3aed", // Violet-600
          borderRadius: 50,
        },
      }}
    >
      <Button
        type="primary"
        size="large"
        href="/technicalcollegeorders"
        icon={<AuditOutlined />}
        className="h-12 px-8 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
      >
        ดูคำสั่งทั้งหมด
      </Button>
    </ConfigProvider>
  );
}
