"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Loader2, ScanLine, UserCheck, UserX, ArrowLeft, Camera, StopCircle, RefreshCw, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";

export default function GateScanner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  
  const [lastAction, setLastAction] = useState<{
    action: "started" | "stopped" | null;
    studentName: string;
    durationMinutes?: number;
    message: string;
  } | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerInstance && isScanning) {
        try {
          if (scannerInstance.getState() === 2) {
            scannerInstance.resume();
          }
          scannerInstance.stop().then(() => {
            scannerInstance.clear();
          }).catch(() => {});
        } catch (e) {}
      }
    };
  }, [scannerInstance, isScanning]);

  const startScanner = async () => {
    try {
      setIsProcessing(true);
      
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScannerInstance(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" }, // Prefer back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // On Success
          if (!isProcessing) {
            await processScan(decodedText, html5QrCode);
          }
        },
        (errorMessage) => {
          // On Error (ignores normal frame scanning errors)
        }
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเข้าถึงกล้องได้ กรุณาให้สิทธิ์การใช้งานกล้อง");
    } finally {
      setIsProcessing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance && isScanning) {
      setIsProcessing(true);
      try {
        // Resume first if paused to avoid state errors during stop
        if (scannerInstance.getState() === 2) {
          scannerInstance.resume();
        }
        await scannerInstance.stop();
        scannerInstance.clear();
      } catch (err) {
        console.error("Stop scanner error:", err);
      } finally {
        setIsScanning(false);
        setScannerInstance(null);
        setIsProcessing(false);
      }
    }
  };

  const processScan = async (studentId: string, scanner: Html5Qrcode) => {
    setIsProcessing(true);
    try {
      // Pause scanner while processing
      scanner.pause();
      
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
        if (scanner.getState() === 2) { // 2 is PAUSED state
           scanner.resume();
        }
      }, 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 md:py-12 relative min-h-screen flex flex-col pt-24">
      <div className="flex justify-between items-center mb-6 w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-blue-600 font-bold transition-colors w-fit">
          <ArrowLeft size={16} /> กลับหน้าหลัก
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setManualOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 rounded-xl font-bold transition-colors text-sm shadow-sm">
            <BookOpen size={16} /> คู่มือ
          </button>
          <Link href="/teacher/tracking" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-100 dark:border-blue-500/20 rounded-xl font-bold transition-colors text-sm shadow-sm sm:flex">
            ติดตามพิกัด
          </Link>
        </div>
      </div>

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

      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl border-2 border-zinc-100 dark:border-zinc-800 relative flex flex-col items-center">
        
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[2.5rem]">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest">กำลังประมวลผล...</p>
          </div>
        )}

        {/* Camera Container */}
        <div className="w-full max-w-sm aspect-square bg-zinc-100 dark:bg-zinc-950 rounded-4xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative mb-6 shadow-inner flex items-center justify-center">
          <div id="qr-reader" className="w-full h-full [&>video]:object-cover" />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 pointer-events-none">
              <Camera size={48} className="mb-4 opacity-50" />
              <p className="font-bold text-sm uppercase tracking-widest">กล้องปิดอยู่</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-sm">
          {!isScanning ? (
            <button
              onClick={startScanner}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Camera size={18} /> เริ่มเปิดกล้องสแกน
            </button>
          ) : (
            <button
              onClick={stopScanner}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/30 font-black text-sm uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <StopCircle size={18} /> ปิดกล้องสแกน
            </button>
          )}
        </div>

        <AnimatePresence>
          {lastAction && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 p-6 rounded-2xl border-2 flex items-center gap-4 w-full max-w-sm ${
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

      {/* Manual Modal */}
      <AnimatePresence>
        {manualOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setManualOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 p-6 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 relative max-h-[80vh] overflow-y-auto"
            >
               <button onClick={() => setManualOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1">
                 <X size={20} />
               </button>
               <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                 <BookOpen className="text-amber-500" /> คู่มือ: สแกนเข้า-ออก
               </h3>
               <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                 <p className="font-bold text-zinc-800 dark:text-zinc-200">ใช้สแกน QR Code ของนักเรียนเพื่อบันทึกการเข้า-ออก และเปิด/ปิดระบบติดตาม GPS</p>
                 <ol className="list-decimal list-inside space-y-3 font-medium">
                   <li>กดปุ่ม <strong>"เริ่มเปิดกล้องสแกน"</strong> (อนุญาตให้เข้าถึงกล้องเมื่อมี Popup)</li>
                   <li>นำกล้องไปส่องที่ <strong>QR Code จากหน้าจอโทรศัพท์ของนักเรียน</strong></li>
                   <li className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                     <strong className="text-zinc-800 dark:text-zinc-200">ผลลัพธ์การสแกน (ดูจากสีของกรอบ):</strong>
                     <ul className="list-disc list-inside ml-4 mt-2 space-y-2 text-xs">
                       <li className="text-amber-600 dark:text-amber-500"><strong>สแกนครั้งแรก (ออก):</strong> กรอบสีเหลือง "สแกนออกจากวิทยาลัยและเริ่มการติดตาม"</li>
                       <li className="text-emerald-600 dark:text-emerald-500"><strong>สแกนครั้งที่สอง (กลับ):</strong> กรอบสีเขียว "รับกลับและยกเลิกการติดตาม" พร้อมบอกเวลาที่ออกไปกี่นาที</li>
                     </ul>
                   </li>
                 </ol>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
