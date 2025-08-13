import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                สดงรายการผลประเมินควบคุมภายใน อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้<br />
                1. ด้านสภาพแวดล้อม<br />
                2. ด้านการประเมินความเสี่ยง<br />
                3. ด้านสารสนเทศและการสื่อสาร<br />
                4. ด้านการติดตามและประเมินผล<br />
                - เป็นการดําเนินการย้อนหลัง 1 ปีงบประมาณ <br />
            </div>

            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <LinkPreview
                    url='/images/ita/pdf/o32การประเมินผลควบคุมภายใน.pdf'>
                    <p className='hover:text-orange-500 dark:hover:text-orange-400'>1. แผนพัฒนาการจัดการศึกษาวิทยาลัยเทคนิคกันทรลักษ์</p>
                </LinkPreview>
            </div>
        </>
    )
}
