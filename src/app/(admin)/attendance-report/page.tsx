"use client";

import { useState, useEffect } from "react";
import { Download, Search, FileText, Loader2, X, Camera } from "lucide-react";

const STATUS_TH: Record<string, string> = {
  Present: "มาทำงาน",
  Late: "มาสาย",
  Absent: "ขาดงาน",
  Leave: "ลางาน",
};

const ROLE_TH: Record<string, string> = {
  all: "ทั้งหมด",
  teacher: "ครู",
  staff: "เจ้าหน้าที่",
  janitor: "แม่บ้าน/นักการ",
  hr: "ฝ่ายบุคคล",
  director: "ผู้บริหาร",
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
    fetchRecords();
  }, [startDate, endDate, roleFilter]);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert("ไม่พบข้อมูลที่จะส่งออกครับ (เนื่องจากตารางบันทึกเวลานี้ว่างเปล่าในช่วงวันที่คุณเลือก)");
      return;
    }

    const summaryRows = [
      ["รายงานการเข้างาน (Attendance Report)"],
      [`ช่วงวันที่`, `${startDate} ถึง ${endDate}`],
      [`หมวดหมู่พนักงาน`, `${ROLE_TH[roleFilter] || roleFilter}`],
      [`จำนวนรายการทั้งหมด`, `${filteredRecords.length} รายการ`],
      [`วันที่ส่งออกไฟล์`, `${new Date().toLocaleString("th-TH")}`],
      [], // Empty row for spacing
    ];

    const headers = [
      "วันที่",
      "ชื่อ-สกุล",
      "ตำแหน่ง",
      "สังกัด/แผนก",
      "อีเมล",
      "เข้างาน",
      "ออกงาน",
      "เวลาทำงาน (ชม.)",
      "OT (ชม.)",
      "สถานะ",
      "รูปภาพหลักฐาน",
    ];

    const escape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

    const csvContent = [
      ...summaryRows.map(row => row.map(escape).join(",")),
      headers.map(escape).join(","),
      ...filteredRecords.map((r) => {
        const d = new Date(r.date).toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" });
        const inDate = r.checkInTime ? new Date(r.checkInTime) : null;
        const outDate = r.checkOutTime ? new Date(r.checkOutTime) : null;
        
        const inTimeStr = inDate
          ? inDate.toLocaleTimeString("th-TH", { 
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          : "-";
        
        const outTimeStr = outDate
          ? outDate.toLocaleTimeString("th-TH", { 
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          : "-";

        // Calculate Work Duration
        let duration = "-";
        if (inDate && outDate) {
          const diffMs = outDate.getTime() - inDate.getTime();
          if (diffMs > 0) {
            duration = (diffMs / (1000 * 60 * 60)).toFixed(2);
          }
        }

        const roleName = ROLE_TH[r.user?.role] || r.user?.role || "-";
        const statusThai = STATUS_TH[r.status] || r.status;
        const photoLinks = [r.photoUrl, r.checkOutPhotoUrl].filter(Boolean).join(" | ");

        return [
          d,
          r.user?.name || "-",
          roleName,
          r.user?.department || "-",
          r.user?.email || "-",
          inTimeStr,
          outTimeStr,
          duration,
          r.otHours || 0,
          statusThai,
          photoLinks || "ไม่มีรูป"
        ].map(escape).join(",");
      }),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `report_${startDate}_to_${endDate}_${roleFilter}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-4 px-2 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-neutral-900 p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-neutral-100">
                ระบบรายงานการเข้างาน
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Export ค้นหา และแยกตามหมวดหมู่ ครู เจ้าหน้าที่ ภารโรง
              </p>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            className="group relative flex items-center gap-3 bg-linear-to-br from-slate-800 to-slate-900 hover:from-black hover:to-slate-800 dark:from-white dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white dark:text-black text-white px-8 py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-300 font-black active:scale-95 border border-slate-700/50 dark:border-slate-200"
          >
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </div>
            <Download size={22} className="group-hover:translate-y-0.5 transition-transform" /> 
            <span className="tracking-tight text-lg">ออกแบบรายงาน (CSV)</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-4xl shadow-sm border border-slate-100 dark:border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                ค้นหารายชื่อพนักงาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อพนักงาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 dark:text-neutral-200"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                หมวดหมู่พนักงาน
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 dark:text-neutral-200 appearance-none"
              >
                <option value="all">ทั้งหมด (ALL)</option>
                <option value="teacher">ครู (TEACHER)</option>
                <option value="staff">เจ้าหน้าที่ (STAFF)</option>
                <option value="janitor">ภารโรง (JANITOR)</option>
                <option value="hr">ฝ่ายบุคคล (HR)</option>
                <option value="director">ผู้บริหาร (DIRECTOR)</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 dark:text-neutral-200"
              />
            </div>

            <div className="w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-3 w-full rounded-2xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 dark:text-neutral-200"
              />
            </div>
          </div>
        </div>

        {/* Legend & Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
          <p className="text-xs text-slate-400 dark:text-neutral-500 flex items-center gap-1.5 font-medium">
            <Camera size={12} className="text-blue-500" />
            เวลาที่มีไอคอนกล้อง = คลิกเพื่อดูรูปหลักฐานพนักงาน
          </p>
          <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-neutral-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-neutral-400 uppercase tracking-widest">
              พบ {filteredRecords.length} รายการ
            </span>
          </div>
        </div>

        {/* Daily Summary Table */}
        {dailySummary.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-slate-100 dark:border-neutral-800 shadow-sm overflow-hidden mb-6">
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

        {/* Table Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-neutral-800/50 border-b border-slate-100 dark:border-neutral-800 text-slate-500 dark:text-neutral-400">
                  {/* ปรับ text-xs สำหรับมือถือ และ text-sm สำหรับจอใหญ่ */}
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm whitespace-nowrap">
                    วันที่
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm whitespace-nowrap">
                    พนักงาน
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm whitespace-nowrap">
                    สังกัด / แผนก
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm whitespace-nowrap">
                    เข้างาน{" "}
                    <span className="hidden sm:inline text-[10px] text-sky-600 font-normal">
                      (📷=มีรูป)
                    </span>
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm whitespace-nowrap">
                    ออกงาน{" "}
                    <span className="hidden sm:inline text-[10px] text-sky-600 font-normal">
                      (📷=มีรูป)
                    </span>
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm text-center">
                    OT
                  </th>
                  <th className="px-3 md:px-4 py-3 font-bold text-xs md:text-sm">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2
                        size={24}
                        className="animate-spin mx-auto mb-2 text-blue-500"
                      />
                      <span className="text-xs md:text-sm text-slate-400">
                        กำลังโหลด...
                      </span>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-xs md:text-sm text-slate-400 font-medium"
                    >
                      ไม่พบข้อมูลการลงเวลา
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* วันที่: ปรับขนาดฟอนต์ให้เล็กลงในมือถือ */}
                      <td className="px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-slate-700 dark:text-neutral-300 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("th-TH", {
                          timeZone: "Asia/Bangkok",
                          day: "numeric",
                          month: "short",
                          year: "2-digit", // ใช้ปีแบบสั้นเพื่อประหยัดพื้นที่
                        })}
                      </td>

                      {/* ข้อมูลพนักงาน: ใช้ลอจิกซ่อน Email ในจอเล็กเพื่อประหยัดพื้นที่ */}
                      <td className="px-3 md:px-4 py-3">
                        <div className="max-w-[120px] md:max-w-none">
                          <p className="font-bold text-xs md:text-sm text-slate-800 dark:text-neutral-200 truncate">
                            {r.user.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 truncate hidden md:block">
                            {r.user.email}
                          </p>
                        </div>
                      </td>

                      {/* สังกัด / แผนก */}
                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-neutral-400">
                          {r.user.department || "-"}
                        </span>
                      </td>

                      {/* เวลาเข้า/ออก: ใช้ขนาดตัวอักษรที่ยืดหยุ่น */}
                      <td className="px-3 md:px-4 py-3">
                        <TimeCell
                          time={r.checkInTime}
                          photoUrl={r.photoUrl}
                          label="เข้า"
                          colorClass="text-green-600 dark:text-green-400 text-xs md:text-sm"
                        />
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <TimeCell
                          time={r.checkOutTime}
                          photoUrl={r.checkOutPhotoUrl}
                          label="ออก"
                          colorClass="text-orange-500 dark:text-orange-400 text-xs md:text-sm"
                        />
                      </td>

                      {/* OT: ปรับ Badge ให้เล็กลง */}
                      <td className="px-3 md:px-4 py-3 text-center">
                        {r.otHours ? (
                          <span className="bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold border border-orange-100 dark:border-orange-900/50">
                            {r.otHours} ชม.
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* สถานะ: ปรับ Padding และ Text Size */}
                      <td className="px-3 md:px-4 py-3 text-right md:text-left">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] md:text-xs font-bold uppercase tracking-tight rounded-md border ${
                            r.status === "Present"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : r.status === "Late"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                : "bg-red-50 text-red-700 border-red-100"
                          }`}
                        >
                          {STATUS_TH[r.status] || r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setShowDailyDetailModal(null)}
          />

          <div
            className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 dark:border-neutral-800 flex flex-col max-h-[85vh]"
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
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{ROLE_TH[u.role] || u.role} • {u.department}</p>
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
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{ROLE_TH[u.role] || u.role} • {u.department}</p>
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
