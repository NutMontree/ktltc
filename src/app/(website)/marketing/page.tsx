"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShopOutlined } from "@ant-design/icons";
import PersonnelList from "../(components)/PersonnelList";

export default function Marketing() {
  // Animation Variants handled by PersonnelList
  return (
    <section className="max-w-[1600px] mx-auto bg-slate-50 py-16font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="container">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-sm font-semibold text-rose-600 dark:text-rose-400">
            <ShopOutlined /> Department of Marketing
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา
            <span className="bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              การตลาด
            </span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-rose-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            สร้างสรรค์กลยุทธ์ธุรกิจ ทันสมัย ก้าวไกลสู่สากล
          </p>
        </motion.div>

        {/* --- Grid Content --- */}
        <PersonnelList departmentName="การตลาด" departmentCode="Marketing Team" />
      </div>
    </section>
  );
}
