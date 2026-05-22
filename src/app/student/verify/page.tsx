"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  User,
  ShieldCheck,
  Building2,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
  Copy,
  Check,
  Fingerprint,
  Award,
  Sparkles,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  citizenId: string;
  academicLevel: string;
  department: string;
  classGroupId: string;
  studentStatus: string;
  learnerType: string;
  phone: string;
  email: string;
  image?: string | null;
}

export default function StudentVerifyPage() {
  const [searchMode, setSearchMode] = useState<"name" | "citizenId">("name");
  const [nameInput, setNameInput] = useState("");
  const [citizenIdInput, setCitizenIdInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [students, setStudents] = useState<Student[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Success states for individual copied values
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Flagpole attendance history states
  const [activeHistoryStudentId, setActiveHistoryStudentId] = useState<string | null>(null);
  const [flagpoleHistory, setFlagpoleHistory] = useState<any[] | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const toggleFlagpoleHistory = async (studentId: string) => {
    if (activeHistoryStudentId === studentId) {
      setActiveHistoryStudentId(null);
      return;
    }

    setActiveHistoryStudentId(studentId);
    setFlagpoleHistory(null);
    setIsHistoryLoading(true);

    try {
      const res = await fetch(`/api/student/verify/flagpole?studentId=${studentId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFlagpoleHistory(data.history);
      } else {
        toast.error(data.error || "ไม่สามารถโหลดประวัติการเข้าแถวได้");
      }
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Auto-format Citizen ID: X-XXXX-XXXXX-XX-X
  const handleCitizenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "");
    if (rawVal.length > 13) return;

    let formatted = rawVal;
    if (rawVal.length > 1) {
      formatted = `${rawVal.substring(0, 1)}-${rawVal.substring(1)}`;
    }
    if (rawVal.length > 5) {
      formatted = `${rawVal.substring(0, 1)}-${rawVal.substring(1, 5)}-${rawVal.substring(5)}`;
    }
    if (rawVal.length > 10) {
      formatted = `${rawVal.substring(0, 1)}-${rawVal.substring(1, 5)}-${rawVal.substring(5, 10)}-${rawVal.substring(10)}`;
    }
    if (rawVal.length > 12) {
      formatted = `${rawVal.substring(0, 1)}-${rawVal.substring(1, 5)}-${rawVal.substring(5, 10)}-${rawVal.substring(10, 12)}-${rawVal.substring(12)}`;
    }

    setCitizenIdInput(formatted);
  };

  const handleSearch = async (mode: "name" | "citizenId" = searchMode, customVal?: string) => {
    setErrorMsg("");
    setStudents(null);
    setHasSearched(false);

    let cleanName = "";
    let cleanId = "";

    if (customVal !== undefined) {
      if (mode === "name") cleanName = customVal.trim();
      if (mode === "citizenId") cleanId = customVal.replace(/[^0-9]/g, "");
    } else {
      cleanName = nameInput.trim();
      cleanId = citizenIdInput.replace(/[^0-9]/g, "");
    }

    // Validations
    if (mode === "name" && !cleanName) {
      setErrorMsg("กรุณากรอกชื่อ หรือ นามสกุลที่ต้องการค้นหา");
      return;
    }
    if (mode === "citizenId" && !cleanId) {
      setErrorMsg("กรุณากรอกเลขประจำตัวประชาชน 13 หลัก");
      return;
    }

    if (mode === "name" && cleanName.length < 2) {
      setErrorMsg("กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษรขึ้นไป");
      return;
    }

    if (mode === "citizenId" && cleanId.length !== 13) {
      setErrorMsg("รหัสประจำตัวประชาชนต้องมีความยาว 13 หลักเท่านั้น");
      return;
    }

    setIsLoading(true);

    try {
      const urlParams = new URLSearchParams();
      if (mode === "name") urlParams.append("name", cleanName);
      if (mode === "citizenId") urlParams.append("citizenId", cleanId);

      const res = await fetch(`/api/student/verify?${urlParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStudents(data.students);
        toast.success(`สืบค้นสำเร็จ! พบข้อมูลผู้เรียนจำนวน ${data.students.length} รายการ`, {
          icon: "🎓",
          style: {
            borderRadius: "20px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            color: "#1e293b",
            fontSize: "12px",
            fontWeight: "bold",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
          },
        });
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการตรวจสอบรายชื่อ");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleClear = () => {
    setNameInput("");
    setCitizenIdInput("");
    setErrorMsg("");
    setStudents(null);
    setHasSearched(false);
    toast.dismiss();
  };

  // Quick sandbox trigger to test the system effortlessly
  const handleQuickSandbox = (mode: "name" | "citizenId", value: string) => {
    setSearchMode(mode);
    if (mode === "name") {
      setNameInput(value);
      setCitizenIdInput("");
      handleSearch("name", value);
    } else {
      setCitizenIdInput(value);
      setNameInput("");
      handleSearch("citizenId", value);
    }
  };

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    toast.success(`คัดลอก ${label} สำเร็จ!`, {
      style: {
        borderRadius: "15px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        color: "#1e293b",
        fontSize: "11px",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      },
    });
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Real-time input validation checks for UX visual dot indicator
  const isNameInputValid = nameInput.trim().length >= 2;
  const isCitizenIdInputValid = citizenIdInput.replace(/[^0-9]/g, "").length === 13;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-slate-800 dark:text-zinc-100 py-12 px-4 relative overflow-hidden transition-colors duration-500">
      <Toaster position="bottom-right" reverseOrder={false} />

      {/* Custom Global Holographic and Cybernetic Styles */}
      <style>{`
        @keyframes holographic-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float-slow-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -30px) scale(1.08); }
        }
        @keyframes float-slow-2 {
          0%, 100% { transform: translate(0, 0) scale(1.03); }
          50% { transform: translate(-25px, 20px) scale(0.97); }
        }
        .cyber-grid {
          background-image: linear-gradient(rgba(15, 118, 110, 0.012) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(15, 118, 110, 0.012) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .holographic-badge {
          background: linear-gradient(115deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 30%, rgba(241,245,249,0.9) 45%, rgba(248,250,252,0.95) 60%, rgba(255,255,255,0.98) 100%);
          background-size: 200% auto;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .holographic-badge:hover {
          animation: holographic-shimmer 4s linear infinite;
        }
        .floating-orb-1 {
          animation: float-slow-1 12s ease-in-out infinite;
        }
        .floating-orb-2 {
          animation: float-slow-2 15s ease-in-out infinite;
        }
      `}</style>

      {/* Cyber Grid Pattern Background */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />

      {/* Floating Glowing Pastel Orbs */}
      <div className="absolute top-[8%] left-[8%] w-[400px] h-[400px] bg-blue-450/5 rounded-full blur-[110px] pointer-events-none floating-orb-1" />
      <div className="absolute bottom-[10%] right-[8%] w-[450px] h-[450px] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none floating-orb-2" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-400/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">
        {/* Dynamic Header Hero Section */}
        <div className="text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-655 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>KTLTC Central Directory Verification Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white"
          >
            ระบบยืนยันตัวตน{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-indigo-655 to-blue-500">
              นักเรียน นักศึกษา
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-550 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed"
          >
            สืบค้นข้อมูลระดับทะเบียนกลาง ยืนยันสถานะการเรียนระบบทวิภาคี แผนกวิชา
            และข้อมูลกลุ่มเรียนของวิทยาลัยเทคนิคกันทรลักษ์ ได้อย่างรวดเร็วและปลอดภัยสูงสุด
          </motion.p>
        </div>

        {/* Soft Iridescent Gradient Outline Wrapper (Frosted Light Crystal Glass Console) */}
        <div className="max-w-3xl mx-auto bg-linear-to-r from-blue-300 via-indigo-200 to-blue-200 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-900 p-[1.5px] rounded-[32px] shadow-[0_20px_50px_rgba(8,112,184,0.06)] dark:shadow-[0_20px_50px_rgba(8,112,184,0.12)] relative overflow-hidden group">
          {/* Biometric Laser Scanner Animation sweeps down when query is loading */}
          {isLoading && (
            <motion.div
              className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] z-20 pointer-events-none"
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: "linear",
              }}
            />
          )}

          <div className="bg-white/85 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[30.5px] p-6 md:p-8 relative">
            {/* Segmented Sliding Tabs Control (SaaS Style) */}
            <div className="flex bg-slate-100/70 dark:bg-zinc-800/70 p-1.5 rounded-[22px] max-w-lg mx-auto mb-8 border border-slate-200/50 dark:border-zinc-700/50 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setSearchMode("name");
                  setErrorMsg("");
                }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] text-xs font-black transition-all duration-350 relative cursor-pointer ${
                  searchMode === "name"
                    ? "text-blue-650 dark:text-blue-400 font-extrabold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {searchMode === "name" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 border border-slate-200/40 dark:border-zinc-600 shadow-md rounded-[18px]"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <User className="w-4 h-4 relative z-10" />
                <span className="relative z-10">ค้นหาด้วยชื่อ-นามสกุล</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchMode("citizenId");
                  setErrorMsg("");
                }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] text-xs font-black transition-all duration-350 relative cursor-pointer ${
                  searchMode === "citizenId"
                    ? "text-blue-650 dark:text-blue-400 font-extrabold"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }`}
              >
                {searchMode === "citizenId" && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white dark:bg-zinc-700 border border-slate-200/40 dark:border-zinc-600 shadow-md rounded-[18px]"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <ShieldCheck className="w-4 h-4 relative z-10" />
                <span className="relative z-10">ค้นหาด้วยเลขบัตรประชาชน</span>
              </button>
            </div>

            {/* Form Fields Section */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {searchMode === "name" ? (
                  <motion.div
                    key="name-panel"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      พิมพ์ชื่อ หรือนามสกุลผู้เรียน
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        placeholder="ป้อนคำสืบค้น เช่น สมชาย, รักเรียน, วิศวะ..."
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-50/50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                      />
                      <Search className="w-4 h-4 text-slate-400 group-focus-within/input:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />

                      {/* Real-time green glow check dot indicator */}
                      {isNameInputValid && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-450 font-semibold block leading-none pt-1">
                      💡 ระบบสนับสนุนการสืบค้นชื่อใกล้เคียง (ป้อนคำขั้นต่ำ 2 ตัวอักษร)
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="citizen-panel"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                      เลขประจำตัวประชาชน (13 หลัก)
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        placeholder="3-1205-XXXXX-XX-X"
                        value={citizenIdInput}
                        onChange={handleCitizenIdChange}
                        disabled={isLoading}
                        className="w-full bg-slate-50/50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono font-bold tracking-widest placeholder:font-sans placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                      />
                      <ShieldCheck className="w-4 h-4 text-slate-400 group-focus-within/input:text-blue-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />

                      {/* Real-time green glow check dot indicator */}
                      {isCitizenIdInputValid && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-450 font-semibold block leading-none pt-1">
                      🔒 ป้อนข้อมูลตัวเลขครบ 13 หลัก ระบบจะทำความสะอาดข้อมูลให้อัตโนมัติ
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PDPA secure small notice */}
              <div className="flex gap-2.5 items-start p-3.5 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 rounded-2xl text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>คุ้มครองข้อมูล PDPA:</strong> รายละเอียดที่มีความละเอียดอ่อนสูง เช่น
                  เลขประจำตัวประชาชน เบอร์โทรศัพท์ และอีเมลผู้เรียน จะถูกกรองและทำ Data Masking
                  ปิดบังข้อมูลเพื่อความปลอดภัย
                </span>
              </div>

              {/* Error alerts */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-2.5 text-xs font-black"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Redesigned Control buttons - Professional light style */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-stretch pt-5 border-t border-slate-100 dark:border-zinc-700 mt-6">
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading || (!nameInput && !citizenIdInput)}
                  className="w-full sm:w-1/3 py-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600! hover:border-rose-250 text-slate-700! dark:text-zinc-300 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-98 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>รีเซ็ต</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/search w-full sm:w-2/3 py-4 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white rounded-2xl text-xs sm:text-sm md:text-base font-black shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-indigo-500/25 border border-white/10 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>กำลังตรวจสอบฐานข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>เริ่มตรวจสอบรายชื่อ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ================= RESULTS & WELCOME GUIDE AREA ================= */}
        <div className="max-w-3xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {/* Case A: Welcoming Infographic Steps (SaaS Crystal Counter Style) */}
            {!isLoading && !hasSearched && (
              <motion.div
                key="welcome-guide"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1.5 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    คู่มือการใช้งานระบบสืบค้นด่วน
                  </span>
                  <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100">
                    3 ขั้นตอนง่าย ๆ ในการตรวจสอบรายชื่อผู้เรียน
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  {/* Step 1 Card */}
                  <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl p-5 shadow-[0_5px_15px_rgba(0,0,0,0.01)] flex flex-col items-center text-center space-y-3 group hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-350 relative overflow-hidden">
                    <span className="text-6xl font-black text-blue-500/5 group-hover:text-blue-555/10 transition-colors duration-500 absolute right-6 top-2 select-none font-mono">
                      01
                    </span>
                    <div className="w-10 h-10 bg-slate-55 text-blue-600 border border-slate-100 dark:border-zinc-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-none relative z-10">
                      1. เลือกรูปแบบค้นหา
                    </span>
                    <p className="text-[10px] text-slate-450 font-semibold leading-relaxed relative z-10">
                      กดเลือกแท็บเพื่อค้นหาด้วย "ชื่อ-นามสกุล" ของผู้เรียน หรือกรอกผ่าน
                      "เลขบัตรประชาชน 13 หลัก"
                    </p>
                  </div>

                  {/* Step 2 Card */}
                  <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl p-5 shadow-[0_5px_15px_rgba(0,0,0,0.01)] flex flex-col items-center text-center space-y-3 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-350 relative overflow-hidden">
                    <span className="text-6xl font-black text-blue-500/5 group-hover:text-blue-555/10 transition-colors duration-500 absolute right-6 top-2 select-none font-mono">
                      02
                    </span>
                    <div className="w-10 h-10 bg-slate-55 text-indigo-600 border border-slate-100 dark:border-zinc-700 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-none relative z-10">
                      2. ป้อนคีย์เวิร์ด
                    </span>
                    <p className="text-[10px] text-slate-450 font-semibold leading-relaxed relative z-10">
                      ป้อนข้อมูลที่ต้องการสืบค้นเข้าช่องกรอก
                      และตรวจทานตามเงื่อนไขความยาวเพื่อประสิทธิภาพสูงสุด
                    </p>
                  </div>

                  {/* Step 3 Card */}
                  <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl p-5 shadow-[0_5px_15px_rgba(0,0,0,0.01)] flex flex-col items-center text-center space-y-3 group hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-350 relative overflow-hidden">
                    <span className="text-6xl font-black text-blue-500/5 group-hover:text-blue-555/10 transition-colors duration-500 absolute right-6 top-2 select-none font-mono">
                      03
                    </span>
                    <div className="w-10 h-10 bg-slate-55 text-purple-600 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-100 leading-none relative z-10">
                      3. ดูใบยืนยันสิทธิ์
                    </span>
                    <p className="text-[10px] text-slate-450 font-semibold leading-relaxed relative z-10">
                      ระบบจะสร้างใบรับรองดิจิทัลแบบเรียลไทม์
                      พร้อมไฟบ่งบอกสถานภาพการศึกษาและระดับชั้นผู้เรียน
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Case B: Loading Skeleton Screen */}
            {isLoading && (
              <motion.div
                key="loading-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center py-6"
              >
                <div className="inline-flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                  <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                    กำลังตรวจสอบสถิติทะเบียนและเชื่อมฐานข้อมูล...
                  </span>
                </div>
                <div className="h-44 bg-slate-100/60 dark:bg-zinc-800/60 border border-slate-200/50 dark:border-zinc-700 rounded-3xl animate-pulse" />
              </motion.div>
            )}

            {/* Case C: Results Rendered as Digital Certificate Ivory Smartcards */}
            {!isLoading && hasSearched && students && students.length > 0 && (
              <motion.div
                key="results-found"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Result header summary */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-3.5">
                  <span className="text-sm font-black text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
                    ยืนยันสถานะความเป็นผู้เรียนสำเร็จ (พบข้อมูล {students.length} รายการ)
                  </span>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                    PDPA SECURED
                  </span>
                </div>

                <div className="grid gap-8">
                  {students.map((student) => {
                    const isVocational = student.academicLevel.includes("ปวช");
                    const isActiveStudent = student.studentStatus === "กำลังศึกษา";

                    return (
                      <div
                        key={student.id}
                        className="bg-linear-to-r from-blue-200 via-indigo-100 to-purple-100 p-[1.5px] rounded-[32px] shadow-lg relative overflow-hidden group/card"
                      >
                        <div
                          className={`holographic-badge rounded-[30.5px] p-6 relative overflow-hidden border ${
                            isActiveStudent ? "border-emerald-250/60" : "border-amber-250/60"
                          }`}
                        >
                          {/* Iridescent radial shine chip inside card */}
                          <div
                            className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-[65px] pointer-events-none opacity-20 ${
                              isActiveStudent ? "bg-emerald-450" : "bg-amber-450"
                            }`}
                          />

                          {/* Upper Certificate crest seal banner */}
                          <div className="flex items-center justify-between mb-5 border-b border-slate-200/80 dark:border-zinc-700 pb-3 text-xs relative z-10">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                              <Award className="w-3.5 h-3.5 text-slate-400" />
                              <span>Official Central Registry Record</span>
                            </div>

                            {/* Realistic Golden Microchip decal on smartcard */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-7 rounded-md bg-linear-to-br from-amber-400 via-amber-300 to-yellow-600 border border-amber-200/50 p-1 flex flex-col justify-between shrink-0 shadow-md shadow-amber-955/40 relative overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent animate-pulse" />
                                <div className="grid grid-cols-3 gap-px h-full w-full opacity-60">
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                  <div className="border border-amber-100/40 rounded-[1px]" />
                                </div>
                              </div>

                              {/* Pulsing Active indicator */}
                              <span
                                className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                  isActiveStudent
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_4px_12px_rgba(16,185,129,0.05)]"
                                    : "bg-amber-50 text-amber-600 border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.05)]"
                                }`}
                              >
                                {isActiveStudent ? (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                ) : (
                                  <span className="w-1.5 h-1.5 bg-amber-450 rounded-full" />
                                )}
                                {student.studentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Student credentials and details layout */}
                          <div className="flex flex-col md:flex-row gap-6 justify-between items-start relative z-10">
                            {/* Identity Details */}
                            <div className="flex gap-4.5 items-start">
                              {/* Profile credential avatar badge */}
                              <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center border shrink-0 relative shadow-inner overflow-hidden ${
                                  isVocational
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-indigo-50 text-indigo-650 border-indigo-205"
                                }`}
                              >
                                {student.image ? (
                                  <img
                                    src={student.image}
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <GraduationCap className="w-7 h-7" />
                                )}
                                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 text-white border border-slate-800 flex items-center justify-center text-[9px] font-black leading-none font-sans z-10">
                                  {isVocational ? "ช" : "ส"}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight flex items-center gap-2">
                                    {student.name}
                                  </h3>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                  {/* Level details tag */}
                                  <span
                                    className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                                      isVocational
                                        ? "bg-blue-50/50 text-blue-600 border-blue-200/50"
                                        : "bg-indigo-50/50 text-indigo-600 border-indigo-200/50"
                                    }`}
                                  >
                                    ระดับชั้น: {student.academicLevel}
                                  </span>

                                  {/* Learner Mode Tag */}
                                  <span className="text-[9px] font-bold bg-slate-50 text-slate-655 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                    รูปแบบ: {student.learnerType}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Academic department summary matrix & Secure digital barcode */}
                            <div className="w-full md:w-auto border-t md:border-t-0 border-slate-200 dark:border-zinc-700 pt-4 md:pt-0 flex md:flex-row gap-6 justify-between md:justify-end items-center">
                              {/* Digital Barcode Graphic */}
                              <div className="hidden sm:flex flex-col gap-0.5 opacity-25 hover:opacity-40 transition-opacity">
                                <div className="flex gap-[2px]">
                                  <div className="w-[2px] h-8 bg-slate-400" />
                                  <div className="w-px h-8 bg-slate-400" />
                                  <div className="w-[3px] h-8 bg-slate-400" />
                                  <div className="w-px h-8 bg-slate-400" />
                                  <div className="w-[2px] h-8 bg-slate-400" />
                                  <div className="w-[4px] h-8 bg-slate-400" />
                                  <div className="w-px h-8 bg-slate-400" />
                                </div>
                                <span className="text-[5px] font-mono tracking-widest text-slate-500 text-center select-none">
                                  ID_HASH
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:flex md:flex-col gap-4 text-right">
                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5">
                                    แผนกวิชา / สาขา
                                  </span>
                                  <span className="text-xs font-black text-slate-700 dark:text-zinc-200 flex items-center justify-end gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {student.department}
                                  </span>
                                </div>

                                <div>
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1.5">
                                    รหัสกลุ่มเรียนสังกัด
                                  </span>
                                  <span className="text-xs font-black text-slate-650 dark:text-zinc-300 flex items-center justify-end gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                    {student.classGroupId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lower: Contact and Masked Confidential details Capsules */}
                          <div className="mt-6 pt-4.5 border-t border-slate-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                            {/* Citizen ID Secure Tag */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-2xl group/btn hover:bg-slate-100/50 dark:hover:bg-zinc-700/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                  <span className="block text-[8px] font-bold text-slate-400 leading-none mb-0.5">
                                    รหัสบัธรประชาชน (PDPA)
                                  </span>
                                  <span className="text-[11px] font-bold font-mono tracking-wider text-slate-700 dark:text-zinc-200">
                                    {student.citizenId}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    student.citizenId,
                                    "เลขบัตรประชาชน",
                                    `${student.id}-citizen`,
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 rounded-lg transition-all cursor-pointer opacity-50 group-hover/btn:opacity-100"
                                title="คัดลอกรหัสประจำตัวประชาชน"
                              >
                                {copiedStates[`${student.id}-citizen`] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-455 dark:text-zinc-400" />
                                )}
                              </button>
                            </div>

                            {/* Phone Secure Tag */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-2xl group/btn hover:bg-slate-100/50 dark:hover:bg-zinc-700/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                  <span className="block text-[8px] font-bold text-slate-400 leading-none mb-0.5">
                                    เบอร์โทรศัพท์สำรอง
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-200">
                                    {student.phone}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    student.phone,
                                    "เบอร์โทรศัพท์",
                                    `${student.id}-phone`,
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-600 rounded-lg transition-all cursor-pointer opacity-50 group-hover/btn:opacity-100"
                                title="คัดลอกเบอร์โทรศัพท์"
                              >
                                {copiedStates[`${student.id}-phone`] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-455 dark:text-zinc-400" />
                                )}
                              </button>
                            </div>

                            {/* Email Secure Tag */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-2xl group/btn hover:bg-slate-100/50 dark:hover:bg-zinc-700/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="overflow-hidden">
                                  <span className="block text-[8px] font-bold text-slate-400 leading-none mb-0.5">
                                    อีเมลการเรียนทางการ
                                  </span>
                                  <span
                                    className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate block max-w-[150px]"
                                    title={student.email}
                                  >
                                    {student.email}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    student.email,
                                    "ที่อยู่อีเมล",
                                    `${student.id}-email`,
                                  )
                                }
                                className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-lg transition-all cursor-pointer opacity-50 group-hover/btn:opacity-100"
                                title="คัดลอกอีเมลสถาบัน"
                              >
                                {copiedStates[`${student.id}-email`] ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-slate-455" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Morning flagpole attendance history trigger button */}
                          <div className="mt-5 pt-5 border-t border-slate-200/80 flex flex-col gap-4 relative z-10">
                            <button
                              type="button"
                              onClick={() => toggleFlagpoleHistory(student.id)}
                              className="w-full py-3.5 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 border border-blue-100/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                            >
                              <Award className="w-4 h-4 text-blue-600 animate-pulse" />
                              <span>
                                {activeHistoryStudentId === student.id
                                  ? "ปิดประวัติการเข้าแถว"
                                  : "ดูประวัติการเข้าแถวตอนเช้า"}
                              </span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${activeHistoryStudentId === student.id ? "rotate-180" : ""}`}
                              />
                            </button>

                            {/* Collapsible History Section */}
                            <AnimatePresence>
                              {activeHistoryStudentId === student.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden space-y-3"
                                >
                                  {isHistoryLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-2.5">
                                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        กำลังดาวน์โหลดข้อมูลเข้าแถว...
                                      </span>
                                    </div>
                                  ) : flagpoleHistory && flagpoleHistory.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                      {flagpoleHistory.map((history) => {
                                        const isPresent =
                                          history.status === "Present" ||
                                          history.status === "ตรงเวลา";
                                        const isLate =
                                          history.status === "Late" || history.status === "สาย";
                                        const isLeave =
                                          history.status === "Leave" || history.status === "ลา";

                                        // Formatting Date beautifully
                                        const dateObj = new Date(history.date);
                                        const thaiDate = dateObj.toLocaleDateString("th-TH", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                        });

                                        // Formatting Time beautifully (Thai Local Time Zone)
                                        let formattedTime = "";
                                        if (history.time) {
                                          try {
                                            const timeDate = new Date(history.time);
                                            if (!isNaN(timeDate.getTime())) {
                                              formattedTime =
                                                timeDate.toLocaleTimeString("th-TH", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  hour12: false,
                                                }) + " น.";
                                            } else {
                                              formattedTime = history.time.includes("น.")
                                                ? history.time
                                                : `${history.time} น.`;
                                            }
                                          } catch (e) {
                                            formattedTime = history.time;
                                          }
                                        }

                                        return (
                                          <div
                                            key={history.id}
                                            className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-zinc-800/70 border border-slate-200/50 dark:border-zinc-700/50 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors gap-3"
                                          >
                                            <div className="flex items-center gap-3">
                                              {/* Check-in photo thumbnail with dynamic zoom hover */}
                                              {history.photoUrl ? (
                                                <div className="relative group/photo w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0">
                                                  <img
                                                    src={history.photoUrl}
                                                    alt="รูปภาพเช็คชื่อ"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-110 cursor-zoom-in"
                                                    onClick={() =>
                                                      window.open(history.photoUrl, "_blank")
                                                    }
                                                    title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
                                                  />
                                                </div>
                                              ) : (
                                                <div
                                                  className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-700 border border-slate-200/50 dark:border-zinc-600 flex items-center justify-center shrink-0 text-slate-350"
                                                  title="ไม่มีรูปภาพเช็คชื่อ"
                                                >
                                                  <User className="w-5 h-5" />
                                                </div>
                                              )}

                                              <div className="space-y-1 text-left">
                                                <span className="font-extrabold text-slate-700 dark:text-zinc-200 block">
                                                  {thaiDate}
                                                </span>
                                                {formattedTime && (
                                                  <span className="text-[10px] text-slate-450 font-bold block">
                                                    เวลาเช็คชื่อจริง: {formattedTime}{" "}
                                                    {history.address ? `| ${history.address}` : ""}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <span
                                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                isPresent
                                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                  : isLate
                                                    ? "bg-amber-50 text-amber-600 border-amber-200"
                                                    : isLeave
                                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                                      : "bg-rose-50 text-rose-600 border-rose-200"
                                              }`}
                                            >
                                              {isPresent
                                                ? "ตรงเวลา"
                                                : isLate
                                                  ? "สาย"
                                                  : isLeave
                                                    ? "ลากิจ/ป่วย"
                                                    : "ขาดแถว"}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 space-y-2 bg-slate-50/50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200/30 dark:border-zinc-700/30">
                                      <Info className="w-6 h-6 text-slate-350 mx-auto" />
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                                        ไม่พบประวัติการเข้าแถวของนักเรียนรายนี้
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Case D: Empty Result State */}
            {!isLoading && hasSearched && students && students.length === 0 && (
              <motion.div
                key="results-empty"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.02)] text-center space-y-4 max-w-lg mx-auto"
              >
                <div className="w-14 h-14 bg-rose-50 text-rose-500 border border-rose-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <HelpCircle className="w-7 h-7 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">
                    ไม่พบประวัติทะเบียนนักเรียน นักศึกษา
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold max-w-sm mx-auto">
                    ไม่พบผู้เรียนที่ตรงตามเกณฑ์กรอกข้อมูล กรุณาตรวจสอบการสะกดชื่อ-นามสกุล
                    หรือรูปแบบเลขบัตรประชาชน 13 หลักให้ถูกต้อง
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 dark:border-zinc-700 pt-4 max-w-xs mx-auto">
                  💡 คำแนะนำ: หากมั่นใจว่าข้อมูลถูกต้อง
                  กรุณาติดต่อฝ่ายงานส่งเสริมการศึกษา/งานทะเบียนวิทยาลัย
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
