"use client";

import React, { useState } from "react";
import { Calendar, theme, ConfigProvider, Badge } from "antd";
import type { CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th"; // ถ้าต้องการภาษาไทย

// ตั้งค่า locale เป็นไทย (Optional)
// dayjs.locale('th');

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>["mode"]) => {
    console.log(value.format("YYYY-MM-DD"), mode);
  };

  const onSelect = (newValue: Dayjs) => {
    setSelectedDate(newValue);
  };

  // จำลองข้อมูลกิจกรรม (Events)
  const getListData = (value: Dayjs) => {
    let listData;
    switch (value.date()) {
      case 1:
        listData = [{ type: "warning", content: "วันพระ" }];
        break;
      case 31:
        listData = [{ type: "success", content: "ประชุมวิชาการ" }];
        break;
      default:
    }
    return listData || [];
  };

  // Custom Cell Rendering (แสดงจุดสีเล็กๆ ใต้วันที่มีกิจกรรม)
  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul className="events m-0 list-none p-0">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type as any} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1", // สี Indigo ทันสมัย
          borderRadius: 12,
          fontFamily: "var(--font-sans)", // ใช้ Font ของโปรเจกต์
        },
        components: {
          Calendar: {
            fullBg: "#ffffff",
            itemActiveBg: "#e0e7ff", // สีพื้นหลังเมื่อเลือกวัน
          },
        },
      }}
    >
      <section className="min-h-[500px] bg-slate-50/50 py-12 font-sans dark:bg-neutral-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-4"
        >
          <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start">
            {/* --- ส่วนปฏิทิน (Calendar Widget) --- */}
            <div className="w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 dark:bg-neutral-900 dark:ring-neutral-800">
                {/* Header ตกแต่ง */}
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <CalendarOutlined style={{ fontSize: "20px" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        ปฏิทินกิจกรรม
                      </h2>
                      <p className="text-xs text-slate-400">
                        เลือกวันที่เพื่อดูรายละเอียด
                      </p>
                    </div>
                  </div>
                </div>

                {/* ตัวปฏิทิน */}
                <Calendar
                  fullscreen={false}
                  onPanelChange={onPanelChange}
                  onSelect={onSelect}
                  cellRender={dateCellRender} // เพิ่มจุดสี
                />
              </div>
            </div>

            {/* --- ส่วนแสดงรายละเอียด (Event Detail Side Panel) --- */}
            {/* เพิ่มส่วนนี้เพื่อให้ดูเป็น Dashboard ที่สมบูรณ์ */}
            <div className="w-full max-w-md">
              <div className="h-full rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 dark:bg-neutral-900 dark:ring-neutral-800">
                <h3 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
                  กิจกรรมเดือนนี้
                </h3>

                {/* Mockup รายการกิจกรรม */}
                <div className="space-y-4">
                  <div className="flex gap-4 rounded-r-xl border-l-4 border-indigo-500 bg-slate-50 p-4 dark:bg-neutral-800">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        No activities.
                      </p>
                      <p className="text-sm text-slate-500">Time Any</p>
                    </div>
                  </div>
                  <div className="flex gap-4 rounded-r-xl border-l-4 border-orange-400 bg-slate-50 p-4 dark:bg-neutral-800">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        No activities.
                      </p>
                      <p className="text-sm text-slate-500">Time Any</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </ConfigProvider>
  );
}
