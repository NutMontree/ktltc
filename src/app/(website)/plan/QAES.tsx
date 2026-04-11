"use client";

import React from "react";
import { Button } from "@heroui/react";
import { LinkPreview } from "@/components/ui/link-preview";
import { motion } from "framer-motion";
import {
  SafetyCertificateOutlined,
  AuditOutlined,
  CheckCircleFilled,
  FilePdfOutlined,
  ReadOutlined,
} from "@ant-design/icons";

export default function QAES() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // ข้อมูลหน้าที่ความรับผิดชอบ
  const responsibilities = [
    "ส่งเสริมสนับสนุนให้บุคลากรในสถานศึกษาได้มีความรู้ความเข้าใจหลักการ จุดหมายและหลักเกณฑ์ของการประกันคุณภาพและมาตรฐานการศึกษา",
    "วางแผนดำเนินงานด้านการประกันคุณภาพและมาตรฐานการศึกษาของสถานศึกษา เพื่อนำไปสู่การพัฒนาคุณภาพอย่างต่อเนื่อง",
    "รองรับการประเมินคุณภาพการศึกษาภายในและภายนอก",
    "ประสานงานกับฝ่ายต่างๆ แผนกวิชา งานต่างๆ สถานประกอบการ และหน่วยงานภายนอก ในการดำเนินงานตามระบบการประกันคุณภาพ",
    "ประสานกับสำนักงานรับรองมาตรฐานและประเมินคุณภาพการศึกษา (องค์การมหาชน) หรือ สมศ. ในการประเมินคุณภาพภายนอก",
    "จัดทำปฏิทินปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น",
    "ดูแล บำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย",
    "ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย",
  ];

  return (
    <section className="bg-slate-50 py-12 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      <div className="">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <SafetyCertificateOutlined /> Quality Assurance
          </div>
          <h1 className="text-3xl font-extrabold md:text-5xl leading-tight">
            งานประกันคุณภาพ <br className="md:hidden" />
            <span className="bg-linear-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              และมาตรฐานการศึกษา
            </span>
          </h1>
        </motion.div>

        {/* --- Main Content --- */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <AuditOutlined className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                ขอบข่ายหน้าที่และความรับผิดชอบ
              </h2>
            </div>

            <div className="space-y-4">
              {responsibilities.map((text, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex gap-4 rounded-xl border border-slate-50 bg-slate-50/50 p-4 transition-colors hover:border-emerald-100 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-emerald-900"
                >
                  <div className="shrink-0 pt-1">
                    <CheckCircleFilled className="text-lg text-emerald-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- Action Buttons --- */}
        <motion.div
          variants={itemVar}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center justify-center gap-6 border-t border-slate-200 pt-12 md:flex-row dark:border-zinc-800"
        >
          <LinkPreview url="/plan/sar">
            <Button
              className="group h-auto bg-white px-8 py-4 text-emerald-600 shadow-lg ring-1 ring-emerald-100 transition-all hover:bg-emerald-50 dark:bg-zinc-900 dark:text-emerald-400 dark:ring-emerald-900"
              variant="flat"
            >
              <div className="flex items-center gap-3">
                <ReadOutlined className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs font-semibold uppercase text-emerald-400">
                    Internal Report
                  </div>
                  <div className="text-lg font-bold">รายงานประจำปี (SAR)</div>
                </div>
              </div>
            </Button>
          </LinkPreview>

          <LinkPreview url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf">
            <Button
              className="group h-auto bg-emerald-600 px-8 py-4 text-white shadow-lg shadow-emerald-200/50 transition-all hover:bg-emerald-700 dark:bg-emerald-700 dark:shadow-none dark:hover:bg-emerald-600"
              variant="solid"
            >
              <div className="flex items-center gap-3">
                <FilePdfOutlined className="text-2xl" />
                <div className="text-left">
                  <div className="text-xs font-semibold uppercase text-emerald-200">
                    External Assessment
                  </div>
                  <div className="text-lg font-bold">
                    รายงานประเมินภายนอก (รอบ 5)
                  </div>
                </div>
              </div>
            </Button>
          </LinkPreview>
        </motion.div>
      </div>
    </section>
  );
}
