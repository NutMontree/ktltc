import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        - มีการนําหลักสูตรต้านทุจริตศึกษาไปใช้ในการจัดการเรียนการสอน ระดับ ปวช.
        รหัสวิชา 20000-2003 รายวิชากิจกรรมเสริมสร้างสุจริต จิตอาสา และระดับ ปวส.
        รหัสวิชา 30000-2001 รายวิชากิจกรรมเสริมสร้างสุจริต จิตอาสา หรือ
        กิจกรรมที่เกี่ยวข้องกับการเสริมสร้างวัฒนธรรมองค์ที่เกี่ยวข้องกับการป้องกันการทุจริตในรูปแบบ
        อื่น ๆ เช่น โครงการ/กิจกรรม, แนวทางปฏิบัติ,ประกาศนโยบายไม่รับของขวัญ ฯลฯ{" "}
        <br />
      </div>

      <p className="pt-4 text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div>
          {" "}
          <Link href="/images/ita/pdf/o33-แนวทางการจัดกิจกรรมเสริมสร้างสุจริต.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. แนวทางการจัดกิจกรรมเสริมสร้างสุจริต จิตอาสา
              ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส)
            </p>{" "}
          </Link>{" "}
        </div>
        <div>
          {" "}
          <Link href="/images/ita/pdf/ปวช.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. หลักสูตร ประกาศนียบัตรวิชาชีพ ปวช PDF
            </p>{" "}
          </Link>{" "}
        </div>
        <div>
          {" "}
          <Link href="/images/ita/pdf/ปวส.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              3. หลักสูตร ประกาศนียบัตรวิชาชีพ ปวส PDF
            </p>{" "}
          </Link>{" "}
        </div>
      </div>

      <p className="pt-4 text-xl">Photos</p>
      <div className="grid gap-8 py-4 md:grid-cols-2">
        <div>
          <p className="text-center">หลักสูตร ประกาศนียบัตรวิชาชีพ ปวช</p>
          <img src="/images/ita/pdf/1.webp" alt="01 o33"></img>
        </div>
        <div>
          <p className="text-center">หลักสูตร ประกาศนียบัตรวิชาชีพ ปวส</p>
          <img src="/images/ita/pdf/2.webp" alt="02 o33"></img>
        </div>
      </div>
    </>
  );
}
