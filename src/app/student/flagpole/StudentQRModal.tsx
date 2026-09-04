"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  name: string;
  studentId: string;
}

export default function StudentQRModal({ isOpen, onClose, userId, name, studentId }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-sm border border-slate-100 dark:border-zinc-800"
        >
          <div className="p-5 bg-indigo-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <User size={20} />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight leading-none">QR Code ของฉัน</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-8 flex flex-col items-center justify-center relative">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
              className="bg-white p-4 rounded-3xl shadow-xl shadow-indigo-500/10 border-4 border-slate-50"
            >
              <QRCodeSVG 
                value={userId || "unknown"} 
                size={220} 
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/ktltc_logo.png",
                  x: undefined,
                  y: undefined,
                  height: 30,
                  width: 30,
                  excavate: true,
                }}
              />
            </motion.div>
            
            <div className="mt-6 text-center space-y-1 w-full">
              <p className="text-xl font-black text-slate-800 dark:text-white truncate">
                {name || 'ไม่ทราบชื่อ'}
              </p>
              <p className="text-sm font-bold text-indigo-500 dark:text-indigo-400">
                รหัสประจำตัว: {studentId || '-'}
              </p>
              <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl border border-slate-100 dark:border-zinc-700">
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">
                  ยื่น QR Code นี้ให้ครูสแกนเพื่อเช็คชื่อเข้าแถว
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
