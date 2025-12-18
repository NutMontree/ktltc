"use client";

import React from "react";
import Link from "next/link";
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
} from "@ant-design/icons";
import Planning from "../plan/Planning";
import CW from "../plan/CW";
import DataCenter from "../plan/DataCenter";
import FFEE from "../plan/FFEE";
import KTCVS from "../plan/KTCVS";
import PAB from "../plan/PAB";
import QAES from "../plan/QAES";
import RDIAI from "../plan/RDIAI";
import TABPW from "../plan/TABPW";

// Import Components

// 1. Data Configuration (รวมข้อมูลไว้ที่นี่เพื่อความสะอาดของโค้ด)
const planningJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Administrative Structure",
    icon: <ClusterOutlined />,
    component: <Planning />,
  },
  {
    key: "2",
    title: "งานวางแผน และงบประมาณ",
    subtitle: "Planning & Budgeting",
    icon: <ProjectOutlined />,
    component: <PAB />,
    actions: [
      {
        label: "Ktltc Plan",
        href: "https://ktltcp.vercel.app/",
        icon: <LinkOutlined />,
      },
      {
        label: "แบบฟอร์ม PDCA",
        href: "https://ktltc.vercel.app/pdca",
        icon: <FileTextOutlined />,
      },
      {
        label: "งานวางแผน และงบประมาณหน้าหลัก",
        href: "/planning",
        icon: <GlobalOutlined />,
      },
    ],
  },
  {
    key: "3",
    title: "งานศูนย์ข้อมูลและสารสนเทศ",
    subtitle: "Data Center & IT",
    icon: <DatabaseOutlined />,
    component: <DataCenter />,
  },
  {
    key: "4",
    title: "งานความร่วมมือ",
    subtitle: "Cooperation",
    icon: <GlobalOutlined />,
    component: <CW />,
  },
  {
    key: "5",
    title: "งานส่งเสริมผลิตผล การค้าและประกอบธุรกิจ",
    subtitle: "Business Promotion",
    icon: <ShopOutlined />,
    component: <TABPW />,
  },
  {
    key: "6",
    title: "งานวิจัย พัฒนา นวัตกรรมและสิ่งประดิษฐ์",
    subtitle: "R&D and Innovation",
    icon: <ExperimentOutlined />,
    component: <RDIAI />,
  },
  {
    key: "7",
    title: "งานประกันคุณภาพและมาตรฐานการศึกษา",
    subtitle: "Quality Assurance",
    icon: <SafetyCertificateOutlined />,
    component: <QAES />,
  },
  {
    key: "8",
    title: "งานร้านค้าสวัสดิการ",
    subtitle: "Welfare Shop",
    icon: <ShoppingOutlined />,
    component: <KTCVS />,
  },
  {
    key: "9",
    title: "งานกองทุนเพื่อความเสมอภาคทางการศึกษา",
    subtitle: "Educational Equity Fund",
    icon: <HeartOutlined />,
    component: <FFEE />,
  },
];

export default function PlanningPage() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Custom Accordion Styles
  const itemClasses = {
    base: "py-0 w-full mb-4",
    title: "font-semibold text-base text-slate-800 dark:text-slate-100",
    subtitle: "text-xs text-slate-400",
    trigger:
      "px-6 py-4 bg-white dark:bg-neutral-900 data-[hover=true]:bg-slate-50 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm transition-all",
    indicator: "text-medium text-slate-400",
    content:
      "text-small px-6 pb-6 bg-white dark:bg-neutral-900 rounded-b-2xl border-x border-b border-slate-100 dark:border-neutral-800 -mt-2 pt-6",
  };

  return (
    <section className="min-h-screen bg-slate-50 py-16 font-sans dark:bg-neutral-950">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className=" "
      >
        {/* --- Header --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ProjectOutlined className="mr-2" /> ฝ่ายแผนงาน
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ฝ่ายแผนงาน<span className="text-[#DAA520]">และความร่วมมือ</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Planning and Cooperation Division
          </p>
        </motion.div>

        {/* --- Content (Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className="px-0"
          >
            {planningJobs.map((job) => (
              <AccordionItem
                key={job.key}
                aria-label={job.title}
                startContent={
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 dark:bg-neutral-800 dark:text-slate-300">
                    {job.icon}
                  </div>
                }
                subtitle={job.subtitle}
                title={job.title}
              >
                <div className="animate-in fade-in zoom-in duration-300">
                  {/* Render Component */}
                  {job.component}

                  {/* Render Action Buttons (ถ้ามี) */}
                  {job.actions && (
                    <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-4 dark:border-neutral-800">
                      {job.actions.map((action, idx) => (
                        <Link key={idx} href={action.href} target="_blank">
                          <Button
                            color="primary"
                            variant="flat"
                            startContent={action.icon}
                            className="font-semibold"
                          >
                            {action.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
}
