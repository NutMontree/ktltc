"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 font-sans p-4 sm:p-8">
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
          {/* Decorative Accent Gradient Line */}
          <div className="h-1.5 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-blue-500" />

          <div className="p-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 text-center">
              ลืมรหัสผ่าน?
            </h2>
            <p className="text-slate-500 dark:text-zinc-400 font-medium mb-8 text-center text-sm">
              กรุณากรอกอีเมลที่เชื่อมโยงกับบัญชีของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
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
                  <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl text-green-600 dark:text-green-400 text-sm font-bold text-center">
                    ✅ ส่งลิงก์ไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบในกล่องจดหมายของคุณ (หรือโฟลเดอร์ Junk/Spam)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">
                    📧 <strong>อีเมลของคุณ</strong>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 font-medium shadow-sm"
                      placeholder="กรอกอีเมล หรือชื่อผู้ใช้ (อีเมล)"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2"
                >
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          ส่งลิงก์รีเซ็ตรหัสผ่าน <ArrowRight size={18} />
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pt-4 flex justify-center"
              >
                <Link
                  href="/login"
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
                >
                  <ArrowLeft size={18} /> กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {!success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Link
              href="/login"
              className="text-slate-500 dark:text-zinc-400 text-sm font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
