"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
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
  TeamOutlined,
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

// 1. Data Configuration
const activityJobs = [
  {
    key: "1",
    title: "แผนภูมิโครงสร้างการบริหารงาน",
    subtitle: "Structure",
    icon: <ClusterOutlined />,
    component: <Developing />,
  },
  {
    key: "2",
    title: "งานกิจกรรมนักเรียนนักศึกษา",
    subtitle: "Student Activities",
    icon: <FlagOutlined />,
    component: <SA />,
  },
  {
    key: "3",
    title: "งานโครงการพิเศษและบริการชุมชน",
    subtitle: "Special Projects & Community Service",
    icon: <HeartOutlined />,
    component: <Space />,
  },
  {
    key: "4",
    title: "งานครูที่ปรึกษา",
    subtitle: "Advisor System",
    icon: <UserSwitchOutlined />,
    component: <ATJ />,
  },
  {
    key: "5",
    title: "งานปกครอง",
    subtitle: "Discipline & Governance",
    icon: <SafetyOutlined />,
    component: <AW />,
  },
  {
    key: "6",
    title: "งานแนะแนวอาชีพและการจัดหางาน",
    subtitle: "Guidance & Career",
    icon: <CompassOutlined />,
    component: <CGAE />,
  },
  {
    key: "7",
    title: "งานสวัสดิการนักเรียนนักศึกษา",
    subtitle: "Student Welfare",
    icon: <SmileOutlined />,
    component: <SWW />,
  },
  {
    key: "8",
    title: "งานสถานศึกษาคุณธรรมอาชีวศึกษา",
    subtitle: "Moral School Project",
    icon: <StarOutlined />,
    component: <VEMI />,
  },
  {
    key: "9",
    title: "งานโครงการสถานศึกษาสีขาว",
    subtitle: "White School Project",
    icon: <SafetyCertificateOutlined />,
    component: <WSP />,
  },
];

export default function StudentActivitiesPage() {
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
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
            <TeamOutlined className="mr-2" /> ฝ่ายพัฒนากิจการ
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ฝ่ายพัฒนากิจการ
            <span className="text-[#DAA520]">นักเรียน นักศึกษา</span>
          </h1>
          <p className="mt-2 text-sm font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Student Activities Development Division
          </p>
        </motion.div>

        {/* --- Content (Accordion) --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted"
            itemClasses={itemClasses}
            className="px-0"
          >
            {activityJobs.map((job) => (
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
