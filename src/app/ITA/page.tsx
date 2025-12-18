"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionItem,
  Chip,
  Button,
  Card,
  CardBody,
  CardHeader,
} from "@heroui/react";
import { Breadcrumb } from "antd";
import { Image } from "@heroui/react";
import {
  HomeOutlined,
  UserOutlined,
  FilePdfOutlined,
  AppstoreOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// Imports O1 - O37 (Keep existing imports)
import O1 from "./01/page";
import O2 from "./02/page";
import O3 from "./03/page";
import O4 from "./04/page";
import O5 from "./05/page";
import O6 from "./06/page";
import O7 from "./07/page";
import O8 from "./08/page";
import O9 from "./09/page";
import O10 from "./010/page";
import O11 from "./011/page";
import O12 from "./012/page";
import O13 from "./013/page";
import O14 from "./014/page";
import O15 from "./015/page";
import O16 from "./016/page";
import O17 from "./017/page";
import O18 from "./018/page";
import O19 from "./019/page";
import O20 from "./020/page";
import O21 from "./021/page";
import O22 from "./022/page";
import O23 from "./023/page";
import O24 from "./024/page";
import O25 from "./025/page";
import O26 from "./026/page";
import O27 from "./027/page";
import O28 from "./028/page";
import O29 from "./029/page";
import O30 from "./030/page";
import O31 from "./031/page";
import O32 from "./032/page";
import O33 from "./033/page";
import O34 from "./034/page";
import O35 from "./035/page";
import O36 from "./036/page";
import O37 from "./037/page";

import {
  TageLink,
  DataDate,
  Description,
  ImageItem,
} from "@/app/pressrelease/2568/press6811/press11/data";
import { FootTitle } from "@/components/FootTitle";

// --- Styled Components & Assets ---

const BackgroundDecor = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-500/10" />
    <div className="absolute right-[-10%] bottom-[-20%] h-[60vw] w-[60vw] rounded-full bg-teal-500/10 blur-[150px] dark:bg-teal-400/10" />
    <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-[0.03] dark:opacity-[0.05]" />
  </div>
);

