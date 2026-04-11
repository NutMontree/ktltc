"use client";

import React from "react";
import PersonnelList from "../(components)/PersonnelList";
import Link from "next/link";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ClusterOutlined,
  SolutionOutlined,
  BarChartOutlined,
  DesktopOutlined,
  BookOutlined,
  ReadOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// Import Components
import Academicing from "./Academic";
import DVEDS from "./DVEDS";
import MAEW from "./MAEW";
import TMW from "./TMW";
import CDW from "./CDW";
import ARAL from "./ARAL";

// 1. Data Configuration (ปรับสี Theme ให้เป็นโทนฟ้า-น้ำเงิน สบายตาและดูฉลาด)
const academicJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Administrative Structure",
    icon: <ClusterOutlined />,
    component: <Academicing />,
    color: "bg-sky-500",
    lightColor: "bg-sky-50 text-sky-600",
  },
  {
    key: "2",
    title: "งานอาชีวศึกษาระบบทวิภาคี",
    subtitle: "Dual Vocational Education",
    icon: <SolutionOutlined />,
    component: <DVEDS />,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
  },
  {
    key: "3",
    title: "งานวัดผลและประเมินผล",
    subtitle: "Measurement & Evaluation",
    icon: <BarChartOutlined />,
    component: <MAEW />,
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "4",
    title: "งานสื่อการเรียนการสอน",
    subtitle: "Instructional Media",
    icon: <DesktopOutlined />,
    component: <TMW />,
    color: "bg-teal-500",
    lightColor: "bg-teal-50 text-teal-600",
  },
  {
    key: "5",
    title: "งานพัฒนาหลักสูตรการเรียนการสอน",
    subtitle: "Curriculum Development",
    icon: <BookOutlined />,
    component: <CDW />,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-600",
    actions: [
      {
        label: "หลักสูตรการเรียน การสอน",
        href: "/CourseInformation",
        icon: <ArrowRightOutlined />, // ใช้ icon มาตรฐานแทน component หน้าเว็บ
      },
    ],
  },
  {
    key: "6",
    title: "งานวิทยบริการและห้องสมุด",
    subtitle: "Academic Resources & Library",
    icon: <ReadOutlined />,
    component: <ARAL />,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50 text-indigo-600",
  },
];

export default function AcademicAffairsPage() {
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // UX/UI: Modern Accordion Styles
  const itemClasses = {
    base: "py-0 w-full mb-4 group data-[open=true]:shadow-lg transition-shadow duration-300",
    title: "font-bold text-lg text-slate-800 dark:text-slate-100",
    subtitle: "text-xs font-medium text-slate-400 mt-1",
    trigger:
      "px-6 py-5 bg-white dark:bg-zinc-900/80 backdrop-blur-xl hover:bg-slate-50/80 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all duration-300 data-[hover=true]:border-sky-200 dark:data-[hover=true]:border-sky-900", // เปลี่ยน Border Hover เป็นสี Sky
    indicator:
      "text-lg text-slate-400 data-[open=true]:text-sky-500 data-[open=true]:rotate-90", // เปลี่ยน Indicator เป็นสี Sky
    content:
      "text-small px-6 pb-8 pt-4 bg-white/50 dark:bg-zinc-900/50 rounded-b-2xl border-x border-b border-slate-200/60 dark:border-zinc-800 -mt-2",
  };

  return (
    <section className="relative max-w-[1600px] mx-auto py-20 overflow-hidden bg-slate-50/50 dark:bg-black">
      {/* Decorative Background: ใช้สี Sky/Blue ให้ความรู้สึกสว่างและกว้างขวาง */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-sky-100/40 to-transparent dark:from-sky-900/20 pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6"
      >
        {/* --- Header --- */}
        <motion.div variants={itemVar} className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Departments
          </span>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            ฝ่าย
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-400">
              วิชาการ
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium">
            Academic Affairs Division
          </p>
        </motion.div>

        {/* --- Content (Modern Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className="px-0 gap-4"
            showDivider={false}
          >
            {academicJobs.map((job) => (
              <AccordionItem
                key={job.key}
                aria-label={job.title}
                startContent={
                  // UX: Icon with distinct color background
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${job.lightColor} dark:bg-zinc-800 dark:text-sky-400 text-xl transition-transform group-hover:scale-110 duration-300`}
                  >
                    {job.icon}
                  </div>
                }
                subtitle={job.subtitle}
                title={
                  <span className="group-data-[open=true]:text-sky-600 dark:group-data-[open=true]:text-sky-400 transition-colors">
                    {job.title}
                  </span>
                }
              >
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                  {/* Action Buttons Toolbar */}
                  {job.actions && (
                    <div className="mb-8 flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700/50">
                      {job.actions.map((action, idx) => (
                        <Link
                          key={idx}
                          href={action.href}
                          target="_blank"
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            startContent={action.icon}
                            endContent={
                              <ArrowRightOutlined className="text-[10px] opacity-50" />
                            }
                            className="w-full font-semibold bg-white dark:bg-zinc-700 shadow-sm border border-slate-200 dark:border-zinc-600 hover:border-sky-300 transition-all"
                          >
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Main Component Render */}
                  <div className="relative">
                    {/* Decorative line: สี Sky */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-sky-500/20 to-transparent rounded-full" />
                    <div className="pl-6">
                      {job.component}
                      {job.key !== "1" /* Skip Structure */ && (
                        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-zinc-800">
                          <PersonnelList
                            departmentName={job.title}
                            departmentCode="ฝ่ายวิชาการ"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
}
