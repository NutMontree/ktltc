"use client";

import React from "react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { ImageItem } from "./data";
import {
  CalendarOutlined,
  BankOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

export default function HistoryEducational() {
  return (
    <section className="bg-white py-16 font-sans dark:bg-neutral-950">
      {/* --- Background Decoration --- */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-100/30 blur-3xl dark:bg-blue-900/10" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-100/30 blur-3xl dark:bg-indigo-900/10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 container mx-auto px-4 md:px-8"
      >
        {/* --- Header Section --- */}
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full bg-white p-4 shadow-lg ring-1 ring-slate-100 dark:bg-neutral-800 dark:ring-neutral-700">
            <Image
              src="/images/logo.webp"
              alt="KTLTC Logo"
              width={100}
              height={100}
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-5xl dark:text-slate-100">
            วิทยาลัยเทคนิค<span className="text-blue-600">กันทรลักษ์</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            Kantharalak Technical College
          </p>
          <div className="mt-6 h-1 w-20 rounded-full bg-blue-600/50" />
        </div>

        {/* --- History Section (Timeline Style) --- */}
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-neutral-800">
            <HistoryOutlined className="text-2xl text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              ประวัติความเป็นมา
            </h2>
          </div>

          <article className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-300">
            <p className="indent-8 leading-relaxed">
              วิทยาลัยเทคนิคกันทรลักษ์ เดิมเป็น{" "}
              <strong>"วิทยาลัยการอาชีพกันทรลักษ์"</strong>{" "}
              ได้จัดตั้งขึ้นตามนโยบายรัฐบาลเพื่อขยายโอกาสทางการศึกษาวิชาชีพสู่ชนบท
              จังหวัดศรีสะเกษ ได้ทำหนังสือถึงกรมอาชีวศึกษา เมื่อวันที่ 10
              มิถุนายน 2534
              เพื่อขอสนับสนุนในการจัดตั้งวิทยาลัยการอาชีพกันทรลักษ์ ระดับอำเภอ
            </p>
            <p className="indent-8 leading-relaxed">
              ในช่วงดังกล่าว นายพิสุทธิ์ บุญเจริญ ศึกษาธิการอำเภอกันทรลักษ์
              ได้มาตรวจเยี่ยม
              โรงเรียนบ้านจานทองกวาววิทยาและได้ปรึกษาหารือในการหาที่ดินสำหรับสร้างวิทยาลัย
              โดยได้รับความร่วมมือจาก นายอำไพ บุญเริ่ม
              ผู้อำนวยการโรงเรียนบ้านจานทองกวาววิทยา
              เสนอที่ดินสาธารณประโยชน์เนื้อที่ประมาณ 105 ไร่
              ซึ่งมีการคมนาคมสะดวกและชุมชนหนาแน่น
            </p>

            <div className="my-8 rounded-2xl border-l-4 border-blue-500 bg-blue-50/50 p-6 dark:bg-blue-900/10">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-blue-800 dark:text-blue-300">
                <CalendarOutlined /> เหตุการณ์สำคัญ
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-sm md:text-base">
                <li>
                  <strong>30 มีนาคม 2537:</strong>{" "}
                  กระทรวงศึกษาธิการประกาศจัดตั้งวิทยาลัย พร้อมงบประมาณ 28.7
                  ล้านบาท
                </li>
                <li>
                  <strong>ปีการศึกษา 2539:</strong> เปิดรับนักศึกษารุ่นแรก ใน 4
                  สาขาวิชา (ช่างยนต์, ช่างไฟฟ้า, อิเล็กทรอนิกส์, พณิชยการ)
                </li>
                <li>
                  <strong>7 มิถุนายน 2539:</strong> พิธีเปิดอย่างเป็นทางการ โดย
                  ฯพณฯ นายบรรหาร ศิลปอาชา นายกรัฐมนตรี
                </li>
                <li>
                  <strong>21 พฤศจิกายน 2555:</strong> เปลี่ยนชื่อเป็น
                  "วิทยาลัยเทคนิคกันทรลักษ์"
                </li>
              </ul>
            </div>
          </article>
        </div>

        {/* --- Facilities Section --- */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
              <BankOutlined className="text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              อาคารสถานที่
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              พื้นที่จัดการศึกษา เนื้อที่ 105 ไร่ 2 งาน 25 ตารางวา
            </p>
          </div>

          {/* Main Map/Layout Image */}
          <div className="mb-12 overflow-hidden rounded-3xl bg-slate-100 shadow-sm dark:bg-neutral-900">
            <Image
              removeWrapper
              src="/images/image/ข้อมูลด้านอาคารสถานที่.webp"
              alt="แผนผังอาคารสถานที่"
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Facilities Grid Gallery */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ImageItem.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-slate-200 shadow-md transition-all hover:shadow-xl dark:bg-neutral-800"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <Image
                    src={item.img}
                    alt={`Facility ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    removeWrapper
                  />
                </div>
                {/* Optional: Overlay Text (ถ้ามีชื่ออาคาร) */}
                {/* <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                    <p className="text-white text-sm font-medium">ชื่ออาคาร {index+1}</p>
                </div> */}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
