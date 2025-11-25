import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        –
        แสดงคู่มือหรือแนวทางการดำเนินการต่อเรื่องร้องเรียนที่เกี่ยวข้องกับการทุจริตและประพฤติมิชอบของเจ้าหน้าที่หรือบุคลากรทางการศึกษาในสถานศึกษา
        มีข้อมูลรายละเอียดของการปฏิบัติงาน อย่างน้อย ประกอบด้วยดังนี้
        <br />
        1) รายละเอียดวิธีที่บุคคลภายนอกจะทำการร้องเรียน
        <br />
        2) รายละเอียดขั้นตอนหรือวิธีการในการจัดการต่อเรื่องร้องเรียน
        <br />
        3) ส่วนงานที่รับผิดชอบ (รอง ผอ.)
        <br />
        4) ระยะเวลาดำเนินการ <br />
      </div>

      <p className="pt-4 text-xl">Web Link File PDF</p>
      <div className="py-4">
        {" "}
        <LinkPreview url="https://ktltc.vercel.app/pdf/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B8%E0%B8%81.pdf">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. คู่มือการดำเนินงานเรื่องร้องเรียน/ร้องทุกข์{" "}
          </p>{" "}
        </LinkPreview>{" "}
      </div>
    </>
  );
}
