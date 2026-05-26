"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Command,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  School,
  GraduationCap,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

async function recordActivity(data: { userName: string; action: string; details: string }) {
  try {
    await fetch("/api/admin/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsRegisterModalOpen(false);
      }
    };
    if (isRegisterModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRegisterModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        await recordActivity({
          userName: username || "Unknown User",
          action: "LOGIN_FAILED",
          details: `เข้าสู่ระบบไม่สำเร็จ: ${result.error}`,
        });

        let errorMessage = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        if (result.error.toLowerCase().includes("ยังรอการอนุมัติ")) {
          errorMessage = "บัญชีของคุณยังรอการอนุมัติจาก Super Admin";
        } else if (result.error.toLowerCase().includes("ไม่พบผู้ใช้งาน")) {
          errorMessage = "ไม่พบชื่อผู้ใช้นี้ในระบบ";
        }

        setError(errorMessage);
        setLoading(false);
      } else {
        await recordActivity({
          userName: username,
          action: "LOGIN",
          details: "เข้าสู่ระบบสำเร็จ",
        });
        setSuccess(true);
        router.refresh();

        // 1. ดึง callbackUrl จาก query parameters (ถ้ามี) เพื่อนำทางกลับหน้าเดิม
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl");

        // 2. ใช้ระบบ Polling เพื่อรอจนกว่า NextAuth Session จะได้รับการอัปเดตและมีข้อมูลสิทธิ์บทบาท (Role) ครบถ้วน
        let session = null;
        let role = "";
        let retries = 5;
        while (retries > 0) {
          session = await getSession();
          role = (session?.user as any)?.role?.toLowerCase() || "";
          if (role) break;
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries--;
        }

        // 3. นำทางผู้ใช้งานไปยังหน้าปลายทางที่ถูกต้องตามสิทธิ์และ callbackUrl (ใช้ window.location.href เพื่อบังคับให้ระบบรีเฟรช 1 ครั้งเพื่อแก้ไขปัญหาเซสชัน)
        if (role === "student") {
          if (callbackUrl && callbackUrl.startsWith("/student")) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/student/flagpole";
          }
        } else if (["super_admin", "admin"].includes(role)) {
          if (callbackUrl && !callbackUrl.startsWith("/login")) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          // สิทธิ์ปกติ (user)
          if (
            callbackUrl &&
            !callbackUrl.startsWith("/dashboard") &&
            !callbackUrl.startsWith("/manage-roles") &&
            !callbackUrl.startsWith("/attendance-")
          ) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/";
          }
        }
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-blue-500/30">
      {/* Left Decoration Panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-900 border-r border-slate-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-[-20%] w-[80%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600/30 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-white/80 hover:text-white transition group"
          >
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-white/20 transition">
              <Command size={24} className="text-blue-400" />
            </div>
            <span className="font-bold text-xl tracking-wide uppercase">ระบบจัดการ KTLTC</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter"
          >
            ยินดีต้อนรับกลับเข้าสู่{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">
              ระบบจัดการ
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-lg font-medium leading-relaxed"
          >
            ระบบจัดการที่ปลอดภัย รวดเร็ว และครอบคลุม ออกแบบมาเพื่อความเป็นเลิศในการดำเนินงาน
            เข้าสู่ระบบเพื่อจัดการเครื่องมือบริหารจัดการ
          </motion.p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-semibold tracking-wide"></div>
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="md:hidden flex items-center gap-3 mb-10 pb-6 border-b border-slate-200 dark:border-zinc-800">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Command size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl text-slate-800 dark:text-white uppercase tracking-tighter">
              KTLTC
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">เข้าสู่ระบบ</h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium mb-10 text-lg">
              กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </motion.div>

          <div>
            {/* Login Info Tip Card */}
            <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-dashed border-amber-500/20 rounded-3xl flex gap-4 items-start mb-6">
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
                <ShieldAlert size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 mb-1 leading-none">
                  ข้อกำหนดสำหรับ นักเรียน นักศึกษา
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold leading-relaxed">
                  ระบบกำหนดข้อมูลสำหรับการเข้าสู่ระบบบัญชีผู้ใช้ (สำหรับนักเรียน/นักศึกษา) ดังนี้:
                  <br />
                  1. 🔑 <strong>ชื่อผู้ใช้งาน (Username):</strong> รหัสนักศึกษา ที่ท่านกรอกด้านล่าง
                  <br />
                  2. 🔒 <strong>รหัสผ่าน (Password):</strong> เบอร์โทรศัพท์มือถือ ของท่าน
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold text-center">
                  &#9888; {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 font-medium shadow-sm hover:shadow-md"
                  placeholder="ชื่อผู้ใช้งาน หรือ เลขประจำตัวประชาชน 13 หลัก"
                  autoComplete="username"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 block">
                  รหัสผ่าน
                </label>
                <Link
                  // href="https://www.allmaster.store/contactus"
                  href="https://line.me/ti/p/p-xwfjMXJM"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors pr-1"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-4 bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 font-medium shadow-sm hover:shadow-md tracking-wide max-w-full"
                  placeholder="รหัสผ่าน หรือ เบอร์โทรศัพท์มือถือ"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={loading || success}
                className="w-full relative flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
              >
                {!loading && !success && (
                  <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <span className="relative text-white dark:text-black group-hover:text-white flex items-center gap-2 transition-colors">
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-slate-400 border-t-white dark:border-slate-500 dark:border-t-black rounded-full animate-spin" />
                  ) : success ? (
                    "เข้าสู่ระบบสำเร็จ!"
                  ) : (
                    <>
                      เข้าสู่ระบบ <ArrowRight size={18} />
                    </>
                  )}
                </span>
              </button>
            </motion.div>
          </form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center space-y-6"
          >
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm font-bold">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">
                  ยังไม่มีบัญชีใช่หรือไม่?
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20 text-xs font-bold"
                >
                  สมัครสมาชิก
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900/50">
                <p className="text-slate-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-3">
                  ต้องการความช่วยเหลือ?
                </p>
                <Link
                  href="https://line.me/ti/p/p-xwfjMXJM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] rounded-full text-xs font-bold transition-all border border-[#06C755]/20"
                >
                  <span className="w-2 h-2 bg-[#06C755] rounded-full animate-pulse" />
                  ติดต่อ ผู้ดูแลระบบ (Line ครูณัช)
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <Link
                href="/"
                className="text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors dark:text-zinc-500 dark:hover:text-white uppercase tracking-widest"
              >
                &larr; กลับหน้าหลัก
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Registration Choice Modal */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden z-10"
            >
              {/* Decorative Accent Gradient Line */}
              <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-amber-500" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      เลือกประเภทการสมัครสมาชิก
                    </h3>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium mt-1">
                      กรุณาเลือกประเภทบัญชีที่คุณต้องการสร้างในระบบ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Choices */}
                <div className="space-y-4">
                  {/* Option: Teacher */}
                  <Link
                    href="/register"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/30 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all hover:scale-[1.02] active:scale-[0.99] group shadow-xs"
                  >
                    <div className="p-3.5 bg-blue-100 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      <School size={26} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        สมัครสมาชิก ครู / บุคลากร
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5 leading-relaxed">
                        สำหรับครูผู้สอน หัวหน้างาน และเจ้าหน้าที่เพื่อเข้าใช้งานระบบบริหารจัดการ
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                    />
                  </Link>

                  {/* Option: Student */}
                  <Link
                    href="/register/student"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/30 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-900/50 transition-all hover:scale-[1.02] active:scale-[0.99] group shadow-xs"
                  >
                    <div className="p-3.5 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                      <GraduationCap size={26} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-base sm:text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                        <span>สมัครนักศึกษา</span>
                        <span className="text-sm">🎓</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5 leading-relaxed">
                        สำหรับนักเรียน นักศึกษา เพื่อรายงานตัว เช็คชื่อ และติดตามกิจกรรมต่างๆ
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all"
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
