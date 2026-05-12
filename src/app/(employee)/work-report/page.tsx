"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FullPageLoader from "@/components/FullPageLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Camera,
  X,
  Target,
  AlertTriangle,
  Lightbulb,
  Smile,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface Activity {
  id: string; // Unique ID for keys
  taskName: string;
  detail: string;
  status: "Completed" | "In Progress" | "Pending";
  startTime?: string;
  endTime?: string;
}

// Utility function for client-side image compression (with Safari/iOS fallback)
const compressImage = async (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onerror = () => resolve(base64Str); // Fallback: Use original if image fails to load
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
          if (!ctx) return resolve(base64Str); // Fallback: Canvas context fails

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        } catch (canvasErr) {
          console.error("Canvas compression failed, using original:", canvasErr);
          resolve(base64Str); // Fallback on canvas error
        }
      };
      img.src = base64Str;
    } catch (err) {
      console.error("Compression startup failed, using original:", err);
      resolve(base64Str); // Final Fallback
    }
  });
};

export default function WorkReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activities, setActivities] = useState<Activity[]>([
    { id: crypto.randomUUID(), taskName: "", detail: "", status: "Completed" },
  ]);
  const [summary, setSummary] = useState("");
  const [problems, setProblems] = useState("");
  const [plansNextDay, setPlansNextDay] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing report on load (only for today)
  useEffect(() => {
    const fetchReport = async () => {
      setFetching(true);
      setError(null);
      try {
        const res = await fetch(`/api/work-report?date=${date}`);
        const json = await res.json();
        if (json.success && json.data) {
          const report = json.data;
          setActivities(
            report.activities?.map((a: any) => ({
              ...a,
              id: a.id || crypto.randomUUID(),
            })) || [
              {
                id: crypto.randomUUID(),
                taskName: "",
                detail: "",
                status: "Completed",
              },
            ],
          );
          setSummary(report.summary || "");
          setProblems(report.problems || "");
          setPlansNextDay(report.plansNextDay || "");
          setImages(report.images || []);
        }
      } catch (err) {
        console.error("Fetch report error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchReport();
  }, [date]);

  const addActivity = () => {
    setActivities([
      {
        id: crypto.randomUUID(),
        taskName: "",
        detail: "",
        status: "Completed",
      },
      ...activities,
    ]);
  };

  const removeActivity = (index: number) => {
    if (activities.length === 1) return;
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
  };

  const updateActivity = (index: number, field: keyof Activity, value: string) => {
    const newActivities = [...activities];
    newActivities[index] = { ...newActivities[index], [field]: value };
    setActivities(newActivities);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setImages((prev) => [...prev, compressed]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNoActivities = activities.every((a) => !a.taskName.trim());
    const isNoSummary = !summary.trim();
    const isNoImages = images.length === 0;

    // Must have at least one thing to save
    if (isNoActivities && isNoSummary && isNoImages) {
      setError("กรุณาเพิ่มข้อมูลอย่างน้อย 1 อย่าง (ภารกิจ, สรุปผล หรือ รูปภาพ)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/work-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          activities: activities.map((a) => ({
            ...a,
            taskName:
              a.taskName.trim() ||
              (!isNoImages
                ? "รายงานผลด้วยรูปภาพ"
                : isNoSummary
                  ? "ไม่ได้ระบุ"
                  : "รายงานการปฏิบัติงาน"),
            detail: a.detail.trim() || "",
          })),
          summary: summary.trim() || "ไม่ได้ระบุ",
          problems: problems.trim() || "ไม่ได้ระบุ",
          plansNextDay: plansNextDay.trim() || "ไม่ได้ระบุ",
          images,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "บันทึกข้อมูลล้มเหลว");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.push("/wfh");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <FullPageLoader
        message="กำลังตรวจสอบข้อมูลเดิมของคุณ..."
        subtitle="กรุณารอสักครู่ ระบบกำลังดึงผลการบันทึกงานล่าสุด"
      />
    );
  }

  if (loading) {
    return (
      <FullPageLoader
        message="กำลังบันทึกข้อมูลรายงาน..."
        subtitle="กำลังอัปโหลดรูปภาพและบันทึกข้อมูลของคุณไปยังฐานข้อมูล"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-6 px-2 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <Link
              href="/wfh"
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 rounded-2xl text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900/30 transition-all shadow-sm active:scale-90"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none">
                รายงาน <span className="text-blue-600">การปฏิบัติงาน</span>
              </h1>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ระบุภารกิจหรือผลงานประจำวัน
              </p>
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-300 dark:text-zinc-700 shadow-sm">
            <HelpCircle size={22} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl py-6 px-4 shadow-sm overflow-hidden relative group transition-all hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="absolute top-0 right-0 py-6 px-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calendar size={80} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500" />
                  รายชื่อผู้ส่งรายงานในระบบ
                </label>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase">
                  {format(new Date(date), "EEEE, d MMMM yyyy", { locale: th })}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {fetching ? (
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl text-xs font-black animate-pulse uppercase tracking-widest">
                    <Loader2 size={16} className="animate-spin" />
                    กำลังดึงข้อมูล...
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                    กำลังใช้งาน
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Activities Section - Indigo Theme */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    ภารกิจหลัก (Activities)
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    รายละเอียดงานและผลการปฏิบัติงาน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={addActivity}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-black transition-all hover:bg-indigo-100 active:scale-95 border border-indigo-100 dark:border-indigo-900/30"
              >
                <Plus size={16} /> เพิ่มงาน
              </button>
            </div>
            <AnimatePresence mode="popLayout">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl py-6 px-2 shadow-sm space-y-6 relative group transition-all hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100 dark:hover:border-indigo-900/20"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-none flex items-start justify-between md:block">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="p-3 text-slate-300 dark:text-zinc-700 hover:text-rose-500 dark:hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 md:mt-4 md:mx-auto md:flex"
                        disabled={activities.length === 1}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-12 space-y-3">
                          <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest pl-1">
                            ชื่อกิจกรรม (ระบุหากไม่ได้ลงรูปถ่าย)
                          </label>
                          <input
                            type="text"
                            placeholder="พิมพ์ชื่อภารกิจของคุณ..."
                            value={activity.taskName}
                            onChange={(e) => updateActivity(index, "taskName", e.target.value)}
                            className="w-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl font-bold text-slate-800 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest pl-1">
                          สถานะความคืบหน้า
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          {(["Completed", "In Progress", "Pending"] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateActivity(index, "status", status)}
                              className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                activity.status === status
                                  ? status === "Completed"
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                    : status === "In Progress"
                                      ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30"
                                      : "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30"
                                  : "bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-600 hover:border-slate-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              {status === "Completed"
                                ? "สำเร็จ"
                                : status === "In Progress"
                                  ? "กำลังดำเนินการ"
                                  : "รอการดำเนินการ"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest pl-1">
                          รายละเอียดเชิงลึก (ถ้ามี)
                        </label>
                        <textarea
                          placeholder="อธิบายรายละเอียดการทำงานของคุณเพิ่มเติม..."
                          value={activity.detail}
                          onChange={(e) => updateActivity(index, "detail", e.target.value)}
                          rows={3}
                          className="w-full bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 text-sm font-medium text-slate-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none italic"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Section - Emerald Theme */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl py-6 px-2 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
          >
            <div className="absolute top-0 right-0 py-6 px-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText size={80} className="text-emerald-500" />
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Smile size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  สรุปภาพรวม (Summary)
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  สรุปความสำเร็จประจำวัน
                </p>
              </div>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
              placeholder="สรุปผลการทำงานในภาพรวมที่เกิดขึ้นในวันนี้..."
              className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-3xl py-6 px-2 text-sm font-medium text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none relative z-10 italic"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            {/* Problems - Rose Theme */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl py-6 px-2 shadow-sm group hover:shadow-xl hover:shadow-rose-500/5 transition-all "
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    ปัญหาที่พบ (Problems)
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    ปัญหาและอุปสรรคที่พบ
                  </p>
                </div>
              </div>
              <textarea
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                rows={4}
                placeholder="อุปสรรคหรือปัญหาที่เกิดขึ้น (ถ้ามี)..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-3xl py-6 px-2 text-sm font-medium text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              />
            </motion.div>

            {/* Next Day Plan - Amber Theme */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl py-6 px-2 shadow-sm group hover:shadow-xl hover:shadow-amber-500/5 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    แผนงานวันต่อไป (Next Day)
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    แผนงานที่ตั้งใจทำในวันพรุ่งนี้
                  </p>
                </div>
              </div>
              <textarea
                value={plansNextDay}
                onChange={(e) => setPlansNextDay(e.target.value)}
                rows={4}
                placeholder="สิ่งที่คุณต้องการจะทำให้สำเร็จในวันถัดไป..."
                className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-3xl py-6 px-2 text-sm font-medium text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
              />
            </motion.div>
          </div>

          {/* Image Upload Section - Blue Theme */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl py-6 px-2 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    เพิ่มรูปภาพประกอบ (Optional)
                  </h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    บันทึกภาพหลักฐานการทำงาน
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Plus size={16} /> เลือกรูปภาพ
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 dark:border-zinc-800"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`Work proof ${idx}`}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-blue-500 hover:border-blue-500/50 transition-all group"
                >
                  <Plus size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase">เพิ่มรูปภาพ</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-4xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all group"
              >
                <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-full text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                  <Camera size={32} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    คลิกหรือลากรูปภาพมาวางที่นี่
                  </p>
                  <p className="text-[10px] text-slate-300 mt-1">
                    รองรับไฟล์ JPG, PNG (สูงสุด 5MB ต่อไฟล์)
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 py-6 px-2 rounded-4xl text-sm font-black uppercase tracking-tight"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                  <AlertCircle size={22} />
                </div>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 py-6 px-4 rounded-2xl md:rounded-3xl text-sm font-black uppercase tracking-tight shadow-xl shadow-emerald-500/10"
              >
                <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={22} className="text-emerald-500" />
                </div>
                สำเร็จ! ระบบบันทึกข้อมูลรายงานเรียบร้อย
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || fetching}
              className="w-full h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out opacity-10" />
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-blue-500" size={28} />
                  <span className="animate-pulse">กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <Save size={28} className="group-hover:rotate-12 transition-transform" />
                  <span>ส่งรายงานการปฏิบัติงาน</span>
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-8">
              KTL by AllMaster System • v3.2026
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
