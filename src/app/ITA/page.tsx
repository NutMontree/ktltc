"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Accordion, AccordionItem, Chip, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { Image } from "@heroui/react";
import {
  FilePdfOutlined,
  AppstoreOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { LinkPreview } from "@/components/ui/link-preview";

// Imports O1 - O37 (Keep existing imports)
import O1_68 from "./2568/01/page";
import O1_69 from "./2569/01/page";
import O2_68 from "./2568/02/page";
import O2_69 from "./2568/02/page";
import O3_68 from "./2568/03/page";
import O3_69 from "./2568/03/page";
import O4_68 from "./2568/04/page";
import O4_69 from "./2568/04/page";
import O5_68 from "./2568/05/page";
import O5_69 from "./2568/05/page";
import O6_68 from "./2568/06/page";
import O6_69 from "./2568/06/page";
import O7_68 from "./2568/07/page";
import O7_69 from "./2568/07/page";
import O8_68 from "./2568/08/page";
import O8_69 from "./2568/08/page";
import O9_68 from "./2568/09/page";
import O9_69 from "./2568/09/page";
import O10_68 from "./2568/010/page";
import O10_69 from "./2568/010/page";
import O11_68 from "./2568/011/page";
import O11_69 from "./2568/011/page";
import O12_68 from "./2568/012/page";
import O12_69 from "./2568/012/page";
import O13_68 from "./2568/013/page";
import O13_69 from "./2568/013/page";
import O14_68 from "./2568/014/page";
import O14_69 from "./2568/014/page";
import O15_68 from "./2568/015/page";
import O15_69 from "./2568/015/page";
import O16_68 from "./2568/016/page";
import O16_69 from "./2568/016/page";
import O17_68 from "./2568/017/page";
import O17_69 from "./2568/017/page";
import O18_68 from "./2568/018/page";
import O18_69 from "./2568/018/page";
import O19_68 from "./2568/019/page";
import O19_69 from "./2568/019/page";
import O20_68 from "./2568/020/page";
import O20_69 from "./2568/020/page";
import O21_68 from "./2568/021/page";
import O21_69 from "./2568/021/page";
import O22_68 from "./2568/022/page";
import O22_69 from "./2568/022/page";
import O23_68 from "./2568/023/page";
import O23_69 from "./2568/023/page";
import O24_68 from "./2568/024/page";
import O24_69 from "./2568/024/page";
import O25_68 from "./2568/025/page";
import O25_69 from "./2568/025/page";
import O26_68 from "./2568/026/page";
import O26_69 from "./2568/026/page";
import O27_68 from "./2568/027/page";
import O27_69 from "./2568/027/page";
import O28_68 from "./2568/028/page";
import O28_69 from "./2568/028/page";
import O29_68 from "./2568/029/page";
import O29_69 from "./2568/029/page";
import O30_68 from "./2568/030/page";
import O30_69 from "./2568/030/page";
import O31_68 from "./2568/031/page";
import O31_69 from "./2568/031/page";
import O32_68 from "./2568/032/page";
import O32_69 from "./2568/032/page";
import O33_68 from "./2568/033/page";
import O33_69 from "./2568/033/page";
import O34_68 from "./2568/034/page";
import O34_69 from "./2568/034/page";
import O35_68 from "./2568/035/page";
import O35_69 from "./2568/035/page";
import O36_68 from "./2568/036/page";
import O36_69 from "./2568/036/page";
import O37_68 from "./2568/037/page";
import O37_69 from "./2568/037/page";

// --- DATA CONSTANTS ---
export const DataPressrelease = {
  Item: [{ title: `ข่าวประชาสัมพันธ์` }, { title: `วิทยาลัยเทคนิคกันทรลักษ์` }],
};

export const DataDate = [{ date: `10 พฤศจิกายน 2568` }];

export const Description = [
  { description: `วิทยาลัยเทคนิคกันทรลักษ์` },
  {
    description: `      นำโดย นางสาวทักษิณา ชมจันทร์ ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์ พร้อมด้วยคณะผู้บริหาร ครู บุคลากรทางการศึกษา นักเรียน และนักศึกษา`,
  },
  {
    description: `        สถานศึกษา วิทยาลัยเทคนิคกันทรลักษ์ ได้รับผลการประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ (Integrity and Transparency Assessment Online : ITA) ประจำปีงบประมาณ พ.ศ. 2568`,
  },
  {
    description: `         โดยมีผลคะแนนรวม 90.77 คะแนน ซึ่งอยู่ในเกณฑ์ผลการประเมินระดับ “ผ่านดี”`,
  },
  {
    description: `          ถือเป็นความภาคภูมิใจของวิทยาลัยฯ และสะท้อนถึงการบริหารจัดการที่โปร่งใส ตรวจสอบได้ รวมถึงความร่วมมือของทุกภาคส่วนในสถานศึกษา`,
  },
];

export const TageLink = [
  {
    tage: ``,
    href: ``,
  },
];

export const ImageItem = [{ imgs: "/images/pressrelease/2568/november/11/00.webp" }];

// --- Styled Components & Assets ---
const BackgroundDecor = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div className="absolute top-[-20%] left-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-600/10 blur-[120px] dark:bg-blue-500/10" />
    <div className="absolute right-[-10%] bottom-[-20%] h-[60vw] w-[60vw] rounded-full bg-teal-500/10 blur-[150px] dark:bg-teal-400/10" />
    <div className="absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-repeat opacity-[0.03] dark:opacity-[0.05]" />
  </div>
);

