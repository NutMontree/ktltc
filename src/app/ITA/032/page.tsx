import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                แสดงรายการผลประเมินควบคุมภายใน อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้<br />
                1. ด้านสภาพแวดล้อม<br />
                2. ด้านการประเมินความเสี่ยง<br />
                3. ด้านสารสนเทศและการสื่อสาร<br />
                4. ด้านการติดตามและประเมินผล<br />
                - เป็นการดําเนินการย้อนหลัง 1 ปีงบประมาณ <br />
            </div>
            <p className='text-xl pt-4'>File PDF</p>
            <div className='grid gap-2  pt-4'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <Link href='/images/ita/pdf/o32การประเมินผลควบคุมภายใน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. แผนพัฒนาการจัดการศึกษาวิทยาลัยเทคนิคกันทรลักษ์</p> </Link> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <Link href='/images/ita/pdf/รายงานการประเมินองค์ประกอบของการควบคุม.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. รายงานการประเมินองค์ประกอบของการควบคุมภายใน</p> </Link> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <Link href='/images/ita/pdf/หนังสือรับรองการประเมินการควบคุมภายในขอ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. หนังสือรับรองการประเมินการควบคุมภายในของสถานศึกษา</p> </Link> </div>
            </div>
        </>
    )
}
