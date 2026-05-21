"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@heroui/image";
// import { BackgroundGradient } from "@/components/ui/background-gradient";
import { motion } from "framer-motion";
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateFilled,
  LoadingOutlined,
} from "@ant-design/icons";

interface ExeData {
  title: string;
  secondary: string;
  description: string;
  img: string;
  role: string;
}

export default function ExecutiveBoard() {
  const [boardData, setBoardData] = useState<ExeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const getExecutiveRoleName = (r: string) => {
            switch (r) {
              case "director": return "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์";
              case "deputy_resource": return "รอง ผอ. (บริหารทรัพยากร)";
              case "deputy_strategy": return "รอง ผอ. (ยุทธศาสตร์)";
              case "deputy_academic": return "รอง ผอ. (วิชาการ)";
              case "deputy_student_affairs": return "รอง ผอ. (กิจการนักเรียน)";
              default: return "ผู้บริหาร";
            }
          };

          const executives = (data.users || [])
            .filter(
              (u: any) =>
                u.role === "director" || String(u.role).startsWith("deputy"),
            )
            .map((u: any) => ({
              title: u.name || "ไม่ระบุชื่อ",
              secondary: u.position || getExecutiveRoleName(u.role),
              description: u.description || "",
              img: u.image || "",
              role: u.role,
            }));
          setBoardData(executives);
        }
      } catch (error) {
        console.error("Failed to fetch executives", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  // Animation Variants
  const containerVar = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVar = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 50, damping: 20 },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[500px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          กำลังโหลดข้อมูลคณะกรรมการบริหาร...
        </p>
      </div>
    );
  }

  // แยกผู้อำนวยการ (director) ออกเป็นประธานกรรมการ
  const director = boardData.find((b) => b.role === "director") || boardData[0];
  const members = boardData.filter((b) => b !== director);

  return (
    <section className="relative max-w-[1600px] mx-auto overflow-hidden bg-slate-50 py-20 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#DAA520]/5 blur-[120px]" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVar}
        className="container px-4 sm:px-6 lg:px-8 mx-auto"
      >
        {/* --- Header Section --- */}
        <motion.div variants={itemVar} className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-sm font-semibold text-yellow-700 shadow-sm dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-500">
            <TeamOutlined /> คณะกรรมการบริหาร
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            คณะกรรมการ
            <span className="bg-linear-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent ml-2 shrink-0 inline-block">
              บริหารสถานศึกษา
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            ผู้ทรงคุณวุฒิและผู้บริหารที่ร่วมขับเคลื่อนวิทยาลัยสู่ความสำเร็จ
          </p>
        </motion.div>

        {/* --- 1. Chairman / Director (Hero Card) --- */}
        {director && (
          <motion.div variants={itemVar} className="mb-24 flex justify-center">
            <div className="relative w-full max-w-lg transition-transform hover:scale-[1.02]">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 rounded-3xl bg-linear-to-br from-yellow-400 to-yellow-600 opacity-20 blur-2xl dark:opacity-40"></div>

              <div className="relative overflow-hidden rounded-3xl border border-yellow-100 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                <div className="absolute right-6 top-6 text-yellow-500 opacity-20">
                  <SafetyCertificateFilled style={{ fontSize: "60px" }} />
                </div>

                <div className="flex flex-col items-center">
                  {/* Image Container */}
                  <div className="mb-8 h-64 w-64 overflow-hidden rounded-3xl border border-yellow-100 bg-slate-50 dark:bg-zinc-800/50 shadow-lg dark:border-neutral-800">
                    {director.img ? (
                      <Image
                        src={director.img}
                        alt="Director"
                        className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                        width={400}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserOutlined className="text-7xl text-slate-300 dark:text-zinc-700" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {director.title}
                  </h2>
                  <div className="mt-3 h-1 w-12 rounded-full bg-yellow-500" />
                  <p className="mt-4 text-center text-lg font-medium text-slate-600 dark:text-slate-300">
                    {director.secondary}
                  </p>

                  {/* Badge */}
                  <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-white shadow-lg dark:bg-white dark:text-slate-900">
                    <UserOutlined />
                    <span className="text-sm font-bold">ประธานกรรมการ</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Divider */}
        {members.length > 0 && (
          <>
            <motion.div
              variants={itemVar}
              className="relative mb-16 max-w-5xl mx-auto"
            >
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-slate-200 dark:border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-6 text-lg font-bold text-slate-500 dark:bg-neutral-950">
                  รายชื่อคณะกรรมการ
                </span>
              </div>
            </motion.div>

            {/* --- 2. Board Members Grid --- */}
            <motion.div
              variants={itemVar}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
            >
              {members.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -8 }}
                  className="group h-full"
                >
                  <div className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-lg transition-all duration-300 hover:border-yellow-200 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-yellow-900/50">
                    <div className="flex h-full flex-col items-center text-center">
                      {/* Image */}
                      <div className="mb-5 h-48 w-full aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm transition-transform duration-500 group-hover:scale-105 dark:border-neutral-800 dark:bg-zinc-800/50">
                        {item.img ? (
                          <Image
                            src={item.img}
                            alt={item.title}
                            className="h-full w-full object-cover object-top"
                            width={200}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserOutlined className="text-5xl text-slate-300 dark:text-zinc-700" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-yellow-600 dark:text-slate-100 dark:group-hover:text-yellow-500">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                        {item.secondary}
                      </p>

                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      {/* Spacer to push footer down */}
                      <div className="grow" />

                      {/* Footer Badge */}
                      <div className="mt-5 w-full border-t border-slate-100 pt-4 dark:border-neutral-800">
                        <span className="inline-block rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-neutral-800 dark:text-slate-400">
                          Committee Member
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </section>
  );
}
