import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงสรุปผลการจัดซื้อจัดจ้างของสถานศึกษา<br />
                – มีข้อมูลรายละเอียดผลการจัดซื้อจัดจ้าง อย่างน้อยประกอบด้วย ดังนี้ <br />
                1. ชื่อหน่วยงาน <br />
                2. งานที่ซื้อหรือจ้าง <br />
                3. วงเงินที่ซื้อหรือจ้าง <br />
                4. วิธีซื้อหรือจัดจ้าง <br />
                5. รายชื่อผู้เสนอราคา <br />
                6. ราคาที่เสนอ <br />
                7. รายชื่อผู้ประกอบการที่ได้คัดเลือก <br />
                8. ราคาที่ตกลงซื้อหรือจ้าง คัดเลือก <br />
                9. เหตุผลที่คัดเลือกโดยสรุป <br />
                10. เลขที่และวันที่ของสัญญา หรือข้อตกลงในการซื้อหรือจ้าง หรือ ตามแบบฟอร์มระบบจัดซื้อจัดจ้างภาครัฐของกรมบัญชีกลาง <br />
                – เป็นข้อมูลแบบรายเดือน ที่มีข้อมูลครอบคลุมในระยะเวลา 6 เดือนแรกของปีงบประมาณปัจจุบัน <br />
            </div>

            <p className='text-xl pt-4'>File PDF</p>
            <div className='py-4'> <Link href='/images/ita/pdf/o-21.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. สรุปผลการดำเนินการจัดซื้อจัดจ้าง</p> </Link> </div>
        </>
    )
}
