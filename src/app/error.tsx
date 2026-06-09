"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AUTO_REFRESH_SECONDS = 5;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(AUTO_REFRESH_SECONDS);

  useEffect(() => {
    // บันทึก log
    console.error("Application Error:", error);
  }, [error]);

  useEffect(() => {
    // นับถอยหลัง แล้ว redirect กลับ
    if (countdown <= 0) {
      router.back();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-3xl p-10 max-w-md w-full shadow-2xl shadow-red-500/5">
        {/* ไอคอน */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-red-50 dark:bg-red-950/40 animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50">
            <svg
              className="w-9 h-9 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M5.636 5.636a9 9 0 1 0 12.728 12.728M5.636 5.636A9 9 0 0 1 18.364 18.364M5.636 5.636 18.364 18.364"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          เซิร์ฟเวอร์หรือฐานข้อมูลขัดข้อง
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
          ระบบไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้
          <br />
          อาจเกิดจากเครือข่ายหรือเซิร์ฟเวอร์ไม่พร้อม
        </p>

        {/* Countdown ring */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-teal-500 transition-all duration-1000"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / AUTO_REFRESH_SECONDS)}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-teal-600 dark:text-teal-400">
              {countdown}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            กำลังรีเฟรชอัตโนมัติใน {countdown} วินาที...
          </p>

          <button
            onClick={() => {
              reset();
              setTimeout(() => window.location.reload(), 300);
            }}
            className="w-full px-5 py-3 bg-teal-600 text-white font-semibold text-sm rounded-2xl hover:bg-teal-700 active:scale-95 transition-all cursor-pointer shadow-lg shadow-teal-600/20"
          >
            รีเฟรชทันที
          </button>
        </div>
      </div>
    </div>
  );
}
