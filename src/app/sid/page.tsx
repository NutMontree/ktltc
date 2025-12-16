"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserOutlined, BookOutlined, TeamOutlined } from "@ant-design/icons";

// Reusable Stat Card
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div className="flex items-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
    <div className={`rounded-full px-2 py-1 ${color} mr-4 text-xl text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        {value}
      </h3>
    </div>
  </div>
);

export default function Sid() {
  return (
    <section className="py-16 font-sans">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        {/* --- Header --- */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <TeamOutlined className="mr-2" /> สถิติจำนวนผู้เรียน
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            ข้อมูล<span className="text-[#DAA520]">นักเรียน นักศึกษา</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Student Information Statistics
          </p>
        </div>

        {/* --- 1. Summary Dashboard (Highlight) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="นักเรียนทั้งหมด"
            value="2,502"
            icon={<TeamOutlined />}
            color="bg-blue-500"
          />
          <StatCard
            title="ระดับ ปวช."
            value="1,648"
            icon={<BookOutlined />}
            color="bg-emerald-500"
          />
          <StatCard
            title="ระดับ ปวส."
            value="854"
            icon={<UserOutlined />}
            color="bg-amber-500"
          />
          <StatCard
            title="ระดับ ทล.บ."
            value="0"
            icon={<BookOutlined />}
            color="bg-rose-500"
          />
        </motion.div>

        {/* --- 2. Main Data Table (Overview) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
            <h3 className="font-bold text-slate-700 dark:text-slate-200">
              ภาพรวมจำแนกตามระดับการศึกษา
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs text-slate-700 uppercase dark:bg-neutral-800 dark:text-slate-300">
                <tr>
                  <th className="rounded-tl-lg px-6 py-4">ระดับการศึกษา</th>
                  <th className="px-6 py-4 text-right">ชาย</th>
                  <th className="px-6 py-4 text-right">หญิง</th>
                  <th className="px-6 py-4 text-right">จบการศึกษา</th>
                  <th className="px-6 py-4 text-right">พ้นสภาพ</th>
                  <th className="rounded-tr-lg px-6 py-4 text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    ระดับ ปวช.
                  </td>
                  <td className="px-6 py-4 text-right">998</td>
                  <td className="px-6 py-4 text-right">650</td>
                  <td className="px-6 py-4 text-right text-green-600">0</td>
                  <td className="px-6 py-4 text-right text-red-500">0</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    1,648
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    ระดับ ปวส.
                  </td>
                  <td className="px-6 py-4 text-right">496</td>
                  <td className="px-6 py-4 text-right">358</td>
                  <td className="px-6 py-4 text-right text-green-600">0</td>
                  <td className="px-6 py-4 text-right text-red-500">0</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    854
                  </td>
                </tr>
                <tr className="border-b bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    ระดับ ทล.บ.
                  </td>
                  <td className="px-6 py-4 text-right">0</td>
                  <td className="px-6 py-4 text-right">0</td>
                  <td className="px-6 py-4 text-right text-green-600">4</td>
                  <td className="px-6 py-4 text-right text-red-500">0</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    0
                  </td>
                </tr>
                {/* Total Row */}
                <tr className="bg-blue-50/50 font-bold text-slate-800 dark:bg-blue-900/20 dark:text-white">
                  <td className="px-6 py-4">รวมทั้งหมด</td>
                  <td className="px-6 py-4 text-right">1,494</td>
                  <td className="px-6 py-4 text-right">1,008</td>
                  <td className="px-6 py-4 text-right">0</td>
                  <td className="px-6 py-4 text-right">0</td>
                  <td className="px-6 py-4 text-right text-lg text-blue-600">
                    2,502
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* --- 3. Detailed Table (By Department) --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              สถิติจำแนกตามประเภทวิชา
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-800 text-xs text-white uppercase dark:bg-neutral-950">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border-r border-slate-600 px-4 py-3"
                    >
                      แผนกวิชา
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-slate-600 bg-slate-700 px-2 py-2 text-center"
                    >
                      ปวช. 1
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-slate-600 bg-slate-700 px-2 py-2 text-center"
                    >
                      ปวช. 2
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-slate-600 bg-slate-700 px-2 py-2 text-center"
                    >
                      ปวช. 3
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-slate-600 bg-slate-700 px-2 py-2 text-center"
                    >
                      ปวส. 1
                    </th>
                    <th
                      colSpan={2}
                      className="border-r border-slate-600 bg-slate-700 px-2 py-2 text-center"
                    >
                      ปวส. 2
                    </th>
                    <th
                      rowSpan={2}
                      className="bg-blue-600 px-4 py-3 text-center"
                    >
                      รวม
                    </th>
                  </tr>
                  <tr>
                    {/* Loop generates sub-headers for Male/Female */}
                    {[...Array(5)].map((_, i) => (
                      <React.Fragment key={i}>
                        <th className="border-r border-slate-500 bg-slate-600 px-2 py-1 text-center text-[10px]">
                          ช
                        </th>
                        <th className="border-r border-slate-500 bg-slate-600 px-2 py-1 text-center text-[10px]">
                          ญ
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {/* Row 1: อุตสาหกรรม */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      1. อุตสาหกรรม
                    </td>
                    <td className="px-2 py-3 text-center">299</td>
                    <td className="px-2 py-3 text-center text-slate-400">58</td>
                    <td className="px-2 py-3 text-center">246</td>
                    <td className="px-2 py-3 text-center text-slate-400">47</td>
                    <td className="px-2 py-3 text-center">326</td>
                    <td className="px-2 py-3 text-center text-slate-400">59</td>
                    <td className="px-2 py-3 text-center">252</td>
                    <td className="px-2 py-3 text-center text-slate-400">38</td>
                    <td className="px-2 py-3 text-center">188</td>
                    <td className="px-2 py-3 text-center text-slate-400">35</td>
                    <td className="bg-slate-50 px-4 py-3 text-center font-bold text-blue-600 dark:bg-neutral-800">
                      1,311
                    </td>
                  </tr>

                  {/* Row 2: พาณิชยกรรม */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      2. พาณิชยกรรม
                    </td>
                    <td className="px-2 py-3 text-center">10</td>
                    <td className="px-2 py-3 text-center text-slate-400">96</td>
                    <td className="px-2 py-3 text-center">29</td>
                    <td className="px-2 py-3 text-center text-slate-400">
                      152
                    </td>
                    <td className="px-2 py-3 text-center">50</td>
                    <td className="px-2 py-3 text-center text-slate-400">
                      125
                    </td>
                    <td className="px-2 py-3 text-center">6</td>
                    <td className="px-2 py-3 text-center text-slate-400">
                      100
                    </td>
                    <td className="px-2 py-3 text-center">22</td>
                    <td className="px-2 py-3 text-center text-slate-400">
                      115
                    </td>
                    <td className="bg-slate-50 px-4 py-3 text-center font-bold text-blue-600 dark:bg-neutral-800">
                      588
                    </td>
                  </tr>

                  {/* Row 3: ท่องเที่ยว */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      3. ท่องเที่ยว
                    </td>
                    <td className="px-2 py-3 text-center">7</td>
                    <td className="px-2 py-3 text-center text-slate-400">16</td>
                    <td className="px-2 py-3 text-center">4</td>
                    <td className="px-2 py-3 text-center text-slate-400">14</td>
                    <td className="px-2 py-3 text-center">6</td>
                    <td className="px-2 py-3 text-center text-slate-400">11</td>
                    <td className="px-2 py-3 text-center">3</td>
                    <td className="px-2 py-3 text-center text-slate-400">9</td>
                    <td className="px-2 py-3 text-center">2</td>
                    <td className="px-2 py-3 text-center text-slate-400">12</td>
                    <td className="bg-slate-50 px-4 py-3 text-center font-bold text-blue-600 dark:bg-neutral-800">
                      62
                    </td>
                  </tr>

                  {/* Row 4: เทคโนโลยีสารสนเทศ */}
                  <tr className="hover:bg-slate-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      4. เทคโนโลยีสารสนเทศ
                    </td>
                    <td className="px-2 py-3 text-center">21</td>
                    <td className="px-2 py-3 text-center text-slate-400">72</td>
                    <td className="px-2 py-3 text-center">0</td>
                    <td className="px-2 py-3 text-center text-slate-400">0</td>
                    <td className="px-2 py-3 text-center">0</td>
                    <td className="px-2 py-3 text-center text-slate-400">0</td>
                    <td className="px-2 py-3 text-center">23</td>
                    <td className="px-2 py-3 text-center text-slate-400">49</td>
                    <td className="px-2 py-3 text-center">0</td>
                    <td className="px-2 py-3 text-center text-slate-400">0</td>
                    <td className="bg-slate-50 px-4 py-3 text-center font-bold text-blue-600 dark:bg-neutral-800">
                      121
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
