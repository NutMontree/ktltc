import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        แสดงรายการผลประเมินควบคุมภายใน อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้
        <br />
        1. ด้านสภาพแวดล้อม
        <br />
        2. ด้านการประเมินความเสี่ยง
        <br />
        3. ด้านสารสนเทศและการสื่อสาร
        <br />
        4. ด้านการติดตามและประเมินผล
        <br />
        - เป็นการดําเนินการย้อนหลัง 1 ปีงบประมาณ <br />
      </div>
      <p className="pt-4 text-xl">File PDF</p>
      <div className="grid gap-2 pt-4">
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <Link href="/images/ita/pdf/o32การประเมินผลควบคุมภายใน.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. แผนพัฒนาการจัดการศึกษาวิทยาลัยเทคนิคกันทรลักษ์
            </p>{" "}
          </Link>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <Link href="/images/ita/pdf/รายงานการประเมินองค์ประกอบของการควบคุม.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. รายงานการประเมินองค์ประกอบของการควบคุมภายใน
            </p>{" "}
          </Link>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <Link href="/images/ita/pdf/หนังสือรับรองการประเมินการควบคุมภายในขอ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              3. หนังสือรับรองการประเมินการควบคุมภายในของสถานศึกษา
            </p>{" "}
          </Link>{" "}
        </div>
      </div>
    </>
  );
}
