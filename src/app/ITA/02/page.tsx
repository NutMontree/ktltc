import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        <p>
          – แสดงข้อมูลของผู้อำนวยการสถานศึกษา และรองผู้อำนวยการสถานศึกษา
          อย่างน้อย ประกอบด้วย ดังนี้
        </p>
        <p>
          – แสดงตำแหน่งที่สำคัญและการแบ่งส่วนงานภายใน ยกตัวอย่างเช่น ฝ่าย งาน
          แผนกวิชา เป็นต้น
        </p>
      </div>

      <p className="text-xl">Link Web Page</p>
      <div className="py-4 hover:text-blue-500 dark:hover:text-blue-400">
        {" "}
        <LinkPreview url="https://ktltc.vercel.app/executiveboard">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. ข้อมูลโครงสร้างวิทยาลัยฯ
          </p>{" "}
        </LinkPreview>{" "}
      </div>
    </>
  );
}
