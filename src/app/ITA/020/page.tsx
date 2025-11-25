import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        <p>
          {" "}
          –
          แสดงประกาศการจัดซื้อจัดจ้างตามที่สถานศึกษาจะต้องดำเนินการตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ
          พ.ศ.2560 เช่น ประกาศเชิญชวน, ประกาศผลการจัดซื้อจัดจ้าง เป็นต้น{" "}
        </p>
        <p> – เป็นข้อมูลการจัดซื้อจัดจ้างในปีงบประมาณปัจจุบัน </p>
      </div>

      <div className="grid gap-4">
        <p className="pt-4 text-xl">Link Wab Page</p>
        <div className="color hover:text-blue-500 dark:hover:text-blue-400">
          <LinkPreview url="https://ktltc.vercel.app/bidding">
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              ข่าวประกวดราคา
            </p>
          </LinkPreview>
        </div>

        <p className="pt-4 text-xl">File PDF</p>
        <div className="color hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="/images/ita/pdf/o20(1).pdf">
            <p className="flexhover:text-orange-500 text-3 md:text-3.5 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. ประกาศจัดทำแผนครัวร้อน ครัวเย็น งปม 2568
            </p>
          </LinkPreview>{" "}
        </div>
        <div className="color hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="/images/ita/pdf/o20(2).pdf">
            <p className="flexhover:text-orange-500 text-3 md:text-3.5 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. ประกาศผู้ชนะการเสนอราคา ครัวร้อน ครัวเย็น
            </p>
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
