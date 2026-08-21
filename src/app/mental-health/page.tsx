"use client";
import { Card, CardBody, Button, Link } from "@heroui/react";
import { Activity, Users, Stethoscope, Baby, Building2, Brain, Flame, HeartCrack, Frown, Shield, HeartHandshake, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import { CloudShader } from '@/components/ui/cloud-shader';
import StaggeredText from '@/components/StaggeredText';

export default function MentalHealthCheckInPage() {
  const assessmentLinks = [
    {
      title: 'คัดกรองก่อนออกฝึกประสบการณ์วิชาชีพ',
      url: '/mental-health/assessment/internship',
      icon: <UserCheck className="w-8 h-8 text-blue-500" />,
      description: 'ประเมินสุขภาพจิตและทักษะความพร้อมในการทำงาน 50 ข้อ',
      disabled: false
    },
    {
      title: 'ประเมินตัวเอง',
      url: '/mental-health/assessment/self',
      icon: <Activity className="w-8 h-8 text-blue-500" />,
      description: 'ทำแบบประเมินสุขภาพจิตสำหรับตัวคุณเอง',
      disabled: true
    },
    {
      title: 'ประเมินผู้อื่น',
      url: '/mental-health/assessment/other',
      icon: <Users className="w-8 h-8 text-green-500" />,
      description: 'ทำแบบประเมินสุขภาพจิตสำหรับบุคคลใกล้ชิด',
      disabled: true
    },
    {
      title: 'ประเมินเจ้าหน้าที่สาธารณสุข',
      url: '/mental-health/assessment/health-worker',
      icon: <Stethoscope className="w-8 h-8 text-teal-500" />,
      description: 'ทำแบบประเมินสำหรับบุคลากรทางการแพทย์',
      disabled: true
    },
    {
      title: 'ประเมินเด็กและวัยรุ่น',
      url: '/mental-health/assessment/child',
      icon: <Baby className="w-8 h-8 text-pink-500" />,
      description: 'สำหรับเด็กและวัยรุ่นอายุไม่เกิน 18 ปี',
      disabled: true
    },
    {
      title: 'องค์กรภาครัฐและเอกชน',
      url: '/mental-health/assessment/organization',
      icon: <Building2 className="w-8 h-8 text-purple-500" />,
      description: 'สำหรับพนักงานในองค์กรภาครัฐและเอกชน',
      disabled: true
    }
  ];

  const knowledgeLinks = [
    { title: 'เครียด (Stress)', url: 'https://dmhpd.dmh.go.th/%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%94/', icon: <Brain className="w-6 h-6 text-red-500" /> },
    { title: 'ภาวะหมดไฟ (Burnout)', url: 'https://dmhpd.dmh.go.th/burnout/', icon: <Flame className="w-6 h-6 text-orange-500" /> },
    { title: 'เสี่ยงฆ่าตัวตาย (Suicide)', url: 'https://dmhpd.dmh.go.th/suicide/', icon: <HeartCrack className="w-6 h-6 text-gray-700" /> },
    { title: 'ซึมเศร้า (Depression)', url: 'https://dmhpd.dmh.go.th/depression/', icon: <Frown className="w-6 h-6 text-blue-600" /> },
    { title: 'พลังใจ (RQ)', url: 'https://dmhpd.dmh.go.th/resilience-quotient/', icon: <Shield className="w-6 h-6 text-green-600" /> },
    { title: 'ดูแลใจเมื่อสูญเสีย (Grief)', url: 'https://dmhpd.dmh.go.th/grief/', icon: <HeartHandshake className="w-6 h-6 text-rose-500" /> }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-200">
      {/* Background CloudShader Effect */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          className="h-full w-full opacity-90"
          speed={0.8}
          count={5}
          cloudColor="#fbf8f2"
          skyTopColor="#3876ba"
          skyBottomColor="#8cbfe8"
        />
      </div>

      <div className="relative z-10 max-w-[1600px] w-full mx-auto space-y-12 py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center space-y-6 bg-white/40 backdrop-blur-3xl p-8 rounded-4xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/60 relative overflow-hidden">
          {/* Subtle gradient glow inside header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-linear-to-b from-white/40 to-transparent pointer-events-none rounded-t-4xl"></div>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex flex-col md:flex-row items-center justify-center gap-3 relative z-10">
            <StaggeredText text="ตรวจสุขภาพใจ" staggerDuration={0.05} delay={0.2} />
            <StaggeredText text="MENTAL HEALTH CHECK IN" className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-pink-500" staggerDuration={0.03} delay={0.5} />
          </h1>
          <div className="max-w-[1600px] w-full mx-auto text-lg text-slate-700 leading-relaxed text-left md:text-center space-y-4 relative z-10">
            <p>
              เครื่องมือสำหรับประเมินสุขภาพจิตเบื้องต้น และคัดกรองความเสี่ยงต่อปัญหาสุขภาพจิตของประชาชน
              พัฒนาขึ้นเพื่อสนับสนุนการดูแลสุขภาพจิตในระดับชุมชน โดยมุ่งเน้นให้สามารถเข้าถึงการประเมินได้อย่างสะดวก รวดเร็ว และมีประสิทธิภาพ
            </p>
            <p className="text-sm bg-white/50 backdrop-blur-md p-5 rounded-2xl text-slate-800 border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)]">
              <strong className="text-slate-900 text-base">เครื่องมือสำคัญประกอบด้วย:</strong><br />
              <span className="inline-block mt-2">• <span className="font-bold text-pink-600">SBSD</span> (Stress, Burnout, Suicide, Depression) สำหรับคัดกรองความเครียด ภาวะหมดไฟ ความเสี่ยงต่อการฆ่าตัวตาย และภาวะซึมเศร้า</span><br />
              <span className="inline-block mt-1">• <span className="font-bold text-purple-600">RQ</span> (Resilience Quotient) สำหรับประเมินความสามารถในการฟื้นตัวทางจิตใจ (ความยืดหยุ่นทางอารมณ์)</span>
            </p>
          </div>
        </div>

        {/* Assessment Links Section */}
        <div className="space-y-6">
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">เริ่มทำแบบประเมิน</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {assessmentLinks.map((item, index) => (
                <Card key={index} className="hover:-translate-y-2 transition-all duration-400 border border-white/60 bg-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:bg-white/50 rounded-3xl overflow-hidden group">
                  <CardBody className="p-8 flex flex-col items-center text-center space-y-5">
                    <div className="p-5 bg-linear-to-br from-white to-blue-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{item.title}</h3>
                    <p className="text-slate-600 text-sm grow leading-relaxed">{item.description}</p>
                    <Button
                      as={item.disabled ? "button" : Link}
                      href={item.disabled ? undefined : item.url}
                      isDisabled={item.disabled}
                      className="w-full mt-4 font-bold bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-500/40 rounded-xl py-6 text-md data-[disabled=true]:from-slate-400 data-[disabled=true]:to-slate-500 data-[disabled=true]:shadow-none"
                    >
                      {item.disabled ? "ปิดปรับปรุงชั่วคราว" : "เริ่มทำแบบประเมิน"}
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Knowledge Base Section */}
          <div className="space-y-8 pt-10 border-t border-slate-900/10">
            <h2 className="text-3xl font-extrabold text-slate-900 text-center tracking-tight">แหล่งความรู้สุขภาพจิต</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {knowledgeLinks.map((item, index) => (
                <Link key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full group">
                  <Card className="w-full bg-white/40 backdrop-blur-xl transition-all duration-300 border border-white/60 shadow-sm hover:shadow-md hover:bg-white/60 rounded-2xl">
                    <CardBody className="p-5 flex flex-row items-center space-x-5">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{item.title}</span>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
