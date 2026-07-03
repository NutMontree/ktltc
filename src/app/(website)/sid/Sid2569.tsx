"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserOutlined, BookOutlined, TeamOutlined, LoadingOutlined } from "@ant-design/icons";
import { Spinner } from "@heroui/react";

// Reusable Stat Card
const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
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
        {value.toLocaleString()}
      </h3>
    </div>
  </div>
);

const DEPARTMENT_CATEGORY_MAP: Record<string, string> = {
  ช่างยนต์: "1. อุตสาหกรรม",
  ช่างกลโรงงาน: "1. อุตสาหกรรม",
  ช่างเชื่อมโลหะ: "1. อุตสาหกรรม",
  ช่างไฟฟ้ากำลัง: "1. อุตสาหกรรม",
  ช่างอิเล็กทรอนิกส์: "1. อุตสาหกรรม",
  ช่างเทคนิคพื้นฐาน: "1. อุตสาหกรรม",
  ช่างก่อสร้าง: "1. อุตสาหกรรม",
  ยานยนต์ไฟฟ้า: "1. อุตสาหกรรม",
  การบัญชี: "2. พาณิชยกรรม",
  การตลาด: "2. พาณิชยกรรม",
  การจัดการสำนักงานดิจิทัล: "2. พาณิชยกรรม",
  การจัดการโลจิสติกส์และซัพพลายเชน: "2. พาณิชยกรรม",
  การโรงแรม: "3. ท่องเที่ยว",
  เทคโนโลยีธุรกิจดิจิทัล: "4. เทคโนโลยีสารสนเทศ",
};

const DEFAULT_CATEGORIES = [
  "1. อุตสาหกรรม",
  "2. พาณิชยกรรม",
  "3. ท่องเที่ยว",
  "4. เทคโนโลยีสารสนเทศ",
];

