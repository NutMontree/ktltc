import { LinkPreview } from "@/components/ui/link-preview";
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p> – แสดงประกาศการจัดซื้อจัดจ้างตามที่สถานศึกษาจะต้องดำเนินการตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ.2560  เช่น ประกาศเชิญชวน, ประกาศผลการจัดซื้อจัดจ้าง เป็นต้น </p>
                <p> – เป็นข้อมูลการจัดซื้อจัดจ้างในปีงบประมาณปัจจุบัน </p>
            </div >

            <div className="grid gap-4 ">
                <p className='text-xl pt-4'>Link Wab Page</p>
                <div className='hover:text-blue-500 dark:hover:text-blue-400 color'>
                    <LinkPreview

                        url='https://ktltc.vercel.app/bidding'>
                        <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>ข่าวประกวดราคา</p>
                    </LinkPreview>
                </div>

                <p className='text-xl pt-4'>File PDF</p>
                <div className='hover:text-blue-500 dark:hover:text-blue-400 color'> <LinkPreview url='/images/ita/pdf/o20(1).pdf'><p className='flexhover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. ประกาศจัดทำแผนครัวร้อน ครัวเย็น งปม 2568</p></LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400 color'> <LinkPreview url='/images/ita/pdf/o20(2).pdf'><p className='flexhover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. ประกาศผู้ชนะการเสนอราคา ครัวร้อน ครัวเย็น</p></LinkPreview> </div>
            </div>
        </>
    )
}
