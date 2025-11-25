import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        – แสดงแผนการดำเนินภารกิจของสถานศึกษาที่มีระยะ 1 ปี <br />
        – มีข้อมูลรายละเอียดของแผน อย่างน้อย ประกอบด้วย ดังนี้ <br />
        1) โครงการหรือกิจกรรม
        <br />
        2) งบประมาณที่ใช้
        <br />
        3) ระยะเวลาในการดำเนินการ
        <br />
        – เป็นแผนที่มีระยะเวลาบังคับใช้ในปีงบประมาณปัจุบัน
        <br />
      </div>

      <p className="text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div>
          {" "}
          <LinkPreview url="/images/ita/pdf/o10-โครงการ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. โครงการจัดทำบัตรประจำตัวนักเรียน นักศึกษา ประจำปีการศึกษา 2568
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div>
          {" "}
          <LinkPreview url="/images/ita/pdf/o10-รวมรูปเล่มแผนปฎิบัติราชการ_ปีงบประมาณ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. รวมรูปเล่มแผนปฎิบัติราชการ ปีงบประมาณ 2568
            </p>{" "}
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
