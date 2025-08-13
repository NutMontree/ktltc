import { LinkPreview } from '@/components/ui/link-preview'
import { Image } from "@nextui-org/react";
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงแผนการจัดซื้อจัดจ้างหรือแผนการจัดหาพัสดุตามที่สถานศึกษาจะต้องดำเนินการตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารงานพัสดุภาครัฐ พ.ศ.2560<br />
                – เป็นข้อมูลในการจัดซื้อจัดจ้างในปีงบประมาณปัจจุบัน *กรณีไม่มีการจัดซื้อจัดจ้างที่มีวงเงินเกิน 5 แสนบาทหรือการจัดซื้อจัดจ้างที่กฏหมายไม่ได้กำหนดให้ต้องเผยแพร่แผนการจัดซื้อจัดจ้าง ให้สถานศึกษาอธิบายเพิ่มเติม โดยละเอียด หรือเผยแพร่ว่าไม่มีการจัดซื้อจัดจ้างในกรณีดังกล่าว <br />
            </div>

            <div> <LinkPreview url='/images/ita/pdf/ประกาศจัดทำแผน_ครัวร้อน_ครัวเย็น_งปม.68.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>1. ประกาศจัดทำแผน ครัวร้อน ครัวเย็น งปม.68</p> </LinkPreview> </div>
            <div> <LinkPreview url='/images/ita/pdf/ประกาศจัดทำแผน_อุปกรณ์การเรียนของนักเรีย.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>2. ประกาศจัดทำแผน อุปกรณ์การเรียนของนักเรีย</p> </LinkPreview> </div>
            <div> <LinkPreview url='https://www.gprocurement.go.th/new_index.html'> <p className='hover:text-orange-500 dark:hover:text-orange-400'>3. เว็บไซต์ pgrocurement ระบบการจัดซื้อจัดจ้างภาครัฐ</p> </LinkPreview> <Image src='/images/ita/pdf/o19.jpg' alt={"o19"} /> </div>

        </>
    )
}
