"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Plus, Check, X } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSession } from "next-auth/react";

export default function DpaEvaluationPage() {
  const { data: session } = useSession();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEval, setNewEval] = useState({ academicYear: "", goals: "" });

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/director/dpa-evaluation");
      const data = await res.json();
      setEvaluations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newEval.academicYear || !newEval.goals) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      const res = await fetch("/api/director/dpa-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEval, teacherName: user.username || "Unknown", status: "submitted" })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewEval({ academicYear: "", goals: "" });
        fetchEvaluations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEvaluate = async (id: string, score: number) => {
    try {
      await fetch("/api/director/dpa-evaluation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: "evaluated", evaluatorScore: score })
      });
      fetchEvaluations();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full px-2 py-8 md:py-12 relative">
        <DashboardHeader user={user} />
        
        <div className="px-2 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ประเมินผล PA/DPA
                </h1>
                <p className="text-sm font-bold text-zinc-500">ระบบตรวจสอบแฟ้มพัฒนางานและประเมินผลการสอน</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700">
              <Plus size={16} /> ส่งแบบประเมิน
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-sm mb-4">จัดทำข้อตกลง PA ใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="ปีการศึกษา (เช่น 2567)" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newEval.academicYear} onChange={e => setNewEval({...newEval, academicYear: e.target.value})} />
                  <input type="text" placeholder="เป้าหมายที่คาดหวัง" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newEval.goals} onChange={e => setNewEval({...newEval, goals: e.target.value})} />
                </div>
                <button onClick={handleAdd} className="bg-rose-600 text-white px-6 py-2 rounded-xl text-sm font-bold">บันทึกข้อมูลส่งประเมิน</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-500 uppercase tracking-widest">
                    <th className="px-4 py-3 rounded-l-xl">ครูผู้สอน</th>
                    <th className="px-4 py-3">ปีการศึกษา</th>
                    <th className="px-4 py-3">ข้อตกลง/เป้าหมาย</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center">คะแนน</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">จัดการประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
                  ) : evaluations.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">ไม่พบข้อมูลการประเมิน</td></tr>
                  ) : (
                    evaluations.map((e: any) => (
                      <tr key={e._id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                        <td className="px-4 py-4 text-sm font-bold">{e.teacherName}</td>
                        <td className="px-4 py-4 text-sm">{e.academicYear}</td>
                        <td className="px-4 py-4 text-sm max-w-[200px] truncate">{e.goals}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${e.status === 'evaluated' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-bold text-rose-600">{e.evaluatorScore || '-'} / 100</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEvaluate(e._id, 85)} className="px-3 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">ผ่าน (85)</button>
                            <button onClick={() => handleEvaluate(e._id, 95)} className="px-3 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">ดีเยี่ยม (95)</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
