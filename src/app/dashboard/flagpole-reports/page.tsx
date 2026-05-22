"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
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
  ArrowLeft,
  Maximize2,
  Image as ImageIcon,
  ChevronDown,
  Database,
  MapPin,
  Smartphone,
  MapIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const STATUS_TH: Record<string, string> = {
  all: "สถานะทั้งหมด",
  Present: "ตรงเวลา",
  Late: "มาสาย",
};

function FlagpoleReportsManagementContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams ? (searchParams.get("search") || "") : "";

  const role = (session?.user as any)?.role?.toLowerCase();
  const isAdmin = ["super_admin", "admin"].includes(role);

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<"Present" | "Late">("Present");
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 20;

  // Zoom Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filters State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // ย้อนหลัง 30 วันเป็นค่าเริ่มต้น
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");

  // การยืนยันสิทธิ์เข้าใช้งานฝั่งแอดมิน
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role?.toLowerCase();
      if (!["super_admin", "admin", "editor", "teacher"].includes(role)) {
        router.replace("/");
      }
    }
  }, [status, session]);

  const fetchReports = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setPage(1);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await fetch(
        `/api/admin/flagpole-attendances?startDate=${startDate}&endDate=${endDate}&status=${statusFilter}&page=${currentPage}&limit=${LIMIT}`,
      );
      const json = await res.json();
      if (json.success) {
        setReports((prev) => (isLoadMore ? [...prev, ...json.data] : json.data));
        setHasMore(json.hasMore);
        if (isLoadMore) setPage(currentPage);
      } else {
        toast.error(json.message || "ดึงรายงานล้มเหลว");
      }
    } catch (err) {
      console.error("Fetch flagpole reports error:", err);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchReports();
    }
  }, [startDate, endDate, statusFilter, status]);

  const handleEditInit = (report: any) => {
    setSelectedReport(report);
    setEditStatus(report.status);
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/flagpole-attendances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedReport.id,
          status: editStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("ปรับปรุงสถานะการเข้าแถวสำเร็จ");
        setIsEditing(false);
        setSelectedReport(null);
        fetchReports();
      } else {
        toast.error(json.message || "ปรับปรุงสถานะล้มเหลว");
      }
    } catch (err) {
      console.error("Update flagpole attendance error:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกการเข้าแถวของนักเรียนรายนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      )
    )
      return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/flagpole-attendances?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("ลบบันทึกเสร็จสิ้น");
        setReports(reports.filter((r) => r.id !== id));
      } else {
        toast.error(json.message || "ลบบันทึกล้มเหลว");
      }
    } catch (err) {
      console.error("Delete report error:", err);
      toast.error("เกิดข้อผิดพลาดระหว่างส่งคำขอ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "🚨 [คำเตือนวิกฤต] คุณกำลังจะลบประวัติการเช็คชื่อเข้าแถวของนักเรียน 'ทั้งหมด' ในวิทยาลัย! การกระทำนี้ไม่สามารถกู้คืนได้ คุณแน่ใจจริงๆ หรือไม่?",
      )
    )
      return;

    const securityCode = prompt(
      'กรุณาพิมพ์คำว่า "DELETE ALL" เพื่อยืนยันการล้างประวัติเสาธงทั้งหมด:',
    );
    if (securityCode !== "DELETE ALL") {
      return toast.error("ยืนยันไม่ถูกต้อง ยกเลิกคำสั่งล้างข้อมูล");
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/flagpole-attendances?deleteAll=true", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "ล้างประวัติการเข้าแถวทั้งหมดเรียบร้อยแล้ว");
        fetchReports();
      } else {
        toast.error(json.message || "ลบประวัติล้มเหลว");
      }
    } catch (err) {
      console.error("Delete all flagpole reports error:", err);
      toast.error("เกิดข้อผิดพลาดระหว่างการเชื่อมต่อ");
    } finally {
      setActionLoading(false);
    }
  };

  const exportToExcel = () => {
    if (filteredReports.length === 0) {
      toast.error("ไม่พบข้อมูลสำหรับการส่งออกในขณะนี้");
      return;
    }

    const data = filteredReports.map((r) => ({
      รหัสนักศึกษา: r.user?.studentId || "-",
      "ชื่อ-นามสกุล": r.user?.name || "-",
      "ระดับชั้น/ห้อง": r.user?.academicLevel || "-",
      วันที่เข้าแถว: new Date(r.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" }),
      เวลาลงชื่อ:
        new Date(r.time).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }) + " น.",
      "ระยะห่าง GPS (เมตร)": r.distance ? Math.round(r.distance) + " ม." : "-",
      "ละติจูด (Lat)": r.lat || "-",
      "ลองจิจูด (Lng)": r.lng || "-",
      พิกัดที่อยู่โดยประมาณ: r.address || "-",
      สถานะการร่วมแถว: r.status === "Present" ? "ตรงเวลา" : "มาสาย",
      "รหัสอุปกรณ์ (Device ID)": r.deviceId || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Flagpole Reports");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(finalData, `Flagpole_Attendances_${startDate}_to_${endDate}.xlsx`);
    toast.success("ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้วครับ");
  };

  const filteredReports = reports.filter(
    (r) =>
      r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.academicLevel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.user?.studentId?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  if (status === "loading" || (loading && reports.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 gap-4 text-left">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
        <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">
          กำลังเตรียมรายงานการเข้าแถวเสาธง...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-6 font-sans selection:bg-indigo-500/30 overflow-x-hidden text-left">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-8 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-850 relative overflow-hidden group w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none text-indigo-500">
            <FileText size={180} />
          </div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="p-5 bg-linear-to-br from-indigo-500 to-blue-600 text-white rounded-3xl shadow-lg shadow-indigo-500/20">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">
                รายงานการเข้าแถวหน้าเสาธง
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 font-black mt-1.5 uppercase tracking-widest opacity-80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ระบบดูแลนักเรียน • ตรวจสอบ ปรับเปลี่ยน หรือลบประวัติการทำกิจกรรมเสาธง
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto">
            <button
              onClick={() => fetchReports()}
              className="flex items-center gap-2 px-5 py-3 bg-slate-50 dark:bg-zinc-800/50 text-slate-800 dark:text-zinc-100 rounded-2xl shadow-sm text-xs font-black hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95 border border-slate-200 dark:border-zinc-700"
            >
              <Clock size={16} className={loading ? "animate-spin" : ""} /> รีเฟรชข้อมูล
            </button>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md text-xs font-black transition-all active:scale-95 cursor-pointer"
            >
              <FileText size={16} /> ดาวน์โหลดประวัติ (Excel)
            </button>

            {isAdmin && (
              <button
                onClick={handleDeleteAll}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-md text-xs font-black transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={16} /> ล้างประวัติทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-zinc-900 px-6 py-6 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-850 grid grid-cols-1 md:grid-cols-5 gap-6 items-end w-full">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
              ค้นหานักศึกษา / รหัส / ชั้นเรียน
            </label>
            <div className="relative group">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="พิมพ์ชื่อนักเรียน, รหัส 10 หลัก หรือชั้นเรียน (ปวช./ปวส.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none transition-all font-bold placeholder:text-slate-400 text-slate-850 dark:text-zinc-200 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
              ตัวกรองสถานะ
            </label>
            <div className="relative group">
              <Filter
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-bold appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner cursor-pointer"
              >
                {Object.entries(STATUS_TH).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
              ตั้งแต่วันที่
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-black text-xs appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">
              ถึงวันที่
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={16}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl focus:outline-none font-black text-xs appearance-none scheme-light-dark text-slate-800 dark:text-zinc-200 shadow-inner cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Table View of Student Attendances */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-850 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-800/40">
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    นักศึกษา / ปีการศึกษา
                  </th>
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    วันที่เข้าแถว
                  </th>
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    เวลาบันทึก & ระยะ GPS
                  </th>
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    ข้อมูลอุปกรณ์ & ที่อยู่
                  </th>
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800 text-center">
                    ภาพถ่าย
                  </th>
                  <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800">
                    สถานะการเช็คแถว
                  </th>
                  {isAdmin && (
                    <th className="px-8 py-5.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-zinc-800 text-right">
                      จัดการข้อมูล
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-20 text-center">
                        <AlertCircle
                          size={48}
                          className="text-slate-200 dark:text-neutral-800 mx-auto mb-4"
                        />
                        <p className="text-slate-400 font-black">
                          ไม่พบข้อมูลประวัติการร่วมแถวเสาธงในช่วงเวลานี้
                        </p>
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
                        className="group hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50">
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              {report.user?.image ? (
                                <img
                                  src={report.user.image}
                                  alt={report.user.name}
                                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white dark:ring-zinc-850 shadow-md transition-transform group-hover:scale-110"
                                />
                              ) : (
                                <div
                                  className={`w-12 h-12 rounded-2xl ${getAvatarBg(report.user?.name || "น")} flex items-center justify-center text-white text-base font-black ring-2 ring-white dark:ring-zinc-850 shadow-md transition-transform group-hover:scale-110`}
                                >
                                  {getInitials(report.user?.name || "น")}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-800 dark:text-zinc-100 leading-tight">
                                {report.user?.name}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <span>ID: {report.user?.studentId}</span>
                                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                <span className="text-indigo-500 font-bold">
                                  {report.user?.academicLevel}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50 text-xs font-bold text-slate-500 dark:text-zinc-400">
                          {new Date(report.date).toLocaleDateString("th-TH", {
                            timeZone: "Asia/Bangkok",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50 text-xs text-slate-650 dark:text-zinc-355 font-semibold">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-black">
                              <Clock size={12} className="text-slate-400" />
                              {report.time
                                ? new Date(report.time).toLocaleTimeString("th-TH", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  }) + " น."
                                : "-"}
                            </div>
                            {report.distance !== undefined && (
                              <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-450 font-bold text-[10px] uppercase">
                                <MapPin size={12} />
                                ห่าง: {Math.round(report.distance)} เมตร
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50 text-[10px]">
                          <div className="space-y-1 max-w-[200px] truncate">
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-medium">
                              <Smartphone size={12} className="shrink-0" />
                              <span className="truncate">
                                {report.deviceId
                                  ? report.deviceId.substring(0, 16) + "..."
                                  : "ไม่ระบุอุปกรณ์"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 italic">
                              <MapIcon size={12} className="shrink-0" />
                              <span
                                className="truncate"
                                title={report.address || "ไม่ระบุตำแหน่งโดยละเอียด"}
                              >
                                {report.address || "ไม่ระบุตำแหน่ง"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50 text-center">
                          {report.photoUrl ? (
                            <div
                              className="relative inline-block cursor-zoom-in"
                              onClick={() => setPreviewImage(report.photoUrl)}
                            >
                              <img
                                src={report.photoUrl}
                                alt="Selfie proof"
                                className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <span className="text-[9px] font-black text-slate-350 dark:text-zinc-600 uppercase tracking-widest">
                              ไม่มีรูปภาพ
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] shadow-xs uppercase tracking-widest ${
                              report.status === "Present"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${report.status === "Present" ? "bg-emerald-500" : "bg-amber-500"}`}
                            />
                            {report.status === "Present" ? "ตรงเวลา" : "มาสาย"}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-8 py-5 border-b border-slate-50 dark:border-zinc-800/50 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditInit(report)}
                                className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                                title="แก้ไขสถานะ"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(report.id)}
                                className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                                title="ลบบันทึกเข้าแถว"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
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
              className="group flex items-center gap-3 px-12 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-4xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 text-slate-800 dark:text-zinc-200 cursor-pointer"
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
            <div className="px-6 py-3 bg-slate-100 dark:bg-zinc-850/50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-zinc-800/50">
              <Database size={14} /> บันทึกการเข้าแถวที่พบทั้งหมด: {reports.length} รายการ
            </div>
          )}
        </div>
      </div>

      {/* Edit Status Modal */}
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
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Edit2 size={18} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-zinc-100">
                    แก้ไขสถานะเข้าแถว
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-850 p-4 rounded-2xl">
                  {selectedReport.user?.image ? (
                    <img
                      src={selectedReport.user.image}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-xl ${getAvatarBg(selectedReport.user?.name || "น")} flex items-center justify-center text-white font-black`}
                    >
                      {getInitials(selectedReport.user?.name || "น")}
                    </div>
                  )}
                  <div>
                    <h4 className="font-black text-sm text-slate-800 dark:text-zinc-100 leading-tight">
                      {selectedReport.user?.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {selectedReport.user?.academicLevel} •{" "}
                      {new Date(selectedReport.date).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                    เลือกสถานะการร่วมกิจกรรม
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "Present", label: "ตรงเวลา", color: "emerald" },
                      { id: "Late", label: "มาสาย", color: "amber" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setEditStatus(s.id as any)}
                        className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                          editStatus === s.id
                            ? s.id === "Present"
                              ? "bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                              : "bg-amber-50/50 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                            : "border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-400"
                        }`}
                      >
                        <span className="font-black text-sm">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 dark:bg-zinc-800/20 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-350 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-md shadow-indigo-600/10 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} /> บันทึกสถานะใหม่
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-xl w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img
                src={previewImage}
                alt="Large proof selfie"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white/80 hover:text-white backdrop-blur-xs transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FlagpoleReportsManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-zinc-950 gap-4 text-left">
          <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
          <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs">
            กำลังเตรียมรายงานการเข้าแถวเสาธง...
          </p>
        </div>
      }
    >
      <FlagpoleReportsManagementContent />
    </Suspense>
  );
}
