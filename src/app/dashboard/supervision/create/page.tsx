"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PictureOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { uploadFile } from "@/lib/upload";
import { useSession } from "next-auth/react";

export default function CreateSupervisionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState(1);
  const [maxReachedMenu, setMaxReachedMenu] = useState(1); // Track maximum allowed step

  // Form State
  const [formData, setFormData] = useState({
    academicYear: "",
    term: "",
    supervisionFormat: "",
    weekNumber: "",
    startDate: "",
    endDate: "",
  });

  const [customYears, setCustomYears] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New States for Steps 2-4
  const [supervisionId, setSupervisionId] = useState<string | null>(null);

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);

  const [evaluation, setEvaluation] = useState({
    summary: "",
    timeIn: "",
    timeOut: "",
    result: "ผ่าน",
  });

  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    fetch("/api/supervision/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.academicYears) {
          // Remove default duplicates if any
          const loadedYears = data.academicYears.filter(
            (y: string) => y !== "2567" && y !== "2566",
          );
          setCustomYears(loadedYears);
        }
      })
      .catch((err) => console.error("Failed to load settings:", err));

    fetch("/api/supervision/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudentsList(data.students);
      })
      .catch((err) => console.error("Failed to load students:", err));
  }, []);

  const menus = [
    { id: 1, label: "1. ข้อมูลหนังสือ", icon: <BookOutlined /> },
    { id: 2, label: "2. รายชื่อนักศึกษา", icon: <TeamOutlined /> },
    { id: 3, label: "3. สรุปผลการนิเทศ", icon: <CheckCircleOutlined /> },
    { id: 4, label: "4. แนบรูปภาพ", icon: <PictureOutlined /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-1">
        {/* Top Navbar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm px-6 py-4 flex items-center">
          <button
            onClick={() => {
              if (activeMenu > 1) {
                setActiveMenu(activeMenu - 1);
              } else {
                router.back();
              }
            }}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-black text-sm transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <ArrowLeftOutlined />
            </div>
            ย้อนกลับ
          </button>
        </div>
        {/* Main Container: Grid Col 2 */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-2 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Container 1: Sidebar (4 Menus) - Hidden on Mobile */}
          <div className="hidden md:block md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-2">
            <div className="flex flex-col gap-1">
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  disabled={menu.id > maxReachedMenu}
                  onClick={() => setActiveMenu(menu.id)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-black rounded-xl transition-all ${
                    activeMenu === menu.id
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : menu.id > maxReachedMenu
                      ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{menu.icon}</span>
                    {menu.label}
                  </div>
                  {menu.id < maxReachedMenu && <CheckCircleOutlined className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Container 2: Main Content */}
          <div className="md:col-span-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-8">
            {activeMenu === 1 && (
              <div className="space-y-8 animate-fade-in">
                {/* Grid 1: Top Title */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                    บันทึกข้อมูลผลการนิเทศนักเรียนนักศึกษาฝึกงาน / ฝึกประสบการณ์วิชาชีพ
                  </h2>
                  <p className="text-sm font-bold text-zinc-500 mt-1">
                    กรุณากรอกข้อมูลพื้นฐานสำหรับการนิเทศในครั้งนี้
                  </p>
                </div>

                {/* Grid 2: Form */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                      เลือกภาคเรียน / ข้อมูลหนังสือ
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>ปีการศึกษา *</span>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            const newYear = prompt("กรุณากรอกปีการศึกษาใหม่ (เช่น 2568):");
                            if (newYear && !isNaN(Number(newYear))) {
                              setIsSaving(true);
                              try {
                                const res = await fetch("/api/supervision/settings", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ type: "academicYear", value: newYear }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  const loadedYears = data.academicYears.filter(
                                    (y: string) => y !== "2567" && y !== "2566",
                                  );
                                  setCustomYears(loadedYears);
                                  setFormData({ ...formData, academicYear: newYear });
                                }
                              } catch (err) {
                                console.error("Failed to save year", err);
                                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
                              } finally {
                                setIsSaving(false);
                              }
                            }
                          }}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                        >
                          {isSaving ? "กำลังเพิ่ม..." : "+ เพิ่มปี"}
                        </button>
                      </label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">-- เลือกข้อมูล --</option>
                        <option value="2567">2567</option>
                        <option value="2566">2566</option>
                        {customYears.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        เทอม *
                      </label>
                      <select
                        value={formData.term}
                        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">-- เลือกข้อมูล --</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        รูปแบบการนิเทศ *
                      </label>
                      <select
                        value={formData.supervisionFormat}
                        onChange={(e) =>
                          setFormData({ ...formData, supervisionFormat: e.target.value })
                        }
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">-- เลือก --</option>
                        <option value="รถส่วนตัว (ไม่ขอเบิก)">รถส่วนตัว (ไม่ขอเบิก)</option>
                        <option value="รถส่วนกลางของวิทยาลัย">รถส่วนกลางของวิทยาลัย</option>
                        <option value="ออนไลน์">ออนไลน์</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        สัปดาห์ที่ *
                      </label>
                      <select
                        value={formData.weekNumber}
                        onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">-- เลือกข้อมูล --</option>
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        วันที่เริ่ม *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        วันที่สิ้นสุด *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid 3: Bottom Action (Next Button) */}
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (
                        !formData.academicYear ||
                        !formData.term ||
                        !formData.supervisionFormat ||
                        !formData.weekNumber ||
                        !formData.startDate ||
                        !formData.endDate
                      ) {
                        alert("กรุณากรอกข้อมูลบังคับให้ครบถ้วนก่อนทำรายการต่อไป");
                        return;
                      }
                      setIsSubmitting(true);
                      try {
                        const payload = supervisionId 
                          ? { id: supervisionId, ...formData } 
                          : { ...formData, createdBy: (session?.user as any)?.id || null };
                        const res = await fetch("/api/supervision", {
                          method: supervisionId ? "PUT" : "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json();
                        if (data.success) {
                          if (!supervisionId && data.insertedId) {
                            setSupervisionId(data.insertedId);
                          }
                          setMaxReachedMenu((prev) => Math.max(prev, 2));
                          setActiveMenu(2);
                        } else {
                          alert(data.error || "เกิดข้อผิดพลาดในการบันทึก");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกและถัดไป"}
                    <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: รายชื่อนักศึกษา --- */}
            {activeMenu === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">รายชื่อนักศึกษาที่จะนิเทศ</h3>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อ, รหัสนักศึกษา, หรือสถานประกอบการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 mb-6">
                    {studentsList
                      .filter(
                        (s) =>
                          !selectedStudents.find((sel) => sel.id === s.id) &&
                          (s.name.includes(searchQuery) ||
                            s.studentIdNum.includes(searchQuery) ||
                            s.companyName?.includes(searchQuery))
                      )
                      .slice(0, 10)
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{s.name} ({s.studentIdNum})</span>
                            <span className="text-xs text-zinc-500">{s.department} • {s.companyName}</span>
                          </div>
                          <button
                            onClick={() => setSelectedStudents((prev) => [...prev, s])}
                            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center transition-colors"
                          >
                            <PlusOutlined />
                          </button>
                        </div>
                      ))}
                    {studentsList.length === 0 && (
                      <div className="p-8 text-center text-zinc-400 text-sm">ไม่พบรายชื่อนักศึกษาทวิภาคี</div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">นักศึกษาที่เลือกแล้ว ({selectedStudents.length} คน)</h4>
                    <div className="space-y-2">
                      {selectedStudents.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{s.name}</span>
                            <span className="text-xs text-emerald-600 dark:text-emerald-500">{s.companyName}</span>
                          </div>
                          <button
                            onClick={() => setSelectedStudents((prev) => prev.filter((item) => item.id !== s.id))}
                            className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 flex items-center justify-center transition-colors"
                          >
                            <DeleteOutlined />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                  <button onClick={() => setActiveMenu(1)} className="px-6 py-3 rounded-xl bg-zinc-200 text-zinc-700 hover:bg-zinc-300 font-bold text-sm transition-all">
                    ย้อนกลับ
                  </button>
                  <button
                    disabled={isSubmitting || selectedStudents.length === 0}
                    onClick={async () => {
                      if (!supervisionId) return alert("ไม่พบรหัสการนิเทศ กรุณากลับไปบันทึกขั้นตอนที่ 1 ใหม่");
                      setIsSubmitting(true);
                      try {
                        const res = await fetch("/api/supervision", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: supervisionId, students: selectedStudents }),
                        });
                        if ((await res.json()).success) {
                          setMaxReachedMenu((prev) => Math.max(prev, 3));
                          setActiveMenu(3);
                        } else alert("เกิดข้อผิดพลาดในการบันทึก");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกและถัดไป"}
                    <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 3: สรุปผล --- */}
            {activeMenu === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">สรุปผลการนิเทศและเวลา</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">เวลาที่เข้านิเทศ *</label>
                    <input type="time" value={evaluation.timeIn} onChange={(e) => setEvaluation({...evaluation, timeIn: e.target.value})} className="h-11 rounded-xl px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">เวลาที่เสร็จสิ้น *</label>
                    <input type="time" value={evaluation.timeOut} onChange={(e) => setEvaluation({...evaluation, timeOut: e.target.value})} className="h-11 rounded-xl px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">ผลการนิเทศภาพรวม *</label>
                  <select value={evaluation.result} onChange={(e) => setEvaluation({...evaluation, result: e.target.value})} className="h-11 rounded-xl px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold">
                    <option value="ผ่าน">ผ่าน</option>
                    <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                    <option value="ต้องปรับปรุง">ต้องปรับปรุง</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">สรุปรายละเอียด/ข้อเสนอแนะเพิ่มเติม</label>
                  <textarea rows={5} value={evaluation.summary} onChange={(e) => setEvaluation({...evaluation, summary: e.target.value})} placeholder="พิมพ์รายละเอียด..." className="w-full rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                  <button onClick={() => setActiveMenu(2)} className="px-6 py-3 rounded-xl bg-zinc-200 text-zinc-700 hover:bg-zinc-300 font-bold text-sm transition-all">ย้อนกลับ</button>
                  <button
                    disabled={isSubmitting || !evaluation.timeIn || !evaluation.timeOut}
                    onClick={async () => {
                      if (!supervisionId) return alert("ไม่พบรหัสการนิเทศ");
                      setIsSubmitting(true);
                      try {
                        const res = await fetch("/api/supervision", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: supervisionId, evaluation }),
                        });
                        if ((await res.json()).success) {
                          setMaxReachedMenu((prev) => Math.max(prev, 4));
                          setActiveMenu(4);
                        } else alert("เกิดข้อผิดพลาด");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black text-sm rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกและถัดไป"}
                    <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 4: แนบรูปภาพ --- */}
            {activeMenu === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100">แนบรูปภาพ / เอกสาร</h3>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      setIsUploading(true);
                      setUploadProgress(0);
                      const files = Array.from(e.target.files);
                      const uploadedUrls: {url: string, name: string}[] = [];
                      
                      for (let i = 0; i < files.length; i++) {
                        const res = await uploadFile(files[i], "supervision", (p) => setUploadProgress(p));
                        if (res.secure_url) uploadedUrls.push({ url: res.secure_url, name: files[i].name });
                      }
                      setAttachments(prev => [...prev, ...uploadedUrls]);
                      setIsUploading(false);
                    }}
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-blue-600">อัปโหลด {uploadProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <CloudUploadOutlined className="text-4xl text-zinc-400 group-hover:text-blue-500 transition-colors mb-2" />
                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">ลากไฟล์มาวาง หรือ คลิกเพื่อเลือกรูปภาพ</p>
                        <p className="text-xs text-zinc-500 mt-1">รองรับ JPG, PNG (ระบบจะบีบอัดให้อัตโนมัติ)</p>
                      </>
                    )}
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-zinc-200 dark:border-zinc-800">
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
                  <button onClick={() => setActiveMenu(3)} className="px-6 py-3 rounded-xl bg-zinc-200 text-zinc-700 hover:bg-zinc-300 font-bold text-sm transition-all">ย้อนกลับ</button>
                  <button
                    disabled={isSubmitting}
                    onClick={async () => {
                      if (!supervisionId) return alert("ไม่พบรหัสการนิเทศ");
                      setIsSubmitting(true);
                      try {
                        const res = await fetch("/api/supervision", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: supervisionId, attachments, status: "เสร็จสมบูรณ์" }),
                        });
                        if ((await res.json()).success) {
                          alert("บันทึกการนิเทศสำเร็จ!");
                          router.push("/dashboard/supervision");
                        } else alert("เกิดข้อผิดพลาด");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "กำลังส่งข้อมูล..." : "บันทึกและส่งข้อมูล"}
                    <CheckCircleOutlined />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
