"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { ReadOutlined } from "@ant-design/icons";

export default function Ordinary() {
  return (
    <section className="max-w-[1600px] mx-auto bg-slate-50 py-16 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="container">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
            <ReadOutlined /> Department of General Subjects
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา<span className="text-[#DAA520]">สามัญสัมพันธ์</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#DAA520]" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            รากฐานแห่งการเรียนรู้ บูรณาการทักษะชีวิตและวิชาชีพ
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="สามัญสัมพันธ์" departmentCode="Ordinary" />
      </div>
    </section>
  );
}
