"use client";

import React, { useRef, useState } from "react";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";
const FlipBook: any = HTMLFlipBook;
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Clock, FileText } from "lucide-react";

export const wfhManualData = [
  {
    id: 1,
    title: "1. การลงชื่อเข้าใช้งานระบบ",
    icon: <BookOpen className="text-amber-500 mb-4" size={32} />,
    description: "เริ่มต้นการปฏิบัติงานจากที่บ้าน บุคลากรต้องทำการเข้าสู่ระบบเพื่อยืนยันตัวตน",
    steps: [
      "เข้าไปที่เว็บไซต์ ktl.ac.th",
      "คลิกที่ปุ่ม เข้าสู่ระบบ มุมขวาบน",
      "กรอก รหัสผู้ใช้งาน (Username) และ รหัสผ่าน (Password)",
      "ระบบจะนำท่านเข้าสู่หน้า Dashboard หลัก"
    ]
  },
  {
    id: 2,
    title: "2. การลงเวลาเข้า-ออกงาน (WFH)",
    icon: <Clock className="text-amber-500 mb-4" size={32} />,
    description: "บันทึกเวลาปฏิบัติงานตามระเบียบของวิทยาลัย",
    steps: [
      "ในหน้า Dashboard ให้เลือกเมนู 'ลงเวลาปฏิบัติงาน'",
      "กดปุ่ม 'เข้างาน (Check-in)' เมื่อเริ่มปฏิบัติงาน",
      "ระบบจะบันทึกเวลาปัจจุบันและพิกัด GPS เพื่อยืนยันว่าท่านปฏิบัติงานจากที่พักอาศัยจริง",
      "เมื่อสิ้นสุดการปฏิบัติงาน ให้กดปุ่ม 'ออกงาน (Check-out)'"
    ]
  },
  {
    id: 3,
    title: "3. การส่งรายงานผลการปฏิบัติงาน",
    icon: <FileText className="text-amber-500 mb-4" size={32} />,
    description: "สรุปผลการปฏิบัติงานรายวันเพื่อส่งหัวหน้างาน",
    steps: [
      "เลือกเมนู 'รายงานปฏิบัติงาน (WFH)'",
      "คลิกปุ่ม 'สร้างรายงานใหม่'",
      "กรอกรายละเอียดงานที่ได้ปฏิบัติในวันนี้ พร้อมแนบรูปภาพหรือไฟล์เอกสารประกอบ",
      "ตรวจสอบความถูกต้องและกดปุ่ม 'ส่งรายงาน' ให้กับหัวหน้าแผนก/ฝ่าย"
    ]
  },
  {
    id: 4,
    title: "4. การติดตามและตรวจสอบสถานะ",
    icon: <CheckCircle className="text-amber-500 mb-4" size={32} />,
    description: "ตรวจสอบว่ารายงานถูกอนุมัติหรือต้องแก้ไขหรือไม่",
    steps: [
      "ท่านสามารถดูประวัติรายงานได้ในเมนู 'ประวัติรายงาน'",
      "สถานะ 'รออนุมัติ' หมายถึงหัวหน้างานกำลังตรวจสอบ",
      "สถานะ 'อนุมัติแล้ว' หมายถึงการปฏิบัติงานเสร็จสมบูรณ์",
      "หากสถานะเป็น 'ตีกลับ/แก้ไข' ให้ท่านดำเนินการแก้ไขตามคอมเมนต์และส่งใหม่"
    ]
  }
];

