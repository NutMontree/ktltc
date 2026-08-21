"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, RadioGroup, Radio, Progress } from "@heroui/react";
import { Building2, ArrowLeft, ArrowRight, Save, UserCheck, CheckCircle2 } from 'lucide-react';
import { CloudShader } from '@/components/ui/cloud-shader';
import toast from 'react-hot-toast';
import { organizationQuiz } from '@/data/organizationQuiz';

export default function OrganizationAssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const questionsPerPage = 10;
  const totalSteps = Math.ceil(organizationQuiz.length / questionsPerPage);

  // current questions for this step
  const startIndex = (step - 1) * questionsPerPage;
  const currentQuestions = organizationQuiz.slice(startIndex, startIndex + questionsPerPage);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) }));
  };

  const nextStep = () => {
    // Validation: Check if all current questions are answered
    const allAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
    if (!allAnswered) {
      toast.error("กรุณาตอบคำถามให้ครบทุกข้อในหน้านี้");
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (Object.keys(answers).length < organizationQuiz.length) {
      toast.error("กรุณาตอบคำถามให้ครบทุกข้อ");
      return;
    }
    setIsSubmitting(true);
    
    // Calculate Score
    let totalScore = 0;
    Object.entries(answers).forEach(([qId, ans]) => {
      const q = organizationQuiz.find(quiz => quiz.id === parseInt(qId));
      if (q && q.correctAnswer === ans) {
        totalScore += q.points;
      }
    });

    // Save to session storage
    const resultsData = {
      score: totalScore,
      total: organizationQuiz.length,
      timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('ktltc_org_results', JSON.stringify(resultsData));
    
    // Simulated API delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/mental-health/results/organization');
    }, 1000);
  };

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

      <div className="relative z-10 max-w-[1600px] mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-3 bg-linear-to-br from-purple-500 to-fuchsia-600 rounded-2xl text-white shadow-inner shadow-white/20">
                <Building2 className="w-6 h-6" />
              </div>
              ประเมินองค์กรภาครัฐและเอกชน
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-2 ml-1">
              แบบประเมินทักษะทางสังคมและคุณธรรม 50 ข้อ
            </p>
          </div>
          <Button variant="flat" color="danger" className="font-bold rounded-xl" onPress={() => router.push('/mental-health')}>
            ยกเลิก / กลับ
          </Button>
        </div>

        {/* Progress */}
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/60 space-y-4">
          <div className="flex justify-between text-sm font-bold text-slate-700 px-1">
            <span>หน้า {step} จาก {totalSteps}</span>
            <span className="text-purple-600">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <Progress 
            value={(step / totalSteps) * 100} 
            classNames={{
              indicator: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
              track: "bg-white/50 border border-white/60"
            }}
            className="h-3" 
          />
        </div>

        {/* Content */}
        <Card className="border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.1)] bg-white/40 backdrop-blur-3xl rounded-4xl overflow-hidden">
          <CardBody className="p-6 md:p-8 space-y-8">
            <div className="space-y-6">
              {currentQuestions.map((q) => (
                <div key={q.id} className="bg-white/50 backdrop-blur-xl p-6 rounded-2xl border border-white/60 shadow-sm flex flex-col gap-4 transition-all hover:bg-white/70">
                  <p className="font-bold text-slate-800 text-lg">{q.id}. {q.question}</p>
                  
                  <RadioGroup 
                    orientation="vertical" 
                    value={answers[q.id]?.toString()}
                    onValueChange={(val) => handleAnswerChange(q.id, val)}
                    classNames={{ wrapper: "gap-3" }}
                  >
                    {q.options.map((opt, optIdx) => (
                      <Radio 
                        key={optIdx} 
                        value={(optIdx + 1).toString()} 
                        classNames={{
                          base: "inline-flex m-0 bg-white hover:bg-purple-50 items-center justify-start cursor-pointer border-2 border-transparent hover:border-purple-200 rounded-xl data-[selected=true]:border-purple-500 data-[selected=true]:bg-purple-50 transition-all px-4 py-3 w-full max-w-full",
                          label: "font-medium text-slate-700 data-[selected=true]:text-purple-700 text-sm md:text-base whitespace-normal",
                          wrapper: "group-data-[selected=true]:border-purple-500",
                        }}
                      >
                        {opt}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
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
                  className="font-bold bg-linear-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 rounded-xl px-8"
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
                  ส่งผลประเมิน
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
