import React from 'react';
import { LinkPreview } from "@/components/ui/link-preview";

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>– แสดงข้อมูลข่าวสารต่าง ๆ ที่เกี่ยวข้องกับการดำเนินงานตาม อำนาจหน้าที่หรือภารกิจ ของสถานศึกษาเป็นข้อมูลข่าวสารที่เกิดขึ้นในปีงบประมาณปัจจุบัน</p>
            </div>

            <p className='text-xl'>Link Wab Page</p>
            <div className='grid gap-4 py-4'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://ktltc.vercel.app/pressrelease'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. ข่าวประชาสัมพันธ์</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://ktltc.vercel.app/newsletter'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. จดหมายข่าว</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://ktltc.vercel.app/announcement'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. ข่าวประกาศ</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://ktltc.vercel.app/bidding'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>4. ข่าวประกวดราคา</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://ktltc.vercel.app/technicalcollegeorders'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>5. คำสั่งวิทยาลัยเทคนิค</p> </LinkPreview> </div>
            </div>
        </>
    )
}