export default function WfhFlipbook() {
  const bookRef = useRef<any>(null);
  const pageTextRef = useRef<HTMLDivElement>(null);

  const nextPage = () => {
    if (bookRef.current) bookRef.current.pageFlip().flipNext();
  };

  const prevPage = () => {
    if (bookRef.current) bookRef.current.pageFlip().flipPrev();
  };

  const onPage = (e: any) => {
    const pageNum = e.data;
    if (pageTextRef.current) {
      let text = pageNum.toString();
      if (pageNum === 0) text = "หน้าปก";
      else if (pageNum === wfhManualData.length + 1) text = "ปกหลัง";
      pageTextRef.current.innerText = `หน้าปัจจุบัน: ${text} / ${wfhManualData.length + 1}`;
    }
  };

  const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, number: number }>(
    (props, ref) => {
      return (
        <div ref={ref} className="bg-white border-l border-zinc-200 h-full w-full shadow-lg relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-linear-to-r from-zinc-200/50 to-transparent w-4 z-10 pointer-events-none"></div>
          <div className="flex-1 p-6 flex flex-col relative z-20">
            {props.children}
          </div>
          <div className="mt-auto pt-4 text-center pb-4 text-xs font-bold text-zinc-400 bg-white relative z-20 border-t border-zinc-100">
            - {props.number} -
          </div>
        </div>
      );
    }
  );
  Page.displayName = "Page";

  return (
    <div className="w-full flex flex-col items-center bg-zinc-900/5 rounded-3xl p-4 md:p-8 relative">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-blue-900 dark:text-blue-400 flex items-center gap-2">
          <BookOpen size={24} className="text-amber-500" />
          คู่มือการใช้งานระบบ WFH (E-Book)
        </h2>
        <div className="flex gap-2">
          <button onClick={prevPage} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-blue-600 hover:bg-blue-50 shadow-md transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextPage} className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-600 hover:text-blue-600 hover:bg-blue-50 shadow-md transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center perspective-[2000px]">
        <div className="shadow-2xl shadow-blue-900/20 rounded-r-lg">
          <FlipBook
            width={400}
            height={565}
            size="stretch"
            minWidth={300}
            maxWidth={500}
            minHeight={400}
            maxHeight={700}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="flip-book"
            ref={bookRef}
          >
            {/* Cover Page */}
            <div className="bg-blue-900 h-full w-full shadow-lg relative overflow-hidden flex flex-col justify-center items-center p-8 border-l-8 border-blue-950">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
              <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-amber-400" />
              </div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-linear-to-b from-amber-200 to-amber-500 text-center uppercase tracking-wider leading-tight">
                คู่มือการใช้งาน<br/>ระบบ WFH
              </h1>
              <div className="w-16 h-1 bg-amber-500 my-6"></div>
              <h2 className="text-lg font-bold text-blue-100 uppercase tracking-widest text-center">
                สำหรับการปฏิบัติงาน<br/>ที่บ้าน
              </h2>
              <div className="absolute bottom-8 text-xs font-bold text-blue-300/50 uppercase tracking-widest text-center">
                วิทยาลัยเทคนิคกันทรลักษ์
              </div>
            </div>

            {/* Inner Pages */}
            {wfhManualData.map((page, index) => (
              <Page number={index + 1} key={page.id}>
                <div className="flex flex-col h-full">
                  {page.icon}
                  <h3 className="text-xl font-black text-blue-900 mb-2 leading-tight">
                    {page.title}
                  </h3>
                  <p className="text-sm font-medium text-zinc-500 mb-6 pb-4 border-b border-zinc-100">
                    {page.description}
                  </p>
                  <div className="space-y-4">
                    {page.steps.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Page>
            ))}

            {/* Back Cover */}
            <div className="bg-blue-900 h-full w-full shadow-lg relative flex flex-col justify-center items-center p-8">
              <div className="w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-500/50 font-black mb-4">
                KTC
              </div>
              <p className="text-xs font-medium text-blue-200/50 text-center">
                วิทยาลัยเทคนิคกันทรลักษ์<br/>All Rights Reserved
              </p>
            </div>
          </FlipBook>
        </div>
      </div>
      
      <div ref={pageTextRef} className="mt-8 text-center text-sm font-bold text-zinc-500">
        หน้าปัจจุบัน: หน้าปก / {wfhManualData.length + 1}
      </div>
    </div>
  );
}
