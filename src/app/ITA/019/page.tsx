import { LinkPreview } from "@/components/ui/link-preview";
import Image from "next/image";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        –
        แสดงแผนการจัดซื้อจัดจ้างหรือแผนการจัดหาพัสดุตามที่สถานศึกษาจะต้องดำเนินการตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารงานพัสดุภาครัฐ
        พ.ศ.2560
        <br />
        – เป็นข้อมูลในการจัดซื้อจัดจ้างในปีงบประมาณปัจจุบัน
        *กรณีไม่มีการจัดซื้อจัดจ้างที่มีวงเงินเกิน 5
        แสนบาทหรือการจัดซื้อจัดจ้างที่กฏหมายไม่ได้กำหนดให้ต้องเผยแพร่แผนการจัดซื้อจัดจ้าง
        ให้สถานศึกษาอธิบายเพิ่มเติม โดยละเอียด
        หรือเผยแพร่ว่าไม่มีการจัดซื้อจัดจ้างในกรณีดังกล่าว <br />
      </div>

      <div className="grid gap-4 py-4">
        <p className="text-xl">File PDF</p>
        <div>
          {" "}
          <LinkPreview url="/images/ita/pdf/ประกาศจัดทำแผน_อุปกรณ์การเรียนของนักเรีย.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. ประกาศจัดทำแผน อุปกรณ์การเรียนของนักเรีย
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <p className="pt-4 text-xl">Link Wab Page</p>
        <div>
          {" "}
          <LinkPreview url="https://www.gprocurement.go.th/new_index.html">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. เว็บไซต์ pgrocurement ระบบการจัดซื้อจัดจ้างภาครัฐ
            </p>{" "}
          </LinkPreview>
        </div>
        <Image
          className="pt-6"
          src="/images/ita/pdf/o19.jpg"
          alt={"o19"}
          width={500}
          height={500}
        />{" "}
      </div>
    </>
  );
}
