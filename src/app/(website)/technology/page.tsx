"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { CloudServerOutlined } from "@ant-design/icons";

export default function Technology() {
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
            <CloudServerOutlined /> Department of Digital Business Tech
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            แผนกวิชา
            <span className="bg-linear-to-r from-blue-50 to-cyan-500 bg-clip-text text-transparent">
              เทคโนโลยีธุรกิจดิจิทัล
            </span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-blue-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            สร้างสรรค์นวัตกรรมธุรกิจดิจิทัลแห่งอนาคต
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="เทคโนโลยีธุรกิจดิจิทัล" departmentCode="Digital Tech" />
      </div>
    </section>
  );
}
