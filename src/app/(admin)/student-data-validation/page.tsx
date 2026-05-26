"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Send,
  X,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  GraduationCap,
  Building2,
} from "lucide-react";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import toast from "react-hot-toast";

const ALLOWED_ROLES = ["super_admin", "admin", "hr"];

interface ValidationResult {
  id: string;
  name: string;
  citizenId: string;
  studentId: string;
  classGroupId: string;
  department: string;
  academicLevel: string;
  studentStatus: string;
  email: string;
  hasErrors: boolean;
  errors: string[];
}

interface ValidationSummary {
  total: number;
  valid: number;
  withErrors: number;
}

export default function StudentDataValidationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = ((session?.user as any)?.role || "").toLowerCase();

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  // Redirect if not allowed
  useEffect(() => {
    if (status === "loading") return;
    if (!session || !ALLOWED_ROLES.includes(userRole)) {
      router.replace("/login");
    }
  }, [status, session, userRole, router]);

  const academicDepts = DEPARTMENT_GROUPS.find((g) => g.label.includes("แผนกวิชา"))?.options || [];

  const validateStudents = async () => {
    setIsLoading(true);
    setErrorMsg("");
    setValidationResults([]);
    setSummary(null);
    setHasValidated(false);
    setSelectedStudents(new Set());

    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append("department", selectedDept);

      const res = await fetch(`/api/admin/student-validation?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setValidationResults(data.students);
        setSummary(data.summary);
        setHasValidated(true);
        toast.success(`ตรวจสอบข้อมูลเรียบร้อย พบนักเรียนทั้งหมด ${data.summary.total} คน`);
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด");
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      toast.error("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const selectAllWithErrors = () => {
    const studentsWithErrors = validationResults
      .filter((s) => s.hasErrors)
      .map((s) => s.id);
    setSelectedStudents(new Set(studentsWithErrors));
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const sendNotifications = async () => {
    if (selectedStudents.size === 0) {
      toast.error("กรุณาเลือกนักเรียนอย่างน้อย 1 คน");
      return;
    }

    setIsSendingNotification(true);
    try {
      const res = await fetch("/api/admin/notify-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message);
        clearSelection();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      toast.error("ไม่สามารถส่งการแจ้งเตือนได้");
    } finally {
      setIsSendingNotification(false);
    }
  };

  const studentsWithErrors = validationResults.filter((s) => s.hasErrors);
  const validStudents = validationResults.filter((s) => !s.hasErrors);

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
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 dark:text-zinc-100 leading-none">
                ตรวจสอบข้อมูลนักเรียน
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                ระบบตรวจสอบความถูกต้องของข้อมูลส่วนตัว
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Filter Panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> ตัวกรองข้อมูล
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                แผนกวิชา
              </label>
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-8"
                >
                  <option value="">— ทุกแผนกวิชา —</option>
                  {academicDepts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                &nbsp;
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={validateStudents}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-black transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  {isLoading ? "กำลังตรวจสอบ..." : "เริ่มตรวจสอบ"}
                </button>
                {hasValidated && (
                  <button
                    type="button"
                    onClick={validateStudents}
                    className="p-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-zinc-400 transition-all cursor-pointer"
                    title="รีเฟรช"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Bar */}
        <AnimatePresence>
          {hasValidated && summary && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { label: "นักเรียนทั้งหมด", value: summary.total, icon: Users, color: "blue" },
                { label: "ข้อมูลถูกต้อง", value: summary.valid, icon: CheckCircle2, color: "emerald" },
                { label: "ข้อมูลผิด/ไม่ครบ", value: summary.withErrors, icon: AlertTriangle, color: "rose" },
                { label: "เลือกส่งแจ้งเตือน", value: selectedStudents.size, icon: Send, color: "amber" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-${color}-50 dark:bg-${color}-950/30 text-${color}-600 dark:text-${color}-400`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-800 dark:text-zinc-100 leading-none">{value}</div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar for Notifications */}
        <AnimatePresence>
          {hasValidated && studentsWithErrors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
                  พบนักเรียนที่ข้อมูลไม่ครบถ้วน {studentsWithErrors.length} คน
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllWithErrors}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  เลือกทั้งหมดที่ผิด
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  ยกเลิกการเลือก
                </button>
                <button
                  type="button"
                  onClick={sendNotifications}
                  disabled={selectedStudents.size === 0 || isSendingNotification}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSendingNotification ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  ส่งแจ้งเตือน ({selectedStudents.size})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && hasValidated && (
          <AnimatePresence mode="wait">
            {validationResults.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-black text-slate-500 dark:text-zinc-400">
                  ไม่พบข้อมูลนักเรียน
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Students with errors */}
                {studentsWithErrors.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      นักเรียนที่ข้อมูลไม่ครบถ้วน ({studentsWithErrors.length} คน)
                    </h3>
                    <div className="space-y-2">
                      {studentsWithErrors.map((student) => (
                        <div
                          key={student.id}
                          className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 transition-all ${
                            selectedStudents.has(student.id)
                              ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
                              : "border-slate-200 dark:border-zinc-800"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="mt-1 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="text-sm font-black text-slate-800 dark:text-zinc-100">
                                  {student.name}
                                </h4>
                                <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md">
                                  {student.errors.length} ข้อผิดพลาด
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                <div className="text-[10px]">
                                  <span className="font-bold text-slate-500 dark:text-zinc-400">รหัสบัตร:</span>
                                  <span className="ml-1 text-slate-700 dark:text-zinc-200">{student.citizenId}</span>
                                </div>
                                <div className="text-[10px]">
                                  <span className="font-bold text-slate-500 dark:text-zinc-400">รหัสนักศึกษา:</span>
                                  <span className="ml-1 text-slate-700 dark:text-zinc-200">{student.studentId}</span>
                                </div>
                                <div className="text-[10px]">
                                  <span className="font-bold text-slate-500 dark:text-zinc-400">รหัสกลุ่ม:</span>
                                  <span className="ml-1 text-slate-700 dark:text-zinc-200">{student.classGroupId}</span>
                                </div>
                                <div className="text-[10px]">
                                  <span className="font-bold text-slate-500 dark:text-zinc-400">แผนก:</span>
                                  <span className="ml-1 text-slate-700 dark:text-zinc-200">{student.department}</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {student.errors.map((error, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[10px] text-rose-600 dark:text-rose-400">
                                    <X className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid students */}
                {validStudents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      นักเรียนที่ข้อมูลถูกต้อง ({validStudents.length} คน)
                    </h3>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 text-center">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        ข้อมูลของนักเรียน {validStudents.length} คนถูกต้องครบถ้วน
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Welcome Prompt */}
        {!hasValidated && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-700 dark:text-zinc-200">
                ตรวจสอบข้อมูลนักเรียน
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium max-w-xs mx-auto">
                เลือกแผนกวิชาแล้วกด "เริ่มตรวจสอบ" เพื่อตรวจสอบความถูกต้องของข้อมูลส่วนตัว
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
