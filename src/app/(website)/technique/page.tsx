"use client";

import React from "react";
import { motion } from "framer-motion";
import { ToolFilled } from "@ant-design/icons";
import PersonnelList from "../(components)/PersonnelList";

export default function Technique() {
  // Animation Variants handled by PersonnelList

  return (
    <section className="max-w-[1600px] mx-auto bg-slate-50 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="container">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-amber-600/10 px-4 py-1.5 text-sm font-semibold text-amber-700 dark:text-amber-500">
            <ToolFilled /> Department of Basic Technician
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา<span className="text-[#DAA520]">ช่างเทคนิคพื้นฐาน</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#DAA520]" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            รากฐานงานช่าง อุตสาหกรรมศิลป์ และทักษะวิศวกรรมเบื้องต้น
          </p>
        </motion.div>

        {/* --- Grid Content --- */}
        <PersonnelList departmentName="เทคนิคพื้นฐาน" departmentCode="Basic Tech" />
      </div>
    </section>
  );
}
