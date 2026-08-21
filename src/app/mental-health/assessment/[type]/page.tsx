"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardBody, Button, RadioGroup, Radio, Progress, useDisclosure, Accordion, AccordionItem } from "@heroui/react";
import { ArrowLeft, ArrowRight, UserCheck, Loader2, MapPin, User, Users, Check, UserCircle, Heart, Star, XSquare, AlertTriangle, ShieldCheck, Flame, BrainCircuit, Info } from 'lucide-react';
import ConsentModal from '../../components/ConsentModal';
import ResultsModal from '../../components/ResultsModal';
import SelfCareModal from '../../components/SelfCareModal';
import { CloudShader } from '@/components/ui/cloud-shader';
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
  const totalSteps = 9;
  
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isSelfCareOpen, setIsSelfCareOpen] = useState(false);

  // Form States
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  
  // New States for Step 1
  const [assessorType, setAssessorType] = useState<string>("ประชาชน");
  const [address, setAddress] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [amphoe, setAmphoe] = useState<string>("");
  const [tambon, setTambon] = useState<string>("");
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  
  // New State for Step 2
  const [happinessScore, setHappinessScore] = useState<number | null>(null);
  
  // New States for Step 3 (RQ), 4 (Burnout), 6 (2Q+)
  const [rqScores, setRqScores] = useState<number[]>([0,0,0]);
  const [burnoutScores, setBurnoutScores] = useState<number[]>([-1,-1,-1]);
  const [twoQScores, setTwoQScores] = useState<number[]>([-1,-1]);
  const [suicideScore, setSuicideScore] = useState<number>(-1);
  
  const [st5Scores, setSt5Scores] = useState<number[]>([0,0,0,0,0]);
  const [q9Scores, setQ9Scores] = useState<number[]>([-1,-1,-1,-1,-1,-1,-1,-1,-1]);
  
  // New States for Step 8 (8Q)
  const [eightQScores, setEightQScores] = useState<number[]>([-1,-1,-1,-1,-1,-1,-1,-1]);
  const [eightQSubScore, setEightQSubScore] = useState<number>(-1);

  useEffect(() => {
    if (!hasConsented) {
      onOpen();
    }
  }, [hasConsented, onOpen]);

  // Premium UI for Radio buttons
  const radioClassNames = {
    base: "inline-flex m-0 bg-white/70 hover:bg-white items-center justify-start cursor-pointer rounded-xl gap-2 px-5 py-3 border-2 border-transparent data-[selected=true]:border-indigo-500 data-[selected=true]:bg-indigo-50/90 transition-all shadow-sm w-auto",
    label: "font-bold text-slate-700 data-[selected=true]:text-indigo-800",
    wrapper: "group-data-[selected=true]:border-indigo-500",
  };

  const handleAcceptConsent = () => {
    setHasConsented(true);
  };

  const handleDeclineConsent = () => {
    router.push('/mental-health');
  };

  const nextStep = () => {
    // Basic validation
    if (step === 1 && (!age || !gender || !assessorType)) {
      toast.error("กรุณากรอกข้อมูลสำคัญ (อายุ, เพศ, ประเภทผู้ประเมิน) ให้ครบถ้วน");
      return;
    }
    if (step === 2 && happinessScore === null) {
      toast.error("กรุณาเลือกระดับความสุขของคุณ");
      return;
    }
    if (step === 3 && rqScores.includes(0)) {
      toast.error("กรุณาตอบคำถามแบบประเมินพลังใจ (RQ) ให้ครบทุกข้อ");
      return;
    }
    if (step === 4 && burnoutScores.includes(-1)) {
      toast.error("กรุณาตอบคำถามแบบประเมินภาวะหมดไฟ ให้ครบทุกข้อ");
      return;
    }
    // step 5 is ST5
    if (step === 6 && (twoQScores.includes(-1) || suicideScore === -1)) {
      toast.error("กรุณาตอบคำถามแบบคัดกรองซึมเศร้าและฆ่าตัวตายให้ครบทุกข้อ");
      return;
    }
    if (step === 7 && q9Scores.includes(-1)) {
      toast.error("กรุณาตอบคำถามแบบประเมินโรคซึมเศร้า (9Q) ให้ครบทุกข้อ");
      return;
    }
    if (step === 8 && (eightQScores.includes(-1) || (eightQScores[2] === 6 && eightQSubScore === -1))) {
      toast.error("กรุณาตอบคำถามประเมินการฆ่าตัวตาย (8Q) ให้ครบทุกข้อ");
      return;
    }

    if (step === 7) {
      const q9Total = q9Scores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q9Total < 7) {
        setStep(9);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step === 9) {
      const q9Total = q9Scores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q9Total < 7) {
        setStep(7);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleRqChange = (index: number, score: number) => {
    const newScores = [...rqScores];
    newScores[index] = score;
    setRqScores(newScores);
  };

  const handleBurnoutChange = (index: number, value: string) => {
    const newScores = [...burnoutScores];
    newScores[index] = parseInt(value);
    setBurnoutScores(newScores);
  };

  const handleTwoQChange = (index: number, value: string) => {
    const newScores = [...twoQScores];
    newScores[index] = parseInt(value);
    setTwoQScores(newScores);
  };

  const handleEightQChange = (index: number, value: string) => {
    const newScores = [...eightQScores];
    newScores[index] = parseInt(value);
    setEightQScores(newScores);
    
    // Reset subscore if answer to question 3 is "ไม่มี" (0)
    if (index === 2 && value === "0") {
      setEightQSubScore(-1);
    }
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
          assessorType,
          address,
          province,
          amphoe,
          tambon,
          riskFactors,
          happinessScore,
          rqScores,
          burnoutScores,
          twoQScores,
          suicideScore,
          st5Score: totalSt5,
          q9Score: totalQ9
        })
      });

      if (res.ok) {
        toast.success("บันทึกข้อมูลสำเร็จ!");
        setIsResultsOpen(true);
      } else {
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResultsProceed = () => {
    setIsResultsOpen(false);
    setIsSelfCareOpen(true);
  };

  const navigateToResults = () => {
    // Save state to sessionStorage to show in Results page
    const resultsData = {
      refId: Math.floor(Math.random() * 10000000).toString(), // Mock Ref.ID
      assessorType,
      gender,
      age,
      address,
      province,
      amphoe,
      tambon,
      scores: {
        happiness: happinessScore || 0,
        rqTotal: rqScores.reduce((a, b) => a + b, 0),
        burnoutTotal: burnoutScores.reduce((a, b) => a + Math.max(0, b), 0),
        st5Total: st5Scores.reduce((a, b) => a + Math.max(0, b), 0),
        twoQTotal: twoQScores.reduce((a, b) => a + Math.max(0, b), 0),
        q9Total: q9Scores.reduce((a, b) => a + Math.max(0, b), 0),
        suicideScore,
        eightQTotal: (() => {
          const sum = eightQScores.reduce((a, b) => a + Math.max(0, b), 0);
          if (eightQScores[2] === 6 && eightQSubScore !== -1) {
            return sum + eightQSubScore;
          }
          return sum;
        })()
      }
    };
    sessionStorage.setItem('ktltc_mental_health_results', JSON.stringify(resultsData));
    router.push('/mental-health/results');
  };

  const handleSelfCareProceed = () => {
    setIsSelfCareOpen(false);
    navigateToResults();
  };

  const handleSelfCareLater = () => {
    setIsSelfCareOpen(false);
    navigateToResults();
  };

  const ages = Array.from({ length: 85 }, (_, i) => i + 15);

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-200">
      {/* Background CloudShader Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CloudShader
          className="h-full w-full opacity-90"
          speed={0.8}
          count={5}
          cloudColor="#fbf8f2"
          skyTopColor="#3876ba"
          skyBottomColor="#8cbfe8"
        />
        <div className="absolute inset-0 backdrop-blur-lg bg-white/10"></div>
      </div>

      <ConsentModal 
        isOpen={!hasConsented && isOpen} 
        onOpenChange={onOpenChange} 
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
      />

      {hasConsented && (
        <div className="relative z-10 max-w-[1600px] mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-inner shadow-white/20">
                  <UserCheck className="w-6 h-6" />
                </div>
                {title}
              </h1>
              <p className="text-slate-600 font-medium text-sm mt-2 ml-1">
                กรุณาตอบคำถามตามความเป็นจริง เพื่อประโยชน์ในการประเมินสุขภาพจิต
              </p>
            </div>
            <Button variant="flat" color="danger" className="font-bold rounded-xl" onPress={() => router.push('/mental-health')}>
              ยกเลิก / กลับ
            </Button>
          </div>

          <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-700 px-1">
              <span>ขั้นตอนที่ {step} จาก {totalSteps}</span>
              <span className="text-indigo-600">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress 
              value={(step / totalSteps) * 100} 
              classNames={{
                indicator: "bg-gradient-to-r from-blue-500 to-indigo-500",
                track: "bg-white/50 border border-white/60"
              }}
              className="h-3" 
            />
          </div>

          {step > 1 && (
            <Accordion variant="splitted" className="w-full">
              <AccordionItem 
                key="general" 
                aria-label="ประเมินตนเอง" 
                title={
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <UserCircle className="w-5 h-5" /> ประเมินตนเอง
                  </div>
                }
                className="bg-white/50 backdrop-blur-3xl border border-white/60 shadow-sm rounded-2xl"
              >
                <div className="space-y-2 text-sm text-slate-700 pb-3">
                  <p><strong>ประเภท:</strong> {assessorType}</p>
                  <p><strong>เพศ:</strong> {gender} | <strong>อายุ:</strong> {age} ปี</p>
                  <p><strong>ที่อยู่ปัจจุบัน:</strong> {address} {tambon} {amphoe} {province}</p>
                  <div className="flex justify-end mt-2">
                    <Button color="danger" variant="light" size="sm" startContent={<XSquare className="w-4 h-4"/>} onPress={() => router.push('/mental-health')}>
                      ยกเลิกประเมิน
                    </Button>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem 
                key="risk" 
                aria-label="ข้อมูลปัจจัย" 
                title={
                  <div className="flex items-center gap-2 text-rose-600 font-bold">
                    <AlertTriangle className="w-5 h-5" /> ข้อมูลปัจจัย
                  </div>
                }
                className="bg-white/50 backdrop-blur-3xl border border-white/60 shadow-sm rounded-2xl mt-3"
              >
                <div className="pb-3 flex flex-wrap gap-2">
                  {riskFactors.length > 0 ? (
                    riskFactors.map(f => (
                      <span key={f} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
                        #{f}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                      ไม่มีปัจจัยเสี่ยง
                    </span>
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          )}

          <Card className="border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.1)] bg-white/40 backdrop-blur-3xl rounded-4xl overflow-hidden">
            <CardBody className="p-8 md:p-12 space-y-8">
              
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">1</span>
                    <h2 className="text-2xl font-bold text-slate-800">ข้อมูลทั่วไป และ ข้อมูลปัจจัย</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column - General Info */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">1. ข้อมูลทั่วไป (ประเมินตนเอง)</h3>
                      
                      <div className="w-full space-y-2">
                        <label htmlFor="age" className="block text-sm font-bold text-slate-700">อายุ <span className="text-danger">*</span></label>
                        <select 
                          id="age"
                          name="age"
                          className="mt-1 block w-full pl-4 pr-10 py-3 text-base bg-white/50 backdrop-blur-xl border border-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl text-slate-800 font-medium shadow-sm transition-all hover:bg-white/70"
                          required
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        >
                          <option value="" disabled>--เลือกอายุ--</option>
                          {ages.map((a) => (
                            <option key={a} value={a.toString()}>
                              {a.toString()} ปี
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">เพศ <span className="text-danger">*</span></label>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setGender('ชาย')}
                            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${gender === 'ชาย' ? 'border-indigo-500 bg-indigo-50/90 text-indigo-700 shadow-md' : 'border-white/60 bg-white/40 text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
                          >
                            <User className="w-8 h-8" />
                            <span className="font-bold text-sm">ชาย</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender('หญิง')}
                            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${gender === 'หญิง' ? 'border-pink-500 bg-pink-50/90 text-pink-700 shadow-md' : 'border-white/60 bg-white/40 text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
                          >
                            <User className="w-8 h-8" />
                            <span className="font-bold text-sm">หญิง</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender('เพศทางเลือก')}
                            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${gender === 'เพศทางเลือก' ? 'border-purple-500 bg-purple-50/90 text-purple-700 shadow-md' : 'border-white/60 bg-white/40 text-slate-500 hover:bg-white/70 hover:text-slate-700'}`}
                          >
                            <Users className="w-8 h-8" />
                            <span className="font-bold text-xs sm:text-sm">เพศทางเลือก</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="assessorType" className="block text-sm font-bold text-slate-700">ประเภทผู้ประเมิน <span className="text-danger">*</span></label>
                        <select 
                          id="assessorType"
                          value={assessorType}
                          onChange={(e) => setAssessorType(e.target.value)}
                          className="mt-1 block w-full pl-4 pr-10 py-3 text-base bg-white/50 backdrop-blur-xl border border-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-slate-800 font-medium shadow-sm transition-all hover:bg-white/70"
                        >
                          <option value="ประชาชน">1. ประชาชนทั่วไป</option>
                          <option value="นักเรียน/นักศึกษา">2. นักเรียน/นักศึกษา</option>
                          <option value="บุคลากร">3. บุคลากรวิทยาลัย</option>
                        </select>
                      </div>

                      <div className="space-y-4 bg-white/40 p-5 rounded-2xl border border-white/60 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-bold pb-2 border-b border-slate-300/50">
                          <MapPin className="w-5 h-5 text-indigo-600" />
                          ที่อยู่ปัจจุบัน
                        </div>
                        <textarea
                          placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={2}
                          className="w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input type="text" placeholder="จังหวัด" value={province} onChange={(e) => setProvince(e.target.value)} className="w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700" />
                          <input type="text" placeholder="อำเภอ" value={amphoe} onChange={(e) => setAmphoe(e.target.value)} className="w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700" />
                          <input type="text" placeholder="ตำบล" value={tambon} onChange={(e) => setTambon(e.target.value)} className="w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Risk Factors */}
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">2. ข้อมูลปัจจัย</h3>
                      </div>
                      <p className="text-sm font-bold text-indigo-600">เลือกได้มากกว่า 1 ข้อ</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {[
                          "ว่างงาน", "ธุรกิจมีปัญหา", "รายได้น้อย", "พิการทางกาย",
                          "ครอบครัวมีผู้สูงอายุ/เด็กแรกเกิด", "ผู้ป่วยติดเตียง", "ผู้ป่วยเรื้อรังต้องรับยาต่อเนื่อง",
                          "เคยป่วยจิตเวชหรือรับยาทางจิต", "โรคจิตเภท", "โรคซึมเศร้า",
                          "โรคไบโพลาร์", "ผู้ที่มีปัญหาการใช้แอลกอฮอล์/สารเสพติด",
                          "ครอบครัวมีผู้พิการทางกาย/ทางจิต", "ผู้ป่วยโควิด", "HomeQuarantine",
                          "ครอบครัวมีผู้ติดเชื้อ", "ไม่อยู่ในกลุ่มข้างต้น"
                        ].map((factor) => {
                          const isSelected = riskFactors.includes(factor);
                          return (
                            <button
                              key={factor}
                              onClick={() => {
                                if (isSelected) {
                                  setRiskFactors(riskFactors.filter(f => f !== factor));
                                } else {
                                  setRiskFactors([...riskFactors, factor]);
                                }
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-1 ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700' 
                                  : 'bg-white/70 text-slate-600 border-white/60 hover:bg-white hover:border-indigo-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                              #{factor}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs font-medium text-danger mt-4">*หากไม่อยู่ในกลุ่มไหน กรุณาเลือก "#ไม่อยู่ในกลุ่มข้างต้น"</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">2</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบประเมินความสุข (Single Item Happiness Scale)</h2>
                  </div>
                  
                  <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-center text-white shadow-lg space-y-6">
                    <div className="mx-auto bg-white/20 p-3 rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-xl">
                      <Heart className="w-8 h-8 text-pink-300 fill-pink-300" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold">ในช่วง 1 เดือนที่ผ่านมา ท่านมีความสุขอยู่ในระดับใด?</h3>
                    <div className="flex justify-between text-sm md:text-base font-medium px-4 text-white/80">
                      <span>1 (น้อยที่สุด)</span>
                      <span>10 (มากที่สุด)</span>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-sm text-center space-y-6">
                    <div className="flex items-center justify-center gap-2 text-amber-500 font-bold text-lg mb-6">
                      <Star className="w-6 h-6 fill-amber-500" /> กรุณาเลือกระดับความสุขของท่าน
                    </div>
                    
                    <div className="flex justify-center max-w-sm mx-auto bg-white border border-slate-200 rounded-xl overflow-hidden mb-8 shadow-inner">
                      <div className="bg-indigo-600 text-white px-4 py-3 font-bold">คะแนน</div>
                      <div className="flex-1 py-3 font-bold text-slate-700 text-lg">
                        {happinessScore !== null ? happinessScore : "กดเลือกคะแนนด้านล่าง"}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                      {[1,2,3,4,5,6,7,8,9,10].map(score => {
                        const getColors = (s: number) => {
                          if (s <= 2) return "bg-rose-500 text-white shadow-rose-500/30 border-rose-600";
                          if (s <= 4) return "bg-orange-500 text-white shadow-orange-500/30 border-orange-600";
                          if (s <= 6) return "bg-emerald-500 text-white shadow-emerald-500/30 border-emerald-600";
                          if (s <= 8) return "bg-blue-500 text-white shadow-blue-500/30 border-blue-600";
                          return "bg-purple-600 text-white shadow-purple-600/30 border-purple-700";
                        };
                        const isActive = happinessScore === score;
                        return (
                          <button
                            key={score}
                            onClick={() => setHappinessScore(score)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-lg sm:text-xl transition-all border shadow-lg hover:scale-110 active:scale-95 ${getColors(score)} ${isActive ? 'ring-4 ring-offset-2 ring-indigo-400 scale-110' : 'opacity-90 hover:opacity-100'}`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">3</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบประเมินพลังใจ (RQ)</h2>
                  </div>
                  
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-blue-800 font-medium flex items-start gap-3 shadow-sm">
                    <BrainCircuit className="w-6 h-6 shrink-0 mt-0.5 text-blue-600" />
                    <p>ในช่วง 2 สัปดาห์ที่ผ่านมา ท่านมีความเชื่อมั่นในประเด็นต่างๆ ต่อไปนี้เพียงใด? โดย <strong>"1 หมายถึง น้อย และ 10 หมายถึง มาก"</strong></p>
                  </div>

                  <div className="space-y-8">
                    {[
                      "ความยากลำบากทำให้ฉันแกร่งขึ้น",
                      "ฉันมีกำลังใจและได้รับการสนับสนุนจากคนรอบข้าง",
                      "การแก้ไขปัญหาทำให้ฉันมีประสบการณ์มากขึ้น"
                    ].map((q, idx) => (
                      <div key={idx} className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm transition-all hover:bg-white/70">
                        <p className="font-bold text-slate-800 mb-6 text-lg">{idx + 1}.) {q}</p>
                        
                        <div className="flex justify-between items-center bg-slate-100/50 border border-slate-200 rounded-xl overflow-hidden mb-6 max-w-sm ml-auto">
                          <div className="bg-slate-200 text-slate-600 px-4 py-2 text-sm font-bold border-r border-slate-300">คะแนน</div>
                          <div className="flex-1 text-center py-2 font-bold text-slate-700">
                            {rqScores[idx] !== 0 ? rqScores[idx] : "กดเลือกคะแนน"}
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2">
                          {[1,2,3,4,5,6,7,8,9,10].map(score => {
                            const isActive = rqScores[idx] === score;
                            return (
                              <button
                                key={score}
                                onClick={() => handleRqChange(idx, score)}
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-base transition-all border-2 ${isActive ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-110' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">4</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบประเมินภาวะเหนื่อยล้าหมดไฟ (Burnout)</h2>
                  </div>
                  
                  <div className="bg-orange-50/80 p-4 rounded-xl border border-orange-200 text-orange-800 font-medium flex items-start gap-3 shadow-sm">
                    <Flame className="w-6 h-6 shrink-0 mt-0.5 text-orange-500" />
                    <p>ท่านเคยมีความรู้สึกเช่นนี้กับการทำงานของท่านหรือไม่ ?...โดยเลือกคำตอบที่ตรงกับความรู้สึกของท่านมากที่สุด</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      "ท่านรู้สึกขาดแรงใจ/ความกระตือรือร้น",
                      "ท่านรู้สึกไม่อยากสนใจคนรอบข้าง",
                      "ท่านรู้สึกไม่ประสบความสำเร็จเท่าที่ควร"
                    ].map((q, idx) => (
                      <div key={idx} className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm transition-all hover:bg-white/70">
                        <p className="font-bold text-slate-800 mb-6 text-lg">{idx + 1}.) {q}</p>
                        
                        <RadioGroup 
                          orientation="horizontal" 
                          classNames={{
                            wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto justify-start xl:justify-end flex-nowrap"
                          }}
                          value={burnoutScores[idx] !== -1 ? burnoutScores[idx].toString() : ""}
                          onValueChange={(val) => handleBurnoutChange(idx, val)}
                        >
                          <Radio value="0" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-emerald-500 rounded-xl lg:rounded-r-none data-[selected=true]:bg-emerald-500 hover:bg-emerald-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-emerald-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>แทบไม่มี</Radio>
                          <Radio value="1" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-500 rounded-xl lg:rounded-none data-[selected=true]:bg-blue-500 hover:bg-blue-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-blue-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นบางครั้ง</Radio>
                          <Radio value="2" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-amber-500 rounded-xl lg:rounded-none data-[selected=true]:bg-amber-500 hover:bg-amber-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-amber-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>บ่อยครั้ง</Radio>
                          <Radio value="3" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-rose-500 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-500 hover:bg-rose-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-rose-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นประจำ</Radio>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="border-b border-slate-300/50 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">5</span>
                      <h2 className="text-2xl font-bold text-slate-800">แบบประเมินความเครียด (ST5)</h2>
                    </div>
                    <p className="text-slate-600 font-medium mt-2 ml-11">ในระยะ 2-4 สัปดาห์ที่ผ่านมา ท่านมีอาการเหล่านี้บ่อยแค่ไหน?</p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      "มีปัญหาการนอน นอนไม่หลับ หรือนอนมากไป",
                      "มีสมาธิน้อยลง",
                      "หงุดหงิด/กระวนกระวาย/ว้าวุ่นใจ",
                      "รู้สึกเบื่อ เซ็ง",
                      "ไม่อยากพบปะผู้คน"
                    ].map((q, idx) => (
                      <div key={idx} className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-md hover:bg-white/60 transition-all">
                        <p className="font-bold text-slate-800 mb-4 text-lg">{idx + 1}. {q}</p>
                        <RadioGroup 
                          orientation="horizontal" 
                          classNames={{
                            wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto justify-start xl:justify-end flex-nowrap"
                          }}
                          value={st5Scores[idx].toString()}
                          onValueChange={(val) => handleSt5Change(idx, val)}
                        >
                          <Radio value="0" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-emerald-500 rounded-xl lg:rounded-r-none data-[selected=true]:bg-emerald-500 hover:bg-emerald-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-emerald-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>แทบไม่มี</Radio>
                          <Radio value="1" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-500 rounded-xl lg:rounded-none data-[selected=true]:bg-blue-500 hover:bg-blue-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-blue-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นบางครั้ง</Radio>
                          <Radio value="2" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-amber-500 rounded-xl lg:rounded-none data-[selected=true]:bg-amber-500 hover:bg-amber-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-amber-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>บ่อยครั้ง</Radio>
                          <Radio value="3" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-rose-500 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-500 hover:bg-rose-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-rose-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นประจำ</Radio>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">6</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบคัดกรองภาวะซึมเศร้า 2 คำถาม (2Q PLUS)</h2>
                  </div>
                  
                  <div className="space-y-8">
                    {/* 2Q Part */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 font-bold flex items-center gap-2 shadow-sm">
                        <UserCircle className="w-5 h-5" /> แบบคัดกรองภาวะซึมเศร้า 2 คำถาม (2Q+)
                      </div>
                      
                      {[
                        "ใน 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านรู้สึก หดหู่ เศร้า หรือท้อแท้สิ้นหวัง หรือไม่ ?",
                        "ใน 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านรู้สึก เบื่อ ทำอะไรก็ไม่เพลิดเพลิน หรือไม่ ?"
                      ].map((q, idx) => (
                        <div key={idx} className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between transition-all hover:bg-white/70">
                          <p className="font-bold text-slate-800 flex-1">{idx + 1}.) {q}</p>
                          <RadioGroup 
                            orientation="horizontal" 
                            classNames={{
                              wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto flex-nowrap"
                            }}
                            value={twoQScores[idx] !== -1 ? twoQScores[idx].toString() : ""}
                            onValueChange={(val) => handleTwoQChange(idx, val)}
                          >
                            <Radio value="0" classNames={{
                              base: "inline-flex m-0 bg-blue-600 items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-600 rounded-xl lg:rounded-r-none hover:bg-blue-700 data-[selected=true]:bg-blue-700 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                              label: "font-bold text-white",
                              wrapper: "hidden",
                            }}>ไม่มี</Radio>
                            <Radio value="1" classNames={{
                              base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-slate-200 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-50 hover:bg-slate-50 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                              label: "font-bold text-red-600",
                              wrapper: "hidden",
                            }}>ใช่</Radio>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>

                    {/* Suicide Risk Part */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-blue-800 font-bold flex items-center gap-2 shadow-sm">
                        <AlertTriangle className="w-5 h-5" /> คำถามคัดกรองการฆ่าตัวตาย
                      </div>
                      
                      <div className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between transition-all hover:bg-white/70">
                        <p className="font-bold text-slate-800 flex-1">1.) ใน 1 เดือนที่ผ่านมา รวมถึงวันนี้ ท่านมีความรู้สึกทุกข์ใจจนไม่อยากมีชีวิตอยู่ ?</p>
                        <RadioGroup 
                          orientation="horizontal" 
                          classNames={{
                            wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto flex-nowrap"
                          }}
                          value={suicideScore !== -1 ? suicideScore.toString() : ""}
                          onValueChange={(val) => setSuicideScore(parseInt(val))}
                        >
                          <Radio value="0" classNames={{
                            base: "inline-flex m-0 bg-blue-600 items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-600 rounded-xl lg:rounded-r-none hover:bg-blue-700 data-[selected=true]:bg-blue-700 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                            label: "font-bold text-white",
                            wrapper: "hidden",
                          }}>ไม่มี</Radio>
                          <Radio value="1" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-slate-200 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-50 hover:bg-slate-50 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                            label: "font-bold text-red-600",
                            wrapper: "hidden",
                          }}>ใช่</Radio>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">7</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบคัดกรองโรคซึมเศร้าด้วย 9 คำถาม (9Q)</h2>
                  </div>
                  
                  <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-blue-800 font-medium flex items-start gap-3 shadow-sm">
                    <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <p>ในช่วง 2 สัปดาห์ที่ผ่านมารวมถึงวันนี้ ท่านมีอาการเหล่านี้ บ่อยแค่ไหน ?</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      "เบื่อ ไม่สนใจอยากทำอะไร",
                      "ไม่สบายใจ ซึมเศร้า ท้อแท้",
                      "หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป",
                      "เหนื่อยง่าย หรือไม่ค่อยมีแรง",
                      "เบื่ออาหาร หรือกินมากเกินไป",
                      "รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลวหรือครอบครัวผิดหวัง",
                      "สมาธิไม่ดี เวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ",
                      "พูดช้า ทำอะไรช้าลงจนคนอื่นสังเกตเห็นได้ หรือกระสับกระส่ายไม่สามารถอยู่นิ่งได้เหมือนที่เคยเป็น",
                      "คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี"
                    ].map((q, idx) => (
                      <div key={idx} className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col xl:flex-row xl:items-center gap-4 justify-between transition-all hover:bg-white/70">
                        <p className="font-bold text-slate-800 flex-1">{idx + 1}.) {q}</p>
                        
                        <RadioGroup 
                          orientation="horizontal" 
                          classNames={{
                            wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto justify-start xl:justify-end flex-nowrap"
                          }}
                          value={q9Scores[idx] !== -1 ? q9Scores[idx].toString() : ""}
                          onValueChange={(val) => handleQ9Change(idx, val)}
                        >
                          <Radio value="0" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-emerald-500 rounded-xl lg:rounded-r-none data-[selected=true]:bg-emerald-500 hover:bg-emerald-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-emerald-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>ไม่มีเลย</Radio>
                          <Radio value="1" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-500 rounded-xl lg:rounded-none data-[selected=true]:bg-blue-500 hover:bg-blue-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[140px]",
                            label: "font-bold text-sm text-blue-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นบางวัน(1-7 วัน)</Radio>
                          <Radio value="2" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 lg:border-r-0 border-amber-500 rounded-xl lg:rounded-none data-[selected=true]:bg-amber-500 hover:bg-amber-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[140px]",
                            label: "font-bold text-sm text-amber-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นบ่อย(มากกว่า 7 วัน)</Radio>
                          <Radio value="3" classNames={{
                            base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-rose-500 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-500 hover:bg-rose-50 transition-all px-4 py-3 lg:py-2 w-full lg:w-auto lg:min-w-[120px]",
                            label: "font-bold text-sm text-rose-600 data-[selected=true]:text-white whitespace-nowrap",
                            wrapper: "hidden",
                          }}>เป็นทุกวัน</Radio>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold text-sm">8</span>
                    <h2 className="text-2xl font-bold text-slate-800">แบบประเมินการฆ่าตัวตาย 8 คำถาม (8Q)</h2>
                  </div>
                  
                  <div className="bg-rose-50/80 p-4 rounded-xl border border-rose-200 text-rose-800 font-medium flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                    <p>ในช่วง 1 เดือนที่ผ่านมารวมถึงวันนี้ ท่านมีพฤติกรรมเหล่านี้หรือไม่ ?</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { q: "คิดอยากตาย หรือ คิดว่าตายไปจะดีกว่า", s: 1 },
                      { q: "อยากทำร้ายตัวเอง หรือ ทำให้ตัวเองบาดเจ็บ", s: 2 },
                      { q: "คิดเกี่ยวกับการฆ่าตัวตาย", s: 6 },
                      { q: "มีแผนการที่จะฆ่าตัวตาย", s: 8 },
                      { q: "ได้เตรียมการที่จะทำร้ายตนเองหรือเตรียมการจะฆ่าตัวตายโดยตั้งใจว่าจะให้ตายจริง ๆ", s: 9 },
                      { q: "ได้ทำให้ตนเองบาดเจ็บแต่ไม่ตั้งใจที่จะทำให้เสียชีวิต", s: 4 },
                      { q: "ได้พยายามฆ่าตัวตายโดยคาดหวัง/ตั้งใจที่จะให้ตาย", s: 10 },
                      { q: "ตลอดชีวิตที่ผ่านมา ท่านเคยพยายามฆ่าตัวตาย", s: 4, period: "ตลอดชีวิตที่ผ่านมา" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between transition-all hover:bg-white/70">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{idx + 1}.) {item.q}</p>
                            {item.period && <p className="text-sm text-slate-500 mt-1">({item.period})</p>}
                          </div>
                          
                          <RadioGroup 
                            orientation="horizontal" 
                            classNames={{
                              wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto flex-nowrap"
                            }}
                            value={eightQScores[idx] !== -1 ? eightQScores[idx].toString() : ""}
                            onValueChange={(val) => handleEightQChange(idx, val)}
                          >
                            <Radio value="0" classNames={{
                              base: "inline-flex m-0 bg-blue-600 items-center justify-center cursor-pointer border-2 lg:border-r-0 border-blue-600 rounded-xl lg:rounded-r-none hover:bg-blue-700 data-[selected=true]:bg-blue-700 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                              label: "font-bold text-white",
                              wrapper: "hidden",
                            }}>ไม่มี</Radio>
                            <Radio value={item.s.toString()} classNames={{
                              base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-slate-200 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-50 hover:bg-slate-50 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                              label: "font-bold text-red-600",
                              wrapper: "hidden",
                            }}>มี</Radio>
                          </RadioGroup>
                        </div>

                        {/* Sub-question for question 3 (index 2) */}
                        {idx === 2 && eightQScores[2] === 6 && (
                          <div className="ml-0 lg:ml-8 bg-orange-50/80 backdrop-blur-xl p-6 rounded-2xl border border-orange-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between transition-all animate-in fade-in slide-in-from-top-2">
                            <p className="font-bold text-slate-800 flex-1 text-sm md:text-base">ท่านสามารถควบคุมความอยากฆ่าตัวตายที่ท่านคิดอยู่นั้นได้หรือไม่ หรือบอกได้ไหมว่าคงจะไม่ทำตามความคิดนั้นในขณะนี้ ?</p>
                            <RadioGroup 
                              orientation="horizontal" 
                              classNames={{
                                wrapper: "flex-col lg:flex-row gap-3 lg:gap-0 w-full lg:w-auto flex-nowrap"
                              }}
                              value={eightQSubScore !== -1 ? eightQSubScore.toString() : ""}
                              onValueChange={(val) => setEightQSubScore(parseInt(val))}
                            >
                              <Radio value="0" classNames={{
                                base: "inline-flex m-0 bg-emerald-600 items-center justify-center cursor-pointer border-2 lg:border-r-0 border-emerald-600 rounded-xl lg:rounded-r-none hover:bg-emerald-700 data-[selected=true]:bg-emerald-700 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                                label: "font-bold text-white",
                                wrapper: "hidden",
                              }}>ได้</Radio>
                              <Radio value="8" classNames={{
                                base: "inline-flex m-0 bg-white items-center justify-center cursor-pointer border-2 border-slate-200 rounded-xl lg:rounded-l-none data-[selected=true]:bg-rose-50 hover:bg-slate-50 transition-all px-6 py-3 lg:py-2 w-full lg:w-28",
                                label: "font-bold text-red-600",
                                wrapper: "hidden",
                              }}>ไม่ได้</Radio>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 9 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">9</span>
                    <h2 className="text-2xl font-bold text-slate-800">สรุปผลการประเมิน</h2>
                  </div>
                  <div className="bg-linear-to-br from-blue-50/80 to-indigo-100/80 p-8 rounded-3xl text-center space-y-6 border border-white shadow-inner">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-md text-indigo-500">
                      <UserCheck className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-indigo-900 tracking-tight">ส่งข้อมูลแบบประเมิน</h3>
                    <p className="text-slate-700 font-medium max-w-lg mx-auto">
                      ข้อมูลของท่านจะถูกเก็บเป็นความลับ การประเมินนี้เป็นการคัดกรองเบื้องต้นเท่านั้น
                      หากท่านรู้สึกไม่สบายใจ สามารถปรึกษาสายด่วนสุขภาพจิต 1323
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-8 border-t border-slate-300/50 mt-8">
                <Button 
                  variant="flat" 
                  className="font-bold bg-white/60 hover:bg-white/80 rounded-xl px-6"
                  onPress={prevStep} 
                  isDisabled={step === 1 || isSubmitting}
                  startContent={<ArrowLeft className="w-4 h-4" />}
                >
                  ย้อนกลับ
                </Button>
                
                {step < totalSteps ? (
                  <Button 
                    className="font-bold bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 rounded-xl px-8"
                    onPress={nextStep}
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    ถัดไป
                  </Button>
                ) : (
                  <Button 
                    className="font-bold bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 rounded-xl px-8"
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
      )}

      <ResultsModal 
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        scores={{
          rq: rqScores,
          burnout: burnoutScores,
          st5: st5Scores,
          twoQ: twoQScores,
          q9: q9Scores,
          suicide: suicideScore,
          happiness: happinessScore || 0
        }}
        onProceed={handleResultsProceed}
      />

      <SelfCareModal 
        isOpen={isSelfCareOpen}
        onClose={handleSelfCareLater}
        onProceed={handleSelfCareProceed}
      />
    </div>
  );
}
