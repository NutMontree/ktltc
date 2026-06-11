"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Calculator,
  Save,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, InputNumber, message, Modal, Input } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface GradingCategory {
  id: string;
  name: string;
  points: number;
  cannotDeduct: boolean;
  required: boolean;
  description: string;
}

interface GradingConfig {
  id?: string;
  subjectId: string;
  categories: GradingCategory[];
  totalPoints: number;
  passingScore: number;
  gradeScale: Array<{ minScore: number; grade: string; description: string }>;
  isDefault?: boolean;
}

interface StudentGrade {
  id: string;
  studentId: string;
  studentName: string;
  classGroupId?: string;
  subjectId: string;
  scores: Record<string, number>;
  totalScore: number;
  finalGrade: string;
  gradeDescription: string;
  isPassed: boolean;
  updatedAt: string;
}

export default function DVEGradingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [config, setConfig] = useState<GradingConfig | null>(null);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [gradeForm, setGradeForm] = useState<Record<string, number>>({});
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");

  const classGroups = Array.from(new Set(studentGrades.map(g => g.classGroupId || "ไม่ระบุกลุ่มเรียน"))).filter(Boolean).sort();
  const filteredGrades = selectedClassGroup 
    ? studentGrades.filter(g => (g.classGroupId || "ไม่ระบุกลุ่มเรียน") === selectedClassGroup) 
    : studentGrades;

  const exportToExcel = () => {
    if (filteredGrades.length === 0 || !config) {
      message.error("ไม่พบข้อมูลที่จะส่งออก");
      return;
    }
    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
    let subjectNameStr = currentSubject ? `${currentSubject.code} ${currentSubject.name}` : "คะแนน";
    if (selectedClassGroup) {
      subjectNameStr += `_${selectedClassGroup}`;
    }

    const data = filteredGrades.map((g, idx) => {
      const row: any = {
        "ลำดับ": idx + 1,
        "รหัสนักศึกษา": g.studentId || "-",
        "ชื่อ-นามสกุล": g.studentName || "-",
        "กลุ่มเรียน": g.classGroupId || "-",
      };

      config.categories.forEach((cat) => {
        row[`${cat.name} (${cat.points})`] = g.scores[cat.id] ?? 0;
      });

      row["คะแนนรวม (100)"] = g.totalScore;
      row["เกรด"] = g.finalGrade;
      row["ผลการเรียน"] = g.isPassed ? "ผ่าน" : "ไม่ผ่าน";
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grade Sheet");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(finalData, `Grade_Sheet_${subjectNameStr.replace(/\s+/g, "_")}.xlsx`);
  };

  const exportToSot02 = () => {
    if (filteredGrades.length === 0 || !config) {
      message.error("ไม่พบข้อมูลที่จะส่งออก");
      return;
    }
    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
    let subjectNameStr = currentSubject ? `${currentSubject.code} ${currentSubject.name}` : "ศธ02";
    if (selectedClassGroup) {
      subjectNameStr += `_${selectedClassGroup}`;
    }

    const data = filteredGrades.map((g) => ({
      "รหัสนักศึกษา": g.studentId || "-",
      "ชื่อ-นามสกุล": g.studentName || "-",
      "กลุ่มเรียน": g.classGroupId || "-",
      "เกรด": g.finalGrade,
      "คะแนนรวม": g.totalScore,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ศธ02 Import");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(finalData, `ศธ02_Import_${subjectNameStr.replace(/\s+/g, "_")}.xlsx`);
  };

  const triggerPrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchGradingConfig();
      fetchStudentGrades();
      setSelectedClassGroup(""); // Reset class group when subject changes
    }
  }, [selectedSubjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/dve/subjects");
      const data = await res.json();
      if (res.ok && data.success) {
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Fetch subjects error:", error);
    }
  };

  const fetchGradingConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dve/grading-config?subjectId=${selectedSubjectId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Fetch grading config error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentGrades = async () => {
    try {
      const res = await fetch(`/api/dve/student-grades?subjectId=${selectedSubjectId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStudentGrades(data.grades);
      }
    } catch (error) {
      console.error("Fetch student grades error:", error);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;

    try {
      const res = await fetch("/api/dve/grading-config", {
        method: config.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: config.id,
          subjectId: selectedSubjectId,
          categories: config.categories,
          totalPoints: config.totalPoints,
          passingScore: config.passingScore,
          gradeScale: config.gradeScale,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success(data.message);
        setIsConfigModalOpen(false);
        fetchGradingConfig();
      } else {
        message.error(data.error || "บันทึกการตั้งค่าไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Save config error:", error);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleSaveGrade = async () => {
    if (!editingGrade && !newStudentName) {
      message.error("กรุณาระบุชื่อนักเรียน");
      return;
    }

    try {
      const res = await fetch("/api/dve/student-grades", {
        method: editingGrade?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGrade?.id,
          subjectId: selectedSubjectId,
          studentId: editingGrade?.studentId,
          studentName: editingGrade?.studentName || newStudentName,
          scores: gradeForm,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success(data.message);
        setIsGradeModalOpen(false);
        setEditingGrade(null);
        setGradeForm({});
        setNewStudentName("");
        fetchStudentGrades();
      } else {
        message.error(data.error || "บันทึกคะแนนไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Save grade error:", error);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      const res = await fetch(`/api/dve/student-grades?id=${gradeId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        message.success(data.message);
        fetchStudentGrades();
      } else {
        message.error(data.error || "ลบคะแนนไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete grade error:", error);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleEditGrade = (grade: StudentGrade) => {
    setEditingGrade(grade);
    setGradeForm({ ...grade.scores });
    setIsGradeModalOpen(true);
  };

  const handleAddCategory = () => {
    if (!config) return;
    const newCategory: GradingCategory = {
      id: `custom_${Date.now()}`,
      name: "หมวดหมู่ใหม่",
      points: 0,
      cannotDeduct: false,
      required: false,
      description: "",
    };
    setConfig({
      ...config,
      categories: [...config.categories, newCategory],
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      categories: config.categories.filter((c) => c.id !== categoryId),
    });
  };

  const handleUpdateCategory = (categoryId: string, field: keyof GradingCategory, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      categories: config.categories.map((c) =>
        c.id === categoryId ? { ...c, [field]: value } : c
      ),
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-sky-50 to-teal-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 sm:p-8 rounded-[32px] bg-linear-to-br from-cyan-500 via-blue-600 to-blue-700 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Calculator size={180} className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl" />
          </div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none mix-blend-overlay" />
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/20 backdrop-blur-xl text-[10px] sm:text-xs uppercase font-black tracking-widest px-4 py-1.5 rounded-full text-white/95 border border-white/20 shadow-sm flex items-center gap-1.5 w-fit mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              ระบบตรวจงานและให้คะแนน
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2 drop-shadow-sm">
              ระบบจัดการคะแนน <span className="text-cyan-200">(Grading)</span>
            </h1>
            <p className="text-white/90 font-medium text-xs sm:text-sm md:text-base leading-relaxed">
              ตั้งค่าเกณฑ์การให้คะแนน บันทึกคะแนนนักเรียน และส่งออกข้อมูลผลการเรียน (ศธ.02)
            </p>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="bg-white/60 backdrop-blur-xl dark:bg-zinc-900/80 rounded-[32px] p-6 sm:p-8 shadow-sm border border-white/40 dark:border-zinc-800 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <Calculator className="w-5 h-5" />
              </span>
              เลือกวิชาเรียน
            </h2>
            {config && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-5 py-2.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 rounded-2xl hover:bg-cyan-100 dark:hover:bg-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 font-black shadow-sm cursor-pointer border border-cyan-100 dark:border-cyan-800/50"
              >
                <Edit2 className="w-4 h-4" />
                แก้ไขเกณฑ์การให้คะแนน
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              placeholder="-- เลือกวิชาเรียน --"
              value={selectedSubjectId || undefined}
              onChange={(val) => setSelectedSubjectId(val || "")}
              options={subjects.map((s) => ({ label: `[${s.code}] ${s.name}`, value: s.id }))}
              className="w-full h-12"
              size="large"
            />
            {selectedSubjectId && classGroups.length > 0 && (
              <Select
                placeholder="-- ทั้งหมด (ทุกห้องเรียน) --"
                value={selectedClassGroup || undefined}
                onChange={(val) => setSelectedClassGroup(val || "")}
                options={[
                  { label: "-- ทั้งหมด (ทุกห้องเรียน) --", value: "" },
                  ...classGroups.map(cg => ({ label: cg, value: cg }))
                ]}
                className="w-full h-12"
                size="large"
              />
            )}
          </div>
        </div>

        {/* Grading Configuration */}
        {config && selectedSubjectId && (
          <div className="bg-white/60 backdrop-blur-xl dark:bg-zinc-900/80 rounded-[32px] p-6 sm:p-8 shadow-sm border border-white/40 dark:border-zinc-800 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                โครงสร้างการให้คะแนน
              </h2>
              <div className="text-xs font-black text-blue-700 dark:text-blue-400 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50 flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                รวม {config.totalPoints} คะแนน • เกณฑ์ผ่าน {config.passingScore} คะแนน
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white/80 dark:bg-zinc-800/60 rounded-[20px] p-5 border border-zinc-100 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-black text-zinc-900 dark:text-white mb-1.5 text-sm">
                        {category.name}
                      </h3>
                      <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 inline-block px-2.5 py-1 rounded-lg">
                        {category.points} คะแนน
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      {category.cannotDeduct && (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          ลบไม่ได้
                        </span>
                      )}
                      {category.required && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                          จำเป็น
                        </span>
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-2">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Grade Scale */}
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                เกณฑ์การตัดเกรด
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {config.gradeScale.map((scale) => (
                  <span
                    key={scale.grade}
                    className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-black shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    เกรด {scale.grade} : {scale.minScore} ขึ้นไป <span className="opacity-60">({scale.description})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Student Grades */}
        {config && selectedSubjectId && (
          <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-800/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-zinc-700 overflow-hidden mb-8">
            <div className="p-6 border-b border-white/40 dark:border-zinc-700 print:hidden bg-white/40 dark:bg-zinc-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <GraduationCap className="w-5 h-5" />
                  </span>
                  คะแนนนักเรียน ({filteredGrades.length} คน)
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    ส่งออก Excel
                  </button>
                  <button
                    onClick={exportToSot02}
                    className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-orange-900 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Upload className="w-4 h-4" />
                    ส่งออก ศธ.02
                  </button>
                  <button
                    onClick={triggerPrint}
                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-amber-900 dark:text-zinc-200 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Calculator className="w-4 h-4" />
                    พิมพ์รายงาน (PDF)
                  </button>
                  <button
                    onClick={() => {
                      setEditingGrade(null);
                      setGradeForm({});
                      setNewStudentName("");
                      setIsGradeModalOpen(true);
                    }}
                    className="px-5 py-2 bg-sky-300 hover:bg-sky-400 text-sky-900 rounded-xl transition-all flex items-center gap-2 text-xs font-black shadow-sm border-0 cursor-pointer hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มคะแนน
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50/50 dark:bg-zinc-800/80 rounded-[20px]">
                  <tr>
                    <th className="px-6 py-5 text-left text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest rounded-l-2xl">
                      นักเรียน
                    </th>
                    {config.categories.map((cat) => (
                      <th key={cat.id} className="px-4 py-5 text-center text-[11px] font-black text-cyan-800 dark:text-cyan-400 uppercase tracking-widest">
                        {cat.name}
                        <div className="text-[10px] text-cyan-600/70 dark:text-cyan-400/70 mt-1">({cat.points})</div>
                      </th>
                    ))}
                    <th className="px-6 py-5 text-center text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                      รวม
                    </th>
                    <th className="px-6 py-5 text-center text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                      เกรด
                    </th>
                    <th className="px-6 py-5 text-center text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                      สถานะ
                    </th>
                    <th className="px-6 py-5 text-center text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest rounded-r-2xl">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-blue-50/40 dark:hover:bg-zinc-800/40 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          {grade.studentName}
                        </p>
                        {grade.classGroupId && grade.classGroupId !== "ไม่ระบุกลุ่มเรียน" && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                            {grade.classGroupId}
                          </span>
                        )}
                      </td>
                      {config.categories.map((cat) => (
                        <td key={cat.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                            <span className="text-blue-600 dark:text-blue-400">{grade.scores[cat.id] || 0}</span>
                            <span className="opacity-50">/{cat.points}</span>
                          </p>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 inline-block px-3 py-1 rounded-lg">
                          {grade.totalScore}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 inline-block px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800/50">
                          {grade.finalGrade}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {grade.isPassed ? (
                          <div className="flex justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <AlertCircle className="w-5 h-5 text-rose-500 drop-shadow-sm" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditGrade(grade)}
                            className="p-2 hover:bg-sky-100 dark:hover:bg-zinc-600 rounded-lg transition-colors border-0 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-colors border-0 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredGrades.length === 0 && (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  ยังไม่มีข้อมูลคะแนน
                </div>
              )}
            </div>
          </div>
        )}

        {/* Config Modal */}
        <AnimatePresence>
          {isConfigModalOpen && config && (
            <Modal
              title="แก้ไขการตั้งค่าการให้คะแนน"
              open={isConfigModalOpen}
              onCancel={() => setIsConfigModalOpen(false)}
              onOk={handleSaveConfig}
              width={800}
              okText="บันทึก"
              cancelText="ยกเลิก"
            >
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {config.categories.map((category) => (
                  <div key={category.id} className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          ชื่อหมวดหมู่
                        </label>
                        <Input
                          value={category.name}
                          onChange={(e) => handleUpdateCategory(category.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          คะแนน
                        </label>
                        <InputNumber
                          value={category.points}
                          onChange={(val) => handleUpdateCategory(category.id, "points", val || 0)}
                          className="w-full"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={category.cannotDeduct}
                          onChange={(e) => handleUpdateCategory(category.id, "cannotDeduct", e.target.checked)}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">ลบไม่ได้</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={category.required}
                          onChange={(e) => handleUpdateCategory(category.id, "required", e.target.checked)}
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">จำเป็น</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        คำอธิบาย
                      </label>
                      <Input
                        value={category.description}
                        onChange={(e) => handleUpdateCategory(category.id, "description", e.target.value)}
                      />
                    </div>
                    {!category.required && (
                      <button
                        onClick={() => handleRemoveCategory(category.id)}
                        className="mt-2 text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบหมวดหมู่
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddCategory}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มหมวดหมู่
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Grade Modal */}
        <AnimatePresence>
          {isGradeModalOpen && config && (
            <Modal
              title={editingGrade ? "แก้ไขคะแนน" : "เพิ่มคะแนน"}
              open={isGradeModalOpen}
              onCancel={() => {
                setIsGradeModalOpen(false);
                setEditingGrade(null);
                setGradeForm({});
                setNewStudentName("");
              }}
              onOk={handleSaveGrade}
              width={600}
              okText="บันทึก"
              cancelText="ยกเลิก"
            >
              <div className="space-y-4">
                {!editingGrade && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      ชื่อนักเรียน
                    </label>
                    <Input
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                    />
                  </div>
                )}
                {config.categories.map((category) => (
                  <div key={category.id}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {category.name} ({category.points} คะแนน)
                      {category.cannotDeduct && (
                        <span className="ml-2 text-xs text-emerald-600">(ลบไม่ได้)</span>
                      )}
                    </label>
                    <InputNumber
                      value={gradeForm[category.id] || 0}
                      onChange={(val) => setGradeForm({ ...gradeForm, [category.id]: val || 0 })}
                      className="w-full"
                      min={category.cannotDeduct ? category.points : 0}
                      max={category.points}
                    />
                  </div>
                ))}
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Printable Area */}
        {config && selectedSubjectId && (
          <div id="printable-grade-sheet" className="hidden print:block p-8 bg-white text-black font-sans w-full">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-black">วิทยาลัยเทคนิคกันทรลักษ์</h2>
              <h3 className="text-xl font-bold">รายงานผลการประเมินการฝึกงานระบบทวิภาคี (Grade Sheet)</h3>
              <p className="text-sm">
                <strong>วิชา:</strong> [{(subjects.find(s => s.id === selectedSubjectId))?.code}] {(subjects.find(s => s.id === selectedSubjectId))?.name} &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>แผนกวิชา:</strong> {(subjects.find(s => s.id === selectedSubjectId))?.department}
              </p>
            </div>
            
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-center">ลำดับ</th>
                  <th className="border border-black p-2 text-center">รหัสนักศึกษา</th>
                  <th className="border border-black p-2 text-left">ชื่อ-นามสกุล</th>
                  {config.categories.map(cat => (
                    <th key={cat.id} className="border border-black p-2 text-center">{cat.name} ({cat.points})</th>
                  ))}
                  <th className="border border-black p-2 text-center">คะแนนรวม</th>
                  <th className="border border-black p-2 text-center">เกรด</th>
                  <th className="border border-black p-2 text-center">ผลการเรียน</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((g, idx) => (
                  <tr key={g.id}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2 text-center">{g.studentId}</td>
                    <td className="border border-black p-2 text-left">{g.studentName}</td>
                    {config.categories.map(cat => (
                      <td key={cat.id} className="border border-black p-2 text-center">{g.scores[cat.id] ?? 0}</td>
                    ))}
                    <td className="border border-black p-2 text-center font-bold">{g.totalScore}</td>
                    <td className="border border-black p-2 text-center font-bold">{g.finalGrade}</td>
                    <td className="border border-black p-2 text-center">{g.isPassed ? "ผ่าน" : "ไม่ผ่าน"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-12 flex justify-between text-sm">
              <div></div>
              <div className="text-center space-y-8">
                <p>ลงชื่อ.......................................................... ครูผู้สอน</p>
                <p>(..........................................................)</p>
                <p>วันที่........./........./.........</p>
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-grade-sheet, #printable-grade-sheet * {
              visibility: visible;
            }
            #printable-grade-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: block !important;
              background: white !important;
              color: black !important;
            }
          }
        `}} />
      </div>
    </div>
  );
}
