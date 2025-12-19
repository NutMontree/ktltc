"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumb } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  LinkOutlined,
  PictureOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Image } from "@heroui/react";
import { motion } from "framer-motion";
import { DataDate, Title, Description, ImageItem, TageLink } from "./data";
import { FootTitle } from "@/components/FootTitle";

// --- Animation Variants (เหมือนตัวอย่าง) ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

export default function Page() {
  // Logic คำนวณคอลัมน์รูปภาพให้สวยงามตามจำนวนรูป
  const validImages = ImageItem?.filter((item: any) => item?.imgs) || [];
  const isSingleImage = validImages.length === 1;

  const getGridClassName = () => {
    if (isSingleImage) return "grid-cols-1";
    const desktopCols =
      validImages.length === 2
        ? "lg:grid-cols-2" // ปรับเป็น 2 คอลัมน์ถ้ามี 2 รูป
        : validImages.length === 3
          ? "lg:grid-cols-3"
          : "lg:grid-cols-4";
    return `grid-cols-1 sm:grid-cols-2 ${desktopCols}`;
  };

  return (
    <div className="min-h-screen bg-white py-8 font-sans transition-colors duration-300 md:px-8 dark:bg-neutral-900">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 pl-1">
          <Breadcrumb
            items={[
              {
                href: "/",
                title: (
                  <span className="flex items-center gap-2 text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-400">
                    <HomeOutlined />
                    <span>Home</span>
                  </span>
                ),
              },
              {
                href: "/pressrelease/2568/press6809",
                title: (
                  <span className="flex items-center gap-1 text-slate-600 transition-colors hover:text-blue-500 dark:text-slate-100 dark:hover:text-blue-400">
                    <UserOutlined />
                    <span>Application List</span>
                  </span>
                ),
              },
              {
                title: (
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    Application
                  </span>
                ),
              },
            ]}
          />
        </nav>

        <motion.main
          initial="hidden"
          animate="visible"
          variants={containerVar}
          className="space-y-10"
        >
          {/* Header Section */}
          <motion.header
            variants={itemVar}
            className="space-y-4 text-center md:text-left"
          >
            {/* Date Badge */}
            <div className="flex justify-center md:justify-start">
              {DataDate.map((item) => (
                <div
                  key={item.date}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-100/50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  <CalendarOutlined /> <span>{item.date}</span>
                </div>
              ))}
            </div>

            {/* Title */}
            <div className="flex justify-center text-3xl leading-tight font-bold tracking-tight text-slate-700 md:text-left md:text-4xl lg:text-5xl dark:text-slate-200">
              {Title.Item.map((item) => (
                <h1 key={item.title}>{item.title}</h1>
              ))}
            </div>
          </motion.header>

          {/* Content Section */}
          <motion.section variants={itemVar}>
            {/* Description Text */}
            <article className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
              {Description.map((item, index) => (
                <div key={index} className="leading-relaxed">
                  {item.description}
                </div>
              ))}
            </article>

            {/* External Links / Tags */}
            {TageLink && TageLink.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6 dark:border-neutral-800">
                {TageLink.map((item: any, index: number) => (
                  <Link key={index} href={item.href || "#"} target="_blank">
                    <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-neutral-700">
                      <LinkOutlined className="text-slate-400" /> {item.tage}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </motion.section>

          {/* Footer Title */}
          <motion.footer variants={itemVar} className="opacity-60">
            <FootTitle />
          </motion.footer>

          {/* Image Gallery */}
          {validImages.length > 0 && (
            <motion.section variants={itemVar}>
              <div className="mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <PictureOutlined />
                <h3 className="text-lg font-semibold">
                  {isSingleImage ? "Featured Image" : "Gallery"}
                </h3>
              </div>

              <div
                className={`grid gap-4 transition-all duration-300 ${getGridClassName()}`}
              >
                {validImages.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-slate-200 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800"
                  >
                    <Image
                      src={item.imgs}
                      alt={`Gallery ${index + 1}`}
                      removeWrapper
                      className={`h-full w-full object-cover transition-transform duration-700 hover:scale-105 ${
                        isSingleImage ? "object-center" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </motion.main>
      </div>
    </div>
  );
}
