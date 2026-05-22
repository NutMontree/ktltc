"use client";

import React from "react";
import { motion } from "framer-motion";
import PersonnelList from "../(components)/PersonnelList";
import { AppstoreOutlined } from "@ant-design/icons";

export default function SupplyChain() {
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
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-[#008B8B]">
            <AppstoreOutlined /> Department of Logistics and Supply Chain
          </div>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            สาขาวิชา<span className="text-[#008B8B]">การจัดการโลจิสติกส์และซัพพลายเชน</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#008B8B]" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            บุคลากรคุณภาพ ผู้ขับเคลื่อนระบบโลจิสติกส์และห่วงโซ่อุปทานแห่งอนาคต
          </p>
        </motion.div>

        {/* --- Personnel Grid Content --- */}
        <PersonnelList departmentName="การจัดการโลจิสติกส์และซัพพลายเชน" departmentCode="Supply Chain" />
      </div>
    </section>
  );
}
