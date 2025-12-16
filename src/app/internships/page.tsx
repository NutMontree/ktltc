"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, ConfigProvider } from "antd";
import {
  TeamOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  ReadOutlined,
} from "@ant-design/icons";

// นำเข้าข้อมูล (ตรวจสอบ path ให้ถูกต้อง)
import { DataInternships } from "./SubInternships/2568/data";

// --- Animation Variants ---
const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // เล่น Animation ทีละรายการ
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

export default function Internships() {
  // ดึงข้อมูล 4 รายการแรก
  const internshipItems = DataInternships?.navItems?.slice(0, 4) || [];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white py-16 font-sans dark:bg-neutral-950">
      {/* Background Decoration (Optional) */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/50 blur-3xl filter dark:bg-sky-900/20" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-100/50 blur-3xl filter dark:bg-blue-900/20" />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVar}
          className="space-y-10"
        >
          {/* --- Header Section --- */}
          <div className="flex flex-col items-start gap-3 border-l-4 border-sky-500 pl-6 md:flex-row md:items-end md:justify-between md:gap-0">
            <div>
              <motion.div
                variants={itemVar}
                className="flex items-center gap-2 text-sm font-bold tracking-wider text-sky-600 uppercase"
              >
                <TeamOutlined />
                <span>Internship Program</span>
              </motion.div>
              <motion.h2
                variants={itemVar}
                className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl dark:text-slate-100"
              >
                นักศึกษา <span className="text-sky-500">ออกฝึกประสบการณ์</span>
              </motion.h2>
              <motion.p
                variants={itemVar}
                className="text-slate-500 dark:text-slate-400"
              >
                Students go on internship
              </motion.p>
            </div>

            {/* Desktop Button */}
            <motion.div variants={itemVar} className="hidden md:block">
              <ViewAllButton />
            </motion.div>
          </div>

          {/* --- Grid Section --- */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {internshipItems.map((item, index) => (
              <motion.div key={index} variants={itemVar}>
                <Link href={item.href} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                    {/* Image Area */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${item.backgroundImage})`,
                        }}
                      />
                      {/* Badge วันที่ลอยอยู่มุมขวาบน */}
                      <div className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md dark:bg-black/70 dark:text-slate-200">
                        <CalendarOutlined className="mr-1 text-sky-500" />
                        {item.date}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-100">
                        {item.name}
                      </h3>

                      <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Bottom Action */}
                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
                        <span className="text-xs font-medium text-slate-400 transition-colors group-hover:text-sky-500">
                          อ่านรายละเอียด
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-sky-500 group-hover:text-white dark:bg-neutral-800">
                          <ArrowRightOutlined className="-rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                        </div>
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

// แยกปุ่มออกมาเพื่อความสะอาดของ Code
function ViewAllButton() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0ea5e9", // Sky-500
          borderRadius: 50,
        },
      }}
    >
      <Button
        type="primary"
        size="large"
        href="/internships/SubInternships"
        icon={<ReadOutlined />}
        className="h-11 px-6 shadow-md shadow-sky-500/20 hover:shadow-sky-500/40"
      >
        ข้อมูลทั้งหมด
      </Button>
    </ConfigProvider>
  );
}
