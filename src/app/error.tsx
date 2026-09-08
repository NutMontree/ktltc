"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FuzzyText from "@/components/ui/FuzzyText";

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

  // ปิดการนับถอยหลังรีเฟรชอัตโนมัติ เพื่อไม่ให้เกิดลูปการโหลดซ้ำรัวๆ


  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="dark:bg-slate-900 border border-red-100 rounded-3xl p-10 max-w-md w-full shadow-2xl shadow-red-500/5">
        {/* ไอคอน */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-red-50 animate-ping opacity-30" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full dark:bg-red-950/40 border border-red-100">
            <svg
              className="w-9 h-9 text-red-500"
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

        <div className="mb-2 w-full flex justify-center">
          <FuzzyText 
            baseIntensity={0.2} 
            hoverIntensity={0.5} 
            enableHover={true}
            fontSize="clamp(2rem, 5vw, 3rem)"
            color="currentColor"
            className="text-slate-800 font-bold"
          >
            500 Error
          </FuzzyText>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">
          เซิร์ฟเวอร์หรือฐานข้อมูลขัดข้อง
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          ระบบไม่สามารถเชื่อมต่อฐานข้อมูลได้ในขณะนี้
          <br />
          อาจเกิดจากเครือข่ายหรือเซิร์ฟเวอร์ไม่พร้อม
        </p>

        <div className="pt-4">
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
