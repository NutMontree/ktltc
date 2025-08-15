import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงแผนการใช้จ่ายงบประมาณของสถานศึกษาที่มีระยะเวลา 1 ปี มีข้อมูลรายละเอียดของแผนฯ อย่างน้อย ประกอบด้วย ดังนี้ <br />
                1) งบประมาณตามแหล่งที่ได้รับการจัดสรร<br />
                2) งบประมาณตามประเภทรายการใช้จ่าย<br />
                – เป็นแผนที่มีระยะเวลาบังคับใช้ในปีงบประมาณปัจจุบัน <br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='py-4'> <LinkPreview url='/images/ita/pdf/017-งบหน้า68.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. งบหน้ารายจ่ายตามแผนงาน/งาน/โครงการ/ ประจำปีงบประมาณ 2568</p> </LinkPreview> </div>
        </>
    )
}
