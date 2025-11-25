import React from "react";
import { Image } from "@heroui/image";

export default function WSP() {
  return (
    <>
      <h1 className="py-2 text-center text-xl">
        คณะผู้รับผิดชอบ งานโครงการสถานศึกษาสีขาว
      </h1>
      <div className="flex justify-center pb-4">
        <div className="rounded-[22px] pt-4">
          <Image src="/images/error.webp" alt="Image description ทรัพยากร" />
        </div>
      </div>
      <div className="py-6 text-base sm:text-lg">
        <p className="text-xl">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
        1. จัดทำมาตรฐานการป้องกันและแก้ไขปัญหายาเสพติด
        รวมถึงการสร้างความรู้ความเข้าใจเกี่ยวกับโทษและพิษภัยของยาเสพติด <br />
        2.
        กิจกรรมเพื่อสร้างความตระหนักและส่งเสริมความรู้เกี่ยวกับโทษและพิษภัยของยาเสพติดและอบายมุข
        รวมถึงการใช้เวลาว่างให้เป้นประโยชน์
        <br />
        3. ส่งเสริมความร่วมมือระหว่างครู อาจารย์ นักเรียน ผู้ปกครอง และชุมชน
        ในการป้องกันและแก้ไขปัญหายาเสพติดและอบายมุข
        <br />
        4. สร้างและพัฒนาเครือข่ายกับหน่วยงานภายนอก
        เพื่อการป้องกันและแก้ไขปัญหายาเสพติดและอบายมุขอย่างยั่งยืน
        <br />
        5. ติดตามและประเมินผลการดำเนินงานโครงการสถายศึกาาสีขอวอย่างต่อเนื่อง
        เพื่อปรับปรุงและพัฒนาการดำเนินงานให้มีประสิทธิภาพ
        <br />
        6. ปฏิบัติงานอื่น ๆ ที่ได้รับมอบหมาย
      </div>
      <div className="grid gap-4 md:grid-flow-col">
        <div className="flex items-center justify-center rounded-[22px] pt-4">
          <Image src="/images/error.webp" alt="Image description ทรัพยากร" />
        </div>
      </div>
      <p className="text-center">นายยศพล นีละเสน</p>
    </>
  );
}
