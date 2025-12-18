"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";
import { ProjectOutlined, DatabaseOutlined } from "@ant-design/icons";
import Plan2566 from "./2566/page";
import Plan2567 from "./2567/page";
import Plan2568 from "./2568/page";
import Plan2569 from "./2569/page";

// Import Components

// 1. Data Configuration (รวมข้อมูลไว้ที่นี่เพื่อความสะอาดของโค้ด)
const planningJobs = [
  {
    key: "1",
    title: "ปีงบประมาณ 2569",
    subtitle: "Data for the entire fiscal year.",
    icon: <DatabaseOutlined />,
    component: <Plan2569 />,
  },
  {
    key: "2",
    title: "ปีงบประมาณ 2568",
    subtitle: "Data for the entire fiscal year.",
    icon: <DatabaseOutlined />,
    component: <Plan2568 />,
    // actions: [
    //   {
    //     label: "Ktltc Plan",
    //     href: "https://ktltcp.vercel.app/",
    //     icon: <LinkOutlined />,
    //   },
    //   {
    //     label: "แบบฟอร์ม PDCA",
    //     href: "https://ktltc.vercel.app/pdca",
    //     icon: <FileTextOutlined />,
    //   },
    //   {
    //     label: "งานวางแผน และงบประมาณหน้าหลัก",
    //     href: "/planning",
    //     icon: <GlobalOutlined />,
    //   },
    // ],
  },
  {
    key: "3",
    title: "ปีงบประมาณ 2567",
    subtitle: "Data for the entire fiscal year.",
    icon: <DatabaseOutlined />,
    component: <Plan2567 />,
  },
  {
    key: "4",
    title: "ปีงบประมาณ 2566",
    subtitle: "Data for the entire fiscal year.",
    icon: <DatabaseOutlined />,
    component: <Plan2566 />,
  },
];

export default function PlanNing() {
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
    <section className="min-h-screen py-16 font-sans">
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
            <ProjectOutlined className="mr-2" /> 'งานวางแผน & ความร่วมมือ'
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            งานวางแผน
            <span className="text-[#DAA520]">และความร่วมมือ</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Planning and Cooperation Division
          </p>
        </motion.div>

        {/* --- Content (Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion itemClasses={itemClasses} className="px-0">
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
