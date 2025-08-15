import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงผลการดำเนินงานตามแผนดำเนินงานประจำปี<br />
                – มีข้อมูลรายละเอียดสรุปผลการดำเนินงานย้อนหลัง 1 ปีงบประมาณ อย่างน้อย ประกอบด้วยดังนี้<br />
                1) ผลการดำเนินโครงการหรือกิจกรรม<br />
                2) ผลการใช้จ่ายงบประมาณ<br />
                3) ปัญหา อุปสรรค และข้อเสนอแนะ<br />
                (หากไม่มีปัญหา อุปสรรค และข้อเสนอแนะ ให้เขียนบอกว่า "ไม่มีปัญหา อุปสรรค และข้อเสนอแนะ" แต่ต้องปรากฎรายละเอียดครบทั้ง 3 องค์ประกอบ)<br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='py-4'> <LinkPreview url='/images/ita/pdf/o11รายงานผลการดำเนินงานประจำปี.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. รายงานผลการดำเนินงานประจำปี</p> </LinkPreview> </div>
        </>
    )
}
