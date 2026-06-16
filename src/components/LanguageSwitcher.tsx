"use client";

import { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("th");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check custom slang mode first
    const slangMatch = document.cookie.match(/ktltc_slang_mode=([^;]+)/);
    if (slangMatch) {
      setCurrentLang(slangMatch[1]);
    } else {
      // อ่านค่า cookie googtrans เพื่อแสดงภาษาที่กำลังใช้งาน
      const match = document.cookie.match(/googtrans=\/th\/([^;]+)/);
      if (match) {
        setCurrentLang(match[1]);
      } else {
        setCurrentLang("th");
      }
    }

    // ปิดเมนูเมื่อคลิกที่อื่น (Click Outside)
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    if (lang === "th") {
      // ล้างค่า cookie ทั้งหมดเพื่อกลับไปใช้ภาษาไทยดั้งเดิม
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      document.cookie = `ktltc_slang_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } else if (lang === "kathoey" || lang === "genz") {
      // โหมดภาษาวัยรุ่น / กะเทย
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      document.cookie = `ktltc_slang_mode=${lang}; path=/; max-age=86400`;
    } else {
      // โหมดแปลภาษา Google Translate ปกติ
      document.cookie = `ktltc_slang_mode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=/th/${lang}; path=/;`;
      document.cookie = `googtrans=/th/${lang}; path=/; domain=.${window.location.hostname}`;
    }
    // รีเฟรชหน้าเว็บเพื่อให้ Google Translate อ่าน cookie ใหม่
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm group"
        title="เปลี่ยนภาษา (Change Language)"
      >
        <Globe size={18} className="text-zinc-600 dark:text-zinc-300 group-hover:text-blue-500 transition-colors" />
        <span className="absolute -bottom-1 -right-1 text-[9px] font-black uppercase bg-blue-500 text-white rounded-full px-1 shadow-sm">
          {currentLang}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] overflow-hidden z-9999 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200 h-64 overflow-y-auto custom-scrollbar-thin">
          <button
            onClick={() => changeLanguage('th')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'th' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇹🇭</span> ไทย
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'en' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇬🇧</span> English
          </button>
          <button
            onClick={() => changeLanguage('zh-CN')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'zh-CN' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇨🇳</span> 中文
          </button>
          <button
            onClick={() => changeLanguage('ja')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'ja' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇯🇵</span> 日本語
          </button>
          <button
            onClick={() => changeLanguage('ko')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'ko' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇰🇷</span> 한국어
          </button>
          <button
            onClick={() => changeLanguage('vi')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'vi' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇻🇳</span> Tiếng Việt
          </button>
          <button
            onClick={() => changeLanguage('lo')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'lo' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇱🇦</span> ລາວ (Lao)
          </button>
          
          {/* --- Slang Modes --- */}
          <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 my-1 mx-2"></div>
          
          <button
            onClick={() => changeLanguage('kathoey')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'kathoey' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">💅</span> ภาษาตัวแม่
          </button>
          <button
            onClick={() => changeLanguage('genz')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'genz' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">😎</span> ภาษาวัยรุ่น (Gen Z)
          </button>
          
          <div className="h-px bg-zinc-200/80 dark:bg-zinc-800/80 my-1 mx-2"></div>
          <button
            onClick={() => changeLanguage('fr')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'fr' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇫🇷</span> Français
          </button>
          <button
            onClick={() => changeLanguage('de')}
            className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 transition-colors ${currentLang === 'de' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
            <span className="text-lg">🇩🇪</span> Deutsch
          </button>
        </div>
      )}
    </div>
  );
}
