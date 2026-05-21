"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Data, Data1, DataCommittee } from "./data";
import {
  User,
  Users,
  Award,
  ShieldCheck,
  Briefcase,
  Layers,
  Star,
  MapPin,
  Building2,
  BookOpen,
  X,
  History,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";

interface ExeItem {
  title: string;
  secondary: string;
  description: string;
  img: string;
  role?: string;
  positionNumber?: string;
  affiliation?: string;
  department?: string;
  faction?: string;
  respDeptHead?: string;
  respWorkHead?: string;
  respOther?: string;
  phone?: string;
  email?: string;
  lineId?: string;
}

export default function EDUAdmin() {
  const [boardData, setBoardData] = useState<ExeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExec, setSelectedExec] = useState<ExeItem | null>(null);
  const [activeTab, setActiveTab] = useState<"current" | "committee" | "former">("current");

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const executives = (data.users || [])
            .filter((u: any) => u.role === "director" || String(u.role).startsWith("deputy"))
            .map((u: any) => ({
              title: u.name || "ไม่ระบุชื่อ",
              secondary: u.position || "ผู้บริหาร",
              description: u.description || "",
              img: u.image || "",
              role: u.role,
              positionNumber: u.positionNumber || "",
              affiliation: u.affiliation || "",
              department: u.department || "",
              faction: u.faction || "",
              respDeptHead: u.respDeptHead || "",
              respWorkHead: u.respWorkHead || "",
              respOther: u.respOther || "",
              phone: u.phone || "",
              email: u.email || "",
              lineId: u.lineId || "",
            }));
          setBoardData(executives);
        }
      } catch (error) {
        console.error("Failed to fetch executives", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutives();
  }, []);

  // หาผู้อำนวยการจาก DB
  const directorFromDb = boardData.find((b) => b.role === "director");
  const director = directorFromDb || {
    title: "นางสาวทักษิณา ชมจันทร์",
    secondary: "ผู้อำนวยการวิทยาลัยเทคนิคกันทรลักษ์",
    description: "ดำรงตำแหน่งตั้งแต่ พ.ศ. 2566 - ปัจจุบัน",
    img: "/images/ผู้บริหาร/1.webp",
    phone: "045-810-777",
    email: "director@ktltc.ac.th",
    lineId: "director_line",
  };

  // หารองผู้อำนวยการจาก DB
  const deputiesFromDb = boardData.filter((b) => b.role !== "director");
  const deputies = deputiesFromDb.length > 0 ? deputiesFromDb : Data1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[500px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">กำลังโหลดข้อมูลคณะผู้บริหาร...</p>
      </div>
    );
  }

  // Animation Variants
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative w-full overflow-hidden px-24 bg-slate-50/50 py-20 font-sans text-slate-800 dark:bg-neutral-950/40 dark:text-slate-200">
      {/* Decorative Grid and Ambient Lights */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />
      <div className="pointer-events-none absolute top-80 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-yellow-500/10 blur-[140px] dark:bg-yellow-500/5" />
      <div className="container mx-auto max-w-[1400px] px-4 relative z-10">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 shadow-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
            <Users className="w-3.5 h-3.5 text-amber-500" /> ทำเนียบผู้บริหาร
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white">
            ทำเนียบ
            <span className="bg-linear-to-r from-amber-600 via-yellow-500 to-amber-500 bg-clip-text text-transparent ml-2 font-black">
              คณะผู้บริหาร
            </span>
          </h1>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-linear-to-r from-amber-500 to-yellow-400" />
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 font-medium">
            ผู้นำที่มีวิสัยทัศน์
            มุ่งมั่นพัฒนาวิทยาลัยเทคนิคกันทรลักษ์สู่ความเป็นเลิศทางการอาชีวศึกษา
          </p>
        </motion.div>

        {/* --- Tabs Navigation --- */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex rounded-full border border-slate-200/60 bg-white/60 p-1 shadow-sm backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 overflow-x-auto max-w-full hide-scrollbar">
            {[
              { id: "current", label: "คณะผู้บริหารปัจจุบัน", icon: <Award className="w-4 h-4" /> },
              {
                id: "committee",
                label: "คณะกรรมการสถานศึกษา",
                icon: <Users className="w-4 h-4" />,
              },
              { id: "former", label: "อดีตผู้บริหาร", icon: <History className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black transition-colors duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-full bg-linear-to-r from-amber-600 to-yellow-500 shadow-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Content Area --- */}
        <AnimatePresence mode="wait">
          {activeTab === "current" && (
            <motion.div
              key="current"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* ผู้อำนวยการ */}
              <motion.div variants={itemVariants} className="mb-24 flex justify-center">
                <div
                  className="relative w-full max-w-3xl cursor-pointer group"
                  onClick={() => setSelectedExec(director as ExeItem)}
                >
                  {/* Glow Effect Behind */}
                  <div className="absolute -inset-1.5 rounded-[40px] bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-20 blur-xl transition-all duration-700 group-hover:opacity-40 group-hover:scale-105" />

                  <div className="relative flex flex-col md:flex-row items-center gap-10 overflow-hidden rounded-[36px] border border-white/80 bg-white/80 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-300">
                    {/* Visual Accent Lines */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500" />

                    <div className="absolute right-6 top-6 text-amber-500/10 dark:text-amber-500/5">
                      <Star className="w-32 h-32 stroke-[1]" />
                    </div>

                    {/* Image */}
                    <div className="relative shrink-0 z-10">
                      <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-500 opacity-70 blur-[2px] group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex h-[320px] w-[240px] overflow-hidden rounded-[24px] border-4 border-white shadow-xl dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800">
                        {director.img ? (
                          <img
                            src={director.img}
                            alt={director.title}
                            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="w-20 h-20 text-slate-300 dark:text-zinc-700" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left z-10">
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 px-4 py-1.5 mb-4 border border-amber-100 dark:border-amber-900/50">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">
                          ผู้อำนวยการสถานศึกษา
                        </span>
                      </div>

                      <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                        {director.title}
                      </h2>

                      <p className="mt-3 text-lg font-bold text-slate-600 dark:text-slate-300">
                        {director.secondary}
                      </p>

                      {((director as ExeItem).affiliation ||
                        (director as ExeItem).positionNumber) && (
                        <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                          {(director as ExeItem).affiliation && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-neutral-700/50">
                              <Building2 className="w-3.5 h-3.5" />{" "}
                              {(director as ExeItem).affiliation}
                            </span>
                          )}
                          {(director as ExeItem).positionNumber && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-neutral-700/50">
                              <ShieldCheck className="w-3.5 h-3.5" /> เลขที่ตำแหน่ง:{" "}
                              {(director as ExeItem).positionNumber}
                            </span>
                          )}
                        </div>
                      )}

                      {director.description && (
                        <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                          {director.description}
                        </p>
                      )}

                      {/* Contact Info (Direct Channels) */}
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 justify-center md:justify-start">
                        {director.phone && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-neutral-800">
                            <Phone className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold">โทร:</span>{" "}
                            <a href={`tel:${director.phone}`} className="hover:underline">
                              {director.phone}
                            </a>
                          </span>
                        )}
                        {director.email && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-neutral-800 max-w-[220px] truncate">
                            <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-bold">อีเมล:</span>{" "}
                            <span className="truncate">{director.email}</span>
                          </span>
                        )}
                        {director.lineId && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-neutral-800">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-bold">Line:</span> <span>{director.lineId}</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-6">
                        <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 group-hover:text-amber-600 transition-colors">
                          คลิกเพื่อดูประวัติและหน้าที่{" "}
                          <span className="text-lg leading-none">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* รองผู้อำนวยการ */}
              <div className="relative mb-12 max-w-6xl mx-auto">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200/80 dark:border-neutral-800/80"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-slate-50/90 dark:bg-neutral-950 px-6 text-sm font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 backdrop-blur-md rounded-full">
                    คณะรองผู้อำนวยการสถานศึกษา
                  </span>
                </div>
              </div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
              >
                {deputies.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -10 }}
                    className="group relative h-full cursor-pointer"
                    onClick={() => setSelectedExec(item as ExeItem)}
                  >
                    <div className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-lg transition-all duration-300 hover:border-amber-200 hover:shadow-xl dark:border-neutral-900/60 dark:bg-neutral-900/65 dark:hover:border-amber-950/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                      {/* Image Frame */}
                      <div className="relative h-[280px] w-full overflow-hidden bg-slate-100 dark:bg-neutral-800 border-b border-slate-100 dark:border-neutral-800">
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.title}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <User className="w-16 h-16 text-slate-300 dark:text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>

                      {/* Content */}
                      <div className="relative p-6 text-center">
                        {/* Floating Icon */}
                        <div className="absolute -top-8 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-50 shadow-md dark:border-neutral-900 dark:bg-neutral-800 transition-colors group-hover:border-amber-100 dark:group-hover:border-amber-900/50">
                          <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>

                        <div className="mt-6">
                          <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 leading-tight transition-colors">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs font-black text-amber-600 dark:text-amber-400">
                            {item.secondary}
                          </p>

                          <div className="mx-auto mt-4 h-0.5 w-12 rounded-full bg-slate-200 group-hover:bg-amber-400 dark:bg-neutral-800 transition-colors" />

                          {item.description && (
                            <p className="mt-4 line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                              {item.description}
                            </p>
                          )}

                          {/* Contact Info (Direct Channels) */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                            {item.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="font-bold">โทร:</span>{" "}
                                <a href={`tel:${item.phone}`} className="hover:underline">
                                  {item.phone}
                                </a>
                              </p>
                            )}
                            {item.email && (
                              <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="font-bold">อีเมล:</span>{" "}
                                <span className="truncate">{item.email}</span>
                              </p>
                            )}
                            {item.lineId && (
                              <p className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="font-bold">Line:</span> <span>{item.lineId}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "committee" && (
            <motion.div
              key="committee"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-7xl mx-auto"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {DataCommittee.map((member, index) => (
                  <motion.div key={index} whileHover={{ y: -8 }} className="group h-full">
                    <div className="relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-lg transition-all duration-300 hover:border-amber-200 hover:shadow-xl dark:border-neutral-900/60 dark:bg-neutral-900/65 dark:hover:border-amber-950/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                      <div className="flex flex-col items-center text-center h-full">
                        <div className="relative mb-5 h-56 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-inner dark:border-neutral-800 dark:bg-neutral-800/50">
                          {member.img && member.img !== "/images/error.webp" ? (
                            <img
                              src={member.img}
                              alt={member.title}
                              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <User className="w-12 h-12 text-slate-300 dark:text-zinc-600" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-800 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors leading-tight">
                          {member.title}
                        </h3>
                        <span className="mt-2 inline-block rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          {member.secondary}
                        </span>
                        {member.description && (
                          <p className="mt-3 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                            {member.description}
                          </p>
                        )}

                        {/* Contact Info (Direct Channels) */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800 w-full text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                          {member.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-bold">โทร:</span>{" "}
                              <a href={`tel:${member.phone}`} className="hover:underline">
                                {member.phone}
                              </a>
                            </p>
                          )}
                          {member.email && (
                            <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-bold">อีเมล:</span>{" "}
                              <span className="truncate">{member.email}</span>
                            </p>
                          )}
                          {member.lineId && (
                            <p className="flex items-center gap-2">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="font-bold">Line:</span> <span>{member.lineId}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "former" && (
            <motion.div
              key="former"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-4xl mx-auto"
            >
              <div className="relative border-l-2 border-slate-200 dark:border-neutral-800 ml-4 md:ml-0 md:border-l-0">
                {/* Center Line for Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-neutral-800 -translate-x-1/2" />

                {Data.map((former, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`relative flex items-center justify-between mb-12 md:mb-16 ${
                      index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                    } flex-col pl-8 md:pl-0`}
                  >
                    {/* Node Dot */}
                    <div className="absolute left-[-9px] md:left-1/2 md:-translate-x-1/2 top-6 w-4 h-4 rounded-full bg-white dark:bg-neutral-900 border-4 border-amber-500 shadow-md z-10" />

                    {/* Empty Space for alignment */}
                    <div className="hidden md:block w-[45%]" />

                    {/* Content Card */}
                    <div className="w-full md:w-[45%]">
                      <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-lg transition-all duration-300 hover:border-amber-200 hover:shadow-xl dark:border-neutral-900/60 dark:bg-neutral-900/65 dark:hover:border-amber-950/60 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        <div className="flex items-center gap-5">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-800">
                            {former.img && former.img !== "/images/error.webp" ? (
                              <img
                                src={former.img}
                                alt={former.title}
                                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <User className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-800 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400 transition-colors">
                              {former.title}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {former.secondary}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 border border-amber-100 dark:border-amber-900/50">
                              <History className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                {former.description}
                              </span>
                            </div>

                            {/* Contact Info (Direct Channels) */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-neutral-800 text-left text-xs space-y-1 text-slate-500 dark:text-slate-400">
                              {former.phone && (
                                <p className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                                  <a href={`tel:${former.phone}`} className="hover:underline">
                                    {former.phone}
                                  </a>
                                </p>
                              )}
                              {former.email && (
                                <p className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                  <Mail className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{former.email}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {selectedExec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
            onClick={() => setSelectedExec(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-2xl dark:bg-neutral-900 flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedExec(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors dark:bg-neutral-800/80 dark:text-slate-400 dark:hover:bg-neutral-700 dark:hover:text-white backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column (Photo & Title) */}
              <div className="relative w-full md:w-[40%] bg-slate-50 dark:bg-neutral-950 p-8 flex flex-col items-center justify-center shrink-0 border-r border-slate-100 dark:border-neutral-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 w-56 h-72 rounded-[24px] overflow-hidden shadow-2xl border-4 border-white dark:border-neutral-800 bg-white dark:bg-neutral-800 mb-8">
                  {selectedExec.img ? (
                    <img
                      src={selectedExec.img}
                      alt={selectedExec.title}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="w-20 h-20 text-slate-300 dark:text-zinc-600" />
                    </div>
                  )}
                </div>

                <div className="relative z-10 text-center w-full">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedExec.title}
                  </h2>
                  <div className="mt-3 mb-4 h-0.5 w-16 mx-auto rounded-full bg-linear-to-r from-amber-500 to-yellow-400" />
                  <span className="inline-block px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider">
                    {selectedExec.secondary}
                  </span>
                </div>
              </div>

              {/* Right Column (Details) */}
              <div className="w-full md:w-[60%] p-8 overflow-y-auto hide-scrollbar">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-neutral-800">
                  <BookOpen className="w-5 h-5 text-amber-500" /> ข้อมูลประวัติและหน้าที่
                </h3>

                <div className="space-y-6">
                  {/* ตำแหน่งและสังกัด */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> ตำแหน่งและสังกัด
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
                      <div className="bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                        <span className="text-[10px] text-slate-400 block mb-1">ตำแหน่งงาน</span>
                        <b className="text-sm text-slate-800 dark:text-slate-200">
                          {selectedExec.secondary || "-"}
                        </b>
                      </div>
                      {selectedExec.positionNumber && (
                        <div className="bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                          <span className="text-[10px] text-slate-400 block mb-1">
                            เลขที่ตำแหน่ง
                          </span>
                          <b className="text-sm text-slate-800 dark:text-slate-200">
                            {selectedExec.positionNumber}
                          </b>
                        </div>
                      )}
                      {selectedExec.affiliation && (
                        <div className="bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                          <span className="text-[10px] text-slate-400 block mb-1">สังกัด</span>
                          <b className="text-sm text-slate-800 dark:text-slate-200">
                            {selectedExec.affiliation}
                          </b>
                        </div>
                      )}
                      {selectedExec.department && (
                        <div className="bg-slate-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                          <span className="text-[10px] text-slate-400 block mb-1">แผนก/ฝ่าย</span>
                          <b className="text-sm text-slate-800 dark:text-slate-200">
                            {selectedExec.department}
                          </b>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* หน้าที่รับผิดชอบ */}
                  {(selectedExec.respDeptHead ||
                    selectedExec.respWorkHead ||
                    selectedExec.respOther) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4" /> หน้าที่รับผิดชอบ
                      </h4>
                      <div className="pl-6 space-y-3">
                        {selectedExec.respDeptHead && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-wider mb-1.5">
                              หัวหน้าแผนก / ฝ่าย
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {selectedExec.respDeptHead}
                            </p>
                          </div>
                        )}
                        {selectedExec.respWorkHead && (
                          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider mb-1.5">
                              หัวหน้างาน
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {selectedExec.respWorkHead}
                            </p>
                          </div>
                        )}
                        {selectedExec.respOther && (
                          <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-slate-100 dark:border-neutral-800">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1.5">
                              หน้าที่อื่นๆ
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                              {selectedExec.respOther}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ข้อมูลติดต่อ */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4" /> ช่องทางการติดต่อโดยตรง
                    </h4>
                    <div className="pl-6 space-y-3">
                      <div className="bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 space-y-2 text-sm">
                        {selectedExec.phone && (
                          <p className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">เบอร์โทรศัพท์:</span>
                            <a
                              href={`tel:${selectedExec.phone}`}
                              className="text-amber-600 font-bold hover:underline"
                            >
                              {selectedExec.phone}
                            </a>
                          </p>
                        )}
                        {selectedExec.email && (
                          <p className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">อีเมลติดต่อ:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedExec.email}
                            </span>
                          </p>
                        )}
                        {selectedExec.lineId && (
                          <p className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">Line ID:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedExec.lineId}
                            </span>
                          </p>
                        )}
                        {!selectedExec.phone && !selectedExec.email && !selectedExec.lineId && (
                          <p className="text-slate-400 italic text-xs">
                            ไม่ได้ระบุช่องทางการติดต่อ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ข้อมูลเพิ่มเติม */}
                  {selectedExec.description && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> ข้อมูลเพิ่มเติม
                      </h4>
                      <div className="pl-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-slate-100 dark:border-neutral-800">
                          {selectedExec.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
