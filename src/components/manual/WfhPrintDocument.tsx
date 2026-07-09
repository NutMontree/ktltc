"use client";

import React from "react";
import { wfhManualData } from "./WfhFlipbook";

export const WfhPrintDocument = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 w-full print:p-0">
      {/* Cover Page */}
      <div className="w-full min-h-[297mm] flex flex-col justify-center items-center relative break-after-page page-break-after-always">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-4 border-blue-900 flex items-center justify-center font-black text-blue-900 text-2xl">
          KTC
        </div>
        
        <h1 className="text-5xl font-black text-blue-900 text-center uppercase tracking-wider leading-tight mb-8">
          คู่มือการใช้งาน<br/>ระบบ WFH
        </h1>
        <div className="w-32 h-2 bg-amber-500 mb-8"></div>
        <h2 className="text-2xl font-bold text-zinc-700 uppercase tracking-widest text-center">
          (Work From Home)
        </h2>
        <h3 className="text-xl font-bold text-zinc-500 mt-4">
          วิทยาลัยเทคนิคกันทรลักษ์
        </h3>
      </div>

      {/* Content Pages */}
      <div className="w-full">
        {wfhManualData.map((page, index) => (
          <div key={page.id} className="min-h-[297mm] py-10 relative break-after-page page-break-after-always flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-blue-900 pb-4 mb-8">
              <div>
                <div className="text-sm font-black text-amber-600 uppercase tracking-widest mb-1">
                  ขั้นตอนที่ {index + 1}
                </div>
                <h2 className="text-2xl font-black text-blue-900">
                  {page.title.replace(/^[0-9]+\.\s*/, '')}
                </h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg font-medium text-zinc-600 mb-8 pb-6 border-b border-zinc-100">
              {page.description}
            </p>

            {/* Steps */}
            <div className="space-y-6">
              {page.steps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-lg font-bold text-zinc-800 leading-relaxed pt-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer Page Number */}
            <div className="mt-auto pt-8 border-t border-zinc-200 flex justify-between text-xs font-bold text-zinc-400">
              <span>คู่มือปฏิบัติงาน WFH - วิทยาลัยเทคนิคกันทรลักษ์</span>
              <span>หน้า {index + 1}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Back Cover */}
      <div className="w-full min-h-[297mm] flex flex-col justify-center items-center relative">
         <div className="w-20 h-20 rounded-full border border-blue-900 flex items-center justify-center font-black text-blue-900 mb-6">
          KTC
        </div>
        <p className="text-sm font-bold text-zinc-500">
          เอกสารคู่มือการใช้งานระบบ WFH
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          สงวนลิขสิทธิ์ © วิทยาลัยเทคนิคกันทรลักษ์
        </p>
      </div>

    </div>
  );
});

WfhPrintDocument.displayName = "WfhPrintDocument";
