"use client";

import React from "react";
import Link from "next/link";
import { Image, Accordion, AccordionItem, Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  HomeOutlined,
  FilePdfOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Breadcrumb } from "antd";

// --- Data Configuration ---
// เพิ่มข้อมูลปีใหม่ๆ ได้ที่นี่
const paData = [
  {
    year: "2569",
    active: false, // ปีนี้ยังไม่มีข้อมูล
    personnel: [],
  },
  {
    year: "2568",
    active: true,
    personnel: [
      {
        name: "นางนงลักษร์ ศรีชา",
        image: "/pdf/งานบุคลากร/นางนงลักษรื.webp", // ตรวจสอบชื่อไฟล์ดีๆ นะครับ (นงลักษรื -> นงลักษร์)
        file: "/pdf/งานบุคลากร/รานงานผลการปฏิบัติงาน(ข้าราชการครู).pdf",
        role: "ข้าราชการครู",
      },
      {
        name: "นางวีนัส สุวรรณ",
        image: "/pdf/งานบุคลากร/นางวีนัส.webp",
        file: "/pdf/งานบุคลากร/รายงานผลการปฏิบัติงาน(พนักงานราชการครู).pdf",
        role: "พนักงานราชการครู",
      },
      {
        name: "นายจักรกฤษณ์ พันธ์ศรี",
        image: "", // ถ้าไม่มีรูป ใส่ placeholder หรือว่างไว้
        file: "/pdf/งานบุคลากร/นายจักรกฤษณ์.pdf",
        role: "บุคลากรทางการศึกษา",
      },
      {
        name: "นายทรงพร พรมโสภา",
        image: "",
        file: "/pdf/งานบุคลากร/นายทรงพร.pdf",
        role: "บุคลากรทางการศึกษา",
      },
      {
        name: "นายสิริปัญญ์ เสริมสิริพิพัฒน์",
        image: "",
        file: "/pdf/งานบุคลากร/นายสิริปัญญ์.pdf",
        role: "บุคลากรทางการศึกษา",
      },
      {
        name: "นางสาวณัญสินี ชวดพงษ์",
        image: "",
        file: "/pdf/งานบุคลากร/นางสาวณัญสินี.pdf",
        role: "บุคลากรทางการศึกษา",
      },
      {
        name: "นางสาวล้ำค่า จินาวัลย์",
        image: "",
        file: "/pdf/งานบุคลากร/นางสาวล้ำค่า.pdf",
        role: "บุคลากรทางการศึกษา",
      },
    ],
  },
];

// --- Reusable Person Card ---
const PersonCard = ({ data }: { data: any }) => (
  <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md sm:flex-row dark:border-neutral-700 dark:bg-neutral-800">
    {/* Image Section */}
    <div className="relative h-48 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-48 dark:bg-neutral-900">
      {data.image ? (
        <Image
          removeWrapper
          src={data.image}
          alt={data.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-300">
          <UserOutlined className="text-4xl" />
        </div>
      )}
    </div>

    {/* Content Section */}
    <div className="flex w-full flex-col justify-between p-6">
      <div>
        <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-white">
          {data.name}
        </h3>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {data.role || "ตำแหน่งบุคลากร"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
        <Link href={data.file} target="_blank" className="flex-1 sm:flex-none">
          <Button
            fullWidth
            className="bg-blue-600 font-medium text-white"
            startContent={<EyeOutlined />}
          >
            เปิดดูเอกสาร
          </Button>
        </Link>
        <a href={data.file} download className="flex-1 sm:flex-none">
          <Button
            fullWidth
            variant="bordered"
            className="border-slate-300 text-slate-700 dark:text-slate-300"
            startContent={<DownloadOutlined />}
          >
            ดาวน์โหลด
          </Button>
        </a>
      </div>
    </div>
  </div>
);

export default function PaPage() {
  // Animation Styles
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Accordion Styles
  const itemClasses = {
    base: "py-0 w-full mb-4",
    title: "font-bold text-lg text-slate-800 dark:text-slate-100",
    subtitle: "text-sm text-slate-400",
    trigger:
      "px-6 py-4 bg-white dark:bg-neutral-900 data-[hover=true]:bg-slate-50 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm transition-all",
    indicator: "text-medium text-slate-400",
    content: "text-small px-2 pb-6 bg-transparent pt-4",
  };

  return (
    <section className="min-h-screen bg-slate-50 pb-20 font-sans dark:bg-neutral-950">
      {/* --- Breadcrumb & Header --- */}
      <div className="border-b border-slate-200 bg-white pt-[100px] pb-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            การประเมินผล<span className="text-[#DAA520]">การพัฒนางาน (PA)</span>
          </h1>
          <p className="mb-6 text-sm text-slate-500 md:text-base dark:text-slate-400">
            Performance Agreement for Government Teachers and Educational
            Personnel
          </p>

          <div className="flex justify-center">
            <Breadcrumb
              items={[
                {
                  href: "/",
                  title: (
                    <>
                      <HomeOutlined /> Home
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-blue-600">
                      Performance Agreement (PA)
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="relative z-10 container mx-auto -mt-8 max-w-5xl px-4 md:px-8"
      >
        <Accordion
          variant="splitted"
          itemClasses={itemClasses}
          defaultExpandedKeys={["2568"]} // เปิดปีล่าสุดอัตโนมัติ
        >
          {paData.map((yearData) => (
            <AccordionItem
              key={yearData.year}
              aria-label={yearData.year}
              title={`ปีงบประมาณ ${yearData.year}`}
              startContent={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                  <CalendarOutlined className="text-xl" />
                </div>
              }
              subtitle={
                yearData.active
                  ? `${yearData.personnel.length} รายการ`
                  : "ไม่มีข้อมูล"
              }
            >
              <div className="px-2">
                {yearData.active && yearData.personnel.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {yearData.personnel.map((person, idx) => (
                      <PersonCard key={idx} data={person} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 py-10 text-center text-slate-400">
                    <FilePdfOutlined className="mb-2 text-4xl opacity-50" />
                    <p>ยังไม่มีข้อมูลเอกสารสำหรับปีนี้</p>
                  </div>
                )}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  );
}
