"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BankOutlined,
  HomeOutlined,
  BuildOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

// 1. แยกข้อมูลออกมาเพื่อให้จัดการง่าย (Clean Code)
const buildingsData = [
  {
    date: "7 เม.ษ. 2542",
    code: "1000-001-0003",
    name: "อาคารโรงฝึกงาน 3 ชั้น 4,000 ตรม.",
    amount: 1,
    unit: "หลัง",
    rooms: 24,
  },
  {
    date: "19 ก.ย. 2545",
    code: "1000-001-0011",
    name: "อาคารสำนักงาน",
    amount: 1,
    unit: "หลัง",
    rooms: 6,
  },
  {
    date: "12 ก.ย. 2545",
    code: "1000-001-0012",
    name: "กั้นห้องอาคารโรงฝึกงาน",
    amount: 1,
    unit: "หลัง",
    rooms: 2,
  },
  {
    date: "9 ก.ย. 2546",
    code: "44701/46",
    name: "โรงอาหารอเนกประสงค์",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "11 ก.พ. 2547",
    code: "1000-001-0014",
    name: "ห้องประชุมทองกวาว",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "15 พ.ย. 2547",
    code: "กช.601/46",
    name: "อาคารโรงฝึกงานแบบจั่วคู่",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "15 ม.ค. 2547",
    code: "1000-001-0017",
    name: "อาคารฝึกอบรมอาชีพระยะสั้น",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "11 ม.ค. 2549",
    code: "1000-001-0019",
    name: "อาคารส่งเสริมธุรกิจอาร์แคร์",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "13 มี.ค. 2549",
    code: "1000-001-0020",
    name: "อาคาร OTOP",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "23 ก.ย. 2550",
    code: "อค.7",
    name: "อาคารเรียนและปฏิบัติการ 4 ชั้น",
    amount: 1,
    unit: "หลัง",
    rooms: 20,
  },
  {
    date: "6 พ.ค. 2551",
    code: "1000-001-0022",
    name: "ปรับปรุงต่อเติมอาคารแผนกช่างยนต์",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "-",
    code: "อค.2",
    name: "อาคารเรียนและปฏิบัติการ 1,920 ตรม.",
    amount: 1,
    unit: "หลัง",
    rooms: 20,
  },
  {
    date: "-",
    code: "อค.3",
    name: "อาคารโรงฝึกงาน 480 ตรม.",
    amount: 2,
    unit: "หลัง",
    rooms: 4,
  },
  {
    date: "-",
    code: "39402",
    name: "อาคารสำนักงานหอประชุมเล็ก 960",
    amount: 1,
    unit: "หลัง",
    rooms: 6,
  },
  {
    date: "-",
    code: "36002",
    name: "ห้องน้ำ ห้องส้วม 16 ตรม.",
    amount: 3,
    unit: "หลัง",
    rooms: 18,
  },
  {
    date: "-",
    code: "35402",
    name: "บ้านพักผู้บริหาร",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "-",
    code: "36404",
    name: "บ้านพักครู 6 หน่วย",
    amount: 2,
    unit: "หลัง",
    rooms: 12,
  },
  {
    date: "-",
    code: "350001",
    name: "บ้านพักนักการภารโรง",
    amount: 3,
    unit: "หลัง",
    rooms: 6,
  },
  {
    date: "31 ธ.ค. 2557",
    code: "56201",
    name: "อาคารโรงฝึกงานแบบจั่วคู่",
    amount: 1,
    unit: "หลัง",
    rooms: 4,
  },
  {
    date: "29 พ.ค. 2558",
    code: "1000-001-0041",
    name: "ปรับปรุงห้องน้ำครู",
    amount: 2,
    unit: "หลัง",
    rooms: 7,
  },
  {
    date: "29 พ.ค. 2558",
    code: "1000-001-0042",
    name: "ปรับปรุงห้องน้ำนักศึกษา",
    amount: 2,
    unit: "หลัง",
    rooms: 18,
  },
  {
    date: "-",
    code: "-",
    name: "อาคารโรงฝึกงานพื้นที่ไม่ต่ำกว่า 4,000 ตรม.",
    amount: 1,
    unit: "หลัง",
    rooms: 16,
  },
  {
    date: "30 พ.ค. 2560",
    code: "-",
    name: "ปรับปรุงโรงจอดรถจักรยานยนต์",
    amount: 1,
    unit: "หลัง",
    rooms: 1,
  },
  {
    date: "6 พ.ค. 2560",
    code: "-",
    name: "ปรับปรุงโรงอาหาร",
    amount: 1,
    unit: "หลัง",
    rooms: 4,
  },
  {
    date: "1 มี.ค. 2561",
    code: "-",
    name: "อาคารอเนกประสงค์ (โดม)",
    amount: 1,
    unit: "หลัง",
    rooms: 0,
  },
];

export default function Buildings() {
  return (
    <section className="min-h-screen py-16 font-sans">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <BankOutlined className="mr-2" /> ทะเบียนสินทรัพย์
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ข้อมูล<span className="text-[#DAA520]">อาคารสถานที่</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Building & Facilities Information
          </p>
        </motion.div>

        {/* --- Table Container --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined /> ว/ด/ป
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    เลขที่อาคาร
                  </th>
                  <th className="w-1/3 px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <BuildOutlined /> รายการ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-center gap-2">
                      <HomeOutlined /> จำนวน
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                    ห้อง
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {buildingsData.map((item, index) => (
                  <tr
                    key={index}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800/50"
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {item.date !== "-" ? (
                        item.date
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Code */}
                    <td className="px-6 py-4 font-mono whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {item.code !== "-" ? (
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-neutral-800 dark:text-slate-300">
                          {item.code}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {item.amount} {item.unit}
                      </span>
                    </td>

                    {/* Rooms */}
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                      {item.rooms > 0 ? (
                        <span className="font-semibold">{item.rooms}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-400">
            <span>รวมรายการทั้งหมด {buildingsData.length} รายการ</span>
            {/* หากต้องการแสดงผลรวมห้อง สามารถคำนวณและใส่ตรงนี้ได้ */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
