"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Users, BarChart3, Settings, Upload, Minus, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { uploadFile } from "@/lib/upload";

// User Selector Component Helper
const UserSelector = ({ 
  systemUsers, 
  onSelect, 
  placeholder = "-- เลือกผู้ใช้งานจากรายชื่อที่ค้นพบด้านล่างเพื่อดึงข้อมูล --" 
}: { 
  systemUsers: any[], 
  onSelect: (u: any) => void, 
  placeholder?: string 
}) => {
  const [localSearchName, setLocalSearchName] = useState("");
  const [localSearchDepartment, setLocalSearchDepartment] = useState("");
  const [localSearchRoom, setLocalSearchRoom] = useState("");

  const uniqueDepartments = Array.from(new Set(systemUsers.map(u => u.department).filter(Boolean))).sort() as string[];
  const uniqueRooms = Array.from(new Set(
    systemUsers
      .filter(u => !localSearchDepartment || u.department === localSearchDepartment)
      .map(u => u.classGroupId)
      .filter(Boolean)
  )).sort() as string[];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input 
          type="text" 
          placeholder="ค้นหาชื่อ..." 
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={localSearchName}
          onChange={e => setLocalSearchName(e.target.value)}
        />
        <select
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={localSearchDepartment}
          onChange={e => {
            setLocalSearchDepartment(e.target.value);
            setLocalSearchRoom("");
          }}
        >
          <option value="">-- ทุกแผนกวิชา --</option>
          {uniqueDepartments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={localSearchRoom}
          onChange={e => setLocalSearchRoom(e.target.value)}
          disabled={uniqueRooms.length === 0}
        >
          <option value="">-- ทุกห้องเรียน --</option>
          {uniqueRooms.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>
      </div>
      <select 
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
        onChange={(e) => {
          if (!e.target.value) return;
          const u = systemUsers.find(x => x._id === e.target.value);
          if (u) {
            onSelect(u);
            e.target.value = ""; // reset after selection
          }
        }}
      >
        <option value="">{placeholder}</option>
        {systemUsers.filter(u => {
          const matchName = !localSearchName || u.name.toLowerCase().includes(localSearchName.toLowerCase());
          const matchDept = !localSearchDepartment || (u.department && u.department.toLowerCase().includes(localSearchDepartment.toLowerCase()));
          const matchRoom = !localSearchRoom || (u.classGroupId && u.classGroupId.toLowerCase().includes(localSearchRoom.toLowerCase()));
          return matchName && matchDept && matchRoom;
        }).slice(0, 50).map(u => (
          <option key={u._id} value={u._id}>
            [{u.role === 'student' ? 'นักเรียน' : 'บุคลากร'}] {u.name} {u.department ? `- ${u.department} ${u.classGroupId || ''}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function ManageElection({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [election, setElection] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", startDate: "", endDate: "", status: "draft" });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [totalEligibleVoters, setTotalEligibleVoters] = useState(0);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"candidates" | "results" | "settings">("candidates");
  // Candidate Form
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateForm, setCandidateForm] = useState<{
    number: string;
    name: string;
    partyName: string;
    policy: string;
    imageUrl: string;
    members: { name: string; role: string; imageUrl?: string }[];
  }>({ number: "", name: "", partyName: "", policy: "", imageUrl: "", members: [] });
  const [uploadingImage, setUploadingImage] = useState(false);
  // Search Users
  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchRoom, setSearchRoom] = useState("");

  // Manual Vote Modal
  const [manualVoteModal, setManualVoteModal] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    candidateNumber: string;
    action: "add" | "subtract";
    inputValue: string;
    isSaving: boolean;
  }>({ isOpen: false, candidateId: "", candidateName: "", candidateNumber: "", action: "add", inputValue: "", isSaving: false });

  const handleSaveManualVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVoteModal.inputValue || isNaN(Number(manualVoteModal.inputValue)) || Number(manualVoteModal.inputValue) <= 0) return;
    
    setManualVoteModal(prev => ({ ...prev, isSaving: true }));
    try {
      const res = await fetch(`/api/election/${id}/votes/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          candidateId: manualVoteModal.candidateId, 
          amount: Number(manualVoteModal.inputValue),
          action: manualVoteModal.action
        })
      });
      if (res.ok) {
        toast.success(manualVoteModal.action === "add" ? "บวกคะแนนสำเร็จ" : "หักลบคะแนนสำเร็จ");
        fetchData();
        setManualVoteModal(prev => ({ ...prev, isOpen: false }));
      } else {
        toast.error("อัปเดตไม่สำเร็จ");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setManualVoteModal(prev => ({ ...prev, isSaving: false }));
    }
  };

  const fetchData = async () => {
    try {
      const [elecRes, candRes, resultRes, usersRes] = await Promise.all([
        fetch(`/api/election/${id}`),
        fetch(`/api/election/${id}/candidates`),
        fetch(`/api/election/${id}/results`),
        fetch(`/api/election/users`)
      ]);
      
      if (elecRes.ok) {
        const elec = await elecRes.json();
        setElection(elec);
        setEditForm({
          title: elec.title || "",
          description: elec.description || "",
          startDate: elec.startDate ? new Date(new Date(elec.startDate).getTime() - new Date(elec.startDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
          endDate: elec.endDate ? new Date(new Date(elec.endDate).getTime() - new Date(elec.endDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "",
          status: elec.status || "draft",
        });
      }
      if (candRes.ok) setCandidates(await candRes.json());
      if (resultRes.ok) {
        const data = await resultRes.json();
        setResults(data.results || []);
        setTotalEligibleVoters(data.totalEligibleVoters || 0);
      }
      if (usersRes.ok) setSystemUsers(await usersRes.json());
    } catch (e) {
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsOnly = async () => {
    try {
      const resultRes = await fetch(`/api/election/${id}/results`);
      if (resultRes.ok) {
        const data = await resultRes.json();
        setResults(data.results || []);
        setTotalEligibleVoters(data.totalEligibleVoters || 0);
      }
    } catch (e) {
      // fail silently
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchResultsOnly();
    }, 15000); // Real-time poll every 15s if visible
    return () => clearInterval(interval);
  }, [id]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`/api/election/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success("บันทึกการแก้ไขสำเร็จ");
        fetchData();
      } else {
        toast.error("บันทึกไม่สำเร็จ");
      }
    } catch(e) {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/election/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchData();
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingCandidateId;
      const url = isEditing 
        ? `/api/election/${id}/candidates/${editingCandidateId}` 
        : `/api/election/${id}/candidates`;
        
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateForm)
      });
      if (res.ok) {
        toast.success(isEditing ? "แก้ไขผู้สมัครสำเร็จ" : "เพิ่มผู้สมัครสำเร็จ");
        setShowCandidateForm(false);
        setEditingCandidateId(null);
        setCandidateForm({ number: "", name: "", partyName: "", policy: "", imageUrl: "", members: [] });
        fetchData();
      } else {
        toast.error(isEditing ? "แก้ไขไม่สำเร็จ" : "เพิ่มไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const res = await uploadFile(file, "elections");
      if (res.secure_url) {
        setCandidateForm({ ...candidateForm, imageUrl: res.secure_url });
        toast.success("อัปโหลดรูปภาพสำเร็จ");
      } else {
        toast.error("อัปโหลดไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("ลบผู้สมัครนี้?")) return;
    try {
      const res = await fetch(`/api/election/${id}/candidates/${candidateId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบสำเร็จ");
        fetchData();
      } else {
        toast.error("ลบไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleResetVotes = async () => {
    if (!confirm("⚠️ คุณแน่ใจหรือไม่ที่จะ 'รีเซ็ตผลคะแนนทั้งหมด' ?\n(ข้อมูลการโหวตทั้งหมดในการเลือกตั้งครั้งนี้จะถูกลบทิ้งอย่างถาวร เพื่อให้เริ่มต้นใหม่ได้)")) return;
    try {
      const res = await fetch(`/api/election/${id}/results`, { method: "DELETE" });
      if (res.ok) {
        toast.success("รีเซ็ตผลคะแนนทั้งหมดเรียบร้อยแล้ว");
        fetchData();
      } else {
        toast.error("ไม่สามารถรีเซ็ตผลคะแนนได้");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;
  if (!election) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลการเลือกตั้ง</div>;

  // Process Results
  const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
  const getCandidateVotes = (cId: string | null) => {
    const found = results.find(r => r._id === cId);
    return found ? found.count : 0;
  };

  // Derived state for search dropdowns
  const uniqueDepartments = Array.from(new Set(systemUsers.map(u => u.department).filter(Boolean))).sort() as string[];
  const uniqueRooms = Array.from(new Set(
    systemUsers
      .filter(u => !searchDepartment || u.department === searchDepartment)
      .map(u => u.classGroupId)
      .filter(Boolean)
  )).sort() as string[];

  return (
    <div className="p-6 max-w-[1600px] w-full mx-auto">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
        <button onClick={() => router.push('/dashboard/election')} className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium hover:underline mb-4 inline-flex items-center gap-1 transition-colors">
          &larr; กลับไปหน้ารวมการเลือกตั้ง
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{election.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg flex items-center gap-2">
          เปิดโหวต: <span className="font-medium text-gray-700 dark:text-gray-300">{format(new Date(election.startDate), "dd/MM/yyyy HH:mm")} - {format(new Date(election.endDate), "dd/MM/yyyy HH:mm")}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
            election.status === 'active' ? 'bg-green-100 text-green-700' : 
            election.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            สถานะปัจจุบัน: {election.status === 'active' ? 'กำลังเปิดโหวต' : election.status === 'closed' ? 'ปิดโหวตแล้ว' : 'ฉบับร่าง'}
          </span>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>
          
          {election.status !== 'active' && (
            <button onClick={() => handleUpdateStatus('active')} className="px-6 py-2 bg-green-500 hover:bg-green-600 active:scale-95 transition-all text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md">
              เริ่มเปิดโหวตทันที
            </button>
          )}
          {election.status === 'active' && (
            <button onClick={() => handleUpdateStatus('closed')} className="px-6 py-2 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md">
              ปิดรับคะแนนโหวต
            </button>
          )}
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

          <button onClick={() => window.open(`/student/election/results/${id}`, '_blank')} className="px-6 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 active:scale-95 transition-all rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
            <BarChart3 size={16} /> ดูหน้าจอผลโหวต (นักเรียน)
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl w-fit border border-gray-200/50 dark:border-gray-700/50">
        <button 
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'candidates' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
          onClick={() => setActiveTab('candidates')}
        >
          <Users size={18} /> จัดการผู้สมัคร
        </button>
        <button 
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'results' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
          onClick={() => setActiveTab('results')}
        >
          <BarChart3 size={18} /> ตั้งผลคะแนนโหวต
        </button>
        <button 
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'settings' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> ตั้งค่าการเลือกตั้ง
        </button>
      </div>

      {activeTab === 'candidates' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">รายชื่อผู้สมัคร</h2>
            <button 
              onClick={() => {
                setShowCandidateForm(!showCandidateForm);
                if (showCandidateForm) {
                  setEditingCandidateId(null);
                  setCandidateForm({ number: "", name: "", partyName: "", policy: "", imageUrl: "", members: [] });
                }
              }}
              className={`${showCandidateForm && !editingCandidateId ? 'bg-gray-500' : 'bg-blue-600'} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
            >
              {showCandidateForm && !editingCandidateId ? 'ยกเลิก' : <><Plus size={18} /> เพิ่มผู้สมัคร</>}
            </button>
          </div>

          {showCandidateForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => {
                setShowCandidateForm(false);
                setEditingCandidateId(null);
              }}></div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editingCandidateId ? 'แก้ไขข้อมูลผู้สมัคร' : 'เพิ่มผู้สมัครใหม่'}
                </h3>
                <form onSubmit={handleAddCandidate} className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 mb-2 p-4 border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 rounded-xl">
                  <label className="block text-sm mb-3 text-blue-700 dark:text-blue-400 font-semibold items-center gap-2">
                    <Users size={16} /> เลือกข้อมูลจากผู้ใช้งานในระบบ (หัวหน้าพรรค / ผู้ลงสมัคร)
                  </label>
                  <UserSelector systemUsers={systemUsers} onSelect={(u) => setCandidateForm({ ...candidateForm, name: u.name, imageUrl: u.image || candidateForm.imageUrl })} />
                </div>

                <div>
                  <label className="block text-sm mb-1">หมายเลข *</label>
                  <input type="number" required value={candidateForm.number} onChange={e => setCandidateForm({...candidateForm, number: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">ชื่อ-นามสกุล (ผู้ลงสมัคร) *</label>
                  <input type="text" required value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm mb-1">ชื่อพรรค (Party Name)</label>
                  <input type="text" value={candidateForm.partyName} onChange={e => setCandidateForm({...candidateForm, partyName: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="เว้นว่างได้ถ้าไม่มี" />
                </div>
                <div>
                  <label className="block text-sm mb-1">URL รูปภาพ หรือ อัปโหลดรูป</label>
                  <div className="flex gap-2">
                    <input type="text" value={candidateForm.imageUrl} onChange={e => setCandidateForm({...candidateForm, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
                    <label className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded border border-blue-200 cursor-pointer flex items-center justify-center shrink-0 transition-colors" title="อัปโหลดรูปภาพ">
                      {uploadingImage ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></span> : <Upload size={18} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                  {candidateForm.imageUrl && (
                    <div className="mt-2">
                      <img src={candidateForm.imageUrl} alt="Preview" className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">สมาชิกพรรค (Party Members)</label>
                    <button type="button" onClick={() => {
                      setCandidateForm({
                        ...candidateForm,
                        members: [{ name: "", role: "", imageUrl: "" }, ...candidateForm.members]
                      });
                    }} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors">
                      <Plus size={16} /> เพิ่มสมาชิกพรรค
                    </button>
                  </div>
                  {candidateForm.members.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                      ยังไม่มีสมาชิกพรรค (เพิ่มได้หากเป็นการลงสมัครแบบพรรค)
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {candidateForm.members.map((member, index) => (
                        <div key={index} className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded border dark:border-gray-700 relative group">
                          <button type="button" onClick={() => {
                            const newMembers = candidateForm.members.filter((_, i) => i !== index);
                            setCandidateForm({...candidateForm, members: newMembers});
                          }} className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </button>
                          
                          <div className="w-full">
                            <label className="block text-xs mb-1 text-gray-500">ดึงข้อมูลจากระบบ (ค้นหาแล้วเลือกเพื่อใส่ชื่ออัตโนมัติ)</label>
                            <UserSelector 
                              systemUsers={systemUsers}
                              placeholder="-- ค้นหาและเลือกสมาชิก --"
                              onSelect={(u) => {
                                const newMembers = [...candidateForm.members];
                                newMembers[index].name = u.name;
                                newMembers[index].imageUrl = u.image || "";
                                setCandidateForm({...candidateForm, members: newMembers});
                              }} 
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            <div>
                              <label className="block text-xs mb-1 text-gray-500">ชื่อ-นามสกุล *</label>
                              <input type="text" placeholder="ชื่อ-นามสกุล" required value={member.name} onChange={e => {
                                const newMembers = [...candidateForm.members];
                                newMembers[index].name = e.target.value;
                                setCandidateForm({...candidateForm, members: newMembers});
                              }} className="w-full px-3 py-1.5 border rounded text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs mb-1 text-gray-500">ตำแหน่งหน้าที่</label>
                              <input type="text" placeholder="ตำแหน่ง (เช่น รองประธานฝ่าย...)" value={member.role} onChange={e => {
                                const newMembers = [...candidateForm.members];
                                newMembers[index].role = e.target.value;
                                setCandidateForm({...candidateForm, members: newMembers});
                              }} className="w-full px-3 py-1.5 border rounded text-sm" />
                            </div>
                            <div className="md:col-span-2 flex gap-3 items-center">
                              <div className="flex-1">
                                <label className="block text-xs mb-1 text-gray-500">URL รูปภาพ</label>
                                <input type="text" placeholder="https://..." value={member.imageUrl || ""} onChange={e => {
                                  const newMembers = [...candidateForm.members];
                                  newMembers[index].imageUrl = e.target.value;
                                  setCandidateForm({...candidateForm, members: newMembers});
                                }} className="w-full px-3 py-1.5 border rounded text-sm" />
                              </div>
                              {member.imageUrl && (
                                <img src={member.imageUrl} alt={member.name} className="w-10 h-10 rounded-full object-cover border mt-4 shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => {
                  setShowCandidateForm(false);
                  setEditingCandidateId(null);
                }} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-xl font-bold transition-colors">ยกเลิก</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all">{editingCandidateId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้สมัคร'}</button>
              </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {candidates.map(candidate => (
              <div key={candidate._id} className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 p-8 flex flex-col items-center justify-center relative border-b border-gray-50 dark:border-gray-700">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white dark:bg-gray-700 shadow-md border-4 border-white dark:border-gray-600 mb-2 relative z-10">
                    {candidate.imageUrl ? <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-300">{candidate.number}</div>}
                  </div>
                  <div className="absolute top-4 left-4 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                    {candidate.number}
                  </div>
                  
                  <div className="absolute top-4 right-4 flex flex-col gap-2 transition-opacity">
                    <button onClick={() => {
                      setCandidateForm({
                        number: candidate.number,
                        name: candidate.name,
                        partyName: candidate.partyName || "",
                        policy: candidate.policy || "",
                        imageUrl: candidate.imageUrl || "",
                        members: candidate.members || []
                      });
                      setEditingCandidateId(candidate._id);
                      setShowCandidateForm(true);
                    }} className="bg-white text-blue-600 hover:bg-blue-50 p-2.5 rounded-xl shadow-md transition-colors" title="แก้ไข">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteCandidate(candidate._id)} className="bg-white text-red-500 hover:bg-red-50 p-2.5 rounded-xl shadow-md transition-colors" title="ลบ">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  {candidate.partyName && (
                    <p className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-lg w-fit mb-2">พรรค{candidate.partyName}</p>
                  )}
                  <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white line-clamp-1">{candidate.name}</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl flex-1 border border-gray-100/50 dark:border-gray-700/50 flex flex-col gap-3">
                    <div className="mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">นโยบาย</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 group-hover:line-clamp-none transition-all">{candidate.policy || "ไม่มีแนวนโยบาย"}</p>
                    </div>
                    {candidate.members && candidate.members.length > 0 && (
                      <div className="mt-auto">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">สมาชิกพรรค ({candidate.members.length})</p>
                        <ul className="text-sm space-y-1">
                          {candidate.members.slice(0, 3).map((member: any, i: number) => (
                            <li key={i} className="flex justify-between items-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                              <div className="flex items-center gap-2 truncate pr-2">
                                {member.imageUrl ? (
                                  <img src={member.imageUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                                    {member.name.charAt(0)}
                                  </div>
                                )}
                                <span className="truncate">{member.name}</span>
                              </div>
                              <span className="text-xs text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full shrink-0">{member.role}</span>
                            </li>
                          ))}
                          {candidate.members.length > 3 && (
                            <li className="text-xs text-center text-gray-400 mt-2">และอีก {candidate.members.length - 3} คน</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {candidates.length === 0 && (
              <div className="col-span-full py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-bold text-gray-500">ยังไม่มีผู้สมัครในการเลือกตั้งนี้</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 size={20} /> ผลคะแนนโหวต 
              <span className="text-sm font-normal text-gray-500 ml-2">(ผู้มาใช้สิทธิ์: {totalVotes} / {totalEligibleVoters} คน)</span>
            </h2>
            <button 
              onClick={handleResetVotes}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} /> รีเซ็ตผลคะแนน
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20 mb-6">
            <h3 className="text-xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <span className="text-gray-500">จำนวนผู้ใช้สิทธิ์ทั้งหมด:</span>
              <span className="text-4xl font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl">{totalVotes}</span>
              <span className="text-gray-500">คน</span>
            </h3>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              {[...candidates].sort((a,b) => getCandidateVotes(b._id) - getCandidateVotes(a._id)).map(candidate => {
                const votes = getCandidateVotes(candidate._id);
                const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0";
                return (
                  <div key={candidate._id} className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex justify-center items-center font-black text-xl shrink-0">
                          {candidate.number}
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">{candidate.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-2xl text-gray-900 dark:text-white">{votes}</span>
                        <span className="text-sm font-medium text-gray-500 ml-2">({percentage}%)</span>
                        <button onClick={() => {
                          setManualVoteModal({
                            isOpen: true,
                            candidateId: candidate._id,
                            candidateName: candidate.name,
                            candidateNumber: candidate.number,
                            action: "add",
                            inputValue: "",
                            isSaving: false
                          });
                        }} className="ml-3 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200" title="เพิ่มคะแนนจากบัตรกระดาษ">
                          <Plus size={16} />
                        </button>
                        <button onClick={() => {
                          setManualVoteModal({
                            isOpen: true,
                            candidateId: candidate._id,
                            candidateName: candidate.name,
                            candidateNumber: candidate.number,
                            action: "subtract",
                            inputValue: "",
                            isSaving: false
                          });
                        }} className="ml-1 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="หักลบคะแนน (เช่น บัตรเสีย)">
                          <Minus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div 
                        className="bg-linear-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 relative" 
                        style={{ width: `${percentage}%` }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Abstain votes */}
              {(() => {
                const abstainVotes = getCandidateVotes(null);
                const abstainPercentage = totalVotes > 0 ? ((abstainVotes / totalVotes) * 100).toFixed(1) : "0";
                return (
                  <div className="mt-10 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-end mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full flex justify-center items-center font-black text-xl shrink-0">
                            -
                          </div>
                          <span className="font-bold text-lg text-gray-600 dark:text-gray-400">งดออกเสียง (Abstain)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-2xl text-gray-600 dark:text-gray-400">{abstainVotes}</span>
                          <span className="text-sm font-medium text-gray-500 ml-2">({abstainPercentage}%)</span>
                          <button onClick={() => {
                            setManualVoteModal({
                              isOpen: true,
                              candidateId: "abstain",
                              candidateName: "งดออกเสียง (Abstain)",
                              candidateNumber: "-",
                              action: "add",
                              inputValue: "",
                              isSaving: false
                            });
                          }} className="ml-3 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200" title="เพิ่มคะแนนงดออกเสียงจากบัตรกระดาษ">
                            <Plus size={16} />
                          </button>
                          <button onClick={() => {
                            setManualVoteModal({
                              isOpen: true,
                              candidateId: "abstain",
                              candidateName: "งดออกเสียง (Abstain)",
                              candidateNumber: "-",
                              action: "subtract",
                              inputValue: "",
                              isSaving: false
                            });
                          }} className="ml-1 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="หักลบคะแนนงดออกเสียง">
                            <Minus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gray-400 dark:bg-gray-500 h-full rounded-full transition-all duration-1000 relative" 
                          style={{ width: `${abstainPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings size={20} /> ตั้งค่าการเลือกตั้ง
            </h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20 mb-6 max-w-3xl">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  หัวข้อการเลือกตั้ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="เช่น เลือกตั้งประธานนักเรียน ปีการศึกษา 2568"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  รายละเอียด (ถ้ามี)
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    วันและเวลาที่เริ่ม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    วันและเวลาที่สิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  สถานะ
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                >
                  <option value="draft">ฉบับร่าง (ยังไม่เผยแพร่)</option>
                  <option value="active">เปิดให้โหวต (Active)</option>
                  <option value="closed">ปิดโหวต (Closed)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end border-t dark:border-gray-700 mt-6">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:bg-blue-400 disabled:shadow-none"
                >
                  {isSavingSettings ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Vote Modal */}
      {manualVoteModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !manualVoteModal.isSaving && setManualVoteModal(prev => ({ ...prev, isOpen: false }))}></div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative z-10 overflow-hidden">
            {/* Header */}
            <div className={`absolute top-0 left-0 w-full h-2 ${manualVoteModal.action === "add" ? "bg-green-500" : "bg-red-500"}`}></div>
            <div className="flex justify-between items-start mb-6 pt-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${manualVoteModal.action === "add" ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-red-100 text-red-600 dark:bg-red-900/30"}`}>
                  {manualVoteModal.action === "add" ? <Plus size={20} /> : <Minus size={20} />}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${manualVoteModal.action === "add" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                    {manualVoteModal.action === "add" ? "บวกคะแนนเพิ่ม" : "หักลบคะแนน"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ระบุจำนวนที่ต้องการ{manualVoteModal.action === "add" ? "เพิ่ม" : "ลบ"}</p>
                </div>
              </div>
              <button onClick={() => setManualVoteModal(prev => ({ ...prev, isOpen: false }))} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Candidate Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-full flex justify-center items-center font-black text-xl shrink-0 shadow-sm border border-gray-200 dark:border-gray-600">
                {manualVoteModal.candidateNumber}
              </div>
              <div className="font-bold text-gray-900 dark:text-white text-lg">{manualVoteModal.candidateName}</div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveManualVote}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ระบุจำนวนคะแนน <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  autoFocus
                  placeholder={manualVoteModal.action === "add" ? "+ จำนวนคะแนน" : "- จำนวนคะแนน"}
                  value={manualVoteModal.inputValue}
                  onChange={(e) => setManualVoteModal(prev => ({ ...prev, inputValue: e.target.value }))}
                  className={`w-full px-4 py-4 text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all text-center ${
                    manualVoteModal.action === "add" 
                      ? "focus:border-green-500 focus:ring-4 focus:ring-green-500/20 text-green-700 dark:text-green-400 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                      : "focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-700 dark:text-red-400 border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  disabled={manualVoteModal.isSaving}
                  onClick={() => setManualVoteModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={manualVoteModal.isSaving}
                  className={`px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:shadow-none ${
                    manualVoteModal.action === "add" 
                      ? "bg-green-600 hover:bg-green-700 shadow-green-600/30" 
                      : "bg-red-600 hover:bg-red-700 shadow-red-600/30"
                  }`}
                >
                  {manualVoteModal.isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {manualVoteModal.isSaving ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
