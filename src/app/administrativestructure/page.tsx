"use client";

import React from "react";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Data, Data1, Data2, Data3, Data4 } from "./data";
import { UserOutlined } from "@ant-design/icons";

// --- 1. Reusable Card Component ---
const PersonCard = ({
  img,
  name,
  position,
  details,
  isLeader = false,
}: {
  img: string;
  name: string;
  position?: string;
  details?: string[];
  isLeader?: boolean;
}) => {
  return (
    <div className={`relative ${isLeader ? "z-10" : "z-0"}`}>
      <BackgroundGradient
        className={`linear:bg-zinc-900 h-full rounded-[22px] bg-white p-4 shadow-sm ${isLeader ? "border-2 border-[#DAA520]/20" : ""}`}
      >
        <div className="flex h-full flex-col items-center text-center">
          <div className={`overflow-hidden rounded-xl bg-slate-100`}>
            <Image
              src={img}
              alt={name}
              className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
              removeWrapper
            />
          </div>

          <h3
            className={`linear:text-slate-100 mt-4 font-bold text-slate-800 ${isLeader ? "text-xl" : "text-base"}`}
          >
            {name}
          </h3>

          {position && (
            <p
              className={`mt-1 font-medium ${isLeader ? "text-[#DAA520]" : "linear:text-slate-400 text-sm text-slate-500"}`}
            >
              {position}
            </p>
          )}

          <div className="linear:text-slate-500 mt-2 space-y-1 text-xs text-slate-400">
            {details?.map((line, idx) => <p key={idx}>{line}</p>)}
          </div>
        </div>
      </BackgroundGradient>
    </div>
  );
};

// --- 2. Reusable Section Component ---
const DepartmentSection = ({
  title,
  head,
  staff,
}: {
  title: string;
  head: { name: string; img: string; position: string };
  staff: any[];
}) => {
  return (
    <div className="relative mb-20">
      {/* Connector Line (Vertical from Top) */}
      <div className="linear:bg-zinc-800 absolute -top-12 left-1/2 h-12 w-0.5 -translate-x-1/2 bg-slate-200 lg:hidden"></div>

      <div className="linear:border-zinc-800 linear:bg-zinc-950/50 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 lg:p-10">
        {/* Section Header & Deputy Director */}
        <div className="mb-10 flex flex-col items-center">
          <h2 className="linear:bg-zinc-900 linear:ring-zinc-800 mb-8 inline-block rounded-full bg-white px-6 py-2 text-xl font-bold text-[#DAA520] shadow-sm ring-1 ring-slate-100">
            {title}
          </h2>

          <div className="w-full max-w-sm">
            <PersonCard
              img={head.img}
              name={head.name}
              position={head.position}
              isLeader={true}
            />
          </div>

          {/* Connector to Staff */}
          {staff.length > 0 && (
            <div className="linear:bg-zinc-800 mt-4 h-8 w-0.5 bg-slate-200"></div>
          )}
        </div>

        {/* Staff Grid */}
        {staff.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staff.map((item, index) => (
              <PersonCard
                key={index}
                img={item.img}
                name={item.title}
                position={item.position}
                details={[
                  item.department,
                  item.faction,
                  item.description,
                ].filter(Boolean)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdministrativeStructure() {
  return (
    <section className=" ">
      <div className="container mx-auto px-4">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h1 className="linear:text-white text-xl font-extrabold text-slate-800 md:text-3xl">
            <span className="text-black dark:text-white">โครงสร้าง</span>
            <span className="text-[#DAA520]">การบริหารงานสถานศึกษา</span>
          </h1>
          <p className="mt-2 text-slate-500">Administrative Structure Chart</p>
        </motion.div>

        {/* --- 1. ผู้อำนวยการ (Top Level) --- */}
        <div className="relative mb-16 flex flex-col items-center">
          <div className="w-full max-w-md">
            <PersonCard
              img="/images/ผู้บริหาร/1.webp"
              name="นางสาวทักษิณา ชมจันทร์"
              position="ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์"
              isLeader={true}
            />
          </div>
          {/* Main Vertical Line Connector */}
          <div className="linear:to-zinc-800 absolute -bottom-16 left-1/2 h-16 w-1 bg-linear-to-b from-[#DAA520] to-slate-200"></div>
        </div>

        {/* --- Departments Container --- */}
        <div className="relative">
          {/* Horizontal Line Connector (Desktop only) */}
          <div className="linear:bg-zinc-800 absolute -top-12 right-[10%] left-[10%] hidden h-0.5 bg-slate-200 lg:block"></div>
          {/* Vertical Lines to Departments (Desktop only) */}
          <div className="linear:bg-zinc-800 absolute -top-12 left-[10%] hidden h-12 w-0.5 bg-slate-200 lg:block"></div>
          <div className="linear:bg-zinc-800 absolute -top-12 right-[10%] hidden h-12 w-0.5 bg-slate-200 lg:block"></div>
          <div className="linear:bg-zinc-800 absolute -top-12 left-1/2 hidden h-12 w-0.5 -translate-x-1/2 bg-slate-200 lg:block"></div>

          <div className="grid grid-cols-1 gap-8">
            {/* 2. ฝ่ายบริหารทรัพยากร (และคณะกรรมการบริหาร) */}
            {/* หมายเหตุ: ผมนำ Data มาใส่ที่นี่ สมมติว่าเป็นส่วนของฝ่ายบริหารงานทั่วไป/ทรัพยากร */}
            <DepartmentSection
              title="คณะกรรมการบริหารสถานศึกษา"
              head={{
                name: "นางสาวทักษิณา ชมจันทร์", // หรือใส่ชื่อประธานกรรมการ
                img: "/images/ผู้บริหาร/1.webp",
                position: "ประธานกรรมการ",
              }}
              staff={Data}
            />

            {/* 3. ฝ่ายพัฒนากิจการนักเรียน นักศึกษา */}
            <DepartmentSection
              title="ฝ่ายพัฒนากิจการนักเรียน นักศึกษา"
              head={{
                name: "นางสาววิภาวรรณ สีแดด",
                img: "/images/ผู้บริหาร/2.webp",
                position: "รองผู้อำนวยการ",
              }}
              staff={Data1}
            />

            {/* 4. ฝ่ายแผนงานและความร่วมมือ */}
            <DepartmentSection
              title="ฝ่ายแผนงานและความร่วมมือ"
              head={{
                name: "นายสมศักดิ์ จันทานิตย์",
                img: "/images/ผู้บริหาร/3.webp",
                position: "รองผู้อำนวยการ",
              }}
              staff={Data2}
            />

            {/* 5. ฝ่ายบริหารทรัพยากร */}
            <DepartmentSection
              title="ฝ่ายบริหารทรัพยากร"
              head={{
                name: "นางสาวภวิกา โพธิ์ขาว",
                img: "/images/ผู้บริหาร/5.webp",
                position: "รองผู้อำนวยการ",
              }}
              staff={Data3}
            />

            {/* 6. ฝ่ายวิชาการ */}
            <DepartmentSection
              title="ฝ่ายวิชาการ"
              head={{
                name: "นายอาทร ศรีมะณี",
                img: "/images/ผู้บริหาร/4.webp",
                position: "รองผู้อำนวยการ",
              }}
              staff={Data4}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
