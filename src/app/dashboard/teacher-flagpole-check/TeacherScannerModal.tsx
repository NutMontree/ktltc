"use client";

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (studentId: string) => void;
  teacherLocation: { lat: number; lng: number } | null;
}

export default function TeacherScannerModal({ isOpen, onClose, onScanSuccess, teacherLocation }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleScan = async (data: any) => {
    if (isProcessing || !data || data.length === 0) return;
    
    try {
      const text = data[0].rawValue;
      if (!text) return;
      
      setIsProcessing(true);
      
      if (!teacherLocation) {
        toast.error("ไม่สามารถระบุพิกัด GPS ได้");
        setIsProcessing(false);
        return;
      }

      // Call the API to check-in the student
      const res = await fetch("/api/flagpole/teacher-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: text, 
          method: "qr_scan",
          lat: teacherLocation.lat,
          lng: teacherLocation.lng
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(`เช็คชื่อสำเร็จ: ${json.studentName || 'ไม่ทราบชื่อ'}`);
        onScanSuccess(text);
        // We do not close the modal automatically so the teacher can scan multiple students
      } else {
        toast.error(json.message || "เกิดข้อผิดพลาดในการเช็คชื่อ");
      }
    } catch (error) {
      console.error(error);
      toast.error("ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      // Add a small delay before allowing the next scan to avoid rapid fire
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-md border border-slate-100 dark:border-zinc-800"
        >
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="font-black text-lg uppercase tracking-tight">สแกน QR Code นักเรียน</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 relative">
            <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative shadow-inner border border-zinc-200 dark:border-zinc-700">
              <Scanner
                onScan={handleScan}
                formats={['qr_code']}
                components={{
                  finder: true,
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                }}
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-2" />
                  <p className="font-bold text-sm tracking-widest uppercase">กำลังบันทึกข้อมูล...</p>
                </div>
              )}
            </div>
            
            <p className="text-center text-sm font-bold text-slate-500 mt-6 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
              หันกล้องไปที่ QR Code บนหน้าจอมือถือของนักเรียน
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
