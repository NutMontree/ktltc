import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        -
        แสดงการดําเนินโครงการ/กิจกรรมที่แสดงถึงการพัฒนาทรัพยากรบุคคลจํานวนไม่น้อยกว่า
        3 โครงการ/กิจกรรม อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้ <br />
        1. โครงการ/กิจกรรม <br />
        2. งบประมาณ <br />
        3. กลุ่มเป้าหมาย <br />
        4. ระยะเวลาดําเนินโครงการ/กิจกรรม <br />
        - เป็นการดําเนินการในปีงบประมาณปัจจุบัน <br />
      </div>

      <p className="pt-4 text-xl">File PDF</p>
      <div className="grid gap-4 py-4">
        <div>
          {" "}
          <Link href="/images/ita/pdf/o23-โครงการอบรมเชิงปฏิบัติการขยายผลการประ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              1.
              โครงการอบรมเชิงปฏิบัติการขยายผลการประเมินคูณธรรมและความโปร่งใสในการดำเนินงาน
              (ITA){" "}
            </p>{" "}
          </Link>{" "}
        </div>
        <div>
          {" "}
          <Link href="/images/ita/pdf/o23-โครงการพัฒนาระบบการประกันคุณภาพฯ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              2. โครงการพัฒนาระบบการประกันคุณภาพและมาตรฐานการศึกษา
              ประจำปีการศึกษา 2568
            </p>{" "}
          </Link>{" "}
        </div>
        <div>
          {" "}
          <Link href="/images/ita/pdf/o23-โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจใ.pdf">
            {" "}
            <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
              3. โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจในการบริการ
              เพื่อยกระดับคุณภาพการจัดการศึกษา วิทยาลัยเทคนิคกันทรลักษ์ ปี 2568
            </p>{" "}
          </Link>{" "}
        </div>
      </div>
    </>
  );
}
