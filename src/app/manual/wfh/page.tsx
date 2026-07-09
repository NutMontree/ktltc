"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Printer, Home } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const WfhFlipbook = dynamic(() => import("@/components/manual/WfhFlipbook"), {
  ssr: false,
  loading: () => <div className="h-96 flex flex-col items-center justify-center gap-4 text-amber-500 font-bold"><BookOpen className="animate-bounce" />กำลังเตรียมหน้ากระดาษคู่มือ...</div>
});

import { WfhPrintDocument } from "@/components/manual/WfhPrintDocument";

export default function WfhManualPage() {
  const printComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: "คู่มือ_WFH",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
      
      <div className="hidden">
        <WfhPrintDocument ref={printComponentRef} />
      </div>

      {/* Hero Header */}
      <div className="w-full bg-blue-950 text-white relative overflow-hidden border-b-4 border-amber-500">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-amber-400 transition-colors font-bold text-sm mb-8">
            <ArrowLeft size={16} /> กลับหน้าหลัก
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest mb-4">
                <Home size={12} /> ระบบบุคลากร
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-white to-blue-200 tracking-tight leading-tight mb-2">
                คู่มือการใช้งานระบบ<br className="hidden md:block"/>Work From Home
              </h1>
              <p className="text-amber-400 font-bold text-lg md:text-xl tracking-wider">
                วิทยาลัยเทคนิคกันทรลักษ์
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => handlePrint()}
                className="px-6 py-3 bg-amber-500 text-blue-950 hover:bg-amber-400 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Printer size={18} /> บันทึก PDF / พิมพ์
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <WfhFlipbook />
          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}
