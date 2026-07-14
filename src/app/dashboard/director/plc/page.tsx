"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Check, ChevronRight, FileText, Activity, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";

const STEPS = [
  { id: 1, name: "รวมกลุ่ม & ตั้งเป้าหมาย" },
  { id: 2, name: "วิเคราะห์ปัญหา" },
  { id: 3, name: "ออกแบบนวัตกรรม" },
  { id: 4, name: "ปฏิบัติ (Lesson Study)" },
  { id: 5, name: "สะท้อนผล (AAR)" }
];

export default function PlcPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  // Form State
  const [newPlc, setNewPlc] = useState({
    teamName: "",
    academicYear: "2569",
    semester: "1",
    members: "",
    problemStatement: "",
    innovation: "",
    step: 1
  });

  const user = {
    username: session?.user?.name || session?.user?.username,
    role: session?.user?.role,
    image: session?.user?.image,
  };

  const isAdmin = ["super_admin", "admin", "director"].includes(user.role?.toLowerCase() || "");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/director/plc");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("ดึงข้อมูลล้มเหลว");
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPlc.teamName || !newPlc.members || !newPlc.problemStatement) {
      return toast.error("กรุณากรอกข้อมูลกลุ่ม สมาชิก และปัญหาให้ครบถ้วน");
    }
    try {
      const res = await fetch("/api/director/plc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newPlc, 
          members: newPlc.members.split(",").map(p => p.trim()),
          meetings: [],
          status: "pending"
        })
      });
      if (res.ok) {
        toast.success("บันทึกกลุ่ม PLC สำเร็จ");
        setShowAdd(false);
        setNewPlc({ teamName: "", academicYear: "2569", semester: "1", members: "", problemStatement: "", innovation: "", step: 1 });
        fetchRecords();
      } else {
        toast.error("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleUpdateStep = async (id: string, currentStep: number) => {
    const nextStep = currentStep < 5 ? currentStep + 1 : 5;
    try {
      const res = await fetch("/api/director/plc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, step: nextStep, status: nextStep === 5 ? "completed" : "in_progress" })
      });
      if (res.ok) {
        toast.success("เลื่อนสถานะวงรอบ PLC สำเร็จ");
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดในการเลื่อนสถานะ");
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto w-full px-2 py-8 md:py-12 relative">
        <div className="px-2 mt-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ชุมชนการเรียนรู้ (PLC)
                </h1>
                <p className="text-sm font-bold text-zinc-500">บันทึกการรวมกลุ่มและรายงานวงรอบการจัดทำ PLC</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdd(!showAdd)} 
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              {showAdd ? <X size={16} /> : <Plus size={16} />} 
              {showAdd ? "ยกเลิก" : "สร้างกลุ่ม PLC ใหม่"}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                  <Activity size={20} /> แบบฟอร์มจัดตั้งกลุ่ม PLC
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                  <div className="col-span-1 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อกลุ่ม PLC</label>
                    <input type="text" placeholder="เช่น กลุ่มพัฒนาทักษะวิชาชีพช่างยนต์" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500" value={newPlc.teamName} onChange={e => setNewPlc({...newPlc, teamName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ปีการศึกษา</label>
                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500" value={newPlc.academicYear} onChange={e => setNewPlc({...newPlc, academicYear: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ภาคเรียนที่</label>
                    <input type="text" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500" value={newPlc.semester} onChange={e => setNewPlc({...newPlc, semester: e.target.value})} />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">สมาชิกในกลุ่ม (คั่นด้วยลูกน้ำ ,)</label>
                    <input type="text" placeholder="ระบุชื่อ-สกุล สมาชิก (ตัวอย่าง: สมชาย ใจดี, สมศรี รักเรียน)" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500" value={newPlc.members} onChange={e => setNewPlc({...newPlc, members: e.target.value})} />
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ประเด็นปัญหา (Problem Statement)</label>
                    <textarea rows={3} placeholder="ปัญหาที่พบในการจัดการเรียนการสอน..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 resize-none" value={newPlc.problemStatement} onChange={e => setNewPlc({...newPlc, problemStatement: e.target.value})} />
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">นวัตกรรม/แนวทางแก้ไข (Innovation)</label>
                    <textarea rows={3} placeholder="นวัตกรรมหรือวิธีการสอนที่จะนำมาใช้..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 resize-none" value={newPlc.innovation} onChange={e => setNewPlc({...newPlc, innovation: e.target.value})} />
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  <button onClick={handleAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all">
                    บันทึกและเริ่มวงรอบ PLC
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="text-center py-12 text-zinc-500 font-bold animate-pulse">กำลังโหลดข้อมูลกลุ่ม PLC...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-bold bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                  ยังไม่มีประวัติการจัดตั้งกลุ่ม PLC
                </div>
              ) : (
                records.map((r: any) => {
                  const currentStep = r.step || 1;
                  return (
                    <div key={r._id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        
                        {/* Info Section */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">{r.teamName || r.topic || "กลุ่ม PLC"}</h3>
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                ภาคเรียน {r.semester}/{r.academicYear}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                              <Users size={14} /> <b>สมาชิก:</b> {Array.isArray(r.members) ? r.members.join(", ") : r.participants?.join(", ") || "-"}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                              <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 mb-1">ประเด็นปัญหา (Problem)</p>
                              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{r.problemStatement || "ไม่ได้ระบุ"}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                              <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 mb-1">นวัตกรรม (Innovation)</p>
                              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{r.innovation || r.summary || "ไม่ได้ระบุ"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Stepper Section */}
                        <div className="w-full lg:w-[350px] shrink-0 bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                            ความคืบหน้า PLC
                            <span className="text-indigo-500">Step {currentStep}/5</span>
                          </h4>
                          
                          <div className="space-y-3 relative">
                            {STEPS.map((step, idx) => {
                              const isCompleted = currentStep > step.id;
                              const isCurrent = currentStep === step.id;
                              
                              return (
                                <div key={step.id} className="flex items-start gap-3 relative z-10">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                    isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                                    isCurrent ? "bg-white dark:bg-zinc-900 border-indigo-500 text-indigo-500" : 
                                    "bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-400"
                                  }`}>
                                    {isCompleted ? <Check size={12} strokeWidth={4} /> : <span className="text-[10px] font-black">{step.id}</span>}
                                  </div>
                                  <div className="flex-1 pt-0.5">
                                    <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-zinc-600'}`}>
                                      {step.name}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="absolute left-3 top-2 bottom-4 w-0.5 bg-slate-200 dark:bg-zinc-800 z-0" />
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
                            {currentStep < 5 ? (
                              <button 
                                onClick={() => handleUpdateStep(r._id, currentStep)}
                                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full justify-center"
                              >
                                บันทึกการทำขั้นถัดไป <ChevronRight size={14} />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-xl w-full justify-center border border-emerald-100 dark:border-emerald-900/50">
                                <Check size={14} /> วงรอบเสร็จสมบูรณ์
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
