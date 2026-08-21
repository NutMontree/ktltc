"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Button, RadioGroup, Radio, Progress, useDisclosure } from "@heroui/react";
import { ArrowLeft, ArrowRight, UserCheck, Loader2 } from 'lucide-react';
import ConsentModal from '../../components/ConsentModal';
import toast from 'react-hot-toast';

const typeTitles: Record<string, string> = {
  'self': 'ประเมินตัวเอง',
  'other': 'ประเมินผู้อื่น',
  'health-worker': 'ประเมินเจ้าหน้าที่สาธารณสุข',
  'child': 'ประเมินเด็กและวัยรุ่นอายุไม่เกิน 18 ปี',
  'organization': 'องค์กรภาครัฐและเอกชน'
};

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const title = typeTitles[type] || 'แบบประเมิน';

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [hasConsented, setHasConsented] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  // Form States
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [st5Scores, setSt5Scores] = useState<number[]>([0,0,0,0,0]);
  const [q9Scores, setQ9Scores] = useState<number[]>([0,0,0,0,0]);

  useEffect(() => {
    if (!hasConsented) {
      onOpen();
    }
  }, [hasConsented, onOpen]);

  const handleAcceptConsent = () => {
    setHasConsented(true);
  };

  const handleDeclineConsent = () => {
    router.push('/mental-health');
  };

  const nextStep = () => {
    // Basic validation
    if (step === 1 && (!age || !gender || !status)) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSt5Change = (index: number, value: string) => {
    const newScores = [...st5Scores];
    newScores[index] = parseInt(value);
    setSt5Scores(newScores);
  };

  const handleQ9Change = (index: number, value: string) => {
    const newScores = [...q9Scores];
    newScores[index] = parseInt(value);
    setQ9Scores(newScores);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const totalSt5 = st5Scores.reduce((a, b) => a + b, 0);
      const totalQ9 = q9Scores.reduce((a, b) => a + b, 0);

      const res = await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          age: parseInt(age),
          gender,
          status,
          st5Score: totalSt5,
          q9Score: totalQ9
        })
      });

      if (res.ok) {
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
        router.push('/mental-health-dashboard');
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ages = Array.from({ length: 85 }, (_, i) => i + 15);

  if (!hasConsented) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ConsentModal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange} 
          onAccept={handleAcceptConsent}
          onDecline={handleDeclineConsent}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="text-blue-500" />
              {title}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              กรุณาตอบคำถามตามความเป็นจริง เพื่อประโยชน์ในการประเมินสุขภาพจิต
            </p>
          </div>
          <Button variant="light" color="danger" onPress={() => router.push('/mental-health')}>
            ยกเลิก / กลับ
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>ขั้นตอนที่ {step} จาก {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress value={(step / totalSteps) * 100} color="primary" className="h-2" />
        </div>

        <Card className="border-none shadow-md bg-white">
          <CardBody className="p-8 space-y-8">
            
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">1. ข้อมูลทั่วไป</h2>
                
                <div className="space-y-4">
                  <div className="w-full max-w-xs space-y-2">
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">อายุ <span className="text-danger">*</span></label>
                    <select 
                      id="age"
                      name="age"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    >
                      <option value="" disabled>เลือกอายุ</option>
                      {ages.map((a) => (
                        <option key={a} value={a.toString()}>
                          {a.toString()} ปี
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <RadioGroup label="เพศ" isRequired orientation="horizontal" value={gender} onValueChange={setGender}>
                      <Radio value="ชาย">ชาย</Radio>
                      <Radio value="หญิง">หญิง</Radio>
                      <Radio value="LGBTQ+">LGBTQ+</Radio>
                    </RadioGroup>
                  </div>

                  <div>
                    <RadioGroup label="สถานภาพ" isRequired orientation="horizontal" value={status} onValueChange={setStatus}>
                      <Radio value="โสด">โสด</Radio>
                      <Radio value="สมรส">สมรส</Radio>
                      <Radio value="หม้าย/หย่า/แยก">หม้าย/หย่า/แยก</Radio>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">2. แบบประเมินความเครียด (ST5)</h2>
                <p className="text-gray-600 mb-4">ในระยะ 2-4 สัปดาห์ที่ผ่านมา ท่านมีอาการเหล่านี้บ่อยแค่ไหน?</p>
                
                {[
                  "มีปัญหาการนอน นอนไม่หลับ หรือนอนมากไป",
                  "มีสมาธิน้อยลง",
                  "หงุดหงิด/กระวนกระวาย/ว้าวุ่นใจ",
                  "รู้สึกเบื่อ เซ็ง",
                  "ไม่อยากพบปะผู้คน"
                ].map((q, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium text-gray-800 mb-3">{idx + 1}. {q}</p>
                    <RadioGroup 
                      orientation="horizontal" 
                      className="flex-wrap gap-4"
                      value={st5Scores[idx].toString()}
                      onValueChange={(val) => handleSt5Change(idx, val)}
                    >
                      <Radio value="0">แทบไม่มี</Radio>
                      <Radio value="1">เป็นบางครั้ง</Radio>
                      <Radio value="2">บ่อยครั้ง</Radio>
                      <Radio value="3">เป็นประจำ</Radio>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">3. แบบประเมินภาวะซึมเศร้า (9Q)</h2>
                <p className="text-gray-600 mb-4">ในช่วง 2 สัปดาห์ที่ผ่านมา ท่านมีอาการเหล่านี้บ่อยแค่ไหน?</p>
                
                {[
                  "เบื่อ ไม่อยากทำอะไร",
                  "ไม่สบายใจ ซึมเศร้า ท้อแท้",
                  "หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป",
                  "เหนื่อยง่าย หรือไม่ค่อยมีแรง",
                  "เบื่ออาหาร หรือกินมากเกินไป"
                ].map((q, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                    <p className="font-medium text-gray-800 mb-3">{idx + 1}. {q}</p>
                    <RadioGroup 
                      orientation="horizontal" 
                      className="flex-wrap gap-4"
                      value={q9Scores[idx].toString()}
                      onValueChange={(val) => handleQ9Change(idx, val)}
                    >
                      <Radio value="0">ไม่มีเลย</Radio>
                      <Radio value="1">มีบางวัน</Radio>
                      <Radio value="2">มีบ่อยๆ</Radio>
                      <Radio value="3">มีแทบทุกวัน</Radio>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">4. สรุปผลการประเมิน</h2>
                <div className="bg-blue-50 p-6 rounded-xl text-center space-y-4">
                  <h3 className="text-2xl font-bold text-blue-800">ส่งข้อมูลแบบประเมิน</h3>
                  <p className="text-gray-600">
                    ข้อมูลของท่านจะถูกเก็บเป็นความลับ การประเมินนี้เป็นการคัดกรองเบื้องต้นเท่านั้น
                    หากท่านรู้สึกไม่สบายใจ สามารถปรึกษาสายด่วนสุขภาพจิต 1323
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t mt-8">
              <Button 
                variant="flat" 
                onPress={prevStep} 
                isDisabled={step === 1 || isSubmitting}
                startContent={<ArrowLeft className="w-4 h-4" />}
              >
                ย้อนกลับ
              </Button>
              
              {step < totalSteps ? (
                <Button 
                  color="primary" 
                  onPress={nextStep}
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  ถัดไป
                </Button>
              ) : (
                <Button 
                  color="success" 
                  className="text-white font-bold"
                  onPress={handleSubmit}
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <UserCheck className="w-4 h-4" />}
                >
                  บันทึกและดูผลประเมิน
                </Button>
              )}
            </div>

          </CardBody>
        </Card>

      </div>
    </div>
  );
}
