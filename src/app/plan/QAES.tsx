import React from "react";
import { LinkPreview } from "@/components/ui/link-preview";
import { Image } from "@heroui/image";
import { Button } from "@heroui/react";

export default function QAES() {
  return (
    <>
      <h1 className="py-2 text-center text-xl">
        คณะผู้รับผิดชอบงานประกันคุณภาพและมาตรฐานการศึกษา
      </h1>
      <div className="flex justify-center pb-4">
        <div className="rounded-[22px] pt-4">
          <Image src="/images/error.webp" alt="Image" />
        </div>
      </div>
      <div className="py-6 text-base sm:text-lg">
        <p className="text-xl">
          1. ส่งเสริมสนับสนุนให้บุคลากรในสถานศึกษาได้มีความรู้ความเข้าใจหลักการ
          จุดหมายและหลักเหณฑ์ของการประกันคุณภาพและมาตรฐานการศึกษา
        </p>
        <p>
          2. วางแผนดำเนินงานด้านการประกันคุณภาพและมาตรฐานการศึกษาของสถานศึกษา
          เพื่อนำไปสู่การพัฒนาคุณภาพและมาตรฐานการศึกษาอย่างต่อเนื่องและรองรับการประเมินคุณภาพการศึกษาภายในและภายนอก
        </p>
        <p>
          3. ประสานงานกับฝ่ายต่างๆ แผนกวิชา และงานต่างๆ
          ในสถานศึกษารวมทั้งสถานประกอบการ บุคคล องค์กรและหน่วยงานภายนอก
          ในการดำเนินงานตามระบบการประกันคุณภาพการศึกษา
        </p>
        <p>
          4. ประสานกับสำนักงานรับรองมาตรฐานและประเมินคุณภาพการศึกษา
          (องค์การมหาชน) ในการดำเนินงานตามระบบการประกันคุณภาพภายนอกของสถานศึกษา
        </p>
        <p>
          5. ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ
          ทั้งภายในและภายนอกสถานศึกษา
        </p>
        <p>
          6. จัดทำปฏิทินปฏิบัติงาน เสนโครงการและรายงานการปฏิบัติงานตามลำดับขั้น
        </p>
        <p>
          7. ดูแล บำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย
        </p>
        <p>8. ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย </p>
      </div>
      <div className="grid gap-4 md:grid-flow-col">
        <div className="rounded-[22px] pt-4">
          <Image
            src="/images/บุคลากร/แผน/2.webp"
            alt="Image description ทรัพยากร"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-8">
        <Button className="px-12 py-8 text-xl" color="primary" variant="shadow">
          <LinkPreview url="/plan/sar">
            รายงานประจำของสถานศึกษา (SAR)
          </LinkPreview>
        </Button>
        <Button className="px-12 py-8 text-xl" color="primary" variant="shadow">
          <LinkPreview
            url="/pdf/งานประกันฯ/ฉบับจริงรายงานการประกันภายนอกรอบ5.pdf"
            target="_blank"
          >
            ฉบับจริงรายงานการประกันภายนอกรอบ5
          </LinkPreview>
        </Button>
      </div>
    </>
  );
}
