"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function DpaEvaluationPage() {
  const { data: session } = useSession();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEval, setNewEval] = useState<any>({ 
    academicYear: String(new Date().getFullYear() + 543), 
    goals: "", 
    videoUrl1: "", 
    videoUrl2: "", 
    studentOutcomeUrl: "", 
    evidenceLink: "" 
  });
  const [studentOutcomeFile, setStudentOutcomeFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const user = {
    username: session?.user?.name || session?.user?.username,
    role: session?.user?.role,
    image: session?.user?.image,
  };

  const isDirector = user.role === 'director' || user.role === 'super_admin';
  const isSuperAdmin = user.role === 'super_admin';

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
    
    setUploading(true);
    try {
      let finalStudentOutcomeUrl = newEval.studentOutcomeUrl;
      let finalEvidenceLink = newEval.evidenceLink;

      // Upload Student Outcome File if selected
      if (studentOutcomeFile) {
        const formData = new FormData();
        formData.append("file", studentOutcomeFile);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) finalStudentOutcomeUrl = data.url;
      }

      // Upload Evidence File if selected
      if (evidenceFile) {
        const formData = new FormData();
        formData.append("file", evidenceFile);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) finalEvidenceLink = data.url;
      }

      const payload = { 
        ...newEval, 
        videoUrls: [newEval.videoUrl1, newEval.videoUrl2].filter(Boolean),
        studentOutcomeUrls: finalStudentOutcomeUrl ? [finalStudentOutcomeUrl] : [],
        evidenceLinks: finalEvidenceLink ? [finalEvidenceLink] : [],
        teacherName: newEval.teacherName || user.username || "Unknown", 
        status: newEval.status || "submitted" 
      };
      
      const method = newEval._id ? "PATCH" : "POST";
      
      const res = await fetch("/api/director/dpa-evaluation", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAdd(false);
        setNewEval({ academicYear: String(new Date().getFullYear() + 543), goals: "", videoUrl1: "", videoUrl2: "", studentOutcomeUrl: "", evidenceLink: "" });
        setStudentOutcomeFile(null);
        setEvidenceFile(null);
        fetchEvaluations();
      }
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ยืนยันการลบข้อมูลนี้?")) return;
    try {
      const res = await fetch(`/api/director/dpa-evaluation?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchEvaluations();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (e: any) => {
    setNewEval({
      ...e,
      videoUrl1: e.videoUrls?.[0] || "",
      videoUrl2: e.videoUrls?.[1] || "",
      studentOutcomeUrl: e.studentOutcomeUrls?.[0] || "",
      evidenceLink: e.evidenceLinks?.[0] || ""
    });
    setShowAdd(true);
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
        {/* Header Removed */}
        
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
              <div className="mb-6 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                <h3 className="font-bold text-base mb-4 text-zinc-800 dark:text-zinc-100">
                  {newEval._id ? "📝 แก้ไขข้อตกลง PA" : "จัดทำข้อตกลง PA ใหม่"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ปีการศึกษา</label>
                    <input type="text" placeholder="เช่น 2567" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.academicYear} onChange={e => setNewEval({...newEval, academicYear: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">เป้าหมายที่คาดหวัง</label>
                    <input type="text" placeholder="ระบุเป้าหมาย" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.goals} onChange={e => setNewEval({...newEval, goals: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ลิงก์คลิปการสอน 1 (YouTube/Drive)</label>
                    <input type="url" placeholder="https://" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.videoUrl1} onChange={e => setNewEval({...newEval, videoUrl1: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ลิงก์คลิปการสอน 2 (YouTube/Drive)</label>
                    <input type="url" placeholder="https://" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.videoUrl2} onChange={e => setNewEval({...newEval, videoUrl2: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">ผลลัพธ์ผู้เรียน (อัปโหลดไฟล์ หรือ วางลิงก์)</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        className="w-full p-1.5 border rounded-xl dark:border-zinc-700 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-50 file:text-rose-700 dark:file:bg-rose-900/30 dark:file:text-rose-400 hover:file:bg-rose-100 bg-white dark:bg-zinc-900" 
                        onChange={e => setStudentOutcomeFile(e.target.files?.[0] || null)}
                      />
                      <input type="url" placeholder="หรือวางลิงก์ (https://)" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.studentOutcomeUrl} onChange={e => setNewEval({...newEval, studentOutcomeUrl: e.target.value})} disabled={!!studentOutcomeFile} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1">เอกสารข้อตกลง PA (อัปโหลด PDF หรือ วางลิงก์)</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        className="w-full p-1.5 border rounded-xl dark:border-zinc-700 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-rose-50 file:text-rose-700 dark:file:bg-rose-900/30 dark:file:text-rose-400 hover:file:bg-rose-100 bg-white dark:bg-zinc-900" 
                        onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
                      />
                      <input type="url" placeholder="หรือวางลิงก์ (https://)" className="w-full p-2 border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-rose-500" value={newEval.evidenceLink} onChange={e => setNewEval({...newEval, evidenceLink: e.target.value})} disabled={!!evidenceFile} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => { setShowAdd(false); setStudentOutcomeFile(null); setEvidenceFile(null); }} className="bg-zinc-200 text-zinc-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-zinc-300" disabled={uploading}>ยกเลิก</button>
                  <button onClick={handleAdd} disabled={uploading} className="bg-rose-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2">
                    {uploading ? "กำลังอัปโหลด..." : "บันทึกข้อมูลส่งประเมิน"}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/30 text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-4 py-4 rounded-tl-2xl">ครูผู้สอน</th>
                    <th className="px-4 py-4">ปีการศึกษา</th>
                    <th className="px-4 py-4">เป้าหมาย/เอกสารหลักฐาน</th>
                    <th className="px-4 py-4 text-center">สถานะ</th>
                    <th className="px-4 py-4 text-center">คะแนน</th>
                    {isDirector && <th className="px-4 py-4 rounded-tr-2xl text-center">จัดการประเมิน</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500 font-bold">กำลังโหลดข้อมูล...</td></tr>
                  ) : evaluations.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-zinc-500 font-bold">ไม่พบข้อมูลการประเมิน</td></tr>
                  ) : (
                    evaluations.map((e: any) => (
                      <tr key={e._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-4 text-sm font-black text-zinc-800 dark:text-zinc-100">{e.teacherName}</td>
                        <td className="px-4 py-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">{e.academicYear}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">{e.goals}</p>
                          <div className="flex flex-wrap gap-2">
                            {e.videoUrls?.map((url: string, idx: number) => (
                              <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-rose-50 text-rose-600 rounded-md font-bold hover:bg-rose-100">คลิป {idx+1}</a>
                            ))}
                            {e.studentOutcomeUrls?.map((url: string, idx: number) => (
                              <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-amber-50 text-amber-600 rounded-md font-bold hover:bg-amber-100">ผลลัพธ์ผู้เรียน</a>
                            ))}
                            {e.evidenceLinks?.map((url: string, idx: number) => (
                              <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-bold hover:bg-indigo-100">เอกสาร PA</a>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${e.status === 'evaluated' || e.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                            {e.status === 'evaluated' || e.status === 'approved' ? 'ประเมินแล้ว' : 'รอพิจารณา'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-black text-rose-600 dark:text-rose-400">{e.evaluatorScore || '-'} <span className="text-xs text-zinc-400 font-bold">/ 100</span></td>
                        {isDirector && (
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleEvaluate(e._id, 85)} className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100">ผ่าน (85)</button>
                              <button onClick={() => handleEvaluate(e._id, 95)} className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-100">ดีเยี่ยม (95)</button>
                              {isSuperAdmin && (
                                <>
                                  <button onClick={() => handleEditClick(e)} className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Pencil size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(e._id)} className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
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
