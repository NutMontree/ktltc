"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Phone,
  Command,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Layers,
  Info,
  MessageCircle,
  ShieldAlert,
  Building2,
} from "lucide-react";

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    studentIdNum: "",
    citizenId: "",
    email: "",
    phone: "",
    lineId: "",
    classGroupId: "",
    academicLevel: "ปวช 1",
    department: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation checks for empty fields
    if (!formData.name.trim()) return setErrorMsg("กรุณาระบุชื่อ-นามสกุลจริง");
    if (!formData.studentIdNum.trim()) return setErrorMsg("กรุณาระบุรหัสนักศึกษา");
    if (!formData.citizenId.trim()) return setErrorMsg("กรุณาระบุรหัสประจำตัวประชาชน");
    if (!formData.email.trim()) return setErrorMsg("กรุณาระบุอีเมล");
    if (!formData.phone.trim()) return setErrorMsg("กรุณาระบุเบอร์โทรศัพท์มือถือ");
    if (!formData.lineId.trim()) return setErrorMsg("กรุณาระบุไอดีไลน์ (LINE ID)");
    if (!formData.classGroupId.trim()) return setErrorMsg("กรุณาระบุรหัสกลุ่มเรียน");
    if (!formData.department) return setErrorMsg("กรุณาเลือกแผนกวิชาที่สังกัด");

    if (formData.citizenId.length !== 13 || isNaN(Number(formData.citizenId))) {
      return setErrorMsg("รหัสประจำตัวประชาชนต้องเป็นตัวเลข 13 หลักเท่านั้น");
    }
    if (formData.phone.length < 9 || isNaN(Number(formData.phone))) {
      return setErrorMsg("เบอร์โทรศัพท์มือถือต้องประกอบด้วยตัวเลขเท่านั้น");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          username: formData.studentIdNum.trim(),
          password: formData.phone.trim(),
          role: "student",
          department: formData.department,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setErrorMsg(data.error || "ไม่สามารถลงทะเบียนได้");
      }
    } catch (error) {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-blue-500/30">
      {/* Left Decoration Panel */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-zinc-950 border-r border-zinc-900 p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[90%] h-[90%] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[0%] right-[-20%] w-[70%] h-[70%] bg-emerald-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white/80 hover:text-white transition group"
          >
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition">
              <Command size={24} className="text-amber-400" />
            </div>
            <span className="font-bold text-xl tracking-wide uppercase">KTLTC Student Portal</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-20">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
            Student Account Registration
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter"
          >
            ยินดีต้อนรับ{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-emerald-400">
              นักเรียน นักศึกษา
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-zinc-400 text-base font-bold leading-relaxed space-y-2"
          >
            สมัครเข้าใช้ระบบงานสำหรับนักเรียน นักศึกษา วิทยาลัยเทคนิคกันทรลักษ์ เพื่อลงทะเบียนเรียน
            ปฏิบัติหน้าที่ และตรวจสอบประวัติทวิภาคี
          </motion.p>

          <div className="mt-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-start gap-3">
            <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-500 font-bold leading-relaxed">
              <strong className="text-zinc-300">ระบบเลื่อนชั้นเรียนอัตโนมัติ:</strong>
              <br />
              ระดับชั้นเรียนของนักศึกษาจะได้รับการเลื่อนอัตโนมัติเมื่อถึง{" "}
              <span className="text-amber-400">วันที่ 1 เมษายน ของทุกปี</span>{" "}
              และหากจบการศึกษาระบบจะปรับเปลี่ยนสถานะเป็น "จบการศึกษา" โดยอัตโนมัติ
            </div>
          </div>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="w-full md:w-7/12 flex flex-col justify-center p-6 sm:p-12 lg:px-24 relative bg-white dark:bg-zinc-950 overflow-y-auto">
        <div className="md:hidden flex items-center justify-center gap-3 mb-8 pt-4">
          <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/30">
            <Command size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tighter">
            KTLTC Student
          </span>
        </div>

        <div className="max-w-xl w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Student Signup
              </h2>
              <Link
                href="/login"
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-zinc-900 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
              >
                <ArrowLeft size={20} />
              </Link>
            </div>
            <p className="text-slate-500 dark:text-zinc-400 font-bold mb-8 text-lg">
              สมัครสมาชิกเข้าใช้ระบบ (สำหรับนักเรียน นักศึกษา เท่านั้น)
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 p-8 rounded-4xl text-center shadow-lg shadow-emerald-500/10"
            >
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mb-3">
                สมัครสมาชิกสำเร็จ!
              </h3>
              <p className="text-emerald-600/80 dark:text-emerald-300 font-bold mb-8 text-lg">
                ระบบได้รับการบันทึกข้อมูลเรียบร้อยแล้ว กำลังนำคุณไปหน้าเข้าสู่ระบบ...
              </p>
              <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold text-center"
                >
                  ⚠️ {errorMsg}
                </motion.div>
              )}

              {/* Login Info Tip Card */}
              <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-dashed border-amber-500/20 rounded-3xl flex gap-4 items-start mb-6">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                  <ShieldAlert size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 mb-1 leading-none">
                    ระบบบัญชีผู้ใช้เข้าเรียนแบบย่อ (Simplified Student Portal Login)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold leading-relaxed">
                    ระบบได้ยกเลิกช่องกรอก Username และรหัสผ่าน เพื่อป้องกันการสะกดผิดหรือลืมข้อมูล โดยตั้งค่าบัญชีดังนี้:
                    <br />
                    1. 🔑 <strong>ชื่อผู้ใช้งาน (User):</strong> จะใช้ <span className="text-amber-600 dark:text-amber-400 font-black">รหัสนักศึกษา</span> ที่ท่านกรอกด้านล่าง
                    <br />
                    2. 🔒 <strong>รหัสผ่าน (Password):</strong> จะใช้ <span className="text-amber-600 dark:text-amber-400 font-black">เบอร์โทรศัพท์มือถือ</span> ของท่าน
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ฝั่งซ้าย: ข้อมูลส่วนตัวพื้นฐาน */}
                <div className="space-y-6 col-span-1 border-r-0 md:border-r border-slate-100 dark:border-zinc-800/50 md:pr-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      ชื่อ-นามสกุลจริง
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="ชื่อ นามสกุล"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      เลขประจำตัวประชาชน (13 หลัก)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <CreditCard size={18} />
                      </div>
                      <input
                        type="text"
                        name="citizenId"
                        maxLength={13}
                        value={formData.citizenId}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="133xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      รหัสนักศึกษา
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="studentIdNum"
                        value={formData.studentIdNum}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="เช่น 66209010001"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ฝั่งขวา: ข้อมูลติดต่อนักเรียนและข้อมูลการเรียน */}
                <div className="space-y-6 col-span-1 md:pl-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      อีเมลผู้ติดต่อ
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="student@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      เบอร์โทรศัพท์มือถือ
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="08xxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      ไอดีไลน์ (LINE ID)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <MessageCircle size={18} />
                      </div>
                      <input
                        type="text"
                        name="lineId"
                        value={formData.lineId}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="ระบุไอดีไลน์ (LINE ID)"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      รหัสกลุ่มเรียน
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Layers size={18} />
                      </div>
                      <input
                        type="text"
                        name="classGroupId"
                        value={formData.classGroupId}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                        placeholder="ระบุรหัส เช่น 6932040001"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      แผนกวิชาที่สังกัด
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold shadow-sm hover:shadow-md cursor-pointer appearance-none"
                        required
                      >
                        <option value="">— เลือกแผนกวิชาของคุณ —</option>
                        {DEPARTMENT_GROUPS.find((g) => g.label === "5. แผนกวิชา")?.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                      ระดับชั้นปีการศึกษา
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <select
                        name="academicLevel"
                        value={formData.academicLevel}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-sm font-bold shadow-sm hover:shadow-md cursor-pointer appearance-none"
                        required
                      >
                        <option value="ปวช 1">ปวช. ปีที่ 1</option>
                        <option value="ปวช 2">ปวช. ปีที่ 2</option>
                        <option value="ปวช 3">ปวช. ปีที่ 3</option>
                        <option value="ปวส 1">ปวส. ปีที่ 1</option>
                        <option value="ปวส 2">ปวส. ปีที่ 2</option>
                      </select>
                    </div>
                  </div>

                  {/* ล็อคข้อมูลระบบ: ประเภทผู้เรียน และ สถานะ */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest pl-1 block">
                        ประเภทผู้เรียน
                      </label>
                      <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ทวิภาคี
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest pl-1 block">
                        สถานะนักศึกษา
                      </label>
                      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          กำลังศึกษา
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-6"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative flex items-center justify-center gap-3 bg-zinc-950 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                >
                  {!loading && (
                    <div className="absolute inset-0 bg-linear-to-r from-amber-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <span className="relative text-white dark:text-black group-hover:text-white flex items-center gap-2 transition-colors">
                    {loading ? (
                      <div className="h-5 w-5 border-2 border-slate-400 border-t-white dark:border-slate-500 dark:border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        สมัครสมาชิกนักเรียนนักศึกษา <ArrowRight size={18} />
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center border-t border-slate-100 dark:border-zinc-900 pt-6">
              <p className="text-slate-500 dark:text-zinc-400 text-sm font-bold">
                มีบัญชีนักศึกษาอยู่แล้ว?{" "}
                <Link
                  href="/login"
                  className="text-amber-500 font-bold hover:underline underline-offset-4 ml-1 transition-all"
                >
                  เข้าสู่ระบบทันที
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
