"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bell,
  Users,
  Building2,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import { UserRoles } from "@/models/User";
import toast from "react-hot-toast";

const ALLOWED_ROLES = ["super_admin"];

export default function BroadcastNotificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = ((session?.user as any)?.role || "").toLowerCase();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAll, setTargetAll] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  // Redirect if not allowed
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !ALLOWED_ROLES.includes(userRole)) {
      router.replace("/login");
    }
  }, [status, session, userRole, router]);

  const allDepartments = DEPARTMENT_GROUPS.flatMap((group) => group.options);

  const toggleDepartment = (dept: string) => {
    const newSelection = new Set(selectedDepartments);
    if (newSelection.has(dept)) {
      newSelection.delete(dept);
    } else {
      newSelection.add(dept);
    }
    setSelectedDepartments(newSelection);
  };

  const toggleRole = (role: string) => {
    const newSelection = new Set(selectedRoles);
    if (newSelection.has(role)) {
      newSelection.delete(role);
    } else {
      newSelection.add(role);
    }
    setSelectedRoles(newSelection);
  };

  const selectAllDepartments = () => {
    setSelectedDepartments(new Set(allDepartments.map((d) => d.value)));
  };

  const clearDepartments = () => {
    setSelectedDepartments(new Set());
  };

  const selectAllRoles = () => {
    setSelectedRoles(new Set(UserRoles));
  };

  const clearRoles = () => {
    setSelectedRoles(new Set());
  };

  const estimateRecipients = async () => {
    if (targetAll) {
      setPreviewCount(null);
      return;
    }

    if (selectedDepartments.size === 0 && selectedRoles.size === 0) {
      setPreviewCount(0);
      return;
    }

    try {
      const res = await fetch("/api/admin/broadcast-notification/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDepartments: Array.from(selectedDepartments),
          targetRoles: Array.from(selectedRoles),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewCount(data.count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    estimateRecipients();
  }, [selectedDepartments, selectedRoles, targetAll]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("กรุณากรอกหัวข้อและข้อความ");
      return;
    }

    if (!targetAll && selectedDepartments.size === 0 && selectedRoles.size === 0) {
      toast.error("กรุณาเลือกกลุ่มเป้าหมาย");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/broadcast-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          targetAll,
          targetDepartments: Array.from(selectedDepartments),
          targetRoles: Array.from(selectedRoles),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message);
        setTitle("");
        setMessage("");
        setTargetAll(false);
        setSelectedDepartments(new Set());
        setSelectedRoles(new Set());
        setPreviewCount(null);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      toast.error("ไม่สามารถส่งการแจ้งเตือนได้");
    } finally {
      setIsSending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 dark:text-zinc-100 leading-none">
                ส่งข้อความแจ้งเตือนทั่วทั้งระบบ
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                ส่งข้อความถึงผู้ใช้ตามแผนก/บทบาทที่เลือก
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Message Form */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
            <Send className="w-3.5 h-3.5" /> เนื้อหาข้อความ
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                หัวข้อข้อความ *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุหัวข้อข้อความที่ต้องการส่ง..."
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                เนื้อหาข้อความ *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ระบุเนื้อหาข้อความที่ต้องการส่ง..."
                rows={6}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Target Selection */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> กลุ่มเป้าหมาย
          </h2>

          {/* Send to All */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl">
            <input
              type="checkbox"
              checked={targetAll}
              onChange={(e) => {
                setTargetAll(e.target.checked);
                if (e.target.checked) {
                  setSelectedDepartments(new Set());
                  setSelectedRoles(new Set());
                }
              }}
              className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                ส่งถึงผู้ใช้ทุกคนในระบบ
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400">
                ข้อความจะถูกส่งไปยังผู้ใช้ทุกบทบาทและทุกแผนก
              </p>
            </div>
          </div>

          {!targetAll && (
            <>
              {/* Department Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    แผนก/งาน
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllDepartments}
                      className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={clearDepartments}
                      className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar p-1">
                  {allDepartments.map((dept) => (
                    <label
                      key={dept.value}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedDepartments.has(dept.value)
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700"
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDepartments.has(dept.value)}
                        onChange={() => toggleDepartment(dept.value)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 truncate">
                        {dept.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    บทบาท
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllRoles}
                      className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      เลือกทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={clearRoles}
                      className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-all cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {UserRoles.map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedRoles.has(role)
                          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700"
                          : "bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.has(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 capitalize">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Preview Count */}
        <AnimatePresence>
          {previewCount !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 flex items-center gap-3"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                  จำนวนผู้รับที่คาดว่า: {previewCount} คน
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">
                  {targetAll ? "ส่งถึงผู้ใช้ทุกคนในระบบ" : `เลือกแผนก ${selectedDepartments.size} แห่ง, บทบาท ${selectedRoles.size} บทบาท`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim() || (!targetAll && selectedDepartments.size === 0 && selectedRoles.size === 0)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                ส่งข้อความแจ้งเตือน
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
