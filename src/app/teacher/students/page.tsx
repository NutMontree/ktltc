"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  Building2,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  BookOpen,
  LayoutDashboard,
  ArrowLeft,
  UserCheck,
  UserX,
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  Edit,
} from "lucide-react";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import Link from "next/link";

import PageHelpModal from "@/components/PageHelpModal";

const ALLOWED_ROLES = ["super_admin", "admin", "editor", "teacher"];

interface Student {
  id: string;
  name: string;
  studentId: string;
  citizenId: string;
  academicLevel: string;
  department: string;
  classGroupId: string;
  studentStatus: string;
  learnerType: string;
  image: string | null;
  phone: string | null;
  email: string | null;
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
} as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
} as const;

export default function TeacherStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = (session?.user?.role || "").toLowerCase();
  const userDept = session?.user?.department || "";
  const isTeacher = userRole === "teacher";

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [students, setStudents] = useState<Student[]>([]);
  const [classGroups, setClassGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [permissions, setPermissions] = useState<any>(null);
  const [isPermsLoading, setIsPermsLoading] = useState(true);

  // Redirect if not allowed
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/login");
      return;
    }

    fetch("/api/auth/permissions")
      .then((res) => res.json())
      .then((data) => {
        const perms = data || {};
        if (
          userRole === "super_admin" || 
          ALLOWED_ROLES.includes(userRole) || 
          perms.access_teacher_students ||
          perms.access_teacher_workspace
        ) {
          setPermissions(perms);
          setIsPermsLoading(false);
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [status, session, userRole, router]);

  // Auto-select department for teachers
  useEffect(() => {
    if (isTeacher && userDept && !selectedDept) {
      setSelectedDept(userDept);
    }
  }, [isTeacher, userDept, selectedDept]);

  const academicDepts = useMemo(() => {
    const group = DEPARTMENT_GROUPS.find((g) => g.label.includes("แผนกวิชา"));
    return group ? group.options : [];
  }, []);

  const fetchStudents = async (dept?: string, group?: string) => {
    const deptToUse = dept ?? selectedDept;
    if (!deptToUse) {
      setErrorMsg("กรุณาเลือกแผนกวิชาก่อน");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    setStudents([]);
    setHasFetched(false);

    try {
      const params = new URLSearchParams({ department: deptToUse });
      const groupToUse = group ?? selectedGroup;
      if (groupToUse) params.append("classGroupId", groupToUse);

      const res = await fetch(`/api/teacher/students?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStudents(data.students);
        setClassGroups(data.classGroups || []);
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  // Filtered students by name search
  const filtered = useMemo(() => {
    if (!searchName.trim()) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [students, searchName]);

  // Group by classGroupId
  const grouped = useMemo(() => {
    const map: Record<string, Student[]> = {};
    for (const s of filtered) {
      const key = s.classGroupId || "ไม่ระบุกลุ่ม";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, "th"));
  }, [filtered]);

  const activeCount = students.filter((s) => s.studentStatus === "กำลังศึกษา").length;

  if (status === "loading" || isPermsLoading) {
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
        <div className="max-w-[1600px] mx-auto w-full px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-500 dark:text-zinc-400"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800 dark:text-zinc-100 leading-none">
                  รายชื่อนักเรียน
                </h1>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                  ระบบตรวจสอบรายชื่อประจำแผนก
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PageHelpModal 
              title="วิธีใช้งานหน้ารายชื่อนักเรียน"
              description="คู่มือการค้นหาและตรวจสอบรายชื่อ"
              overview="หน้านี้คือสมุดรายชื่อ (Directory) สำหรับให้คุณครูและบุคลากรเข้ามาตรวจสอบรายชื่อนักเรียนในแผนกวิชาหรือกลุ่มเรียนต่างๆ โดยจะแสดงข้อมูลพื้นฐาน เช่น ชื่อ สถานะการศึกษา และข้อมูลการติดต่อ เพื่อใช้ในการบริหารจัดการชั้นเรียน"
              steps={[
                { title: "1. เลือกแผนกวิชา", content: "เลือกแผนกวิชาที่คุณต้องการดูรายชื่อนักเรียนจากตัวกรองด้านบน" },
                { title: "2. เลือกกลุ่มเรียน (ถ้ามี)", content: "สามารถระบุกลุ่มเรียนเพื่อดูเฉพาะนักเรียนในกลุ่มนั้นได้" },
                { title: "3. ค้นหาชื่อ", content: "พิมพ์ชื่อนักเรียนในช่องค้นหา เพื่อค้นหานักเรียนแบบเฉพาะเจาะจง" },
                { title: "4. กดดูรายชื่อ", content: "คลิกปุ่ม 'ดูรายชื่อ' เพื่อแสดงผลข้อมูลตามเงื่อนไขที่คุณเลือก" }
              ]}
            />
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              แดชบอร์ด
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-4 py-8 space-y-6">
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
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedGroup("");
                    setClassGroups([]);
                    setStudents([]);
                    setHasFetched(false);
                  }}
                  className="w-full appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed pr-8"
                >
                  <option value="">— เลือกแผนกวิชา —</option>
                  {academicDepts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              {isTeacher && userDept && (
                <p className="text-[10px] text-blue-500 font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> แผนกเริ่มต้นของคุณคือ: {userDept}
                </p>
              )}
            </div>

            {/* Class Group */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                กลุ่มเรียน / ห้อง
              </label>
              <div className="relative">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={!hasFetched || classGroups.length === 0}
                  className="w-full appearance-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed pr-8"
                >
                  <option value="">— ทุกกลุ่มเรียน —</option>
                  {classGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Name Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                ค้นหาชื่อ
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อนักเรียน..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  disabled={!hasFetched}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                &nbsp;
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fetchStudents()}
                  disabled={isLoading || !selectedDept}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-black transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  {isLoading ? "กำลังโหลด..." : "ดูรายชื่อ"}
                </button>
                {hasFetched && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchName("");
                      setSelectedGroup("");
                      fetchStudents(selectedDept, "");
                    }}
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

        {/* Stats Bar */}
        <AnimatePresence>
          {hasFetched && !isLoading && students.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { label: "นักเรียนทั้งหมด", value: students.length, icon: Users, color: "blue" },
                { label: "กำลังศึกษา", value: activeCount, icon: UserCheck, color: "emerald" },
                { label: "พ้นสภาพ/อื่นๆ", value: students.length - activeCount, icon: UserX, color: "amber" },
                { label: "กลุ่มเรียน", value: classGroups.length, icon: BookOpen, color: "purple" },
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

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Results: Grouped by class */}
        {!isLoading && hasFetched && (
          <AnimatePresence mode="wait">
            {grouped.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 space-y-3"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-black text-slate-500 dark:text-zinc-400">
                  {searchName ? `ไม่พบนักเรียนชื่อ "${searchName}"` : "ไม่พบข้อมูลนักเรียนในแผนกนี้"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* View Toggle */}
                <div className="flex justify-end">
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 flex gap-1 shadow-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        viewMode === "grid" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400" 
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      กริด
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        viewMode === "list" 
                          ? "bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400" 
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      รายการ
                    </button>
                  </div>
                </div>

                {grouped.map(([group, groupStudents]) => (
                  <motion.div key={group} variants={item} className="space-y-3">
                    {/* Group Header */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-xs font-black">{group}</span>
                        <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded-md">
                          {groupStudents.length} คน
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                    </div>

                    {/* Student Cards */}
                    <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-3"}>
                      {groupStudents.map((student, idx) => {
                        const isActive = student.studentStatus === "กำลังศึกษา";
                        return (
                          <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              {/* Avatar */}
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                {student.image ? (
                                  <img
                                    src={student.image}
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <GraduationCap className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                                )}
                              </div>

                              {/* Info */}
                              <div className={`flex-1 min-w-0 flex ${viewMode === "list" ? "flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : "flex-col gap-1"}`}>
                                <div>
                                  <div className="flex items-start gap-2">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 leading-tight truncate">
                                      {student.name}
                                    </h3>
                                    <Link
                                      href={`/dashboard/users/edit/${student.id}?redirect=/teacher/students`}
                                      className="shrink-0 px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg flex items-center gap-1 transition-colors"
                                    >
                                      <Edit className="w-3 h-3" />
                                      แก้ไข
                                    </Link>
                                    {viewMode === "list" && (
                                      <span
                                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                          isActive
                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                        }`}
                                      >
                                        {isActive ? (
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        ) : (
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        )}
                                        {student.studentStatus}
                                      </span>
                                    )}
                                  </div>
                                  {viewMode === "grid" && (
                                    <span
                                      className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 ${
                                        isActive
                                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                                      }`}
                                    >
                                      {isActive ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                      )}
                                      {student.studentStatus}
                                    </span>
                                  )}

                                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    <span className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md">
                                      {student.academicLevel}
                                    </span>
                                    <span className="text-[9px] font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/50">
                                      {student.learnerType}
                                    </span>
                                    <span className="text-[9px] font-bold bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/50">
                                      รหัสนักศึกษา: {student.studentId}
                                    </span>
                                    <span className="text-[9px] font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/50">
                                      รหัสปชช: {student.citizenId}
                                    </span>
                                    <span className="text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md">
                                      แผนก: {student.department}
                                    </span>
                                  </div>
                                </div>

                                {/* Contact */}
                                <div className={`flex items-center gap-4 ${viewMode === "grid" ? "mt-2" : "shrink-0 ml-auto"}`}>
                                  {student.phone && (
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                                      <Phone className="w-3.5 h-3.5" /> {student.phone}
                                    </p>
                                  )}
                                  {student.email && (
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 max-w-[150px] truncate">
                                      <Mail className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate">{student.email}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {/* Summary Footer */}
                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 dark:text-zinc-500 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  แสดงผลรายชื่อ {filtered.length} รายการ จากทั้งหมด {students.length} รายการ
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Welcome Prompt (before any search) */}
        {!hasFetched && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-700 dark:text-zinc-200">
                เลือกแผนกวิชาเพื่อดูรายชื่อ
              </h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium max-w-xs mx-auto">
                {isTeacher
                  ? "กดปุ่ม 'ดูรายชื่อ' เพื่อแสดงนักเรียนในแผนกของคุณ"
                  : "เลือกแผนกวิชาในตัวกรองด้านบน แล้วกด 'ดูรายชื่อ'"}
              </p>
            </div>
            {isTeacher && selectedDept && (
              <button
                type="button"
                onClick={() => fetchStudents()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                ดูรายชื่อนักเรียนของฉัน
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
