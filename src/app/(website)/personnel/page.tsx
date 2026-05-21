"use client";

import React, { useState } from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToolOutlined,
  SettingOutlined,
  FireOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  BuildOutlined,
  CalculatorOutlined,
  ShopOutlined,
  LaptopOutlined,
  CoffeeOutlined,
  ReadOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CarOutlined,
  CheckCircleOutlined,
  BookOutlined,
  SolutionOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

// Import Personnel Components
import PersonnelList from "../(components)/PersonnelList";
import PersonnelInformation from "./PersonnelInformation";
import ExecutiveBoard from "../executiveboard/page";

// Import Duties Components (Resource)
import GA from "../resource/GA";
import HR from "../resource/HR";
import Finance from "../resource/Finance";
import AW from "../resource/AW";
import PW from "../resource/PW";
import RW from "../resource/RW";
import BASW from "../resource/BASW";

// Import Duties Components (Academic)
import CDW from "../academic/CDW";
import MAEW from "../academic/MAEW";
import ARAL from "../academic/ARAL";
import DVEDS from "../academic/DVEDS";
import TMW from "../academic/TMW";

// --- Helper Component: กรอบรองหลังไอคอน ---
const IconBox = ({ colorClass, children }: { colorClass: string; children: React.ReactNode }) => (
  <div
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${colorClass}`}
  >
    {React.cloneElement(children as React.ReactElement<any>, {
      style: { fontSize: "18px" },
    })}
  </div>
);

// --- Data Mapping ---
const academicDepartments = [
  {
    name: "สามัญสัมพันธ์",
    code: "General",
    icon: <ReadOutlined />,
    colorClass: "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
  },
  {
    name: "การบัญชี",
    code: "Accounting",
    icon: <CalculatorOutlined />,
    colorClass: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
  },
  {
    name: "การตลาด",
    code: "Marketing",
    icon: <ShopOutlined />,
    colorClass: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  },
  {
    name: "การตลาด/โลจิสติก์",
    code: "Logistics",
    icon: <AppstoreOutlined />,
    colorClass: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  },
  {
    name: "เทคโนโลยีธุรกิจดิจิทัล",
    code: "Digital Tech",
    icon: <LaptopOutlined />,
    colorClass: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    name: "การโรงแรม",
    code: "Hotel",
    icon: <CoffeeOutlined />,
    colorClass: "bg-red-50 text-[#8D6E63] dark:bg-red-900/20 dark:text-[#A1887F]",
  },
  {
    name: "เทคนิคพื้นฐาน",
    code: "Basic Tech",
    icon: <ToolOutlined />,
    colorClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  {
    name: "ช่างอิเล็กทรอนิกส์",
    code: "Electronics",
    icon: <WifiOutlined />,
    colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    name: "ช่างยนต์",
    code: "Mechanic",
    icon: <CarOutlined />,
    colorClass: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    name: "ยานยนต์ไฟฟ้า",
    code: "EV",
    icon: <ThunderboltOutlined />,
    colorClass: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    name: "ช่างไฟฟ้ากำลัง",
    code: "Electrical Power",
    icon: <ThunderboltOutlined />,
    colorClass: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    name: "ช่างกลโรงงาน",
    code: "Machine Shop",
    icon: <SettingOutlined />,
    colorClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  {
    name: "ช่างเชื่อมโลหะ",
    code: "Welding",
    icon: <FireOutlined />,
    colorClass: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    name: "ช่างก่อสร้าง",
    code: "Construction",
    icon: <BuildOutlined />,
    colorClass: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
  },
];

interface SubDept {
  name: string;
  icon?: React.ReactNode;
  component?: React.ReactNode;
}

const divisions: Record<string, SubDept[]> = {
  ฝ่ายบริหารทรัพยากร: [
    { name: "งานบริหารทั่วไป", icon: <AppstoreOutlined />, component: <GA /> },
    { name: "งานบริหารและพัฒนาทรัพยากรบุคคล", icon: <TeamOutlined />, component: <HR /> },
    { name: "งานการเงิน", icon: <CalculatorOutlined />, component: <Finance /> },
    { name: "งานการบัญชี", icon: <CalculatorOutlined />, component: <AW /> },
    { name: "งานพัสดุ", icon: <BuildOutlined />, component: <PW /> },
    { name: "งานอาคารสถานที่", icon: <BuildOutlined />, component: <RW /> },
    { name: "งานทะเบียน", icon: <BookOutlined />, component: <BASW /> },
  ],
  ฝ่ายยุทธศาสตร์และแผนงาน: [
    { name: "งานพัฒนายุทธศาสตร์ แผนงานโครงการและงบประมาณ", icon: <CheckCircleOutlined /> },
    { name: "งานมาตรฐานและการประกันคุณภาพการศึกษา", icon: <CheckCircleOutlined /> },
    { name: "งานศูนย์ดิจิทัลและสื่อสารองค์กร", icon: <CheckCircleOutlined /> },
    { name: "งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์", icon: <CheckCircleOutlined /> },
    { name: "งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ", icon: <CheckCircleOutlined /> },
    { name: "งานติดตามและประเมินผลการอาชีวศึกษา", icon: <CheckCircleOutlined /> },
  ],
  "ฝ่ายกิจการนักเรียน นักศึกษา": [
    { name: "งานกิจกรรมนักเรียนนักศึกษา", icon: <CheckCircleOutlined /> },
    { name: "งานครูที่ปรึกษาและการแนะแนว", icon: <CheckCircleOutlined /> },
    { name: "งานปกครองและความปลอดภัยนักเรียน นักศึกษา", icon: <CheckCircleOutlined /> },
    { name: "งานสวัสดิการนักเรียนนักศึกษา", icon: <CheckCircleOutlined /> },
    { name: "งานโครงการพิเศษและการบริการชุมชน", icon: <CheckCircleOutlined /> },
  ],
  ฝ่ายวิชาการ: [
    { name: "งานแผนกวิชา.../ภาควิชา.../คณะวิชา...", icon: <SolutionOutlined /> },
    { name: "งานพัฒนาหลักสูตรและการจัดการเรียนรู้", icon: <BookOutlined />, component: <CDW /> },
    { name: "งานวัดผลและประเมินผล", icon: <BarChartOutlined />, component: <TMW /> }, // Using TMW for measurement
    { name: "งานวิทยบริการและเทคโนโลยีการศึกษา", icon: <ReadOutlined />, component: <ARAL /> },
    {
      name: "งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ",
      icon: <SolutionOutlined />,
      component: <DVEDS />,
    },
    { name: "งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา", icon: <CheckCircleOutlined /> },
    { name: "งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ", icon: <CheckCircleOutlined /> },
  ],
};

const tabs = [
  "ผู้บริหารสถานศึกษา",
  "ฝ่ายบริหารทรัพยากร",
  "ฝ่ายยุทธศาสตร์และแผนงาน",
  "ฝ่ายกิจการนักเรียน นักศึกษา",
  "ฝ่ายวิชาการ",
  "แผนกวิชา",
] as const;

type TabType = (typeof tabs)[number];

export default function Personnel() {
  const [activeTab, setActiveTab] = useState<TabType>("ผู้บริหารสถานศึกษา");

  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Styles สำหรับ Accordion
  const itemClasses = {
    base: "py-0 w-full mb-6 group transition-all duration-300 data-[open=true]:drop-shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:data-[open=true]:drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
    title:
      "font-black text-lg text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors",
    trigger:
      "px-6 py-5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg hover:bg-white/90 dark:hover:bg-neutral-900/90 rounded-[24px] border border-white/60 dark:border-neutral-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 group-data-[open=true]:rounded-b-none group-data-[open=true]:border-b-0",
    indicator:
      "text-lg text-slate-400 data-[open=true]:text-amber-500 data-[open=true]:rotate-90 transition-transform duration-300",
    content:
      "text-small   pb-8 pt-4 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg rounded-b-[24px] border-x border-b border-white/60 dark:border-neutral-800/60 -mt-2",
  };

  return (
    <section className="dark:bg-transparent  font-sans">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="mx-auto max-w-[1400px]"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 shadow-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            <TeamOutlined className="mr-2 text-amber-500" /> โครงสร้างและบุคลากรของเรา
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900 md:text-5xl dark:text-white tracking-tight leading-tight">
            ข้อมูล
            <span className="bg-linear-to-r from-amber-600 via-yellow-500 to-amber-500 bg-clip-text text-transparent ml-2 font-black">
              บุคลากร
            </span>
          </h1>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-linear-to-r from-amber-500 to-yellow-400" />
          <p className="mt-6 text-lg font-medium text-slate-500 dark:text-slate-400">
            Personnel Information Directory
          </p>
        </motion.div>

        {/* --- Dynamic Categories Tabs --- */}
        <motion.div variants={itemVar} className="mb-16 w-full overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex w-max min-w-full justify-center">
            <div className="inline-flex gap-1 p-1.5 rounded-full border border-slate-200/60 bg-white/60 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2.5 text-sm font-black transition-colors duration-300 rounded-full whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-full bg-linear-to-r from-amber-600 to-yellow-500 shadow-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- Dynamic Content Area --- */}
        <motion.div variants={itemVar} className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "ผู้บริหารสถานศึกษา" && (
                <div className="rounded-[40px] border border-slate-200 bg-white shadow-xl overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                  <ExecutiveBoard />
                </div>
              )}

              {activeTab === "แผนกวิชา" && (
                <Accordion variant="splitted" className="gap-3 px-0" itemClasses={itemClasses}>
                  {academicDepartments.map((dept, index) => (
                    <AccordionItem
                      key={String(index)}
                      aria-label={dept.name}
                      startContent={<IconBox colorClass={dept.colorClass}>{dept.icon}</IconBox>}
                      title={`แผนกวิชา${dept.name}`}
                    >
                      <div className="pt-2">
                        <PersonnelList departmentName={dept.name} departmentCode={dept.code} />
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {(activeTab === "ฝ่ายบริหารทรัพยากร" ||
                activeTab === "ฝ่ายยุทธศาสตร์และแผนงาน" ||
                activeTab === "ฝ่ายกิจการนักเรียน นักศึกษา" ||
                activeTab === "ฝ่ายวิชาการ") && (
                <Accordion variant="splitted" className="gap-3 px-0" itemClasses={itemClasses}>
                  {divisions[activeTab].map((subDept, index) => (
                    <AccordionItem
                      key={String(index)}
                      aria-label={subDept.name}
                      startContent={
                        <IconBox colorClass="bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400">
                          {subDept.icon || <CheckCircleOutlined />}
                        </IconBox>
                      }
                      title={subDept.name}
                    >
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                        {/* Render Duties Component if available */}
                        {subDept.component && (
                          <div className="mb-8 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-[#DAA520]/20 to-transparent rounded-full" />
                            <div className="pl-6">{subDept.component}</div>
                          </div>
                        )}

                        <div
                          className={`${subDept.component ? "pt-8 border-t border-slate-100 dark:border-zinc-800" : ""}`}
                        >
                          <PersonnelList departmentName={subDept.name} departmentCode={activeTab} />
                        </div>
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* --- Additional Info Section (All Staff Search) --- */}
        <motion.div
          variants={itemVar}
          className="mt-24 pt-16 border-t border-slate-200 dark:border-neutral-800"
        >
          <PersonnelInformation />
        </motion.div>
      </motion.div>
    </section>
  );
}
