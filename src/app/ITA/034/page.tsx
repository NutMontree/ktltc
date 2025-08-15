import React from 'react'
import OTAC from './otac/page'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    - แสดงโครงการ/กิจกรรม ที่มีวัตถุประสงค์ เพื่อป้องกันการทุจริต หรือพัฒนาด้านคุณธรรมและความโปร่งใสของสถานศึกษา อย่างน้อย ประกอบด้วยรายละเอียด ดังนี้
                </p>
                <p>
                    1. โครงการ /กิจกรรม
                </p>
                <p>
                    2. งบประมาณ (กรณีไม่ได้ใช้งบประมาณ ให้ระบุว่า ไม่ใช้งบประมาณ)
                </p>
                <p>
                    3. ช่วงเวลาดําเนินการ
                </p>
                <p>
                    - เป็นโครงการ/กิจกรรม ที่มีระยะเวลาบังคับใช้ใน
                </p>
                <p>
                    ปีงบประมาณปัจจุบัน
                </p>
            </div >

            <p className='text-xl'>Link Wab Page</p>
            <div className='py-4'>
                <OTAC />
            </div>
        </>
    )
}
