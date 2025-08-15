import Link from 'next/link'
import React from 'react'

export default function page() {
    return (
        <>
            <div className='pb-6 text-xs md:text-sm lg:text-base text-blue-500 dark:text-blue-400'>
                - แสดงผลการดําเนินงานตามโครงการ/กิจกรรมที่เกี่ยวข้องกับการป้องกันการทุจริต มีข้อมูลรายละเอียดสรุปผลการดําเนินการ อย่างน้อย ประกอบด้วย ดังนี้<br />
                1. ผลการดําเนินการโครงการหรือกิจกรรม<br />
                2. ผลการใช้จ่ายงบประมาณ<br />
                3. ปัญหา อุปสรรค และข้อเสนอแนะ<br />
                (หากไม่มีปัญหา อุปสรรค และข้อเสนอแนะ ระบุว่า “ไม่มี”)<br />
                - เป็นรายงานผลย้อนหลัง 1 ปีงบประมาณ <br />
            </div>

            <p className='text-xl'>File PDF</p>
            <div className='grid gap-4 py-4'>
                <div> <Link href='/images/ita/pdf/o35-โครงการภายใต้กิจกรรมส่งเสริมคุณธรรม.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>1. โครงการภายใต้กิจกรรมส่งเสริมคุณธรรม จริยธรรม และธรรมาภิบาลในสถานศึกษา แผนงานบูรณาการต่อต้านการทุจริตและประพฤติมิชอบ ประจำปีงบประมาณ พ.ศ. 2568</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการถวายเทียนพรรษา.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>2. โครงการภายใต้กิจกรรมส่งเสริมคุณธรรม จริยธรรม และธรรมาภิบาลในสถานศึกษา แผนงานบูรณาการต่อต้านการทุจริตและประพฤติมิชอบ ประจำปีงบประมาณ พ.ศ. 2568  อวท. (โครงการถวายเทียนพรรษา)</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการอบรมเขียนแผนปฏิบัติงานอวท.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>3. โครงการภายใต้กิจกรรมส่งเสริมคุณธรรม จริยธรรม และธรรมาภิบาลในสถานศึกษา แผนงานบูรณาการต่อต้านการทุจริตและประพฤติมิชอบ ประจำปีงบประมาณ พ.ศ. 2568  อวท. (โครงการอบรมเขียนแผนปฏิบัติงานองค์การนักวิชาชีพแห่งประเทศไทย วิทยาลัยเทคนิคกันทรลักษ์)</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/โครงการสถานศึกษาคุณธรรม.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>4. โครงการภายใต้กิจกรรมส่งเสริมคุณธรรม จริยธรรม และธรรมาภิบาลในสถานศึกษา แผนงานบูรณาการต่อต้านการทุจริตและประพฤติมิชอบ ประจำปีงบประมาณ พ.ศ. 2568  อวท. (โครงการสถานศึกษาคุณธรรม)</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o-35โครงการกีฬาภายในนักเรียน.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>5. โครงการกีฬาภายในนักเรียน จริยธรรม และธรรมาภิบาลในสถานศึกษา แผนงานบูรณาการต่อต้านการทุจริตและประพฤติมิชอบ ประจำปีงบประมาณ พ.ศ. 2568 (โครงการกีฬาภายในนักเรียน นักศึกษา)</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการเชิดชูเกียรตินักเรียน นักศึกษาผู.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>6. โครงการเชิดชูเกียรตินักเรียน นักศึกษาผู้สร้างชื่อเสียงให้วิทยาลัยฯ 2568</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการรณรงค์ป้องกันและแก้ไขปัญหายาเสพ.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>7. โครงการรณรงค์ป้องกันและแก้ไขปัญหายาเสพติด To be number one</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการเสริมสร้างพัฒนาคุณธรรม.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>8. โครงการเสริมสร้างพัฒนาคุณธรรม จริยธรรม ปฐมนิเทศนักเรียน นักศึกษาใหม่ 2568</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการสืบสานประเพณีวันไหว้ครู.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>9. โครงการสืบสานประเพณีวันไหว้ครูของนักเรียน นักศึกษา ประจำปีการศึกษา 2568</p> </Link> </div>
                <div> <Link href='/images/ita/pdf/o35-โครงการเสริมสร้างคุณลักษณะอันพึงประสงค.pdf'> <p className='hover:text-orange-500 dark:hover:text-orange-400 text-[12px] md:text-[14px] sm:text-sm md:text-base'>10. โครงการเสริมสร้างคุณลักษณะอันพึงประสงค์ ตรงต่อเวลา 2568</p> </Link> </div>
            </div>
        </>
    )
}
