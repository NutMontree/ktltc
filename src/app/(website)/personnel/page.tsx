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
} from "@ant-design/icons";

// Import Components
import PersonnelList from "../(components)/PersonnelList";
import PersonnelInformation from "./PersonnelInformation";
import ExecutiveBoard from "../executiveboard/page";

// --- Helper Component: กรอบรองหลังไอคอน ---
const IconBox = ({
  colorClass,
  children,
}: {
  colorClass: string;
  children: React.ReactNode;
}) => (
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
    colorClass:
      "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
  },
  {
    name: "การตลาด",
    code: "Marketing",
    icon: <ShopOutlined />,
    colorClass:
      "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
  },
  {
    name: "การตลาด/โลจิสติก์",
    code: "Logistics",
    icon: <AppstoreOutlined />,
    colorClass:
      "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  },
  {
    name: "เทคโนโลยีธุรกิจดิจิทัล",
    code: "Digital Tech",
    icon: <LaptopOutlined />,
    colorClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    name: "การโรงแรม",
    code: "Hotel",
    icon: <CoffeeOutlined />,
    colorClass:
      "bg-red-50 text-[#8D6E63] dark:bg-red-900/20 dark:text-[#A1887F]",
  },
  {
    name: "เทคนิคพื้นฐาน",
    code: "Basic Tech",
    icon: <ToolOutlined />,
    colorClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  {
    name: "ช่างอิเล็กทรอนิกส์",
    code: "Electronics",
    icon: <WifiOutlined />,
    colorClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    name: "ช่างยนต์",
    code: "Mechanic",
    icon: <CarOutlined />,
    colorClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    name: "ยานยนต์ไฟฟ้า",
    code: "EV",
    icon: <ThunderboltOutlined />,
    colorClass:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    name: "ช่างไฟฟ้ากำลัง",
    code: "Electrical Power",
    icon: <ThunderboltOutlined />,
    colorClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    name: "ช่างกลโรงงาน",
    code: "Machine Shop",
    icon: <SettingOutlined />,
    colorClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  {
    name: "ช่างเชื่อมโลหะ",
    code: "Welding",
    icon: <FireOutlined />,
    colorClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  },
  {
    name: "ช่างก่อสร้าง",
    code: "Construction",
    icon: <BuildOutlined />,
    colorClass:
      "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
  },
];

const divisions: Record<string, string[]> = {
  ฝ่ายบริหารทรัพยากร: [
    "งานบริหารงานทั่วไป",
    "งานบริหารและพัฒนาทรัพยากรบุคคล",
    "งานการเงิน",
    "งานการบัญชี",
    "งานพัสดุ",
    "งานอาคารสถานที่",
    "งานทะเบียน",
    "งานแม่บ้าน/นักการ",
  ],
  ฝ่ายยุทธศาสตร์และแผนงาน: [
    "งานพัฒนายุทธศาสตร์ แผนงาน และงบประมาณ",
    "งานมาตรฐานและการประกันคุณภาพ",
    "งานศูนย์ดิจิทัลและสื่อสารองค์กร",
    "งานส่งเสริมการวิจัย นวัตกรรม และสิ่งประดิษฐ์",
    "งานส่งเสริมธุรกิจและการเป็นผู้ประกอบการ",
    "งานติดตามและประเมินผล",
  ],
  "ฝ่ายพัฒนากิจการนักเรียน นักศึกษา": [
    "งานกิจกรรมนักเรียนนักศึกษา",
    "งานครูที่ปรึกษาและการแนะแนว",
    "งานปกครองและความปลอดภัยนักเรียนนักศึกษา",
    "งานสวัสดิการนักเรียนนักศึกษา",
    "งานโครงการพิเศษและการบริการ",
  ],
  ฝ่ายวิชาการ: [
    "งานพัฒนาหลักสูตรและการจัดการเรียนรู้",
    "งานวัดผลและประเมินผล",
    "งานอาชีวศึกษาระบบทวิภาคีและความร่วมมือ",
    "งานวิทยบริการและเทคโนโลยีการศึกษา",
    "งานการศึกษาพิเศษและความเสมอภาคทางการศึกษา",
    "งานพัฒนาหลักสูตรสายเทคโนโลยีหรือสายปฏิบัติการ",
  ],
};

const tabs = [
  "ผู้บริหารสถานศึกษา",
  "ฝ่ายบริหารทรัพยากร",
  "ฝ่ายยุทธศาสตร์และแผนงาน",
  "ฝ่ายพัฒนากิจการนักเรียน นักศึกษา",
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
    base: "mb-3 rounded-2xl py-2 px-1 border border-slate-200 bg-white shadow-sm transition-all dark:border-neutral-800 dark:bg-neutral-900",
    title: "font-semibold text-medium text-slate-800 dark:text-slate-100",
    trigger:
      "py-2 px-2 data-[hover=true]:bg-slate-50 dark:data-[hover=true]:bg-neutral-800/50 rounded-xl flex items-center transition-colors",
    indicator: "text-medium text-slate-400 dark:text-slate-500",
    content: "text-small px-4 pb-6 pt-2 dark:text-slate-300",
  };

  return (
    <section className="dark:bg-transparent pb-20 pt-10 font-sans">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="container mx-auto px-4 max-w-[1400px]"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <TeamOutlined className="mr-2" /> โครงสร้างและบุคลากรของเรา
          </div>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-800 md:text-5xl dark:text-white tracking-tight">
            ข้อมูล<span className="text-[#DAA520]">บุคลากร</span>
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-slate-400">
            Personnel Information Directory
          </p>
        </motion.div>

        {/* --- Dynamic Categories Tabs --- */}
        <motion.div
          variants={itemVar}
          className="mb-10 w-full overflow-x-auto pb-4 scrollbar-hide"
        >
          <div className="flex w-max min-w-full justify-center gap-2 p-1 border-b border-slate-200 dark:border-neutral-800">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-sm font-bold transition-all rounded-t-2xl whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#DAA520] bg-yellow-500/10"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-neutral-800"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabBottom"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#DAA520] rounded-t-sm"
                  />
                )}
              </button>
            ))}
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
                  {/* ExecutiveBoard component rendering */}
                  <ExecutiveBoard />
                </div>
              )}

              {activeTab === "แผนกวิชา" && (
                <Accordion
                  variant="splitted"
                  className="gap-3 px-0"
                  itemClasses={itemClasses}
                >
                  {academicDepartments.map((dept, index) => (
                    <AccordionItem
                      key={String(index)}
                      aria-label={dept.name}
                      startContent={
                        <IconBox colorClass={dept.colorClass}>
                          {dept.icon}
                        </IconBox>
                      }
                      title={`แผนกวิชา${dept.name}`}
                    >
                      <div className="pt-2">
                        <PersonnelList
                          departmentName={dept.name}
                          departmentCode={dept.code}
                        />
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}

              {(activeTab === "ฝ่ายบริหารทรัพยากร" ||
                activeTab === "ฝ่ายยุทธศาสตร์และแผนงาน" ||
                activeTab === "ฝ่ายพัฒนากิจการนักเรียน นักศึกษา" ||
                activeTab === "ฝ่ายวิชาการ") && (
                <Accordion
                  variant="splitted"
                  className="gap-3 px-0"
                  itemClasses={itemClasses}
                >
                  {divisions[activeTab].map((subDept, index) => (
                    <AccordionItem
                      key={String(index)}
                      aria-label={subDept}
                      startContent={
                        <IconBox colorClass="bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400">
                          <CheckCircleOutlined />
                        </IconBox>
                      }
                      title={subDept}
                    >
                      <div className="pt-2">
                        <PersonnelList
                          departmentName={subDept}
                          departmentCode={activeTab}
                        />
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
