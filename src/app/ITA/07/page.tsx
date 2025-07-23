import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>– แสดงข้อมูลข่าวสารต่าง ๆ ที่เกี่ยวข้องกับการดำเนินงานตาม อำนาจหน้าที่หรือภารกิจ ของสถานศึกษาเป็นข้อมูลข่าวสารที่เกิดขึ้นในปีงบประมาณปัจจุบัน</p>
            </div>

            <div className='flex flex-col gap-1'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                    <Link
                        target='_blank'
                        href='https://ktltc.vercel.app/pressrelease'>
                        <p>1. ข่าวประชาสัมพันธ์</p>
                    </Link>
                </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                    <Link
                        target='_blank'
                        href='https://ktltc.vercel.app/newsletter'>
                        <p>2. จดหมายข่าว</p>
                    </Link>
                </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                    <Link
                        target='_blank'
                        href='https://ktltc.vercel.app/announcement'>
                        <p>3. ข่าวประกาศ</p>
                    </Link>
                </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                    <Link
                        target='_blank'
                        href='https://ktltc.vercel.app/bidding'>
                        <p>4. ข่าวประกวดราคา</p>
                    </Link>
                </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                    <Link
                        target='_blank'
                        href='https://ktltc.vercel.app/technicalcollegeorders'>
                        <p>5. คำสั่งวิทยาลัยเทคนิค</p>
                    </Link>
                </div>
            </div>
        </>
    )
}
