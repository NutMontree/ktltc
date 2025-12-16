"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "framer-motion";
import {
  UserOutlined,
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
} from "@ant-design/icons"; // ใช้ Icon เพื่อสื่อความหมาย

// Import Components
import Mechanic from "../mechanic/page";
import Machine from "../machine/page";
import Welder from "../welder/page";
import Electricity from "../electricity/page";
import Electronics from "../electronics/page";
import Technique from "../technique/page";
import Construct from "../construct/page";
import Accounting from "../accounting/page";
import Marketing from "../marketing/page";
import Technology from "../technology/page";
import Hotel from "../hotel/page";
import Ordinary from "../ordinary/page";
import PersonnelInformation from "./PersonnelInformation";
import ExecutiveBoard from "../executiveboard/page";

export default function Personnel() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Helper function to create items with icons
  const itemClasses = {
    base: "py-0 w-full",
    title: "font-normal text-medium text-slate-700 dark:text-slate-200",
    trigger:
      "px-4 py-4 data-[hover=true]:bg-slate-50 rounded-xl flex items-center",
    indicator: "text-medium",
    content: "text-small px-4 pb-4",
  };

  return (
    <section className="py-16 font-sans">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="container mx-auto max-w-5xl px-4 md:px-8"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <TeamOutlined className="mr-2" /> บุคลากรของเรา
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ข้อมูล<span className="text-[#DAA520]">บุคลากร</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Personnel Information Directory
          </p>
        </motion.div>

        {/* --- Accordion Menu --- */}
        <motion.div variants={itemVar}>
          <Accordion
            variant="splitted" // แบบแยกชิ้น ดูทันสมัยกว่า
            className="gap-4"
            itemClasses={itemClasses}
          >
            <AccordionItem
              key="1"
              aria-label="Executives"
              startContent={<UserOutlined className="text-xl text-[#DAA520]" />}
              title={
                <span className="text-lg font-semibold">
                  ผู้บริหารสถานศึกษา
                </span>
              }
              className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="py-4">
                <ExecutiveBoard />
              </div>
            </AccordionItem>

            {/* --- Technical Departments --- */}
            <AccordionItem
              key="2"
              aria-label="Mechanic"
              startContent={<ToolOutlined className="text-xl text-blue-500" />}
              title="แผนกวิชาช่างยนต์"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Mechanic />
            </AccordionItem>

            <AccordionItem
              key="3"
              aria-label="Machine"
              startContent={
                <SettingOutlined className="text-xl text-slate-500" />
              }
              title="แผนกวิชาช่างกลโรงงาน"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Machine />
            </AccordionItem>

            <AccordionItem
              key="4"
              aria-label="Welder"
              startContent={
                <FireOutlined className="text-xl text-orange-500" />
              }
              title="แผนกวิชาช่างเชื่อมโลหะ"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Welder />
            </AccordionItem>

            <AccordionItem
              key="5"
              aria-label="Electricity"
              startContent={
                <ThunderboltOutlined className="text-xl text-yellow-500" />
              }
              title="แผนกวิชาช่างไฟฟ้ากำลัง"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Electricity />
            </AccordionItem>

            <AccordionItem
              key="6"
              aria-label="Electronics"
              startContent={<WifiOutlined className="text-xl text-green-500" />}
              title="แผนกวิชาช่างอิเล็กทรอนิกส์"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Electronics />
            </AccordionItem>

            <AccordionItem
              key="7"
              aria-label="Technique"
              startContent={
                <ToolOutlined className="text-xl text-indigo-500" />
              }
              title="แผนกวิชาช่างเทคนิคพื้นฐาน"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Technique />
            </AccordionItem>

            <AccordionItem
              key="8"
              aria-label="Construct"
              startContent={
                <BuildOutlined className="text-xl text-amber-700" />
              }
              title="แผนกวิชาช่างก่อสร้าง"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Construct />
            </AccordionItem>

            {/* --- Business & Other Departments --- */}
            <AccordionItem
              key="9"
              aria-label="Accounting"
              startContent={
                <CalculatorOutlined className="text-xl text-teal-500" />
              }
              title="แผนกวิชาการบัญชี"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Accounting />
            </AccordionItem>

            <AccordionItem
              key="10"
              aria-label="Marketing"
              startContent={<ShopOutlined className="text-xl text-rose-500" />}
              title="แผนกวิชาการตลาด"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Marketing />
            </AccordionItem>

            <AccordionItem
              key="11"
              aria-label="Technology"
              startContent={
                <LaptopOutlined className="text-xl text-purple-500" />
              }
              title="แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Technology />
            </AccordionItem>

            <AccordionItem
              key="12"
              aria-label="Hotel"
              startContent={
                <CoffeeOutlined className="text-brown-500 text-xl" />
              }
              title="แผนกวิชาการโรงแรม"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Hotel />
            </AccordionItem>

            <AccordionItem
              key="13"
              aria-label="Ordinary"
              startContent={<ReadOutlined className="text-xl text-sky-500" />}
              title="แผนกวิชาสามัญสัมพันธ์"
              className="rounded-2xl bg-white shadow-sm dark:bg-neutral-900"
            >
              <Ordinary />
            </AccordionItem>
          </Accordion>
        </motion.div>

        {/* --- Additional Info Section --- */}
        <motion.div variants={itemVar} className="mt-16">
          <PersonnelInformation />
        </motion.div>
      </motion.div>
    </section>
  );
}
