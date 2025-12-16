"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";
import {
  ClusterOutlined,
  AppstoreAddOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  CalculatorOutlined,
  InboxOutlined,
  HomeOutlined,
  IdcardOutlined,
  SoundOutlined,
  CustomerServiceOutlined,
  BankOutlined,
} from "@ant-design/icons";

// Import Components
import StructureResource from "./StructureResource";
import Finance from "./Finance";
import GA from "./GA";
import HR from "./HR";
import AW from "./AW";
import PW from "./PW";
import BASW from "./BASW";
import PRW from "./PRW";
import RW from "./RW";
import CGCA from "./CGCA";

// 1. สร้าง Data Config สำหรับรายการงานต่างๆ เพื่อให้จัดการง่าย
const resourceJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Structure",
    icon: <ClusterOutlined />,
    component: <StructureResource />,
  },
  {
    key: "2",
    title: "งานบริหารงานทั่วไป",
    subtitle: "General Affairs",
    icon: <AppstoreAddOutlined />,
    component: <GA />,
  },
  {
    key: "3",
    title: "งานบุคลากร",
    subtitle: "Human Resources",
    icon: <UsergroupAddOutlined />,
    component: <HR />,
  },
  {
    key: "4",
    title: "งานการเงิน",
    subtitle: "Finance",
    icon: <DollarCircleOutlined />,
    component: <Finance />,
  },
  {
    key: "5",
    title: "งานบัญชี",
    subtitle: "Accounting",
    icon: <CalculatorOutlined />,
    component: <AW />,
  },
  {
    key: "6",
    title: "งานพัสดุ",
    subtitle: "Parcel & Supplies",
    icon: <InboxOutlined />,
    component: <PW />,
  },
  {
    key: "7",
    title: "งานอาคารและสถานที่",
    subtitle: "Buildings & Grounds",
    icon: <HomeOutlined />,
    component: <RW />,
  },
  {
    key: "8",
    title: "งานทะเบียน",
    subtitle: "Registration",
    icon: <IdcardOutlined />,
    component: <BASW />,
  },
  {
    key: "9",
    title: "งานประชาสัมพันธ์",
    subtitle: "Public Relations",
    icon: <SoundOutlined />,
    component: <PRW />,
  },
  {
    key: "10",
    title: "งานบริหารศูนย์ราชการสะดวก",
    subtitle: "GECC Management",
    icon: <CustomerServiceOutlined />,
    component: <CGCA />,
  },
];

export default function ResourceAdministrationPage() {
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
        className="container mx-auto max-w-4xl px-4 md:px-8"
      >
        {/* --- Header --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <BankOutlined className="mr-2" /> ฝ่ายบริหาร
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ฝ่ายบริหาร<span className="text-[#DAA520]">ทรัพยากร</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Resource Administration
          </p>
        </motion.div>

        {/* --- Content (Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className="px-0"
          >
            {resourceJobs.map((job) => (
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
                {/* Lazy rendering content inside accordion */}
                <div className="animate-in fade-in zoom-in duration-300">
                  {job.component}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>
    </section>
  );
}
