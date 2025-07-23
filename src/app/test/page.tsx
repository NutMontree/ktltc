"use client"
import { LinkPreview } from "@/components/ui/link-preview";
import { Accordion, AccordionItem } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function NavbarModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <div>

      {/* <div className="flex px-10 min-h-[80vh] justify-center items-center flex-col gap-4"> */}
      <div className="px-8">
        <Button className="max-w-fit" onPress={onOpen}>
          Open Manu
        </Button>
        <Modal isOpen={isOpen} placement={'top'} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                {/* <ModalHeader className="flex flex-col gap-1">Manu</ModalHeader> */}
                <ModalBody className="pt-8">

                  <Accordion>
                    <AccordionItem key="1" aria-label="1" title="ประวัติสถานศึกษา">
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/historyeducational'>
                          <p>ประวัติสถานศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/philosophy'>
                          <p>ปรัชญา วิสัยทัศน์ เอกลักษ์ อัตลักษณ์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/eduadmin'>
                          <p>ทำเนียบผู้บริหาร</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/administrativestructure'>
                          <p>โครงสร้างการบริหารงานสถานศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/executiveboard'>
                          <p>คณะกรรมการบริหารสถานศึกษา</p>
                        </LinkPreview>
                      </div>
                    </AccordionItem>
                    <AccordionItem key="2" aria-label="2" title="ข้อมูลพื้นฐาน 9 ประการ">
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/historyeducational'>
                          <p>ข้อมูลสถานศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/personnel'>
                          <p>ข้อมูลบุคลากร</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/sid'>
                          <p>ข้อมูลนักเรียน นักศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/ '>
                          <p>ข้อมูลหลักสูตร</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/ '>
                          <p>ข้อมูลครุภัณฑ์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/ '>
                          <p>ข้อมูลงบประมาณ</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/'>
                          <p>ข้อมูลอาคารสถานที่</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/buildings'>
                          <p>ข้อมูลตลาดแรงงาน</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://www.sisaket.go.th/'>
                          <p>ข้อมูลของจังหวัด</p>
                        </LinkPreview>
                      </div>
                    </AccordionItem>
                    <AccordionItem key="3" aria-label="3" title="หน่วยงานภายใน">
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/resource'>
                          <p>ฝ่ายบริหารทรัพยากร</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/plan'>
                          <p>ฝ่ายแผนงานและความร่วมมือ</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/develop'>
                          <p>ฝ่ายพัฒนากิจการนักเรียน นักศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/academic'>
                          <p>ฝ่ายวิชาการ</p>
                        </LinkPreview>
                      </div>

                    </AccordionItem>
                    <AccordionItem key="4" aria-label="4" title="ข้อมูลบุคลากร">
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/executive'>
                          <p>ผู้บริหารสถานศึกษา</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/mechanic'>
                          <p>แผนกวิชาช่างยนต์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/machine'>
                          <p>แผนกวิชาช่างกลโรงงาน</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/welder'>
                          <p>แผนกวิชาช่างเชื่อมโลหะ</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/electricity'>
                          <p>แผนกวิชาช่างไฟฟ้ากำลัง</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/electronics'>
                          <p>แผนกวิชาช่างอิเล็กทรอนิกส์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/technique'>
                          <p>แผนกวิชาเทคนิคพื้นฐาน</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/construct'>
                          <p>แผนกวิชาช่างก่อสร้าง</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/accounting'>
                          <p>แผนกวิชาบัญชี</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/marketing'>
                          <p>แผนกวิชาการตลาด</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/technology'>
                          <p>แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/hotel'>
                          <p>แผนกวิชาการโรงแรม</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/ordinary'>
                          <p>แผนกวิชาสามัญสัมพันธ์</p>
                        </LinkPreview>
                      </div>
                    </AccordionItem>
                    <AccordionItem key="5" aria-label="5" title="เมนูลัด" className="border-b">
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/GECC'>
                          <p>ศูนย์ราชการสะดวก</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://std2018.vec.go.th/web'>
                          <p>ระบบ ศธ. ออนไลน์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://student.vec.go.th/web/Login.htm?mode=indexStudent'>
                          <p>ตรวจสอบผลการเรียน</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/'>
                          <p>รับงานอิเล็กทรอนิกส์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://admission.vec.go.th/web/Login.htm?mode=index'>
                          <p>สมัครเรียนออนไลน์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/'>
                          <p>บทเรียนออนไลน์</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/pressrelease'>
                          <p>ระบบสืบค้นข้อมูลคลังเก็บรูปภาพ</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://v-cop.go.th/'>
                          <p>ศูนย์กำลังคนอาชีวศึกษา (V-COP)</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app//plan/sar'>
                          <p>รายงานประจำของสถานศึกษา (SAR)</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://ktltc.vercel.app/'>
                          <p>Plan PDCA</p>
                        </LinkPreview>
                      </div>
                      <div>
                        <LinkPreview
                          url='https://forms.gle/Hcwfjvd7S8zTbA3C8'>
                          <p>แบบประเมินความพึงพอใจของผู้ใช้บริการข้อมูลด้านระบบสารสนเทศ</p>
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
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div >
  )
}

