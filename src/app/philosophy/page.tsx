"use client";

import React from "react";
import { FlipWords } from "@/components/ui/flip-words";
import { motion } from "framer-motion";
import {
  BulbOutlined,
  AimOutlined,
  RocketOutlined,
  TeamOutlined,
  HeartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"; // ใช้ Icon จาก Ant Design (หรือลบออกถ้าไม่ได้ลง package นี้)

export default function Philosophy() {
  const words = [
    "ปรัชญา วิสัยทัศน์",
    "พันธกิจ เป้าประสงค์",
    "เอกลักษณ์ อัตลักษณ์",
    "ค่านิยม คำขวัญ",
  ];

  // Animation Variant
  const containerVar = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="linear:bg-neutral-950 py-16 font-sans">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVar}
        className="container mx-auto max-w-6xl px-4 md:px-8"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-16 text-center">
          <h3 className="linear:text-slate-400 text-lg font-semibold tracking-wider text-slate-500 uppercase">
            Kantharalak Technical College
          </h3>
          <h1 className="linear:text-slate-100 linear:text-emerald-400 mt-2 text-3xl font-extrabold text-slate-500 md:text-5xl">
            ข้อมูลพื้นฐาน
            <span className="mt-2 block md:mt-0 md:ml-3 md:inline-block">
              <FlipWords
                words={words}
                className="linear:text-sky-400 font-bold text-sky-600"
              />
            </span>
          </h1>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-sky-500" />
        </motion.div>

        {/* --- Core Values Section (Philosophy & Vision) --- */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Philosophy */}
          <motion.div
            variants={itemVar}
            className="linear:border-sky-600 linear:bg-neutral-900 rounded-3xl border-l-4 border-sky-500 bg-white p-8 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="linear:bg-sky-900/30 rounded-full bg-sky-100 p-3 text-sky-600">
                <BulbOutlined style={{ fontSize: "24px" }} />
              </div>
              <h2 className="linear:text-white text-2xl font-bold text-slate-800">
                ปรัชญา (Philosophy)
              </h2>
            </div>
            <p className="linear:text-slate-300 pl-2 text-xl font-medium text-slate-600">
              "ฝีมือดี มีวินัย ใฝ่คุณธรรม นำสังคม"
            </p>
          </motion.div>

          {/* Vision */}
          <motion.div
            variants={itemVar}
            className="linear:border-indigo-600 linear:bg-neutral-900 rounded-3xl border-l-4 border-indigo-500 bg-white p-8 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="linear:bg-indigo-900/30 rounded-full bg-indigo-100 p-3 text-indigo-600">
                <AimOutlined style={{ fontSize: "24px" }} />
              </div>
              <h2 className="linear:text-white text-2xl font-bold text-slate-800">
                วิสัยทัศน์ (Vision)
              </h2>
            </div>
            <div className="linear:text-slate-300 space-y-4 text-slate-600">
              <p className="leading-relaxed">
                ผลิตและพัฒนากำลังคน โดยขับเคลื่อนการจัดการความรู้ด้วยเทคโนโลยี
                เป็นประชาคมแห่งการเรียนรู้ เน้นการทำงานเป็นทีม
                มีความร่วมมือกับสถานประกอบการและชุมชน
              </p>
              <p className="linear:border-neutral-700 linear:bg-neutral-800 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500 italic">
                "Kantharalak Technical College (KTL-TC) Committed to keep moving
                for work to knowledge management by Technology & Teamwork,
                Collaboration & Community as Learning Society"
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- Mission & Goal Section --- */}
        <motion.div variants={itemVar} className="mb-12">
          <div className="linear:bg-neutral-900 overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="bg-sky-600 px-8 py-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                <RocketOutlined /> พันธกิจ (Mission)
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                {[
                  "การจัดการความรู้แก่ผู้เรียน",
                  "พัฒนาความรู้ ทักษะ และการประยุกต์ใช้",
                  "ส่งเสริมคุณธรรม จริยธรรม และคุณลักษณะที่พึงประสงค์",
                  "พัฒนาหลักสูตร อาชีวศึกษา",
                  "จัดการเรียนการสอนอาชีวศึกษา",
                  "บริหารจัดการตามหลักธรรมาภิบาล",
                  "การนำนโยบายสู่การปฏิบัติ",
                  "สร้างความร่วมมือในการสร้างสังคมแห่งการเรียนรู้",
                  "พัฒนานวัตกรรม สิ่งประดิษฐ์ งานสร้างสรรค์ และงานวิจัย",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleOutlined className="mt-1 shrink-0 text-sky-500" />
                    <span className="linear:text-slate-300 text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVar} className="mb-12">
          <div className="linear:border-neutral-800 linear:bg-neutral-900 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
            <div className="linear:border-neutral-800 border-b border-slate-100 px-8 py-6">
              <h2 className="linear:text-white flex items-center gap-2 text-2xl font-bold text-slate-800">
                <AimOutlined className="text-red-500" /> เป้าประสงค์ (Goal)
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2">
              {[
                "ผู้เรียนมีคุณภาพและได้มาตรฐานอาชีวศึกษา",
                "ผู้เรียนมีความรู้ ทักษะ และเจตคติตรงตามความต้องการของตลาดแรงงาน",
                "บุคลากร นักเรียน นักศึกษา มีความรู้ความสามารถในการใช้นวัตกรรมและเทคโนโลยี",
                "นักเรียน นักศึกษา มีการแลกเปลี่ยนเรียนรู้กับสถาบันและองค์กรระหว่างประเทศ",
              ].map((item, index) => (
                <div
                  key={index}
                  className="linear:bg-neutral-800 flex gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <span className="linear:bg-red-900/30 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                    {index + 1}
                  </span>
                  <p className="linear:text-slate-300 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- Identity & Values Grid --- */}
        <motion.div
          variants={itemVar}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <InfoCard
            icon={<TeamOutlined />}
            color="blue"
            title="เอกลักษณ์ (Unity)"
            desc="ผู้นำบริการวิชาชีพสู่ชุมชน"
          />
          <InfoCard
            icon={<HeartOutlined />}
            color="rose"
            title="อัตลักษณ์ (Identity)"
            desc="ฝีมือดี มีคุณธรรม"
          />
          <InfoCard
            icon={<CheckCircleOutlined />}
            color="emerald"
            title="ค่านิยม (Values)"
            desc="ยิ้ม ไหว้ แต่งกายดี รู้จักสวัสดี ขอบคุณ และขอโทษ"
          />
          <div className="col-span-1 rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 p-6 text-white shadow-lg sm:col-span-2 lg:col-span-1">
            <h3 className="mb-2 text-lg font-bold opacity-90">
              คำขวัญ (Motto)
            </h3>
            <p className="text-sm leading-relaxed opacity-95">
              "เรียนรู้ปฏิบัติสู่นวัตกรรม ผู้นำด้านเทคโนโลยี
              สู่วิถีเศรษฐกิจสร้างสรรค์ มุ่งมั่นพัฒนากำลังคนด้านวิชาชีพ"
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Reusable Small Card
const InfoCard = ({
  icon,
  color,
  title,
  desc,
}: {
  icon: any;
  color: string;
  title: string;
  desc: string;
}) => {
  // Mapping color classes roughly (Tailwind specific)
  const colorClasses: { [key: string]: string } = {
    blue: "bg-blue-50 text-blue-600 linear:bg-blue-900/20",
    rose: "bg-rose-50 text-rose-600 linear:bg-rose-900/20",
    emerald: "bg-emerald-50 text-emerald-600 linear:bg-emerald-900/20",
  };

  return (
    <div className="linear:border-neutral-800 linear:bg-neutral-900 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <h3 className="linear:text-slate-100 mb-2 font-bold text-slate-800">
        {title}
      </h3>
      <p className="linear:text-slate-400 text-sm text-slate-600">{desc}</p>
    </div>
  );
};
