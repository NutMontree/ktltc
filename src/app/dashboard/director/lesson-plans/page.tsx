"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Plus, Check, X } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSession } from "next-auth/react";

export default function LessonPlansPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState({ subject: "", title: "", fileUrl: "" });

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/director/lesson-plans");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPlan.subject || !newPlan.title) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      const res = await fetch("/api/director/lesson-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPlan, teacherName: user.username || "Unknown" })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlan({ subject: "", title: "", fileUrl: "" });
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/director/lesson-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status })
      });
      fetchPlans();
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
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ตรวจสอบแผนการสอน
                </h1>
                <p className="text-sm font-bold text-zinc-500">ระบบส่งและตรวจแผนการจัดการเรียนรู้</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700">
              <Plus size={16} /> ส่งแผนการสอนใหม่
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-sm mb-4">เพิ่มข้อมูลแผนการสอน</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="text" placeholder="ชื่อวิชา" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.subject} onChange={e => setNewPlan({...newPlan, subject: e.target.value})} />
                  <input type="text" placeholder="หัวข้อ/เรื่องที่สอน" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})} />
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx" 
                    className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        // จำลองการอัปโหลดไฟล์ โดยเก็บเป็นชื่อไฟล์ไว้ก่อน
                        setNewPlan({...newPlan, fileUrl: e.target.files[0].name});
                      }
                    }} 
                  />
                </div>
                <button onClick={handleAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold">บันทึกข้อมูล</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-500 uppercase tracking-widest">
                    <th className="px-4 py-3 rounded-l-xl">ครูผู้สอน</th>
                    <th className="px-4 py-3">วิชา</th>
                    <th className="px-4 py-3">หัวข้อ</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">จัดการ (ผู้อำนวยการ)</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-10 text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
                  ) : plans.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-zinc-500">ไม่พบข้อมูลแผนการสอน</td></tr>
                  ) : (
                    plans.map((p: any) => (
                      <tr key={p._id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                        <td className="px-4 py-4 text-sm font-bold">{p.teacherName}</td>
                        <td className="px-4 py-4 text-sm">{p.subject}</td>
                        <td className="px-4 py-4 text-sm">{p.title}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${p.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : p.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleStatus(p._id, "approved")} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="อนุมัติ"><Check size={16}/></button>
                            <button onClick={() => handleStatus(p._id, "rejected")} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors" title="ไม่อนุมัติ"><X size={16}/></button>
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
