import React from 'react';
import { LinkPreview } from "@/components/ui/link-preview";
export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>แสดงข้อมูลหน้าที่และอำนาจของสถานศึกษาตามที่กฎหมายกำหนด เช่น คำสั่งมอบหมายหน้าที่ของสถานศึกษา ระเบียบสำนักงานคณะกรรมการอาชีวศึกษา ว่าด้วยการบริหารสถานศึกษา เป็นต้น</p>
            </div>

            <div className='hover:text-blue-500 dark:hover:text-blue-400'>
                <LinkPreview
                    url='https://ktltc.vercel.app/technicalcollegeorders/Technical2567/technical6710/tech16'>
                    <p>1. คำสั่งมอบหมายหน้าที่ให้บุคลากรปฏิบัติหน้าที่ ประจำปีการศึกษา 2567</p>
                </LinkPreview>
            </div>
        </>
    )
}
