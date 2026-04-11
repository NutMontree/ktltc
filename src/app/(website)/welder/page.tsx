"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { FireFilled } from "@ant-design/icons";

export default function Welder() {
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-600 dark:text-orange-500">
            <FireFilled /> Department of Welding
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา<span className="text-orange-500">ช่างเชื่อมโลหะ</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-orange-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            ผู้เชี่ยวชาญงานเชื่อมโลหะและโครงสร้างอุตสาหกรรม
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="ช่างเชื่อมโลหะ" departmentCode="Welding Tech" />
      </div>
    </section>
  );
}
