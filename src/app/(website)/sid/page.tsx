"use client";

import React, { useState } from "react";
import { TeamOutlined } from "@ant-design/icons";
import { Tabs, Tab } from "@heroui/react";

import Sid2568 from "./Sid2568";
import Sid2569 from "./Sid2569";

export default function Sid() {
  const [selectedYear, setSelectedYear] = useState<string>("2569");

  return (
    <section className=" ">
      <div className="container  px-4">
        {/* --- Header --- */}
        <div className="mb-8 text-center">
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

        {/* --- Tabs for Year Selection --- */}
        <div className="mb-8 flex justify-center">
          <Tabs
            aria-label="Academic Year"
            selectedKey={selectedYear}
            onSelectionChange={(key) => setSelectedYear(key as string)}
            color="primary"
            variant="solid"
            radius="full"
            classNames={{
              tabList: "bg-slate-100 dark:bg-neutral-800 p-1",
              tab: "px-6 py-2 text-sm font-medium",
            }}
          >
            <Tab key="2569" title="ปีการศึกษา 2569 (ปัจจุบัน)" />
            <Tab key="2568" title="ปีการศึกษา 2568 (เก่า)" />
          </Tabs>
        </div>

        {/* --- Tab Content --- */}
        <div className="mt-4">
          {selectedYear === "2569" && <Sid2569 />}
          {selectedYear === "2568" && <Sid2568 />}
        </div>
      </div>
    </section>
  );
}
