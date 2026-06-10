"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserCheck,
  Clock,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, DatePicker, message } from "antd";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  image?: string;
  createdAt: string;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    department: string;
    totalWeeks?: string;
    daysPerWeek?: string;
    hoursPerDay?: string;
  }>;
  teachingActivity: {
    totalClasses: number;
    uniqueDates: number;
    totalStudents: number;
    avgStudentsPerClass: number;
    recentActivity: number;
    lastTeachingDate: string | null;
  };
  isActive: boolean;
}

export default function TeacherVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    async function verifyPermission() {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/permissions?_t=" + Date.now());
        if (res.ok) {
          const permissions = await res.json();
          if (permissions?.access_teacher_verification) {
            setCheckingAccess(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      }
      router.replace("/dashboard");
    }
    verifyPermission();
  }, [status, router]);

  useEffect(() => {
    if (!checkingAccess) {
      fetchTeachers();
    }
  }, [departmentFilter, dateRange, checkingAccess]);

  useEffect(() => {
    applyFilters();
  }, [teachers, departmentFilter, statusFilter, searchQuery]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter) params.append("department", departmentFilter);
      if (dateRange) {
        params.append("startDate", dateRange[0]);
        params.append("endDate", dateRange[1]);
      }

      const res = await fetch(`/api/admin/teacher-verification?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTeachers(data.teachers);
        setFilteredTeachers(data.teachers);
        if (data.departments) {
          setDepartments(data.departments);
        }
      } else {
        message.error("ไม่สามารถโหลดข้อมูลครูได้");
      }
    } catch (error) {
      console.error("Fetch teachers error:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...teachers];

    if (departmentFilter) {
      filtered = filtered.filter((t) =>
        t.department.includes(departmentFilter)
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((t) => t.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((t) => !t.isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query)
      );
    }

    setFilteredTeachers(filtered);
  };

  const handleRefresh = () => {
    fetchTeachers();
  };

  if (status === "loading" || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ระบบตรวจสอบข้อมูลครู
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            ตรวจสอบและยืนยันข้อมูลครูและการดำเนินการสอน
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  ครูทั้งหมด
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {teachers.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  ครูที่สอนจริง
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {teachers.filter((t) => t.isActive).length}
                </p>
              </div>
              <UserCheck className="w-10 h-10 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  ครูที่ไม่ได้สอน
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {teachers.filter((t) => !t.isActive).length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  วิชาทั้งหมด
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {teachers.reduce((sum, t) => sum + t.subjects.length, 0)}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ค้นหา
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ชื่อ หรือ อีเมล"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                แผนกวิชา
              </label>
              <Select
                placeholder="ทั้งหมด"
                value={departmentFilter || undefined}
                onChange={(val) => setDepartmentFilter(val || "")}
                options={[{ label: "ทั้งหมด", value: "" }, ...departments.map((d) => ({ label: d, value: d }))]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                สถานะ
              </label>
              <Select
                placeholder="ทั้งหมด"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { label: "ทั้งหมด", value: "all" },
                  { label: "กำลังสอน", value: "active" },
                  { label: "ไม่ได้สอน", value: "inactive" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                ช่วงเวลา
              </label>
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([
                      dates[0].format("YYYY-MM-DD"),
                      dates[1].format("YYYY-MM-DD"),
                    ]);
                  } else {
                    setDateRange(null);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-600 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Teacher List */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              รายชื่อครู ({filteredTeachers.length} คน)
            </h2>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-700">
              {filteredTeachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer overflow-hidden relative group"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (teacher.image) {
                          setImagePreview({ url: teacher.image, name: teacher.name });
                        }
                      }}
                    >
                      {teacher.image ? (
                        <img
                          src={teacher.image}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        teacher.name.charAt(0)
                      )}
                      {teacher.image && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {teacher.name}
                        </h3>
                        {teacher.isActive ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {teacher.email}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {teacher.department}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">วิชา</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {teacher.subjects.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">คลาส</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {teacher.teachingActivity.totalClasses}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">นักเรียน</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {teacher.teachingActivity.totalStudents}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">7 วันล่าสุด</p>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {teacher.teachingActivity.recentActivity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredTeachers.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  ไม่พบข้อมูลครู
                </div>
              )}
            </div>
          )}
        </div>

        {/* Teacher Detail Modal */}
        <AnimatePresence>
          {selectedTeacher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTeacher(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-slate-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      รายละเอียดครู
                    </h2>
                    <button
                      onClick={() => setSelectedTeacher(null)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl cursor-pointer overflow-hidden relative group"
                      onClick={() => {
                        if (selectedTeacher.image) {
                          setImagePreview({ url: selectedTeacher.image, name: selectedTeacher.name });
                        }
                      }}
                    >
                      {selectedTeacher.image ? (
                        <img
                          src={selectedTeacher.image}
                          alt={selectedTeacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        selectedTeacher.name.charAt(0)
                      )}
                      {selectedTeacher.image && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {selectedTeacher.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedTeacher.email}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {selectedTeacher.department}
                      </p>
                    </div>
                  </div>

                  {/* Teaching Activity */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      กิจกรรมการสอน
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          คลาสทั้งหมด
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedTeacher.teachingActivity.totalClasses}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          วันที่สอน
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedTeacher.teachingActivity.uniqueDates}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          นักเรียนทั้งหมด
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedTeacher.teachingActivity.totalStudents}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          เฉลี่ย/คลาส
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {selectedTeacher.teachingActivity.avgStudentsPerClass}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      วิชาที่สอน ({selectedTeacher.subjects.length} วิชา)
                    </h4>
                    <div className="space-y-2">
                      {selectedTeacher.subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                [{subject.code}] {subject.name}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {subject.department}
                              </p>
                            </div>
                            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                              {subject.totalWeeks && (
                                <p>{subject.totalWeeks} สัปดาห์</p>
                              )}
                              {subject.daysPerWeek && subject.hoursPerDay && (
                                <p>{subject.daysPerWeek} วัน/สัปดาห์ • {subject.hoursPerDay} ชม./วัน</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setImagePreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImagePreview(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-white/80 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={imagePreview.url}
                alt={imagePreview.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white text-center mt-4 font-semibold">{imagePreview.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
