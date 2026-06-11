"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ZoomIn,
  X,
  FileText,
  Users2,
  ShieldCheck,
  Target,
  FileCheck2,
  BellRing
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
  // ว.PA & Extra fields mock
  teachingHoursPerWeek?: number;
  lessonPlanSubmitted?: boolean;
  plcHours?: number;
  sdqCompleted?: boolean;
}

export default function TeacherDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<TeacherActivity[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [paStatusFilter, setPaStatusFilter] = useState<string>("all");
  const [imagePreview, setImagePreview] = useState<{ url: string; name: string } | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherActivity | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [checkingAccess, setCheckingAccess] = useState(true);

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
          if (permissions?.access_teacher_dashboard) {
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
      fetchDashboardData();
    }
  }, [departmentFilter, dateRange, checkingAccess]);

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

  if (status === "loading" || checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredActivities = activities.filter(a => {
    if (paStatusFilter === "all") return true;
    if (paStatusFilter === "no_plan") return !a.lessonPlanSubmitted;
    if (paStatusFilter === "low_hours") return (a.teachingHoursPerWeek || 0) < 12;
    if (paStatusFilter === "no_sdq") return !a.sdqCompleted;
    return true;
  });

  const watchlist = activities.filter(a => (a.teachingHoursPerWeek || 0) < 12 || !a.lessonPlanSubmitted || a.status === "warning");

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50/50 dark:from-zinc-950 dark:to-zinc-900 px-2 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-indigo-100/20 dark:shadow-none border border-white dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-1">
              แดชบอร์ดติดตามงานครู
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              ศูนย์ปฏิบัติการและประเมินผล (Executive Command Center)
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            อัปเดตข้อมูลล่าสุด
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              placeholder="กรองตามแผนกวิชา"
              value={departmentFilter || undefined}
              onChange={(val) => setDepartmentFilter(val || "")}
              options={[{ label: "ทุกแผนกวิชา", value: "" }, ...departments.map((d) => ({ label: d, value: d }))]}
              className="w-full md:w-64"
            />
            <Select
              placeholder="ตัวกรองประเมิน (ว.PA)"
              value={paStatusFilter}
              onChange={(val) => setPaStatusFilter(val)}
              options={[
                { label: "แสดงทั้งหมด", value: "all" },
                { label: "🚨 ไม่ส่งแผนการสอน", value: "no_plan" },
                { label: "⚠️ ชั่วโมงสอนไม่ถึงเกณฑ์ (< 12)", value: "low_hours" },
                { label: "❌ ยังไม่ประเมิน SDQ นักเรียน", value: "no_sdq" },
              ]}
              className="w-full md:w-72"
            />
            <DatePicker.RangePicker
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                } else setDateRange(null);
              }}
              className="w-full md:w-72"
            />
          </div>
        </div>

        {/* ว.PA & School Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-indigo-50 dark:text-indigo-900/20 group-hover:scale-110 transition-transform">
              <Clock size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">ชั่วโมงสอนสะสม</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {activities.filter(a => (a.teachingHoursPerWeek || 0) >= 12).length} <span className="text-sm text-slate-500 font-medium">/ {activities.length} คน</span>
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-2">
                คุณสมบัติสอนครบ {`>=`} 12 ชม./สัปดาห์
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-emerald-50 dark:text-emerald-900/20 group-hover:scale-110 transition-transform">
              <FileCheck2 size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">การส่งแผนการสอน</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {activities.filter(a => a.lessonPlanSubmitted).length} <span className="text-sm text-slate-500 font-medium">ชุด</span>
              </p>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full" 
                  style={{ width: ((activities.filter(a => a.lessonPlanSubmitted).length / (activities.length || 1)) * 100) + "%" }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-amber-50 dark:text-amber-900/20 group-hover:scale-110 transition-transform">
              <Target size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">กระบวนการ PLC</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {Math.round(activities.reduce((sum, a) => sum + (a.plcHours || 0), 0) / (activities.length || 1))} <span className="text-sm text-slate-500 font-medium">ชม. เฉลี่ย</span>
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-2">
                เทียบกับเกณฑ์ 50 ชม./ปี
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-rose-50 dark:text-rose-900/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={100} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">ระบบดูแลช่วยเหลือนักเรียน</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {Math.round((activities.filter(a => a.sdqCompleted).length / (activities.length || 1)) * 100)}%
              </p>
              <p className="text-[11px] font-bold text-slate-500 mt-2">
                ประเมิน SDQ และเยี่ยมบ้าน
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                บัญชีรายชื่อ และสรุปภาระงาน
              </h2>
              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                {filteredActivities.length} รายการ
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-zinc-800/50 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">บุคลากรครู</th>
                    <th className="px-4 py-4 text-center">แผนการสอน</th>
                    <th className="px-4 py-4 text-center">ภาระงานสอน/สัปดาห์</th>
                    <th className="px-4 py-4 text-center">ชั่วโมง PLC</th>
                    <th className="px-4 py-4 text-center">ระบบดูแลฯ (SDQ)</th>
                    <th className="px-4 py-4 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <AnimatePresence>
                    {filteredActivities.map((activity, index) => (
                      <motion.tr
                        key={activity.teacherId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-indigo-50/30 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedTeacher(activity)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                              {activity.image ? <img src={activity.image} alt="Profile" className="w-full h-full object-cover"/> : activity.teacherName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{activity.teacherName}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{activity.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {activity.lessonPlanSubmitted ? (
                            <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded font-bold text-xs">ส่งแล้ว</span>
                          ) : (
                            <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded font-bold text-xs">ค้างส่ง</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center font-black">
                          <span className={(activity.teachingHoursPerWeek || 0) < 12 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>
                            {activity.teachingHoursPerWeek} ชม.
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-bold">
                          {activity.plcHours} ชม.
                        </td>
                        <td className="px-4 py-4 text-center">
                          {activity.sdqCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {activity.status === "active" ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-rose-500 mx-auto shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filteredActivities.length === 0 && (
                <div className="p-10 text-center text-slate-400 font-bold">ไม่พบข้อมูลตามเงื่อนไข</div>
              )}
            </div>
          </div>

          {/* Watchlist Section */}
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl shadow-sm border border-rose-100 dark:border-rose-900/30 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600">
                <BellRing size={20} />
              </div>
              <div>
                <h3 className="font-black text-rose-900 dark:text-rose-400 uppercase tracking-wider text-sm">เฝ้าระวังพิเศษ (Watchlist)</h3>
                <p className="text-[10px] font-bold text-rose-500/70">คุณสมบัติไม่ถึงเกณฑ์ประเมิน DPA</p>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-3">
                {watchlist.slice(0, 8).map(w => (
                  <div key={w.teacherId} className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-rose-50 dark:border-rose-900/20 shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setSelectedTeacher(w)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center font-bold text-xs">
                        {w.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{w.teacherName}</p>
                        <p className="text-[9px] text-rose-500 font-bold uppercase">
                          {!w.lessonPlanSubmitted ? "ไม่มีแผนการสอน " : ""}
                          {(w.teachingHoursPerWeek || 0) < 12 ? "ชั่วโมงสอนไม่พอ" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {watchlist.length === 0 && (
                  <p className="text-center text-xs text-rose-400 font-bold py-10">ไม่มีบุคลากรที่ต้องเฝ้าระวัง</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Teacher Detail Modal (Simplified for Dashboard, full is in Verification) */}
      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 px-2"
            onClick={() => setSelectedTeacher(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-black mb-4 overflow-hidden shadow-inner">
                  {selectedTeacher.image ? <img src={selectedTeacher.image} className="w-full h-full object-cover"/> : selectedTeacher.teacherName.charAt(0)}
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">{selectedTeacher.teacherName}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{selectedTeacher.department}</p>
                
                <div className="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 text-left space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">ชั่วโมงสอน/สัปดาห์</span>
                    <span className="font-black text-slate-800 dark:text-white">{selectedTeacher.teachingHoursPerWeek} ชม.</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">การส่งแผนการสอน</span>
                    <span className={"font-black " + (selectedTeacher.lessonPlanSubmitted ? 'text-emerald-500' : 'text-rose-500')}>
                      {selectedTeacher.lessonPlanSubmitted ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">ประเมิน SDQ</span>
                    <span className={"font-black " + (selectedTeacher.sdqCompleted ? 'text-emerald-500' : 'text-rose-500')}>
                      {selectedTeacher.sdqCompleted ? 'เรียบร้อย' : 'ค้างประเมิน'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/teacher-verification')} 
                  className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors"
                >
                  ตรวจสอบข้อมูลเชิงลึก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
