import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        – แสดงข้อมูลการติดต่อของสถานศึกษา อย่างน้อย ประกอบด้วย ดังนี้ <br />
        1) ที่อยู่สถานศึกษา
        <br />
        2) หมายเลขโทรศัพท์
        <br />
        3) E-mail
        <br />
        4) แผนที่ตั้ง
        <br />
      </div>

      <p className="text-xl">Link Web Page</p>
      <div className="py-4 hover:text-blue-500 dark:hover:text-blue-400">
        {" "}
        <LinkPreview url="https://ktltc.vercel.app/about">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. About Page
          </p>{" "}
        </LinkPreview>{" "}
      </div>
    </>
  );
}
