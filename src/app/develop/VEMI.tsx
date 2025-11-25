import React from "react";
import { Image } from "@heroui/image";

export default function VEMI() {
  return (
    <>
      <h1 className="py-2 text-center text-xl">
        คณะผู้รับผิดชอบ งานสถานศึกษาคุณธรรมอาชีวศึกษา
      </h1>
      <div className="flex justify-center pb-4">
        <div className="rounded-[22px] pt-4">
          <Image src="/images/error.webp" alt="Image description ทรัพยากร" />
        </div>
      </div>
      <div className="py-6 text-base sm:text-lg">
        <p className="text-xl">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
        1. ศึกษาแนวทางกรดำเนินสถานศึกาาคุณธรรมอาชีวศึกษา <br />
        2. จัดทำปฏิทินการเสนอโครงการและรายงานโครงการที่ได้ปฏิบัติตามเป้าหมาย 5
        ด้าน
        <br />
        3. จัดทำคู่มือการปฏิบัติโรงเรียนคุณธรรมแระจำปีการศึกษา
        <br />
        4. บันทึกหลักฐานการปฏิบัติงาน รายงานผลดำเนินโครงการเป็นภาพวิดีโอ (Clip)
        เป็นภาพประกอบและรูปเล่มเอกสาร
        <br />
        5. เตรียมความพร้อมเพื่อรับการนิเทศ
        และประเมินคุณภาพสถานศึกาาคุณธรรมอาชีวศึกษา <br />
        6. คัดเลือกโครงการคุณธรรมที่เป็นต้นแบบแระสบความสำเร็จ THE BEST
        ของสถานศึกษา
        <br />
        7. ปฏิบัติงานอื่น ๆ ที่ได้รับมอบหมาย
      </div>
      <div className="grid gap-4 md:grid-flow-col">
        <div className="flex items-center justify-center rounded-[22px] pt-4">
          <Image src="/images/error.webp" alt="Image description ทรัพยากร" />
        </div>
      </div>
      <p className="text-center">นางสาวศิริพร พื้นสวรรค์</p>
    </>
  );
}
