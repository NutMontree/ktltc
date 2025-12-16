"use client";

import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  FilePdfOutlined,
  DownloadOutlined,
  ReadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

// 1. จัดเก็บข้อมูลลงใน Array เพื่อให้ง่ายต่อการจัดการ
const sarData = [
  {
    year: "2566",
    title: "รายงานการประเมินตนเอง (SAR) ปี 2566",
    file: "/pdf/sar/SAR2566.pdf",
  },
  {
    year: "2565",
    title: "รายงานการประเมินตนเอง (SAR) ปี 2565",
    file: "/pdf/sar/SAR2565.pdf",
  },
  {
    year: "2564",
    title: "รายงานการประเมินตนเอง (SAR) ปี 2564",
    file: "/pdf/sar/SAR2564.pdf",
  },
  {
    year: "2563",
    title: "รายงานการประเมินตนเอง (SAR) ปี 2563",
    file: "/pdf/sar/SAR2563.pdf",
  },
];

export default function SarPage() {
  // Animation Styles
  const containerVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const itemClasses = {
    base: "py-0 w-full mb-4",
    title: "font-semibold text-base text-slate-800 dark:text-slate-100",
    subtitle: "text-xs text-slate-400",
    trigger:
      "px-6 py-4 bg-white dark:bg-neutral-900 data-[hover=true]:bg-slate-50 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm transition-all",
    indicator: "text-medium text-slate-400",
    content:
      "text-small px-4 pb-6 bg-white dark:bg-neutral-900 rounded-b-2xl border-x border-b border-slate-100 dark:border-neutral-800 -mt-2 pt-6",
  };

  return (
    <section className="min-h-screen bg-slate-50 py-16 font-sans dark:bg-neutral-950">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="container mx-auto max-w-5xl px-4 md:px-8"
      >
        {/* --- Header Section --- */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ReadOutlined className="mr-2" /> งานประกันคุณภาพ
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            รายงาน<span className="text-[#DAA520]">การประเมินตนเอง</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Self Assessment Report (SAR)
          </p>
        </div>

        {/* --- Accordion Content --- */}
        <Accordion
          variant="splitted"
          itemClasses={itemClasses}
          className="px-0"
        >
          {sarData.map((item) => (
            <AccordionItem
              key={item.year}
              aria-label={item.title}
              title={item.title}
              startContent={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                  <FilePdfOutlined className="text-xl" />
                </div>
              }
              subtitle={`ปีการศึกษา ${item.year}`}
            >
              <div className="flex flex-col gap-4">
                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FileTextOutlined />
                    <span className="text-sm">ตัวอย่างเอกสาร</span>
                  </div>
                  <LinkPreview url={item.file} className="inline-block">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      endContent={<DownloadOutlined />}
                      className="font-medium"
                    >
                      ดาวน์โหลด PDF
                    </Button>
                  </LinkPreview>
                </div>

                {/* PDF Preview (Iframe) */}
                <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner dark:border-neutral-700 dark:bg-neutral-800">
                  <iframe
                    className="h-[500px] w-full md:h-[600px] lg:h-[700px]"
                    src={item.file}
                    title={`PDF Viewer ${item.year}`}
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
