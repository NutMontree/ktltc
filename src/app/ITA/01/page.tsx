import React from 'react';
import { LinkPreview } from "@/components/ui/link-preview";

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    – แสดงแผนผัง แสดงโครงสร้างการแบ่งส่วนราชการของ สถานศึกษา
                </p>
                <p>
                    – แสดงตำแหน่งที่สำคัญและการแบ่งส่วนงานภายใน ยกตัวอย่างเช่น ฝ่าย งาน แผนกวิชา เป็นต้น
                </p>
            </div>

            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <LinkPreview
                    url='https://ktltc.vercel.app/administrativestructure'>
                    <p>1. ข้อมูลโครงสร้างวิทยาลัยฯ</p>
                </LinkPreview>
            </div>
        </>
    )
}