export default function Sid2569() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users/all");
      const data = await res.json();

      if (data?.users) {
        const students = data.users.filter((u: any) => u.role === "student");
        calculateStats(students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (students: any[]) => {
    // 1. Overall Summary
    let total = 0;
    let pwc = 0; // ปวช
    let pws = 0; // ปวส
    let btech = 0; // ทล.บ

    // Level breakdowns
    const levelStats = {
      pwc: { m: 0, f: 0, graduated: 0, dropped: 0, total: 0 },
      pws: { m: 0, f: 0, graduated: 0, dropped: 0, total: 0 },
      btech: { m: 0, f: 0, graduated: 0, dropped: 0, total: 0 },
      total: { m: 0, f: 0, graduated: 0, dropped: 0, total: 0 },
    };

    // Category breakdowns
    const catStats: Record<string, any> = {};
    DEFAULT_CATEGORIES.forEach((cat) => {
      catStats[cat] = {
        pwc1: { m: 0, f: 0 },
        pwc2: { m: 0, f: 0 },
        pwc3: { m: 0, f: 0 },
        pws1: { m: 0, f: 0 },
        pws2: { m: 0, f: 0 },
        total: 0,
      };
    });

    students.forEach((s) => {
      total++;

      // Parsing Level & Year
      const acaLevel = (s.academicLevel || "").toLowerCase();
      let levelKey = "pwc"; // default
      if (acaLevel.includes("ปวส")) levelKey = "pws";
      else if (acaLevel.includes("ทล.บ") || acaLevel.includes("ปริญญา")) levelKey = "btech";
      
      let year = "1";
      if (acaLevel.includes("2")) year = "2";
      if (acaLevel.includes("3")) year = "3";

      if (levelKey === "pwc") pwc++;
      else if (levelKey === "pws") pws++;
      else if (levelKey === "btech") btech++;

      // Parsing Gender
      const name = (s.name || "").trim();
      let isMale = false;
      if (name.startsWith("นาย") || name.startsWith("เด็กชาย") || name.startsWith("ด.ช.")) {
        isMale = true;
      }
      // If no prefix or female prefix, treat as female

      // Status
      const status = s.studentStatus || "";
      const isGraduated = status.includes("สำเร็จ") || status.includes("จบ");
      const isDropped = status.includes("พ้นสภาพ") || status.includes("ลาออก") || status.includes("พักการเรียน");

      // Update levelStats
      const ref = levelStats[levelKey as keyof typeof levelStats];
      ref.total++;
      levelStats.total.total++;

      if (isGraduated) {
        ref.graduated++;
        levelStats.total.graduated++;
      } else if (isDropped) {
        ref.dropped++;
        levelStats.total.dropped++;
      } else {
        // Only count active students for M/F stats
        if (isMale) {
          ref.m++;
          levelStats.total.m++;
        } else {
          ref.f++;
          levelStats.total.f++;
        }
      }

      // Department parsing
      let deptName = (s.department || "").replace("แผนกวิชา", "").trim();
      // Handle known edge cases like "การตลาด/โลจิสติก์" -> "การตลาด" for mapping
      if (deptName.includes("การตลาด")) deptName = "การตลาด";
      
      const catKey = DEPARTMENT_CATEGORY_MAP[deptName] || "อื่นๆ";
      
      if (catStats[catKey]) {
        // Only count active students in department table (exclude dropped/graduated)
        if (!isGraduated && !isDropped) {
          const subKey = `${levelKey}${year}`; // e.g. pwc1, pws2
          if (catStats[catKey][subKey]) {
            if (isMale) catStats[catKey][subKey].m++;
            else catStats[catKey][subKey].f++;
          }
          catStats[catKey].total++;
        }
      }
    });

    setStats({
      summary: { total, pwc, pws, btech },
      levelStats,
      catStats,
    });
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-slate-500">กำลังประมวลผลข้อมูลผู้เรียน...</p>
      </div>
    );
  }

  return (
    <>
      {/* --- 1. Summary Dashboard (Highlight) --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="นักเรียนทั้งหมด (ปัจจุบัน)"
          value={stats.summary.total}
          icon={<TeamOutlined />}
          color="bg-blue-500"
        />
        <StatCard
          title="ระดับ ปวช."
          value={stats.summary.pwc}
          icon={<BookOutlined />}
          color="bg-emerald-500"
        />
        <StatCard
          title="ระดับ ปวส."
          value={stats.summary.pws}
          icon={<UserOutlined />}
          color="bg-amber-500"
        />
        <StatCard
          title="ระดับ ทล.บ."
          value={stats.summary.btech}
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
            ภาพรวมจำแนกตามระดับการศึกษา (Real-time ปี 2569)
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
              {[
                { label: "ระดับ ปวช.", key: "pwc" },
                { label: "ระดับ ปวส.", key: "pws" },
                { label: "ระดับ ทล.บ.", key: "btech" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b bg-white hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-right">{stats.levelStats[row.key].m.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{stats.levelStats[row.key].f.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-green-600">{stats.levelStats[row.key].graduated.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-500">{stats.levelStats[row.key].dropped.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">
                    {stats.levelStats[row.key].total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-blue-50/50 font-bold text-slate-800 dark:bg-blue-900/20 dark:text-white">
                <td className="px-6 py-4">รวมทั้งหมด</td>
                <td className="px-6 py-4 text-right">{stats.levelStats.total.m.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">{stats.levelStats.total.f.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-green-600">{stats.levelStats.total.graduated.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-red-500">{stats.levelStats.total.dropped.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-lg text-blue-600">
                  {stats.levelStats.total.total.toLocaleString()}
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
            สถิติจำแนกตามประเภทวิชา (นักเรียนที่กำลังศึกษาอยู่)
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-800 text-xs text-white uppercase dark:bg-neutral-950">
                <tr>
                  <th
                    rowSpan={2}
                    className="border-r border-slate-600 px-4 py-3 min-w-[180px]"
                  >
                    ประเภทวิชา
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
                      <th className="border-r border-slate-500 bg-slate-600 px-2 py-1 text-center text-[10px] min-w-[30px]">
                        ช
                      </th>
                      <th className="border-r border-slate-500 bg-slate-600 px-2 py-1 text-center text-[10px] min-w-[30px]">
                        ญ
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {DEFAULT_CATEGORIES.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-800">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {cat}
                    </td>
                    <td className="px-2 py-3 text-center">{stats.catStats[cat].pwc1.m || 0}</td>
                    <td className="px-2 py-3 text-center text-slate-400">{stats.catStats[cat].pwc1.f || 0}</td>
                    <td className="px-2 py-3 text-center">{stats.catStats[cat].pwc2.m || 0}</td>
                    <td className="px-2 py-3 text-center text-slate-400">{stats.catStats[cat].pwc2.f || 0}</td>
                    <td className="px-2 py-3 text-center">{stats.catStats[cat].pwc3.m || 0}</td>
                    <td className="px-2 py-3 text-center text-slate-400">{stats.catStats[cat].pwc3.f || 0}</td>
                    <td className="px-2 py-3 text-center">{stats.catStats[cat].pws1.m || 0}</td>
                    <td className="px-2 py-3 text-center text-slate-400">{stats.catStats[cat].pws1.f || 0}</td>
                    <td className="px-2 py-3 text-center">{stats.catStats[cat].pws2.m || 0}</td>
                    <td className="px-2 py-3 text-center text-slate-400">{stats.catStats[cat].pws2.f || 0}</td>
                    <td className="bg-slate-50 px-4 py-3 text-center font-bold text-blue-600 dark:bg-neutral-800">
                      {stats.catStats[cat].total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </>
  );
}
