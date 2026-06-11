"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSession } from "next-auth/react";

export default function StudentCarePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCare, setNewCare] = useState({ classroom: "", studentName: "", sdqType: "normal", notes: "" });

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/director/student-care");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCare.classroom || !newCare.studentName) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      const res = await fetch("/api/director/student-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newCare, 
          teacherName: user.username || "Unknown",
          visitDate: new Date()
        })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewCare({ classroom: "", studentName: "", sdqType: "normal", notes: "" });
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSdq = async (id: string, sdqType: string) => {
    try {
      await fetch("/api/director/student-care", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, sdqType })
      });
      fetchRecords();
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
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <ClipboardList size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ระบบดูแลช่วยเหลือนักเรียน
                </h1>
                <p className="text-sm font-bold text-zinc-500">รายงานเยี่ยมบ้าน คัดกรองนักเรียน และผลสัมฤทธิ์</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700">
              <Plus size={16} /> บันทึกการเยี่ยมบ้าน/คัดกรอง
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-sm mb-4">บันทึกข้อมูลนักเรียนใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <input type="text" placeholder="ชั้นเรียน" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newCare.classroom} onChange={e => setNewCare({...newCare, classroom: e.target.value})} />
                  <input type="text" placeholder="ชื่อ-สกุล นักเรียน" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newCare.studentName} onChange={e => setNewCare({...newCare, studentName: e.target.value})} />
                  <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newCare.sdqType} onChange={e => setNewCare({...newCare, sdqType: e.target.value})}>
                    <option value="normal">กลุ่มปกติ</option>
                    <option value="risk">กลุ่มเสี่ยง</option>
                    <option value="problem">กลุ่มมีปัญหา</option>
                  </select>
                  <input type="text" placeholder="บันทึกเพิ่มเติม" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newCare.notes} onChange={e => setNewCare({...newCare, notes: e.target.value})} />
                </div>
                <button onClick={handleAdd} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-bold">บันทึกผล</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-500 uppercase tracking-widest">
                    <th className="px-4 py-3 rounded-l-xl">วันที่รายงาน</th>
                    <th className="px-4 py-3">ครูที่ปรึกษา</th>
                    <th className="px-4 py-3">ชั้นเรียน / นักเรียน</th>
                    <th className="px-4 py-3 text-center">กลุ่มคัดกรอง (SDQ)</th>
                    <th className="px-4 py-3">หมายเหตุ</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">จัดการสถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">ไม่พบข้อมูลดูแลนักเรียน</td></tr>
                  ) : (
                    records.map((r: any) => (
                      <tr key={r._id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                        <td className="px-4 py-4 text-sm font-bold">{new Date(r.visitDate).toLocaleDateString('th-TH')}</td>
                        <td className="px-4 py-4 text-sm">{r.teacherName}</td>
                        <td className="px-4 py-4 text-sm font-bold">{r.classroom} - {r.studentName}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1 w-fit mx-auto ${r.sdqType === 'normal' ? 'bg-emerald-100 text-emerald-600' : r.sdqType === 'risk' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                            {r.sdqType === 'problem' && <AlertCircle size={10} />}
                            {r.sdqType === 'normal' ? 'กลุ่มปกติ' : r.sdqType === 'risk' ? 'กลุ่มเสี่ยง' : 'กลุ่มมีปัญหา'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-zinc-500 max-w-[150px] truncate">{r.notes || '-'}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <select 
                              className="text-xs p-1 border rounded-lg bg-zinc-50 dark:bg-zinc-800"
                              value={r.sdqType}
                              onChange={(e) => handleUpdateSdq(r._id, e.target.value)}
                            >
                              <option value="normal">ปรับเป็น ปกติ</option>
                              <option value="risk">ปรับเป็น เสี่ยง</option>
                              <option value="problem">ปรับเป็น มีปัญหา</option>
                            </select>
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
