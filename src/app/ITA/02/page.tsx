import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    – แสดงข้อมูลของผู้อำนวยการสถานศึกษา และรองผู้อำนวยการสถานศึกษา
                    อย่างน้อย
                    ประกอบด้วย ดังนี้
                </p>
                <p>
                    – แสดงตำแหน่งที่สำคัญและการแบ่งส่วนงานภายใน ยกตัวอย่างเช่น ฝ่าย งาน แผนกวิชา เป็นต้น
                </p>
            </div>

            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <Link
                    target='_blank'
                    href='https://ktltc.vercel.app/executiveboard'>
                    <p>1. ข้อมูลโครงสร้างวิทยาลัยฯ</p>
                </Link>
            </div>
        </>
    )
}
