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
import { Info } from "lucide-react";

interface SelfCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function SelfCareModal({ isOpen, onClose, onProceed }: SelfCareModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
      size="md"
      classNames={{
        base: "bg-white rounded-3xl p-4",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center pt-6 pb-2">
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Info className="w-5 h-5 bg-blue-600 text-white rounded-full p-0.5" />
            <span className="text-sm font-medium">เรียนรู้การดูแลจิตใจตนเอง</span>
          </div>
          <h2 className="text-4xl font-extrabold text-blue-600 text-center tracking-tight">
            "ต่อ-เติม-ใจ"
          </h2>
        </ModalHeader>
        <ModalBody className="text-center pb-8 pt-4">
          <p className="text-slate-700 text-sm md:text-base leading-relaxed px-4">
            กรมสุขภาพจิต ขอแสดงความห่วงใย คุณสามารถเรียนรู้การดูแลจิตใจตนเองผ่านโปรแกรม ต่อ-เติม-ใจ
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center gap-4 pb-6">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 rounded-xl shadow-sm"
            onPress={onProceed}
          >
            ตกลง
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 rounded-xl shadow-sm"
            onPress={onClose}
          >
            ภายหลัง
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
