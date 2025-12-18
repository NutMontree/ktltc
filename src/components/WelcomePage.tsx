"use client";

import React, { useState } from "react";
import { Image } from "@heroui/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconEye,
  IconFingerprint,
  IconDiamond,
  IconBulb,
  IconHeart,
  IconQuote,
} from "@tabler/icons-react"; // ใช้ Icon set ไหนก็ได้ หรือลบออกถ้าไม่มี

// --- ข้อมูลองค์กร (แก้ไขข้อความตรงนี้) ---
const ORG_INFO = [
  {
    id: "vision",
    label: "วิสัยทัศน์",
    icon: <IconEye className="h-4 w-4" />,
    title: "วิสัยทัศน์ (Vision)",
    content:
      "มุ่งมั่นจัดการอาชีวศึกษา ให้ผู้เรียนมีสมรรถนะวิชาชีพ คุณธรรม จริยธรรม และคุณภาพชีวิตที่ดี สอดคล้องกับความต้องการของตลาดแรงงานและสังคม",
    color: "bg-blue-500",
  },
  {
    id: "uniqueness",
    label: "เอกลักษณ์",
    icon: <IconFingerprint className="h-4 w-4" />,
    title: "เอกลักษณ์ (Uniqueness)",
    content:
      "บริการวิชาชีพสู่ชุมชน และสังคม (Professional Service to Community and Society)",
    color: "bg-indigo-500",
  },
  {
    id: "identity",
    label: "อัตลักษณ์",
    icon: <IconDiamond className="h-4 w-4" />,
    title: "อัตลักษณ์ (Identity)",
    content:
      "ทักษะเยี่ยม เปี่ยมคุณธรรม ล้ำเลิศจิตอาสา (Excellent Skills, Full of Virtue, Outstanding Volunteer Spirit)",
    color: "bg-violet-500",
  },
  {
    id: "philosophy",
    label: "ปรัชญา",
    icon: <IconBulb className="h-4 w-4" />,
    title: "ปรัชญา (Philosophy)",
    content:
      "ทักษะเยี่ยม เปี่ยมคุณธรรม นำวิชาการ (Excellent Skills, Full of Virtue, Leading Academically)",
    color: "bg-amber-500",
  },
  {
    id: "values",
    label: "ค่านิยม",
    icon: <IconHeart className="h-4 w-4" />,
    title: "ค่านิยม (Core Values)",
    content:
      "สร้างคนดี มีฝีมือ ยึดถือจรรยาบรรณ (Creating Good People, Skilled, Adhering to Ethics)",
    color: "bg-rose-500",
  },
  {
    id: "motto",
    label: "คำขวัญ",
    icon: <IconQuote className="h-4 w-4" />,
    title: "คำขวัญ (Motto)",
    content:
      "วินัยดี มีวิชา กีฬาเด่น (Good Discipline, Knowledgeable, Outstanding Sports)",
    color: "bg-emerald-500",
  },
];

export default function WelcomePage() {
  const [activeTab, setActiveTab] = useState(ORG_INFO[0]);

  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-20 font-sans dark:bg-neutral-950">
      {/* --- Background Decorations --- */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[24px_24px]" />
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px] filter dark:bg-blue-600/20" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] filter dark:bg-indigo-600/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-8">
          {/* --- Left Column: Director Spotlight (Keep Original) --- */}
          <div className="flex flex-col items-center justify-center lg:col-span-5 lg:justify-start">
            <CardContainer className="inter-var w-full max-w-sm lg:max-w-md">
              <CardBody className="group/card relative h-auto w-auto rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-blue-500/20 dark:border-white/10 dark:bg-black/40 dark:hover:shadow-emerald-500/10">
                <CardItem translateZ="30" className="mb-4">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
                    KTLTC Director
                  </span>
                </CardItem>
                <CardItem
                  translateZ="50"
                  className="text-3xl font-extrabold text-slate-800 dark:text-white"
                >
                  <span className="bg-linear-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
                    นางสาวทักษิณา ชมจันทร์
                  </span>
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                </CardItem>
                <CardItem translateZ="80" className="mt-8 w-full">
                  <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                    <Image
                      src="/images/ปก/3.webp"
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover/card:scale-110"
                      alt="Director Image"
                      removeWrapper
                    />
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>

          {/* --- Right Column: Organization Info Tabs --- */}
          <div className="flex h-full flex-col lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/50 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/60">
              {/* 1. Header Area: Dynamic Title */}
              <div className="border-b border-slate-200/60 bg-white/50 px-8 py-6 backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
                <div className="flex items-center gap-4">
                  {/* Icon Box */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-colors duration-300 ${activeTab.color} text-white`}
                  >
                    {activeTab.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      ข้อมูลองค์กร
                    </h3>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activeTab.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm font-medium text-slate-500 dark:text-slate-400"
                      >
                        แสดงข้อมูล: {activeTab.label}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* 2. Menu Selection Area (Scrollable on mobile) */}
              <div className="px-6 pt-6">
                <div className="flex flex-wrap gap-2 pb-2">
                  {ORG_INFO.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab)}
                      className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${
                        activeTab.id === tab.id
                          ? "text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      {/* Active State Background Animation */}
                      {activeTab.id === tab.id && (
                        <motion.span
                          layoutId="active-pill"
                          className="absolute inset-0 z-0 rounded-full bg-blue-600 shadow-md dark:bg-blue-600"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}

                      {/* Text & Icon Layer */}
                      <span className="relative z-10 flex items-center gap-2">
                        {tab.icon} {tab.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Content Area */}
              <div className="min-h-[300px] p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="inline-block w-fit rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {activeTab.label}
                    </div>

                    <h2 className="text-2xl leading-tight font-bold text-slate-900 dark:text-white">
                      {activeTab.title}
                    </h2>

                    <div className="h-1 w-20 rounded-full bg-slate-200 dark:bg-neutral-700">
                      <motion.div
                        className={`h-full rounded-full ${activeTab.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      />
                    </div>

                    <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                      {activeTab.content}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
