"use client"
import { LinkPreview } from "@/components/ui/link-preview";
import { Accordion, AccordionItem } from "@heroui/react";

export default function NavbarModal() {
    return (
        <>
            <Accordion>
                <AccordionItem key="1" aria-label="1" title="ประวัติสถานศึกษา">
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/historyeducational'>
                            <p className='hover:text-sky-500'>ประวัติสถานศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/philosophy'>
                            <p className='hover:text-sky-500'>ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/eduadmin'>
                            <p className='hover:text-sky-500'>ทำเนียบผู้บริหาร</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/administrativestructure'>
                            <p className='hover:text-sky-500'>โครงสร้างการบริหารงานสถานศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/executiveboard'>
                            <p className='hover:text-sky-500'>คณะกรรมการบริหารสถานศึกษา</p>
                        </LinkPreview>
                    </div>
                </AccordionItem>
                <AccordionItem key="2" aria-label="2" title="ข้อมูลพื้นฐาน 9 ประการ">
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/historyeducational'>
                            <p className='hover:text-sky-500'>ข้อมูลสถานศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/personnel'>
                            <p className='hover:text-sky-500'>ข้อมูลบุคลากร</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/sid'>
                            <p className='hover:text-sky-500'>ข้อมูลนักเรียน นักศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/ '>
                            <p className='hover:text-sky-500'>ข้อมูลหลักสูตร</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/ '>
                            <p className='hover:text-sky-500'>ข้อมูลครุภัณฑ์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/ '>
                            <p className='hover:text-sky-500'>ข้อมูลงบประมาณ</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/'>
                            <p className='hover:text-sky-500'>ข้อมูลอาคารสถานที่</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/buildings'>
                            <p className='hover:text-sky-500'>ข้อมูลตลาดแรงงาน</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://www.sisaket.go.th/'>
                            <p className='hover:text-sky-500'>ข้อมูลของจังหวัด</p>
                        </LinkPreview>
                    </div>
                </AccordionItem>
                <AccordionItem key="3" aria-label="3" title="หน่วยงานภายใน">
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/resource'>
                            <p className='hover:text-sky-500'>ฝ่ายบริหารทรัพยากร</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/plan'>
                            <p className='hover:text-sky-500'>ฝ่ายแผนงานและความร่วมมือ</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/develop'>
                            <p className='hover:text-sky-500'>ฝ่ายพัฒนากิจการนักเรียน นักศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/academic'>
                            <p className='hover:text-sky-500'>ฝ่ายวิชาการ</p>
                        </LinkPreview>
                    </div>

                </AccordionItem>
                <AccordionItem key="4" aria-label="4" title="ข้อมูลบุคลากร">
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/executive'>
                            <p className='hover:text-sky-500'>ผู้บริหารสถานศึกษา</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/mechanic'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างยนต์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/machine'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างกลโรงงาน</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/welder'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างเชื่อมโลหะ</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/electricity'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างไฟฟ้ากำลัง</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/electronics'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างอิเล็กทรอนิกส์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/technique'>
                            <p className='hover:text-sky-500'>แผนกวิชาเทคนิคพื้นฐาน</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/construct'>
                            <p className='hover:text-sky-500'>แผนกวิชาช่างก่อสร้าง</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/accounting'>
                            <p className='hover:text-sky-500'>แผนกวิชาบัญชี</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/marketing'>
                            <p className='hover:text-sky-500'>แผนกวิชาการตลาด</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/technology'>
                            <p className='hover:text-sky-500'>แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/hotel'>
                            <p className='hover:text-sky-500'>แผนกวิชาการโรงแรม</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/ordinary'>
                            <p className='hover:text-sky-500'>แผนกวิชาสามัญสัมพันธ์</p>
                        </LinkPreview>
                    </div>
                </AccordionItem>
                <AccordionItem key="5" aria-label="5" title="เมนูลัด" className="border-b">
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/GECC'>
                            <p className='hover:text-sky-500'>ศูนย์ราชการสะดวก</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://std2018.vec.go.th/web'>
                            <p className='hover:text-sky-500'>ระบบ ศธ. ออนไลน์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://student.vec.go.th/web/Login.htm?mode=indexStudent'>
                            <p className='hover:text-sky-500'>ตรวจสอบผลการเรียน</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/'>
                            <p className='hover:text-sky-500'>รับงานอิเล็กทรอนิกส์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://admission.vec.go.th/web/Login.htm?mode=index'>
                            <p className='hover:text-sky-500'>สมัครเรียนออนไลน์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/'>
                            <p className='hover:text-sky-500'>บทเรียนออนไลน์</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/pressrelease'>
                            <p className='hover:text-sky-500'>ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://v-cop.go.th/'>
                            <p className='hover:text-sky-500'>ศูนย์กำลังคนอาชีวศึกษา (V-COP)</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app//plan/sar'>
                            <p className='hover:text-sky-500'>รายงานประจำของสถานศึกษา (SAR)</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://ktltc.vercel.app/'>
                            <p className='hover:text-sky-500'>Plan PDCA</p>
                        </LinkPreview>
                    </div>
                    <div className='py-1 xs:text-xs'>
                        <LinkPreview
                            url='https://forms.gle/Hcwfjvd7S8zTbA3C8'>
                            <p className='hover:text-sky-500'>แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ</p>
                        </LinkPreview>
                    </div>
                </AccordionItem>
            </Accordion>
            <div className="pl-3 pt-1">
                <LinkPreview
                    url='https://ktltc.vercel.app/ITA'>
                    <p>ITA</p>
                </LinkPreview>
            </div>
        </>
    )
}

