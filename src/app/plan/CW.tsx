import React from "react";
import { Image } from "@heroui/image";

export default function CW() {
  return (
    <>
      <h1 className="py-2 text-center text-xl">
        คณะผู้รับผิดชอบงานความร่วมมือ
      </h1>
      <div className="flex justify-center pb-4">
        <div className="rounded-[22px] pt-4">
          <Image
            src="/images/บุคลากร/แผน/งานความร่วมมือ.webp"
            alt="Image description ทรัพยากร"
          />
        </div>
      </div>
      <div className="py-6 text-base sm:text-lg">
        <p className="text-xl">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
        <p>
          1. ประสานความร่วมมือและดำเนินกิจกรรมต่างๆ
          ของสถานศึกษาประสานความร่วมมือกับต่างประเทศและความช่วยเหลือจากภายนอกในการร่วมลงทุนเพื่อการศึกษา
        </p>
        <p>
          2. ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ
          ทั้งภายในและภายนอกสถานศึกษา
        </p>
        <p>
          3.
          จัดทำปฏิทินการปฏิบัติงานเสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น
        </p>
        <p>
          4. ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย
        </p>
      </div>
      <div className="grid gap-4 md:grid-flow-col">
        <div className="rounded-[22px] pt-4">
          <Image
            src="/images/บุคลากร/แผน/6.webp"
            alt="Image description ทรัพยากร"
          />
        </div>
      </div>
    </>
  );
}
