"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Settings, Trash2, HelpCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ElectionDashboard() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchElections = async () => {
    try {
      const res = await fetch("/api/election");
      if (res.ok) {
        const data = await res.json();
        setElections(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบการเลือกตั้งนี้? (ข้อมูลผู้สมัครและผลโหวตจะถูกลบด้วย)")) return;

    try {
      const res = await fetch(`/api/election/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบสำเร็จ");
        fetchElections();
      } else {
        toast.error("ลบไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden pt-12 pb-24">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-tight">
              จัดการการเลือกตั้ง
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
              ควบคุมและดูแลระบบการเลือกตั้งทั้งหมด สร้าง แก้ไข และลบการเลือกตั้ง
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/manual/election-admin"
              className="flex justify-center items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 active:scale-95 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-bold transition-all"
            >
              <HelpCircle size={20} />
              <span>คู่มือการใช้งาน</span>
            </Link>
            <Link
              href="/dashboard/election/create"
              className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus size={20} />
              <span>สร้างการเลือกตั้ง</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-6 -mt-12 relative z-20">
        {elections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700 border-dashed">
            <p className="text-gray-500 text-lg">ยังไม่มีข้อมูลการเลือกตั้ง กรุณาสร้างการเลือกตั้งใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election._id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all group">
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm mb-4 border ${election.status === "active"
                    ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : election.status === "closed"
                      ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      : "bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  }`}>
                    {election.status === "active" && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                    )}
                    {election.status === "active" ? "กำลังเปิด" : election.status === "closed" ? "ปิดแล้ว" : "ฉบับร่าง"}
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">{election.title}</h2>
                  {election.description && <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{election.description}</p>}
                </div>
                
                <div className="flex flex-col gap-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>เปิดโหวต:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{format(new Date(election.startDate), "dd MMM yyyy, HH:mm")} น.</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>ปิดโหวต:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{format(new Date(election.endDate), "dd MMM yyyy, HH:mm")} น.</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/dashboard/election/${election._id}`}
                      className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 py-3 rounded-xl font-semibold transition-colors"
                    >
                      <Settings size={18} />
                      แก้ไข
                    </Link>
                    <button
                      onClick={() => handleDelete(election._id)}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 py-3 rounded-xl font-semibold transition-colors"
                    >
                      <Trash2 size={18} />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
