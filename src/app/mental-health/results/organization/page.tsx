"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Button, CircularProgress } from "@heroui/react";
import { ArrowLeft, RefreshCw, Trophy, Medal, Star, AlertCircle } from 'lucide-react';
import { CloudShader } from '@/components/ui/cloud-shader';

export default function OrganizationResultsPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<{ score: number; total: number; timestamp: string } | null>(null);
  
  useEffect(() => {
    // Only run on client
    const saved = sessionStorage.getItem('ktltc_org_results');
    if (saved) {
      setResultData(JSON.parse(saved));
    } else {
      router.push('/mental-health');
    }
  }, [router]);

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-200">
        <CircularProgress size="lg" aria-label="Loading..." />
      </div>
    );
  }

  const { score, total } = resultData;
  const percentage = (score / total) * 100;

  const getInterpretation = (p: number) => {
    if (p >= 80) return { title: "ระดับดีเยี่ยม", desc: "คุณมีทักษะทางสังคม คุณธรรม และจริยธรรมในระดับดีเยี่ยม เป็นแบบอย่างที่ดีในองค์กร", color: "text-emerald-500", icon: <Trophy className="w-16 h-16 text-emerald-500 mb-4" /> };
    if (p >= 60) return { title: "ระดับดี", desc: "คุณมีทักษะทางสังคมและคุณธรรมในระดับดี สามารถรักษามาตรฐานการทำงานและมนุษย์สัมพันธ์ได้ดี", color: "text-blue-500", icon: <Medal className="w-16 h-16 text-blue-500 mb-4" /> };
    return { title: "ระดับที่ควรพัฒนา", desc: "คุณอาจต้องพัฒนาและปรับปรุงทักษะบางด้าน เช่น การตรงต่อเวลา ความรับผิดชอบ และความอดทนอดกลั้น", color: "text-orange-500", icon: <AlertCircle className="w-16 h-16 text-orange-500 mb-4" /> };
  };

  const interpretation = getInterpretation(percentage);

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-200 pb-20">
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

      <div className="relative z-10 max-w-[800px] mx-auto w-full py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white/40 backdrop-blur-xl rounded-full shadow-lg border border-white/60 mb-2">
            <Star className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">สรุปผลการประเมิน</h1>
          <p className="text-slate-700 font-medium">แบบประเมินสำหรับบุคลากรองค์กรภาครัฐและเอกชน</p>
        </div>

        {/* Score Card */}
        <Card className="border border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-white/50 backdrop-blur-3xl rounded-4xl overflow-hidden">
          <CardBody className="p-8 md:p-12 text-center flex flex-col items-center">
            
            {interpretation.icon}
            
            <h2 className={`text-3xl font-extrabold mb-2 ${interpretation.color}`}>
              {interpretation.title}
            </h2>
            
            <div className="my-8 relative">
              <CircularProgress
                classNames={{
                  svg: "w-48 h-48 drop-shadow-md",
                  indicator: "stroke-purple-500",
                  track: "stroke-white/60",
                  value: "text-4xl font-black text-slate-800",
                }}
                value={percentage}
                strokeWidth={4}
                showValueLabel={true}
                formatOptions={{ style: 'percent' }}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-slate-600 font-bold bg-white/80 px-4 py-1 rounded-full shadow-sm">
                ได้ {score} จาก {total} คะแนน
              </div>
            </div>

            <p className="text-slate-700 text-lg mt-6 max-w-lg leading-relaxed font-medium">
              {interpretation.desc}
            </p>
            
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button 
            variant="flat"
            className="font-bold bg-white/60 hover:bg-white/80 rounded-xl px-8 py-6 text-md"
            onPress={() => router.push('/mental-health')}
            startContent={<ArrowLeft className="w-5 h-5" />}
          >
            กลับหน้าหลัก
          </Button>
          
          <Button 
            className="font-bold bg-linear-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 rounded-xl px-8 py-6 text-md"
            onPress={() => router.push('/mental-health/assessment/organization')}
            startContent={<RefreshCw className="w-5 h-5" />}
          >
            ทำแบบประเมินอีกครั้ง
          </Button>
        </div>
      </div>
    </div>
  );
}
