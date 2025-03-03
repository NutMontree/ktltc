
import React from 'react'
import { Image } from "@nextui-org/react";

export default function CW() {
    return (
        <>
            <h1 className='text-xl text-center py-2'>คณะผู้รับผิดชอบงาน</h1>
            <div className='flex justify-center pb-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/แผน/งานความร่วมมือ.webp" alt="Image description ทรัพยากร" />
                </div>
            </div>
            <div className='text-base sm:text-lg py-6'>
                <p className='text-xl'>มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
                <p>1. ประสานความร่วมมือและดำเนินกิจกรรมต่างๆ ของสถานศึกษาประสานความร่วมมือกับต่างประเทศและความช่วยเหลือจากภายนอกในการร่วมลงทุนเพื่อการศึกษา</p>
                <p>2. ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา</p>
                <p>3. จัดทำปฏิทินการปฏิบัติงานเสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น</p>
                <p>4. ดูแล บำรุงรักษาและรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย</p>
            </div>
            <div className='grid md:grid-flow-col gap-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/แผน/3.webp" alt="Image description ทรัพยากร" />
                </div>
                {/* <div className='rounded-[22px] pt-4'>
                                                        <Image src="/images/บุคลากร/ทรัพยากร/บริหารงานทั่วไป.webp" alt="Image description ทรัพยากร" />
                                                    </div> */}
            </div>
        </>
    )
}
