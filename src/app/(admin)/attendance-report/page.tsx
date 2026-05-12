"use client";

import { useState, useEffect } from "react";
import { Download, Search, FileText, Loader2, X, Camera, Calendar, Clock, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_TH: Record<string, string> = {
  Present: "มาทำงาน",
  Late: "มาสาย",
  Absent: "ขาดงาน",
  Leave: "ลางาน",
  Holiday: "วันหยุด",
};

type PhotoPreview = {
  url: string;
  label: string; // "เข้างาน" | "ออกงาน"
};

export default function AttendanceReportPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any[]>([]);
  const [visibleSummaryCount, setVisibleSummaryCount] = useState(10);
  const [showDailyDetailModal, setShowDailyDetailModal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PhotoPreview | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleMap, setRoleMap] = useState<Record<string, string>>({ all: "ทั้งหมด" });
  const [visibleRecordsCount, setVisibleRecordsCount] = useState(20);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/admin/role-settings");
        const data = await res.json();
        const map: Record<string, string> = { all: "ทั้งหมด" };
        data.forEach((r: any) => {
          if (r.role !== "system_global") {
            map[r.role] = r.roleName;
          }
        });
        setRoleMap(map);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };
    fetchRoles();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance/report?startDate=${startDate}&endDate=${endDate}&role=${roleFilter}&_t=${Date.now()}`,
      );
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
        
        // Compute daily summary
        const summaryMap: Record<string, any> = {};
        json.data.forEach((r: any) => {
          const dStr = new Date(r.date).toISOString().split('T')[0];
          if (!summaryMap[dStr]) {
            summaryMap[dStr] = {
              date: dStr,
              totalUsers: 0,
              submittedCount: 0,
              missingCount: 0,
              submittedUsers: [],
              missingUsers: []
            };
          }
          
          summaryMap[dStr].totalUsers++;
          const uData = {
            id: r.userId || r.id,
            name: r.user.name,
            role: r.user.role,
            department: r.user.department
          };
          
          if (r.status === "Absent") {
            summaryMap[dStr].missingCount++;
            summaryMap[dStr].missingUsers.push(uData);
          } else {
            summaryMap[dStr].submittedCount++;
            summaryMap[dStr].submittedUsers.push(uData);
          }
        });
        
        // Sort newest first
        const sortedSummary = Object.values(summaryMap).sort((a: any, b: any) => b.date.localeCompare(a.date));
        setDailySummary(sortedSummary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleRecordsCount(20);
    fetchRecords();
  }, [startDate, endDate, roleFilter]);

  const exportToExcel = () => {
    if (filteredRecords.length === 0) {
      alert("ไม่พบข้อมูลที่จะส่งออกครับ");
      return;
    }

    const data = filteredRecords.map((r) => {
      const inDate = r.checkInTime ? new Date(r.checkInTime) : null;
      const outDate = r.checkOutTime ? new Date(r.checkOutTime) : null;
      
      let duration = "-";
      if (inDate && outDate) {
        const diffMs = outDate.getTime() - inDate.getTime();
        if (diffMs > 0) duration = (diffMs / (1000 * 60 * 60)).toFixed(2);
      }

      return {
        "วันที่": new Date(r.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" }),
        "ชื่อ-นามสกุล": r.user?.name || "-",
        "ตำแหน่ง": roleMap[r.user?.role] || r.user?.role || "-",
        "แผนก/สังกัด": r.user?.department || "-",
        "เวลาเข้า": inDate ? inDate.toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: '2-digit', minute: '2-digit', hour12: false }) : "-",
        "เวลาออก": outDate ? outDate.toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok", hour: '2-digit', minute: '2-digit', hour12: false }) : "-",
        "ชั่วโมงทำงาน": duration,
        "OT (ชม.)": r.otHours || 0,
        "สถานะ": STATUS_TH[r.status] || r.status,
        "หมายเหตุ": r.status === "Holiday" ? (r.holidayName || "วันหยุดนักขัตฤกษ์") : ""
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(finalData, `Attendance_Report_${startDate}_to_${endDate}.xlsx`);
  };

  const filteredRecords = records.filter((r) =>
    r.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /** แสดงเวลา — ถ้ามีรูปให้กดได้ */
  const TimeCell = ({
    time,
    photoUrl,
    label,
    colorClass,
  }: {
    time: string | null;
    photoUrl?: string | null;
    label: string;
    colorClass: string;
  }) => {
    if (!time) return <span className="text-slate-300 text-sm">-</span>;

    const timeStr = new Date(time).toLocaleTimeString("th-TH", { 
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false 
    }) + " น.";

    if (photoUrl) {
      return (
        <button
          onClick={() => setPreview({ url: photoUrl, label })}
          title={`คลิกดูรูปหลักฐาน${label}`}
          className={`group inline-flex items-center gap-1.5 font-semibold text-sm ${colorClass} hover:underline underline-offset-2 transition-all`}
        >
          <Camera
            size={13}
            className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
          />
          {timeStr}
        </button>
      );
    }

    return (
      <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">
        {timeStr}
      </span>
    );
  };
  
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-2 py-4 md:p-8 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-neutral-100 uppercase tracking-tight">
                ระบบรายงานการเข้างาน
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Export ค้นหา และแยกตามหมวดหมู่ ครู เจ้าหน้าที่ ภารโรง
              </p>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="group relative flex items-center gap-3 bg-linear-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-white dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white dark:text-black text-white px-8 py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-300 font-black active:scale-95 border border-emerald-500/50 dark:border-slate-200"
          >
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </div>
            <Download size={22} className="group-hover:translate-y-0.5 transition-transform" /> 
            <span className="tracking-tight text-lg">ดาวน์โหลดรายงาน (Excel)</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-5 gap-4 items-end w-full">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              ค้นหารายชื่อพนักงาน
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="พิมพ์ชื่อพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              หมวดหมู่พนักงาน
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-sm appearance-none"
            >
              {Object.entries(roleMap).map(([val, label]) => (
                <option key={val} value={val}>
                  {label} ({val.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
                วันที่เริ่มต้น
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-2xl focus:outline-none font-bold appearance-none scheme-light-dark text-sm"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              วันที่สิ้นสุด
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 rounded-2xl focus:outline-none font-bold appearance-none scheme-light-dark text-sm"
              />
            </div>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 dark:border-neutral-800 shadow-sm mb-4 gap-4">
          <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1.5 font-bold">
            <Camera size={14} className="text-blue-500" />
            เวลาที่มีไอคอนกล้อง = คลิกเพื่อดูรูปหลักฐานพนักงาน
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-600 dark:text-neutral-400">
                แสดงอยู่:{" "}
                <span className="text-slate-900 dark:text-white font-black">
                  {filteredRecords.length}
                </span>{" "}
                รายการ
              </span>
            </div>
          </div>
        </div>

        {/* Daily Summary Table */}
        {dailySummary.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-4xl border border-slate-100 dark:border-neutral-800 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 dark:bg-neutral-800 dark:border-neutral-700">
              <p className="text-xs font-black text-slate-600 dark:text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> สรุปการเข้างานรายวัน
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-neutral-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่</th>
                    <th className="px-6 py-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">มาทำงาน/ลา (คน)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center">ขาดงาน (คน)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center">รวมเป้าหมาย (คน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/50">
                  {dailySummary.slice(0, visibleSummaryCount).map((sum, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-neutral-200">
                        {new Date(sum.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                         onClick={() => setShowDailyDetailModal(sum)}
                         className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-black outline-none hover:ring-2 hover:ring-emerald-500/30 transition-all cursor-pointer">
                          {sum.submittedCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                         onClick={() => setShowDailyDetailModal(sum)}
                         className="px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-xs font-black outline-none hover:ring-2 hover:ring-rose-500/30 transition-all cursor-pointer">
                          {sum.missingCount}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-full text-xs font-black">
                          {sum.totalUsers}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {dailySummary.length > visibleSummaryCount && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 dark:bg-neutral-900 dark:border-neutral-800 flex justify-center">
                <button
                  onClick={() => setVisibleSummaryCount(prev => prev + 10)}
                  className="px-6 py-2 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-black text-slate-600 dark:text-neutral-300 uppercase tracking-widest rounded-full hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all shadow-sm cursor-pointer"
                >
                  ดูเพิ่มเติม (อีก {Math.min(10, dailySummary.length - visibleSummaryCount)} วัน)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {loading && filteredRecords.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  กำลังโหลดข้อมูล...
                </p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white dark:bg-neutral-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-neutral-800">
                <AlertCircle size={48} className="text-slate-200 dark:text-neutral-800 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">ไม่พบข้อมูลการลงเวลา</p>
              </div>
            ) : (
              <>
                {filteredRecords.slice(0, visibleRecordsCount).map((r) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-neutral-900 p-4 rounded-4xl border border-slate-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                      <Clock size={80} />
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      {r.user.image ? (
                        <img src={r.user.image} alt={r.user.name} className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-slate-100 dark:border-neutral-800" />
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl ${getAvatarBg(r.user.name)} flex items-center justify-center text-white font-black text-xl shadow-lg border border-slate-100 dark:border-neutral-800`}>
                          {getInitials(r.user.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-800 dark:text-neutral-100 text-lg leading-tight truncate">
                          {r.user.name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest leading-none mt-1 truncate">
                          {roleMap[r.user.role] || r.user.role} • {r.user.department || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-neutral-800/50">
                        <span className="text-slate-500 font-bold flex items-center gap-1.5">
                          <Calendar size={14} className="text-blue-500" /> 
                          {new Date(r.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                          r.status === "Present" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" :
                          r.status === "Late" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" :
                          r.status === "Holiday" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" :
                          "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        }`}>
                          {STATUS_TH[r.status] || r.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                             เข้างาน
                          </p>
                          <TimeCell time={r.checkInTime} photoUrl={r.photoUrl} label="เข้างาน" colorClass="text-emerald-700 dark:text-emerald-300 text-lg" />
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
                             ออกงาน
                          </p>
                          <TimeCell time={r.checkOutTime} photoUrl={r.checkOutPhotoUrl} label="ออกงาน" colorClass="text-orange-700 dark:text-orange-300 text-lg" />
                        </div>
                      </div>
                      
                      {r.otHours ? (
                         <div className="flex justify-center mt-2">
                           <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-[10px] font-black border border-orange-200 dark:border-orange-800/50 flex items-center gap-1.5">
                             <Clock size={12} /> ทำงานล่วงเวลา (OT): {r.otHours} ชม.
                           </span>
                         </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
                
                {filteredRecords.length > visibleRecordsCount && (
                  <div className="col-span-full flex justify-center pt-8">
                    <button
                      onClick={() => setVisibleRecordsCount(prev => prev + 20)}
                      className="flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      แสดงเพิ่มอีก 20 รายการ (เหลืออีก {filteredRecords.length - visibleRecordsCount} รายการ)
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition z-10"
            >
              <X size={20} />
            </button>

            {/* Label badge */}
            <div
              className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow ${
                preview.label === "เข้างาน"
                  ? "bg-green-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              <Camera size={11} />
              หลักฐาน{preview.label}
            </div>

            <img
              src={preview.url}
              alt={`หลักฐานรูปถ่าย${preview.label}`}
              className="w-full rounded-2xl shadow-2xl border-4 border-white"
            />
            <p className="text-center text-white/70 text-xs mt-3">
              คลิกนอกรูปเพื่อปิด
            </p>
          </div>
        </div>
      )}

      {/* Daily Detail Modal */}
      {showDailyDetailModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowDailyDetailModal(null)}
          />

          <div
            className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-4xl shadow-2xl overflow-hidden border border-white/20 dark:border-neutral-800 flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50 dark:bg-neutral-800/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-neutral-100">
                  สรุปการเข้างานรายวัน
                </h3>
                <p className="text-sm font-bold text-slate-500 md:text-indigo-500 mt-1 uppercase tracking-widest">
                  วันที่ {new Date(showDailyDetailModal.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setShowDailyDetailModal(null)}
                className="p-3 bg-white dark:bg-neutral-900 rounded-full text-slate-400 hover:text-rose-500 transition-colors shadow-sm cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Present List */}
                <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/20">
                   <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 mb-4 flex items-center justify-between">
                     <span>มาทำงาน/ลางาน</span>
                     <span className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-full text-xs">{showDailyDetailModal.submittedUsers?.length || 0} คน</span>
                   </h4>
                   <div className="space-y-2">
                     {showDailyDetailModal.submittedUsers?.map((u: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-3 rounded-2xl shadow-sm border border-emerald-50 dark:border-neutral-700/50">
                         <div className={`w-8 h-8 rounded-xl ${getAvatarBg(u.name)} flex items-center justify-center text-white text-xs font-black`}>
                            {getInitials(u.name)}
                         </div>
                         <div>
                           <p className="text-xs font-bold text-slate-800 dark:text-neutral-200">{u.name}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{roleMap[u.role] || u.role} • {u.department}</p>
                         </div>
                       </div>
                     ))}
                     {(!showDailyDetailModal.submittedUsers || showDailyDetailModal.submittedUsers.length === 0) && (
                       <div className="text-center py-6 text-slate-400 font-bold text-xs bg-white/50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900">
                         ไม่มีคนเข้างาน
                       </div>
                     )}
                   </div>
                </div>

                {/* Absent List */}
                <div className="bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                   <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 mb-4 flex items-center justify-between">
                     <span>ขาดงาน</span>
                     <span className="bg-rose-100 dark:bg-rose-900/50 px-3 py-1 rounded-full text-xs">{showDailyDetailModal.missingUsers?.length || 0} คน</span>
                   </h4>
                   <div className="space-y-2">
                     {showDailyDetailModal.missingUsers?.map((u: any, idx: number) => (
                       <div key={idx} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-3 rounded-2xl shadow-sm border border-rose-50 dark:border-neutral-700/50">
                         <div className={`w-8 h-8 rounded-xl ${getAvatarBg(u.name)} flex items-center justify-center text-white text-xs font-black grayscale opacity-80`}>
                            {getInitials(u.name)}
                         </div>
                         <div>
                           <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">{u.name}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{roleMap[u.role] || u.role} • {u.department}</p>
                         </div>
                       </div>
                     ))}
                     {(!showDailyDetailModal.missingUsers || showDailyDetailModal.missingUsers.length === 0) && (
                       <div className="text-center py-6 text-slate-400 font-bold text-xs bg-white/50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-rose-200 dark:border-rose-900">
                         สุดยอด! วันนี้ไม่มีคนขาดงาน
                       </div>
                     )}
                   </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
