/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Trash2,
  Edit,
  Save,
  X,
  Search,
  Database,
  AlertCircle,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * [PAGE] Data Management Dashboard (Super Admin Only)
 * ออกแบบมาเพื่อความเร็วสูงสุด และ การจัดการข้อมูลที่แม่นยำ
 */
export default function DataManagementPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"attendance" | "leave" | "suvery">(
    "attendance",
  );

  // States สำหรับข้อมูลแต่ละชุด
  const [records, setRecords] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString(),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const LIMIT = 20;
  const abortControllerRef = useRef<AbortController | null>(null);

  // ตลาวเวลาสำหรับไทย
  const formatTime = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch (e) {
      return "-";
    }
  };

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

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd MMM yyyy", { locale: th });
    } catch (e) {
      return "-";
    }
  };

  const formatDateParts = (dateStr: any) => {
    if (!dateStr) return { day: "-", month: "-", year: "-" };
    try {
      const d = new Date(dateStr);
      return {
        day: format(d, "dd"),
        month: format(d, "MMM", { locale: th }),
        year: format(d, "yyyy", { locale: th }),
        full: format(d, "yyyy-MM-dd"), // สำหรับ Input "date"
      };
    } catch (e) {
      return { day: "-", month: "-", year: "-" };
    }
  };

  // ดึงเวลาสำหรับ Input "time" (HH:mm) — ใช้ local time ตรงๆ เหมือน formatTime
  const getTHTime = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch (e) {
      return "";
    }
  };

  // รวมเวลา HH:mm กับวันที่เดิม เพื่อบันทึกกลับ (ใช้ local time string เพื่อหลีกเลี่ยง UTC drift)
  const mergeTimeWithDate = (originalDateStr: any, localTimeStr: string) => {
    if (!localTimeStr || !originalDateStr) return null;
    try {
      const d = new Date(originalDateStr);
      const [hours, minutes] = localTimeStr.split(":").map(Number);
      // สร้าง Date ใหม่จากวันที่เดิม + เวลาที่แก้ไข (ใช้ local timezone)
      const merged = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        hours,
        minutes,
        0,
        0,
      );
      return merged.toISOString();
    } catch (e) {
      return null;
    }
  };

  // แผนผังการแปลสถานะเป็นภาษาไทย
  const STATUS_TH: Record<string, string> = {
    // Attendance
    Present: "มาทำงาน",
    Late: "มาสาย",
    Leave: "ลาพักผ่อน",
    Absent: "ขาดงาน",
    // Leave Requests
    pending: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
  };

  /**
   * Fetch Data (Optimized)
   */
  const fetchData = async (
    isLoadMore = false,
    tab = activeTab,
    search = debouncedSearch,
  ) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isLoadMore) setLoadingMore(true);
    else {
      setLoading(true);
      setRecords([]);
      setSkip(0);
    }

    try {
      const currentSkip = isLoadMore ? skip + LIMIT : 0;
      let url = `/api/admin/data?type=${tab}&limit=${LIMIT}&skip=${currentSkip}&search=${encodeURIComponent(search)}&_t=${Date.now()}`;

      if (filterDay) url += `&day=${filterDay}`;
      if (filterMonth) url += `&month=${filterMonth}`;
      if (filterYear) url += `&year=${filterYear}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      if (json.success) {
        setRecords((prev) =>
          isLoadMore ? [...prev, ...json.data] : json.data,
        );
        setSkip(currentSkip);
        setHasMore(json.data.length === LIMIT);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("ไม่สามารถดึงข้อมูลได้");
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial Load & Tab/Search/Filter Change
  useEffect(() => {
    fetchData(false, activeTab, debouncedSearch);
    return () => abortControllerRef.current?.abort();
  }, [activeTab, debouncedSearch, filterDay, filterMonth, filterYear]);

  /**
   * Action Handlers
   */
  const handleDelete = async (id: string) => {
    if (!confirm("🚨 ยืนยันการลบข้อมูลนี้ถาวร? (Super Admin Action)")) return;
    try {
      const res = await fetch(`/api/admin/data?id=${id}&type=${activeTab}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("ลบข้อมูลสำเร็จ");
        fetchData(false);
      } else throw new Error(json.error);
    } catch (err: any) {
      toast.error("ลบไม่สำเร็จ: " + err.message);
    }
  };

  const handleDeleteAll = async () => {
    // 1st Confirmation
    if (
      !confirm(
        `🚨 [WARNING] คุณกำลังจะลบข้อมูล "${activeTab.toUpperCase()}" ทั้งหมดในระบบ! การกระทำนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?`,
      )
    )
      return;

    // 2nd Confirmation (String match)
    const confirmText = prompt(
      `กรุณาพิมพ์คำว่า "DELETE ALL" เพื่อยืนยันการลบข้อมูลทั้งหมดในหมวด ${activeTab.toUpperCase()}:`,
    );
    if (confirmText !== "DELETE ALL") {
      return toast.error("การยืนยันไม่ถูกต้อง ยกเลิกการลบ");
    }

    const toastId = toast.loading("กำลังลบข้อมูลทั้งหมด...");
    try {
      const res = await fetch(
        `/api/admin/data?type=${activeTab}&deleteAll=true`,
        {
          method: "DELETE",
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success(`ลบข้อมูล ${activeTab} ทั้งหมดเรียบร้อยแล้ว`, {
          id: toastId,
        });
        fetchData(false);
      } else throw new Error(json.error);
    } catch (err: any) {
      toast.error("ลบไม่สำเร็จ: " + err.message, { id: toastId });
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record._id);
    // เตรียมข้อมูลสำหรับการแก้ไข - แปลงเวลาเป็น HH:mm สำหรับ Input "time"
    setEditFormData({
      ...record,
      checkInTimeOnly: getTHTime(record.checkIn?.time),
      checkOutTimeOnly: getTHTime(record.checkOut?.time),
      dateOnly: formatDateParts(record.date || record.startDate).full,
    });
  };

  const handleSaveEdit = async () => {
    const toastId = toast.loading("กำลังบันทึก...");
    try {
      // รวมเวลาที่แก้ไขเข้ากับวันที่เดิม
      const finalUpdates = { ...editFormData };

      if (activeTab === "attendance") {
        if (finalUpdates.dateOnly) {
          // \u0e2a\u0e23\u0e49\u0e32\u0e07\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e08\u0e32\u0e01 local parts \u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e2b\u0e25\u0e35\u0e01 UTC midnight shift
          const [y, m, dd] = finalUpdates.dateOnly.split("-").map(Number);
          finalUpdates.date = new Date(y, m - 1, dd);
        }
        if (finalUpdates.checkInTimeOnly) {
          finalUpdates.checkIn = {
            ...finalUpdates.checkIn,
            time: mergeTimeWithDate(
              finalUpdates.date || finalUpdates.checkIn?.time,
              finalUpdates.checkInTimeOnly,
            ),
          };
        }
        if (finalUpdates.checkOutTimeOnly) {
          finalUpdates.checkOut = {
            ...finalUpdates.checkOut,
            time: mergeTimeWithDate(
              finalUpdates.date ||
                finalUpdates.checkOut?.time ||
                finalUpdates.checkIn?.time,
              finalUpdates.checkOutTimeOnly,
            ),
          };
        }
        // ลบฟิลด์ชั่วคราวออกก่อนส่ง API
        delete finalUpdates.checkInTimeOnly;
        delete finalUpdates.checkOutTimeOnly;
        delete finalUpdates.dateOnly;
      }

      if (activeTab === "leave") {
        if (finalUpdates.dateOnly) {
          finalUpdates.startDate = new Date(finalUpdates.dateOnly);
          delete finalUpdates.dateOnly;
        }
      }

      const res = await fetch(`/api/admin/data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          type: activeTab,
          updates: finalUpdates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("อัปเดตข้อมูลสำเร็จ", { id: toastId });
        setEditingId(null);
        fetchData(false);
      } else throw new Error(json.error);
    } catch (err: any) {
      toast.error("อัปเดตไม่สำเร็จ: " + err.message, { id: toastId });
    }
  };

  const TimeSelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (val: string) => void;
  }) => {
    const [h, m] = value ? value.split(":") : ["", ""];
    return (
      <div className="flex w-full items-center bg-slate-50 dark:bg-zinc-900 border rounded-xl outline-none focus-within:border-rose-500">
        <select
          className="bg-transparent px-4 py-3 text-sm font-bold outline-none cursor-pointer text-slate-700 dark:text-zinc-200"
          value={h || ""}
          onChange={(e) => {
            const newH = e.target.value;
            if (!newH && !m) onChange("");
            else onChange(`${newH || "00"}:${m || "00"}`);
          }}
        >
          <option value="">--</option>
          {Array.from({ length: 24 }).map((_, i) => (
            <option key={`h-${i}`} value={i.toString().padStart(2, "0")}>
              {i.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
        <span className="font-bold text-slate-400">:</span>
        <select
          className="bg-transparent px-4 py-3 text-sm font-bold outline-none cursor-pointer text-slate-700 dark:text-zinc-200"
          value={m || ""}
          onChange={(e) => {
            const newM = e.target.value;
            if (!h && !newM) onChange("");
            else onChange(`${h || "00"}:${newM || "00"}`);
          }}
        >
          <option value="">--</option>
          {Array.from({ length: 60 }).map((_, i) => (
            <option key={`m-${i}`} value={i.toString().padStart(2, "0")}>
              {i.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // --- ACCESS CHECK ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    );
  }

  const role = (session?.user as any)?.role;
  if (role !== "super_admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full mb-4">
          <ShieldCheck size={64} />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 mb-2 underline decoration-red-500 underline-offset-8">
          ปฏิเสธการเข้าถึง (ACCESS DENIED)
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 font-medium max-w-md">
          พื้นที่นี้จำกัดสิทธิ์เฉพาะ Super Admin เท่านั้น
          เพื่อความปลอดภัยของข้อมูลหลักในระบบ
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-8 font-sans overflow-x-hidden">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-8 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full">
          <div className=" ">
            <Database size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-5 bg-linear-to-br from-rose-500 to-orange-500 text-white rounded-3xl shadow-lg shadow-rose-500/20">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                  ระบบจัดการข้อมูลขั้นสูง
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    จำกัดสิทธิ์เฉพาะผู้ดูแลระบบสูงสุด (Super Admin Only)
                  </span>
                </div>
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัส, หรือ ID..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-medium text-xs sm:text-sm md:text-base text-slate-700 dark:text-zinc-200 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 w-fit mx-auto md:mx-0">
          {[
            { id: "attendance", label: "การลงเวลา", color: "rose" },
            { id: "leave", label: "การลางาน", color: "emerald" },
            { id: "suvery", label: "แบบสำรวจภาวะการมีงานทำ", color: "blue" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${
                activeTab === tab.id
                  ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/30`
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 px-2 py-4 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-500" />
            <span className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-tight">
              กรองตามวันที่:
            </span>
          </div>

          <div className="flex gap-2">
            {/* Day */}
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">ทุกวัน</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  วันที่ {i + 1}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">ทุกเดือน</option>
              {[
                "มกราคม",
                "กุมภาพันธ์",
                "มีนาคม",
                "เมษายน",
                "พฤษภาคม",
                "มิถุนายน",
                "กรกฎาคม",
                "สิงหาคม",
                "กันยายน",
                "ตุลาคม",
                "พฤศจิกายน",
                "ธันวาคม",
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  พ.ศ. {y + 543}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setFilterDay("");
              setFilterMonth("");
              setFilterYear(new Date().getFullYear().toString());
              setSearchQuery("");
            }}
            className="ml-auto px-6 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <X size={14} /> ล้างการกรอง
          </button>

          <button
            onClick={handleDeleteAll}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95"
          >
            <AlertCircle size={14} /> ลบทั้งหมด ({activeTab.toUpperCase()})
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-950/50 border-bottom border-slate-100 dark:border-zinc-800">
                  <th className="px-2 md:px-4 py-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    ผู้ใช้งาน / รายการ
                  </th>
                  <th className="px-2 md:px-4 py-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    วันที่
                  </th>
                  <th className="px-2 md:px-4 py-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    เวลาเข้า-ออก
                  </th>
                  <th className="px-2 md:px-4 py-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                    สถานะ
                  </th>
                  <th className="px-2 md:px-4 py-4 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-10">
                          <div className="h-8 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full opacity-50"></div>
                        </td>
                      </tr>
                    ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Database size={64} className="text-slate-300" />
                        <span className="text-xl font-black text-slate-400">
                          ไม่พบข้อมูล
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record._id}
                      className={`group transition-all ${editingId === record._id ? "bg-orange-50/30 dark:bg-orange-950/10" : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/30"}`}
                    >
                      {editingId === record._id ? (
                        /* EDIT MODE */
                        <td colSpan={5} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-800 p-6 rounded-3xl border-2 border-orange-200 dark:border-orange-500/20 shadow-xl">
                            <div className="md:col-span-4 flex justify-between items-center mb-2">
                              <h3 className="font-black text-slate-700 dark:text-zinc-200 flex items-center gap-2">
                                <Edit size={16} /> กำลังแก้ไขข้อมูลหลัก
                              </h3>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                วันที่
                              </label>
                              <input
                                type="date"
                                value={editFormData.dateOnly || ""}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    dateOnly: e.target.value,
                                  })
                                }
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl outline-none focus:border-rose-500 font-bold"
                              />
                            </div>

                            {activeTab === "attendance" ? (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    สถานะ
                                  </label>
                                  <select
                                    value={editFormData.status}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        status: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl outline-none focus:border-rose-500 font-bold appearance-none scheme-light-dark"
                                  >
                                    <option value="Present">มาทำงาน</option>
                                    <option value="Late">มาสาย</option>
                                    <option value="Leave">ลางาน</option>
                                    <option value="Absent">ขาดงาน</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    เวลาเข้า (TH)
                                  </label>
                                  <TimeSelect
                                    value={editFormData.checkInTimeOnly || ""}
                                    onChange={(val) =>
                                      setEditFormData({
                                        ...editFormData,
                                        checkInTimeOnly: val,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    เวลาออก (TH)
                                  </label>
                                  <TimeSelect
                                    value={editFormData.checkOutTimeOnly || ""}
                                    onChange={(val) =>
                                      setEditFormData({
                                        ...editFormData,
                                        checkOutTimeOnly: val,
                                      })
                                    }
                                  />
                                </div>
                              </>
                            ) : activeTab === "leave" ? (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    สถานะการอนุมัติ
                                  </label>
                                  <select
                                    value={editFormData.status}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        status: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl outline-none"
                                  >
                                    <option value="pending">รออนุมัติ</option>
                                    <option value="approved">
                                      อนุมัติแล้ว
                                    </option>
                                    <option value="rejected">ปฏิเสธ</option>
                                  </select>
                                </div>
                                <div className="space-y-1 md:col-span-3">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    เหตุผล
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.reason || ""}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        reason: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl outline-none"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    ชื่อ-นามสกุล
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.fullName || ""}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        fullName: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    รหัสนักศึกษา
                                  </label>
                                  <input
                                    type="text"
                                    value={editFormData.studentId || ""}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        studentId: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                    สถานที่
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      editFormData.workPlace ||
                                      editFormData.studyPlace ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        workPlace: e.target.value,
                                      })
                                    }
                                    className="w-full p-3 bg-slate-50 dark:bg-zinc-900 border rounded-xl"
                                  />
                                </div>
                              </>
                            )}

                            <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-700">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
                              >
                                <Save size={18} /> บันทึกการเปลี่ยนแปลง
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        /* NORMAL ROW */
                        <>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              {activeTab !== "suvery" && (
                                <div className="relative shrink-0 group/avatar">
                                  {record.user?.image ? (
                                    <img
                                      src={record.user.image}
                                      alt={record.user.name}
                                      className="w-12 h-12 rounded-[1.25rem] object-cover ring-2 ring-white dark:ring-zinc-800 shadow-lg group-hover/avatar:scale-110 transition-all"
                                    />
                                  ) : (
                                    <div
                                      className={`w-12 h-12 rounded-[1.25rem] ${getAvatarBg(record.user?.name || "")} flex items-center justify-center text-white text-base font-black ring-2 ring-white dark:ring-zinc-800 shadow-lg group-hover/avatar:scale-110 transition-all`}
                                    >
                                      {getInitials(record.user?.name || "")}
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm">
                                    <div
                                      className={`w-3 h-3 rounded-full ${record.status === "Present" || record.status === "approved" ? "bg-emerald-500" : "bg-rose-500"}`}
                                    />
                                  </div>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-zinc-100">
                                  {activeTab === "suvery"
                                    ? record.fullName || "ไม่ระบุชื่อ"
                                    : record.user?.name || "ไม่ทราบชื่อ"}
                                </span>
                                <span className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-tighter">
                                  {activeTab === "suvery"
                                    ? `ID: ${record.studentId}`
                                    : record.user?.username ||
                                      record._id.slice(-8)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700/50 shadow-sm group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                                <span className="text-sm sm:text-lg font-black text-slate-700 dark:text-zinc-200 leading-none">
                                  {
                                    formatDateParts(
                                      activeTab === "attendance"
                                        ? record.date
                                        : record.startDate,
                                    ).day
                                  }
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5">
                                  {
                                    formatDateParts(
                                      activeTab === "attendance"
                                        ? record.date
                                        : record.startDate,
                                    ).month
                                  }
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-400 uppercase leading-none">
                                  ปี พ.ศ.
                                </span>
                                <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                                  {
                                    formatDateParts(
                                      activeTab === "attendance"
                                        ? record.date
                                        : record.startDate,
                                    ).year
                                  }
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {activeTab === "attendance" ? (
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-black text-rose-400 uppercase leading-none mb-1">
                                    เข้า
                                  </span>
                                  <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-zinc-200 tabular-nums">
                                    {formatTime(record.checkIn?.time)}
                                  </span>
                                </div>
                                <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800"></div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[10px] font-black text-blue-400 uppercase leading-none mb-1">
                                    ออก
                                  </span>
                                  <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-zinc-200 tabular-nums">
                                    {formatTime(record.checkOut?.time)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span className="text-xs font-bold text-slate-300">
                                  -
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-shadow group-hover:shadow-sm whitespace-nowrap ${
                                record.status === "Present" ||
                                record.status === "approved" ||
                                record.currentStatus === "ทำงานแล้ว"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                  : record.status === "Late" ||
                                      record.status === "pending"
                                    ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20"
                                    : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20"
                              }`}
                            >
                              {activeTab === "suvery"
                                ? record.currentStatus || "ไม่ทราบ"
                                : STATUS_TH[record.status] || record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2 transition-all">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button: Load More */}
        <div className="flex flex-col items-center gap-4">
          {hasMore && !loading && (
            <button
              onClick={() => fetchData(true)}
              disabled={loadingMore}
              className="group flex items-center gap-3 px-12 py-4 bg-white dark:bg-zinc-900 hover:bg-rose-500 hover:text-white border-2 border-slate-100 dark:border-zinc-800 rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200/50 hover:shadow-rose-500/20"
            >
              {loadingMore ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ChevronDown
                  className="group-hover:translate-y-1 transition-transform"
                  size={18}
                />
              )}
              โหลดข้อมูลเพิ่มอีก 20 รายการ
            </button>
          )}

          {!hasMore && !loading && records.length > 0 && (
            <div className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Database size={14} /> จำนวนรายการทั้งหมดที่แสดง: {records.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
