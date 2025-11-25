import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        –
        แสดงความก้าวหน้าหรือผลการดำเนินการตามมาตรการเพื่อส่งเสริมคุณธรรมและความโปร่งใสภายในสถานศึกษา
        <br />
        –
        มีข้อมูลรายละเอียดการนำมาตรการเพื่อส่งเสริมคุณธรรมและความโปร่งใสภายในหน่วยงานใน
        ข้อ O36 ไปสู่การปฏิบัติอย่างเป็นรูปธรรม
        <br />
        – เป็นการดำเนินการในปีงบประมาณปัจจุบัน
        <br />
      </div>

      <p className="text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <Link href="/images/ita/pdf/รายงานการประเมินองค์ประกอบของการควบคุม.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. รายงานการประเมินองค์ประกอบของการควบคุมภายใน
            </p>{" "}
          </Link>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <Link href="/images/ita/pdf/หนังสือรับรองการประเมินการควบคุมภายในขอ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. หนังสือรับรองการประเมินการควบคุมภายในของสถานศึกษา
            </p>{" "}
          </Link>{" "}
        </div>
      </div>
    </>
  );
}
