import React from "react";
import { Image } from "@heroui/image";

export default function PRW() {
  return (
    <>
      <h1 className="py-2 text-center text-xl">คณะผู้รับผิดชอบงาน</h1>
      <div className="flex justify-center pb-4">
        <div className="rounded-[22px] pt-4">
          <Image
            src="/images/บุคลากร/ทรัพยากร/ประชาสัมพันธ์.webp"
            alt="Image description ทรัพยากร"
          />
        </div>
      </div>
      <div className="py-6 text-base sm:text-lg">
        <p className="text-xl">มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
        <p>
          1. รวบรวมและเผยแพร่ข่าวสารที่เกี่ยวข้องกับสถานศึกษารวมทั้งข่าวสารอื่นๆ
          ให้แก่บุคลากรในสถานศึกษาและบุคคลทั่วไป
        </p>
        <p>
          2. รับผิดชอบต่อศูนย์กลางการติดต่อสื่อสารต่างๆ
          ของสถานศึกษาทั้งภายในและภายนอกสถานศึกษา เช่น ศูนย์ควบคุมเสียงตามสาย
          ศูนย์วิทยุสื่อสาร โทรศัพท์ภายในและภายนอก
          สถานีวิทยุและสื่อสารด้วยระบบการจัดการด้วยระบบอิเล็กทรอนิกส์ เป็นต้น
        </p>
        <p>
          3. เป็นศูนย์ข้อมูลข่าวสารของราชการ ประสานงานกับชุมชน ท้องถิ่น
          ส่วนราชการสถานศึกษาอื่นๆ สื่อมวลชนและประชาชน เพื่อการประชาสัมพันธ์
        </p>
        <p>
          4. ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย
        </p>
        <p>
          5. จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับ
        </p>
      </div>
      <div className="grid gap-4 md:grid-flow-col">
        <div className="rounded-[22px] pt-4">
          <Image
            src="/images/บุคลากร/ทรัพยากร/12.webp"
            alt="Image description ทรัพยากร"
          />
        </div>
        {/* <div className='rounded-[22px] pt-4'>
                                <Image src="/images/บุคลากร/ทรัพยากร/บริหารงานทั่วไป.webp" alt="Image description ทรัพยากร" />
                            </div> */}
      </div>
    </>
  );
}
