import { LinkPreview } from '@/components/ui/link-preview'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                – แสดงข้อมูลสถิติการให้บริการสถานศึกษา <br />
                – สามารถจัดทำข้อมูลแบบเป็นรายเดือน หรือไตรมาส ราย 6 เดือน ที่มีครอบคุลม ในระยะเวลา 6 เดือนแรกของ ปีงบประมาณปัจจุบัน <br />
                – เป็นข้อมูลที่เกิดจากการให้บริการจากสถานศึกษา เช่น ความพึงพอใจในการบริการ Fix it ช่วงเทศกาลปีใหม่, จำนวนผู้ใช้บริการห้องสมุดสถานศึกษา เป็นต้น <br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='/images/ita/pdf/o14-1.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>01. สรุปข้อมูลการให้บริการตรวจรถประจำวัน</p> </LinkPreview> </div>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='/images/ita/pdf/o14-2.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>02. fix it center 18 มิถุนายน 2568</p> </LinkPreview> </div>
                <p className='text-xl pt-4'>Link Wab Page</p>
                <div className='hover:text-blue-500 dark:hover:text-blue-400'> <LinkPreview url='https://vecrsa.vec.go.th/index.php'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>03. สถานที่ตั้งศูนย์อาชีวะอาสาทั่วประเทศ จำนวน 150 ศูนย์</p> </LinkPreview> </div>
            </div>
        </>
    )
}
