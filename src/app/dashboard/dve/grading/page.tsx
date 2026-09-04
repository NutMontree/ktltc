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
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, InputNumber, message, Modal, Input, Collapse } from "antd";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface GradingSubCategory {
  id: string;
  name: string;
  points: number;
}

interface GradingCategory {
  id: string;
  name: string;
  points: number;
  cannotDeduct: boolean;
  required: boolean;
  description: string;
  subCategories?: GradingSubCategory[];
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
  studentId: string;      // MongoDB ObjectId ของ user
  studentCode?: string;   // รหัสนักศึกษาตัวเลขจริง (จาก users collection)
  sequence?: number;      // ลำดับที่ของนักเรียน
  studentName: string;
  department?: string;
  classGroupId?: string;
  subjectId: string;
  scores: Record<string, number>;
  subScores?: Record<string, Record<string, number>>; // categoryId -> { subCatId: score }
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [gradeForm, setGradeForm] = useState<Record<string, number>>({});
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [isSubScoreModalOpen, setIsSubScoreModalOpen] = useState(false);
  const [activeSubScoreGrade, setActiveSubScoreGrade] = useState<StudentGrade | null>(null);
  const [activeSubScoreCategory, setActiveSubScoreCategory] = useState<GradingCategory | null>(null);
  const [selectedClassGroup, setSelectedClassGroup] = useState<string>("");

  const classGroups = Array.from(
    new Set(studentGrades.map((g) => g.classGroupId).filter((id) => id && id !== "ไม่ระบุห้องเรียน"))
  ).sort() as string[];

