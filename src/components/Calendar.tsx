"use client";

import React, { useState } from "react";
import { Calendar, theme, ConfigProvider, Badge } from "antd";
import type { CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/th";

/**
 * Calendar.tsx: คอมโพเนนต์ปฏิทินกิจกรรม
 * 
 * หน้าที่: 
 * 1. แสดงปฏิทินแบบ Interactive (Ant Design) พร้อมการตั้งค่าสไตล์แบบ Custom
 * 2. แสดงจุดเครื่องหมาย (Badge) ในวันที่มีกิจกรรมสำคัญ
 * 3. จัดการสถานะการเลือกวันที่ (Selected Date)
 * 4. ตกแต่ง UI ด้วย Framer Motion และระบบสี Indigo เพื่อความทันสมัย
 */

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>["mode"]) => {
    console.log(value.format("YYYY-MM-DD"), mode);
  };

  const onSelect = (newValue: Dayjs) => {
    setSelectedDate(newValue);
  };

  /**
   * getListData: จำลองข้อมูลกิจกรรม (Events) ตามวันที่
   * (ในอนาคตสามารถดึงจากฐานข้อมูลมาแสดงผลได้)
   */
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

  /**
   * dateCellRender: ฟังก์ชันสำหรับเรนเดอร์เนื้อหาภายในแต่ละช่องของวันที่
   * ใช้สำหรับแสดงจุด Badge ใต้ตัวเลขวันที่
   */
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
          colorPrimary: "#6366f1", // สี Indigo หลักของปฏิทิน
          borderRadius: 12,
          fontFamily: "var(--font-sans)",
        },
        components: {
          Calendar: {
            fullBg: "#ffffff",
            itemActiveBg: "#e0e7ff", // สีพื้นหลังเมื่อคลิกเลือกวัน
          },
        },
      }}
    >
      <section className=" font-sans">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className=""
        >
          <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start">
            {/* --- ส่วนปฏิทิน (Calendar Widget) --- */}
            <div className="w-full max-w-md">
              <div className="relative overflow-hidden rounded-3xl bg-white px-2 py-2 shadow-xl ring-1 ring-slate-100 dark:bg-neutral-900 dark:ring-neutral-800">
                {/* ส่วนหัวการตกแต่ง (Decorative Header) */}
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

                {/* ตัวคอนโทรลปฏิทินจาก Ant Design */}
                <Calendar
                  fullscreen={false}
                  onPanelChange={onPanelChange}
                  onSelect={onSelect}
                  cellRender={dateCellRender}
                />
              </div>
            </div>

            {/* Note: ส่วนแสดงรายละเอียดกิจกรรม (Side Panel) สามารถเปิดใช้ได้ภายหลังหากมีข้อมูล Database */}
          </div>
        </motion.div>
      </section>
    </ConfigProvider>
  );
}

