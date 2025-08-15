import { LinkPreview } from '@/components/ui/link-preview'
import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงช่องทางที่บุคคลภายนอกสามารถแจ้งเรื่องร้องเรียนเกี่ยวกับการทุจริตและการประพฤติมิชอบของบุคลากรทางการศึกษาของสถานศึกษาผ่านช่องทางออนไลน์ของสถานศึกษา โดยแยกต่างหากจากช่องทางการร้องเรียนทั่วไป เพื่อเป็นการคุ้มครองข้อมูลผู้แจ้งเบาะแส และเพื่อให้สอดคล้องกับแนวปฏิบัติการจัดการเรื่องร้องเรียนการทุจริตและประพฤติมิชอบ <br />
                – สามารถเข้าถึงหรือเชื่อมโยงไปยังช่องทางข้างต้นได้จากเว็บไซต์หลักของสถานศึกษา <br />
            </div>

            <p className='text-xl pt-4'>Link To Line App groub</p>
            <div className='hover:text-blue-500 dark:hover:text-blue-400 py-4'> <LinkPreview target="_blank" url='https://line.me/ti/g2/lE1gdiKYbUTFrBCjWTUY7DjOQx2dSw2QPAv4fw?utm_source=invitation&utm_medium=QR_code&utm_campaign=default'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>01. ศูนย์ GECC ร้องทุกข์</p> </LinkPreview> </div>
        </>
    )
}
