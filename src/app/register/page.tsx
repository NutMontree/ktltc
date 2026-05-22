"use client";

import { useState, useEffect } from "react";
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
  MessageCircle,
  Command,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    lineId: "",
    department: "ไม่มีสังกัด",
    role: "teacher",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [regEnabled, setRegEnabled] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    fetch("/api/auth/register/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setRegEnabled(data.enabled);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setErrorMsg("รหัสผ่านไม่ตรงกัน");
    if (formData.password.length < 6) return setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
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
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-slate-900 border-r border-slate-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[90%] h-[90%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[0%] right-[-20%] w-[70%] h-[70%] bg-blue-500/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white/80 hover:text-white transition group"
          >
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition">
              <Command size={24} className="text-indigo-400" />
            </div>
            <span className="font-bold text-xl tracking-wide uppercase">KTLTC System</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter"
          >
            Join our{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
              admin network.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-lg font-medium leading-relaxed"
          >
            Register to access comprehensive academic and organizational tools. All registrations
            are subject to administrator approval to ensure secure access to sensitive data.
          </motion.p>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="w-full md:w-7/12 flex flex-col justify-center p-6 sm:p-12 lg:px-24 relative bg-white dark:bg-zinc-950 overflow-y-auto">
        <div className="md:hidden flex items-center justify-center gap-3 mb-8 pt-4">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Command size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tighter">
            KTLTC
          </span>
        </div>

        <div className="max-w-xl w-full mx-auto relative z-10">
          {checkingStatus ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-400">กำลังตรวจสอบสถานะการเปิดรับสมัคร...</p>
            </div>
          ) : !regEnabled ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/20 p-8 rounded-4xl text-center shadow-lg shadow-rose-500/5"
            >
              <div className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/30">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-rose-700 dark:text-rose-400 mb-3">
                ปิดรับสมัครสมาชิกชั่วคราว
              </h3>
              <p className="text-rose-600/80 dark:text-rose-300 font-medium mb-8 text-lg">
                ขณะนี้วิทยาลัยเทคนิคกันทรลักษ์ปิดระบบรับสมัครสมาชิกทั่วไปชั่วคราว หากท่านเป็นบุคลากรที่ต้องการลงทะเบียน กรุณาติดต่อผู้ดูแลระบบเพื่อขอเปิดสิทธิ์เป็นรายบุคคล
              </p>
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <ArrowLeft size={18} /> กลับสู่หน้าหลัก
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">Create Account</h2>
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-zinc-900 p-3 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeft size={20} />
                  </Link>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 font-medium mb-8 text-lg">
                  สมัครเพื่อจัดการข้อมูลระบบภายในวิทยาลัย
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
                  <p className="text-emerald-600/80 dark:text-emerald-300 font-medium mb-8 text-lg">
                    กรุณารอผู้ดูแลระบบอนุมัติบัญชีของคุณ ระบบกำลังนำคุณไปหน้าเข้าสู่ระบบ...
                  </p>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* สำหรับนักเรียน นักศึกษา */}
                  <div className="mb-6 p-4 bg-amber-500/10 dark:bg-amber-950/10 border border-amber-500/20 dark:border-amber-500/10 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-amber-500/5">
                    <div>
                      <h4 className="text-sm font-black text-amber-800 dark:text-amber-400">สำหรับนักเรียน นักศึกษา 🎓</h4>
                      <p className="text-xs text-amber-750 dark:text-zinc-400 font-bold mt-0.5">กรุณาใช้ช่องทางเฉพาะเพื่อกรอกข้อมูลเลขบัตรประชาชน ชั้นปี และกลุ่มเรียนทวิภาคี</p>
                    </div>
                    <Link
                      href="/register/student"
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-[0.95] flex items-center gap-1.5 shrink-0"
                    >
                      ลงทะเบียนนักศึกษา <ArrowRight size={14} />
                    </Link>
                  </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* รหัสและชื่ออักษร */}
                    <div className="space-y-6 col-span-1 border-r-0 md:border-r border-slate-100 dark:border-zinc-800/50 md:pr-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          ชื่อ-นามสกุลจริง
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                            placeholder="ชื่อ นามสกุล"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          ชื่อผู้ใช้งาน (EN)
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <User size={18} />
                          </div>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                            placeholder="เช่น somchai"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          รหัสผ่าน
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock size={18} />
                          </div>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md tracking-wide"
                            placeholder="ขั้นต่ำ 6 ตัวอักษร"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          ยืนยันรหัสผ่าน
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Lock size={18} />
                          </div>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-medium shadow-sm hover:shadow-md tracking-wide ${formData.confirmPassword && formData.password !== formData.confirmPassword ? "border-red-500 ring-red-500/20" : "border-slate-200 dark:border-zinc-800 focus:ring-indigo-500/10 focus:border-indigo-500"} placeholder:text-slate-400 dark:placeholder:text-zinc-600`}
                            placeholder="กรอกรหัสผ่านอีกครั้ง"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* ข้อมูลการติดต่อ */}
                    <div className="space-y-6 col-span-1 md:pl-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          อีเมล
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Mail size={18} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                            placeholder="name@gmail.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          เบอร์โทรศัพท์
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Phone size={18} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md"
                            placeholder="08xxxxxxxx"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          สังกัด / แผนกวิชา / สาขาวิชา
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <ShieldCheck size={18} />
                          </div>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-zinc-600 shadow-sm hover:shadow-md cursor-pointer appearance-none"
                            required
                          >
                            <option value="ไม่มีสังกัด">- ไม่ระบุสังกัด -</option>
                            <option value="ผู้บริหารสถานศึกษา">ผู้บริหารสถานศึกษา</option>
                            {DEPARTMENT_GROUPS.map((group) => (
                              <optgroup key={group.label} label={group.label}>
                                {group.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                          ประเภทผู้ใช้งาน (Role)
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <ShieldCheck size={18} />
                          </div>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold cursor-pointer appearance-none"
                            required
                          >
                            <option value="teacher">บุคลากร (Teacher / Staff)</option>
                            <option value="user">บุคคลภายนอก (General User)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-8"
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
                    >
                      {!loading && (
                        <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <span className="relative text-white dark:text-black group-hover:text-white flex items-center gap-2 transition-colors">
                        {loading ? (
                          <div className="h-5 w-5 border-2 border-slate-400 border-t-white dark:border-slate-500 dark:border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Create Account <ArrowRight size={18} />
                          </>
                        )}
                      </span>
                    </button>
                  </motion.div>
                </form>
              </>
            )}

            {!success && (
              <div className="mt-10 text-center border-t border-slate-100 dark:border-zinc-800 pt-8">
                <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium">
                  มีบัญชีแอดมินอยู่แล้ว?{" "}
                  <Link
                    href="/login"
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline underline-offset-4 ml-1 transition-all"
                  >
                    เข้าสู่ระบบทันที
                  </Link>
                </p>
              </div>
            )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
