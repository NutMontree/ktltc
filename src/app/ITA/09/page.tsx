import { LinkPreview } from "@/components/ui/link-preview";
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'> <p>– แสดงตำแหน่งบนเว็บไซต์ของสถานศึกษาหรือช่องทางที่สามารถเชื่อมโยงไปยังเครือข่ายสังคมออนไลน์ของสถานศึกษา ยกตัวอย่าง เช่น Facebook, Twitter, Instagram, Tiktok เป็นต้น</p> </div>

            <p className='text-xl'>Link Wab Page</p>
            <div className='flex flex-col gap-4 py-4'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://www.facebook.com/profile.php?id=100057326985699'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. Facebook เพจ วิทยาลัยเทคนิคกันทรลักษ์</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://www.facebook.com/ngan.prachasamphanth.withyalay.thekhnikh'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. Facebook งานประชาสัมพันธ์ วิทยาลัยเทคนิคกันทรลักษ์ </p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://www.youtube.com/channel/UCHuaK-licd7-XrT4qQhHr3Q'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. Youtube วิทยาลัยเทคนิคกันทรลักษ์ Today</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://www.youtube.com/channel/UCDBgY-OPUZvAYkWArn5KUsw'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>4. Youtube Datacenter Department</p> </LinkPreview> </div>
            </div>

        </>
    )
}