const MainDownloadCard = () => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-400 via-teal-400 to-blue-600 p-0.5 shadow-xl shadow-blue-500/20 dark:from-blue-600 dark:via-teal-600 dark:to-blue-800"
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-400/30 to-teal-400/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative flex h-full flex-col items-center gap-6 rounded-[22px] bg-white/90 p-6 text-center backdrop-blur-xl md:flex-row md:p-8 md:text-left dark:bg-slate-900/95">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-500 to-teal-400 text-white shadow-lg">
          <FilePdfOutlined style={{ fontSize: "40px" }} />
        </div>
        <div className="grow">
          <h3 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
            รายงานผลการประเมิน ITA 2568
          </h3>
          <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
            ดาวน์โหลดเอกสารสรุปผลการประเมินคุณธรรมและความโปร่งใส (ฉบับทางการ)
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {TageLink.map((item, idx) => (
              <Link key={idx} href={item.href} target="_blank">
                <Chip
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="cursor-pointer font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  {item.tage}
                </Chip>
              </Link>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <Link
            href="/images/ข่าวประชาสัมพันธ์/2568/พฤศจิกายน/11/2587-สอศแจ้งผลประเมินITAประจำปีงบประมาณพศ2568.pdf"
            target="_blank"
            download
          >
            <Button
              size="lg"
              className="border-0 bg-linear-to-r from-blue-600 to-teal-500 font-semibold text-white shadow-md hover:from-blue-700 hover:to-teal-600"
              endContent={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
              }
            >
              Download PDF
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Content Components ---

const CategorySection = ({ group, index }: { group: any; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
      className="mb-8"
    >
      <Card
        isPressable
        onPress={() => setIsExpanded(!isExpanded)}
        className={`group w-full overflow-visible border-0 transition-all duration-300 ${
          isExpanded
            ? "z-10 rounded-b-none bg-white shadow-lg ring-2 ring-blue-500/50 dark:bg-slate-800 dark:ring-blue-400/50"
            : "rounded-2xl bg-white/60 backdrop-blur-md hover:bg-white hover:shadow-md dark:bg-slate-800/60 dark:hover:bg-slate-800"
        }`}
      >
        <CardHeader className="flex items-center gap-4 p-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-sm transition-all duration-300 group-hover:shadow-md ${isExpanded ? "scale-110 from-blue-500 to-teal-400 text-white" : "from-blue-100 to-teal-50 text-blue-600 dark:from-blue-900/30 dark:to-teal-900/30 dark:text-blue-400"}`}
          >
            <AppstoreOutlined style={{ fontSize: "24px" }} />
          </div>
          <div className="grow text-left">
            <div className="mb-1 text-sm font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              {group.title}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {group.subtitle}
            </h3>
          </div>
          <div
            className={`transform transition-transform duration-300 ${isExpanded ? "rotate-90" : ""} text-slate-400`}
          >
            <RightOutlined style={{ fontSize: "20px" }} />
          </div>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="ring-t-0 relative z-0 overflow-hidden rounded-b-2xl bg-white shadow-lg ring-2 ring-blue-500/50 dark:bg-slate-800 dark:ring-blue-400/50"
          >
            <div className="bg-slate-50/50 p-2 md:p-4 dark:bg-slate-900/50">
              <Accordion
                selectionMode="multiple"
                variant="splitted"
                className="gap-2"
                itemClasses={{
                  base: "group rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 px-0 transition-all data-[open=true]:ring-1 data-[open=true]:ring-blue-200 dark:data-[open=true]:ring-blue-800",
                  title:
                    "font-semibold text-slate-700 dark:text-slate-200 text-base",
                  subtitle: "text-slate-400 text-sm",
                  indicator: "text-blue-500 data-[open=true]:rotate-180",
                  content: "text-slate-600 dark:text-slate-400 pt-0 pb-4 px-4",
                  trigger:
                    "px-4 py-3 data-[hover=true]:bg-slate-50 dark:data-[hover=true]:bg-slate-700/50 rounded-xl transition-colors",
                }}
              >
                {group.items.map((item: any) => (
                  <AccordionItem
                    key={item.key}
                    aria-label={item.title}
                    startContent={
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300">
                        {item.key}
                      </div>
                    }
                    title={
                      <span>
                        {item.title.substring(item.title.indexOf(" ") + 1)}
                      </span>
                    }
                    subtitle={item.note}
                  >
                    <div className="rounded-xl border border-slate-100/50 bg-slate-50 p-4 dark:border-slate-800/50 dark:bg-slate-900/50">
                      {item.component}
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ITA() {
  // Grouping Data (Same as before, essential for structure)
  const topicGroups = useMemo(
    () => [
      // ... (Keep the exact same topicGroups data structure from the previous response)
      {
        id: "9.1",
        title: "ตัวชี้วัดย่อยที่ 9.1",
        subtitle: "ข้อมูลพื้นฐาน (O1 - O6)",
        items: [
          { key: "1", title: "O1 โครงสร้าง", component: <O1 /> },
          { key: "2", title: "O2 ข้อมูลผู้บริหาร", component: <O2 /> },
          { key: "3", title: "O3 อำนาจหน้าที่", component: <O3 /> },
          { key: "4", title: "O4 แผนพัฒนาสถานศึกษา", component: <O4 /> },
          { key: "5", title: "O5 ข้อมูลการติดต่อ", component: <O5 /> },
          { key: "6", title: "O6 กฎหมายที่เกี่ยวข้อง", component: <O6 /> },
        ],
      },
      {
        id: "9.2",
        title: "ตัวชี้วัดย่อยที่ 9.2",
        subtitle: "การบริหารงาน (O7 - O16)",
        items: [
          { key: "7", title: "O7 ข่าวประชาสัมพันธ์", component: <O7 /> },
          {
            key: "8",
            title: "O8 Q&A",
            component: <O8 />,
            note: "ช่องทางสื่อสารสองทาง เช่น Web board, Messenger Live Chat",
          },
          { key: "9", title: "O9 Social Network", component: <O9 /> },
          { key: "10", title: "O10 แผนดำเนินงานประจำปี", component: <O10 /> },
          {
            key: "11",
            title: "O11 รายงานผลการดําเนินงานประจําปี",
            component: <O11 />,
          },
          {
            key: "12",
            title: "O12 คู่มือหรือมาตรฐานการปฏิบัติงาน",
            component: <O12 />,
          },
          {
            key: "13",
            title: "O13 คู่มือหรือมาตรฐานการให้บริการ",
            component: <O13 />,
          },
          {
            key: "14",
            title: "O14 ข้อมูลเชิงสถิติการให้บริการ",
            component: <O14 />,
          },
          {
            key: "15",
            title: "O15 รายงานผลการสํารวจความพึงพอใจ",
            component: <O15 />,
          },
          { key: "16", title: "O16 E-Service", component: <O16 /> },
        ],
      },
      {
        id: "9.3",
        title: "ตัวชี้วัดย่อยที่ 9.3",
        subtitle: "การบริหารเงินงบประมาณ (O17 - O22)",
        items: [
          {
            key: "17",
            title: "O17 แผนการใช้จ่ายงบประมาณประจําปี",
            component: <O17 />,
          },
          {
            key: "18",
            title: "O18 ผลการใช้จ่ายงบประมาณประจําปี",
            component: <O18 />,
          },
          {
            key: "19",
            title: "O19 แผนการจัดซื้อจัดจ้าง/จัดหาพัสดุ",
            component: <O19 />,
          },
          {
            key: "20",
            title: "O20 ประกาศต่าง ๆ เกี่ยวกับการจัดซื้อจัดจ้าง",
            component: <O20 />,
          },
          {
            key: "21",
            title: "O21 สรุปผลการจัดซื้อจัดจ้างรายเดือน",
            component: <O21 />,
          },
          {
            key: "22",
            title: "O22 แผนการจัดซื้อจัดจ้าง/จัดหาพัสดุ",
            component: <O22 />,
          },
        ],
      },
      {
        id: "9.4",
        title: "ตัวชี้วัดย่อยที่ 9.4",
        subtitle: "การบริหารและพัฒนาทรัพยากรบุคคล (O23 - O25)",
        items: [
          { key: "23", title: "O23 การพัฒนาทรัพยากรบุคคล", component: <O23 /> },
          {
            key: "24",
            title: "O24 หลักเกณฑ์การบริหารและพัฒนา",
            component: <O24 />,
          },
          {
            key: "25",
            title: "O25 รายงานผลการพัฒนาทรัพยากรบุคคล",
            component: <O25 />,
          },
        ],
      },
      {
        id: "9.5",
        title: "ตัวชี้วัดย่อยที่ 9.5",
        subtitle: "การส่งเสริมความโปร่งใสในสถานศึกษา (O26 - O29)",
        items: [
          {
            key: "26",
            title: "O26 การจัดการร้องเรียนการทุจริต",
            component: <O26 />,
          },
          {
            key: "27",
            title: "O27 ช่องทางแจ้งเรื่องร้องเรียนการทุจริต",
            component: <O27 />,
          },
          {
            key: "28",
            title: "O28 ข้อมูลเชิงสถิติเรื่องร้องเรียน",
            component: <O28 />,
          },
          {
            key: "29",
            title: "O29 การเปิดโอกาสให้เกิดการมีส่วนร่วม",
            component: <O29 />,
          },
        ],
      },
      {
        id: "10.1",
        title: "ตัวชี้วัดย่อยที่ 10.1",
        subtitle: "การดำเนินการเพื่อป้องกันทุจริต (O30 - O35)",
        items: [
          { key: "30", title: "O30 นโยบาย No Gift Policy", component: <O30 /> },
          {
            key: "31",
            title: "O31 การมีส่วนร่วมของผู้บริหาร",
            component: <O31 />,
          },
          {
            key: "32",
            title: "O32 การประเมินผลควบคุมภายใน",
            component: <O32 />,
          },
          {
            key: "33",
            title: "O33 การเสริมสร้างวัฒนธรรมองค์กร",
            component: <O33 />,
          },
          {
            key: "34",
            title: "O34 โครงการป้องกันการทุจริต",
            component: <O34 />,
          },
          {
            key: "35",
            title: "O35 รายงานผลการป้องกันการทุจริต",
            component: <O35 />,
          },
        ],
      },
      {
        id: "10.2",
        title: "ตัวชี้วัดย่อยที่ 10.2",
        subtitle: "มาตรการภายในเพื่อป้องกันการทุจริต (O36 - O37)",
        items: [
          {
            key: "36",
            title: "O36 มาตรการส่งเสริมความโปร่งใส",
            component: <O36 />,
          },
          {
            key: "37",
            title: "O37 การดําเนินการตามมาตรการ",
            component: <O37 />,
          },
        ],
      },
    ],
    [],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans">
      <BackgroundDecor />
      {/* Header Section */}
      <div className="relative z-10 border-b backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              {
                href: "/",
                title: (
                  <>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      <HomeOutlined className="text-blue-500" />
                    </span>
                  </>
                ),
              },
              {
                href: "/pressrelease/2568/press6809",
                title: (
                  <>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      <UserOutlined /> Application List
                    </span>
                  </>
                ),
              },
              {
                title: (
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    ITA Assessment
                  </span>
                ),
              },
            ]}
            className="text-sm font-medium"
          />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto mb-12 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-2 text-sm font-semibold text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800"
          >
            <SafetyCertificateOutlined /> ITA 2568 : วิทยาลัยเทคนิคกันทรลักษ์
          </motion.div>
          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-800 drop-shadow-sm md:text-6xl lg:text-7xl dark:text-white">
            <span className="bg-linear-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-teal-300 dark:to-blue-500">
              Integrity & Transparency
            </span>
            <br />
            Assessment
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-medium text-slate-600 md:text-xl dark:text-slate-300">
            {Description[0]?.description}
          </p>
        </div>
        {/* Main CTA Card */}
        <div className="mx-auto mb-16 max-w-4xl">
          <MainDownloadCard />
        </div>
        {/* --- Info Cards Section (Modern Layout) --- */}
        <div className="mx-auto mb-24 max-w-5xl space-y-8">
          {/* 1. What is ITA Card (Card แนวนอน เน้น Logo และเนื้อหา) */}
          <Card className="group overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-blue-900/10 dark:border-slate-700 dark:bg-slate-800/80">
            <CardBody className="relative flex flex-col items-center justify-between gap-8 p-8 md:flex-row md:p-12">
              {/* Background Decor */}

              {/* Logo Section */}
              <div className="relative z-10 shrink-0 transform transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2">
                <div className="">
                  <img
                    src="/images/ita/ita.webp"
                    alt="ITA Logo"
                    className="h-auto w-60 object-contain md:w-60"
                  />
                </div>
              </div>

              {/* Text Section */}
              <div className="relative z-10 grow text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                  <span>About ITA</span>
                </div>
                <h3 className="mb-4 text-3xl font-extrabold text-slate-800 dark:text-white">
                  ITA คืออะไร?
                </h3>
                <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                  การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ
                  (OIT)
                </p>
                <p className="mt-2 text-base font-normal text-slate-500 dark:text-slate-400">
                  เพื่อยกระดับธรรมาภิบาล เปิดเผยข้อมูลสู่สาธารณะ
                  และสร้างความเชื่อมั่นต่อประชาชนอย่างยั่งยืน
                </p>
              </div>
            </CardBody>
          </Card>

          {/* 2. Date & Gallery Card (Card รูปภาพขนาดใหญ่) */}
          <Card className=" ">
            <CardBody className="">
              {ImageItem.map(
                (item, idx) =>
                  item && (
                    <motion.div key={idx} className=" ">
                      <Image
                        isBlurred
                        removeWrapper
                        src={item.imgs}
                        className="rounded-3xl"
                      />
                    </motion.div>
                  ),
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Main Content Content: The List */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400">
              <AppstoreOutlined style={{ fontSize: "24px" }} />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            เอกสารประกอบการประเมิน (OIT)
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400">
            ข้อมูลสาธารณะตามตัวชี้วัด เพื่อความโปร่งใสและตรวจสอบได้
          </p>
        </div>

        <div className="space-y-6">
          {topicGroups.map((group, index) => (
            <CategorySection key={group.id} group={group} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
