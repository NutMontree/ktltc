import React from 'react'
import { Image } from "@nextui-org/react";

export default function GAD() {
    return (
        <>
            <h1 className='text-xl text-center py-2'>คณะผู้รับผิดชอบงาน</h1>
            <div className='flex justify-center pb-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/บริหารงานทั่วไป.webp" alt="Image description ทรัพยากร" />
                </div>
            </div>
            <div className='text-base sm:text-lg py-6'>
                <p className='text-xl'>มีหน้าที่และความรับผิดชอบ ดังต่อไปนี้</p>
                <p>1. แนะนำ เผยแพร่ และดำเนินการเกี่ยวกับการบริหารงานบุคลากรในสถานศึกษาให้เป็นไปตามระเบียบของทางราชการ</p>
                <p>2. จัดทำแผนอัตรากำลังบุคลากรในสถานศึกษา</p>
                <p>3. จัดทำแผนและดำเนินการพัฒนาบุคลากรในสถานศึกษา</p>
                <p>4. ควบคุม จัดทำสถิติ และรายงานเกี่ยวกับการลงเวลาปฏิบัติราชการและการลาของบุคลากรในสถานศึกษา</p>
                <p>5. ดำเนินการเกี่ยวกับการขอเครื่องราชอิสริยาภรณ์ การจัดทำทะเบียนประวัติของบุคลากรในสถานศึกษา</p>
                <p>6. ให้คำแนะนำ อำนวยความสะดวกแก่บุคลากรในสถานศึกษาในด้านต่างๆ เช่น การขอมีบัตรประจำตัวเจ้าหน้าที่ของรัฐ การขอแก้ไขทะเบียนประวัติ การขอเปลี่ยนตำแหน่ง การขอมีและขอเลื่อนวิทยฐานะ การออกหนังสือรับรอง การขอรับเงินบำเหน็จบำนาญ เงินทดแทนและการจัดทำสมุดบันทึกผลงาน และคุณงามความดีของบุคลากรในสถานศึกษา
                </p>
                <p>7. การดำเนินการทางวินัยของบุคลากรในสถานศึกษา</p>
                <p>8. การจัดสวัสดิการภายในให้แก่บุคลากรในสถานศึกษา</p>
                <p>9. ประสานงานและให้ความร่วมมือกับหน่วยงานต่างๆ ทั้งภายในและภายนอกสถานศึกษา</p>
                <p>10. จัดทำปฏิทินปฏิบัติงานเสนอโครงการและรายงานการปฏิบัติงานตามลำดับขั้น</p>
                <p>11. ดูแลบำรุงรักษา และรับผิดชอบทรัพย์สินของสถานศึกษาที่ได้รับมอบหมาย</p>
                <p>12. ปฏิบัติงานอื่นตามที่ได้รับมอบหมาย</p>
            </div>
            <div className='grid md:grid-flow-col gap-4'>
                <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/1.webp" alt="Image description ทรัพยากร" />
                </div>
                {/* <div className='rounded-[22px] pt-4'>
                    <Image src="/images/บุคลากร/ทรัพยากร/บริหารงานทั่วไป.webp" alt="Image description ทรัพยากร" />
                </div> */}
            </div>

        </>
    )

}
