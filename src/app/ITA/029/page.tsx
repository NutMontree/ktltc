import React from 'react'
import MOU from "./mou/page";

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    – แสดงการดำเนินการหรือกิจกรรมที่แสดงถึงการเปิดโอกาสให้บุคคลภายนอกได้มีส่วนร่วมในการดำเนินงานตามภารกิจของสถานศึกษา เช่น ประชาสัมพันธ์ กิจกรรม/โครงการ,การลงนามความร่วมมือ (MOU) กับสถานประกอบการหรือบุคคล/หน่วยงานภายนอก เป็นต้น
                </p>
                <p>
                    – เป็นการดำเนินงานในปีงบประมาณปัจจุบัน
                </p>
            </div >

            <p className='text-xl'>Link Wab Page</p>
            <div className='py-4'>
                <MOU />
            </div>
        </>
    )
}
