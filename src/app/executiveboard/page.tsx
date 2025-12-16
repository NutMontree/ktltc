"use client";

import React from "react";
import { Image } from "@heroui/image";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion } from "framer-motion";
import { Data } from "./data";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";

export default function ExecutiveBoard() {
  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVar = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="container mx-auto px-4"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#DAA520]/10 px-4 py-1.5 text-sm font-semibold text-[#DAA520]">
            <TeamOutlined className="mr-2" /> KTLTC Board
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            คณะกรรมการ<span className="text-[#DAA520]">บริหารสถานศึกษา</span>
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#DAA520]" />
        </motion.div>

        {/* --- 1. Chairman / Director (Hero Card) --- */}
        <motion.div variants={itemVar} className="mb-16 flex justify-center">
          <div className="w-full max-w-md">
            <BackgroundGradient className="rounded-[22px] bg-white p-6 shadow-xl dark:bg-zinc-900">
              <div className="flex flex-col items-center">
                {/* Image Container with Hover Effect */}
                <div className="mb-6 overflow-hidden rounded-2xl shadow-md">
                  <Image
                    src="/images/ผู้บริหาร/1.webp"
                    alt="Director"
                    className="w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    width={400}
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  นางสาวทักษิณา ชมจันทร์
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์
                </p>

                {/* Badge instead of Button */}
                <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-zinc-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#DAA520] text-[10px] text-white">
                    <UserOutlined />
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    ประธานกรรมการ
                  </span>
                </div>
              </div>
            </BackgroundGradient>
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVar} className="relative mb-12">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-3 text-sm text-slate-500 dark:bg-neutral-950">
              คณะกรรมการ
            </span>
          </div>
        </motion.div>

        {/* --- 2. Board Members Grid --- */}
        <motion.div
          variants={itemVar}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Data.map((item, index) => (
            <div key={index} className="h-full">
              <BackgroundGradient className="h-full rounded-[22px] bg-white p-4 shadow-lg dark:bg-zinc-900">
                <div className="flex h-full flex-col">
                  {/* Image */}
                  <div className="mx-auto mb-4 overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src={item.img}
                      alt={item.title}
                      className="w-full object-cover object-top transition-transform duration-500 hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col items-center text-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                      {item.title}
                    </h3>

                    {/* Secondary Text (Role/Position) */}
                    <p className="mt-1 text-sm font-medium text-[#DAA520]">
                      {item.secondary}
                    </p>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Badge */}
                  <div className="mt-4 flex justify-center border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                      Committee Member
                    </span>
                  </div>
                </div>
              </BackgroundGradient>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
