import Link from 'next/link'
import React from 'react'


export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงความก้าวหน้าหรือผลการดำเนินการตามมาตรการเพื่อส่งเสริมคุณธรรมและความโปร่งใสภายในสถานศึกษา<br />
                – มีข้อมูลรายละเอียดการนำมาตรการเพื่อส่งเสริมคุณธรรมและความโปร่งใสภายในหน่วยงานใน ข้อ O36 ไปสู่การปฏิบัติอย่างเป็นรูปธรรม<br />
                – เป็นการดำเนินการในปีงบประมาณปัจจุบัน<br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <Link href='/images/ita/pdf/รายงานการประเมินองค์ประกอบของการควบคุม.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. รายงานการประเมินองค์ประกอบของการควบคุมภายใน</p> </Link> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <Link href='/images/ita/pdf/หนังสือรับรองการประเมินการควบคุมภายในขอ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. หนังสือรับรองการประเมินการควบคุมภายในของสถานศึกษา</p> </Link> </div>
            </div>
        </>
    )
}
