"use client";

import React from "react";
import { Image } from "@heroui/image";
import { LinkPreview } from "../ui/link-preview";
import { motion } from "framer-motion";
import { FileTextOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const ExternalQualityAssurance = () => {
  return (
    <section className="py-16 font-sans">
      <div className="container mx-auto px-4 lg:px-20">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold tracking-wide text-blue-600 uppercase">
            Quality Assurance
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-slate-100">
            การรับรองมาตรฐาน <span className="text-blue-600">&</span>{" "}
            ความโปร่งใส
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            รายงานผลการประกันคุณภาพภายนอก และการประเมินคุณธรรมและความโปร่งใส
            (ITA)
          </p>
        </motion.div>

        {/* --- Content Grid --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          {/* Card 1: ประกันคุณภาพ (Official Style) */}
          <LinkPreview
            url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf"
            className="group block h-full"
          >
            <article className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900">
              {/* Decorative Icon Background */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-blue-900/20" />

              <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 p-4 transition-transform duration-500 group-hover:scale-110 dark:bg-neutral-800">
                  <Image
                    src="/images/logo/logoTH.webp"
                    className="h-full w-full object-contain"
                    alt="Logo Quality Assurance"
                    removeWrapper
                  />
                </div>
                <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                  <FileTextOutlined />
                </div>
              </div>

              <h3 className="mb-3 text-xl font-bold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-slate-100">
                รายงานการประกันคุณภาพภายนอก
              </h3>

              <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                รายงานผลการประกันคุณภาพภายนอกด้านการอาชีวศึกษา <br />
                วิทยาลัยเทคนิคกันทรลักษ์ (รอบ 5)
              </p>

              <span className="mt-auto inline-flex items-center text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                ดาวน์โหลดเอกสาร PDF &rarr;
              </span>
            </article>
          </LinkPreview>

          {/* Card 2: ITA (Transparency Style) */}
          <LinkPreview
            url="https://ktltc.vercel.app/ITA"
            className="group block h-full"
          >
            <article className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900">
              {/* Decorative Icon Background */}
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-cyan-50 opacity-50 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-cyan-900/20" />

              <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyan-50 p-2 transition-transform duration-500 group-hover:scale-110 dark:bg-neutral-800">
                  <Image
                    src="/images/logo/ITALogo1.webp"
                    className="h-full w-full object-contain"
                    alt="Logo ITA"
                    removeWrapper
                  />
                </div>
                <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white shadow-md">
                  <SafetyCertificateOutlined />
                </div>
              </div>

              <h3 className="mb-3 text-xl font-bold text-slate-800 transition-colors group-hover:text-cyan-600 dark:text-slate-100">
                การประเมินคุณธรรม (ITA)
              </h3>

              <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Integrity and Transparency Assessment <br />
                การประเมินคุณธรรมและความโปร่งใสในการดำเนินงาน
              </p>

              <span className="mt-auto inline-flex items-center text-sm font-semibold text-cyan-600 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                เข้าสู่เว็บไซต์ ITA &rarr;
              </span>
            </article>
          </LinkPreview>
        </motion.div>
      </div>
    </section>
  );
};

export default ExternalQualityAssurance;
