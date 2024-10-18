"use client"; // top to the file
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { DataPressrelease37 } from "./data";
import { Image } from "@nextui-org/react";

export default function Pressrelease() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [scrollBehavior, setScrollBehavior] = React.useState("inside");
  return (
    <>
      <div className="flex flex-col gap-2">
        <Button onPress={onOpen}>เปิด เพื่อดู</Button>

        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          scrollBehavior={"inside"}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div>
                    {DataPressrelease37.Item.map((item) => (
                      <div key={item.title}>{item.title}</div>
                    ))}
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div>
                    {DataPressrelease37.Item.map((item) => (
                      <div key={item.description}>
                        <div>{item.description}</div>
                        <div className="text-xs">
                          🥈รางวัลรองชนะเลิศอันดับ 1 จำนวน ดังนี้ <br />
                          ประเภทที่ 1
                          สิ่งประดิษฐ์ด้านนวัตกรรมและเทคโนโลยีการเกษตร
                          อุตสาหกรรมสมัยใหม่
                          <br />
                          1 เครื่องวัดความอ่อน-แก่ทุเรียน
                          <br />
                          รางวัลชนะเลิศ เหรียญทอง
                          <br />
                          ครูที่ปรึกษา
                          <br />
                          1. นางสาวคำโฮม คูณสว่าง ครู <br />
                          2. นางสาววิภาวรรณ สีแดด รองผู้อำนวยการ <br />
                          3. นางวีนัส สุวรรณ ครู <br />
                          4. นายกิตติ ผลดี ครูพิเศษสอน <br />
                          ผู้ประดิษฐ์ <br />
                          5. นางสาวสุทธญาณ์ ย่อมพันธ์ นักศึกษา <br />
                          6. นางสาวภัชราวดี ศรีโวหะ นักศึกษา <br />
                          7. นายอภิสิทธิ์ มะโนชาติ นักศึกษา <br />
                          8. นางสาวพัชราภา พุฒเทศ นักศึกษา <br />
                          9. นายบุญเลิศ โภคพันธ์ นักศึกษา <br />
                          10. นางสาวนันท์นภัส สถาพร นักศึกษา <br />
                          11. นางสาวจารุวรรณ สายปัญญา นักศึกษา <br />
                          12. นางสาวสุปราณี วงค์เสน่ห์ นักศึกษา <br />
                          ประเภทที่2 สิ่งประดิษฐ์ด้านนวัตกรรมและเทคโนโลยีดิจิทัล
                          ปัญญาประดิษฐ์
                          <br />
                          2 อุปกรณ์ช่วยเหลือผู้ป่วยติดเตียง
                          <br />
                          รางวัลชนะเลิศ เหรียญเงิน
                          <br />
                          ครูที่ปรึกษา
                          <br />
                          1. นายณัทพงศ์ โยธี ครู <br />
                          2. นายสิริปัญญ์ เสริมสิริพิพัฒน์ ครู <br />
                          3. นายชินาธิป พรมชา พนักงานราชการครู <br />
                          4. นางกิ่งดาว บุญประสิทธิ พนักงานราชการ ครู <br />
                          5. นางสาวจิราวรรณ ชอบดี ครูพิเศษสอน <br />
                          ผู้ประดิษฐ์ <br />
                          6. นายนิติธร จินดาบุตร นักศึกษา <br />
                          7. นางสาวกนวรรณ ไชยวัฒน์ นักศึกษา <br />
                          8. นายเทพสุทิน ทองอ่อน นักศึกษา <br />
                          9. นายทวิ ปัญชาติ นักศึกษา <br />
                          10. นายวุฒิไกร ผิวขาว นักศึกษา <br />
                          ประเภทที่ 5
                          สิ่งประดิษฐ์ด้านนวัตกรรมและเทคโนโลยีเพื่อสุขภาพ
                          (HEALTH CARE)
                          <br />
                          4. ถุงมือประคบบรรเทาอาการปวดประจำเดือน
                          <br />
                          รางวัลชนะเลิศ เหรียญเงิน
                          <br />
                          ครูที่ปรึกษา
                          <br />
                          1. นางสาวปวีณา บุญเสนอ ครูพิเศษสอน <br />
                          2. นางกิ่งดาว บุญประสิทธิ์ พนักงานราชการ ครู <br />
                          3. นายประดิษฐ ใจทรง พนักงานราชการ ครู <br />
                          4. นายวิทยา ลัทธิมนต์ ครูพิเศษสอน <br />
                          5. นางสาวจิราวรรณ ชอบดี. ครูพิเศษสอน <br />
                          ผู้ประดิษฐ์ <br />
                          6. นางสาวพนิตา คูณโปก นักศึกษา <br />
                          7. นางสาวพิมพ์ชนก สุวรรณ นักศึกษา <br />
                          8. นางสาวพรรณราย เจริญศรี นักศึกษา <br />
                          9. นางสาวฐิติมา บุญเสนอ นักศึกษา <br />
                          ประเภทที่ 5
                          สิ่งประดิษฐ์ด้านนวัตกรรมและเทคโนโลยีเพื่อสุขภาพ
                          (HEALTH CARE)
                          <br />
                          3. ไรซ์เบอรี่กาแฟ
                          <br />
                          รางวัลรองชนะเลิศอันดับ1 เหรียญเงิน
                          <br />
                          ครูที่ปรึกษา
                          <br />
                          1. นางสาวฐิติชญา ภิบาลวงษ์ ครูพิเศษสอน <br />
                          2. นางวีนัส สุวรรณ ครู <br />
                          3. นางนงลักษณ์ ศรีชา ครู <br />
                          4. นางสาวสุธิดา เกษี ครูพิเศษสอน <br />
                          5. นายธนัญชัย สิงห์อุดม ครูพิเศษสอน
                          <br />
                          ผู้ประดิษฐ์ <br />
                          6. นายณัฏฐ์พัชยา เลื่อนฤทธิ์ นักศึกษา <br />
                          7. นางสาวปพิชญา สร้อยทอง นักศึกษา <br />
                          8. นางสาวจรรยารัตน์ พิทักษ์ นักศึกษา <br />
                          9. นายวิชญ์พล อินทุพันธ์ นักศึกษา <br />
                          10. นางสาวบัณฑิตา จันทมั่น นักศึกษา <br />
                          11. นางสาวเสาวลักษ์ กฤษณ์ณ์ดนัย นักศึกษา <br />
                          12. นางสาวสุชาดี ไชยบุญเรือง นักศึกษา <br />
                          13. นางสาววิภาดา คันทา นักศึกษา <br />
                          14. นางสาวกิตตินันท์ คำภาชีพ นักศึกษา <br />
                          15. นายเอกภักดิ์ รัตนะ นักศึกษา <br />
                          วิทยาลัยเทคนิคกันทรลักษ์ ขอให้นักเรียน -
                          นักศึกษาทุกคนประสบผลสำเร็จ
                        </div>

                        <div className="text-xs text-slate-500">
                          {item.date}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="justify-center flex-col">
                    {DataPressrelease37.Item.map((item) => (
                      <div
                        className="mb-4 group relative shadow-lg rounded-xl px-[144px] py-[144px]"
                        key={item.img1}
                      >
                        <div className="absolute inset-0 bg-cover bg-center rounded-xl hover:scale-110 transition duration-500 cursor-pointer object-cover">
                          <Image src={item.img1} alt={""}></Image>
                          <Image src={item.img2} alt={""}></Image>
                          <Image src={item.img3} alt={""}></Image>
                          <Image src={item.img4} alt={""}></Image>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalBody>

                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
