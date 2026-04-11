"use client";

import React from "react";
import { motion } from "framer-motion";
import { SettingOutlined } from "@ant-design/icons";
import PersonnelList from "../(components)/PersonnelList";

export default function Machine() {
  // Header is kept the same

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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-sm font-semibold text-[#DAA520]">
            <SettingOutlined spin /> Department of Machine Shop
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา<span className="text-[#DAA520]">ช่างกลโรงงาน</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#DAA520]" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            มุ่งเน้นทักษะวิศวกรรมการผลิต และเทคโนโลยีเครื่องจักรกลสมัยใหม่
          </p>
        </motion.div>

        {/* --- Grid Content --- */}
        {/* --- Personnel Grid Data --- */}
        <PersonnelList departmentName="ช่างกลโรงงาน" departmentCode="Machine Tech" />
      </div>
    </section>
  );
}
