import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - แสดงผลการดําเนินงานตามแผนการใช้จ่ายงบประมาณประจําปี <br />
                - มีข้อมูลรายละเอียดสรุปผลการใช้จ่ายงบประมาณ อย่างน้อย ประกอบด้วย ดังนี้ <br />
                1. ผลการใช้งบประมาณตามประเภทรายการใช้จ่าย ได้แก่งบอุดหนุน งบลงทุน งบดําเนินงาน งบบุคลากร งบรายจ่ายอื่น <br />
                2. ปรากฎแผนงาน หรือ ผลผลิต หรือ โครงการ หรือ รายการ ในการใช้จ่ายงบประมาณตามประเภทรายการใช้จ่าย <br />
                - เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ <br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='py-4'> <LinkPreview url='/images/ita/pdf/o18ผลการใช้จ่ายงบประมาณประจำปี.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. ผลการใช้จ่ายงบประมาณประจำปี</p> </LinkPreview> </div>
        </>
    )
}
