"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Upload,
  Send,
  Loader2,
  Info,
  Activity,
  User,
  Baby,
  Heart,
  Sun,
  Briefcase,
  MoreHorizontal,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
// Utility function for client-side image compression (with Safari/iOS fallback)
const compressImage = async (file: File): Promise<Blob | File> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => resolve(file); // Fallback: Use original if image fails to load
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(file); // Fallback: Canvas context fails

            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                resolve(blob || file);
              },
              "image/jpeg",
              0.7,
            );
          } catch (canvasErr) {
            console.error("Canvas compression failed, using original:", canvasErr);
            resolve(file); // Fallback on canvas error
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Compression startup failed, using original:", err);
      resolve(file); // Final Fallback
    }
  });
};

import { uploadFile } from "@/lib/upload";

const LEAVE_TYPES = [
  {
    id: "sick",
    label: "ลาป่วย",
    icon: Activity,
    color: "rose",
    desc: "Medical Leave",
  },
  {
    id: "personal",
    label: "ลากิจ",
    icon: User,
    color: "amber",
    desc: "Necessity",
  },
  {
    id: "paternity",
    label: "ลาช่วยภริยา",
    icon: Baby,
    color: "indigo",
    desc: "Support Family",
  },
  {
    id: "maternity",
    label: "ลาคลอด",
    icon: Heart,
    color: "pink",
    desc: "Motherhood",
  },
  {
    id: "ordination",
    label: "ลาบวช",
    icon: Sun,
    color: "orange",
    desc: "Spiritual",
  },
  {
    id: "official",
    label: "ราชการ",
    icon: Briefcase,
    color: "slate",
    desc: "Duty Call",
  },
  {
    id: "other",
    label: "อื่นๆ",
    icon: MoreHorizontal,
    color: "gray",
    desc: "General",
  },
];

