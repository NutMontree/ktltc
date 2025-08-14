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

            <div className='grid gap-2 xs:gap-4'>
                <div> <LinkPreview url='/images/ita/pdf/o25-โครงการอบรมเชิงปฏิบัติการขยายผลการ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>1. โครงการอบรมเชิงปฏิบัติการขยายผลการการประเมินคุณธรรมและความโปร่งใสในการดำเนินงาน (ITA) ประจำปีงบประมาณ 2568</p> </LinkPreview> </div>
                <div> <LinkPreview url='/images/ita/pdf/o25-โครงการพัฒนาระบบการประกันคุณภาพ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>2. โครงการพัฒนาระบบการประกันคุณภาพและมารตฐานการศึกษา ประจำปีการศึกษา 2568</p> </LinkPreview> </div>
                <div> <LinkPreview url='/images/ita/pdf/o25-โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>3. โรงการอบรมเชิงปฏิบัติการในหัวข้อ "หัวใจในการบริการ เพื่อยกระดับคุณภาพการจัดการศึกาา วิทยาลัยเทคนิคกันทรลักษ์ ปี 2568"</p> </LinkPreview> </div>
            </div>

        </>
    )
}
