"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import {
  Loader2,
  BarChart2,
  Download,
  ArrowLeft,
} from "lucide-react";
import { DEPARTMENT_GROUPS } from "@/constants/departments";
import { toast, Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export default function FlagpoleEvaluationPage() {
  const { status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const getLocalTodayDateString = () => {
    const d = new Date();
    const thaiTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return thaiTime.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 4); // roughly a semester
    const thaiTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return thaiTime.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => getLocalTodayDateString());

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [classGroupFilter, setClassGroupFilter] = useState("");
  const [availableClassGroups, setAvailableClassGroups] = useState<string[]>([]);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchClassGroups = async (dept: string) => {
    try {
      const res = await fetch(`/api/admin/flagpole-attendances?department=${encodeURIComponent(dept)}&limit=1`);
      const json = await res.json();
      if (json.classGroups) {
        setAvailableClassGroups(json.classGroups);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDepartmentFilter(val);
    setClassGroupFilter("");
    if (val) {
      fetchClassGroups(val);
    } else {
      setAvailableClassGroups([]);
    }
  };

  const evaluateData = async () => {
    if (!startDate || !endDate) {
      toast.error("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
      return;
    }

    if (!departmentFilter) {
      toast.error("กรุณาเลือกแผนกวิชา");
      return;
    }

    setLoading(true);
    setHasEvaluated(true);

    try {
      // ดึงข้อมูลทั้งหมดโดยวนลูป pagination เพื่อไม่ให้ข้อมูลหาย
      const PAGE_SIZE = 5000;
      let allRecords: any[] = [];
      let currentPage = 1;
      let keepFetching = true;

      while (keepFetching) {
        const res = await fetch(
          `/api/admin/flagpole-attendances?startDate=${startDate}&endDate=${endDate}&department=${encodeURIComponent(
            departmentFilter
          )}&classGroupId=${encodeURIComponent(classGroupFilter)}&page=${currentPage}&limit=${PAGE_SIZE}`
        );
        const json = await res.json();

        if (json.success && json.data) {
          allRecords = allRecords.concat(json.data);
          if (json.hasMore) {
            currentPage++;
          } else {
            keepFetching = false;
          }
        } else {
          keepFetching = false;
        }
      }

      if (allRecords.length === 0) {
        setData([]);
        toast.error("ไม่พบข้อมูลในช่วงเวลาที่เลือก");
        return;
      }

      // Group by user
      const userStats: Record<string, any> = {};

      allRecords.forEach((r: any) => {
        if (!r.user) return;
        const uId = r.user.studentId || r.user.email || r.user.id;

        if (!userStats[uId]) {
          userStats[uId] = {
            studentId: r.user.studentId || "-",
            name: r.user.name || "-",
            department: r.user.department || "-",
            classGroupId: r.user.classGroupId || "-",
            academicLevel: r.user.academicLevel || "-",
            present: 0,
            late: 0,
            absent: 0,
            total: 0,
          };
        }

        userStats[uId].total++;
        if (r.status === "Present") userStats[uId].present++;
        else if (r.status === "Late") userStats[uId].late++;
        else if (r.status === "Absent") userStats[uId].absent++;
      });

      // Convert to array and calculate percentages
      const evaluatedList = Object.values(userStats).map((stat: any) => {
        const presentLate = stat.present + stat.late;
        const percent = stat.total > 0 ? (presentLate / stat.total) * 100 : 0;
        return { ...stat, percent: percent.toFixed(2) };
      });

      // Sort by department, class, then name
      evaluatedList.sort((a, b) => {
        if (a.department !== b.department) return a.department.localeCompare(b.department, 'th');
        if (a.classGroupId !== b.classGroupId) return a.classGroupId.localeCompare(b.classGroupId, 'th');
        return a.name.localeCompare(b.name, 'th');
      });

      setData(evaluatedList);

      if (evaluatedList.length > 0) {
        toast.success(`ประมวลผลเสร็จสิ้น พบข้อมูล ${evaluatedList.length} คน`);
      } else {
        toast.error("ไม่พบข้อมูลนักศึกษาในช่วงเวลาที่เลือก");
      }
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการประมวลผล");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }
    const exportData = data.map((d, i) => ({
      "ลำดับ": i + 1,
      "รหัสนักศึกษา": d.studentId,
      "ชื่อ-สกุล": d.name,
      "แผนกวิชา": d.department,
      "ระดับชั้น": d.academicLevel,
      "ห้องเรียน": d.classGroupId,
      "มาตรงเวลา (วัน)": d.present,
      "มาสาย (วัน)": d.late,
      "ขาดแถว (วัน)": d.absent,
      "รวมวันที่มีกิจกรรม": d.total,
      "ร้อยละการเข้าร่วม (%)": parseFloat(d.percent),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluation Result");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `Flagpole_Evaluation_${startDate}_to_${endDate}.xlsx`);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 px-2 py-4 md:p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/flagpole-reports" className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>
            <div className="p-4 bg-indigo-500 text-white rounded-2xl">
              <BarChart2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100">ประเมินผลหน้าเสาธงรายภาคเรียน</h1>
              <p className="text-xs text-slate-500 font-bold mt-1">สรุปข้อมูลการเข้าแถวทั้งหมดในช่วงเวลาที่กำหนด</p>
            </div>
          </div>
          
          <button
            onClick={exportToExcel}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={18} /> ดาวน์โหลดผลประเมิน (Excel)
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">ตั้งแต่วันที่</label>
              <DatePicker
                format="DD/MM/BBBB"
                allowClear={false}
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) => setStartDate(date ? date.format("YYYY-MM-DD") : "")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">ถึงวันที่</label>
              <DatePicker
                format="DD/MM/BBBB"
                allowClear={false}
                value={endDate ? dayjs(endDate) : null}
                onChange={(date) => setEndDate(date ? date.format("YYYY-MM-DD") : "")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">แผนกวิชา</label>
              <select
                value={departmentFilter}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="" disabled>-- เลือกแผนกวิชา --</option>
                {DEPARTMENT_GROUPS.find((g) => g.label.includes("แผนกวิชา"))?.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">ห้องเรียน</label>
              <select
                value={classGroupFilter}
                onChange={(e) => setClassGroupFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                disabled={!departmentFilter && availableClassGroups.length === 0}
              >
                <option value="">ทั้งหมด</option>
                {availableClassGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={evaluateData}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <BarChart2 size={18} />} ประมวลผลข้อมูล
            </button>
          </div>
        </div>

        {/* Results */}
        {hasEvaluated && (
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">ลำดับ</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">รหัส / ชื่อ-สกุล</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">แผนก / ห้องเรียน</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase text-center">วันที่มีกิจกรรม</th>
                    <th className="p-4 text-xs font-black text-emerald-600 uppercase text-center">เข้าแถว/สาย</th>
                    <th className="p-4 text-xs font-black text-rose-500 uppercase text-center">ขาด</th>
                    <th className="p-4 text-xs font-black text-indigo-500 uppercase text-center">ร้อยละ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.length > 0 ? (
                    data.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm font-bold text-slate-700">{i + 1}</td>
                        <td className="p-4">
                          <div className="font-black text-slate-800">{d.name}</div>
                          <div className="text-xs font-bold text-slate-500">{d.studentId}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-slate-700">{d.department}</div>
                          <div className="text-xs text-slate-500">{d.classGroupId} ({d.academicLevel})</div>
                        </td>
                        <td className="p-4 text-center font-black text-slate-700">{d.total}</td>
                        <td className="p-4 text-center font-black text-emerald-600">{d.present + d.late}</td>
                        <td className="p-4 text-center font-black text-rose-500">{d.absent}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            parseFloat(d.percent) >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {d.percent}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-500 font-bold">
                        {loading ? 'กำลังประมวลผลข้อมูล...' : 'ไม่พบข้อมูลในช่วงเวลาที่เลือก'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
