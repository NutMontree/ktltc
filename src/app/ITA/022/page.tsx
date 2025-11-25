import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        - แสดงผลการจัดซื้อจัดจ้างของสถานศึกษา <br />
        - มีข้อมูลรายละเอียดผลการจัดซื้อจัดจ้าง อย่างน้อย ประกอบด้วย ดังนี้
        1.ชื่อหน่วยงาน 2. งานที่ซื้อหรือจ้าง 3. วงเงินที่ซื้อหรือจ้าง 4.
        วิธีซื้อหรือจัดจ้าง 5. รายชื่อผู้เสนอราคา 6. ราคาที่เสนอ 7.
        รายชื่อผู้ประกอบการที่ได้คัดเลือก 8. ราคาที่ตกลงซื้อหรือจ้าง คัดเลือก 9.
        เหตุผลที่คัดเลือกโดยสรุป 10.
        เลขที่และวันที่ของสัญญาหรือข้อตกลงในการซื้อหรือจ้าง หรือ
        ตามแบบฟอร์มระบบจัดซื้อจัดจ้างภาครัฐของกรมบัญชีกลาง <br />
        - เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ <br />
      </div>

      <p className="pt-4 text-xl">File PDF</p>
      <div className="py-4">
        {" "}
        <Link href="/images/ita/pdf/o22.pdf">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. แสดงผลการจัดซื้อจัดจ้างของสถานศึกษา PDF
          </p>{" "}
        </Link>{" "}
      </div>
    </>
  );
}
