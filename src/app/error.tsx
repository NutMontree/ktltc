"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // บันทึก log ลง console
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 max-w-md shadow-lg">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
          การเชื่อมต่อฐานข้อมูลหรือระบบขัดข้อง
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
          กรุณาตรวจสอบว่าเซิร์ฟเวอร์ฐานข้อมูลยังเปิดใช้งานอยู่
          และเครือข่ายอินเทอร์เน็ต/วงแลนของคุณยังเชื่อมต่อได้ปกติ
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-teal-600 text-white font-medium text-sm rounded-xl hover:bg-teal-700 transition cursor-pointer"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    </div>
  );
}
