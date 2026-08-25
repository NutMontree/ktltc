"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน หรือลิงก์ไม่ถูกต้อง");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("ลิงก์ไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="flex justify-center mb-8">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
          <Command size={28} className="text-white" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500" />

        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
            ตั้งรหัสผ่านใหม่
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 font-medium mb-8 text-center text-sm">
            กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </p>

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
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl text-green-600 dark:text-green-400 text-sm font-bold text-center flex flex-col items-center gap-2">
                  <CheckCircle2 size={24} className="text-green-500" />
                  <span>รีเซ็ตรหัสผ่านสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">
                  🔒 <strong>รหัสผ่านใหม่</strong>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"
                    required
                    disabled={!token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">
                  🔒 <strong>ยืนยันรหัสผ่านใหม่</strong>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                    required
                    disabled={!token}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <button
                  type="submit"
                  disabled={loading || !token || !newPassword || !confirmPassword}
                  className="w-full relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      เปลี่ยนรหัสผ่าน <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          )}
        </div>
      </motion.div>

      {(!token || error.includes("ลิงก์") || error.includes("หมดอายุ")) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link
            href="/forgot-password"
            className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
          >
            ขอลิงก์รีเซ็ตรหัสผ่านใหม่
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans p-4 sm:p-8">
      <Suspense fallback={<div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
