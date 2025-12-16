"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { FacebookFilled, CaretDownOutlined } from "@ant-design/icons"; // ใช้ Icon จาก Ant Design (หรือเปลี่ยนตามที่คุณมี)

// 1. รวมข้อมูล Page ทั้งหมดไว้ที่นี่ (เพิ่ม/ลบ ได้ง่ายๆ)
const facebookPages = [
  "https://www.facebook.com/profile.php?id=100088379594921",
  "https://www.facebook.com/profile.php?id=61567041267941",
  "https://www.facebook.com/profile.php?id=100065239134417",
  "https://www.facebook.com/ktltc.ac.th.en",
  "https://www.facebook.com/profile.php?id=100068997166818",
  "https://www.facebook.com/profile.php?id=100057195379923&mibextid=ZbWKwL",
  "https://www.facebook.com/profile.php?id=100063483313526",
];

export default function ShowFacebook() {
  // Helper สำหรับสร้าง URL iframe
  const getIframeSrc = (pageUrl: string) => {
    const encodedUrl = encodeURIComponent(pageUrl);
    return `https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;
  };

  return (
    <section className="rounded-3xl bg-slate-50/50 py-12 font-sans dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4"
      >
        {/* --- Header --- */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="rounded-full bg-white p-2 shadow-md dark:bg-neutral-800"
          >
            <Image
              src="/images/icon/facebook-svgrepo-com.svg"
              alt="Facebook Logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </motion.div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              ติดตามข่าวสาร <span className="text-[#1877F2]">Facebook</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              อัปเดตกิจกรรมและความเคลื่อนไหวล่าสุดจากเพจของเรา
            </p>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="mx-auto max-w-7xl">
          <Accordion variant="splitted" className="px-0">
            <AccordionItem
              key="1"
              aria-label="Facebook Feeds"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              indicator={<CaretDownOutlined className="text-[#1877F2]" />}
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1877F2] dark:bg-blue-900/20">
                    <FacebookFilled style={{ fontSize: "20px" }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      รวมเพจหน่วยงาน
                    </span>
                    <span className="text-xs text-slate-400">
                      คลิกเพื่อดู/ซ่อน กระดานข่าว
                    </span>
                  </div>
                </div>
              }
            >
              {/* --- Grid Layout --- */}
              <div className="bg-slate-50 p-4 sm:p-8 dark:bg-neutral-950/50">
                <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {facebookPages.map((url, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative flex h-[500px] w-full max-w-[340px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-neutral-800"
                    >
                      {/* Loading Skeleton / Background */}
                      <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-slate-100 dark:bg-neutral-800">
                        <span className="text-slate-300">Loading Feed...</span>
                      </div>

                      {/* Iframe */}
                      <iframe
                        src={getIframeSrc(url)}
                        width="340"
                        height="500"
                        className="relative z-10 border-none"
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        style={{ border: "none", overflow: "hidden" }}
                      />

                      {/* Decoration Border on Hover */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#1877F2] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
}
