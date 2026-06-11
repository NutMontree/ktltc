"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, AlertCircle, X, MapPin, HeartHandshake, ShieldCheck, Camera, Image as ImageIcon, Send, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import { uploadFile } from "@/lib/upload";

export default function StudentCarePage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [recordType, setRecordType] = useState<"screening" | "home_visit">("screening");

  // Form State
  const [newCare, setNewCare] = useState({ 
    classroom: "", 
    studentName: "", 
    sdqType: "normal", 
    notes: "",
    gpsLat: "",
    gpsLng: "",
    address: "",
    imageUrl: "", // keep for legacy backwards compatibility
    status: "active" // active, referred, resolved
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const user = {
    username: session?.user?.name || (session?.user as any)?.username,
    role: (session?.user as any)?.role,
    image: session?.user?.image,
  };

  const isAdmin = ["super_admin", "admin", "director"].includes(user.role?.toLowerCase() || "");

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
      toast.error("ดึงข้อมูลล้มเหลว");
    }
    setLoading(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      toast.loading("กำลังดึงพิกัด GPS...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast.dismiss();
          setNewCare(prev => ({
            ...prev,
            gpsLat: position.coords.latitude.toString(),
            gpsLng: position.coords.longitude.toString()
          }));
          toast.success("ดึงพิกัด GPS สำเร็จ");
        },
        (error) => {
          toast.dismiss();
          toast.error("ไม่สามารถดึงพิกัดได้ กรุณาเปิด Location Services");
        }
      );
    } else {
      toast.error("เบราว์เซอร์ของคุณไม่รองรับ Geolocation");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const previews = files.map(f => URL.createObjectURL(f));
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...previews]);
    }
    // Reset input so the same files can be selected again if removed
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleAdd = async () => {
    if (!newCare.classroom || !newCare.studentName) {
      return toast.error("กรุณาระบุชั้นเรียนและชื่อนักเรียน");
    }
    
    setIsUploading(true);
    let uploadedUrls: string[] = [];
    
    if (recordType === "home_visit" && imageFiles.length > 0) {
      toast.loading(`กำลังอัปโหลดรูปภาพ ${imageFiles.length} รูป...`);
      try {
        const uploads = await Promise.all(
          imageFiles.map(file => uploadFile(file, "student_care"))
        );
        uploadedUrls = uploads.map(u => u.secure_url).filter(Boolean) as string[];
      } catch (err) {
        toast.dismiss();
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        setIsUploading(false);
        return;
      }
      toast.dismiss();
    }

    try {
      const res = await fetch("/api/director/student-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...newCare, 
          imageUrls: uploadedUrls,
          recordType,
          teacherName: user.username || "Unknown",
          visitDate: new Date()
        })
      });
      if (res.ok) {
        toast.success("บันทึกข้อมูลดูแลนักเรียนสำเร็จ");
        setShowAdd(false);
        setNewCare({ classroom: "", studentName: "", sdqType: "normal", notes: "", gpsLat: "", gpsLng: "", address: "", imageUrl: "", status: "active" });
        setImageFiles([]);
        setImagePreviews([]);
        fetchRecords();
      } else {
        toast.error("บันทึกข้อมูลล้มเหลว");
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/director/student-care", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, status })
      });
      if (res.ok) {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchRecords();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Stats for Dashboard
  const sdqCounts = {
    normal: records.filter(r => r.sdqType === 'normal').length,
    risk: records.filter(r => r.sdqType === 'risk').length,
    problem: records.filter(r => r.sdqType === 'problem').length,
    special: records.filter(r => r.sdqType === 'special').length,
  };
  const totalSdq = sdqCounts.normal + sdqCounts.risk + sdqCounts.problem + sdqCounts.special || 1;

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-500 overflow-hidden">
      <Toaster position="top-right" />
      <div className="max-w-[1600px] mx-auto w-full px-2 py-8 md:py-12 relative">
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
                <p className="text-sm font-bold text-zinc-500">คัดกรองนักเรียน และรายงานเยี่ยมบ้าน (คป.02 / คป.11)</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAdd(!showAdd)} 
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
            >
              {showAdd ? <X size={16} /> : <Plus size={16} />} 
              {showAdd ? "ยกเลิก" : "บันทึกคัดกรอง / เยี่ยมบ้าน"}
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800">
            
            {/* Dashboard Summary (Only if records exist) */}
            {!showAdd && records.length > 0 && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-teal-500" /> ภาพรวมผลการคัดกรองนักเรียนทั้งหมด
                </h3>
                
                <div className="flex w-full h-4 rounded-full overflow-hidden mb-4 bg-slate-200 dark:bg-zinc-800">
                  <div style={{width: `${(sdqCounts.normal/totalSdq)*100}%`}} className="bg-emerald-500 transition-all duration-1000"></div>
                  <div style={{width: `${(sdqCounts.special/totalSdq)*100}%`}} className="bg-blue-500 transition-all duration-1000"></div>
                  <div style={{width: `${(sdqCounts.risk/totalSdq)*100}%`}} className="bg-amber-500 transition-all duration-1000"></div>
                  <div style={{width: `${(sdqCounts.problem/totalSdq)*100}%`}} className="bg-rose-500 transition-all duration-1000"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-xs font-bold text-emerald-600 mb-1">กลุ่มปกติ</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{sdqCounts.normal} <span className="text-sm font-medium text-slate-400">คน</span></p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs font-bold text-blue-600 mb-1">กลุ่มพิเศษ</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{sdqCounts.special} <span className="text-sm font-medium text-slate-400">คน</span></p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-xs font-bold text-amber-600 mb-1">กลุ่มเสี่ยง</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{sdqCounts.risk} <span className="text-sm font-medium text-slate-400">คน</span></p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <p className="text-xs font-bold text-rose-600 mb-1">กลุ่มมีปัญหา</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{sdqCounts.problem} <span className="text-sm font-medium text-slate-400">คน</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAdd && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-teal-100 dark:border-teal-900/30">
                <div className="flex gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-zinc-700">
                  <button 
                    onClick={() => setRecordType("screening")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${recordType === 'screening' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500'}`}
                  >
                    <ShieldCheck size={16} /> 1. แบบคัดกรอง (คป.02)
                  </button>
                  <button 
                    onClick={() => setRecordType("home_visit")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${recordType === 'home_visit' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-900 text-slate-500'}`}
                  >
                    <HeartHandshake size={16} /> 2. บันทึกเยี่ยมบ้าน (คป.11)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ชั้นเรียน / แผนก</label>
                    <input type="text" placeholder="เช่น ปวช.1 ช่างยนต์" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500" value={newCare.classroom} onChange={e => setNewCare({...newCare, classroom: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">ชื่อ-สกุล นักเรียน</label>
                    <input type="text" placeholder="ชื่อ-สกุล" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500" value={newCare.studentName} onChange={e => setNewCare({...newCare, studentName: e.target.value})} />
                  </div>
                  
                  {recordType === 'screening' && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">ผลการคัดกรอง SDQ</label>
                      <select className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500 font-bold" value={newCare.sdqType} onChange={e => setNewCare({...newCare, sdqType: e.target.value})}>
                        <option value="normal">✅ กลุ่มปกติ (Normal)</option>
                        <option value="special">🌟 กลุ่มพิเศษ (Special/Gifted)</option>
                        <option value="risk">⚠️ กลุ่มเสี่ยง (At Risk)</option>
                        <option value="problem">🚨 กลุ่มมีปัญหา (Problematic)</option>
                      </select>
                    </div>
                  )}

                  {recordType === 'home_visit' && (
                    <>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">ข้อมูลที่อยู่ / สภาพที่พักอาศัย</label>
                        <textarea rows={2} placeholder="บ้านเลขที่, สภาพแวดล้อม..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 resize-none" value={newCare.address} onChange={e => setNewCare({...newCare, address: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">พิกัด GPS เยี่ยมบ้าน</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Lat, Lng" className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-100 dark:bg-zinc-900 cursor-not-allowed" value={newCare.gpsLat ? `${newCare.gpsLat}, ${newCare.gpsLng}` : ''} readOnly />
                          <button onClick={getLocation} className="shrink-0 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-200 transition-colors" title="ดึงพิกัดปัจจุบัน">
                            <MapPin size={20} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5">แนบรูปถ่ายเยี่ยมบ้าน (เลือกได้หลายรูป)</label>
                        <div className="grid grid-cols-4 gap-2">
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 group">
                              <img src={src} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)} 
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-[10px] w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group">
                            <Plus size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-[10px] font-bold text-slate-500 mt-1">เพิ่มรูป</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">บันทึกเพิ่มเติม / ข้อเสนอแนะ</label>
                    <textarea rows={2} placeholder="รายละเอียดเพิ่มเติม..." className="w-full p-3 border rounded-xl dark:bg-zinc-950 dark:border-zinc-700 text-sm focus:ring-2 focus:ring-teal-500 resize-none" value={newCare.notes} onChange={e => setNewCare({...newCare, notes: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleAdd} 
                    disabled={isUploading}
                    className={`px-8 py-3 rounded-xl text-sm font-black shadow-lg transition-all text-white flex items-center gap-2 ${recordType === 'home_visit' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'} ${isUploading ? 'opacity-75 cursor-not-allowed' : 'active:scale-95'}`}
                  >
                    {isUploading ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> กำลังบันทึก...</>
                    ) : (
                      <>บันทึกรายงาน{recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* List Records */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12 text-zinc-500 font-bold animate-pulse">กำลังโหลดข้อมูลระบบดูแลนักเรียน...</div>
              ) : records.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500 font-bold bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
                  ยังไม่มีประวัติการบันทึกดูแลนักเรียน
                </div>
              ) : (
                records.map((r: any) => (
                  <div key={r._id} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      {r.status === 'referred' ? (
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-rose-500 text-white shadow-md flex items-center gap-1">
                          <Send size={12} /> ส่งต่อ
                        </span>
                      ) : r.status === 'resolved' ? (
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-emerald-500 text-white shadow-md flex items-center gap-1">
                          <Check size={12} /> แก้ไขแล้ว
                        </span>
                      ) : null}
                    </div>

                    {/* Image / Header Area */}
                    <div className="h-40 bg-slate-100 dark:bg-zinc-900 relative">
                      {(r.imageUrls && r.imageUrls.length > 0) ? (
                        <>
                          <img src={r.imageUrls[0]} alt="Home Visit" className="w-full h-full object-cover" />
                          {r.imageUrls.length > 1 && (
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1">
                              <ImageIcon size={10} /> +{r.imageUrls.length - 1} รูป
                            </div>
                          )}
                        </>
                      ) : r.imageUrl ? (
                        <img src={r.imageUrl} alt="Home Visit" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                          {r.recordType === 'home_visit' ? <Camera size={32} /> : <ShieldCheck size={32} />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                        <p className="text-white font-black text-lg leading-tight">{r.studentName}</p>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-slate-500">{r.classroom}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                          {r.recordType === 'home_visit' ? 'เยี่ยมบ้าน' : 'คัดกรอง'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg border ${
                          r.sdqType === 'normal' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                          r.sdqType === 'special' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          r.sdqType === 'risk' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {r.sdqType === 'problem' && <AlertCircle size={14} />}
                          {r.sdqType === 'normal' ? 'ปกติ (Normal)' : r.sdqType === 'special' ? 'พิเศษ (Special)' : r.sdqType === 'risk' ? 'เสี่ยง (Risk)' : 'มีปัญหา (Problem)'}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-zinc-400 flex-1 line-clamp-3 mb-4">
                        {r.notes || "ไม่มีบันทึกเพิ่มเติม"}
                      </p>

                      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 mt-auto">
                        <div className="text-[10px] text-slate-400 font-bold">
                          ครู: {r.teacherName}<br/>
                          {new Date(r.visitDate).toLocaleDateString('th-TH')}
                        </div>
                        
                        {(r.sdqType === 'risk' || r.sdqType === 'problem') && r.status === 'active' && isAdmin && (
                          <button 
                            onClick={() => handleUpdateStatus(r._id, 'referred')}
                            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border border-rose-100 dark:border-rose-900"
                          >
                            <Send size={12} /> ส่งต่อ
                          </button>
                        )}
                        {r.status === 'referred' && isAdmin && (
                          <button 
                            onClick={() => handleUpdateStatus(r._id, 'resolved')}
                            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors border border-emerald-100 dark:border-emerald-900"
                          >
                            <Check size={12} /> แก้ไขแล้ว
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
