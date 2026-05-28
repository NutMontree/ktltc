"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  FileSearchOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";

export default function SupervisionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [termYear, setTermYear] = useState("");
  const [customTermYears, setCustomTermYears] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = async (queryTermYear = "") => {
    setIsLoading(true);
    try {
      let url = "/api/supervision";
      if (queryTermYear) {
        url += `?termYear=${encodeURIComponent(queryTermYear)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/supervision/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.termYears) {
          // Remove default duplicates if any
          const loadedYears = data.termYears.filter(
            (y: string) => y !== "1/2567" && y !== "2/2567",
          );
          setCustomTermYears(loadedYears);
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));

    fetchRecords("");
  }, []);

  const handleSearch = () => {
    fetchRecords(termYear);
  };

  const handleReset = () => {
    setTermYear("");
    fetchRecords("");
  };

  const handleApprove = async (id: string) => {
    if (!confirm("ยืนยันการอนุมัติผลการนิเทศนี้?")) return;
    try {
      const res = await fetch("/api/supervision", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "อนุมัติแล้ว" }),
      });
      if ((await res.json()).success) {
        fetchRecords(termYear);
      } else {
        alert("เกิดข้อผิดพลาดในการอนุมัติ");
      }
    } catch (err) {
      console.error(err);
      alert("ระบบขัดข้อง");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
    try {
      const res = await fetch(`/api/supervision?id=${id}`, {
        method: "DELETE",
      });
      if ((await res.json()).success) {
        fetchRecords(termYear);
      } else {
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } catch (err) {
      console.error(err);
      alert("ระบบขัดข้อง");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-6 p-2">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              ข้อมูลผลการนิเทศนักเรียนนักศึกษาฝึกงาน
            </h1>
            <p className="text-sm text-zinc-500 font-bold mt-1">
              ระบบจัดการและบันทึกผลการนิเทศการฝึกงานและฝึกประสบการณ์วิชาชีพ
            </p>
          </div>

          <Link href="/dashboard/supervision/create">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <PlusOutlined />
              เพิ่มข้อมูลผลการนิเทศนักเรียนนักศึกษาฝึกงาน
            </button>
          </Link>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>เทอม/ปี</span>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    const newTermYear = prompt("กรุณากรอกเทอม/ปีใหม่ (เช่น 1/2568):");
                    if (newTermYear && newTermYear.trim() !== "") {
                      setIsSaving(true);
                      try {
                        const res = await fetch("/api/supervision/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ type: "termYear", value: newTermYear }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          const loadedYears = data.termYears.filter(
                            (y: string) => y !== "1/2567" && y !== "2/2567",
                          );
                          setCustomTermYears(loadedYears);
                          setTermYear(newTermYear);
                        }
                      } catch (err) {
                        console.error("Failed to save term/year", err);
                        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  }}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                >
                  {isSaving ? "กำลังเพิ่ม..." : "+ เพิ่มเทอม/ปี"}
                </button>
              </label>
              <select
                value={termYear}
                onChange={(e) => setTermYear(e.target.value)}
                className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- ทั้งหมด --</option>
                <option value="1/2567">1/2567</option>
                <option value="2/2567">2/2567</option>
                {customTermYears.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-black text-sm rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <SearchOutlined />
                ค้นหา
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-black text-sm rounded-xl transition-all active:scale-95"
              >
                <ReloadOutlined />
                เริ่มใหม่
              </button>

              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-black text-sm rounded-xl transition-all active:scale-95"
              >
                <ArrowLeftOutlined />
                ย้อนกลับ
              </button>
            </div>
          </div>
        </div>

        {/* Data Content */}
        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[400px] flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 font-bold">กำลังโหลดข้อมูล...</p>
          </div>
        ) : records.length > 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-500 uppercase tracking-wider">
                    <th className="p-4">วันที่บันทึก</th>
                    <th className="p-4">ปีการศึกษา/เทอม</th>
                    <th className="p-4">รูปแบบการนิเทศ</th>
                    <th className="p-4">สัปดาห์ที่</th>
                    <th className="p-4">สถานะ</th>
                    <th className="p-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {records.map((rec, idx) => (
                    <tr
                      key={rec._id || idx}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="p-4 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {new Date(rec.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="p-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        เทอม {rec.term} / {rec.academicYear}
                      </td>
                      <td className="p-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        {rec.supervisionFormat}
                      </td>
                      <td className="p-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                        สัปดาห์ที่ {rec.weekNumber}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                          rec.status === "อนุมัติแล้ว" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : rec.status === "เสร็จสมบูรณ์"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }`}>
                          {rec.status || "รอตรวจสอบ"}
                        </span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        {session?.user?.role === "super_admin" && rec.status !== "อนุมัติแล้ว" && (
                          <button
                            onClick={() => handleApprove(rec._id)}
                            title="อนุมัติ"
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-sm"
                          >
                            <CheckCircleOutlined />
                          </button>
                        )}
                        {(session?.user as any)?.id === rec.createdBy && (
                          <button
                            onClick={() => alert("ระบบแก้ไขข้อมูลแบบด่วนกำลังอยู่ในระหว่างการพัฒนา")}
                            title="แก้ไข"
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center transition-colors shadow-sm"
                          >
                            <EditOutlined />
                          </button>
                        )}
                        {session?.user?.role === "super_admin" && (
                          <button
                            onClick={() => handleDelete(rec._id)}
                            title="ลบ"
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center transition-colors shadow-sm"
                          >
                            <DeleteOutlined />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[400px] flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
              <FileSearchOutlined className="text-4xl text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-lg font-black text-zinc-400 dark:text-zinc-500 mb-2">
              ไม่พบข้อมูลคำร้องขอฝึกงาน/ฝึกประสบการณ์วิชาชีพ
            </h3>
            <p className="text-sm font-bold text-zinc-400/80 dark:text-zinc-600 text-center max-w-sm">
              กดปุ่ม "เพิ่มข้อมูลผลการนิเทศ..." ด้านบนเพื่อเริ่มบันทึกข้อมูลการนิเทศของคุณ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
