"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { ShieldCheck, Info, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

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
      backdrop="blur"
      classNames={{
        base: "bg-white/95 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl",
        header: "border-b border-slate-200/60 pb-4",
        footer: "border-t border-slate-200/60 pt-4",
        closeButton: "hover:bg-slate-100/80 active:bg-slate-200/80 transition-colors z-50",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-slate-900 pt-8 px-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl text-indigo-600 shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">แบบแสดงความยินยอมให้ เก็บ รวบรวม ใช้ เปิดเผยข้อมูล</h2>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="text-slate-700 leading-relaxed text-sm md:text-base px-8 py-6 space-y-6 custom-scrollbar">
              <div className="bg-linear-to-r from-slate-50 to-white p-5 rounded-2xl border border-slate-200/60 shadow-sm text-slate-800">
                <p>
                  ข้าพเจ้าตกลงยินยอมให้กรมสุขภาพจิต เก็บรวบรวม ใช้ หรือ เปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าที่มีอยู่กับโปรแกรม Mental Health Check in ซึ่งต่อไปนี้ในหนังสือให้ความยินยอมฉบับนี้เรียกว่า “ผู้ควบคุมข้อมูลส่วนบุคคล” ภายใต้เงื่อนไขดังต่อไปนี้
                </p>
              </div>
              
              <div className="space-y-4 text-slate-700">
                <p>
                  1. วัตถุประสงค์ของการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล เพื่อประโยชน์ต่อกระบวนการประเมินสุขภาพจิตเบื้องต้นและคัดกรองความเสี่ยงต่อปัญหาสุขภาพจิตจากสถานการณ์ COVID 19 และติดตามดูแลช่วยเหลือผู้ที่เสี่ยงมีปัญหาสุขภาพจิต ด้วยระบบคอมพิวเตอร์
                </p>
                <p>
                  2. “ข้อมูลส่วนบุคคล” หมายถึง ข้อมูลเกี่ยวกับบุคคลซึ่งทำให้สามารถระบุตัวบุคคลนั้นได้ไม่ว่าทางตรงหรือทางอ้อม เช่น ชื่อ สกุล เพศ อายุ ที่อยู่ เบอร์โทรศัพท์ ข้อมูลอาชีพ ข้อมูลสุขภาพ ข้อมูลปัจจัยเสี่ยง (เช่น เป็นผู้ป่วยโรคติดเชื้อ COVID 19 เป็นผู้ว่างงาน/ถูกเลิกจ้าง/ตกงาน เป็นต้น) ข้อมูลภาวะสุขภาพ
                </p>
                <p>
                  3. กรมสุขภาพจิตผู้ให้บริการ รวบรวม จัดเก็บ ใช้ ข้อมูล ซึ่งประกอบด้วย ข้อมูลส่วนบุคคล ข้อมูลการประเมินสุขภาพจิตเบื้องต้น ได้แก่ ประเมินพลังใจ ประเมินภาวะเหนื่อยล้าหมดไฟ ประเมินภาวะความเครียด ประเมินภาวะซึมเศร้า ประเมินความเสี่ยงต่อการฆ่าตัวตาย ซึ่งเป็นการประเมินที่ไม่มีค่าใช้จ่ายใดๆเพื่อประโยชน์ในการจัดทำฐานข้อมูล พัฒนาระบบการดำเนินงานสุขภาพจิต และติดตามดูแลช่วยเหลือผู้ที่เสี่ยงมีปัญหาสุขภาพจิต หากภายหลังมีการเปลี่ยนแปลงวัตถุประสงค์ในการเก็บรวบรวมข้อมูลส่วนบุคคล ผู้ให้บริการ จะประกาศให้ผู้ใช้บริการทราบ
                </p>
                <p>
                  4. ผู้ใช้บริการมีสิทธิถอนความยินยอมเกี่ยวกับข้อมูลส่วนบุคคลของผู้ใช้บริการเมื่อใดก็ได้ เว้นแต่การถอนความยินยอมนั้น จะกระทบต่อการให้บริการหรืออยู่นอกเหนือการควบคุมของผู้ให้บริการ
                </p>
                <p>
                  5. การตกลงให้ เก็บ รวบรวม ใช้ เปิดเผยข้อมูลส่วนบุคคลนี้ มีผลใช้บังคับตามระยะเวลาที่กฎหมายกำหนดไว้
                </p>
                <p>
                  6. สิทธิของผู้ใช้บริการเกี่ยวกับข้อมูลส่วนบุคคลที่เกี่ยวกับการเพิกถอน การขอเข้าถึงและรับสำเนาข้อมูลส่วนบุคคล การคัดค้านการเก็บข้อมูล ใช้หรือเปิดเผย สิทธิในการเคลื่อนย้ายข้อมูล สิทธิในการระงับข้อมูล สิทธิในการระงับการใช้ข้อมูล ให้เป็นไปตามนโยบายการคุ้มครองข้อมูลส่วนบุคคลของเราและตามที่กฎหมายกำหนด
                </p>
                <p>
                  7. ผู้ใช้บริการรับทราบว่า ผู้ใช้บริการสามารถติดต่อผู้ให้บริการ ผ่านช่องทางไปรษณีย์อิเล็กทรอนิกส์: <a href="mailto:checkindmh@gmail.com" className="text-blue-600 hover:underline font-medium">checkindmh@gmail.com</a>
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="px-8 pb-8 pt-4 flex justify-center w-full">

              <Button className="bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all text-medium px-8 py-2 rounded-xl w-full sm:w-auto mx-auto" onPress={() => {
                onAccept();
                onClose();
              }}>
                ตกลง
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
