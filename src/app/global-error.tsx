"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // บันทึก log ลง server หรือ console
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            การเชื่อมต่อฐานข้อมูลหรือระบบเซิร์ฟเวอร์ขัดข้อง
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            กรุณาตรวจสอบว่าเซิร์ฟเวอร์ฐานข้อมูลเปิดอยู่
            และเครือข่ายอินเทอร์เน็ต/วงแลนของคุณยังใช้งานได้ปกติ
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition cursor-pointer"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
