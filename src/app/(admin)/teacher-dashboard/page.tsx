"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  ArrowUp,
  ArrowDown,
  X,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, DatePicker, message } from "antd";

interface DashboardStats {
  totalTeachers: number;
  activeTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalStudents: number;
  avgStudentsPerClass: number;
  thisWeekClasses: number;
  lastWeekClasses: number;
  weeklyGrowth: number;
}

interface TeacherActivity {
  teacherId: string;
  teacherName: string;
  department: string;
  totalClasses: number;
  thisWeekClasses: number;
  totalStudents: number;
  lastActivity: string;
  subjects: number;
  status: "active" | "inactive" | "warning";
  image?: string;
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherActivity | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [departmentFilter, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter) params.append("department", departmentFilter);
      if (dateRange) {
        params.append("startDate", dateRange[0]);
        params.append("endDate", dateRange[1]);
      }

      const res = await fetch(`/api/admin/teacher-dashboard?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStats(data.stats);
        setActivities(data.activities);
        if (data.departments) {
          setDepartments(data.departments);
        }
      } else {
        message.error("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      }
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      message.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                แดชบอร์ดติดตามงานครู
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                ภาพรวมการดำเนินงานสอนของครูทุกแผนกวิชา
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-zinc-700 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                placeholder="ทั้งหมด"
                value={departmentFilter || undefined}
                onChange={(val) => setDepartmentFilter(val || "")}
                options={[{ label: "ทั้งหมด", value: "" }, ...departments.map((d) => ({ label: d, value: d }))]}
                className="w-full"
              />
            </div>
            <div>
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
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.weeklyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stats.weeklyGrowth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stats.weeklyGrowth)}%
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">ครูทั้งหมด</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalTeachers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                {stats.activeTeachers} คนกำลังสอน
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">วิชาทั้งหมด</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalSubjects}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                {stats.totalClasses} คลาส
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">นักเรียนทั้งหมด</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                เฉลี่ย {stats.avgStudentsPerClass} คน/คลาส
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">สัปดาห์นี้</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.thisWeekClasses}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                สัปดาห์ที่แล้ว {stats.lastWeekClasses} คลาส
              </p>
            </div>
          </div>
        )}

        {/* Teacher Activities Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                กิจกรรมการสอนของครู
              </h2>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                  {activities.filter((a) => a.status === "active").length} กำลังสอน
                </span>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                  {activities.filter((a) => a.status === "warning").length} ต้องติดตาม
                </span>
                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-xs font-medium">
                  {activities.filter((a) => a.status === "inactive").length} ไม่ได้สอน
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-zinc-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      ครู
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      แผนกวิชา
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      วิชา
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      คลาสทั้งหมด
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      สัปดาห์นี้
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      นักเรียน
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      กิจกรรมล่าสุด
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {activities.map((activity, index) => (
                    <motion.tr
                      key={activity.teacherId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTeacher(activity)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden relative group"
                            onClick={() => {
                              if (activity.image) {
                                setImagePreview({ url: activity.image, name: activity.teacherName });
                              }
                            }}
                          >
                            {activity.image ? (
                              <img
                                src={activity.image}
                                alt={activity.teacherName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              activity.teacherName.charAt(0)
                            )}
                            {activity.image && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {activity.teacherName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.department}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.subjects}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.totalClasses}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.thisWeekClasses}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.totalStudents}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {activity.status === "active" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            กำลังสอน
                          </span>
                        )}
                        {activity.status === "warning" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            ติดตาม
                          </span>
                        )}
                        {activity.status === "inactive" && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            ไม่ได้สอน
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {activity.lastActivity || "-"}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {activities.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  ไม่พบข้อมูลกิจกรรม
                </div>
              )}
            </div>
          )}
        </div>
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
                    <X className="w-5 h-5 text-slate-500" />
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
                        setImagePreview({ url: selectedTeacher.image, name: selectedTeacher.teacherName });
                      }
                    }}
                  >
                    {selectedTeacher.image ? (
                      <img
                        src={selectedTeacher.image}
                        alt={selectedTeacher.teacherName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      selectedTeacher.teacherName.charAt(0)
                    )}
                    {selectedTeacher.image && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedTeacher.teacherName}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
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
                        {selectedTeacher.totalClasses}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        สัปดาห์นี้
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedTeacher.thisWeekClasses}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        นักเรียนทั้งหมด
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedTeacher.totalStudents}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        วิชาที่สอน
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {selectedTeacher.subjects}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    สถานะ
                  </h4>
                  <div className="flex items-center gap-2">
                    {selectedTeacher.status === "active" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        กำลังสอน
                      </span>
                    )}
                    {selectedTeacher.status === "warning" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        ติดตาม
                      </span>
                    )}
                    {selectedTeacher.status === "inactive" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        ไม่ได้สอน
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Activity */}
                {selectedTeacher.lastActivity && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      กิจกรรมล่าสุด
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {selectedTeacher.lastActivity}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
