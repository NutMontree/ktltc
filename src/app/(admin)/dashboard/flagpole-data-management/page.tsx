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
  MapPin,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function FlagpoleDataManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [records, setRecords] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

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

  // การฟอร์แมตเวลา
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

  // ดึงเวลาแบบ Local Time (HH:mm)
  const getTHTime = (dateStr: any) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "HH:mm");
    } catch (e) {
      return "";
    }
  };

  // รวมเวลา HH:mm กับวันที่
  const mergeTimeWithDate = (originalDateStr: any, localTimeStr: string) => {
    if (!localTimeStr || !originalDateStr) return null;
    try {
      const d = new Date(originalDateStr);
      const [hours, minutes] = localTimeStr.split(":").map(Number);
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

  const STATUS_TH: Record<string, string> = {
    Present: "ตรงเวลา",
    Late: "มาสาย",
  };

  /**
   * Fetch Flagpole Data
   */
  const fetchFlagpoleData = async (
    isLoadMore = false,
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
      let url = `/api/admin/flagpole-data?limit=${LIMIT}&skip=${currentSkip}&search=${encodeURIComponent(search)}&_t=${Date.now()}`;

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
        setTotalCount(json.total);
        setSkip(currentSkip);
        setHasMore(json.data.length === LIMIT);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("ไม่สามารถดึงข้อมูลประวัติการเข้าแถวได้");
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

  // Initial Load & Filter Changes
  useEffect(() => {
    if (status === "authenticated") {
      fetchFlagpoleData(false, debouncedSearch);
    }
    return () => abortControllerRef.current?.abort();
  }, [debouncedSearch, filterDay, filterMonth, filterYear, status]);

  // สิทธิ์ความปลอดภัย
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const role = (session?.user as any)?.role?.toLowerCase();
      if (!["super_admin", "admin"].includes(role)) {
        router.replace("/");
      }
    }
  }, [status, session]);

  /**
   * Action Handlers
   */
  const handleDelete = async (id: string) => {
    if (!confirm("🚨 ยืนยันการลบข้อมูลการเข้าแถวของนักเรียนรายนี้ถาวร?")) return;
    try {
      const res = await fetch(`/api/admin/flagpole-data?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("ลบข้อมูลประวัติเช็คชื่อสำเร็จ");
        fetchFlagpoleData(false);
      } else throw new Error(json.error);
    } catch (err: any) {
      toast.error("ลบข้อมูลไม่สำเร็จ: " + err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "🚨 [คำเตือนวิกฤต] คุณกำลังจะลบข้อมูลประวัติการเข้าแถวทั้งหมดในระบบ! การกระทำนี้ไม่สามารถย้อนกลับได้ คุณแน่ใจหรือไม่?",
      )
    )
      return;

    const confirmText = prompt(
      'กรุณาพิมพ์คำว่า "DELETE ALL" เพื่อยืนยันการล้างประวัติเสาธงทั้งหมด:',
    );
    if (confirmText !== "DELETE ALL") {
      return toast.error("การยืนยันไม่ถูกต้อง ยกเลิกคำสั่ง");
    }

    const toastId = toast.loading("กำลังล้างข้อมูลประวัติทั้งหมด...");
    try {
      const res = await fetch(`/api/admin/flagpole-data?deleteAll=true`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("ลบข้อมูลการเข้าแถวทั้งหมดสำเร็จเรียบร้อยแล้ว", { id: toastId });
        fetchFlagpoleData(false);
      } else throw new Error(json.error);
    } catch (err: any) {
      toast.error("ลบข้อมูลไม่สำเร็จ: " + err.message, { id: toastId });
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record._id);
    setEditFormData({
      ...record,
      checkInTimeOnly: getTHTime(record.checkIn?.time),
      dateOnly: formatDateParts(record.date).full,
      distanceOnly: record.checkIn?.distance !== undefined ? Math.round(record.checkIn.distance) : 0,
    });
  };

  const handleSaveEdit = async () => {
    const toastId = toast.loading("กำลังบันทึกข้อมูลหลักเสาธง...");
    try {
      const finalUpdates = { ...editFormData };

      if (finalUpdates.dateOnly) {
        const [y, m, dd] = finalUpdates.dateOnly.split("-").map(Number);
        finalUpdates.date = new Date(y, m - 1, dd);
      }

      const mergedTime = mergeTimeWithDate(
        finalUpdates.date || finalUpdates.checkIn?.time,
        finalUpdates.checkInTimeOnly,
      );

      finalUpdates.checkIn = {
        ...finalUpdates.checkIn,
        time: mergedTime,
        distance: parseFloat(finalUpdates.distanceOnly || 0)
      };

      // ลบฟิลด์ชั่วคราวออก
      delete finalUpdates.checkInTimeOnly;
      delete finalUpdates.dateOnly;
      delete finalUpdates.distanceOnly;

      const res = await fetch(`/api/admin/flagpole-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          updates: finalUpdates,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("อัปเดตข้อมูลเข้าแถวสำเร็จ", { id: toastId });
        setEditingId(null);
        fetchFlagpoleData(false);
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
      <div className="flex w-full items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus-within:border-indigo-500">
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-8 font-sans overflow-x-hidden text-left selection:bg-indigo-500/20">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-zinc-900 px-4 py-8 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-zinc-800 relative overflow-hidden group w-full">
          <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none text-indigo-500">
            <Database size={180} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-5 bg-linear-to-br from-indigo-500 to-indigo-700 text-white rounded-3xl shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                  แก้ไขข้อมูลการลงเข้าแถว
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    พื้นที่ดูแลและแก้ไขพิกัดประวัตินักศึกษา (Admin Control Center)
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
                placeholder="ค้นหาชื่อ, รหัสนักเรียน, หรือชั้นเรียน..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-xs sm:text-sm md:text-base text-slate-700 dark:text-zinc-200 shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" />
            <span className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-tight">
              ตัวกรองวันที่:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Day */}
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
              className="px-4 py-2 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-slate-650 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
            className="ml-auto px-6 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
          >
            <X size={14} /> ล้างการกรอง
          </button>

          <button
            onClick={handleDeleteAll}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer"
          >
            <AlertCircle size={14} /> ล้างประวัติเสาธงทั้งหมด
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white dark:bg-zinc-900 rounded-4xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-zinc-950/50 border-bottom border-slate-100 dark:border-zinc-800">
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    นักศึกษา / ปีการศึกษา
                  </th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    วันที่เช็คแถว
                  </th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    เวลาบันทึก & ระยะห่าง GPS
                  </th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                    สถานะการเข้าแถว
                  </th>
                  <th className="px-6 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">
                    การจัดการข้อมูล
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
                        <span className="text-xl font-black text-slate-400">ไม่พบประวัติข้อมูลเข้าแถว</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record._id}
                      className={`group transition-all ${editingId === record._id ? "bg-indigo-50/20 dark:bg-indigo-950/10" : "hover:bg-slate-50/80 dark:hover:bg-zinc-800/30"}`}
                    >
                      {editingId === record._id ? (
                        /* EDIT MODE */
                        <td colSpan={5} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-indigo-500 shadow-xl">
                            <div className="md:col-span-4 flex justify-between items-center mb-2">
                              <h3 className="font-black text-slate-700 dark:text-zinc-200 flex items-center gap-2">
                                <Edit size={16} className="text-indigo-500" /> กำลังแก้ไขข้อมูลประวัติเช็คชื่อเสาธง
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
                                วันที่ทำกิจกรรม
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
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 font-bold"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                สถานะการเช็คแถว
                              </label>
                              <select
                                value={editFormData.status}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    status: e.target.value,
                                  })
                                }
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 font-bold appearance-none scheme-light-dark"
                              >
                                <option value="Present">ตรงเวลา</option>
                                <option value="Late">มาสาย</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                                เวลาลงชื่อ (TH)
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
                                ระยะห่างเสาธง (เมตร)
                              </label>
                              <input
                                type="number"
                                value={editFormData.distanceOnly}
                                onChange={(e) =>
                                  setEditFormData({
                                    ...editFormData,
                                    distanceOnly: e.target.value,
                                  })
                                }
                                className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 font-bold"
                              />
                            </div>

                            <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                              >
                                <Save size={16} /> บันทึกการแก้ไข
                              </button>
                            </div>
                          </div>
                        </td>
                      ) : (
                        /* VIEW MODE */
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {record.user?.image ? (
                                <img
                                  src={record.user.image}
                                  alt={record.user.name}
                                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-zinc-850 shadow-sm"
                                />
                              ) : (
                                <div
                                  className={`w-10 h-10 rounded-xl ${getAvatarBg(record.user?.name || "น")} flex items-center justify-center text-white text-xs font-black ring-2 ring-white dark:ring-zinc-850 shadow-sm`}
                                >
                                  {getInitials(record.user?.name || "น")}
                                </div>
                              )}
                              <div>
                                <p className="font-black text-slate-800 dark:text-zinc-100 text-sm">
                                  {record.user?.name}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                                  ID: {record.user?.studentId} • {record.user?.academicLevel}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-zinc-400">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-350 font-black">
                                <Clock size={12} className="text-indigo-500" />
                                {formatTime(record.checkIn?.time)} น.
                              </div>
                              {record.checkIn?.distance !== undefined && (
                                <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase">
                                  <MapPin size={10} />
                                  ห่าง {Math.round(record.checkIn.distance)} ม.
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${
                              record.status === "Present"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30"
                                : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${record.status === "Present" ? "bg-emerald-500" : "bg-amber-500"}`} />
                              {STATUS_TH[record.status] || record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all cursor-pointer"
                              >
                                <Trash2 size={14} />
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

        {/* Load More Button */}
        <div className="flex flex-col items-center gap-4 py-8">
          {hasMore && !loading && (
            <button
              onClick={() => fetchFlagpoleData(true)}
              disabled={loadingMore}
              className="group flex items-center gap-3 px-12 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-4xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 text-slate-850 dark:text-zinc-200 cursor-pointer"
            >
              {loadingMore ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <ChevronDown className="group-hover:translate-y-1 transition-transform" size={18} />
              )}
              โหลดข้อมูลประวัติเพิ่ม
            </button>
          )}

          {!hasMore && !loading && records.length > 0 && (
            <div className="px-6 py-3 bg-slate-100 dark:bg-zinc-850/50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border border-slate-200 dark:border-zinc-800/50">
              <Database size={14} /> บันทึกสิทธิประวัติเช็คแถวที่พบทั้งหมด: {totalCount} รายการ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
