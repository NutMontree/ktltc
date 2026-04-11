/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React from "react";
import PersonnelList from "../(components)/PersonnelList";
import Link from "next/link";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ClusterOutlined,
  FlagOutlined,
  HeartOutlined,
  UserSwitchOutlined,
  SafetyOutlined,
  CompassOutlined,
  SmileOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// Import Components
import Developing from "./Developing";
import SA from "./Sa";
import Space from "./Spcs";
import ATJ from "./ATJ";
import AW from "./AW";
import CGAE from "./CGAE";
import SWW from "./SWW";
import VEMI from "./VEMI";
import WSP from "./WSP";

// 1. Data Configuration (เพิ่มสี Theme ให้สดใส เหมาะกับงานกิจกรรม)
const activityJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Structure",
    icon: <ClusterOutlined />,
    component: <Developing />,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
  },
  {
    key: "2",
    title: "งานกิจกรรมนักเรียนนักศึกษา",
    subtitle: "Student Activities",
    icon: <FlagOutlined />,
    component: <SA />,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 text-orange-600",
  },
  {
    key: "3",
    title: "งานโครงการพิเศษและบริการชุมชน",
    subtitle: "Special Projects & Community Service",
    icon: <HeartOutlined />,
    component: <Space />,
    color: "bg-pink-500",
    lightColor: "bg-pink-50 text-pink-600",
  },
  {
    key: "4",
    title: "งานครูที่ปรึกษา",
    subtitle: "Advisor System",
    icon: <UserSwitchOutlined />,
    component: <ATJ />,
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "5",
    title: "งานปกครอง",
    subtitle: "Discipline & Governance",
    icon: <SafetyOutlined />,
    component: <AW />,
    color: "bg-red-500",
    lightColor: "bg-red-50 text-red-600",
  },
  {
    key: "6",
    title: "งานแนะแนวอาชีพและการจัดหางาน",
    subtitle: "Guidance & Career",
    icon: <CompassOutlined />,
    component: <CGAE />,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "7",
    title: "งานสวัสดิการนักเรียนนักศึกษา",
    subtitle: "Student Welfare",
    icon: <SmileOutlined />,
    component: <SWW />,
    color: "bg-yellow-500",
    lightColor: "bg-yellow-50 text-yellow-600",
  },
  {
    key: "8",
    title: "งานสถานศึกษาคุณธรรมอาชีวศึกษา",
    subtitle: "Moral School Project",
    icon: <StarOutlined />,
    component: <VEMI />,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-600",
  },
  {
    key: "9",
    title: "งานโครงการสถานศึกษาสีขาว",
    subtitle: "White School Project",
    icon: <SafetyCertificateOutlined />,
    component: <WSP />,
    color: "bg-teal-500",
    lightColor: "bg-teal-50 text-teal-600",
  },
];

export default function StudentActivitiesPage() {
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
      "px-6 py-5 bg-white dark:bg-zinc-900/80 backdrop-blur-xl hover:bg-slate-50/80 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all duration-300 data-[hover=true]:border-teal-200 dark:data-[hover=true]:border-teal-900", // ปรับ Border Hover เป็นสี Teal
    indicator:
      "text-lg text-slate-400 data-[open=true]:text-teal-500 data-[open=true]:rotate-90", // ปรับ Indicator เป็นสี Teal
    content:
      "text-small px-6 pb-8 pt-4 bg-white/50 dark:bg-zinc-900/50 rounded-b-2xl border-x border-b border-slate-200/60 dark:border-zinc-800 -mt-2",
  };

  return (
    <section className="relative max-w-[1600px] mx-auto py-20 overflow-hidden bg-slate-50/50 dark:bg-black">
      {/* Decorative Background: ใช้สี Teal/Green ให้ความรู้สึกสดชื่นและ Active */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-teal-100/40 to-transparent dark:from-teal-900/20 pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6"
      >
        {/* --- Header --- */}
        <motion.div variants={itemVar} className="mb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Departments
          </span>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            ฝ่ายพัฒนากิจการ
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-green-600 dark:from-teal-400 dark:to-green-400">
              นักเรียน นักศึกษา
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium">
            Student Activities Development Division
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
            {activityJobs.map((job) => (
              <AccordionItem
                key={job.key}
                aria-label={job.title}
                startContent={
                  // UX: Icon with distinct color background
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${job.lightColor} dark:bg-zinc-800 dark:text-teal-400 text-xl transition-transform group-hover:scale-110 duration-300`}
                  >
                    {job.icon}
                  </div>
                }
                subtitle={job.subtitle}
                title={
                  <span className="group-data-[open=true]:text-teal-600 dark:group-data-[open=true]:text-teal-400 transition-colors">
                    {job.title}
                  </span>
                }
              >
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                  {/* Action Buttons Toolbar (Placeholder for future actions) */}
                  {/* @ts-ignore: Check if actions exist */}
                  {job.actions && (
                    <div className="mb-8 flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700/50">
                      {/* @ts-ignore */}
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
                            className="w-full font-semibold bg-white dark:bg-zinc-700 shadow-sm border border-slate-200 dark:border-zinc-600 hover:border-teal-300 transition-all"
                          >
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Main Component Render */}
                  <div className="relative">
                    {/* Decorative line: สี Teal */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-teal-500/20 to-transparent rounded-full" />
                    <div className="pl-6">
                      {job.component}
                      {job.key !== "1" /* Skip Structure */ && (
                        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-zinc-800">
                          <PersonnelList
                            departmentName={job.title}
                            departmentCode="ฝ่ายพัฒนากิจการนักเรียน นักศึกษา"
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
