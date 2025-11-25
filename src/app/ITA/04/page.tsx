import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        – แสดงแผนการดำเนินภารกิจของสถานศึกษาที่มีระยะมากกว่า 1 ปี <br />
        – มีข้อมูลรายละเอียดของแผนฯ อย่างน้อย ประกอบด้วย ดังนี้
        <br />
        1) ยุทธศาสตร์หรือแนวทาง (หน้า 27)
        <br />
        2) เป้าหมาย
        <br />
        3) ตัวชี้วัด
        <br />
        – เป็นแผนที่มีระยะเวลาบังคับใช้ครอบคลุมปีงบประมาณปัจจุบัน
        <br />
      </div>

      <p className="text-xl">File PDF</p>
      <div className="py-4 hover:text-blue-500 dark:hover:text-blue-400">
        {" "}
        <LinkPreview url="/images/ita/pdf/o4.pdf">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. แผนพัฒนาการจัดการศึกษาวิทยาลัยเทคนิคกันทรลักษ์
          </p>{" "}
        </LinkPreview>{" "}
      </div>
    </>
  );
}
