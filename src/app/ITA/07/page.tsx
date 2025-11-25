import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        <p>
          – แสดงข้อมูลข่าวสารต่าง ๆ ที่เกี่ยวข้องกับการดำเนินงานตาม
          อำนาจหน้าที่หรือภารกิจ
          ของสถานศึกษาเป็นข้อมูลข่าวสารที่เกิดขึ้นในปีงบประมาณปัจจุบัน
        </p>
      </div>

      <p className="text-xl">Link Wab Page</p>
      <div className="grid gap-4 py-4">
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/pressrelease">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. ข่าวประชาสัมพันธ์
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/newsletter">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. จดหมายข่าว
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/announcement">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              3. ข่าวประกาศ
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/bidding">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              4. ข่าวประกวดราคา
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://ktltc.vercel.app/technicalcollegeorders">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              5. คำสั่งวิทยาลัยเทคนิค
            </p>{" "}
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
