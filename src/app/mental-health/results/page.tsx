"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Button, Accordion, AccordionItem, RadioGroup, Radio, Input, Textarea, Progress } from "@heroui/react";
import { UserCircle, MapPin, CheckCircle, AlertTriangle, ChevronDown, Smile, Frown, Phone, Map, ExternalLink, HeartPulse, ShieldAlert, Heart, Info, BrainCircuit, Flame, Activity, User, Users } from "lucide-react";

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ktltc_mental_health_results');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // Mock data for development if accessed directly
      setData({
        refId: "13403877",
        assessorType: "ประเมินตนเอง",
        gender: "ชาย",
        age: "19",
        address: "ต.จานใหญ่ อ.กันทรลักษ์ จ.ศรีสะเกษ",
        tambon: "จานใหญ่",
        amphoe: "กันทรลักษ์",
        province: "ศรีสะเกษ",
        scores: {
          happiness: 6,
          rqTotal: 21,
          burnoutTotal: 9,
          st5Total: 7,
          twoQTotal: 2,
          q9Total: 15,
          suicideScore: 25 // mock as 8Q for UI purposes
        }
      });
    }
  }, []);

  if (!data) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">กำลังโหลดข้อมูล...</div>;

  const { scores } = data;

  // Translation Functions
  const getRqResult = (score: number) => {
    if (score >= 20) return { text: "เสี่ยงน้อย", color: "text-amber-500", icon: <Smile className="w-8 h-8" /> };
    if (score >= 15) return { text: "เสี่ยงปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "เสี่ยงมาก", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
  };
  const getBurnoutResult = (score: number) => {
    if (score >= 8) return { text: "เสี่ยงมาก", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 6) return { text: "เสี่ยงปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 3) return { text: "เสี่ยงน้อย", color: "text-amber-500", icon: <Smile className="w-8 h-8" /> };
    return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
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
    if (score >= 19) return { text: "มีอาการรุนแรง", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 13) return { text: "มีอาการปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 7) return { text: "มีอาการเล็กน้อย", color: "text-amber-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "ไม่มีอาการ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
  const get8QResult = (score: number) => {
    if (score === undefined || score === null) return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
    if (score >= 17) return { text: "มีแนวโน้มรุนแรง", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 9) return { text: "มีแนวโน้มปานกลาง", color: "text-orange-500", icon: <Frown className="w-8 h-8" /> };
    if (score >= 1) return { text: "มีแนวโน้มน้อย", color: "text-amber-500", icon: <Frown className="w-8 h-8" /> };
    return { text: "ปกติ", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
  };
  const getHappinessResult = (score: number) => {
    if (score >= 8) return { text: "มีความสุขมาก", color: "text-emerald-500", icon: <Smile className="w-8 h-8" /> };
    if (score >= 5) return { text: "มีความสุขพอสมควร", color: "text-amber-500", icon: <Smile className="w-8 h-8" /> };
    return { text: "ไม่มีความสุข", color: "text-red-500", icon: <Frown className="w-8 h-8" /> };
  };

  const results = [
    { id: "happiness", label: "ความสุข (Happiness scale)", score: scores.happiness, ...getHappinessResult(scores.happiness) },
    { id: "rq", label: "พลังใจ(RQ)", score: scores.rqTotal, ...getRqResult(scores.rqTotal) },
    { id: "burnout", label: "ภาวะหมดไฟ(Burnout)", score: scores.burnoutTotal, ...getBurnoutResult(scores.burnoutTotal) },
    { id: "st5", label: "ความเครียด(ST-5)", score: scores.st5Total, ...getSt5Result(scores.st5Total) },
    { id: "2q", label: "ภาวะซึมเศร้า(2Q+)", score: scores.twoQTotal, ...get2QResult(scores.twoQTotal) },
    { id: "9q", label: "โรคซึมเศร้า(9Q)", score: scores.q9Total, ...get9QResult(scores.q9Total) },
    { id: "8q", label: "แนวโน้มการฆ่าตัวตาย(8Q)", score: scores.eightQTotal !== undefined ? scores.eightQTotal : scores.suicideScore, ...get8QResult(scores.eightQTotal !== undefined ? scores.eightQTotal : scores.suicideScore) },
  ];

  const hasRisk = results.some(r => r.color === "text-red-500" || r.color === "text-orange-500");

  return (
    <div className="min-h-screen font-sans pb-20 relative">
      {/* Background with vibrant blue/purple gradient from the image */}
      <div className="fixed inset-0 bg-linear-to-br from-blue-400 via-indigo-500 to-fuchsia-500 -z-10" />

      {/* Header Area */}
      <div className="bg-white py-6 shadow-sm mb-6 rounded-b-3xl mx-4 xl:mx-0">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-4">
            {/* Mocking Logos */}
            <div className="flex items-center text-emerald-600 font-bold gap-2">
              <ShieldAlert className="w-8 h-8" /> <span>กรมสุขภาพจิต</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center gap-2">
            <Heart className="text-blue-500 fill-blue-500 w-8 h-8" />
            ผลตรวจเช็คสุขภาพใจ
          </h1>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            <span className="text-blue-500 cursor-pointer">หน้าหลัก</span> &gt; ผลตรวจเช็คสุขภาพใจ
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6 relative z-10">
        
        {/* Progress bar */}
        <div className="flex items-center justify-between text-sm font-bold text-emerald-600 mb-1">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Completed
          </div>
          <div className="text-slate-800">100%</div>
        </div>
        <Progress value={100} className="mb-6" color="primary" size="sm" />

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 shadow-xl rounded-2xl border-none">
            <CardBody className="p-8 space-y-6 bg-white rounded-2xl">
              <div className="flex items-start gap-4 text-slate-700">
                <div className="text-pink-400 shrink-0">
                  <UserCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2 text-sm font-medium">
                  <p className="text-slate-500"># Ref.ID : {data.refId || "13403877"}</p>
                  <p className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> <strong>การประเมิน :</strong> {data.assessorType || "ประเมินตนเอง"}</p>
                  <p className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /> <strong>เพศ :</strong> {data.gender || "-"} | <strong>อายุ :</strong> {data.age || "-"} ปี</p>
                  <p className="flex items-center gap-2"><UserCircle className="w-4 h-4 text-slate-400" /> <strong>ประเภท :</strong> ประชาชน</p>
                  <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-slate-400" /> <strong>ที่อยู่ :</strong> {data.address || "-"}</p>
                  <p className="flex items-center gap-2"><Map className="w-4 h-4 text-slate-400" /> <strong>เขตสุขภาพที่ :</strong> 10</p>
                  <p className="flex items-center gap-2"><Info className="w-4 h-4 text-slate-400" /> <strong>ยินยอมเปิดเผยข้อมูล :</strong> ไม่มีข้อมูลการยินยอม</p>
                  <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-400" /> <strong>วันที่บันทึก :</strong> {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'})}</p>
                </div>
              </div>

              <Accordion variant="splitted" className="px-0">
                <AccordionItem 
                  key="risk" 
                  aria-label="Risk Factors" 
                  title={<span className="text-orange-500 font-bold flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4"/> ข้อมูลปัจจัยเสี่ยง</span>}
                  className="border border-slate-200 shadow-none bg-white rounded-xl"
                >
                  <p className="text-sm text-slate-600 px-2 pb-2">ไม่มีข้อมูล</p>
                </AccordionItem>
              </Accordion>

              {hasRisk && (
                <div className="bg-[#df3c4c] text-white p-4 rounded-xl font-bold flex items-center gap-2 text-sm shadow-md">
                  <AlertTriangle className="w-5 h-5 shrink-0" /> เนื่องจากท่านมีความเสี่ยงด้านสุขภาพจิต กรุณากรอกแบบฟอร์มเพื่อรับการติดตามช่วยเหลือ
                </div>
              )}
              
              <div className="text-center text-xs text-slate-700 font-bold flex justify-center items-center gap-1 pt-2">
                <ChevronDown className="w-4 h-4" /> เลื่อนลงเพื่อดูผลประเมินแต่ละด้าน
              </div>
            </CardBody>
          </Card>

          <Card className="col-span-1 shadow-xl rounded-2xl border-none h-full flex flex-col items-center justify-center">
            <CardBody className="p-8 text-center flex flex-col items-center justify-center bg-white space-y-6 rounded-2xl w-full">
              <h3 className="text-2xl font-bold text-slate-800">สุขภาพจิตโดยรวม</h3>
              <div className={`rounded-full p-4 ${hasRisk ? 'text-pink-500' : 'text-emerald-500'}`}>
                {hasRisk ? <Frown className="w-24 h-24 stroke-[1.5] fill-pink-500 text-pink-700" /> : <Smile className="w-24 h-24 stroke-[1.5] fill-emerald-500 text-emerald-700" />}
              </div>
              <h2 className={`text-2xl font-extrabold ${hasRisk ? 'text-pink-500' : 'text-emerald-500'}`}>
                {hasRisk ? "มีความเสี่ยง\nด้านสุขภาพจิต" : "สุขภาพจิตปกติ"}
              </h2>
            </CardBody>
          </Card>
        </div>

        {/* Detailed Scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {results.map((result) => (
            <Card key={result.id} className="shadow-xl rounded-2xl border-none hover:shadow-2xl transition-all hover:-translate-y-1 bg-white">
              <CardBody className="p-8 flex flex-col items-center text-center space-y-4 rounded-2xl">
                <h4 className="text-slate-800 font-bold text-lg">{result.label}</h4>
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-pink-400">
                  <HeartPulse className="w-10 h-10" />
                </div>
                <div className="text-6xl font-black text-slate-800 tracking-tighter">{result.score}</div>
                <div className="text-sm text-slate-500 font-bold">คะแนน</div>
                <div className={`font-bold flex items-center gap-2 ${result.color} text-xl`}>
                  {result.icon} {result.text}
                </div>
                <Button 
                  variant="bordered" 
                  color="primary" 
                  className="w-full mt-4 font-bold text-blue-600 border-blue-300 hover:bg-blue-50 py-6 rounded-xl"
                  startContent={<ExternalLink className="w-4 h-4" />}
                >
                  คำแนะนำ
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Follow-up Form */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl mt-8 border border-white">
          <h3 className="text-xl font-bold text-red-500 mb-8 flex items-center gap-2 border-b border-slate-100 pb-4">
             แบบฟอร์มการให้ข้อมูลสำหรับการติดตามช่วยเหลือดูแล
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Input label="ชื่อ" variant="bordered" labelPlacement="outside" placeholder="กรอกชื่อ" classNames={{inputWrapper: "border-slate-300"}} />
            <Input label="นามสกุล" variant="bordered" labelPlacement="outside" placeholder="กรอกนามสกุล" classNames={{inputWrapper: "border-slate-300"}} />
            
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-700 mb-3">ยินยอมให้เจ้าหน้าที่ติดต่อกลับทางโทรศัพท์หรือไม่?</p>
              <RadioGroup orientation="horizontal" className="gap-6">
                <Radio value="yes" classNames={{label: "text-slate-700 text-sm font-medium"}}>ยินยอมให้ติดต่อกลับ</Radio>
                <Radio value="no" classNames={{label: "text-slate-700 text-sm font-medium"}}>ไม่ยินยอมให้ติดต่อกลับ</Radio>
              </RadioGroup>
            </div>
            
            <Input label="เบอร์โทรที่สามารถติดต่อได้" variant="bordered" labelPlacement="outside" placeholder="โทรศัพท์มือถือ(10 หลัก)" classNames={{inputWrapper: "bg-slate-100 border-transparent", input: "text-slate-600"}} />
          </div>

          <div className="mb-8">
            <Textarea label="ที่อยู่(ระบุรายละเอียดเพิ่มเติม)" variant="bordered" labelPlacement="outside" minRows={3} classNames={{inputWrapper: "border-slate-300"}} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Input label="ตำบล" variant="flat" labelPlacement="outside" value={data.tambon || ""} isReadOnly classNames={{inputWrapper: "bg-slate-200", input: "font-medium text-slate-700"}} />
            <Input label="อำเภอ/เขต" variant="flat" labelPlacement="outside" value={data.amphoe || ""} isReadOnly classNames={{inputWrapper: "bg-slate-200", input: "font-medium text-slate-700"}} />
            <Input label="จังหวัด" variant="flat" labelPlacement="outside" value={data.province || ""} isReadOnly classNames={{inputWrapper: "bg-slate-200", input: "font-medium text-slate-700"}} />
          </div>

          <div className="flex flex-col items-center gap-5 mb-8">
            <RadioGroup orientation="horizontal" className="font-bold text-emerald-600 gap-8">
              <Radio value="agree" color="success" classNames={{label: "text-emerald-600 font-bold"}}>ข้าพเจ้ายินยอมให้ข้อมูล</Radio>
              <Radio value="disagree" color="danger" classNames={{label: "text-red-600 font-bold"}}>ไม่ยินยอมให้ข้อมูล</Radio>
            </RadioGroup>
            
            <a href="#" className="text-sm text-blue-500 font-bold hover:underline flex items-center gap-1">
              <Info className="w-4 h-4" /> นโยบายคุ้มครองข้อมูลส่วนบุคคล
            </a>
          </div>

          <Button className="w-full bg-[#df3c4c] hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.01]">
            บันทึกข้อมูล
          </Button>
        </div>

        {/* Help Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pb-12">
          <Card className="shadow-xl rounded-2xl hover:shadow-2xl transition-all border-none bg-white">
            <CardBody className="p-8 flex flex-col items-center text-center space-y-4 rounded-2xl">
              <div className="text-blue-500 text-sm font-bold flex items-center gap-1"><Info className="w-4 h-4"/> เรียนรู้การดูแลจิตใจตนเอง</div>
              <h3 className="text-4xl font-extrabold text-blue-600 my-4">ต่อ-เติม-ใจ</h3>
              <p className="text-sm text-slate-600 font-medium pb-6 leading-relaxed">
                กรมสุขภาพจิต ขอแสดงความห่วงใย คุณสามารถเรียนรู้การดูแลจิตใจตนเองผ่านโปรแกรม ต่อ-เติม-ใจ
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-auto shadow-md py-6">
                เรียนรู้ ต่อ-เติม-ใจ
              </Button>
            </CardBody>
          </Card>

          <Card className="shadow-xl rounded-2xl hover:shadow-2xl transition-all border-none bg-white">
            <CardBody className="p-8 flex flex-col items-center text-center space-y-4 rounded-2xl">
              <div className="text-blue-500 text-sm font-bold flex items-center gap-1"><Info className="w-4 h-4"/> ช่องทางให้คำปรึกษา</div>
              <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 my-4 border border-orange-100">
                <Phone className="w-16 h-16 fill-orange-500" />
              </div>
              <p className="font-bold text-slate-800 text-lg mb-4">สายด่วนสุขภาพจิต 1323</p>
              <Button className="w-full bg-[#df3c4c] hover:bg-red-700 text-white font-bold rounded-xl mt-auto shadow-md py-6">
                กดที่นี่เพื่อโทร 1323
              </Button>
            </CardBody>
          </Card>

          <Card className="shadow-xl rounded-2xl hover:shadow-2xl transition-all border-none bg-white">
            <CardBody className="p-8 flex flex-col items-center text-center space-y-4 rounded-2xl">
              <div className="text-blue-500 text-sm font-bold flex items-center gap-1"><Info className="w-4 h-4"/> ช่องทางให้คำปรึกษา</div>
              <div className="w-32 h-32 rounded-full border-[6px] border-emerald-600 flex items-center justify-center text-emerald-600 my-4">
                <ShieldAlert className="w-12 h-12" />
              </div>
              <p className="font-bold text-slate-800 text-lg mb-4">สถานบริการสุขภาพจิต</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-auto shadow-md py-6">
                กดที่นี่เพื่อดู
              </Button>
            </CardBody>
          </Card>

          <Card className="shadow-xl rounded-2xl hover:shadow-2xl transition-all border-none bg-white lg:col-start-1">
            <CardBody className="p-8 flex flex-col items-center text-center space-y-4 rounded-2xl">
              <div className="text-blue-500 text-sm font-bold flex items-center gap-1"><Info className="w-4 h-4"/> ช่องทางให้คำปรึกษา</div>
              <div className="w-40 h-40 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center my-4 overflow-hidden p-2">
                <div className="text-center font-bold text-slate-400 text-xs">QR Code<br/>LINE@ คุยกัน</div>
              </div>
              <p className="font-bold text-green-700 text-lg">LINE@ "คุยกัน:KhuiKun"</p>
              <p className="text-xs text-slate-500 mb-4 px-4 leading-relaxed">แชทไลน์ปรึกษาสุขภาพจิต หรือ "รับฟัง ปรึกษา คุยกัน ส่งต่อ"</p>
              <Button className="w-full bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl mt-auto shadow-md py-6" startContent={<span className="text-xl">+</span>}>
                เพิ่มเพื่อน
              </Button>
            </CardBody>
          </Card>
        </div>

      </div>
    </div>
  );
}
