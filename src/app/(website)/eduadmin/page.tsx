"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@heroui/image";
import { motion, AnimatePresence } from "framer-motion";
import { Data, Data1, DataCommittee } from "./data";
import {
  UserOutlined,
  StarFilled,
  TeamOutlined,
  IdcardOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  BookOutlined,
  CloseOutlined,
} from "@ant-design/icons";

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
}

export default function EDUAdmin() {
  const [boardData, setBoardData] = useState<ExeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExec, setSelectedExec] = useState<ExeItem | null>(null);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch("/api/users/all");
        if (res.ok) {
          const data = await res.json();
          const executives = (data.users || [])
            .filter(
              (u: any) =>
                u.role === "director" || String(u.role).startsWith("deputy"),
            )
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
  };

  // หารองผู้อำนวยการจาก DB
  const deputiesFromDb = boardData.filter((b) => b.role !== "director");
  const deputies = deputiesFromDb.length > 0 ? deputiesFromDb : Data1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 min-h-[500px]">
        <LoadingOutlined className="text-4xl text-[#DAA520] mb-4 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">
          กำลังโหลดข้อมูลคณะผู้บริหาร...
        </p>
      </div>
    );
  }

  return (
    <section className="relative max-w-[1600px] mx-auto overflow-hidden bg-slate-50 px-4 py-20 font-sans text-slate-800 dark:bg-neutral-950 dark:text-slate-200">
      {/* --- Ambient Background --- */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-yellow-500/10 blur-[100px]" />

      <div className="container mx-auto max-w-6xl">
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-sm font-semibold text-yellow-700 shadow-sm dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-500">
            <TeamOutlined /> คณะผู้บริหาร
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
            ทำเนียบ
            <span className="bg-linear-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
              ผู้บริหาร
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            ผู้นำที่มีวิสัยทัศน์
            มุ่งมั่นพัฒนาวิทยาลัยเทคนิคกันทรลักษ์สู่ความเป็นเลิศทางการอาชีวศึกษา
          </p>
        </motion.div>

        {/* --- ส่วนที่ 1: ผู้อำนวยการ (Hero Section) --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-24 flex justify-center"
        >
          <div
            className="relative w-full max-w-2xl cursor-pointer"
            onClick={() => setSelectedExec(director as ExeItem)}
          >
            {/* Glow Effect Behind */}
            <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-yellow-400 via-orange-300 to-yellow-400 opacity-30 blur-2xl transition duration-1000 group-hover:opacity-60"></div>

            <div className="relative overflow-hidden rounded-3xl border border-yellow-100 bg-white p-8 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 hover:shadow-yellow-200/30 transition-shadow duration-300">
              {/* Star Badge */}
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shadow-sm dark:bg-yellow-900/30 dark:text-yellow-500">
                <StarFilled style={{ fontSize: "20px" }} />
              </div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Image */}
                <div className="flex h-[300px] w-full md:w-[220px] shrink-0 justify-center overflow-hidden rounded-2xl shadow-lg ring-4 ring-yellow-50 dark:ring-neutral-800 bg-slate-50 dark:bg-zinc-800">
                  {director.img ? (
                    <Image
                      src={director.img}
                      alt={director.title}
                      className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                      width={220}
                      classNames={{
                        wrapper: "mx-auto w-full h-full",
                        img: "mx-auto",
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserOutlined className="text-8xl text-slate-300 dark:text-zinc-700" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {director.title}
                  </h2>
                  <div className="mt-2 h-1 w-16 rounded-full bg-yellow-500 mx-auto md:mx-0" />
                  <p className="mt-3 text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                    {director.secondary}
                  </p>
                  {(director as ExeItem).affiliation && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center md:justify-start">
                      <DatabaseOutlined className="text-yellow-500" />
                      {(director as ExeItem).affiliation}
                    </p>
                  )}
                  {(director as ExeItem).positionNumber && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 justify-center md:justify-start">
                      <SafetyCertificateOutlined />
                      เลขที่ตำแหน่ง: {(director as ExeItem).positionNumber}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {director.description}
                  </p>

                  {/* Responsibilities */}
                  {((director as ExeItem).respDeptHead || (director as ExeItem).respWorkHead || (director as ExeItem).respOther) && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-neutral-800 pt-4">
                      <p className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                        <BookOutlined /> หน้าที่รับผิดชอบ
                      </p>
                      {(director as ExeItem).respDeptHead && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">• {(director as ExeItem).respDeptHead}</p>
                      )}
                      {(director as ExeItem).respWorkHead && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">• {(director as ExeItem).respWorkHead}</p>
                      )}
                      {(director as ExeItem).respOther && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">• {(director as ExeItem).respOther}</p>
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-yellow-500 font-bold">คลิกเพื่อดูข้อมูลเพิ่มเติม →</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- ส่วนที่ 2: รองผู้อำนวยการ (Grid Section) --- */}
        <div className="relative mb-12">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-slate-200 dark:border-neutral-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-50 px-6 text-lg font-bold text-slate-500 dark:bg-neutral-950"></span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, staggerChildren: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {deputies.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="group relative h-full cursor-pointer"
              onClick={() => setSelectedExec(item as ExeItem)}
            >
              <div className="h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:border-yellow-200 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-yellow-900/50">
                {/* Image Container: Flex Center added */}
                <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-neutral-800">
                  {item.img ? (
                    <Image
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      width={300}
                      classNames={{
                        wrapper: "mx-auto w-full h-full",
                        img: "mx-auto",
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserOutlined className="text-6xl text-slate-300 dark:text-zinc-700" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="relative p-5 text-center">
                  {/* Floating Icon */}
                  <div className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-white shadow-md dark:border-neutral-900 dark:bg-neutral-800">
                    <IdcardOutlined className="text-2xl text-slate-400 group-hover:text-yellow-500" />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-base font-bold text-slate-800 group-hover:text-yellow-600 dark:text-slate-100 dark:group-hover:text-yellow-500 leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                      {item.secondary}
                    </p>

                    {/* Affiliation */}
                    {(item as ExeItem).affiliation && (
                      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                        <DatabaseOutlined className="text-yellow-400" />
                        {(item as ExeItem).affiliation}
                      </p>
                    )}

                    {/* Position Number */}
                    {(item as ExeItem).positionNumber && (
                      <p className="mt-1 text-[10px] text-slate-300 dark:text-slate-600">
                        เลขที่: {(item as ExeItem).positionNumber}
                      </p>
                    )}

                    <div className="mx-auto mt-3 h-0.5 w-10 bg-slate-100 group-hover:bg-yellow-400 dark:bg-neutral-800 transition-colors" />

                    {/* Responsibilities (compact) */}
                    {(item as ExeItem).respDeptHead && (
                      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 text-left">
                        <BookOutlined className="mr-1 text-yellow-400" />
                        {(item as ExeItem).respDeptHead}
                      </p>
                    )}
                    {(item as ExeItem).respWorkHead && !(item as ExeItem).respDeptHead && (
                      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 text-left">
                        <BookOutlined className="mr-1 text-yellow-400" />
                        {(item as ExeItem).respWorkHead}
                      </p>
                    )}

                    <p className="mt-3 line-clamp-2 text-xs text-slate-400 dark:text-slate-500">
                      {item.description}
                    </p>

                    <p className="mt-2 text-[10px] text-yellow-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      คลิกดูข้อมูลเพิ่มเติม →
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

        {/* --- ส่วนที่ 3: คณะกรรมการบริหารสถานศึกษา --- */}
        <div className="mt-20 container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-1.5 text-sm font-semibold text-yellow-700 shadow-sm dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-500">
              <TeamOutlined /> คณะกรรมการบริหารสถานศึกษา
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              คณะ
              <span className="bg-linear-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                กรรมการ
              </span>
              บริหารสถานศึกษา
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400">
              ผู้ทรงคุณวุฒิและผู้บริหารที่ร่วมขับเคลื่อนวิทยาลัยสู่ความสำเร็จ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {DataCommittee.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md hover:shadow-xl hover:border-yellow-200 transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-yellow-900/50"
              >
                {/* Image — fixed aspect ratio, object-cover fills the box */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-neutral-800">
                  {member.img && member.img !== '/images/error.webp' ? (
                    <img
                      src={member.img}
                      alt={member.title}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UserOutlined className="text-5xl text-slate-300 dark:text-zinc-600" />
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Card content */}
                <div className="p-4 text-center">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors leading-tight line-clamp-2">
                    {member.title}
                  </h3>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold leading-tight">
                    {member.secondary}
                  </span>
                  {member.description && (
                    <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {member.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      {/* --- Detail Modal --- */}
      <AnimatePresence>
        {selectedExec && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelectedExec(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedExec(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/10 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
              >
                <CloseOutlined className="text-xs" />
              </button>

              <div className="flex flex-col md:flex-row max-h-[90vh]">
                {/* Left: Photo */}
                <div className="w-full md:w-2/5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 p-8 flex flex-col items-center justify-center gap-4 shrink-0">
                  <div className="w-44 h-44 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center">
                    {selectedExec.img ? (
                      <img src={selectedExec.img} alt={selectedExec.title} className="w-full h-full object-cover object-top" />
                    ) : (
                      <UserOutlined className="text-7xl text-slate-300 dark:text-zinc-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                      {selectedExec.title}
                    </h2>
                    <span className="mt-2 inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold">
                      {selectedExec.secondary}
                    </span>
                    {selectedExec.positionNumber && (
                      <p className="mt-2 text-[11px] text-slate-400">
                        เลขที่ตำแหน่ง: <b className="text-slate-600 dark:text-slate-300">{selectedExec.positionNumber}</b>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-6 overflow-y-auto space-y-5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white border-b dark:border-zinc-700 pb-3">
                    ข้อมูลส่วนตัวและการทำงาน
                  </h3>

                  {/* Position & Affiliation */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                      <SafetyCertificateOutlined /> ตำแหน่งและสังกัด
                    </h4>
                    <div className="pl-4 space-y-1.5 text-sm">
                      <p>
                        <span className="text-slate-400 text-xs">ตำแหน่งงาน:</span>{" "}
                        <b className="text-slate-800 dark:text-white">{selectedExec.secondary || "-"}</b>
                      </p>
                      {selectedExec.affiliation && (
                        <p>
                          <span className="text-slate-400 text-xs">สังกัด:</span>{" "}
                          <b className="text-slate-800 dark:text-white">{selectedExec.affiliation}</b>
                        </p>
                      )}
                      {selectedExec.department && (
                        <p>
                          <span className="text-slate-400 text-xs">แผนก/ฝ่าย:</span>{" "}
                          <b className="text-slate-800 dark:text-white">{selectedExec.department}</b>
                        </p>
                      )}
                      {selectedExec.faction && (
                        <p>
                          <span className="text-slate-400 text-xs">ฝ่ายงาน:</span>{" "}
                          <b className="text-slate-800 dark:text-white">{selectedExec.faction}</b>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {(selectedExec.respDeptHead || selectedExec.respWorkHead || selectedExec.respOther) && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOutlined /> หน้าที่รับผิดชอบ
                      </h4>
                      <div className="pl-4 space-y-2">
                        {selectedExec.respDeptHead && (
                          <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                            <p className="text-[10px] text-yellow-600 font-black uppercase tracking-wider mb-1">หัวหน้าแผนก</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{selectedExec.respDeptHead}</p>
                          </div>
                        )}
                        {selectedExec.respWorkHead && (
                          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3">
                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-wider mb-1">หัวหน้างาน</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{selectedExec.respWorkHead}</p>
                          </div>
                        )}
                        {selectedExec.respOther && (
                          <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">หน้าที่อื่น</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{selectedExec.respOther}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedExec.description && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                        <DatabaseOutlined /> ข้อมูลเพิ่มเติม
                      </h4>
                      <p className="pl-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {selectedExec.description}
                      </p>
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
