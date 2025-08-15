import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงผลสำรวจความพึงพอใจการให้บริการของสถานศึกษา เช่น ความพึงพอใจต่อการจัดการเรียนรู้ของ <br />
                ผู้สอน, ความพึงพอใจต่อการเข้าร่วมโครงการ, ความพึงพอใจการจัดงานกีฬาสี เป็นต้น<br />
                – เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ<br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='py-4'> <Link href='/images/ita/pdf/รายงานสรุปสำรวจความพึ่งพอใจของผู้รับบริ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. รายงานสรุปผลสำรวจความพึ่งพอใจของผู้รับบริการศูนย์ราชการสะดวก</p> </Link> </div>
            <div> <Link href='/images/ita/pdf/แบบสำรวจสำรวจความพึ่งพอใจของผู้รับบริกา.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. แบบสำรวจความพึ่งพอใจของผู้รับบริการศูนย์ราชการสะดวก</p> </Link> </div>
        </>
    )
}
