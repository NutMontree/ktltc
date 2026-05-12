"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  ShieldCheck,
  Download,
  X,
  Maximize2,
  Loader2,
} from "lucide-react";

export default function LeaveApprovalsPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected, all
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-emerald-500", "bg-indigo-500", "bg-blue-500",
      "bg-purple-500", "bg-rose-500", "bg-amber-500",
      "bg-cyan-500", "bg-violet-500",
    ];
    const index = (name || "").length % colors.length;
    return colors[index];
  };

  const LIMIT = 20;

  const fetchLeaves = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setSkip(0);
    }

    try {
      const currentSkip = isLoadMore ? skip + LIMIT : 0;
      const res = await fetch(
        `/api/admin/leave?status=${filter}&limit=${LIMIT}&skip=${currentSkip}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (isLoadMore) {
          setLeaves((prev) => [...prev, ...data]);
        } else {
          setLeaves(data);
        }
        setSkip(currentSkip);
        setHasMore(data.length === LIMIT);
      }
    } catch (error) {
      console.error("Failed to fetch leaves", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLeaves(false);
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (
      !confirm(
        `ยืนยันการตั้งสถานะเป็น ${newStatus === "approved" ? "อนุมัติ" : "ปฏิเสธ"}?`,
      )
    )
      return;
    try {
      const res = await fetch("/api/admin/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        // Simple way to refresh: refetch first page or remove from current list
        // For better UX, we'll just refetch the whole visible set or a subset
        // Here we just refetch the initial state for simplicity
        fetchLeaves(false);
      } else {
        alert("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      alert("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sick: "ลาป่วย",
      personal: "ลากิจส่วนตัว",
      paternity: "ลาช่วยเหลือภริยาที่คลอดบุตร",
      maternity: "ลาคลอด",
      ordination: "ลาอุปสมบท",
      official: "ไปราชการ",
      other: "อื่นๆ",
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    if (status === "approved")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "rejected")
      return "bg-rose-100 text-rose-700 border-rose-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const exportToCSV = () => {
    if (leaves.length === 0) return alert("ไม่มีข้อมูลสำหรับ Export");

    const headers = [
      "ชื่อพนักงาน",
      "ประเภทการลา",
      "สถานะ",
      "เริ่มวันที่",
      "ถึงวันที่",
      "เหตุผล",
      "วันที่ส่งคำขอ",
    ];
    const csvData = leaves.map((leave) =>
      [
        `"${leave.user?.name || leave.user?.username || "Unknown Employee"}"`,
        `"${getTypeLabel(leave.leaveType)}"`,
        `"${leave.status === "pending" ? "รออนุมัติ" : leave.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}"`,
        `"${format(new Date(leave.startDate), "dd/MM/yyyy", { locale: th })}"`,
        `"${format(new Date(leave.endDate), "dd/MM/yyyy", { locale: th })}"`,
        `"${leave.reason.replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${format(new Date(leave.createdAt), "dd/MM/yyyy HH:mm", { locale: th })}"`,
      ].join(","),
    );

    const csvContent = [headers.join(","), ...csvData].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `leave_report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                ระบบอนุมัติการลางาน
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                ทบทวนและอนุมัติคำขอลาป่วย ลากิจ และตรวจสอบใบรับรองแพทย์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl overflow-x-auto hide-scrollbar">
              {["pending", "approved", "rejected", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    filter === f
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {f === "pending"
                    ? "รออนุมัติ"
                    : f === "approved"
                      ? "อนุมัติแล้ว"
                      : f === "rejected"
                        ? "ปฏิเสธ"
                        : "ทั้งหมด"}
                </button>
              ))}
            </div>
            <button
              onClick={exportToCSV}
              className="group relative flex items-center gap-3 bg-linear-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-white dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white dark:text-black text-white px-8 py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-300 font-black active:scale-95 border border-emerald-500/50 dark:border-slate-200"
              title="Export ข้อมูลเป็นไฟล์ CSV/Excel"
            >
              <div className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </div>
              <Download size={22} className="group-hover:translate-y-0.5 transition-transform" /> 
              <span className="tracking-tight text-lg hidden sm:inline">ส่งออกข้อมูล</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && leaves.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                กำลังโหลดข้อมูล...
              </p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                ไม่มีข้อมูลคำขอลา
              </h3>
              <p className="text-slate-500 mt-1">
                ไม่พบคำขอลาในสถานะที่คุณเลือก
              </p>
            </div>
          ) : (
            <>
              {leaves.map((leave, idx) => (
                <motion.div
                  key={leave._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-zinc-900 p-4 rounded-4xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                    <FileText size={80} />
                  </div>

                  {/* User Info & Dates */}
                  <div className="flex items-center gap-4 mb-5">
                    {leave.user?.image ? (
                      <img src={leave.user.image} alt={leave.user?.name} className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-slate-100 dark:border-zinc-800" />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl ${getAvatarBg(leave.user?.name || "U")} flex items-center justify-center text-white font-black text-xl shadow-lg border border-slate-100 dark:border-zinc-800`}>
                        {getInitials(leave.user?.name || "U")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg leading-tight truncate">
                        {leave.user?.name || leave.user?.username || "ไม่ระบุชื่อบุคลากร"}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-1 flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {getTypeLabel(leave.leaveType)}
                        </span>
                        • {leave.user?.department || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-zinc-800/50">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">
                        <Calendar size={14} className="text-blue-500" /> 
                        ขอเมื่อ {format(new Date(leave.createdAt), "dd MMM yy HH:mm", { locale: th })}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusColor(leave.status)}`}>
                        {leave.status === "pending" ? "รออนุมัติ" : leave.status === "approved" ? "อนุมัติ" : "ปฏิเสธ"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <Clock size={12}/> เริ่มลา
                        </p>
                        <span className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
                          {format(new Date(leave.startDate), "dd MMM yyyy", { locale: th })}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                           <Clock size={12}/> ถึงวันที่
                        </p>
                        <span className="font-bold text-slate-700 dark:text-zinc-300 text-sm">
                          {format(new Date(leave.endDate), "dd MMM yyyy", { locale: th })}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-xs">
                      <strong className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">
                        เหตุผลการลา
                      </strong>
                      <p className="text-slate-700 dark:text-zinc-300 truncate">
                        {leave.reason}
                      </p>
                    </div>
                  </div>

                  {/* Attachments & Actions */}
                  <div className="mt-4 flex flex-col justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    {leave.attachmentUrl ? (
                      <button
                        onClick={() => setSelectedImage(leave.attachmentUrl)}
                        className="flex justify-center items-center gap-2 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-2 rounded-xl transition-colors font-bold w-full"
                      >
                        <FileText size={14} /> ดูเอกสารแนบ <Maximize2 size={12} />
                      </button>
                    ) : (
                      <div className="text-xs text-center text-slate-400 italic p-2 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                        ไม่มีเอกสารแนบ
                      </div>
                    )}

                    {leave.status === "pending" && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() =>
                            handleStatusUpdate(leave._id, "approved")
                          }
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-500/20 active:scale-95"
                        >
                          <CheckCircle size={16} /> อนุมัติ
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(leave._id, "rejected")
                          }
                          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-rose-500/20 active:scale-95"
                        >
                          <XCircle size={16} /> ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="col-span-full flex justify-center pt-8">
                  <button
                    onClick={() => fetchLeaves(true)}
                    disabled={loadingMore}
                    className={`flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                      loadingMore
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    }`}
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        กำลังโหลดเพิ่ม...
                      </>
                    ) : (
                      "แสดงเพิ่มอีก 20 รายการ"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Attachment Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  หลักฐานประกอบการลา
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-black p-2 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Attachment Preview"
                  className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex justify-center">
                <a
                  href={selectedImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                >
                  เปิดไฟล์ขนาดเต็ม
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
