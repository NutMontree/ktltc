import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงคู่มือหรือแนวทางการดำเนินการต่อเรื่องร้องเรียนที่เกี่ยวข้องกับการทุจริตและประพฤติมิชอบของเจ้าหน้าที่หรือบุคลากรทางการศึกษาในสถานศึกษา มีข้อมูลรายละเอียดของการปฏิบัติงาน อย่างน้อย ประกอบด้วยดังนี้<br />
                1) รายละเอียดวิธีที่บุคคลภายนอกจะทำการร้องเรียน<br />
                2) รายละเอียดขั้นตอนหรือวิธีการในการจัดการต่อเรื่องร้องเรียน<br />
                3) ส่วนงานที่รับผิดชอบ (รอง ผอ.)<br />
                4) ระยะเวลาดำเนินการ <br />
            </div>

            <p className='text-xl pt-4'>Web Link File PDF</p>
            <div className='py-4'> <LinkPreview url='https://ktltc.vercel.app/pdf/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B8%E0%B8%81.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. คู่มือการดำเนินงานเรื่องร้องเรียน/ร้องทุกข์ </p> </LinkPreview> </div>
        </>
    )
}
