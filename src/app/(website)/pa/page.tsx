"use client";

import React, { useState } from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined, ReadOutlined } from "@ant-design/icons";
import { Tabs, Tab } from "@heroui/react";

import PaOld from "./PaOld";
import PaNew from "./PaNew";

export default function PaPage() {
  const [selectedTab, setSelectedTab] = useState<string>("new");

  return (
    <section className="bg-slate-50 pb-20 font-sans dark:bg-neutral-950 min-h-screen">
      {/* --- Breadcrumb & Header --- */}
      <div className="border-b border-slate-200 bg-white pt-[100px] pb-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            การประเมินผล<span className="text-[#DAA520]">การพัฒนางาน (PA)</span>
          </h1>
          <p className="mb-6 text-sm text-slate-500 md:text-base dark:text-slate-400">
            Performance Agreement for Government Teachers and Educational Personnel
          </p>

          <div className="flex justify-center mb-8">
            <Breadcrumb
              items={[
                {
                  href: "/",
                  title: (
                    <>
                      <HomeOutlined /> Home
                    </>
                  ),
                },
                {
                  title: (
                    <span className="text-blue-600">
                      Performance Agreement (PA)
                    </span>
                  ),
                },
              ]}
            />
          </div>

          {/* --- Tabs for System Selection --- */}
          <div className="flex justify-center">
            <Tabs
              aria-label="PA System Version"
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              color="primary"
              variant="solid"
              radius="full"
              classNames={{
                tabList: "bg-slate-100 dark:bg-neutral-800 p-1",
                tab: "px-6 py-2 text-sm font-medium",
              }}
            >
              <Tab key="new" title="ระบบรายงาน PA (ใหม่)" />
              <Tab key="old" title="ข้อมูลเก่า (ปี 2568)" />
            </Tabs>
          </div>
        </div>
      </div>

      {/* --- Tab Content --- */}
      <div className="mt-4 px-4 sm:px-6">
        {selectedTab === "new" && <PaNew />}
        {selectedTab === "old" && <PaOld />}
      </div>
    </section>
  );
}
