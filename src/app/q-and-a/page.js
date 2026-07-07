"use client";
import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  FiSend,
  FiMessageSquare,
  FiUser,
  FiEdit3,
  FiClock,
  FiCheckCircle,
  FiZap,
  FiHelpCircle,
} from "react-icons/fi";

export default function QAPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ guestName: "", subject: "", content: "" });
  const [mounted, setMounted] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions/public");
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim())
      return toast.error("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วนนะครับ");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/questions/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("ส่งคำถามเข้าสู่ระบบเรียบร้อยแล้ว!", {
          style: {
            borderRadius: "16px",
            background: "#1e293b",
            color: "#fff",
            fontFamily: "inherit",
          },
        });
        setForm({ guestName: "", subject: "", content: "" });
        fetchQuestions();
      } else {
        toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading)
    return (
      <div className="flex flex-col items-center justify-center max-w-[1600px] mx-auto bg-slate-50 dark:bg-zinc-950 font-sans">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold tracking-[0.2em] animate-pulse">
          กำลังโหลดฐานข้อมูล...
        </p>
      </div>
    );

  return (
    <div className=" font-sans selection:bg-cyan-100">
      <Toaster position="top-right" />

      <div className="relative z-10   mx-auto max-w-[1600px] py-10 md:py-16">
        {/* ส่วนหัว (Header) */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/40 dark:border-zinc-800/60 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="flex items-center gap-5">
              <div className="bg-linear-to-br from-slate-900 to-slate-800 dark:from-zinc-800 dark:to-zinc-900 p-4 rounded-2xl shadow-lg shadow-slate-300 dark:shadow-none border border-slate-700/50">
                <FiMessageSquare className="text-cyan-400 text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                  ระบบ
                  <span className="bg-linear-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">
                    {" "}
                    Q&A
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 font-bold text-xs mt-1 flex items-center gap-2 tracking-wide uppercase">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  ระบบรับฝากคำถามออนไลน์ - วท.กันทรลักษ์
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-zinc-950/50 px-5 py-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  สถานะเซิร์ฟเวอร์
                </p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                  เชื่อมต่อเสถียร
                </p>
              </div>
              <FiZap className="text-yellow-400 text-xl" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ส่วนแบบฟอร์ม (Form Side) */}
          <aside className="lg:col-span-5">
            <div className="sticky top-10">
              <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-2 rounded-2xl border border-white/50 dark:border-zinc-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/50 dark:border-zinc-800/50">
                  <div className="w-12 h-12 bg-linear-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                    <FiEdit3 size={22} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    สร้างคำร้องใหม่
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase ml-1">
                      <FiUser size={14} className="text-cyan-500" /> ชื่อผู้ส่ง
                      <span className="text-cyan-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ศิษย์เก่า KTLTC / ผู้ปกครอง"
                      className="w-full bg-slate-50/50 dark:bg-zinc-950/50 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                      required
                      value={form.guestName}
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      หัวข้อคำถาม <span className="text-cyan-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุเรื่องที่ต้องการสอบถาม..."
                      className="w-full bg-slate-50 dark:bg-zinc-900/50 text-slate-900 dark:text-slate-200 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 md:p-5 font-bold outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      รายละเอียด<span className="text-cyan-500">*</span>
                    </label>
                    <textarea
                      placeholder="กรอกรายละเอียดที่นี่..."
                      className="h-44 w-full bg-slate-900 dark:bg-zinc-950 text-white dark:text-slate-200 rounded-3xl p-5 md:p-6 font-medium outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all resize-none shadow-inner leading-relaxed placeholder:text-slate-500 dark:placeholder:text-zinc-700"
                      required
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full bg-linear-to-r from-cyan-600 to-blue-600 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      {isSubmitting ? (
                        "กำลังดำเนินการ..."
                      ) : (
                        <>
                          ส่งคำตอบ ↗
                          <FiSend className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="mt-10 p-6 bg-slate-50/50 dark:bg-zinc-950/50 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50 italic">
                  <div className="flex gap-3 items-start">
                    <FiHelpCircle className="text-cyan-500 mt-1 shrink-0" size={18} />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                      คำถามของคุณจะถูกส่งไปยังเจ้าหน้าที่ที่เกี่ยวข้องโดยตรง เราจะพยายามตอบภายใน
                      24-48 ชั่วโมง
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ส่วนรายการ (List Side) */}
          <main className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 mb-6 px-2 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md p-4 rounded-3xl border border-white/40 dark:border-zinc-800/40 w-max">
              <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-xl">
                <FiClock className="text-cyan-600 dark:text-cyan-400 text-xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight pr-4">
                รายการล่าสุด
              </h2>
            </div>

            {questions.length === 0 ? (
              <div className="py-24 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-[3rem]">
                <p className="text-slate-300 dark:text-zinc-600 font-bold uppercase tracking-widest text-sm">
                  ยังไม่มีข้อมูลในระบบ
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {questions.map((q) => (
                  <div
                    key={q._id}
                    className="group relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-2 border border-white/60 dark:border-zinc-800/80 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-100 dark:border-zinc-800/50 pb-6">
                      <span
                        className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest 
                        ${q.answer ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"}`}
                      >
                        {q.answer ? "ดำเนินการแล้ว" : "กำลังรอตรวจสอบ"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1 rounded-lg">
                        📅{" "}
                        {new Date(q.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="space-y-5">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-cyan-600 group-hover:to-blue-600 dark:group-hover:from-cyan-400 dark:group-hover:to-blue-400 transition-all duration-300">
                        {q.subject}
                      </h3>
                      <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 w-max px-3 py-1.5 rounded-xl border border-slate-100 dark:border-zinc-700/50">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                        ผู้ส่ง: {q.guestName || "ผู้ใช้งานทั่วไป"}
                      </p>
                      <div className="bg-slate-900 dark:bg-zinc-950 text-slate-100 dark:text-slate-200 p-4 rounded-2xl font-medium leading-relaxed shadow-inner shadow-black/10">
                        {q.content}
                      </div>
                    </div>

                    {q.answer && (
                      <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-cyan-100 dark:bg-cyan-900/40 p-2 rounded-xl">
                            <FiCheckCircle className="text-cyan-600 dark:text-cyan-400 text-lg" />
                          </div>
                          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-950/30 px-3 py-1 rounded-lg">
                            ตอบโดย ({q.repliedBy})
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium bg-linear-to-br from-cyan-50/80 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/10 p-6 rounded-3xl border-l-4 border-cyan-400 dark:border-cyan-600 whitespace-pre-wrap leading-relaxed shadow-sm">
                          {q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
