import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        – แสดงข้อมูลสถิติการให้บริการสถานศึกษา <br />
        – สามารถจัดทำข้อมูลแบบเป็นรายเดือน หรือไตรมาส ราย 6 เดือน ที่มีครอบคุลม
        ในระยะเวลา 6 เดือนแรกของ ปีงบประมาณปัจจุบัน <br />
        – เป็นข้อมูลที่เกิดจากการให้บริการจากสถานศึกษา เช่น
        ความพึงพอใจในการบริการ Fix it ช่วงเทศกาลปีใหม่,
        จำนวนผู้ใช้บริการห้องสมุดสถานศึกษา เป็นต้น <br />
      </div>

      <p className="text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="/images/ita/pdf/o14-1.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              01. สรุปข้อมูลการให้บริการตรวจรถประจำวัน
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="/images/ita/pdf/o14-2.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              02. fix it center 18 มิถุนายน 2568
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <p className="pt-4 text-xl">Link Wab Page</p>
        <div className="hover:text-blue-500 dark:hover:text-blue-400">
          {" "}
          <LinkPreview url="https://vecrsa.vec.go.th/index.php">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              03. สถานที่ตั้งศูนย์อาชีวะอาสาทั่วประเทศ จำนวน 150 ศูนย์
            </p>{" "}
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
