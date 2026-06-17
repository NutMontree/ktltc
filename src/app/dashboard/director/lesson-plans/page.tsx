"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// คำนวณปี พ.ศ. แบบ dynamic
const currentBuddhistYear = new Date().getFullYear() + 543;
const academicYears = Array.from({ length: 5 }, (_, i) => String(currentBuddhistYear - 3 + i));

export default function LessonPlansPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const teacherQuery = searchParams.get("teacher");
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState<any>({ subject: "", title: "", fileUrls: [], semester: "1", academicYear: String(currentBuddhistYear), hasAfterClassNote: false, afterClassNoteUrl: "" });
  
  const handleEditClick = (plan: any) => {
    setNewPlan({
      _id: plan._id,
      subject: plan.subject,
      title: plan.title,
      fileUrls: plan.fileUrls || (plan.fileUrl ? [plan.fileUrl] : []),
      semester: plan.semester || "1",
      academicYear: plan.academicYear || String(currentBuddhistYear),
      hasAfterClassNote: plan.hasAfterClassNote || false,
      afterClassNoteUrl: plan.afterClassNoteUrl || (plan.afterClassNoteUrls && plan.afterClassNoteUrls.length > 0 ? plan.afterClassNoteUrls[0] : "")
    });
    setSelectedFiles([]);
    setSelectedAfterClassFile(null);
    setShowAdd(true);
  };

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedAfterClassFile, setSelectedAfterClassFile] = useState<File | null>(null);
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  const isDirector = user.role === 'director' || user.role === 'super_admin';

  useEffect(() => {
    fetchPlans();
  }, [teacherQuery]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const url = teacherQuery
        ? `/api/director/lesson-plans?teacher=${encodeURIComponent(teacherQuery)}`
        : "/api/director/lesson-plans";
      const res = await fetch(url);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newPlan.subject || !newPlan.title) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    let uploadedUrls = [...(newPlan.fileUrls || [])];
    
    // Upload main files
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            uploadedUrls.push(uploadData.url);
          } else {
            return alert(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์ ${file.name}`);
          }
        } catch (err) {
          return alert(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์ ${file.name}`);
        }
      }
    }

    let uploadedAfterClassUrl = newPlan.afterClassNoteUrl;
    if (newPlan.hasAfterClassNote && selectedAfterClassFile) {
      const formData = new FormData();
      formData.append("file", selectedAfterClassFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await res.json();
      if (uploadData.success) {
        uploadedAfterClassUrl = uploadData.url;
      }
    }

    try {
      const payload = { 
        ...newPlan, 
        fileUrls: uploadedUrls, 
        afterClassNoteUrl: uploadedAfterClassUrl,
        teacherName: user.username || "Unknown" 
      };
      
      const method = newPlan._id ? "PATCH" : "POST";
      const res = await fetch("/api/director/lesson-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewPlan({ subject: "", title: "", fileUrls: [], semester: "1", academicYear: String(currentBuddhistYear), hasAfterClassNote: false, afterClassNoteUrl: "" });
        setSelectedFiles([]);
        setSelectedAfterClassFile(null);
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
      if (reason === null) return;
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

  const uniqueTeachers = Array.from(new Set(plans.map((p: any) => p.teacherName))).filter(Boolean);

  const filteredPlans = plans.filter((p: any) => {
    if (filterSemester && p.semester !== filterSemester) return false;
    if (filterYear && p.academicYear !== filterYear) return false;
    if (isDirector) {
      if (filterTeacher && p.teacherName !== filterTeacher) return false;
      if (filterStatus) {
        const statusVal = p.status || 'pending';
        if (statusVal !== filterStatus) return false;
      }
    }
    return true;
  });

  const statsPending = plans.filter(p => p.status === 'pending' || !p.status).length;
  const statsApproved = plans.filter(p => p.status === 'approved').length;
  const statsRejected = plans.filter(p => p.status === 'rejected').length;

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto w-full px-2 py-8 md:py-12 relative">
        <div className="px-2 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                  {isDirector ? "ตรวจสอบแผนการสอน" : "แผนการจัดการเรียนรู้ของฉัน"}
                </h1>
                <p className="text-sm font-bold text-zinc-500">
                  {isDirector ? "ระบบตรวจและอนุมัติแผนการจัดการเรียนรู้" : "ระบบส่งและติดตามแผนการจัดการเรียนรู้"}
                </p>
              </div>
            </div>
            {!showAdd && (
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                <Plus size={16} /> {isDirector ? "เพิ่มแผนการสอน" : "ส่งแผนการสอนใหม่"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {isDirector ? (
              <>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ครูที่ส่งแผนทั้งหมด</p>
                  <p className="text-2xl font-black text-zinc-800 dark:text-white">{uniqueTeachers.length} <span className="text-xs font-bold text-zinc-500">คน</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">รอการตรวจสอบ</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{statsPending} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">อนุมัติแล้ว</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{statsApproved} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ไม่อนุมัติ</p>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{statsRejected} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">แผนการสอนของฉัน</p>
                  <p className="text-2xl font-black text-zinc-800 dark:text-white">{plans.length} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">อนุมัติแล้ว</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{statsApproved} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">รอการตรวจสอบ</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{statsPending} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1">ส่งกลับแก้ไข</p>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{statsRejected} <span className="text-xs font-bold text-zinc-500">รายการ</span></p>
                </div>
              </>
            )}
          </div>

          {teacherQuery && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Search size={16} />
                <span>กำลังกรองแสดงเฉพาะแผนการสอนของครู: <strong className="underline">{teacherQuery}</strong></span>
              </div>
              <button
                onClick={() => router.push('/dashboard/director/lesson-plans')}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                แสดงทั้งหมด
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">📅 ทุกปีการศึกษา</option>
              {academicYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="">📌 ทุกเทอม</option>
              <option value="1">เทอม 1</option>
              <option value="2">เทอม 2</option>
              <option value="3">เทอม 3</option>
            </select>
            {isDirector && (
              <>
                <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}>
                  <option value="">👤 ครูผู้สอนทุกคน</option>
                  {uniqueTeachers.map((t: any) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select className="p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 bg-white shadow-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">🔍 ทุกสถานะ</option>
                  <option value="pending">รอการอนุมัติ</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ไม่อนุมัติ/ส่งกลับแก้ไข</option>
                </select>
              </>
            )}
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
                    <input type="text" placeholder="เช่น ภาษาไทย, คณิตศาสตร์" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={newPlan.subject} onChange={e => setNewPlan({ ...newPlan, subject: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">หัวข้อ/เรื่องที่สอน</label>
                    <input type="text" placeholder="เช่น บทที่ 1 การอ่านออกเสียง" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" value={newPlan.title} onChange={e => setNewPlan({ ...newPlan, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ภาคเรียน</label>
                    <select className="w-full p-2 border rounded-xl dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.semester} onChange={e => setNewPlan({ ...newPlan, semester: e.target.value })}>
                      <option value="1">ภาคเรียนที่ 1</option>
                      <option value="2">ภาคเรียนที่ 2</option>
                      <option value="3">ภาคเรียนที่ 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ปีการศึกษา</label>
                    <select className="w-full p-2 border rounded-xl dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900" value={newPlan.academicYear} onChange={e => setNewPlan({ ...newPlan, academicYear: e.target.value })}>
                      {academicYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 mb-1">อัปโหลดไฟล์เอกสาร (PDF, Word, Excel)</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      className="w-full p-1.5 border rounded-xl dark:border-zinc-700 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/40 dark:file:text-emerald-400 hover:file:bg-emerald-100 bg-white dark:bg-zinc-900"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files);
                          setSelectedFiles(prev => [...prev, ...newFiles]);
                        }
                      }}
                    />
                    {/* Display existing files and newly selected files */}
                    <div className="mt-2 space-y-1">
                      {newPlan.fileUrls?.map((url: string, idx: number) => (
                        <div key={`exist-${idx}`} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg text-xs">
                          <span className="truncate max-w-[80%] text-emerald-600 dark:text-emerald-400">{url.split('/').pop()}</span>
                          <button onClick={() => {
                            const updated = [...newPlan.fileUrls];
                            updated.splice(idx, 1);
                            setNewPlan({...newPlan, fileUrls: updated});
                          }} className="text-red-500 hover:text-red-700 font-bold"><X size={14}/></button>
                        </div>
                      ))}
                      {selectedFiles.map((f, idx) => (
                        <div key={`new-${idx}`} className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-xs border border-emerald-100 dark:border-emerald-800/50">
                          <span className="truncate max-w-[80%] font-bold text-emerald-700 dark:text-emerald-400">{f.name}</span>
                          <button onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 font-bold"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500" 
                        checked={!!newPlan.hasAfterClassNote} 
                        onChange={e => setNewPlan({ ...newPlan, hasAfterClassNote: e.target.checked })} 
                      />
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">แนบบันทึกหลังสอนแล้ว (has After Class Note)</span>
                    </label>

                    {newPlan.hasAfterClassNote && (
                      <div className="mt-3 ml-6">
                        <label className="block text-xs font-bold text-zinc-500 mb-1">อัปโหลดไฟล์บันทึกหลังสอน</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                          className="w-full p-1.5 border rounded-xl dark:border-zinc-700 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-50 file:text-amber-700 dark:file:bg-amber-950/40 dark:file:text-amber-400 hover:file:bg-amber-100 bg-white dark:bg-zinc-900"
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedAfterClassFile(e.target.files[0]);
                            } else {
                              setSelectedAfterClassFile(null);
                            }
                          }}
                        />
                        <div className="mt-2 space-y-1">
                          {newPlan.afterClassNoteUrl && !selectedAfterClassFile && (
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 p-2 rounded-lg text-xs">
                              <span className="truncate max-w-[80%] text-amber-600 dark:text-amber-400">{newPlan.afterClassNoteUrl.split('/').pop()}</span>
                              <button onClick={() => setNewPlan({...newPlan, afterClassNoteUrl: ""})} className="text-red-500 hover:text-red-700 font-bold"><X size={14}/></button>
                            </div>
                          )}
                          {selectedAfterClassFile && (
                            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-xs border border-amber-100 dark:border-amber-800/50">
                              <span className="truncate max-w-[80%] font-bold text-amber-700 dark:text-amber-400">{selectedAfterClassFile.name}</span>
                              <button onClick={() => setSelectedAfterClassFile(null)} className="text-red-500 hover:text-red-700 font-bold"><X size={14}/></button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => { setShowAdd(false); setNewPlan({ subject: "", title: "", fileUrls: [], semester: "1", academicYear: String(currentBuddhistYear), hasAfterClassNote: false, afterClassNoteUrl: "" }); setSelectedFiles([]); setSelectedAfterClassFile(null); }} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">ยกเลิก</button>
                  <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-colors">บันทึกข้อมูล</button>
                </div>
              </div>
            )}

            {/* Data Display */}
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
                        <tr key={p._id} className="border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all">
                          <td className="px-5 py-5 text-sm">
                            <div className="flex items-center gap-3">
                              {p.teacherImage ? (
                                <img src={p.teacherImage} alt={p.teacherName} className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0 border border-zinc-200 dark:border-zinc-700" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase shrink-0 border border-emerald-200 dark:border-emerald-800/50">
                                  {p.teacherName ? p.teacherName.charAt(0) : "?"}
                                </div>
                              )}
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{p.teacherName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-5 text-sm">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                              เทอม {p.semester} <span className="text-indigo-200 dark:text-indigo-700">|</span> ปีการศึกษา {p.academicYear}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm font-medium text-zinc-900 dark:text-zinc-100">{p.subject}</td>
                          <td className="px-5 py-5 text-sm text-zinc-600 dark:text-zinc-300">{p.title}</td>
                          <td className="px-5 py-5 text-center">
                            <div className="flex flex-col gap-1.5 items-center">
                              {/* Legacy single file */}
                              {p.fileUrl && (!p.fileUrls || p.fileUrls.length === 0) && (
                                <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
                                  <FileText size={14} /> เอกสารแผน
                                </a>
                              )}
                              {/* Multiple lesson plan files */}
                              {p.fileUrls?.map((url: string, idx: number) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors">
                                  <FileText size={14} /> เอกสารแผน {p.fileUrls.length > 1 ? idx + 1 : ""}
                                </a>
                              ))}
                              {/* After class note file */}
                              {p.hasAfterClassNote && (p.afterClassNoteUrl || (p.afterClassNoteUrls && p.afterClassNoteUrls.length > 0)) && (
                                <a href={p.afterClassNoteUrl || p.afterClassNoteUrls[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors">
                                  <FileText size={14} /> บันทึกหลังสอน
                                </a>
                              )}
                              {/* Fallback */}
                              {!p.fileUrl && (!p.fileUrls || p.fileUrls.length === 0) && (!p.hasAfterClassNote || (!p.afterClassNoteUrl && (!p.afterClassNoteUrls || p.afterClassNoteUrls.length === 0))) && (
                                <span className="text-xs text-zinc-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                                p.status === 'approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                                  : p.status === 'rejected'
                                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                              }`}>
                                {p.status === 'approved' ? 'อนุมัติแล้ว' : p.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอการอนุมัติ'}
                              </span>
                              {p.feedback && (
                                <div className="max-w-[200px] text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 text-center wrap-break-word">
                                  <span className="font-bold">หมายเหตุ:</span> {p.feedback}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {/* Teacher edit/delete - locked when approved */}
                              {p.teacherName === user.username && (
                                <>
                                  {p.status !== 'approved' ? (
                                    <>
                                      <button
                                        onClick={() => { setNewPlan(p); setShowAdd(true); window.scrollTo(0, 0); }}
                                        className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors"
                                        title="แก้ไข"
                                      >
                                        <Pencil size={16} />
                                      </button>
                                      <button
                                        onClick={async () => { if (confirm('ต้องการลบข้อมูลนี้หรือไม่?')) { await fetch(`/api/director/lesson-plans?id=${p._id}`, { method: 'DELETE' }); fetchPlans(); } }}
                                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                                        title="ลบ"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold italic">ล็อก</span>
                                  )}
                                </>
                              )}
                              {/* Director approve/reject */}
                              {isDirector && (
                                <>
                                  <button
                                    onClick={() => handleStatus(p._id, "approved")}
                                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                                    title="อนุมัติ"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleStatus(p._id, "rejected")}
                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
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
                          {p.teacherImage ? (
                            <img src={p.teacherImage} alt={p.teacherName} className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0 border border-zinc-200 dark:border-zinc-700" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase shrink-0 border border-emerald-200 dark:border-emerald-800/50">
                              {p.teacherName ? p.teacherName.charAt(0) : "?"}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{p.teacherName}</h4>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                              <span className="bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">เทอม {p.semester}</span>
                              <span className="bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">ปี {p.academicYear}</span>
                            </div>
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
                        <div className="text-sm text-zinc-600 dark:text-zinc-300">{p.title}</div>
                      </div>

                      {/* Feedback */}
                      {p.feedback && (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100/60 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">หมายเหตุ:</span> {p.feedback}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
                        <div className="flex flex-col gap-1.5">
                          {/* Legacy single file */}
                          {p.fileUrl && (!p.fileUrls || p.fileUrls.length === 0) && (
                            <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors uppercase tracking-wider">
                              <FileText size={13} /> เอกสารแผน
                            </a>
                          )}
                          {/* Multiple lesson plan files */}
                          {p.fileUrls?.map((url: string, idx: number) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors uppercase tracking-wider">
                              <FileText size={13} /> เอกสารแผน {p.fileUrls.length > 1 ? idx + 1 : ""}
                            </a>
                          ))}
                          {/* After class note file */}
                          {p.hasAfterClassNote && (p.afterClassNoteUrl || (p.afterClassNoteUrls && p.afterClassNoteUrls.length > 0)) && (
                            <a href={p.afterClassNoteUrl || p.afterClassNoteUrls[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors uppercase tracking-wider">
                              <FileText size={13} /> บันทึกหลังสอน
                            </a>
                          )}
                          {/* Fallback */}
                          {!p.fileUrl && (!p.fileUrls || p.fileUrls.length === 0) && (!p.hasAfterClassNote || (!p.afterClassNoteUrl && (!p.afterClassNoteUrls || p.afterClassNoteUrls.length === 0))) && (
                            <span className="text-xs text-zinc-400">ไม่มีไฟล์</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {p.teacherName === user.username && (
                            <>
                              {p.status !== 'approved' ? (
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
                              ) : (
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold italic">ล็อก</span>
                              )}
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
                                className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
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
