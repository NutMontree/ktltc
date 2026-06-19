"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  FileWordOutlined,
  CloudDownloadOutlined,
  HomeOutlined,
  RightOutlined,
} from "@ant-design/icons";

// 1. Data Configuration (รวมข้อมูลไฟล์ไว้ที่นี่ แก้ไขง่าย)
const pdcaDocs = [
  {
    id: 1,
    title: "การจัดทำรูปเล่ม PDCA และ 11 ขั้นตอน",
    href: "/pdf/pdca/1.การจัดทำรูปเล่ม_PDCA_และ_11_ขั้นตอน.doc",
    type: "doc",
  },
  {
    id: 2,
    title: "แบบฟอร์มขออนุมัติโครงการ (เฉพาะงานวางแผน)",
    href: "/pdf/pdca/2.แบบฟอร์มขออนุมัติโครงการ(เฉพาะงานวางแผน).docx",
    type: "docx",
  },
  {
    id: 3,
    title: "แบบฟอร์มขออนุมัติโครงการ",
    href: "/pdf/pdca/3.แบบฟอร์มขออนุมัติโครงการ.docx",
    type: "docx",
  },
  {
    id: 4,
    title: "แบบฟอร์มขออนุญาตดำเนินโครงการ",
    href: "/pdf/pdca/4.แบบฟอร์มขออนุญาตดำเนินโครงการ.docx",
    type: "docx",
  },
  {
    id: 5,
    title: "ขออนุญาตปรับเพิ่มงบประมาณโครงการประจำปี",
    href: "/pdf/pdca/5.ขออนุญาตปรับเพิ่มงบประมาณโครงการประจำปี.doc",
    type: "doc",
  },
  {
    id: 6,
    title: "ขออนุญาตปรับโครงการเข้าแผนปฏิบัติการ",
    href: "/pdf/pdca/6.ขออนุญาตปรับโครงการเข้าแผนปฏิบัติการ.doc",
    type: "doc",
  },
  {
    id: 7,
    title: "แบบฟอร์มโครงการ",
    href: "/pdf/pdca/7.แบบฟอร์มโครงการ.doc",
    type: "doc",
  },
  {
    id: 8,
    title: "แบบฟอร์มบันทึกข้อความขออนุญาตรายงานผล",
    href: "/pdf/pdca/8.แบบฟอร์มบันทึกข้อความขออนุญาตรายงานผลดำ.docx",
    type: "docx",
  },
  {
    id: 9,
    title: "แบบรายงานผลการดำเนินงานโครงการ (แบบย่อ)",
    href: "/pdf/pdca/9.แบบรายงานผลการดำเนินงานโครงการ_แบบย่อ.docx",
    type: "docx",
  },
];

export default function PDCA() {
  // Animation Variants
  const containerVar: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <section className="max-w-[1600px] mx-auto font-sans">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="max-w-[1600px] mx-auto"
      >
        {/* --- Header & Breadcrumb --- */}
        <div className="mb-12 text-center">
          <motion.div variants={itemVar} className="mb-6 flex justify-center">
            <span className="px-4 py-1.5 rounded-full bg-[#DAA520]/10 text-[#DAA520] text-sm font-bold tracking-wider uppercase border border-[#DAA520]/20">
              Download Center
            </span>
          </motion.div>

          <motion.h1
            variants={itemVar}
            className="text-3xl font-black text-slate-800 md:text-4xl dark:text-white mb-4"
          >
            เอกสารดาวน์โหลด <span className="text-[#DAA520]">(PDCA)</span>
          </motion.h1>

          {/* Breadcrumb */}
          <motion.div
            variants={itemVar}
            className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium"
          >
            <Link
              href="/"
              className="hover:text-[#DAA520] transition-colors flex items-center gap-1"
            >
              <HomeOutlined /> Home
            </Link>
            <RightOutlined className="text-xs opacity-50" />
            <Link
              href="/planning"
              className="hover:text-[#DAA520] transition-colors"
            >
              Plan
            </Link>
            <RightOutlined className="text-xs opacity-50" />
            <span className="text-slate-800 dark:text-slate-200">
              PDCA Documents
            </span>
          </motion.div>
        </div>

        {/* --- Document Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pdcaDocs.map((doc) => (
            <motion.div key={doc.id} variants={itemVar}>
              <Link href={doc.href} className="group block h-full">
                <div className="relative h-full bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-100 dark:border-neutral-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_25px_-5px_rgba(218,165,32,0.15)] hover:border-[#DAA520]/50 transition-all duration-300 flex items-start gap-4">
                  {/* Icon Box */}
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center text-2xl group-hover:bg-[#DAA520] group-hover:text-white transition-colors duration-300">
                    <FileWordOutlined />
                  </div>

                  {/* Text Content */}
                  <div className="grow">
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#DAA520] transition-colors line-clamp-2">
                      {doc.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="uppercase tracking-wide bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {doc.type}
                      </span>
                      <span className="flex items-center gap-1 group-hover:text-[#DAA520] transition-colors">
                        <CloudDownloadOutlined /> Download
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon (Visible on Hover) */}
                  <div className="absolute top-5 right-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#DAA520]">
                    <CloudDownloadOutlined className="text-xl" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
