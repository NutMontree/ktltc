import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - แสดงการดําเนินโครงการ/กิจกรรมที่แสดงถึงการพัฒนาทรัพยากรบุคคลจํานวนไม่น้อยกว่า 3 โครงการ/กิจกรรม อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้  <br />
                1. โครงการ/กิจกรรม <br />
                2. งบประมาณ <br />
                3. กลุ่มเป้าหมาย <br />
                4. ระยะเวลาดําเนินโครงการ/กิจกรรม <br />
                - เป็นการดําเนินการในปีงบประมาณปัจจุบัน <br />
            </div>

            <p className='text-xl pt-4'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div> <Link href='/images/ita/pdf/o23-โครงการอบรมเชิงปฏิบัติการขยายผลการประ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. โครงการอบรมเชิงปฏิบัติการขยายผลการประเมินคูณธรรมและความโปร่งใสในการดำเนินงาน (ITA) </p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o23-โครงการพัฒนาระบบการประกันคุณภาพฯ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. โครงการพัฒนาระบบการประกันคุณภาพและมาตรฐานการศึกษา ประจำปีการศึกษา 2568</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o23-โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจใ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. โรงการอบรมเชิงปฏิบัติการในหัวข้อหัวใจในการบริการ เพื่อยกระดับคุณภาพการจัดการศึกษา วิทยาลัยเทคนิคกันทรลักษ์ ปี 2568</p> </Link> </div>
            </div>
        </>
    )
}
