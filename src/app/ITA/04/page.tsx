import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงแผนการดำเนินภารกิจของสถานศึกษาที่มีระยะมากกว่า 1 ปี <br />
                – มีข้อมูลรายละเอียดของแผนฯ อย่างน้อย ประกอบด้วย ดังนี้<br />
                1) ยุทธศาสตร์หรือแนวทาง (หน้า 27)<br />
                2) เป้าหมาย<br />
                3) ตัวชี้วัด<br />
                – เป็นแผนที่มีระยะเวลาบังคับใช้ครอบคลุมปีงบประมาณปัจจุบัน<br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='hover:text-blue-500 dark:hover:text-blue-400 py-4'> <LinkPreview url='/images/ita/pdf/o4.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. แผนพัฒนาการจัดการศึกษาวิทยาลัยเทคนิคกันทรลักษ์</p> </LinkPreview> </div>
        </>
    )
}
