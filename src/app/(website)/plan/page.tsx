"use client";

import React from "react";
import PersonnelList from "../(components)/PersonnelList";
import { Accordion, AccordionItem, Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ClusterOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  ShopOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  HeartOutlined,
  LinkOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

// Import Components
import Planning from "../plan/Planning";
import CW from "../plan/CW";
import DataCenter from "../plan/DataCenter";
import FFEE from "../plan/FFEE";
import KTCVS from "../plan/KTCVS";
import PAB from "../plan/PAB";
import QAES from "../plan/QAES";
import RDIAI from "../plan/RDIAI";
import TABPW from "../plan/TABPW";
import Link from "next/link";

// 1. Data Configuration (เพิ่มสี Theme ให้แต่ละหัวข้อ)
const planningJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Administrative Structure",
    icon: <ClusterOutlined />,
    component: <Planning />,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
  },
  {
    key: "2",
    title: "งานพัฒนายุทธศาสตร์ แผนงานโครงการและงบประมาณ",
    subtitle: "Planning & Budgeting",
    icon: <ProjectOutlined />,
    component: <PAB />,
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50 text-indigo-600",
    actions: [
      {
        label: "Ktltc Plan",
        href: "https://ktltcp.vercel.app/",
        icon: <LinkOutlined />,
      },
      {
        label: "แบบฟอร์ม PDCA",
        href: "/pdca",
        icon: <FileTextOutlined />,
      },
      {
        label: "หน้าหลักงานวางแผน",
        href: "/planning",
        icon: <GlobalOutlined />,
      },
    ],
  },
  {
    key: "3",
    title: "งานมาตรฐานและการประกันคุณภาพการศึกษา",
    subtitle: "Quality Assurance",
    icon: <SafetyCertificateOutlined />,
    component: <QAES />,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "4",
    title: "งานศูนย์ดิจิทัลและสื่อสารองค์กร",
    subtitle: "Digital Center & Communication",
    icon: <DatabaseOutlined />,
    component: <DataCenter />,
    color: "bg-cyan-500",
    lightColor: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "5",
    title: "งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์",
    subtitle: "R&D and Innovation",
    icon: <ExperimentOutlined />,
    component: <RDIAI />,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-600",
  },
  {
    key: "6",
    title: "งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ",
    subtitle: "Business Promotion",
    icon: <ShopOutlined />,
    component: <TABPW />,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 text-amber-600",
  },
  {
    key: "7",
    title: "งานติดตามและประเมินผลการอาชีวศึกษา",
    subtitle: "Monitoring & Evaluation",
    icon: <FileTextOutlined />,
    component: <PAB />, // Placeholder
    color: "bg-rose-500",
    lightColor: "bg-rose-50 text-rose-600",
  },
];

export default function PlanningPage() {
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
      "px-4 py-5 bg-white dark:bg-zinc-900/80 backdrop-blur-xl hover:bg-slate-50/80 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-sm transition-all duration-300 data-[hover=true]:border-indigo-200 dark:data-[hover=true]:border-indigo-900",
    indicator:
      "text-lg text-slate-400 data-[open=true]:text-indigo-500 data-[open=true]:rotate-90",
    content:
      "text-small pb-8 pt-4 bg-white/50 dark:bg-zinc-900/50 rounded-b-2xl border-x border-b border-slate-200/60 dark:border-zinc-800 -mt-2",
  };

  return (
    <section className="relative max-w-[1600px] mx-auto py-20 overflow-hidden bg-slate-50/50 dark:bg-black">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-linear-to-b from-indigo-100/40 to-transparent dark:from-indigo-900/20 pointer-events-none" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* --- Header --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-sm text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Departments
          </span>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            ฝ่ายแผนงาน
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              และความร่วมมือ
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-medium">
            Planning and Cooperation Division
          </p>
        </motion.div>

        {/* --- Content (Modern Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className=" gap-4"
            showDivider={false}
          >
            {planningJobs.map((job) => (
              <AccordionItem
                key={job.key}
                aria-label={job.title}
                startContent={
                  // UX: Icon with distinct color background
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${job.lightColor} dark:bg-zinc-800 dark:text-indigo-400 text-xl transition-transform group-hover:scale-110 duration-300`}
                  >
                    {job.icon}
                  </div>
                }
                subtitle={job.subtitle}
                title={
                  <span className="group-data-[open=true]:text-indigo-600 dark:group-data-[open=true]:text-indigo-400 transition-colors">
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
                            className="w-full font-semibold bg-white dark:bg-zinc-700 shadow-sm border border-slate-200 dark:border-zinc-600 hover:border-indigo-300 transition-all"
                          >
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Main Component Render */}
                  <div className="relative">
                    {/* Decorative line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-indigo-500/20 to-transparent rounded-full" />
                    <div className="pl-6">
                      {job.component}
                      {job.key !== "1" && ( /* Skip Structure */
                        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-zinc-800">
                          <PersonnelList departmentName={job.title} departmentCode="ฝ่ายยุทธศาสตร์และแผนงาน" />
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
