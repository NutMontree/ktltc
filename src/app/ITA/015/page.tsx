import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <>
      <div className="pb-6 text-xs text-blue-500 md:text-sm lg:text-base dark:text-blue-400">
        – แสดงผลสำรวจความพึงพอใจการให้บริการของสถานศึกษา เช่น
        ความพึงพอใจต่อการจัดการเรียนรู้ของ <br />
        ผู้สอน, ความพึงพอใจต่อการเข้าร่วมโครงการ, ความพึงพอใจการจัดงานกีฬาสี
        เป็นต้น
        <br />
        – เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ
        <br />
      </div>

      <p className="text-xl">File PDF</p>
      <div className="py-4">
        {" "}
        <Link href="/images/ita/pdf/รายงานสรุปสำรวจความพึ่งพอใจของผู้รับบริ.pdf">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            1. รายงานสรุปผลสำรวจความพึ่งพอใจของผู้รับบริการศูนย์ราชการสะดวก
          </p>{" "}
        </Link>{" "}
      </div>
      <div>
        {" "}
        <Link href="/images/ita/pdf/แบบสำรวจสำรวจความพึ่งพอใจของผู้รับบริกา.pdf">
          {" "}
          <p className="text-3 md:text-3.5 hover:text-orange-500 sm:text-sm md:text-base dark:hover:text-orange-400">
            2. แบบสำรวจความพึ่งพอใจของผู้รับบริการศูนย์ราชการสะดวก
          </p>{" "}
        </Link>{" "}
      </div>
    </>
  );
}
