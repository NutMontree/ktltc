import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - มีการนําหลักสูตรต้านทุจริตศึกษาไปใช้ในการจัดการเรียนการสอน ระดับ ปวช. รหัสวิชา 20000-2003 รายวิชากิจกรรมเสริมสร้างสุจริต จิตอาสา และระดับ ปวส. รหัสวิชา 30000-2001 รายวิชากิจกรรมเสริมสร้างสุจริต จิตอาสา หรือ กิจกรรมที่เกี่ยวข้องกับการเสริมสร้างวัฒนธรรมองค์ที่เกี่ยวข้องกับการป้องกันการทุจริตในรูปแบบ อื่น ๆ เช่น โครงการ/กิจกรรม, แนวทางปฏิบัติ,ประกาศนโยบายไม่รับของขวัญ ฯลฯ <br />
            </div>

            <p className='text-xl pt-4'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div> <Link href='/images/ita/pdf/o33-แนวทางการจัดกิจกรรมเสริมสร้างสุจริต.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. แนวทางการจัดกิจกรรมเสริมสร้างสุจริต จิตอาสา ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส)</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/ปวช.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. หลักสูตร ประกาศนียบัตรวิชาชีพ ปวช PDF</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/ปวส.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. หลักสูตร ประกาศนียบัตรวิชาชีพ ปวส PDF</p> </Link> </div>
            </div>

            <p className='text-xl pt-4'>Photos</p>
            <div className='grid md:grid-cols-2 gap-8 py-4'>
                <div>
                    <p className='text-center'>หลักสูตร ประกาศนียบัตรวิชาชีพ ปวช</p>
                    <img src="/images/ita/pdf/1.webp" alt="01 o33" ></img>
                </div>
                <div>
                    <p className='text-center'>หลักสูตร ประกาศนียบัตรวิชาชีพ ปวส</p>
                    <img src="/images/ita/pdf/2.webp" alt="02 o33" ></img>
                </div>
            </div>
        </>
    )
}
