"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

interface ConsentModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentModal({ isOpen, onOpenChange, onAccept, onDecline }: ConsentModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-blue-600">
              <div className="flex items-center gap-2">
                <span>ข้อกำหนดและเงื่อนไข</span>
              </div>
            </ModalHeader>
            <ModalBody className="text-gray-700 leading-relaxed text-sm md:text-base">
              <p>
                ข้าพเจ้าตกลงยินยอมให้ กรมสุขภาพจิต เก็บรวบรวม ใช้ หรือ เปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าที่มีอยู่กับโปรแกรม Mental Health Check in ซึ่งต่อไปนี้ในหนังสือให้ความยินยอมฉบับนี้เรียกว่า “ผู้ควบคุมข้อมูลส่วนบุคคล”ภายใต้เงื่อนไข ดังต่อไปนี้
              </p>
              <ol className="list-decimal list-inside space-y-4 mt-2">
                <li>
                  วัตถุประสงค์ของการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล เพื่อประโยชน์ต่อกระบวนการประเมินสุขภาพจิตเบื้องต้นและคัดกรองความเสี่ยงต่อปัญหาสุขภาพจิต และติดตามดูแลช่วยเหลือผู้ที่เสี่ยงมีปัญหาสุขภาพจิต ด้วยระบบคอมพิวเตอร์
                </li>
                <li>
                  “ข้อมูลส่วนบุคคล” หมายถึง ข้อมูลเกี่ยวกับบุคคลซึ่งทำให้สามารถระบุตัวบุคคลนั้นได้ไม่ว่าทางตรงหรือทางอ้อม เช่น ชื่อ สกุล เพศ อายุ ที่อยู่ เบอร์โทรศัพท์ ข้อมูลอาชีพ ข้อมูลสุขภาพ ข้อมูลปัจจัยเสี่ยง (เช่น เป็นผู้ว่างงาน ถูกเลิกจ้าง หรือตกงาน เป็นต้น) ข้อมูลภาวะสุขภาพ
                </li>
                <li>
                  กรมสุขภาพจิตผู้ให้บริการ รวบรวม จัดเก็บ ใช้ ข้อมูล ซึ่งประกอบด้วย ข้อมูลส่วนบุคคล ข้อมูลการประเมินสุขภาพจิตเบื้องต้น ได้แก่ ประเมินพลังใจ ประเมินภาวะเหนื่อยล้าหมดไฟ ประเมินภาวะความเครียด ประเมินภาวะซึมเศร้า และประเมินความเสี่ยงต่อการฆ่าตัวตาย ซึ่งเป็นการประเมินที่ไม่มีค่าใช้จ่าย เพื่อประโยชน์ในการจัดทำฐานข้อมูล พัฒนาระบบการดำเนินงานสุขภาพจิต และติดตามดูแลช่วยเหลือผู้ที่เสี่ยงมีปัญหาสุขภาพจิต
                </li>
                <li>
                  ผู้ใช้บริการมีสิทธิถอนความยินยอมเกี่ยวกับข้อมูลส่วนบุคคลของผู้ใช้บริการเมื่อใดก็ได้ เว้นแต่การถอนความยินยอมนั้นจะกระทบต่อการให้บริการหรืออยู่นอกเหนือการควบคุมของผู้ให้บริการ
                </li>
                <li>
                  การตกลงให้เก็บ รวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลนี้ มีผลใช้บังคับตามระยะเวลาที่กฎหมายกำหนด
                </li>
                <li>
                  สิทธิของผู้ใช้บริการเกี่ยวกับข้อมูลส่วนบุคคล เช่น การเพิกถอน การขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคล การคัดค้านการเก็บข้อมูล ใช้หรือเปิดเผย สิทธิในการเคลื่อนย้ายข้อมูล สิทธิในการลบข้อมูล และสิทธิในการระงับการใช้ข้อมูล ให้เป็นไปตามนโยบายการคุ้มครองข้อมูลส่วนบุคคลและตามที่กฎหมายกำหนด
                </li>
                <li>
                  ผู้ใช้บริการสามารถติดต่อผู้ให้บริการ ผ่านช่องทางไปรษณีย์อิเล็กทรอนิกส์: checkin@dmh.mail.go.th, checkindmh@gmail.com
                </li>
              </ol>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => {
                onDecline();
                onClose();
              }}>
                ไม่ยินยอม
              </Button>
              <Button color="primary" onPress={() => {
                onAccept();
                onClose();
              }}>
                รับทราบและยินยอม
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