  const filteredGrades = selectedClassGroup
    ? studentGrades.filter(g => g.classGroupId === selectedClassGroup)
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
        "รหัสนักศึกษา": g.studentCode || "",
        "ชื่อ-นามสกุล": g.studentName || "-",
        "ห้องเรียน": g.classGroupId || "-",
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
      "รหัสนักศึกษา": g.studentCode || "",
      "ชื่อ-นามสกุล": g.studentName || "-",
      "ห้องเรียน": g.classGroupId || "-",
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
      const res = await fetch(`/api/dve/student-grades?subjectId=${selectedSubjectId}&_t=${Date.now()}`);
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
        setIsCategoryModalOpen(false);
        setEditingCategoryId(null);
        fetchGradingConfig();
      } else {
        message.error(data.error || "บันทึกการตั้งค่าไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Save config error:", error);
      message.error("เกิดข้อผิดพลาด");
    }
  };

  const handleSequenceChange = async (gradeId: string, value: string) => {
    let newSequence = value.trim() ? Number(value) : undefined;
    if (newSequence !== undefined && isNaN(newSequence)) return;

    const grade = studentGrades.find(g => g.id === gradeId);
    if (!grade) return;

    try {
      // Update locally immediately for UX
      setStudentGrades(prev => {
        const newGrades = prev.map(g => g.id === gradeId ? { ...g, sequence: newSequence } : g);
        return newGrades.sort((a, b) => {
          const codeA = a.studentCode || "";
          const codeB = b.studentCode || "";
          if (codeA !== codeB) return codeA.localeCompare(codeB, "th");
          return (a.studentName || "").localeCompare(b.studentName || "");
        });
      });

      const res = await fetch("/api/dve/student-grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          studentId: grade.studentId,
          studentName: grade.studentName,
          scores: grade.scores || {},
          subScores: grade.subScores || {},
          sequence: newSequence === undefined ? null : newSequence,
          isSequenceUpdateOnly: true
        }),
      });
      if (!res.ok) {
        message.error("บันทึกลำดับเลขที่ล้มเหลว");
        fetchStudentGrades(); // Revert on error
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการบันทึกลำดับ");
      fetchStudentGrades(); // Revert on error
    }
  };

  const handleQuickScoreChange = (grade: StudentGrade, catId: string, value: string) => {
    let val = Number(value);
    if (isNaN(val)) return;

    // Optional: clamp to max points
    const cat = config?.categories.find((c) => c.id === catId);
    if (cat && val > cat.points) val = cat.points;
    if (val < 0) val = 0;

    setStudentGrades((prev) =>
      prev.map((g) => {
        if (g.id === grade.id) {
          const newScores = { ...g.scores, [catId]: val };
          // Calculate new total
          const totalScore = config?.categories.reduce((sum, cat) => sum + (Number(newScores[cat.id]) || 0), 0) || 0;
          const isPassed = totalScore >= (config?.passingScore || 50);

          let finalGrade = "0";
          if (totalScore >= 80) finalGrade = "4";
          else if (totalScore >= 75) finalGrade = "3.5";
          else if (totalScore >= 70) finalGrade = "3";
          else if (totalScore >= 65) finalGrade = "2.5";
          else if (totalScore >= 60) finalGrade = "2";
          else if (totalScore >= 55) finalGrade = "1.5";
          else if (totalScore >= 50) finalGrade = "1";

          return { ...g, scores: newScores, totalScore, isPassed, finalGrade };
        }
        return g;
      })
    );
  };

  const handleQuickScoreBlur = async (grade: StudentGrade) => {
    // Only save if it's an existing grade record, not a new un-added one
    if (!grade.id) return;
    try {
      const filledScores: Record<string, number> = { ...grade.scores };
      if (config) {
        config.categories.forEach(cat => {
          if (filledScores[cat.id] === undefined || filledScores[cat.id] === null) {
            filledScores[cat.id] = cat.cannotDeduct ? cat.points : 0;
          } else if (filledScores[cat.id] > cat.points) {
            filledScores[cat.id] = cat.points;
          } else if (filledScores[cat.id] < 0) {
            filledScores[cat.id] = 0;
          }
        });
      }

      const res = await fetch("/api/dve/student-grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: grade.id,
          subjectId: selectedSubjectId,
          studentId: grade.studentId,
          studentName: grade.studentName,
          scores: filledScores,
          subScores: grade.subScores || {},
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Save score error response:", errData);
        message.error("บันทึกคะแนนล้มเหลว: " + (errData.error || "Bad Request"));
      }
    } catch (error) {
      console.error("Save score error:", error);
      message.error("เกิดข้อผิดพลาดในการบันทึกคะแนน");
    }
  };

  const handleSaveGrade = async () => {
    if (!editingGrade && !newStudentName) {
      message.error("กรุณาระบุชื่อนักเรียน");
      return;
    }

    try {
      const filledScores: Record<string, number> = { ...gradeForm };
      if (config) {
        config.categories.forEach(cat => {
          if (filledScores[cat.id] === undefined || filledScores[cat.id] === null) {
            filledScores[cat.id] = cat.cannotDeduct ? cat.points : 0;
          } else if (filledScores[cat.id] > cat.points) {
            filledScores[cat.id] = cat.points;
          } else if (filledScores[cat.id] < 0) {
            filledScores[cat.id] = 0;
          }
        });
      }

      const res = await fetch("/api/dve/student-grades", {
        method: editingGrade?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGrade?.id,
          subjectId: selectedSubjectId,
          studentId: editingGrade?.studentId,
          studentName: editingGrade?.studentName || newStudentName,
          scores: filledScores,
          subScores: editingGrade?.subScores || {},
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

  const handleEditSubScores = (grade: StudentGrade, category: GradingCategory) => {
    setActiveSubScoreGrade(grade);
    setActiveSubScoreCategory(category);
    setIsSubScoreModalOpen(true);
  };

  const handleSubScoreChange = (subCatId: string, value: string) => {
    if (!activeSubScoreGrade || !activeSubScoreCategory) return;

    let val = Number(value);
    if (isNaN(val)) return;

    const subCat = activeSubScoreCategory.subCategories?.find(s => s.id === subCatId);
    if (subCat && val > subCat.points) val = subCat.points;
    if (val < 0) val = 0;

    const currentSubScores = activeSubScoreGrade.subScores || {};
    const catSubScores = { ...(currentSubScores[activeSubScoreCategory.id] || {}), [subCatId]: val };

    // update state locally for active grade
    const updatedSubScores = { ...currentSubScores, [activeSubScoreCategory.id]: catSubScores };

    // calculate total of these sub-scores ONLY for active sub-categories
    const totalCatScore = activeSubScoreCategory.subCategories?.reduce((sum, s) => {
      return sum + (Number(catSubScores[s.id]) || 0);
    }, 0) || 0;

    setActiveSubScoreGrade({
      ...activeSubScoreGrade,
      subScores: updatedSubScores,
      scores: { ...activeSubScoreGrade.scores, [activeSubScoreCategory.id]: totalCatScore }
    });
  };

  const handleAddSubCategoryForModal = () => {
    if (!activeSubScoreCategory) return;
    const newSub: GradingSubCategory = {
      id: `sub_${Date.now()}`,
      name: `ตารางย่อย ${activeSubScoreCategory.subCategories ? activeSubScoreCategory.subCategories.length + 1 : 1}`,
      points: 10,
    };
    setActiveSubScoreCategory({
      ...activeSubScoreCategory,
      subCategories: [...(activeSubScoreCategory.subCategories || []), newSub]
    });
  };

  const handleUpdateSubCategoryForModal = (subId: string, field: 'name' | 'points', value: any) => {
    if (!activeSubScoreCategory) return;
    setActiveSubScoreCategory({
      ...activeSubScoreCategory,
      subCategories: activeSubScoreCategory.subCategories?.map(s => 
        s.id === subId ? { ...s, [field]: value } : s
      )
    });
  };

  const handleRemoveSubCategoryForModal = (subId: string) => {
    if (!activeSubScoreCategory) return;
    setActiveSubScoreCategory({
      ...activeSubScoreCategory,
      subCategories: activeSubScoreCategory.subCategories?.filter(s => s.id !== subId)
    });
  };

  const handleSaveSubScores = async () => {
    if (!activeSubScoreGrade || !activeSubScoreCategory || !config) return;

    // 1. Update config if category changed (e.g. sub-categories added/edited)
    const originalCategory = config.categories.find(c => c.id === activeSubScoreCategory.id);
    const subCategoriesChanged = JSON.stringify(originalCategory?.subCategories) !== JSON.stringify(activeSubScoreCategory.subCategories);
    
    if (subCategoriesChanged) {
      const sumPoints = activeSubScoreCategory.subCategories?.reduce((sum, s) => sum + Number(s.points), 0) || 0;
      
      // Auto-scaling feature: Sub-categories sum NO LONGER needs to equal parent category's max points.
      // The system will automatically scale the score proportionally!
      // (So we just removed the strict check here).

      // Do NOT mutate activeSubScoreCategory.points!
      const updatedActiveCategory = { ...activeSubScoreCategory };

      const updatedCategories = config.categories.map(c => 
        c.id === updatedActiveCategory.id ? updatedActiveCategory : c
      );
      
      const newConfig = { ...config, categories: updatedCategories };
      setConfig(newConfig);

      try {
        const res = await fetch("/api/dve/grading-config", {
          method: newConfig.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newConfig.id,
            subjectId: selectedSubjectId,
            categories: newConfig.categories,
            totalPoints: newConfig.totalPoints,
            passingScore: newConfig.passingScore,
            gradeScale: newConfig.gradeScale,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          message.error("บันทึกหมวดหมู่ย่อยล้มเหลว: " + (errData.error || "Unknown"));
          return; // Abort saving grades since config failed
        }
      } catch (err) {
        console.error("Failed to save config subcategories:", err);
        message.error("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
        return;
      }
    }

    setStudentGrades((prev) =>
      prev.map((g) => {
        if (g.id === activeSubScoreGrade.id) {
          // Force sync category score to sum of sub-scores (ONLY active sub-categories)
          const catSubScores = activeSubScoreGrade.subScores?.[activeSubScoreCategory.id] || {};
          const syncedCatScore = activeSubScoreCategory.subCategories?.reduce((sum, s) => {
            return sum + (Number(catSubScores[s.id]) || 0);
          }, 0) || 0;
          const syncedScores = { ...activeSubScoreGrade.scores, [activeSubScoreCategory.id]: syncedCatScore };

          const totalScore = config?.categories.reduce((sum, cat) => sum + (Number(syncedScores[cat.id]) || 0), 0) || 0;
          const isPassed = totalScore >= (config?.passingScore || 50);

          let finalGrade = "0";
          if (totalScore >= 80) finalGrade = "4";
          else if (totalScore >= 75) finalGrade = "3.5";
          else if (totalScore >= 70) finalGrade = "3";
          else if (totalScore >= 65) finalGrade = "2.5";
          else if (totalScore >= 60) finalGrade = "2";
          else if (totalScore >= 55) finalGrade = "1.5";
          else if (totalScore >= 50) finalGrade = "1";

          const newGrade = { ...activeSubScoreGrade, scores: syncedScores, totalScore, isPassed, finalGrade };

          // trigger save in background
          handleQuickScoreBlur(newGrade);

          return newGrade;
        }
        return g;
      })
    );

    setIsSubScoreModalOpen(false);
    setActiveSubScoreGrade(null);
    setActiveSubScoreCategory(null);
  };


  const handleAddCategory = () => {
    if (!config) return;
    const newId = `custom_${Date.now()}`;
    const newCategory: GradingCategory = {
      id: newId,
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
    setEditingCategoryId(newId);
    setIsCategoryModalOpen(true);
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
      categories: config.categories.map((c) => {
        if (c.id === categoryId) {
          const updated = { ...c, [field]: value };
          if (field === "subCategories") {
            const subCats = value as GradingSubCategory[];
            if (subCats && subCats.length > 0) {
              updated.points = subCats.reduce((sum, s) => sum + s.points, 0);
            }
          }
          return updated;
        }
        return c;
      }),
    });
  };

  const handleAddSubCategory = (categoryId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      categories: config.categories.map((c) => {
        if (c.id !== categoryId) return c;
        const newSub: GradingSubCategory = { id: `sub_${Date.now()}`, name: "รายการย่อย", points: 10 };
        const updatedSubs = [...(c.subCategories || []), newSub];
        return { ...c, subCategories: updatedSubs };
      }),
    });
  };

  const handleRemoveSubCategory = (categoryId: string, subId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      categories: config.categories.map((c) => {
        if (c.id !== categoryId || !c.subCategories) return c;
        const updatedSubs = c.subCategories.filter((s) => s.id !== subId);
        return { ...c, subCategories: updatedSubs };
      }),
    });
  };

  const handleUpdateSubCategory = (categoryId: string, subId: string, field: keyof GradingSubCategory, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      categories: config.categories.map((c) => {
        if (c.id !== categoryId || !c.subCategories) return c;
        const updatedSubs = c.subCategories.map((s) => (s.id === subId ? { ...s, [field]: value } : s));
        return { ...c, subCategories: updatedSubs };
      }),
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
    <div className="max-w-[1600px] mx-auto w-full bg-linear-to-br from-blue-50 via-sky-50 to-teal-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 p-2 font-sans print:min-h-0 print:overflow-visible print:static print:p-0 print:m-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;700;800&display=swap');
        @page {
          /* ตั้ง margin เป็น 0 เพื่อซ่อน Header/Footer ของ Browser (เช่น URL, เลขหน้า) */
          margin: 0;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          #printable-grade-sheet,
          #printable-grade-sheet * {
            font-family: 'Sarabun', 'TH Sarabun PSK', 'TH SarabunPSK', sans-serif !important;
          }
          #printable-grade-sheet {
            font-size: 16px;
            /* ย้ายขอบกระดาษมาไว้ที่ padding แทน เพื่อไม่ให้ทับกับ Header ของ Browser */
            padding: 10mm 6mm !important;
          }
          #printable-grade-sheet table {
            font-size: 12px;
          }
          #printable-grade-sheet th,
          #printable-grade-sheet td {
            font-family: 'Sarabun', 'TH Sarabun PSK', 'TH SarabunPSK', sans-serif !important;
            padding: 4px !important;
          }
        }
      `}</style>
      <div className="max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8 p-6 sm:p-8 rounded-[24px] bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 relative overflow-hidden group print:hidden">
          <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Calculator size={180} className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl" />
          </div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none mix-blend-screen" />
          <div className="absolute right-1/4 top-0 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none mix-blend-screen" />
          
          <div className="relative z-10 max-w-2xl">
            <span className="bg-white/10 backdrop-blur-md text-[10px] sm:text-xs uppercase font-black tracking-widest px-4 py-1.5 rounded-full text-blue-200 border border-white/10 shadow-sm flex items-center gap-1.5 w-fit mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              ระบบตรวจงานและให้คะแนน
            </span>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-2 drop-shadow-md">
              ระบบจัดการคะแนน <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">(Grading)</span>
            </h1>
            <p className="text-zinc-300 font-medium text-xs sm:text-sm md:text-base leading-relaxed">
              ตั้งค่าเกณฑ์การให้คะแนน บันทึกคะแนนนักเรียน และส่งออกข้อมูลผลการเรียน (ศธ.02)
            </p>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="bg-white/60 backdrop-blur-xl dark:bg-zinc-900/80 rounded-2xl p-4 sm:p-6 shadow-sm border border-white/40 dark:border-zinc-800 mb-6 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <Calculator className="w-5 h-5" />
              </span>
              เลือกวิชาเรียน
            </h2>
            {config && (
              <button
                onClick={() => {
                  setEditingCategoryId(null);
                  setIsCategoryModalOpen(true);
                }}
                className="px-5 py-2.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 font-black shadow-sm cursor-pointer border border-cyan-100 dark:border-cyan-800/50"
              >
                <Plus className="w-4 h-4" />
                เพิ่มหมวดหมู่คะแนน
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
                placeholder="-- เลือกห้องเรียน --"
                value={selectedClassGroup || undefined}
                onChange={(val) => setSelectedClassGroup(val || "")}
                options={classGroups.map(cg => ({ label: cg, value: cg }))}
                className="w-full h-12"
                size="large"
                allowClear
              />
            )}
          </div>
        </div>

        {/* Grading Configuration */}
        {config && selectedSubjectId && (
          <div className="bg-white/60 backdrop-blur-xl dark:bg-zinc-900/80 rounded-2xl p-2 sm:p-4 shadow-sm border border-white/40 dark:border-zinc-800 mb-6 print:hidden">
            <Collapse
              ghost
              className="w-full"
              items={[
                {
                  key: '1',
                  label: (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 pr-4">
                      <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                        โครงสร้างการให้คะแนน
                      </h2>
                      <div className="text-xs font-black text-blue-700 dark:text-blue-400 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50 flex items-center gap-2 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        รวม {config.totalPoints} คะแนน • เกณฑ์ผ่าน {config.passingScore} คะแนน
                      </div>
                    </div>
                  ),
                  children: (
                    <div className="pt-2">
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
                  )
                }
              ]}
            />
          </div>
        )}

        {/* Student Grades */}
        {config && selectedSubjectId && (
          <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-800/90 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 dark:border-zinc-700 overflow-hidden mb-8 print:hidden">
            <div className="p-6 border-b border-white/40 dark:border-zinc-700 bg-white/40 dark:bg-zinc-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <Users className="w-5 h-5" />
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
                    <th className="px-6 py-5 text-center text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest rounded-l-2xl w-20">
                      เลขที่
                    </th>
                    <th className="px-6 py-5 text-left text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">
                      นักเรียน
                    </th>
                    {config.categories.map((cat) => (
                      <th
                        key={cat.id}
                        className="px-4 py-5 text-center text-[11px] font-black text-cyan-800 dark:text-cyan-400 uppercase tracking-widest cursor-pointer hover:bg-cyan-100 dark:hover:bg-zinc-700 transition-colors group/th"
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setIsCategoryModalOpen(true);
                        }}
                        title="คลิกเพื่อตั้งค่าหมวดหมู่นี้"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {cat.name}
                          <Edit2 className="w-3 h-3 opacity-0 group-hover/th:opacity-100 transition-opacity text-blue-500" />
                        </div>
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
                      <td className="px-4 py-4 whitespace-nowrap text-center align-top pt-5">
                        <Input
                          value={grade.sequence !== undefined && grade.sequence !== null ? grade.sequence : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            let seq = val.trim() ? Number(val) : undefined;
                            if (seq !== undefined && isNaN(seq)) return;
                            setStudentGrades(prev => prev.map(g => g.id === grade.id ? { ...g, sequence: seq } : g));
                          }}
                          onBlur={(e) => handleSequenceChange(grade.id, e.target.value)}
                          onPressEnter={(e) => {
                            (e.target as HTMLInputElement).blur();
                          }}
                          className="w-12 text-center text-xs font-black text-blue-800 dark:text-blue-200 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 focus:border-blue-500 rounded-lg p-1 shadow-sm"
                          placeholder="-"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          {grade.studentName}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {grade.department && grade.department !== "ไม่ระบุแผนก" && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                              {grade.department}
                            </span>
                          )}
                          {grade.classGroupId && grade.classGroupId !== "ไม่ระบุห้องเรียน" && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                              {grade.classGroupId}
                            </span>
                          )}
                        </div>
                      </td>
                      {config.categories.map((cat) => {
                        const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;
                        let displayScore = grade.scores[cat.id] || 0;
                        
                        if (hasSubCategories) {
                          const catSubScores = grade.subScores?.[cat.id] || {};
                          const earnedSubPoints = cat.subCategories!.reduce((sum, s) => sum + (Number(catSubScores[s.id]) || 0), 0);
                          const maxSubPoints = cat.subCategories!.reduce((sum, s) => sum + (Number(s.points) || 0), 0) || 1;
                          displayScore = Math.round((earnedSubPoints / maxSubPoints) * cat.points);
                        }

                        return (
                        <td key={cat.id} className="px-6 py-4 whitespace-nowrap text-center">
                          {hasSubCategories ? (
                            <button
                              onClick={() => handleEditSubScores(grade, cat)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors border border-blue-200 dark:border-blue-800/50 min-w-16 shadow-sm cursor-pointer"
                              title="คลิกเพื่อกรอกคะแนนย่อย"
                            >
                              {displayScore} <span className="text-[10px] text-zinc-400 font-normal">/{cat.points}</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1 group/input relative">
                              <input
                                type="number"
                                min="0"
                                max={cat.points}
                                className={`w-14 h-8 px-1 text-center text-sm font-bold bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:bg-blue-50 dark:focus:bg-blue-900/20 border border-transparent focus:border-blue-300 dark:focus:border-blue-700 rounded-lg focus:outline-none transition-colors custom-number-input ${displayScore === 0 ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
                                  }`}
                                value={grade.scores[cat.id] === undefined ? "" : grade.scores[cat.id]}
                                onChange={(e) => handleQuickScoreChange(grade, cat.id, e.target.value)}
                                onBlur={() => handleQuickScoreBlur(grade)}
                                placeholder="0"
                              />
                              <span className="text-xs font-bold text-zinc-400 opacity-50 group-hover/input:opacity-100 transition-opacity">/{cat.points}</span>
                              <button
                                onClick={() => handleEditSubScores(grade, cat)}
                                title="จัดการตารางย่อย"
                                className="absolute -right-5 opacity-0 group-hover/input:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-blue-500 bg-blue-50 rounded hover:bg-blue-200 cursor-pointer"
                              >
                                ＋
                              </button>
                            </div>
                          )}
                        </td>
                      )})}
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
                        <div className="flex gap-2 justify-center transition-opacity">
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
                <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800/80 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <h4 className="text-zinc-600 dark:text-zinc-400 text-lg font-black mb-1">ยังไม่มีข้อมูลคะแนนนักเรียน</h4>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500 max-w-sm">
                    คลิกที่ปุ่ม <strong className="text-sky-500">"เพิ่มคะแนน"</strong> ด้านบนเพื่อเริ่มบันทึกคะแนนนักศึกษา หรือรอการดึงข้อมูลจากระบบ
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category Modal */}
        <AnimatePresence>
          {isCategoryModalOpen && config && (
            <Modal
              title={editingCategoryId ? "ตั้งค่าหมวดหมู่คะแนน" : "เพิ่มหมวดหมู่คะแนนใหม่"}
              open={isCategoryModalOpen}
              onCancel={() => {
                setIsCategoryModalOpen(false);
                setEditingCategoryId(null);
              }}
              onOk={handleSaveConfig}
              width={500}
              okText="บันทึก"
              cancelText="ยกเลิก"
            >
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                  let category: GradingCategory | undefined = config.categories.find(c => c.id === editingCategoryId);
                  if (!editingCategoryId) {
                    category = {
                      id: `custom_${Date.now()}`,
                      name: "",
                      points: 0,
                      cannotDeduct: false,
                      required: false,
                      description: "",
                    } as GradingCategory;
                  }
                  
                  if (!category) return <div className="text-center py-4">โปรดสร้างหมวดหมู่ใหม่ก่อนแก้ไข</div>;

                  const activeCategory = category;

                  return (
                  <div key={activeCategory.id} className="bg-white dark:bg-zinc-800/50 p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          ชื่อหมวดหมู่
                        </label>
                        <Input
                          value={activeCategory.name}
                          onChange={(e) => {
                            if (!editingCategoryId) {
                              const newId = `custom_${Date.now()}`;
                              const newCat = { ...activeCategory, id: newId, name: e.target.value };
                              setConfig({ ...config, categories: [...config.categories, newCat] });
                              setEditingCategoryId(newId);
                            } else {
                              handleUpdateCategory(activeCategory.id, "name", e.target.value);
                            }
                          }}
                          className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          คะแนนเต็ม
                        </label>
                        <InputNumber
                          value={activeCategory.points}
                          onChange={(val) => {
                            if (!editingCategoryId) {
                              const newId = `custom_${Date.now()}`;
                              const newCat = { ...activeCategory, id: newId, points: val || 0 };
                              setConfig({ ...config, categories: [...config.categories, newCat] });
                              setEditingCategoryId(newId);
                            } else {
                              handleUpdateCategory(activeCategory.id, "points", val || 0);
                            }
                          }}
                          className="w-full h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 font-black text-blue-600 dark:text-blue-400 [&>.ant-input-number-input-wrap>input]:h-10 [&>.ant-input-number-input-wrap>input]:font-black text-sm flex items-center"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                        คำอธิบายเพิ่มเติม
                      </label>
                      <Input
                        value={activeCategory.description}
                        onChange={(e) => {
                          if (editingCategoryId) handleUpdateCategory(activeCategory.id, "description", e.target.value);
                        }}
                        className="h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 text-sm"
                        placeholder="เช่น คะแนนเข้าเรียน, สอบกลางภาค..."
                      />
                    </div>

                    {editingCategoryId && (
                      <div className="flex justify-end border-t border-zinc-100 dark:border-zinc-700/50 pt-3 mt-2">
                        <button
                          onClick={() => {
                            handleRemoveCategory(activeCategory.id);
                            setIsCategoryModalOpen(false);
                            setEditingCategoryId(null);
                            // Also need to save config immediately
                            setTimeout(() => {
                               // Assuming the state updates, but user still needs to click Save?
                               // It's better to force a save if they delete a category.
                            }, 100);
                          }}
                          className="px-4 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          ลบหมวดหมู่นี้
                        </button>
                      </div>
                    )}
                  </div>
                  );
                })()}
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
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {!editingGrade && (
                  <div className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-[20px] p-5 shadow-sm">
                    <label className="block text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      <Users size={12} className="inline mr-1" />
                      ชื่อ-นามสกุล นักเรียน
                    </label>
                    <Input
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="กรอกชื่อนักเรียนใหม่..."
                      className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 font-bold text-base"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.categories.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-[20px] p-4 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                      <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <label className="flex text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 items-center justify-between gap-2">
                        <span className="truncate">{category.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full shrink-0">
                          {category.points} คะแนน
                        </span>
                      </label>
                      <InputNumber
                        value={gradeForm[category.id] || 0}
                        onChange={(val) => setGradeForm({ ...gradeForm, [category.id]: val || 0 })}
                        className="w-full h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 font-black text-emerald-600 dark:text-emerald-400 [&>.ant-input-number-input-wrap>input]:h-12 [&>.ant-input-number-input-wrap>input]:text-center text-lg"
                        min={0}
                        max={category.points}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Printable Area */}
        {config && selectedSubjectId && (
          <div
            id="printable-grade-sheet"
            className="hidden print:block p-4 bg-white text-black w-full"
            style={{ fontFamily: "'Sarabun', 'TH Sarabun PSK', 'TH SarabunPSK', sans-serif" }}
          >
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-xl font-black">วิทยาลัยเทคนิคกันทรลักษ์</h2>
              <h3 className="text-lg font-bold">รายงานผลการประเมินการฝึกงานระบบทวิภาคี (Grade Sheet)</h3>
              <p className="text-xs">
                <strong>วิชา:</strong> [{(subjects.find(s => s.id === selectedSubjectId))?.code}] {(subjects.find(s => s.id === selectedSubjectId))?.name} &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>แผนกวิชา:</strong> {(subjects.find(s => s.id === selectedSubjectId))?.department}
                {selectedClassGroup && (
                  <> &nbsp;&nbsp;&nbsp;&nbsp;<strong>ห้องเรียน:</strong> {selectedClassGroup}</>
                )}
              </p>
            </div>

            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr>
                  <th className="border border-black px-1 py-0.5 text-center">ลำดับ</th>
                  <th className="border border-black px-1 py-0.5 text-center">รหัสนักศึกษา</th>
                  <th className="border border-black px-1 py-0.5 text-left">ชื่อ-นามสกุล</th>
                  {config.categories.map(cat => (
                    <th key={cat.id} className="border border-black px-1 py-0.5 text-center">{cat.name} ({cat.points})</th>
                  ))}
                  <th className="border border-black px-1 py-0.5 text-center">คะแนนรวม</th>
                  <th className="border border-black px-1 py-0.5 text-center">เกรด</th>
                  <th className="border border-black px-1 py-0.5 text-center">ผลการเรียน</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((g, idx) => (
                  <tr key={g.id}>
                    <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{g.studentCode || ""}</td>
                    <td className="border border-black px-1 py-0.5 text-left">{g.studentName}</td>
                    {config.categories.map(cat => {
                      let displayScore = g.scores[cat.id] || 0;
                      const hasSubCategories = cat.subCategories && cat.subCategories.length > 0;
                      if (hasSubCategories) {
                        const catSubScores = g.subScores?.[cat.id] || {};
                        const earnedSubPoints = cat.subCategories!.reduce((sum, s) => sum + (Number(catSubScores[s.id]) || 0), 0);
                        const maxSubPoints = cat.subCategories!.reduce((sum, s) => sum + (Number(s.points) || 0), 0) || 1;
                        displayScore = Math.round((earnedSubPoints / maxSubPoints) * cat.points);
                      }
                      return (
                        <td key={cat.id} className="border border-black px-1 py-0.5 text-center">{displayScore}</td>
                      );
                    })}
                    <td className="border border-black px-1 py-0.5 text-center font-bold">{g.totalScore}</td>
                    <td className="border border-black px-1 py-0.5 text-center font-bold">{g.finalGrade}</td>
                    <td className="border border-black px-1 py-0.5 text-center">{g.isPassed ? "ผ่าน" : "ไม่ผ่าน"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between text-xs">
              <div></div>
              <div className="text-center space-y-4">
                <p>ลงชื่อ.......................................................... ครูผู้สอน</p>
                <p>(..........................................................)</p>
                <p>วันที่........./........./.........</p>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Score Modal */}
        <AnimatePresence>
          {isSubScoreModalOpen && activeSubScoreGrade && activeSubScoreCategory && (
            <Modal
              title={`กรอกคะแนนย่อย: ${activeSubScoreCategory.name} - ${activeSubScoreGrade.studentName}`}
              open={isSubScoreModalOpen}
              onCancel={() => {
                setIsSubScoreModalOpen(false);
                setActiveSubScoreGrade(null);
                setActiveSubScoreCategory(null);
              }}
              onOk={handleSaveSubScores}
              width={500}
              okText="บันทึกคะแนน"
              cancelText="ยกเลิก"
            >
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500 font-bold">กรอกคะแนนย่อย</span>
                  <button
                    onClick={() => {
                      const newSubCat = { id: `sub_${Date.now()}`, name: "ตารางย่อยใหม่", points: 10 };
                      setActiveSubScoreCategory({
                        ...activeSubScoreCategory,
                        subCategories: [...(activeSubScoreCategory.subCategories || []), newSubCat],
                      });
                    }}
                    className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-full font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={10} /> เพิ่มตารางย่อย
                  </button>
                </div>

                {(!activeSubScoreCategory.subCategories || activeSubScoreCategory.subCategories.length === 0) ? (
                  <div className="text-center text-sm text-zinc-400 py-4">
                    ยังไม่มีตารางคะแนนย่อย คลิกปุ่ม "เพิ่มตารางย่อย" ด้านบน
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/80">
                        <tr>
                          <th className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase">ชื่อตารางย่อย</th>
                          <th className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase w-20 text-center">คะแนนเต็ม</th>
                          <th className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase w-24 text-center">ได้คะแนน</th>
                          <th className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {activeSubScoreCategory.subCategories.map((subCat) => {
                          const currentScore = (activeSubScoreGrade.subScores?.[activeSubScoreCategory.id]?.[subCat.id]) || 0;
                          return (
                            <tr key={subCat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                              <td className="px-3 py-2">
                                <Input
                                  value={subCat.name}
                                  onChange={(e) => {
                                    const updatedSubCats = activeSubScoreCategory.subCategories!.map(s => s.id === subCat.id ? { ...s, name: e.target.value } : s);
                                    setActiveSubScoreCategory({ ...activeSubScoreCategory, subCategories: updatedSubCats });
                                  }}
                                  size="small"
                                  className="font-bold text-xs bg-transparent border-dashed border-zinc-300 dark:border-zinc-600"
                                  placeholder="ชื่อตารางย่อย"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <InputNumber
                                  value={subCat.points}
                                  onChange={(val) => {
                                    const updatedSubCats = activeSubScoreCategory.subCategories!.map(s => s.id === subCat.id ? { ...s, points: val || 0 } : s);
                                    setActiveSubScoreCategory({ ...activeSubScoreCategory, subCategories: updatedSubCats });
                                  }}
                                  size="small"
                                  min={0}
                                  className="w-full text-xs font-black text-blue-600 bg-transparent border-dashed border-zinc-300 dark:border-zinc-600 [&>.ant-input-number-input-wrap>input]:text-center"
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <InputNumber
                                  value={currentScore}
                                  onChange={(val) => handleSubScoreChange(subCat.id, String(val))}
                                  className="w-16 h-8 rounded-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 font-black text-blue-600 dark:text-blue-400 [&>.ant-input-number-input-wrap>input]:text-center"
                                  min={0}
                                  max={subCat.points}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => {
                                    const updatedSubCats = activeSubScoreCategory.subCategories!.filter(s => s.id !== subCat.id);
                                    setActiveSubScoreCategory({ ...activeSubScoreCategory, subCategories: updatedSubCats });
                                  }}
                                  className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                  <span className="text-xs font-black text-blue-800 dark:text-blue-300">คะแนนรวมสุทธิ (แปลงตามสัดส่วน)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-xs font-bold text-blue-600/60 dark:text-blue-400/60 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                      ดิบ: {activeSubScoreCategory.subCategories?.reduce((sum, subCat) => sum + (activeSubScoreGrade.subScores?.[activeSubScoreCategory.id]?.[subCat.id] || 0), 0) || 0} / {activeSubScoreCategory.subCategories?.reduce((sum, s) => sum + Number(s.points), 0) || 0}
                    </span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {Math.round(((activeSubScoreCategory.subCategories?.reduce((sum, subCat) => sum + (activeSubScoreGrade.subScores?.[activeSubScoreCategory.id]?.[subCat.id] || 0), 0) || 0) / (activeSubScoreCategory.subCategories?.reduce((sum, s) => sum + Number(s.points), 0) || 1)) * activeSubScoreCategory.points)} / {activeSubScoreCategory.points}
                    </span>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