const MainDownloadCard = ({ year }: { year: string }) => {
  return (
    <div className="px-2">
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
              รายงานผลการประเมิน ITA {year}
            </h3>
            <p className="mb-4 leading-relaxed text-slate-600 dark:text-slate-300">
              ดาวน์โหลดเอกสารสรุปผลการประเมินคุณธรรมและความโปร่งใส {year} (ฉบับทางการ)
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {TageLink.map((item: { tage: string; href: string }, idx: number) =>
                item.tage ? (
                  <Link key={idx} href={item.href} target="_blank">
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="cursor-pointer font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      {item.tage}
                    </Chip>
                  </Link>
                ) : null,
              )}
            </div>
          </div>

          
          <div className="shrink-0">
            <Link
              href={year === "2568" ? "/pdf/ITA/2568/ผลประเมินITA2568.pdf" : "#"}
              target="_blank"
              download
            >
              <Button
                size="lg"
                className="border-0 bg-linear-to-r from-blue-600 to-teal-500 font-semibold text-white shadow-md hover:from-blue-700 hover:to-teal-600"
                endContent={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                }
              >
                Download PDF {year}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CategorySection = ({ group, index, dbItems }: { group: any; index: number; dbItems: any[] }) => {
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
        <CardHeader className="flex items-center gap-4 p-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-sm transition-all duration-300 group-hover:shadow-md ${isExpanded ? "scale-110 from-blue-500 to-teal-400 text-white" : "from-blue-100 to-teal-50 text-blue-600 dark:from-blue-900/30 dark:to-teal-900/30 dark:text-blue-400"}`}
          >
            <AppstoreOutlined style={{ fontSize: "24px" }} />
          </div>
          <div className="grow text-left">
            <div className="mb-1 text-sm font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
              {group.title}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{group.subtitle}</h3>
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
                  title: "font-semibold text-slate-700 dark:text-slate-200 text-base",
                  subtitle: "text-slate-400 text-sm",
                  indicator: "text-blue-500 data-[open=true]:rotate-180",
                  content: "text-slate-600 dark:text-slate-400 pt-0 pb-4 px-2",
                  trigger:
                    "px-2 py-3 data-[hover=true]:bg-slate-50 dark:data-[hover=true]:bg-slate-700/50 rounded-xl transition-colors",
                }}
              >
                {group.items.map((item: any) => {
                  const oitCode = `O${item.key}`;
                  const dbEntry = dbItems?.find((d) => d.oitCode === oitCode);

                  return (
                    <AccordionItem
                      key={item.key}
                      aria-label={item.title}
                      startContent={
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-xs font-bold text-blue-600 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300">
                          {item.key}
                        </div>
                      }
                      title={<span>{item.title.substring(item.title.indexOf(" ") + 1)}</span>}
                      subtitle={item.note}
                    >
                      <div className="rounded-xl border border-slate-100/50 bg-slate-50 p-4 md:p-6 dark:border-slate-800/50 dark:bg-slate-900/50 font-medium">
                        {dbEntry ? (
                          <>
                            {dbEntry.description && (
                              <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400 leading-relaxed">
                                {dbEntry.description.split("\n").map((line: string, idx: number) => (
                                  <p key={idx}>{line}</p>
                                ))}
                              </div>
                            )}

                            {/* Image attachments gallery */}
                            {dbEntry.links && dbEntry.links.filter((l: any) => /\.(jpe?g|png|gif|webp|svg|bmp)(?:\?.*)?$/i.test(l.url)).length > 0 && (
                              <div className="mb-6">
                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                                  หลักฐานภาพถ่ายเชิงประจักษ์ (Visual Evidence)
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {dbEntry.links
                                    .filter((l: any) => /\.(jpe?g|png|gif|webp|svg|bmp)(?:\?.*)?$/i.test(l.url))
                                    .map((link: any, idx: number) => (
                                      <div key={idx} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                                        <div className="overflow-hidden aspect-video relative flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                                          <Image
                                            isBlurred
                                            removeWrapper
                                            src={link.url}
                                            alt={link.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                          />
                                        </div>
                                        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2">
                                            {link.name}
                                          </span>
                                          <Link href={link.url} target="_blank">
                                            <button className="shrink-0 p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer">
                                              เต็มจอ <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </button>
                                          </Link>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {/* Document & other links */}
                            {dbEntry.links && dbEntry.links.filter((l: any) => !/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?.*)?$/i.test(l.url)).length > 0 && (
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3">
                                  เอกสารแนบและแหล่งข้อมูล (References & PDFs)
                                </p>
                                <div className="space-y-3.5">
                                  {dbEntry.links
                                    .filter((l: any) => !/\.(jpe?g|png|gif|webp|svg|bmp)(?:\?.*)?$/i.test(l.url))
                                    .map((link: any, idx: number) => {
                                      const isPdf = link.url?.toLowerCase().endsWith(".pdf") || link.name?.toLowerCase().includes("pdf");
                                      return (
                                        <div key={idx} className="flex items-center gap-3.5 py-1">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-500">
                                            {isPdf ? (
                                              <FilePdfOutlined className="text-rose-500" style={{ fontSize: "16px" }} />
                                            ) : (
                                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                              </svg>
                                            )}
                                          </div>
                                          <LinkPreview url={link.url}>
                                            <p className="inline-block text-sm text-slate-700 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 font-bold transition-colors cursor-pointer">
                                              {link.name}
                                            </p>
                                          </LinkPreview>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          item.component
                        )}
                      </div>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ITA() {
  const [selectedYear, setSelectedYear] = useState("2568");
  const [dbItems, setDbItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOITData() {
      try {
        const res = await fetch(`/api/ita?year=${selectedYear}&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setDbItems(data);
        }
      } catch (err) {
        console.error("Failed to fetch OIT data:", err);
      }
    }
    fetchOITData();
  }, [selectedYear]);

  const topicGroups = useMemo(() => {
    const yearPrefix = selectedYear;
    return [
      {
        id: "9.1",
        title: `ตัวชี้วัดย่อยที่ 9.1 (${yearPrefix})`,
        subtitle: "ข้อมูลพื้นฐาน (O1 - O6)",
        items: [
          {
            key: "1",
            title: "O1 โครงสร้าง",
            component: selectedYear === "2569" ? <O1_69 /> : <O1_68 />,
          },
          {
            key: "2",
            title: "O2 ข้อมูลผู้บริหาร",
            component: selectedYear === "2569" ? <O2_69 /> : <O2_68 />,
          },
          {
            key: "3",
            title: "O3 อำนาจหน้าที่",
            component: selectedYear === "2569" ? <O3_69 /> : <O3_68 />,
          },
          {
            key: "4",
            title: "O4 แผนพัฒนาสถานศึกษา",
            component: selectedYear === "2569" ? <O4_69 /> : <O4_68 />,
          },
          {
            key: "5",
            title: "O5 ข้อมูลการติดต่อ",
            component: selectedYear === "2569" ? <O5_69 /> : <O5_68 />,
          },
          {
            key: "6",
            title: "O6 กฎหมายที่เกี่ยวข้อง",
            component: selectedYear === "2569" ? <O6_69 /> : <O6_68 />,
          },
        ],
      },
      {
        id: "9.2",
        title: `ตัวชี้วัดย่อยที่ 9.2 (${yearPrefix})`,
        subtitle: "การบริหารงาน (O7 - O16)",
        items: [
          {
            key: "7",
            title: "O7 ข่าวประชาสัมพันธ์",
            component: selectedYear === "2569" ? <O7_69 /> : <O7_68 />,
          },
          {
            key: "8",
            title: "O8 Q&A",
            component: selectedYear === "2569" ? <O8_69 /> : <O8_68 />,
            note: "ช่องทางสื่อสารสองทาง เช่น Web board, Messenger Live Chat",
          },
          {
            key: "9",
            title: "O9 Social Network",
            component: selectedYear === "2569" ? <O9_69 /> : <O9_68 />,
          },
          {
            key: "10",
            title: "O10 แผนดำเนินงานประจำปี",
            component: selectedYear === "2569" ? <O10_69 /> : <O10_68 />,
          },
          {
            key: "11",
            title: "O11 รายงานผลการดําเนินงานประจําปี",
            component: selectedYear === "2569" ? <O11_69 /> : <O11_68 />,
          },
          {
            key: "12",
            title: "O12 คู่มือหรือมาตรฐานการปฏิบัติงาน",
            component: selectedYear === "2569" ? <O12_69 /> : <O12_68 />,
          },
          {
            key: "13",
            title: "O13 คู่มือหรือมาตรฐานการให้บริการ",
            component: selectedYear === "2569" ? <O13_69 /> : <O13_68 />,
          },
          {
            key: "14",
            title: "O14 ข้อมูลเชิงสถิติการให้บริการ",
            component: selectedYear === "2569" ? <O14_69 /> : <O14_68 />,
          },
          {
            key: "15",
            title: "O15 รายงานผลการสํารวจความพึงพอใจ",
            component: selectedYear === "2569" ? <O15_69 /> : <O15_68 />,
          },
          {
            key: "16",
            title: "O16 E-Service",
            component: selectedYear === "2569" ? <O16_69 /> : <O16_68 />,
          },
        ],
      },
      {
        id: "9.3",
        title: `ตัวชี้วัดย่อยที่ 9.3 (${yearPrefix})`,
        subtitle: "การบริหารเงินงบประมาณ (O17 - O22)",
        items: [
          {
            key: "17",
            title: "O17 แผนการใช้จ่ายงบประมาณประจําปี",
            component: selectedYear === "2569" ? <O17_69 /> : <O17_68 />,
          },
          {
            key: "18",
            title: "O18 ผลการใช้จ่ายงบประมาณประจําปี",
            component: selectedYear === "2569" ? <O18_69 /> : <O18_68 />,
          },
          {
            key: "19",
            title: "O19 แผนการจัดซื้อจัดจ้าง/จัดหาพัสดุ",
            component: selectedYear === "2569" ? <O19_69 /> : <O19_68 />,
          },
          {
            key: "20",
            title: "O20 ประกาศต่าง ๆ เกี่ยวกับการจัดซื้อจัดจ้าง",
            component: selectedYear === "2569" ? <O20_69 /> : <O20_68 />,
          },
          {
            key: "21",
            title: "O21 สรุปผลการจัดซื้อจัดจ้างรายเดือน",
            component: selectedYear === "2569" ? <O21_69 /> : <O21_68 />,
          },
          {
            key: "22",
            title: "O22 แผนการจัดซื้อจัดจ้าง/จัดหาพัสดุ",
            component: selectedYear === "2569" ? <O22_69 /> : <O22_68 />,
          },
        ],
      },
      {
        id: "9.4",
        title: `ตัวชี้วัดย่อยที่ 9.4 (${yearPrefix})`,
        subtitle: "การบริหารและพัฒนาทรัพยากรบุคคล (O23 - O25)",
        items: [
          {
            key: "23",
            title: "O23 การพัฒนาทรัพยากรบุคคล",
            component: selectedYear === "2569" ? <O23_69 /> : <O23_68 />,
          },
          {
            key: "24",
            title: "O24 หลักเกณฑ์การบริหารและพัฒนา",
            component: selectedYear === "2569" ? <O24_69 /> : <O24_68 />,
          },
          {
            key: "25",
            title: "O25 รายงานผลการพัฒนาทรัพยากรบุคคล",
            component: selectedYear === "2569" ? <O25_69 /> : <O25_68 />,
          },
        ],
      },
      {
        id: "9.5",
        title: `ตัวชี้วัดย่อยที่ 9.5 (${yearPrefix})`,
        subtitle: "การส่งเสริมความโปร่งใสในสถานศึกษา (O26 - O29)",
        items: [
          {
            key: "26",
            title: "O26 การจัดการร้องเรียนการทุจริต",
            component: selectedYear === "2569" ? <O26_69 /> : <O26_68 />,
          },
          {
            key: "27",
            title: "O27 ช่องทางแจ้งเรื่องร้องเรียนการทุจริต",
            component: selectedYear === "2569" ? <O27_69 /> : <O27_68 />,
          },
          {
            key: "28",
            title: "O28 ข้อมูลเชิงสถิติเรื่องร้องเรียน",
            component: selectedYear === "2569" ? <O28_69 /> : <O28_68 />,
          },
          {
            key: "29",
            title: "O29 การเปิดโอกาสให้เกิดการมีส่วนร่วม",
            component: selectedYear === "2569" ? <O29_69 /> : <O29_68 />,
          },
        ],
      },
      {
        id: "10.1",
        title: `ตัวชี้วัดย่อยที่ 10.1 (${yearPrefix})`,
        subtitle: "การดำเนินการเพื่อป้องกันทุจริต (O30 - O35)",
        items: [
          {
            key: "30",
            title: "O30 นโยบาย No Gift Policy",
            component: selectedYear === "2569" ? <O30_69 /> : <O30_68 />,
          },
          {
            key: "31",
            title: "O31 การมีส่วนร่วมของผู้บริหาร",
            component: selectedYear === "2569" ? <O31_69 /> : <O31_68 />,
          },
          {
            key: "32",
            title: "O32 การประเมินผลควบคุมภายใน",
            component: selectedYear === "2569" ? <O32_69 /> : <O32_68 />,
          },
          {
            key: "33",
            title: "O33 การเสริมสร้างวัฒนธรรมองค์กร",
            component: selectedYear === "2569" ? <O33_69 /> : <O33_68 />,
          },
          {
            key: "34",
            title: "O34 โครงการป้องกันการทุจริต",
            component: selectedYear === "2569" ? <O34_69 /> : <O34_68 />,
          },
          {
            key: "35",
            title: "O35 รายงานผลการป้องกันการทุจริต",
            component: selectedYear === "2569" ? <O35_69 /> : <O35_68 />,
          },
        ],
      },
      {
        id: "10.2",
        title: `ตัวชี้วัดย่อยที่ 10.2 (${yearPrefix})`,
        subtitle: "มาตรการภายในเพื่อป้องกันการทุจริต (O36 - O37)",
        items: [
          {
            key: "36",
            title: "O36 มาตรการส่งเสริมความโปร่งใส",
            component: selectedYear === "2569" ? <O36_69 /> : <O36_68 />,
          },
          {
            key: "37",
            title: "O37 การดําเนินการตามมาตรการ",
            component: selectedYear === "2569" ? <O37_69 /> : <O37_68 />,
          },
        ],
      },
    ];
  }, [selectedYear]);

  return (
    <div className="relative max-w-[1600px] mx-auto overflow-x-hidden font-sans">
      <BackgroundDecor />

      {/* Hero Content */}
      <div className="relative z-10 py-12 md:py-20">
        <div className="mx-auto mb-12 max-w-5xl text-center px-4">
          {/* --- Year Selector (มองเห็นได้ง่ายขึ้น) --- */}
          <div className="mb-10 flex flex-col items-center gap-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CalendarOutlined /> เลือกปีงบประมาณ
            </span>
            <div className="inline-flex p-1.5 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl dark:bg-slate-900/50 dark:border-slate-700">
              {["2568", "2569"].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative px-8 py-3 rounded-xl text-lg font-black transition-all duration-500 ${
                    selectedYear === year
                      ? "text-white shadow-2xl scale-105"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  {selectedYear === year && (
                    <motion.div
                      layoutId="activeYear"
                      className="absolute inset-0 bg-linear-to-r from-blue-600 to-teal-500 rounded-xl -z-10 shadow-lg shadow-blue-500/40"
                    />
                  )}
                  ปี {year}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={selectedYear + "cert"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-4 py-2 text-sm font-bold text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800"
          >
            <SafetyCertificateOutlined /> ITA {selectedYear} : วิทยาลัยเทคนิคกันทรลักษ์
          </motion.div>

          <h1 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-800 drop-shadow-sm md:text-6xl lg:text-7xl dark:text-white">
            <span className="bg-linear-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent">
              Integrity & Transparency
            </span>
            <br />
            Assessment {selectedYear}
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed font-medium text-slate-600 md:text-xl dark:text-slate-300">
            {Description[0]?.description} {selectedYear === "2569" && "(ข้อมูลปีปัจจุบัน)"}
          </p>
        </div>

        {/* Main CTA Card */}
        {selectedYear === "2568" && (
          <div className="mx-auto mb-16 max-w-[1600px]">
            <MainDownloadCard year={selectedYear} />
          </div>
        )}

        {/* Info Cards Section */}
        <div className="mx-auto mb-24 max-w-5xl space-y-8 px-4">
          <Card className="group overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/80 shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all hover:shadow-2xl hover:shadow-blue-900/10 dark:border-slate-700 dark:bg-slate-800/80">
            <CardBody className="relative flex flex-col items-center justify-between gap-8 p-8 md:flex-row">
              <div className="relative z-10 shrink-0 transform transition-transform duration-700 group-hover:scale-105 group-hover:rotate-2">
                <img
                  src="/images/ita/ita.webp"
                  alt="ITA Logo"
                  className="h-auto w-60 object-contain"
                />
              </div>
              <div className="relative z-10 grow text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                  <span>About ITA {selectedYear}</span>
                </div>
                <h3 className="mb-4 text-3xl font-extrabold text-slate-800 dark:text-white">
                  ITA คืออะไร?
                </h3>
                <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-slate-300">
                  การประเมินคุณธรรมและความโปร่งใสในการดำเนินงานของหน่วยงานภาครัฐ (OIT)
                  ประจำปีงบประมาณ {selectedYear}
                </p>
                <p className="mt-2 text-base font-normal text-slate-500 dark:text-slate-400">
                  เพื่อยกระดับธรรมาภิบาล เปิดเผยข้อมูลสู่สาธารณะ
                  และสร้างความเชื่อมั่นต่อประชาชนอย่างยั่งยืน
                </p>
              </div>
            </CardBody>
          </Card>

          {selectedYear === "2568" && (
            <Card className="overflow-hidden rounded-3xl">
              <CardBody className="p-0">
                {ImageItem.map(
                  (item: { imgs: string }, idx: number) =>
                    item && (
                      <motion.div key={idx}>
                        <Image
                          isBlurred
                          removeWrapper
                          src={item.imgs}
                          className="w-full h-auto"
                          alt={`image-${idx}`}
                        />
                      </motion.div>
                    ),
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* List Section */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 pb-20">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm dark:bg-blue-900/30 dark:text-blue-400">
              <AppstoreOutlined style={{ fontSize: "28px" }} />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-800 md:text-4xl dark:text-white">
            เอกสารประกอบการประเมิน (OIT) {selectedYear}
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-400">
            ข้อมูลสาธารณะตามตัวชี้วัด เพื่อความโปร่งใสและตรวจสอบได้ของปีงบประมาณ {selectedYear}
          </p>
        </div>

        <div className="space-y-6">
          {topicGroups.map((group, index) => (
            <CategorySection key={`${selectedYear}-${group.id}`} group={group} index={index} dbItems={dbItems} />
          ))}
        </div>
      </div>
    </div>
  );
}
