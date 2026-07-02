"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Info } from "lucide-react";

interface PageHelpModalProps {
  title?: string;
  description?: string;
  overview?: string;
  steps?: {
    title: string;
    content: string;
  }[];
}

export default function PageHelpModal({
  title = "คำแนะนำการใช้งาน",
  description = "วิธีการใช้งานหน้านี้เบื้องต้น",
  overview,
  steps = []
}: PageHelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm flex items-center gap-2 text-xs font-bold"
        title="วิธีใช้งาน"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">วิธีใช้งาน</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-800 dark:text-zinc-100">
                        {title}
                      </h2>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                        {description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
                  {overview && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <h3 className="text-sm font-black text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        หน้านี้คืออะไร?
                      </h3>
                      <p className="text-xs text-blue-700/80 dark:text-blue-200/80 leading-relaxed font-medium">
                        {overview}
                      </p>
                    </div>
                  )}

                  {steps && steps.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 px-1">
                        ขั้นตอนการใช้งาน
                      </h3>
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                            {idx + 1}
                          </div>
                          <div className="space-y-1 mt-0.5">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                              {step.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                              {step.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!overview && (!steps || steps.length === 0) && (
                    <p className="text-sm text-slate-500 dark:text-zinc-400 text-center py-4">
                      ไม่มีคำแนะนำสำหรับหน้านี้
                    </p>
                  )}
                </div>
                
                {/* Footer */}
                <div className="p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-blue-500/20"
                  >
                    เข้าใจแล้ว
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
