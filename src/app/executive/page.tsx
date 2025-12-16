"use client";

import React from "react";
import { Image } from "@heroui/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion } from "framer-motion";
import { Data } from "./data";
// หากไม่มี icon library ให้ลบส่วนนี้ออก หรือใช้ svg แทนได้ครับ
import { UserOutlined, StarFilled } from "@ant-design/icons";

export default function EDUAdmin() {
  return (
    <section className="bg-slate-50 py-16 font-sans dark:bg-neutral-950">
      <div className="container mx-auto px-4">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ทำเนียบ<span className="text-[#DAA520]">ผู้บริหาร</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#DAA520]" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Executive Directory of Kantharalak Technical College
          </p>
        </motion.div>

        {/* --- ส่วนที่ 1: ผู้อำนวยการ (Main Highlight) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex justify-center"
        >
          <div className="relative w-full max-w-md py-8">
            {/* มงกุฎหรือสัญลักษณ์พิเศษสำหรับ ผอ. */}
            <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2 transform text-[#DAA520]">
              <StarFilled style={{ fontSize: "24px" }} />
            </div>

            <BackgroundGradient className="rounded-[22px] bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex flex-col items-center">
                <div className="mb-6 overflow-hidden rounded-xl bg-slate-100 shadow-md">
                  <Image
                    src="/images/ผู้บริหาร/1.webp"
                    alt="นางสาวทักษิณา ชมจันทร์"
                    className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 transition-colors hover:text-[#DAA520] dark:text-white">
                  นางสาวทักษิณา ชมจันทร์
                </h2>
                <p className="mt-2 text-base font-medium text-[#DAA520]">
                  ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  พ.ศ. 2566 - ปัจจุบัน
                </p>

                {/* Badge */}
                <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 dark:bg-zinc-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#DAA520] text-xs text-white">
                    <UserOutlined />
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    KTLTC Director
                  </span>
                </div>
              </div>
            </BackgroundGradient>
          </div>
        </motion.div>

        {/* --- ส่วนที่ 2: คณะผู้บริหาร (Grid) --- */}
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-4 text-sm text-slate-500 dark:bg-neutral-950">
              คณะผู้บริหาร
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Data.map((item, index) => (
            <motion.div key={index} whileHover={{ y: -5 }} className="group">
              <BackgroundGradient className="h-full rounded-[22px] bg-white p-4 shadow-lg dark:bg-zinc-900">
                <div className="flex h-full flex-col">
                  {/* Image */}
                  <div className="mx-auto mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={item.img}
                      alt={item.title}
                      className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-[#DAA520] dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {item.secondary}
                    </p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  {/* Small Tag */}
                  <div className="mt-4 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-500/10 ring-inset dark:bg-zinc-800 dark:text-slate-300">
                      Executive
                    </span>
                  </div>
                </div>
              </BackgroundGradient>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
