import React from 'react'
import { Image } from "@nextui-org/react";

export default function HRD() {
    return (
        <>
            <h1 className='text-xl text-center py-2'>คณะผู้รับผิดชอบงาน</h1>
            <div className='flex justify-center pb-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/บุคลากร.webp" alt="Image description ทรัพยากร" />
                </div>
            </div>
            <div className='text-base sm:text-lg py-6'>
                <p className='text-xl'>มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
                <p>1. จัดทำเอกสารหลักฐาน บันทึกรายการบัญชี ปรับปรุงบัญชี การปิดบัญชี ของสถานศึกษา ตามระบบบัญชีและระเบียบที่เกี่ยวข้อง</p>
                <p>2. จัดทำรายงานงบการเงิน และบัญชี เพื่อจัดส่งส่วนราชการและหน่วยงานที่เกี่ยวข้องภายในกำหนดเวลาตามระเบียบ</p>
                <p>3. ควบคุมการเบิกจ่ายเงินตามประเภทเงินให้เป็นไปตามแผนปฏิบัติการประจำปี ให้คำปรึกษา ชี้แจงและอำนวยความสะดวกแก่บุคลากรในสถานศึกษาเกี่ยวกับงานในหน้าที่</p>
                <p>4. เก็บรักษาเอกสารและหลักฐานต่างๆ ไว้เพื่อการตรวจสอบและดำเนินการทำลายเอกสารตามระเบียบ</p>
                <p>5. ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา</p>
                <p>6. จัดทำปฏิทินการปฏิบัติงาน เสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น</p>
                <p>7. ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย</p>
                <p>8. ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย</p>
                <p>9. </p>
            </div>
            <div className='grid md:grid-flow-col gap-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/2.webp" alt="Image description ทรัพยากร" />
                </div>
                {/* <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/บริหารงานทั่วไป.webp" alt="Image description ทรัพยากร" />
                </div> */}
            </div>
        </>
    )
}
