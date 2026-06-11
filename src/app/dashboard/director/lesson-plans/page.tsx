"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSession } from "next-auth/react";

export default function LessonPlansPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState<any>({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  const isDirector = user.role === 'director' || user.role === 'super_admin';

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

    let uploadedUrl = newPlan.fileUrl;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedUrl = uploadData.url;
        } else {
          return alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
        }
      } catch (err) {
        return alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }
    }

    try {
      const payload = { ...newPlan, fileUrl: uploadedUrl, teacherName: user.username || "Unknown" };
      const method = newPlan._id ? "PATCH" : "POST";
      const res = await fetch("/api/director/lesson-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" });
        setSelectedFile(null);
        fetchPlans();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    let feedback = "";
    if (status === "rejected" || status === "approved") {
      const reason = window.prompt(`ระบุหมายเหตุ/เหตุผลที่${status === "rejected" ? "ไม่อนุมัติ" : "อนุมัติ"} (ถ้ามี):`);
      if (reason === null) return; // User clicked cancel
      feedback = reason;
    }

    try {
      await fetch("/api/director/lesson-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status, feedback })
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };


  const filteredPlans = plans.filter((p: any) => {
    if (filterSemester && p.semester !== filterSemester) return false;
    if (filterYear && p.academicYear !== filterYear) return false;
    return true;
  });

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


          <div className="flex gap-4 mb-6">

            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">📅 ทุกปีการศึกษา</option>
              <option value="2566">2566</option>
              <option value="2567">2567</option>
              <option value="2568">2568</option>
            </select>
            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="">📌 ทุกเทอม</option>
              <option value="1">เทอม 1</option>
              <option value="2">เทอม 2</option>
              <option value="3">เทอม 3</option>
            </select>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            {showAdd && (
              <div className="mb-6 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 mb-4">
                  {newPlan._id ? "📝 แก้ไขข้อมูลแผนการสอน" : "📤 ส่งแผนการจัดการเรียนรู้ใหม่"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ชื่อวิชา</label>
                    <input type="text" placeholder="เช่น ภาษาไทย, คณิตศาสตร์" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.subject} onChange={e => setNewPlan({ ...newPlan, subject: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">หัวข้อ/เรื่องที่สอน</label>
                    <input type="text" placeholder="เช่น บทที่ 1 การอ่านออกเสียง" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ภาคเรียน</label>
                    <select className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.semester} onChange={e => setNewPlan({ ...newPlan, semester: e.target.value })}>
                      <option value="1">ภาคเรียนที่ 1</option>
                      <option value="2">ภาคเรียนที่ 2</option>
                      <option value="3">ภาคเรียนที่ 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ปีการศึกษา</label>
                    <select className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.academicYear} onChange={e => setNewPlan({ ...newPlan, academicYear: e.target.value })}>
                      <option value="2566">2566</option>
                      <option value="2567">2567</option>
                      <option value="2568">2568</option>
                      <option value="2569">2569</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-1">อัปโหลดไฟล์เอกสาร (PDF, Word, Excel)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      className="w-full p-1.5 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/40 dark:file:text-emerald-400 hover:file:bg-emerald-100 bg-white dark:bg-zinc-900"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setNewPlan({ ...newPlan, fileUrl: e.target.files[0].name });
                        }
                      }}
                    />
                    {newPlan.fileUrl && (
                      <p className="text-xs text-zinc-500 mt-1 truncate">
                        ไฟล์ปัจจุบัน/ที่เลือก: <span className="font-bold text-emerald-600 dark:text-emerald-400">{newPlan.fileUrl}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => { setShowAdd(false); setNewPlan({ subject: "", title: "", fileUrl: "", semester: "1", academicYear: "2567" }); setSelectedFile(null); }} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">ยกเลิก</button>
                  <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">บันทึกข้อมูล</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 font-bold">
                กำลังโหลดข้อมูล...
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 font-bold">
                ไม่พบข้อมูลแผนการสอน
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="px-5 py-4 rounded-l-xl">ครูผู้สอน</th>
                        <th className="px-5 py-4">เทอม/ปีการศึกษา</th>
                        <th className="px-5 py-4">วิชา</th>
                        <th className="px-5 py-4">หัวข้อ / เรื่องที่สอน</th>
                        <th className="px-5 py-4 text-center">ไฟล์เอกสาร</th>
                        <th className="px-5 py-4 text-center">สถานะ</th>
                        <th className="px-5 py-4 rounded-r-xl text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlans.map((p: any) => (
                        <tr key={p._id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all duration-205">
                          <td className="px-5 py-5 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                                {p.teacherName ? p.teacherName.charAt(0) : "?"}
                              </div>
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{p.teacherName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                              เทอม {p.semester} / {p.academicYear}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.subject}</td>
                          <td className="px-5 py-5 text-sm text-zinc-600 dark:text-zinc-350">{p.title}</td>
                          <td className="px-5 py-5 text-center">
                            {p.fileUrl ? (
                              <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
                                <FileText size={14} /> ดูไฟล์
                              </a>
                            ) : (
                              <span className="text-xs text-zinc-400">-</span>
                            )}
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                                p.status === 'approved' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
                                  : p.status === 'rejected' 
                                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-650 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' 
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                              }`}>
                                {p.status === 'approved' ? 'อนุมัติแล้ว' : p.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                              </span>
                              {p.feedback && (
                                <div className="max-w-[200px] text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 text-center break-words">
                                  <span className="font-bold">หมายเหตุ:</span> {p.feedback}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {p.teacherName === user.username && (
                                <>
                                  <button 
                                    onClick={() => { setNewPlan(p); setShowAdd(true); window.scrollTo(0, 0); }} 
                                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white transition-colors" 
                                    title="แก้ไข"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button 
                                    onClick={async () => { if (confirm('ต้องการลบข้อมูลนี้หรือไม่?')) { await fetch(`/api/director/lesson-plans?id=${p._id}`, { method: 'DELETE' }); fetchPlans(); } }} 
                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-colors" 
                                    title="ลบ"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {isDirector && (
                                <>
                                  <button 
                                    onClick={() => handleStatus(p._id, "approved")} 
                                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-colors" 
                                    title="อนุมัติ"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleStatus(p._id, "rejected")} 
                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-colors" 
                                    title="ไม่อนุมัติ"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                  {filteredPlans.map((p: any) => (
                    <div key={p._id} className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 flex flex-col gap-4 shadow-sm">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">
                            {p.teacherName ? p.teacherName.charAt(0) : "?"}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{p.teacherName}</h4>
                            <span className="text-[11px] text-zinc-550 dark:text-zinc-400">
                              เทอม {p.semester} / {p.academicYear}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          p.status === 'approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
                            : p.status === 'rejected' 
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' 
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                        }`}>
                          {p.status === 'approved' ? 'อนุมัติแล้ว' : p.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="bg-white dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">วิชา</div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">{p.subject}</div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5">หัวข้อ / เรื่องที่สอน</div>
                        <div className="text-sm text-zinc-650 dark:text-zinc-350">{p.title}</div>
                      </div>

                      {/* Feedback */}
                      {p.feedback && (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-105/60 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">หมายเหตุ:</span> {p.feedback}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
                        <div>
                          {p.fileUrl ? (
                            <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors uppercase tracking-wider">
                              <FileText size={13} /> ดูไฟล์
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">ไม่มีไฟล์</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {p.teacherName === user.username && (
                            <>
                              <button 
                                onClick={() => { setNewPlan(p); setShowAdd(true); window.scrollTo(0, 0); }} 
                                className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors" 
                                title="แก้ไข"
                              >
                                <Pencil size={15} />
                              </button>
                              <button 
                                onClick={async () => { if (confirm('ต้องการลบข้อมูลนี้หรือไม่?')) { await fetch(`/api/director/lesson-plans?id=${p._id}`, { method: 'DELETE' }); fetchPlans(); } }} 
                                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" 
                                title="ลบ"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {isDirector && (
                            <>
                              <button 
                                onClick={() => handleStatus(p._id, "approved")} 
                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors" 
                                title="อนุมัติ"
                              >
                                <Check size={15} />
                              </button>
                              <button 
                                onClick={() => handleStatus(p._id, "rejected")} 
                                className="p-2 rounded-xl bg-rose-55 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" 
                                title="ไม่อนุมัติ"
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
