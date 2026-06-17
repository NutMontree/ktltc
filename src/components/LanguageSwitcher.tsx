"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AVAILABLE_SLANG_MODES } from "./CustomSlangTranslator";

const FOREIGN_LANGUAGES = [
  { id: "en", label: "🇬🇧 English" },
  { id: "zh-CN", label: "🇨🇳 中文" },
  { id: "ja", label: "🇯🇵 日本語" },
  { id: "ko", label: "🇰🇷 한국어" },
  { id: "vi", label: "🇻🇳 Tiếng Việt" },
  { id: "lo", label: "🇱🇦 ລາວ (Lao)" },
  { id: "fr", label: "🇫🇷 Français" },
  { id: "de", label: "🇩🇪 Deutsch" },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState("normal");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // อ่านค่าโหมดปัจจุบันจาก Cookie
    const slangMatch = document.cookie.match(/ktltc_slang_mode=([^;]+)/);
    const googleMatch = document.cookie.match(/googtrans=\/th\/([^;]+)/);
    
    if (googleMatch) {
      setCurrentMode(googleMatch[1]);
    } else if (slangMatch) {
      setCurrentMode(slangMatch[1]);
    } else {
      const localMode = localStorage.getItem("ktltc_slang_mode");
      setCurrentMode(localMode || "normal");
    }

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMode = (modeId: string, isForeign = false) => {
    if (modeId === "normal" || (!isForeign && modeId !== "normal")) {
      // ปิด Google Translate
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      
      // ตั้งค่า Slang Mode
      localStorage.setItem("ktltc_slang_mode", modeId);
      document.cookie = `ktltc_slang_mode=${modeId}; path=/; max-age=31536000`;
    } else if (isForeign) {
      // เปิด Google Translate และปิด Slang Mode
      document.cookie = `ktltc_slang_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      localStorage.removeItem("ktltc_slang_mode");
      
      document.cookie = `googtrans=/th/${modeId}; path=/;`;
      document.cookie = `googtrans=/th/${modeId}; path=/; domain=.${window.location.hostname}`;
    }
    
    setCurrentMode(modeId);
    setIsOpen(false);
    window.location.reload();
  };

  // จัดกลุ่ม Slang Modes
  const groupedModes = AVAILABLE_SLANG_MODES.reduce((acc, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_SLANG_MODES>);

  // จัดการไอคอนและชื่อปุ่มหลัก
  let currentIcon = "🇹🇭";
  let currentName = "ภาษาไทยปกติ";
  
  const slangObj = AVAILABLE_SLANG_MODES.find(m => m.id === currentMode);
  if (slangObj) {
    const parts = slangObj.label.split(" ");
    currentIcon = parts[0];
    currentName = parts.slice(1).join(" ");
  } else {
    const foreignObj = FOREIGN_LANGUAGES.find(m => m.id === currentMode);
    if (foreignObj) {
      const parts = foreignObj.label.split(" ");
      currentIcon = parts[0];
      currentName = parts.slice(1).join(" ");
    }
  }

  // แยกกลุ่ม "มาตรฐาน" ออกมาเพื่อไว้บนสุด
  const standardGroup = groupedModes["มาตรฐาน"];
  
  // กลุ่ม Slang อื่นๆ ที่เหลือ
  const otherSlangGroups = Object.entries(groupedModes).filter(([group]) => group !== "มาตรฐาน");

  return (
    <div className="relative inline-block text-left z-[999]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm group"
        title={`เปลี่ยนสไตล์ภาษา: ${currentName}`}
      >
        <span className="text-xl leading-none transition-transform group-hover:scale-110">{currentIcon}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none z-[9999] overflow-hidden"
          >
            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
              {/* --- 1. ภาษาไทยปกติ (เดี่ยวๆ อยู่บนสุด) --- */}
              {standardGroup && standardGroup.find(item => item.id === "normal") && (
                <div className="mb-3">
                  <button
                    onClick={() => handleSelectMode("normal", false)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                      currentMode === "normal"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                    }`}
                  >
                    <span className="text-xl">🇹🇭</span>
                    <span>ภาษาไทยปกติ</span>
                    {currentMode === "normal" && (
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {/* --- 2. ภาษาต่างประเทศ (Google Translate) --- */}
              <div className="mb-3">
                <div className="px-3 py-1.5 text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                  แปลภาษา (Google Translate)
                </div>
                <div className="space-y-0.5">
                  {FOREIGN_LANGUAGES.map((lang) => {
                    const [langIcon, ...langNameParts] = lang.label.split(" ");
                    const langName = langNameParts.join(" ");
                    return (
                      <button
                        key={lang.id}
                        onClick={() => handleSelectMode(lang.id, true)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                          currentMode === lang.id
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold"
                            : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                        }`}
                      >
                        <span className="text-xl">{langIcon}</span>
                        <span>{langName}</span>
                        {currentMode === lang.id && (
                          <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* --- 3. กลุ่มมาตรฐานอื่นๆ (ไม่รวมภาษาไทยปกติ) --- */}
              {standardGroup && standardGroup.filter(item => item.id !== "normal").length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    มาตรฐาน
                  </div>
                  <div className="space-y-0.5">
                    {standardGroup.filter(item => item.id !== "normal").map((item) => {
                      const [itemIcon, ...itemNameParts] = item.label.split(" ");
                      const itemName = itemNameParts.join(" ");
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectMode(item.id, false)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                            currentMode === item.id
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                              : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                          }`}
                        >
                          <span className="text-xl">{itemIcon}</span>
                          <span>{itemName}</span>
                          {currentMode === item.id && (
                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- 4. โหมดภาษาและ Persona พิเศษ (Slang Modes) อื่นๆ --- */}
              {otherSlangGroups.map(([group, items]) => (
                <div key={group} className="mt-3">
                  <div className="px-3 py-1.5 text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {group}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const [itemIcon, ...itemNameParts] = item.label.split(" ");
                      const itemName = itemNameParts.join(" ");
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectMode(item.id, false)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                            currentMode === item.id
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                              : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80"
                          }`}
                        >
                          <span className="text-xl">{itemIcon}</span>
                          <span>{itemName}</span>
                          {currentMode === item.id && (
                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
