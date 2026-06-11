"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Check } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSession } from "next-auth/react";

export default function PlcPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlc, setNewPlc] = useState({ topic: "", participants: "", durationHours: 1, summary: "" });

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
      const res = await fetch("/api/director/plc");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPlc.topic || !newPlc.summary) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      const res = await fetch("/api/director/plc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newPlc, 
          participants: newPlc.participants.split(",").map(p => p.trim()),
          meetingDate: new Date()
        })
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlc({ topic: "", participants: "", durationHours: 1, summary: "" });
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch("/api/director/plc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status: "approved" })
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
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  ชุมชนการเรียนรู้ (PLC)
                </h1>
                <p className="text-sm font-bold text-zinc-500">บันทึกการรวมกลุ่มและรายงานผลการจัดทำ PLC</p>
              </div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">
              <Plus size={16} /> บันทึกการทำ PLC
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-sm mb-4">เพิ่มข้อมูล PLC ใหม่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="หัวข้อในการแก้ปัญหา" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlc.topic} onChange={e => setNewPlc({...newPlc, topic: e.target.value})} />
                  <input type="text" placeholder="ผู้เข้าร่วม (คั่นด้วยลูกน้ำ ,)" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlc.participants} onChange={e => setNewPlc({...newPlc, participants: e.target.value})} />
                  <input type="number" placeholder="จำนวนชั่วโมง" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlc.durationHours} onChange={e => setNewPlc({...newPlc, durationHours: Number(e.target.value)})} />
                  <input type="text" placeholder="สรุปผลลัพธ์ที่ได้" className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm" value={newPlc.summary} onChange={e => setNewPlc({...newPlc, summary: e.target.value})} />
                </div>
                <button onClick={handleAdd} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold">บันทึกกลุ่ม PLC</button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-500 uppercase tracking-widest">
                    <th className="px-4 py-3 rounded-l-xl">วันที่จัดทำ</th>
                    <th className="px-4 py-3">หัวข้อ</th>
                    <th className="px-4 py-3">ผู้เข้าร่วม</th>
                    <th className="px-4 py-3 text-center">ชั่วโมง</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 rounded-r-xl text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">กำลังโหลดข้อมูล...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500">ไม่พบข้อมูล PLC</td></tr>
                  ) : (
                    records.map((r: any) => (
                      <tr key={r._id} className="border-b border-zinc-50 dark:border-zinc-800/50">
                        <td className="px-4 py-4 text-sm font-bold">{new Date(r.meetingDate).toLocaleDateString('th-TH')}</td>
                        <td className="px-4 py-4 text-sm max-w-[150px] truncate">{r.topic}</td>
                        <td className="px-4 py-4 text-xs text-zinc-500">{r.participants?.join(", ")}</td>
                        <td className="px-4 py-4 text-center font-bold text-indigo-600">{r.durationHours} ชม.</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {r.status === 'pending' ? (
                              <button onClick={() => handleApprove(r._id)} className="px-3 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors">รับรองชั่วโมง</button>
                            ) : (
                              <span className="text-emerald-500"><Check size={16}/></span>
                            )}
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
