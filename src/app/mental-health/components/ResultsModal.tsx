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

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: {
    rq: number[];
    burnout: number[];
    st5: number[];
    twoQ: number[];
    q9: number[];
    suicide: number;
    happiness: number;
  };
  onProceed: () => void;
}

export default function ResultsModal({ isOpen, onClose, scores, onProceed }: ResultsModalProps) {
  
  // Calculate totals
  const rqTotal = scores.rq.reduce((a, b) => a + b, 0);
  const burnoutTotal = scores.burnout.reduce((a, b) => a + Math.max(0, b), 0);
  const st5Total = scores.st5.reduce((a, b) => a + Math.max(0, b), 0);
  const twoQTotal = scores.twoQ.reduce((a, b) => a + Math.max(0, b), 0);
  const q9Total = scores.q9.reduce((a, b) => a + Math.max(0, b), 0);
  
  // Translation functions
  const getRqResult = (score: number) => {
    if (score >= 20) return { text: "เสี่ยงน้อย", color: "text-amber-500" };
    if (score >= 15) return { text: "เสี่ยงปานกลาง", color: "text-orange-500" };
    return { text: "เสี่ยงมาก", color: "text-red-600" };
  };

  const getBurnoutResult = (score: number) => {
    if (score >= 8) return { text: "เสี่ยงมาก", color: "text-red-600" };
    if (score >= 6) return { text: "เสี่ยงปานกลาง", color: "text-orange-500" };
    if (score >= 3) return { text: "เสี่ยงน้อย", color: "text-amber-500" };
    return { text: "ปกติ", color: "text-green-600" };
  };

  const getSt5Result = (score: number) => {
    if (score >= 10) return { text: "เครียดรุนแรง", color: "text-red-600" };
    if (score >= 8) return { text: "เครียดสูง", color: "text-orange-500" };
    if (score >= 5) return { text: "เครียดปานกลาง", color: "text-amber-500" };
    return { text: "เครียดน้อย", color: "text-green-600" };
  };

  const get2QResult = (score: number) => {
    if (score > 0) return { text: "มีภาวะเสี่ยง", color: "text-orange-500" };
    return { text: "ปกติ", color: "text-green-600" };
  };

  const get9QResult = (score: number) => {
    if (score >= 19) return { text: "มีอาการรุนแรง", color: "text-red-600" };
    if (score >= 13) return { text: "มีอาการปานกลาง", color: "text-orange-500" };
    if (score >= 7) return { text: "มีอาการเล็กน้อย", color: "text-amber-500" };
    return { text: "ไม่มีอาการ", color: "text-green-600" };
  };

  const getBQResult = (score: number) => {
    if (score > 0) return { text: "มีแนวโน้มรุนแรง", color: "text-red-600" };
    return { text: "ปกติ", color: "text-green-600" };
  };

  const getHappinessResult = (score: number) => {
    if (score >= 8) return { text: "มีความสุขมาก", color: "text-green-600" };
    if (score >= 5) return { text: "มีความสุขพอสมควร", color: "text-amber-500" };
    return { text: "ไม่มีความสุข", color: "text-red-600" };
  };

  const results = [
    { label: "พลังใจ(RQ)", ...getRqResult(rqTotal) },
    { label: "ภาวะหมดไฟ(Burnout)", ...getBurnoutResult(burnoutTotal) },
    { label: "ความเครียด(ST-5)", ...getSt5Result(st5Total) },
    { label: "ภาวะซึมเศร้า(2Q+)", ...get2QResult(twoQTotal) },
    { label: "โรคซึมเศร้า(9Q)", ...get9QResult(q9Total) },
    { label: "แนวโน้มฆ่าตัวตาย(BQ)", ...getBQResult(scores.suicide) },
    { label: "ความสุข (Happiness scale)", ...getHappinessResult(scores.happiness) },
  ];

  // Determine overall risk
  const hasHighRisk = results.some(r => r.color === "text-red-600" || r.color === "text-orange-500");

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
      size="2xl"
      classNames={{
        base: "bg-white rounded-3xl",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center pt-10 pb-2">
          <div className="w-20 h-20 rounded-full border-4 border-blue-300 flex items-center justify-center text-blue-400 mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className={`text-2xl font-bold ${hasHighRisk ? "text-red-500" : "text-emerald-500"}`}>
            {hasHighRisk ? "ท่านมีความเสี่ยงต่อปัญหาสุขภาพจิต" : "สุขภาพจิตของท่านอยู่ในเกณฑ์ปกติ"}
          </h2>
        </ModalHeader>
        <ModalBody className="flex flex-col items-center space-y-4 px-10 pb-6">
          
          <div className="w-full max-w-sm space-y-3">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between items-center text-[15px]">
                <span className="text-slate-600">{r.label} : </span>
                <span className={`font-bold ${r.color}`}>{r.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 space-y-4">
            <p className="text-blue-600 font-bold max-w-md mx-auto text-sm leading-relaxed">
              ควรได้รับคำแนะนำและการดูแลช่วยเหลือเพิ่มเติมจากเจ้าหน้าที่สาธารณสุข ซึ่งต้องขอทราบข้อมูลเพิ่มเติมจากท่าน
            </p>
            <p className="text-slate-500 text-xs flex items-start gap-1 justify-center max-w-md mx-auto">
              <span className="text-purple-500 shrink-0">ⓘ</span>
              กด "ตกลง" เพื่อรับคำแนะนำเพิ่มเติมและกรอกแบบฟอร์มสำหรับการติดต่อกลับเพื่อรับการติดตามช่วยเหลือดูแล (หากต้องการ)
            </p>
          </div>

        </ModalBody>
        <ModalFooter className="flex justify-center pb-10">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-12 py-6 text-lg rounded-xl shadow-md"
            onPress={onProceed}
          >
            "ตกลง"
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