export default function LeaveRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quotas, setQuotas] = useState<any>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  const [formData, setFormData] = useState({
    leaveType: "sick",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/attendance/leave/quota")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuotas(data.quotas);
      })
      .finally(() => setQuotaLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const requestedDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      return alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน (วันที่ และ เหตุผล)");
    }
    if (requestedDays <= 0) return alert("❌ วันเริ่มต้นต้องไม่เกินวันสิ้นสุด");

    setLoading(true);
    try {
      let attachmentUrl = null;
      if (file) attachmentUrl = await uploadFile(file, "leave_attachments");
      const res = await fetch("/api/attendance/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attachmentUrl }),
      });
      if (!res.ok) throw new Error("บันทึกข้อมูลล้มเหลว");
      setSuccess(true);
      setTimeout(() => router.push("/wfh"), 4000);
    } catch (err: any) {
      alert("❌ " + err.message);
      setLoading(false);
    }
  };

  if (quotaLoading) {
    return <FullPageLoader message="กำลังตรวจสอบสิทธิ์การลา..." subtitle="กรุณารอสักครู่ ระบบกำลังตรวจสอบโควตาการลาคงเหลือของคุณ" />;
  }

  if (loading) {
    return <FullPageLoader message="กำลังส่งคำขอลาของคุณ..." subtitle="กำลังอัปโหลดเอกสารแนบและบันทึกข้อมูลคำแจ้งลา" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center py-12 px-2 sm:px-8 selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      {/* 🔮 High-Fidelity Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-600/5 dark:bg-blue-600/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-600/5 dark:bg-rose-600/10 blur-[140px] rounded-full animate-pulse-slow" />
      </div>

      <div className="w-full max-w-5xl relative z-10 space-y-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-xl mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-emerald-500/20 p-8 md:p-12 rounded-3xl md:rounded-[3.5rem] text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40 relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                <CheckCircle2 size={48} className="relative z-10" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">
                ส่งใบลา <span className="text-emerald-500">สำเร็จ!</span>
              </h2>

              <div className="bg-slate-50 dark:bg-zinc-950/50 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 mb-10 border border-slate-100 dark:border-zinc-800 space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  <span>ประเภทการลา</span>
                  <span className="text-slate-900 dark:text-white text-xs">
                    {
                      LEAVE_TYPES.find((t) => t.id === formData.leaveType)
                        ?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  <span>จำนวนวัน</span>
                  <span className="text-slate-900 dark:text-white text-xs">
                    {requestedDays} วัน
                  </span>
                </div>
                <div className="pt-6 border-t border-dashed border-slate-200 dark:border-zinc-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                  <span>สถานะ</span>
                  <span className="px-5 py-2 bg-amber-500/10 text-amber-600 rounded-full text-[11px] border border-amber-500/20">
                    Processing
                  </span>
                </div>
              </div>

              <p className="text-slate-400 dark:text-zinc-500 font-bold mb-8 text-[11px] uppercase tracking-[0.4em] px-4">
                Returning you to portal in 3s...
              </p>
              <div className="w-full bg-emerald-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* 📊 Info Header */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 space-y-8"
              >
                <div className="space-y-6">
                  <Link
                    href="/wfh"
                    className="group flex items-center gap-4 w-fit"
                  >
                    <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 group-hover:text-blue-600 group-hover:border-blue-600/30 shadow-xl transition-all group-hover:-translate-x-1">
                      <ArrowLeft size={20} />
                    </div>
                  </Link>
                  <div className="pl-1">
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-4">
                      แจ้ง <span className="text-blue-600">ลางาน</span>
                    </h1>
                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
                      <Zap
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      Management v3.0
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-linear-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                    <ShieldCheck size={120} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">
                    Verification Flow
                  </h3>
                  <p className="text-sm font-bold leading-relaxed relative z-10">
                    ทุกการทำรายการจะผ่านการตรวจสอบแบบ Real-time
                    โดยฝ่ายบริหารงานบุคคล เพื่อความถูกต้องและโปร่งใสของข้อมูล
                  </p>
                </div>
              </motion.div>

              {/* 🛠️ Dynamic Form Flow */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-slate-200/50 dark:border-white/5 rounded-[3rem] shadow-3xl overflow-hidden"
              >
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-12">
                  {/* Step 1: Selection Grid */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/30">
                        1
                      </span>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic font-sans">
                        ประเภทการต้องการลา
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {LEAVE_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, leaveType: type.id })
                          }
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl md:rounded-4xl border-2 transition-all gap-3 group relative overflow-hidden ${formData.leaveType === type.id ? `bg-slate-900 border-slate-900 text-white shadow-2xl -translate-y-1` : `bg-slate-50 dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-white/10 opacity-70 hover:opacity-100`}`}
                        >
                          <type.icon
                            size={28}
                            className={`transition-all duration-500 ${formData.leaveType === type.id ? "scale-110 text-white" : `text-${type.color}-500 group-hover:scale-110`}`}
                          />
                          <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              {type.label}
                            </p>
                            <p
                              className={`text-[8px] font-bold uppercase opacity-50 tracking-tighter ${formData.leaveType === type.id ? "text-white" : ""}`}
                            >
                              {type.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Time Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-8 items-end">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/30">
                          2
                        </span>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                          กำหนดช่วงระยะเวลา
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                            <Calendar size={22} />
                          </div>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                startDate: e.target.value,
                              })
                            }
                            className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 dark:text-white font-black text-sm cursor-pointer shadow-inner appearance-none scheme-light-dark"
                            required
                          />
                          <span className="absolute top-0 right-6 -translate-y-1/2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-blue-500 tracking-widest shadow-xl">
                            ตั้งแต่วันที่
                          </span>
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                            <Calendar size={22} />
                          </div>
                          <input
                            type="date"
                            value={formData.endDate}
                            min={formData.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                endDate: e.target.value,
                              })
                            }
                            className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 dark:text-white font-black text-sm cursor-pointer shadow-inner appearance-none scheme-light-dark"
                            required
                          />
                          <span className="absolute top-0 right-6 -translate-y-1/2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-rose-500 tracking-widest shadow-xl">
                            ถึงวันที่
                          </span>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {requestedDays > 0 && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-slate-900 dark:bg-zinc-800 rounded-3xl md:rounded-[2.5rem] p-8 text-center relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform">
                            <Activity
                              size={80}
                              className="text-white dark:text-black"
                            />
                          </div>
                          <h4 className="text-6xl font-black text-white dark:text-black leading-none mb-1 font-mono tracking-tighter">
                            {requestedDays}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.3em]">
                            Total Days Request
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Step 3: Justification */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                        3
                      </span>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                        ระบุเหตุผลในการลา
                      </h3>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-6 top-7 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <FileText size={22} />
                      </div>
                      <textarea
                        value={formData.reason}
                        onChange={(e) =>
                          setFormData({ ...formData, reason: e.target.value })
                        }
                        rows={5}
                        className="w-full pl-16 pr-10 py-7 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-white/5 rounded-3xl md:rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-white font-bold text-sm leading-relaxed resize-none shadow-inner placeholder:text-slate-300 dark:placeholder:text-zinc-800"
                        placeholder="ระบุเหตุผลการลาของคุณโดยสังเขป..."
                        required
                      />
                    </div>
                  </div>

                  {/* Step 4: Documentary Proof */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/30">
                        4
                      </span>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                        หลักฐานประกอบโครงการ (ถ้ามี)
                      </h3>
                    </div>
                    <label className="flex flex-col items-center justify-center w-full min-h-[180px] border-4 border-dashed border-slate-100 dark:border-white/5 rounded-3xl md:rounded-[3rem] cursor-pointer bg-slate-50/50 dark:bg-zinc-950/20 hover:bg-white dark:hover:bg-zinc-900 transition-all group overflow-hidden relative shadow-inner">
                      {previewUrl ? (
                        <div className="w-full h-full absolute inset-0 p-4">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-[2.5rem]"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-black text-xs uppercase tracking-widest">
                              Tap to Replace Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                          <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-3xl shadow-xl group-hover:scale-110 transition-all">
                            <Upload className="w-8 h-8 text-indigo-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
                              Upload{" "}
                              <span className="text-indigo-500 font-black">
                                Digital Receipt
                              </span>
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-[0.2em]">
                              MAX 5MB • IMAGE ONLY
                            </p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-6 items-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-7 rounded-3xl md:rounded-[2.5rem] font-black flex items-center justify-center gap-5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl disabled:opacity-50 group overflow-hidden relative"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={28} />
                      ) : (
                        <>
                          <span className="uppercase tracking-[0.3em] text-sm">
                            ยืนยันและส่งใบลา
                          </span>
                          <Send
                            size={20}
                            className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>
    </div>
  );
}
