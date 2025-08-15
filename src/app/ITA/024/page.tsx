import Link from 'next/link'
import React from 'react'
import HRM from './HRM/page'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - แสดงหลักเกณฑ์การบริหารและพัฒนาทรัพยากรบุคคลที่ยังใช้บังคับในสถานศึกษา ปีงบประมาณปัจจุบัน อย่างน้อย ประกอบด้วย ดังนี้<br />
                1. การสรรหาและคัดเลือกบุคลากรเช่นการสรรหาและคัดเลือก พนักงานราชการ,ครูพิเศษสอน, เจ้าหน้าที่ เป็นต้น (กรณีไม่มีการสรรหา ให้ใช้การต่อสัญญา)<br />
                2. การบรรจุและการแต่งตั้งบุคลากร เช่น การบรรจุและแต่งตั้งพนักงานราชการ,ครูพิเศษสอน,เจ้าหน้าที่ เป็นต้น (กรณีไม่มีบรรจุและแต่งตั้ง ให้ใช้การต่อสัญญา)<br />
                3. การพัฒนาบุคลากร เช่น พัฒนาครูและบุคลากรทางการศึกษาในการจัดการเรียนรู้ เป็นต้น<br />
                4. การประเมินผลการปฏิบัติงานบุคลากร เช่น รายงานผลการประเมินเงินเดือน เป็นต้น<br />
                5. การสร้างขวัญกําลังใจ เช่น การขอพระราชทานเครื่องราชอิสริยาภรณ์,การแสดงความยินดีครูและบุคลากรทางการศึกษาที่ผ่านการเลื่อนวิทยฐานะที่สูงขึ้น,การเชิดชูเกียรติครูและบุคลากรดีเด่น เป็นต้น <br />
            </div>

            <p className='text-xl'>File PDF</p>
            <p className='text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                1. การสรรหาและคัดเลือกบุคลากรเช่นการสรรหาและคัดเลือก พนักงานราชการ,ครูพิเศษสอน, เจ้าหน้าที่ เป็นต้น (กรณีไม่มีการสรรหา ให้ใช้การต่อสัญญา)<br />
            </p>

            <div className='grid gap-6 pt-4'>
                <div className='grid gap-2 '>
                    <div> <Link href='/images/ita/pdf/ประกาศรับสมัครเจ้าหน้าที่งานสื่อ+นักการ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1.  ประกาศรับสมัครลูกจ้างชั่วคราว ตำแหน่ง เจ้าหน้าที่ธุรการ งานสื่อ+นักการ</p> </Link> </div>
                    <div> <Link href='/images/ita/pdf/ประกาศรับสมัครลูกจ้างชั่วคราวรายเดือน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. ประกาศรับสมัครลูกจ้างชั่วคราวรายเดือน ตำแหน่ง ครูพิเศษสอน สาขาช่างชนต์</p> </Link> </div>
                    <div> <Link href='/images/ita/pdf/ประกาศรับสมัครลูกจ้างชั่วคราว.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3.  ประกาศรับสมัครลูกจ้างชั่วคราว ตำแหน่ง ครูพิเศษสอน สาขาช่างไฟฟ้ากำลัง</p> </Link> </div>
                    <div> <Link href='/images/ita/pdf/ประกาศรับสมัครลูกจ้างชั่วคราวตน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>4. ประกาศรับสมัครลูกจ้างชั่วคราว ตำแหน่ง นักการ ภาโรง </p> </Link> </div>
                    <div> <Link href='/images/ita/pdf/ประกาศรับสมัครครูพิเศษสอน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>5. ประกาศรับสมัครครูพิเศษสอน สาขาวิชาการจัดการโลจิสติกส์</p> </Link> </div>

                </div>
                <p className='text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400 pt-2'>
                    4. การประเมินผลการปฏิบัติงานบุคลากร เช่น รายงานผลการประเมินเงินเดือน เป็นต้น<br />
                </p>
                <div> <Link href='/images/ita/pdf/แบบประเมินผลการปฏิบัติงานตำแหน่งพนักงาน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. แบบประเมินผลการปฏิบัติงานตำแหน่งพนักงานราชการ</p> </Link> </div>


                <div>
                    <p className='text-xl'>Link Wab Page</p>
                    <HRM />
                </div>
            </div>

        </>
    )
}
