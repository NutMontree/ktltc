"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Loader2, ScanLine, UserCheck, UserX, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

export default function GateScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<{
    action: "started" | "stopped" | null;
    studentName: string;
    durationMinutes?: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      if (!isProcessing) {
        setScanResult(decodedText);
        processScan(decodedText, scanner);
      }
    }

    function onScanFailure(error: any) {
      // ignore
    }

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isProcessing]);

  const processScan = async (studentId: string, scanner: Html5QrcodeScanner) => {
    setIsProcessing(true);
    try {
      // Pause scanner while processing
      scanner.pause(true);
      
      const res = await fetch("/api/tracking/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });

      const data = await res.json();
      
      if (data.success) {
        setLastAction({
          action: data.action,
          studentName: data.studentName,
          durationMinutes: data.durationMinutes,
          message: data.message
        });
        toast.success(data.message);
      } else {
        toast.error(data.message || "เกิดข้อผิดพลาดในการสแกน");
        setLastAction({
          action: null,
          studentName: "Unknown",
          message: data.message || "เกิดข้อผิดพลาดในการสแกน"
        });
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      // Wait 3 seconds before allowing next scan
      setTimeout(() => {
        setIsProcessing(false);
        setScanResult(null);
        if (scanner.getState() === 2) { // 2 is PAUSED state
           scanner.resume();
        }
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 md:py-12 relative min-h-screen flex flex-col pt-24">
      <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold mb-6 transition-colors w-fit">
        <ArrowLeft size={16} /> กลับหน้าหลัก
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <ScanLine size={32} />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase mb-2">
          ระบบสแกนเข้า-ออก <span className="text-blue-500">(Gate Pass)</span>
        </h1>
        <p className="text-sm font-medium text-zinc-500">
          สแกน QR Code จากแอปพลิเคชันของนักเรียนเพื่อเปิด/ปิดระบบติดตาม GPS
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden relative">
        
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest">กำลังประมวลผล...</p>
          </div>
        )}

        <div id="reader" className="w-full rounded-2xl overflow-hidden bg-black"></div>

        <AnimatePresence>
          {lastAction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 p-6 rounded-2xl border-2 flex items-center gap-4 ${
                lastAction.action === "started" 
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/30" 
                  : lastAction.action === "stopped"
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30"
                    : "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-500/30"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                lastAction.action === "started" ? "bg-amber-100 text-amber-600" :
                lastAction.action === "stopped" ? "bg-emerald-100 text-emerald-600" :
                "bg-rose-100 text-rose-600"
              }`}>
                {lastAction.action === "started" ? <UserX size={24} /> : <UserCheck size={24} />}
              </div>
              <div>
                <h3 className={`font-black text-lg ${
                  lastAction.action === "started" ? "text-amber-700" :
                  lastAction.action === "stopped" ? "text-emerald-700" :
                  "text-rose-700"
                }`}>{lastAction.studentName}</h3>
                <p className="text-sm font-bold opacity-80">{lastAction.message}</p>
                {lastAction.durationMinutes !== undefined && (
                  <p className="text-xs font-black uppercase tracking-widest mt-1 opacity-60">
                    เวลาที่ออกไป: {lastAction.durationMinutes} นาที
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
