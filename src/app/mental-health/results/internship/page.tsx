"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, CircularProgress } from "@heroui/react";
import { UserCircle, CheckCircle, Smile, Frown, ArrowLeft, Trophy, Medal, AlertCircle, HeartPulse, ExternalLink, RefreshCw, UserCheck, CheckSquare, Briefcase } from "lucide-react";
import { CloudShader } from '@/components/ui/cloud-shader';

export default function InternshipResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ktltc_internship_results');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push('/mental-health');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-200">
        <CircularProgress size="lg" aria-label="Loading..." />
      </div>
    );
  }

  const { scores, name, studentId, department } = data;

  // Mental Health Translation Functions
  const getSt5Result = (score: number) => {
    if (score >= 10) return { text: "เครียดรุนแรง", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 8) return { text: "เครียดสูง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 5) return { text: "เครียดปานกลาง", color: "text-amber-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "เครียดน้อย", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
  const get2QResult = (score: number) => {
    if (score > 0) return { text: "มีภาวะเสี่ยง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
  const get9QResult = (score: number) => {
    if (score === undefined || score === null || score === 0 && scores.twoQTotal === 0) return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
    if (score >= 19) return { text: "ซึมเศร้ารุนแรง", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 13) return { text: "ซึมเศร้าปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 7) return { text: "ซึมเศร้าเล็กน้อย", color: "text-amber-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "ไม่มีอาการ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
  const get8QResult = (score: number) => {
    if (score === undefined || score === null || score === 0 && (scores.q9Total === undefined || scores.q9Total < 7)) return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
    if (score >= 17) return { text: "เสี่ยงฆ่าตัวตายรุนแรง", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 9) return { text: "เสี่ยงฆ่าตัวตายปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 1) return { text: "เสี่ยงฆ่าตัวตายน้อย", color: "text-amber-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };

  const mhResults = [
    { id: "st5", label: "ความเครียด (ST-5)", score: scores.st5Total, ...getSt5Result(scores.st5Total) },
    { id: "2q", label: "ภาวะซึมเศร้า (2Q)", score: scores.twoQTotal, ...get2QResult(scores.twoQTotal) },
    { id: "9q", label: "โรคซึมเศร้า (9Q)", score: scores.q9Total, ...get9QResult(scores.q9Total) },
    { id: "8q", label: "การฆ่าตัวตาย (8Q)", score: scores.q8Total, ...get8QResult(scores.q8Total) },
  ];

  const hasMentalRisk = mhResults.some(r => r.color === "text-red-500" || r.color === "text-orange-500");

  // Soft Skills Translation
  const softSkillsPercentage = (scores.softSkillsScore / scores.softSkillsTotal) * 100;
  const getSoftSkillsInterpretation = (p: number) => {
    if (p >= 80) return { title: "พร้อมมาก", desc: "ทักษะพร้อมออกฝึกประสบการณ์ ระดับดีเยี่ยม", color: "text-emerald-500", icon: <Trophy className="w-12 h-12 text-emerald-500" /> };
    if (p >= 60) return { title: "พร้อม", desc: "ทักษะพร้อมออกฝึกประสบการณ์ ระดับดี", color: "text-blue-500", icon: <Medal className="w-12 h-12 text-blue-500" /> };
    return { title: "ต้องพัฒนา", desc: "ควรพัฒนาทักษะทางสังคมและวินัยเพิ่มเติม", color: "text-orange-500", icon: <AlertCircle className="w-12 h-12 text-orange-500" /> };
  };
  const softSkillsInterpretation = getSoftSkillsInterpretation(softSkillsPercentage);

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

      <div className="relative z-10 max-w-[1200px] mx-auto w-full py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white/40 backdrop-blur-xl rounded-full shadow-lg border border-white/60 mb-2">
            <CheckSquare className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">สรุปผลการคัดกรอง</h1>
          <p className="text-slate-700 font-medium text-lg">สำหรับนักศึกษาเตรียมออกฝึกประสบการณ์วิชาชีพ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile & Mental Health */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Profile Card */}
            <Card className="border border-white/60 shadow-xl bg-white/60 backdrop-blur-3xl rounded-3xl">
              <CardBody className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-2">
                    <UserCircle className="w-12 h-12" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{name}</h2>
                  <div className="w-full space-y-2 mt-4 text-sm font-medium text-slate-600 text-left bg-white/50 p-4 rounded-xl">
                    <p className="flex justify-between border-b border-slate-200 pb-2"><span>รหัสนักศึกษา:</span> <span className="text-slate-800 font-bold">{studentId}</span></p>
                    <p className="flex justify-between border-b border-slate-200 pb-2"><span>แผนกวิชา:</span> <span className="text-slate-800 font-bold">{department}</span></p>
                    <p className="flex justify-between"><span>วันที่ทำประเมิน:</span> <span className="text-slate-800 font-bold">{new Date(data.timestamp).toLocaleDateString('th-TH')}</span></p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Overall Mental Health Status */}
            <Card className="border border-white/60 shadow-xl bg-white/60 backdrop-blur-3xl rounded-3xl">
              <CardBody className="p-6 text-center flex flex-col items-center space-y-4">
                <h3 className="text-lg font-bold text-slate-800">สถานะสุขภาพจิตเบื้องต้น</h3>
                <div className={`p-4 rounded-full ${hasMentalRisk ? 'bg-pink-100 text-pink-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {hasMentalRisk ? <Frown className="w-12 h-12" /> : <Smile className="w-12 h-12" />}
                </div>
                <h2 className={`text-2xl font-black ${hasMentalRisk ? 'text-pink-600' : 'text-emerald-600'}`}>
                  {hasMentalRisk ? "มีความเสี่ยง\nควรพบที่ปรึกษา" : "ปกติ\nพร้อมรับมือความเครียด"}
                </h2>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Detailed Scores */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Soft Skills Card */}
            <Card className="border border-white/60 shadow-xl bg-white/70 backdrop-blur-3xl rounded-3xl overflow-hidden">
              <CardBody className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" /> ผลประเมินทักษะการทำงาน 50 ข้อ
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 justify-around bg-white/50 p-6 rounded-2xl">
                  <div className="relative">
                    <CircularProgress
                      classNames={{
                        svg: "w-36 h-36 drop-shadow-md",
                        indicator: "stroke-blue-500",
                        track: "stroke-white",
                        value: "text-3xl font-black text-slate-800",
                      }}
                      value={softSkillsPercentage}
                      strokeWidth={4}
                      showValueLabel={true}
                      formatOptions={{ style: 'percent' }}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                    {softSkillsInterpretation.icon}
                    <h4 className={`text-2xl font-black ${softSkillsInterpretation.color}`}>{softSkillsInterpretation.title}</h4>
                    <p className="text-slate-600 font-bold">ได้ {scores.softSkillsScore} จาก {scores.softSkillsTotal} คะแนน</p>
                    <p className="text-slate-500 text-sm font-medium">{softSkillsInterpretation.desc}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Mental Health Breakdown */}
            <Card className="border border-white/60 shadow-xl bg-white/50 backdrop-blur-3xl rounded-3xl">
              <CardBody className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-pink-500" /> ผลประเมินสุขภาพจิต (รายด้าน)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mhResults.map((result) => (
                    <div key={result.id} className="bg-white/80 p-5 rounded-2xl shadow-sm flex items-center justify-between border border-white/60 hover:shadow-md transition-all">
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">{result.label}</p>
                        <p className={`text-lg font-black flex items-center gap-2 ${result.color}`}>
                          {result.text}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-800">{result.score}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">คะแนน</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Button 
            className="font-bold bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 rounded-xl px-10 py-6 text-lg"
            onPress={() => router.push('/mental-health')}
            startContent={<CheckCircle className="w-5 h-5" />}
          >
            เสร็จสิ้นกลับหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  );
}
