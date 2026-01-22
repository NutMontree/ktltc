"use client";

import React from "react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import {
  TeamOutlined,
  HeartFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Link from "next/link"; // ใช้ Link ปกติถ้าไม่มี LinkPreview

const StudentSupportSystem = () => {
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
          <span className="mb-2 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-600 uppercase">
            Student Care & Support
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-slate-100">
            ระบบดูแลช่วยเหลือ <span className="text-rose-500">&</span>{" "}
            คุ้มครองนักเรียน
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500 dark:text-slate-400">
            ระบบสารสนเทศเพื่อการคัดกรอง เยี่ยมบ้าน และติดตามดูแลนักเรียนรายบุคคล
            เพื่อความเสมอภาคและโอกาสทางการศึกษา
          </p>
        </motion.div>

        {/* --- Content (Single Highlight Card) --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          {/* Card: ระบบดูแลผู้เรียน */}
          {/* หมายเหตุ: ถ้าไม่มี LinkPreview ให้เปลี่ยนเป็น <Link href="..."> แทน */}
          <Link
            href="https://kruboom.com/student/"
            target="_blank"
            className="group block w-full max-w-lg"
          >
            <article className="relative flex h-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-rose-200 hover:shadow-2xl hover:shadow-rose-500/15 dark:border-neutral-800 dark:bg-neutral-900">
              {/* Decorative Icon Background (Glow Effect) */}
              <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-rose-50 opacity-50 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-rose-900/20" />
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-24 w-24 rounded-full bg-orange-50 opacity-50 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-orange-900/20" />

              <div className="relative mb-8">
                {/* Main Icon Wrapper */}
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-rose-100 bg-linear-to-br from-rose-50 to-orange-50 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-800">
                  {/* คุณสามารถเปลี่ยน Image เป็นรูปโลโก้จริงได้ หรือใช้ Icon แทน */}
                  <TeamOutlined className="text-5xl text-rose-500" />
                </div>

                {/* Sub Icon (Badge) */}
                <div className="absolute -right-1 -bottom-1 flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-500 shadow-lg">
                  <HeartFilled />
                </div>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-slate-800 transition-colors group-hover:text-rose-600 dark:text-slate-100">
                เข้าสู่ระบบดูแลผู้เรียน
              </h3>

              <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                บันทึกข้อมูลการเยี่ยมบ้าน การคัดกรองความเสี่ยง <br />
                และรายงานผลการดำเนินงานรายบุคคล
              </p>

              {/* Button UI within Card */}
              <div className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-50 px-6 py-3 text-sm font-bold text-slate-600 transition-all duration-300 group-hover:bg-rose-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-rose-500/30">
                <span>Access System</span>
                <ArrowRightOutlined />
              </div>
            </article>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StudentSupportSystem;
