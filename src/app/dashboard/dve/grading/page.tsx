"use client";

export const dynamic = "force-dynamic";

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

  const exportToExcel = () => {
    if (studentGrades.length === 0 || !config) {
      message.error("ไม่พบข้อมูลที่จะส่งออก");
      return;
    }
    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
    const subjectNameStr = currentSubject ? `${currentSubject.code} ${currentSubject.name}` : "คะแนน";

    const data = studentGrades.map((g, idx) => {
      const row: any = {
        "ลำดับ": idx + 1,
        "รหัสนักศึกษา": g.studentId || "-",
        "ชื่อ-นามสกุล": g.studentName || "-",
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
    if (studentGrades.length === 0 || !config) {
      message.error("ไม่พบข้อมูลที่จะส่งออก");
      return;
    }
    const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
    const subjectNameStr = currentSubject ? `${currentSubject.code} ${currentSubject.name}` : "ศธ02";

    const data = studentGrades.map((g) => ({
      "รหัสนักศึกษา": g.studentId || "-",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            ระบบจัดการคะแนน
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            ตั้งค่าการให้คะแนนและบันทึกคะแนนนักเรียน
          </p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              เลือกวิชาเรียน
            </h2>
            {config && (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                แก้ไขการตั้งค่าคะแนน
              </button>
            )}
          </div>
          <Select
            placeholder="-- เลือกวิชาเรียน --"
            value={selectedSubjectId || undefined}
            onChange={(val) => setSelectedSubjectId(val || "")}
            options={subjects.map((s) => ({ label: `[${s.code}] ${s.name}`, value: s.id }))}
            className="w-full"
          />
        </div>

        {/* Grading Configuration */}
        {config && selectedSubjectId && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-zinc-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                การตั้งค่าการให้คะแนน
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                รวม {config.totalPoints} คะแนน • ผ่าน {config.passingScore} คะแนน
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4 border border-slate-200 dark:border-zinc-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {category.points} คะแนน
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {category.cannotDeduct && (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                          ลบไม่ได้
                        </span>
                      )}
                      {category.required && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                          จำเป็น
                        </span>
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Grade Scale */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                เกณฑ์การให้เกรด
              </h3>
              <div className="flex flex-wrap gap-2">
                {config.gradeScale.map((scale) => (
                  <span
                    key={scale.grade}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                  >
                    เกรด {scale.grade}: {scale.minScore}+ ({scale.description})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Student Grades */}
        {config && selectedSubjectId && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-700 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-700 print:hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  คะแนนนักเรียน ({studentGrades.length} คน)
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToExcel}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ส่งออก Excel
                  </button>
                  <button
                    onClick={exportToSot02}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    ส่งออก ศธ.02
                  </button>
                  <button
                    onClick={triggerPrint}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-all flex items-center gap-1.5 text-xs font-black shadow-sm border-0 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    พิมพ์รายงาน (PDF)
                  </button>
                  <button
                    onClick={() => {
                      setEditingGrade(null);
                      setGradeForm({});
                      setNewStudentName("");
                      setIsGradeModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold border-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    เพิ่มคะแนน
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-zinc-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      นักเรียน
                    </th>
                    {config.categories.map((cat) => (
                      <th key={cat.id} className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        {cat.name}
                        <br />
                        <span className="text-xs text-slate-500">({cat.points})</span>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      รวม
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      เกรด
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                  {studentGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {grade.studentName}
                        </p>
                      </td>
                      {config.categories.map((cat) => (
                        <td key={cat.id} className="px-6 py-4 whitespace-nowrap text-center">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {grade.scores[cat.id] || 0}/{cat.points}
                          </p>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {grade.totalScore}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {grade.finalGrade}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {grade.isPassed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditGrade(grade)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-600 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {studentGrades.length === 0 && (
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
