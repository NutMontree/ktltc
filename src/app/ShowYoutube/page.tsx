"use client";

import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import {
  YoutubeFilled,
  CaretDownOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

// 1. รวมข้อมูลวิดีโอไว้ใน Array เพื่อความสะอาดของ Code
const videoList = [
  {
    src: "https://www.youtube.com/embed/tEqHeRdAiD0?si=q8RHAfYFgNKyCzzB",
    title: "Video 1",
  },
  {
    src: "https://www.youtube.com/embed/k7hgxrwGgrw?si=VWg12pZKYfKEVnUz",
    title: "Video 2",
  },
  // หมายเหตุ: คลิปนี้เป็น Facebook Reel ถ้าเป็นไปได้ควรแยก Section หรือใช้ Embed ของ Youtube ทั้งหมดจะดีกว่าครับ แต่ใส่ไว้ให้ตามเดิม
  {
    src: "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1804472173610242%2F&show_text=true&width=560&t=0",
    title: "Facebook Reel",
  },
  {
    src: "https://www.youtube.com/embed/tVReYxrSav0?si=HZpppAn8DwMvccUr",
    title: "Video 4",
  },
  {
    src: "https://www.youtube.com/embed/908PSchHFiU?si=I6XoZHsfF0Ceot7M",
    title: "Video 5",
  },
  {
    src: "https://www.youtube.com/embed/nj49zojN3FI",
    title: "สถานศึกษาสีขาว 68",
  },
  {
    src: "https://www.youtube.com/embed/TpkZoNBSzNU?si=PDDZY5iQuTTG-TF5",
    title: "กิจกรรมสถานศึกษา",
  },
  {
    src: "https://www.youtube.com/embed/-3MpH0BXQeY",
    title: "ดอกจานเกมส์ 2567",
  },
  {
    src: "https://www.youtube.com/embed/_2Gnilun9X8",
    title: "สิ่งประดิษฐ์คนรุ่นใหม่",
  },
  {
    src: "https://www.youtube.com/embed/1qwOVzMyCQU",
    title: "เดิน วิ่ง ปั่น ป้องกันอัมพาต",
  },
];

export default function ShowYoutube() {
  return (
    <section className="bg-white py-12 font-sans dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-4"
      >
        {/* --- Header --- */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            className="rounded-2xl bg-red-50 p-3 shadow-sm dark:bg-red-900/20"
          >
            <Image
              src="/images/icon/youtube-svgrepo-com.svg"
              alt="logo-youtube"
              width={60}
              height={60}
            />
          </motion.div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              รับชมวิดีโอ <span className="text-[#FF0000]">YouTube</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              รวมคลิปกิจกรรมและผลงานที่น่าสนใจ
            </p>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="mx-auto max-w-7xl">
          <Accordion variant="splitted" className="px-0">
            <AccordionItem
              key="1"
              aria-label="Youtube Videos"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              indicator={<CaretDownOutlined className="text-[#FF0000]" />}
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#FF0000] dark:bg-red-900/20">
                    <YoutubeFilled style={{ fontSize: "20px" }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                      วิดีโอทั้งหมด
                    </span>
                    <span className="text-xs text-slate-400">
                      Channel: KTLTC Official
                    </span>
                  </div>
                </div>
              }
            >
              {/* --- Grid Layout --- */}
              <div className="bg-slate-50 p-4 sm:p-8 dark:bg-neutral-950/50">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {videoList.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-xl bg-black shadow-md ring-1 ring-slate-200 dark:ring-neutral-800"
                    >
                      {/* Wrapper สำหรับรักษาอัตราส่วน 16:9 (aspect-video) */}
                      <div className="aspect-video w-full">
                        <iframe
                          src={video.src}
                          className="h-full w-full object-cover"
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        ></iframe>
                      </div>

                      {/* Decoration (Optional: Title on hover) */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 text-white">
                          <PlayCircleOutlined className="text-red-500" />
                          <span className="truncate text-sm font-medium">
                            {video.title}
                          </span>
                        </div>
                      </div>
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
