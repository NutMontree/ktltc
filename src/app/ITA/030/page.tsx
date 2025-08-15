import React from 'react'
import NGP from './ngp/page'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    – แสดงนโยบายว่าผู้บริหาร เจ้าหน้าที่และบุคลากรทุกคน จะต้องไม่มีการรับของขวัญ (No Gift Policy)                </p>
                <p>
                    – ดําเนินการโดยผู้บริหารสถาน ศึกษาหรือผู้ที่ได้รับมอบหมาย หรือผู้ที่ปฏิบัติหน้าที่แทน
                </p>
                <p>
                    – เป็นการดำเนินการในปีงบประมาณปัจจุบัน
                </p>
            </div >

            <p className='text-xl'>Link Wab Page</p>
            <div className='py-4'>
                <NGP />
            </div>
        </>
    )
}
