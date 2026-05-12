"use client";

import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Loader2,
  X,
  Calendar,
  ChevronRight,
  User as UserIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Trash2,
  Edit2,
  Save,
  Plus,
  ArrowLeft,
  Maximize2,
  Image as ImageIcon,
  ChevronDown,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/components/FullPageLoader";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Activity {
  id: string;
  taskName: string;
  detail: string;
  status: "Completed" | "In Progress" | "Pending";
}

const ROLE_TH: Record<string, string> = {
  all: "ทั้งหมด",
  teacher: "ครู",
  staff: "เจ้าหน้าที่",
  janitor: "แม่บ้าน/นักการ",
  hr: "ฝ่ายบุคคล",
  director: "ผู้บริหาร",
};

export default function WorkReportsManagementPage() {
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 20;

  // Edit State
  const [editActivities, setEditActivities] = useState<Activity[]>([]);
  const [editSummary, setEditSummary] = useState("");
  const [editProblems, setEditProblems] = useState("");
  const [editPlansNextDay, setEditPlansNextDay] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-emerald-500",
      "bg-indigo-500",
      "bg-blue-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-amber-500",
      "bg-cyan-500",
      "bg-violet-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Last 30 days for management
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchReports = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setPage(1);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await fetch(
        `/api/work-report?startDate=${startDate}&endDate=${endDate}&role=${roleFilter}&page=${currentPage}&limit=${LIMIT}`,
      );
      const json = await res.json();
      if (json.success) {
        setReports((prev) => (isLoadMore ? [...prev, ...json.data] : json.data));
        setHasMore(json.hasMore);
        if (isLoadMore) setPage(currentPage);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate, roleFilter]);

  const handleEditInit = (report: any) => {
    setSelectedReport(report);
    setEditActivities(
      report.activities?.map((a: any) => ({
        ...a,
        id: a.id || crypto.randomUUID(),
      })) || [],
    );
    setEditSummary(report.summary || "");
    setEditProblems(report.problems || "");
    setEditPlansNextDay(report.plansNextDay || "");
    setEditImages(report.images || []);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/work-report", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReport.id,
          activities: editActivities,
          summary: editSummary,
          problems: editProblems,
          plansNextDay: editPlansNextDay,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditing(false);
        setSelectedReport(null);
        fetchReports();
      } else {
        alert(json.message || "Failed to update report");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/work-report?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setReports(reports.filter((r) => r.id !== id));
        setIsDeleting(false);
        setSelectedReport(null);
      } else {
        alert(json.message || "Failed to delete report");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    // 1st Confirmation
    if (
      !confirm(
        "🚨 [CRITICAL WARNING] คุณกำลังจะลบรายงานการปฏิบัติงาน 'ทั้งหมด' ในระบบ! การกระทำนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?",
      )
    )
      return;

    // 2nd Confirmation (Security String)
    const securityCode = prompt(
      'กรุณาพิมพ์คำว่า "DELETE ALL" เพื่อยืนยันการลบข้อมูลรายงานทั้งหมด:',
    );
    if (securityCode !== "DELETE ALL") {
      return alert("การยืนยันไม่ถูกต้อง ยกเลิกการลบ");
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/work-report?deleteAll=true", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message || "ลบรายงานทั้งหมดเรียบร้อยแล้ว");
        fetchReports();
      } else {
        alert(json.message || "ลบรายงานไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Delete all error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const exportToExcel = () => {
    if (filteredReports.length === 0) {
      alert("ไม่พบข้อมูลที่จะส่งออกครับ");
      return;
    }

    const data = filteredReports.map((r) => ({
      วันที่: new Date(r.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" }),
      "ชื่อ-นามสกุล": r.user?.name || "-",
      ตำแหน่ง: ROLE_TH[r.user?.role] || r.user?.role || "-",
      "แผนก/สังกัด": r.user?.department || "-",
      สรุปงาน: r.summary || "-",
      ปัญหาที่พบ: r.problems || "-",
      แผนงานวันถัดไป: r.plansNextDay || "-",
      จำนวนกิจกรรม: r.activities?.length || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Reports");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(finalData, `Work_Reports_${startDate}_to_${endDate}.xlsx`);
  };

  const addActivity = () => {
    setEditActivities([
      {
        id: crypto.randomUUID(),
        taskName: "",
        detail: "",
        status: "Completed",
      },
      ...editActivities,
    ]);
  };

  const removeActivity = (id: string) => {
    if (editActivities.length === 1) return;
    setEditActivities(editActivities.filter((a) => a.id !== id));
  };

  const updateActivityField = (id: string, field: keyof Activity, value: string) => {
    setEditActivities(editActivities.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const filteredReports = reports.filter(
    (r) =>
      r.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <FullPageLoader
        message="กำลังรวบรวมรายงานการปฏิบัติงาน..."
        subtitle="กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูลทั้งหมดเพื่อคุณ"
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-2 py-4 md:p-6 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-8 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <FileText size={180} />
          </div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-5 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-3xl shadow-lg shadow-indigo-500/20">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">
                แก้ไขรายงานการปฏิบัติงาน
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold mt-1.5 uppercase tracking-widest opacity-70">
                Dashboard สำหรับผู้ดูแลระบบ • ตรวจสอบและบริหารจัดการรายงานการปฏิบัติงาน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <button
              onClick={() => fetchReports()}
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-100 rounded-4xl shadow-sm text-sm font-black hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95 border border-slate-200 dark:border-zinc-700"
            >
              <Clock size={18} className={loading ? "animate-spin" : ""} /> รีเฟรชข้อมูล
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl shadow-lg shadow-emerald-600/20 text-sm font-black transition-all active:scale-95"
            >
              <FileText size={18} /> ดาวน์โหลดรายงาน (Excel)
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-3xl shadow-lg shadow-rose-600/20 text-sm font-black transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={18} /> ลบรายงานทั้งหมด
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-zinc-900 px-6 py-6 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-5 gap-6 items-end w-full">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
              ค้นหาพนักงาน / แผนก
            </label>
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="พิมพ์ชื่อพนักงาน หรือ แผนก..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none transition-all font-bold placeholder:text-slate-400 text-slate-800 dark:text-zinc-200 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
              หมวดหมู่พนักงาน
            </label>
            <div className="relative group">
              <Filter
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
                size={18}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-bold appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner"
              >
                {Object.entries(ROLE_TH).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
              วันที่เริ่ม
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-black text-sm appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">
              วันที่สิ้นสุด
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-black text-sm appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Table View for Management */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    พนักงาน
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    วันที่
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    สรุปงาน
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    กิจกรรม
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    รูปภาพ
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800 text-right">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <AlertCircle
                          size={48}
                          className="text-slate-200 dark:text-neutral-800 mx-auto mb-4"
                        />
                        <p className="text-slate-400 font-black">ไม่พบข้อมูลรายงานในช่วงเวลานี้</p>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <motion.tr
                        key={report.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              {report.user.image ? (
                                <img
                                  src={report.user.image}
                                  alt={report.user.name}
                                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-zinc-800 shadow-md transition-transform group-hover:scale-110"
                                />
                              ) : (
                                <div
                                  className={`w-12 h-12 rounded-2xl ${getAvatarBg(report.user.name)} flex items-center justify-center text-white text-base font-black ring-2 ring-white dark:ring-zinc-800 shadow-md transition-transform group-hover:scale-110`}
                                >
                                  {getInitials(report.user.name)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-zinc-200">
                                {report.user.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1.5 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                {report.user.department}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50 text-sm font-bold text-slate-500 dark:text-zinc-400">
                          {new Date(report.date).toLocaleDateString("th-TH", {
                            timeZone: "Asia/Bangkok",
                          })}
                        </td>
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50 text-sm">
                          <p className="text-slate-600 dark:text-zinc-300 line-clamp-1 max-w-xs">
                            {report.summary}
                          </p>
                        </td>
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50">
                          <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-black text-[10px]">
                            {report.activities?.length || 0}
                          </span>
                        </td>
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50 text-center">
                          {report.images && report.images.length > 0 ? (
                            <div className="flex flex-col items-center gap-1 group/img cursor-help">
                              <div className="relative">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover/img:scale-110 transition-transform">
                                  <ImageIcon size={16} />
                                </div>
                                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                                  {report.images.length}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                              ไม่มีรูป
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6 border-b border-slate-50 dark:border-zinc-800/50 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditInit(report)}
                              className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                              title="ลบรายงาน"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Load More Button */}
        <div className="flex flex-col items-center gap-4 py-8">
          {hasMore && !loading && (
            <button
              onClick={() => fetchReports(true)}
              disabled={loadingMore}
              className="group flex items-center gap-3 px-12 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-4xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-slate-200/50 dark:shadow-none hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 text-slate-800 dark:text-zinc-200"
            >
              {loadingMore ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ChevronDown className="group-hover:translate-y-1 transition-transform" size={18} />
              )}
              โหลดข้อมูลเพิ่มอีก {LIMIT} รายการ
            </button>
          )}

          {!hasMore && !loading && reports.length > 0 && (
            <div className="px-6 py-3 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-zinc-800">
              <Database size={14} /> จำนวนรายงานทั้งหมดที่แสดง: {reports.length}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[3rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 dark:border-zinc-800"
            >
              <div className="flex flex-col h-[90vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                      <Edit2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 leading-tight">
                        แก้ไขรายงานการปฏิบัติงาน
                      </h2>
                      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                        พนักงาน: {selectedReport.user.name} •{" "}
                        {new Date(selectedReport.date).toLocaleDateString("th-TH", {
                          timeZone: "Asia/Bangkok",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-2 space-y-10 custom-scrollbar">
                  {/* Activities */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Clock size={14} className="text-blue-500" /> Activities History
                      </h4>
                      <button
                        onClick={addActivity}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Plus size={14} /> Add Task
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editActivities.map((act, index) => (
                        <div
                          key={act.id}
                          className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 group relative"
                        >
                          <button
                            onClick={() => removeActivity(act.id)}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-2">
                              <input
                                type="text"
                                placeholder="ชื่อกิจกรรม / งานที่ทำ"
                                value={act.taskName}
                                onChange={(e) =>
                                  updateActivityField(act.id, "taskName", e.target.value)
                                }
                                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-neutral-700 py-2 font-bold text-slate-800 dark:text-neutral-100 focus:outline-none focus:border-blue-500 transition-colors"
                              />
                              <textarea
                                placeholder="รายละเอียด (ถ้ามี)"
                                value={act.detail}
                                onChange={(e) =>
                                  updateActivityField(act.id, "detail", e.target.value)
                                }
                                className="w-full bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-700 mt-3 p-3 rounded-2xl text-xs text-slate-600 dark:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              {(["Completed", "In Progress", "Pending"] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateActivityField(act.id, "status", s)}
                                  className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                    act.status === s
                                      ? s === "Completed"
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : s === "In Progress"
                                          ? "bg-blue-500 border-blue-500 text-white"
                                          : "bg-amber-500 border-amber-500 text-white"
                                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-400"
                                  }`}
                                >
                                  {s === "Completed"
                                    ? "เสร็จสิ้น"
                                    : s === "In Progress"
                                      ? "กำลังดำเนินการ"
                                      : "รอดำเนินการ"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                        สรุปภาพรวม
                      </label>
                      <textarea
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-3xl text-sm font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest pl-2">
                          ปัญหาที่พบ / อุปสรรค
                        </label>
                        <textarea
                          value={editProblems}
                          onChange={(e) => setEditProblems(e.target.value)}
                          className="w-full p-4 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl text-sm font-medium text-rose-800 dark:text-rose-200 focus:outline-none focus:ring-4 focus:ring-rose-500/10 resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-2">
                          แผนงานวันถัดไป
                        </label>
                        <textarea
                          value={editPlansNextDay}
                          onChange={(e) => setEditPlansNextDay(e.target.value)}
                          className="w-full p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl text-sm font-medium text-emerald-800 dark:text-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-zinc-800 px-2 lg:px-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                        <ImageIcon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">
                          รูปภาพประกอบ ({editImages.length})
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          ภาพหลักฐานการปฏิบัติงานที่พนักงานแนบมา
                        </p>
                      </div>
                    </div>

                    {editImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-4">
                        {editImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover"
                              alt={`Work proof ${idx}`}
                            />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                              <button
                                onClick={() => setPreviewImage(img)}
                                className="p-2.5 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-colors"
                                title="ขยายรูป"
                              >
                                <Maximize2 size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setEditImages(editImages.filter((_, i) => i !== idx))
                                }
                                className="p-2.5 bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 rounded-xl transition-colors"
                                title="ลบรูปภาพ"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3">
                        <ImageIcon size={32} className="text-slate-200 dark:text-zinc-800" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          ไม่มีรูปภาพแนบมา
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-4 bg-slate-50/50 dark:bg-zinc-800/50">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-4 text-slate-500 font-bold hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={actionLoading}
                    className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-base shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Preview */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img
                src={previewImage}
                alt="Enlarged proof"
                className="max-w-full max-h-[85vh] object-contain"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
        }
      `}</style>
    </div>
  );
}
