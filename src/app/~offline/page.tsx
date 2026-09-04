import React from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "ออฟไลน์ | KTLTC",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/5 max-w-md w-full border border-slate-100 dark:border-zinc-800 flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <WifiOff size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          ขาดการเชื่อมต่อ
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
          ดูเหมือนว่าคุณกำลังออฟไลน์อยู่ หรือสัญญาณอินเทอร์เน็ตไม่เสถียร กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง
        </p>

        <a
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
        >
          <RefreshCcw size={18} />
          ลองใหม่อีกครั้ง
        </a>
      </div>

      <div className="mt-12 opacity-50 grayscale">
        <Image src="/images/logo.png" alt="KTLTC Logo" width={48} height={48} className="mx-auto" />
      </div>
    </div>
  );
}
