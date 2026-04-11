"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { AppstoreFilled } from "@ant-design/icons";

export default function Logistics() {
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-semibold text-pink-600 dark:text-pink-500">
            <AppstoreFilled /> Department of Marketing & Logistics
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา<span className="text-pink-500">การตลาด/โลจิสติก์</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-pink-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            สร้างนักธุรกิจยุคใหม่ บริหารจัดการคลังสินค้าครอบคลุมทุกเครือข่าย
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="การตลาด/โลจิสติก์" departmentCode="Marketing/Logistics" />
      </div>
    </section>
  );
}
