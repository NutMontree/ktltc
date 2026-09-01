"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Tv, Loader2, Maximize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  department: string;
  classGroupId: string;
}

export default function TeacherQRGeneratorModal({ isOpen, onClose, department, classGroupId }: Props) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      generateToken();
    }
  }, [isOpen, department, classGroupId]);

  const generateToken = async () => {
    setLoading(true);
    try {
      // In a real app, you would call an API to generate a secure token
      // For this implementation, we will create a token containing the teacher's session and class info
      const res = await fetch("/api/flagpole/generate-qr-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department, classGroupId }),
      });
      
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
      } else {
        // Fallback if API doesn't exist yet
        setToken(`ktltc-flagpole-${Date.now()}-${department}-${classGroupId}`);
      }
    } catch (error) {
      // Fallback on error
      setToken(`ktltc-flagpole-${Date.now()}-${department}-${classGroupId}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-2xl border border-slate-100 dark:border-zinc-800"
        >
          <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Tv size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-tight leading-none">แสดง QR Code ขึ้นจอ</h3>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mt-1">ให้นักเรียนสแกนเพื่อเช็คชื่อ</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center relative min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                <p className="font-black tracking-widest uppercase text-xs">กำลังสร้างรหัส QR Code...</p>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white p-6 rounded-3xl shadow-xl shadow-emerald-500/10 border-4 border-slate-50 relative group"
              >
                <div className="absolute top-4 right-4 p-2 bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
                  <Maximize size={20} />
                </div>
                <QRCodeSVG 
                  value={token} 
                  size={300} 
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/ktltc_logo.png",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </motion.div>
            )}
            
            <div className="mt-8 text-center space-y-2">
              <p className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {classGroupId && classGroupId !== "all" ? classGroupId : 'สแกนได้ทุกแผนกวิชา / ทุกห้องเรียน'}
              </p>
              <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                {department && department !== "all" ? department : 'สแกนเช็คชื่อรวมของวิทยาลัย'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
