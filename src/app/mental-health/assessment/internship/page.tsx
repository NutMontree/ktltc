"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, RadioGroup, Radio, Progress, useDisclosure } from "@heroui/react";
import { ArrowLeft, ArrowRight, UserCheck, MapPin, Check, Save, Flame, BrainCircuit, Heart, AlertTriangle, Edit2, Loader2 } from 'lucide-react';
import { CloudShader } from '@/components/ui/cloud-shader';
import toast, { Toaster } from 'react-hot-toast';
import { organizationQuiz } from '@/data/organizationQuiz';

export default function InternshipAssessmentPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States (Step 1)
  const [name, setName] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [classroom, setClassroom] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [addressHouse, setAddressHouse] = useState<string>("");
  const [addressVillage, setAddressVillage] = useState<string>("");
  const [addressSubdistrict, setAddressSubdistrict] = useState<string>("");
  const [addressDistrict, setAddressDistrict] = useState<string>("");
  const [addressProvince, setAddressProvince] = useState<string>("");
  const [addressZipcode, setAddressZipcode] = useState<string>("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Load Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setStudentId(data.studentId || "");
          setDepartment(data.department || "");
          setClassroom(data.classroomName || data.groupCode || "");
          setAge(data.age || "");
          setGender(data.gender || "");
          setAddressHouse(data.addressHouse || "");
          setAddressVillage(data.addressVillage || "");
          setAddressSubdistrict(data.addressSubdistrict || "");
          setAddressDistrict(data.addressDistrict || "");
          setAddressProvince(data.addressProvince || "");
          setAddressZipcode(data.addressZipcode || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    fetchProfile();
  }, []);
  
  // Mental Health States (Step 2 - 5)
  const [st5Scores, setSt5Scores] = useState<number[]>([-1,-1,-1,-1,-1]);
  const [twoQScores, setTwoQScores] = useState<number[]>([-1,-1]);
  const [q9Scores, setQ9Scores] = useState<number[]>([-1,-1,-1,-1,-1,-1,-1,-1,-1]);
  const [eightQScores, setEightQScores] = useState<number[]>([-1,-1,-1,-1,-1,-1,-1,-1]);
  const [eightQSubScore, setEightQSubScore] = useState<number>(-1);

  // Soft Skills States (Step 7 - 11)
  const [softSkillsAnswers, setSoftSkillsAnswers] = useState<Record<number, number>>({});

  // Pagination for soft skills (50 questions, 10 per page)
  const softSkillsStartStep = 7;
  const questionsPerPage = 10;
  
  // Calculate total steps
  // 1: Info, 2: ST5, 3: 2Q, 4: 9Q, 5: 8Q, 6: Transition, 7-11: 50 Questions
  const totalSteps = 11;

  // Premium UI for Radio buttons
  const radioClassNames = {
    base: "inline-flex m-0 bg-white/70 hover:bg-white items-center justify-start cursor-pointer rounded-xl gap-2 px-5 py-3 border-2 border-transparent data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50/90 transition-all shadow-sm w-auto",
    label: "font-bold text-slate-700 data-[selected=true]:text-blue-800",
    wrapper: "group-data-[selected=true]:border-blue-500",
  };

  const nextStep = async () => {
    // Validations
    if (step === 1 && (!name || !studentId || !department || !classroom || !age || !gender)) {
      toast.error("กรุณากรอกข้อมูลส่วนตัวและห้องเรียนให้ครบถ้วน");
      return;
    }
    
    if (step === 1 && isEditing) {
      try {
        const payload = { 
          name, studentId, department, classroomName: classroom, age, gender,
          addressHouse, addressVillage, addressSubdistrict, 
          addressDistrict, addressProvince, addressZipcode
        };
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        toast.success("บันทึกอัปเดตข้อมูลนักศึกษาเรียบร้อย", { icon: "✅" });
        setIsEditing(false);
      } catch (e) {
        console.error(e);
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    }

    if (step === 2 && st5Scores.includes(-1)) {
      toast.error("กรุณาตอบคำถามความเครียด (ST5) ให้ครบทุกข้อ");
      return;
    }
    if (step === 3 && twoQScores.includes(-1)) {
      toast.error("กรุณาตอบคำถามคัดกรองซึมเศร้า (2Q) ให้ครบทุกข้อ");
      return;
    }
    if (step === 4 && q9Scores.includes(-1)) {
      toast.error("กรุณาตอบคำถามประเมินซึมเศร้า (9Q) ให้ครบทุกข้อ");
      return;
    }
    if (step === 5 && (eightQScores.includes(-1) || (eightQScores[2] === 6 && eightQSubScore === -1))) {
      toast.error("กรุณาตอบคำถามประเมินการฆ่าตัวตาย (8Q) ให้ครบทุกข้อ");
      return;
    }

    // Logic Jumps
    if (step === 3) {
      const q2Total = twoQScores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q2Total === 0) {
        // Skip 9Q and 8Q
        setStep(6);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (step === 4) {
      const q9Total = q9Scores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q9Total < 7) {
        // Skip 8Q
        setStep(6);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    // Soft skills validation
    if (step >= softSkillsStartStep && step <= totalSteps) {
      const pageIndex = step - softSkillsStartStep;
      const startIndex = pageIndex * questionsPerPage;
      const currentQuestions = organizationQuiz.slice(startIndex, startIndex + questionsPerPage);
      const allAnswered = currentQuestions.every(q => softSkillsAnswers[q.id] !== undefined);
      if (!allAnswered) {
        toast.error("กรุณาตอบคำถามให้ครบทุกข้อในหน้านี้");
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step === 6) {
      const q2Total = twoQScores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q2Total === 0) {
        setStep(3); // Go back to 2Q
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const q9Total = q9Scores.reduce((a, b) => a + Math.max(0, b), 0);
      if (q9Total < 7) {
        setStep(4); // Go back to 9Q
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Final Validation
    const allAnswered = Object.keys(softSkillsAnswers).length === organizationQuiz.length;
    if (!allAnswered) {
      toast.error("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }
    
    setIsSubmitting(true);
    
    // Calculate Soft Skills Score
    let softSkillsScore = 0;
    Object.entries(softSkillsAnswers).forEach(([qId, ans]) => {
      const q = organizationQuiz.find(quiz => quiz.id === parseInt(qId));
      if (q && q.correctAnswer === ans) {
        softSkillsScore += q.points;
      }
    });

    // Results Data
    const resultsData = {
      name,
      studentId,
      department,
      classroom,
      age,
      gender,
      scores: {
        st5Total: st5Scores.reduce((a, b) => a + Math.max(0, b), 0),
        twoQTotal: twoQScores.reduce((a, b) => a + Math.max(0, b), 0),
        q9Total: q9Scores.includes(-1) ? 0 : q9Scores.reduce((a, b) => a + Math.max(0, b), 0),
        q8Total: eightQScores.includes(-1) ? 0 : eightQScores.reduce((a, b) => a + Math.max(0, b), 0),
        softSkillsScore,
        softSkillsTotal: organizationQuiz.length
      },
      timestamp: new Date().toISOString()
    };
    
    try {
      // Save to database
      const res = await fetch('/api/mental-health/internship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultsData)
      });
      
      if (!res.ok) {
        throw new Error("Failed to save to database");
      }

      // Save to session storage for the results page to read
      sessionStorage.setItem('ktltc_internship_results', JSON.stringify(resultsData));
      
      router.push('/mental-health/results/internship');
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
      setIsSubmitting(false);
    }
  };

  const handleSt5Change = (index: number, value: string) => {
    const newScores = [...st5Scores];
    newScores[index] = parseInt(value);
    setSt5Scores(newScores);
  };

  const handleTwoQChange = (index: number, value: string) => {
    const newScores = [...twoQScores];
    newScores[index] = parseInt(value);
    setTwoQScores(newScores);
  };

  const handleQ9Change = (index: number, value: string) => {
    const newScores = [...q9Scores];
    newScores[index] = parseInt(value);
    setQ9Scores(newScores);
  };

  const handleEightQChange = (index: number, value: string) => {
    const newScores = [...eightQScores];
    newScores[index] = parseInt(value);
    setEightQScores(newScores);
    if (index === 2 && value === "0") {
      setEightQSubScore(-1);
    }
  };

  const handleSoftSkillsChange = (questionId: number, value: string) => {
    setSoftSkillsAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-200">
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

      <div className="relative z-10 max-w-[1600px] mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl text-white shadow-inner shadow-white/20">
                <UserCheck className="w-6 h-6" />
              </div>
              คัดกรองก่อนออกฝึกประสบการณ์วิชาชีพ
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-2 ml-1">
              แบบประเมินสุขภาพจิตและทักษะความพร้อมในการทำงาน
            </p>
          </div>
          <Button variant="flat" color="danger" className="font-bold rounded-xl" onPress={() => router.push('/mental-health')}>
            ยกเลิก / กลับ
          </Button>
        </div>

        {/* Progress */}
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 space-y-4">
          <div className="flex justify-between text-sm font-bold text-slate-700 px-1">
            <span>
              {step < 6 ? `พาร์ท 1: สุขภาพจิต (หน้า ${step}/5)` : step === 6 ? 'พาร์ท 1 เสร็จสิ้น' : `พาร์ท 2: ทักษะการทำงาน (หน้า ${step - 6}/5)`}
            </span>
            <span className="text-blue-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress 
            value={(step / totalSteps) * 100} 
            classNames={{
              indicator: "bg-gradient-to-r from-blue-500 to-cyan-500",
              track: "bg-white/50 border border-white/60"
            }}
            className="h-3" 
          />
        </div>

        {/* Content Card */}
        <Card className="border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.1)] bg-white/40 backdrop-blur-3xl rounded-4xl overflow-hidden">
          <CardBody className="p-6 md:p-8 space-y-8">
            
            {/* Step 1: Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-slate-300/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">1</span>
                    <h2 className="text-2xl font-bold text-slate-800">ข้อมูลส่วนตัวนักศึกษา</h2>
                  </div>
                  {!isEditing && (
                    <Button 
                      size="sm" 
                      color="primary" 
                      variant="flat" 
                      className="font-bold rounded-lg" 
                      onPress={() => setIsEditing(true)}
                      startContent={<Edit2 className="w-4 h-4" />}
                    >
                      แก้ไขข้อมูล
                    </Button>
                  )}
                </div>
                
                {!isProfileLoaded ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm relative">
                    {!isEditing && <div className="absolute inset-0 z-10 bg-white/10 rounded-3xl cursor-not-allowed"></div>}
                    
                    <div className="md:col-span-2 border-b border-slate-200 pb-2 mb-2">
                      <h3 className="font-bold text-lg text-slate-800">ข้อมูลพื้นฐาน</h3>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">ชื่อ-นามสกุล <span className="text-danger">*</span></label>
                      <input type="text" readOnly={!isEditing} value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">รหัสนักศึกษา <span className="text-danger">*</span></label>
                      <input type="text" readOnly={!isEditing} value={studentId} onChange={(e) => setStudentId(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">สาขางาน/แผนกวิชา <span className="text-danger">*</span></label>
                      <input type="text" readOnly={!isEditing} value={department} onChange={(e) => setDepartment(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">ห้องเรียน <span className="text-danger">*</span></label>
                      <input type="text" readOnly={!isEditing} placeholder="เช่น ทธ.65.1" value={classroom} onChange={(e) => setClassroom(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">อายุ <span className="text-danger">*</span></label>
                        <input type="number" readOnly={!isEditing} value={age} onChange={(e) => setAge(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">เพศ <span className="text-danger">*</span></label>
                        <select disabled={!isEditing} value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80 cursor-not-allowed' : ''}`}>
                          <option value="">เลือก</option>
                          <option value="ชาย">ชาย</option>
                          <option value="หญิง">หญิง</option>
                          <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 border-b border-slate-200 pb-2 mb-2 mt-4">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" /> ข้อมูลที่อยู่ปัจจุบัน
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">บ้านเลขที่ หมู่ที่ ซอย</label>
                        <input type="text" readOnly={!isEditing} placeholder="เช่น 123 ม.4 ซ.โชคดี" value={addressHouse} onChange={(e) => setAddressHouse(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">อาคาร หมู่บ้าน ถนน</label>
                        <input type="text" readOnly={!isEditing} placeholder="เช่น อาคารทองคำ ถ.สุขุมวิท" value={addressVillage} onChange={(e) => setAddressVillage(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2 mt-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">ตำบล/แขวง</label>
                        <input type="text" readOnly={!isEditing} value={addressSubdistrict} onChange={(e) => setAddressSubdistrict(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">อำเภอ/เขต</label>
                        <input type="text" readOnly={!isEditing} value={addressDistrict} onChange={(e) => setAddressDistrict(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">จังหวัด</label>
                        <input type="text" readOnly={!isEditing} value={addressProvince} onChange={(e) => setAddressProvince(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">รหัสไปรษณีย์</label>
                        <input type="text" readOnly={!isEditing} value={addressZipcode} onChange={(e) => setAddressZipcode(e.target.value)} className={`w-full p-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium ${!isEditing ? 'opacity-80' : ''}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: ST5 */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">2</span>
                  <h2 className="text-2xl font-bold text-slate-800">แบบประเมินความเครียด (ST5)</h2>
                </div>
                <div className="space-y-6">
                  {[
                    "1. มีปัญหาการนอน นอนไม่หลับหรือนอนมาก",
                    "2. สมาธิน้อยลง",
                    "3. หงุดหงิด/กระวนกระวาย/ว้าวุ่นใจ",
                    "4. รู้สึกเบื่อ เซ็ง",
                    "5. ไม่อยากพบปะผู้คน"
                  ].map((question, index) => (
                    <div key={index} className="bg-white/50 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4">
                      <p className="font-bold text-slate-800 text-base md:text-lg">{question}</p>
                      <RadioGroup orientation="horizontal" value={st5Scores[index]?.toString()} onValueChange={(val) => handleSt5Change(index, val)} classNames={{ wrapper: "flex flex-wrap gap-3" }}>
                        <Radio value="0" classNames={radioClassNames}>แทบไม่มีเลย</Radio>
                        <Radio value="1" classNames={radioClassNames}>เป็นบางครั้ง</Radio>
                        <Radio value="2" classNames={radioClassNames}>บ่อยครั้ง</Radio>
                        <Radio value="3" classNames={radioClassNames}>เป็นประจำ</Radio>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: 2Q */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">3</span>
                  <h2 className="text-2xl font-bold text-slate-800">คัดกรองภาวะซึมเศร้า (2Q)</h2>
                </div>
                <div className="space-y-6">
                  {[
                    "1. รู้สึกหดหู่ เศร้า หรือท้อแท้สิ้นหวัง",
                    "2. รู้สึกเบื่อ ทำอะไรก็ไม่เพลิดเพลิน"
                  ].map((question, index) => (
                    <div key={index} className="bg-white/50 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4">
                      <p className="font-bold text-slate-800 text-base md:text-lg">ใน 2 สัปดาห์ที่ผ่านมารวมวันนี้ ท่าน {question} หรือไม่?</p>
                      <RadioGroup orientation="horizontal" value={twoQScores[index]?.toString()} onValueChange={(val) => handleTwoQChange(index, val)} classNames={{ wrapper: "flex flex-wrap gap-3" }}>
                        <Radio value="0" classNames={radioClassNames}>ไม่มี</Radio>
                        <Radio value="1" classNames={radioClassNames}>มี</Radio>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: 9Q */}
            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">4</span>
                  <h2 className="text-2xl font-bold text-slate-800">ประเมินภาวะซึมเศร้า (9Q)</h2>
                </div>
                <div className="space-y-6">
                  {[
                    "1. เบื่อ ไม่สนใจอยากทำอะไร",
                    "2. ไม่สบายใจ ซึมเศร้า ท้อแท้",
                    "3. หลับยาก หรือหลับๆ ตื่นๆ หรือหลับมากไป",
                    "4. เหนื่อยง่าย หรือ ไม่ค่อยมีแรง",
                    "5. เบื่ออาหาร หรือ กินมากเกินไป",
                    "6. รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ตนเองหรือครอบครัวผิดหวัง",
                    "7. สมาธิไม่ดีเวลาทำอะไร เช่น ดูโทรทัศน์ ฟังวิทยุ หรือทำงานที่ต้องใช้ความตั้งใจ",
                    "8. พูดช้า ทำอะไรช้าลง จนคนอื่นสังเกตเห็น หรือกระสับกระส่ายไม่สามารถอยู่นิ่งได้เหมือนที่เคยเป็น",
                    "9. คิดทำร้ายตนเอง หรือคิดว่าถ้าตายไปคงจะดี"
                  ].map((question, index) => (
                    <div key={index} className="bg-white/50 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4">
                      <p className="font-bold text-slate-800 text-base md:text-lg">{question}</p>
                      <RadioGroup orientation="vertical" value={q9Scores[index]?.toString()} onValueChange={(val) => handleQ9Change(index, val)} classNames={{ wrapper: "gap-3" }}>
                        <Radio value="0" classNames={radioClassNames}>ไม่มีเลย</Radio>
                        <Radio value="1" classNames={radioClassNames}>เป็นบางวัน (1-7 วัน)</Radio>
                        <Radio value="2" classNames={radioClassNames}>เป็นบ่อย (มากกว่า 7 วัน)</Radio>
                        <Radio value="3" classNames={radioClassNames}>เป็นทุกวัน</Radio>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: 8Q */}
            {step === 5 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">5</span>
                  <h2 className="text-2xl font-bold text-slate-800">ประเมินความเสี่ยงการฆ่าตัวตาย (8Q)</h2>
                </div>
                <div className="space-y-6">
                  {[
                    "1. คิดอยากตาย หรือ คิดว่าตายไปจะดีกว่า",
                    "2. อยากทำร้ายตัวเอง หรือ ทำให้ตัวเองบาดเจ็บ",
                    "3. คิดเกี่ยวกับการฆ่าตัวตาย (ถ้าตอบว่าไม่มี ให้ข้ามไปข้อ 4)",
                    "4. มีแผนการที่จะฆ่าตัวตาย",
                    "5. ได้เตรียมการที่จะทำร้ายตนเองหรือฆ่าตัวตาย",
                    "6. ได้ทำให้ตนเองบาดเจ็บแต่ไม่ตั้งใจที่จะทำให้เสียชีวิต",
                    "7. ได้พยายามฆ่าตัวตาย โดยคาดหวัง/ตั้งใจที่จะให้เสียชีวิต",
                    "8. ตลอดชีวิตที่ผ่านมา ท่านเคยพยายามฆ่าตัวตาย"
                  ].map((question, index) => {
                    const isQuestion3 = index === 2;
                    const valueObj = [
                      { val: "0", label: "ไม่มี", points: 0 },
                      { val: isQuestion3 ? "6" : "8", label: "มี", points: isQuestion3 ? 6 : (index === 0 ? 1 : index === 1 ? 2 : index === 3 ? 8 : index === 4 ? 9 : index === 5 ? 4 : index === 6 ? 10 : 4) },
                    ];

                    const isSubscoreSection = isQuestion3 && eightQScores[2] === 6;

                    return (
                      <div key={index} className="bg-white/50 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4">
                        <p className="font-bold text-slate-800 text-base md:text-lg">{question}</p>
                        <RadioGroup orientation="horizontal" value={eightQScores[index]?.toString()} onValueChange={(val) => handleEightQChange(index, val)} classNames={{ wrapper: "flex flex-wrap gap-3" }}>
                          {valueObj.map((opt) => (
                            <Radio key={opt.val} value={opt.val} classNames={radioClassNames}>{opt.label}</Radio>
                          ))}
                        </RadioGroup>

                        {isSubscoreSection && (
                          <div className="mt-4 p-5 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="font-bold text-slate-800 mb-3">ท่านสามารถควบคุมความอยากฆ่าตัวตายที่ท่านคิดอยู่นั้นได้หรือไม่?</p>
                            <RadioGroup orientation="horizontal" value={eightQSubScore.toString()} onValueChange={(val) => setEightQSubScore(parseInt(val))} classNames={{ wrapper: "flex flex-wrap gap-3" }}>
                              <Radio value="0" classNames={radioClassNames}>ได้</Radio>
                              <Radio value="8" classNames={radioClassNames}>ไม่ได้</Radio>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Transition Screen */}
            {step === 6 && (
              <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-12">
                <div className="inline-block p-6 bg-emerald-100 rounded-full mb-4 shadow-inner shadow-emerald-200">
                  <Check className="w-16 h-16 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800">เยี่ยมมาก! ผ่านพาร์ทสุขภาพจิตแล้ว 🎉</h2>
                <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto">
                  ต่อไปเป็นพาร์ทประเมินความพร้อมทักษะในการทำงาน 50 ข้อ ซึ่งจะช่วยบอกว่าคุณมีความพร้อมในการออกฝึกประสบการณ์วิชาชีพมากน้อยแค่ไหน
                </p>
                <div className="pt-8">
                  <Button 
                    className="font-bold bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 rounded-xl px-10 py-6 text-lg"
                    onPress={nextStep}
                    endContent={<ArrowRight className="w-5 h-5" />}
                  >
                    ลุยต่อเลย!
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7-11: 50 Questions (Soft Skills) */}
            {step >= softSkillsStartStep && step <= totalSteps && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b border-slate-300/50 pb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                    {step - softSkillsStartStep + 1}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-800">ประเมินทักษะการทำงาน</h2>
                </div>
                
                {organizationQuiz.slice((step - softSkillsStartStep) * questionsPerPage, (step - softSkillsStartStep + 1) * questionsPerPage).map((q) => (
                  <div key={q.id} className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4 transition-all hover:bg-white/70">
                    <p className="font-bold text-slate-800 text-lg">{q.id}. {q.question}</p>
                    
                    <RadioGroup 
                      orientation="vertical" 
                      value={softSkillsAnswers[q.id]?.toString()}
                      onValueChange={(val) => handleSoftSkillsChange(q.id, val)}
                      classNames={{ wrapper: "gap-3" }}
                    >
                      {q.options.map((opt, optIdx) => (
                        <Radio 
                          key={optIdx} 
                          value={(optIdx + 1).toString()} 
                          classNames={{
                            base: "inline-flex m-0 bg-white hover:bg-blue-50 items-center justify-start cursor-pointer border-2 border-transparent hover:border-blue-200 rounded-xl data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50 transition-all px-4 py-3 w-full max-w-full",
                            label: "font-medium text-slate-700 data-[selected=true]:text-blue-700 text-sm md:text-base whitespace-normal",
                            wrapper: "group-data-[selected=true]:border-blue-500",
                          }}
                        >
                          {opt}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Buttons */}
            {step !== 6 && (
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
                    className="font-bold bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 rounded-xl px-8"
                    onPress={nextStep}
                    endContent={<ArrowRight className="w-4 h-4" />}
                  >
                    ถัดไป
                  </Button>
                ) : (
                  <Button 
                    color="success" 
                    className="font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 rounded-xl px-8 bg-emerald-500"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    endContent={!isSubmitting && <Save className="w-4 h-4" />}
                  >
                    ส่งผลประเมินทั้งหมด
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
