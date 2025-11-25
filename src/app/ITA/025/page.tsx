import { LinkPreview } from "@/components/ui/link-preview";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        - แสดงผลการดําเนินงานตามโครงการ/กิจกรรม จํานวนไม่น้อยกว่า 3
        โครงการ/กิจกรรม ที่แสดงถึงการพัฒนาทรัพยากร
        มีข้อมูลรายละเอียดสรุปผลการดําเนินการ อย่างน้อย ประกอบด้วย ดังนี้ <br />
        1. ผลการดําเนินการโครงการหรือกิจกรรม
        <br />
        2. ผลการใช้จ่ายงบประมาณ
        <br />
        (หากไม่มี ระบุว่า “ไม่ใช้งบประมาณ”)
        <br />
        3. ปัญหา อุปสรรค และข้อเสนอแนะ
        <br />
        (หากไม่มีปัญหา อุปสรรค และข้อเสนอแนะ ระบุว่า “ไม่มี”)
        <br />
        - เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ <br />
      </div>

      <p className="pt-4 text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div>
          {" "}
          <LinkPreview url="/images/ita/pdf/o25-โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1. โครงการอบรมเชิงปฏิบัติการในหัวข้อ "หัวใจในการบริการ
              เพื่อยกระดับคุณภาพการจัดการศึกาา วิทยาลัยเทคนิคกันทรลักษ์ ปี 2568"
            </p>{" "}
          </LinkPreview>{" "}
        </div>
        <div>
          {" "}
          <LinkPreview url="/images/ita/pdf/o25-ประเมินผลโครงการพัฒนาระบบประกันฯ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. ประเมินผลโครงการพัฒนาระบบประกันฯ"
            </p>{" "}
          </LinkPreview>{" "}
        </div>
      </div>
    </>
  );
}
