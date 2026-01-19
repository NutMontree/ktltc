"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarOutlined, ArrowRightOutlined } from "@ant-design/icons";
import NewsletterPage from "../page";

// 1. ข้อมูลจดหมายข่าวแยกตามเดือน
const newsletterItems = [
  {
    month: "มกราคม",
    year: "2569",
    href: "/newsletter/newsletter2569/newsletter6901",
  },
  // สามารถเพิ่มเดือนอื่นๆ ตรงนี้ได้ในอนาคต
  // { month: "กุมภาพันธ์", year: "2569", href: "/newsletter/newsletter2569/newsletter6902" },
];

export default function Newsletter2569() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="pb-20">
      {/* ส่วน Header (ดึงจาก page หลักมาแสดงด้านบน) */}
      <NewsletterPage />

      <div className=" mx-auto mt-12 max-w-5xl px-4 md:px-8">
        {/* หัวข้อหมวดหมู่ */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-blue-600"></div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            จดหมายข่าวประจำเดือน
          </h2>
        </div>

        {/* Grid Layout สำหรับรายการเดือน */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVar}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {newsletterItems.map((item, index) => (
            <motion.div key={index} variants={itemVar}>
              <Link
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                className="group relative flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-600"
              >
                <div className="flex items-center gap-4">
                  {/* Icon Box */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-900/20 dark:text-blue-400">
                    <CalendarOutlined style={{ fontSize: "1.2rem" }} />
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-700 transition-colors group-hover:text-blue-600 dark:text-slate-200 dark:group-hover:text-blue-400">
                      เดือน {item.month}
                    </span>
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      พ.ศ. {item.year}
                    </span>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-neutral-700">
                  <ArrowRightOutlined />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
