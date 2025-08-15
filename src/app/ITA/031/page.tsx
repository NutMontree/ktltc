import React from 'react'
import NGP from '../030/ngp/page'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                <p>
                    - แสดงการดําเนินการหรือกิจกรรมที่แสดงถึงการมีส่วนร่วมของผู้บริหารสถานศึกษาหรือผู้ที่ได้รับมอบหมาย หรือผู้ที่ปฏิบัติหน้าที่แทน
                </p>
                <p>
                    - เป็นการดําเนินกิจกรรมที่แสดงให้เห็นถึงการให้ความสําคัญกับการปรับปรุง พัฒนา และส่งเสริมสถานศึกษาด้านคุณธรรมและความโปร่งใส หรือมีส่วนร่วมในการประกาศนโยบายไม่รับของขวัญ (No Gift Policy)
                </p>
                <p>
                    - เป็นการดําเนินการในปีงบประมาณปัจจุบัน
                </p>
            </div >

            <p className='text-xl'>Link Wab Page</p>
            <div className='py-4'>
                <NGP />
            </div>
        </>
    )
}
