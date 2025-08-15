import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - แสดงผลการดําเนินงานตามโครงการ/กิจกรรม จํานวนไม่น้อยกว่า 3 โครงการ/กิจกรรม ที่แสดงถึงการพัฒนาทรัพยากร มีข้อมูลรายละเอียดสรุปผลการดําเนินการ อย่างน้อย ประกอบด้วย ดังนี้ <br />
                1. ผลการดําเนินการโครงการหรือกิจกรรม<br />
                2. ผลการใช้จ่ายงบประมาณ<br />
                (หากไม่มี ระบุว่า “ไม่ใช้งบประมาณ”)<br />
                3. ปัญหา อุปสรรค และข้อเสนอแนะ<br />
                (หากไม่มีปัญหา อุปสรรค และข้อเสนอแนะ ระบุว่า “ไม่มี”)<br />
                - เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ <br />
            </div>

            <p className='text-xl pt-4'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div> <LinkPreview url='/images/ita/pdf/o25-โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. โครงการอบรมเชิงปฏิบัติการในหัวข้อ "หัวใจในการบริการ เพื่อยกระดับคุณภาพการจัดการศึกาา วิทยาลัยเทคนิคกันทรลักษ์ ปี 2568"</p> </LinkPreview> </div>
                <div> <LinkPreview url='/images/ita/pdf/o25-ประเมินผลโครงการพัฒนาระบบประกันฯ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. ประเมินผลโครงการพัฒนาระบบประกันฯ"</p> </LinkPreview> </div>
            </div>

        </>
    )
}