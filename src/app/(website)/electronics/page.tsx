"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { ApiFilled } from "@ant-design/icons";

export default function Electronics() {
  return (
    <section className="max-w-[1600px] mx-auto bg-slate-50 py-16 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="container mx-auto max-w-[1600px]">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
            <ApiFilled /> Department of Electronics
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา
            <span className="bg-linear-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              ช่างอิเล็กทรอนิกส์
            </span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-cyan-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            นวัตกรรมวงจรไฟฟ้า ระบบควบคุม และเทคโนโลยีสมัยใหม่
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="ช่างอิเล็กทรอนิกส์" departmentCode="Electronics" />
      </div>
    </section>
  );
}
