"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  User,
  GraduationCap,
  Loader2,
  Users,
  Award,
  Clock3,
  BookmarkCheck,
  ArrowRight,
  ClipboardList,
  X,
  Sparkles,
  Image as ImageIcon,
  Briefcase,
  FileText,
  Eye,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { message, Popconfirm, Select, DatePicker } from "antd";
import { uploadFile } from "@/lib/upload";
import { DEPARTMENTS } from "@/lib/constants";

type DveExtractScoreResult = {
  score: string | null;
  maxScore?: string | null;
  confidence?: string;
  note?: string;
  source?: string;
  rawText?: string;
};

async function fetchExtractedScore(imageUrl: string): Promise<DveExtractScoreResult | null> {
  try {
    const res = await fetch("/api/dve/extract-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    return data;
  } catch {
    return null;
  }
}

function formatScoreForStorage(extracted: DveExtractScoreResult | null): string {
  if (!extracted?.score) return "";
  return extracted.score;
}

function formatExtractedScoreMessage(extracted: DveExtractScoreResult | null): string {
  if (!extracted || !extracted.score) {
    const rawText = (extracted as any)?.rawText;
    const cleanRaw = rawText ? rawText.replace(/\s+/g, " ").trim() : "";
    const rawSnippet = cleanRaw ? ` (ข้อความที่สแกนได้: "${cleanRaw.substring(0, 60)}")` : "";
    return (extracted?.note || "ไม่พบคะแนนในรูป — กรุณากรอกคะแนนเอง") + rawSnippet;
  }
  const display = formatScoreForStorage(extracted) || extracted.score;
  return `อ่านคะแนนรวมจากรูปได้: ${display}`;
}
function formatThaiDateDisplay(dateString?: string) {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Premium loading spinner
function DVELoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
        กำลังโหลดระบบศูนย์ทวิภาคี DVE...
      </p>
    </div>
  );
}

// -------------------------------------------------------------
// STUDENT PORTAL COMPONENT HAS BEEN MOVED TO ./student/page.tsx
// -------------------------------------------------------------

function maskSensitiveData(val: string) {
  if (!val || val === "ไม่ระบุรหัส" || val.includes("ไม่ระบุ") || val.includes("ยังไม่กรอก")) {
    return "ยังไม่กรอกรหัสนักศึกษา";
  }
  const str = val.trim();
  if (str.length <= 5) return str;
  return `${str.slice(0, 3)}${"x".repeat(str.length - 5)}${str.slice(-2)}`;
}

// -------------------------------------------------------------
// TEACHER WORKSPACE PORTAL COMPONENT
// -------------------------------------------------------------
function DVETeacherWorkspace() {
  const { data: session } = useSession();
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"subjects" | "quizzes" | "checkin" | "internship">("subjects");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // แท็บสถานะออกฝึกงาน (Internship Tab States)
  const [internshipStudents, setInternshipStudents] = useState<any[]>([]);
  const [loadingInternship, setLoadingInternship] = useState(false);
  const [internshipFilter, setInternshipFilter] = useState({
    department: "",
    classGroupId: "",
  });
  const [internshipClassGroups, setInternshipClassGroups] = useState<string[]>([]);
  const [internshipSearchQuery, setInternshipSearchQuery] = useState("");

  // Subject Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    id: "",
    code: "",
    name: "",
    department: "",
    curriculum: "ปวส.",
    semester: "1/2569",
    academicYear: "2569",
  });

  // Unit Managing states
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [activeStudyUnit, setActiveStudyUnit] = useState<any>(null);
  const allUnitFiles = units.flatMap((unit: any) =>
    (unit.files || []).map((file: any) => ({
      ...file,
      unitTitle: unit.title,
      unitSequence: unit.sequence,
      unitId: unit.id || unit._id || "",
    })),
  );
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState<{
    id: string;
    title: string;
    content: string;
    sequence: number;
    studyMinutes: number;
    files: Array<{ name: string; url: string; type?: string }>;
  }>({
    id: "",
    title: "",
    content: "",
    sequence: 0,
    studyMinutes: 0,
    files: [],
  });

  // Upload states & upload files handler
  const [fileUploading, setFileUploading] = useState<{
    [key: number]: { loading: boolean; progress: number };
  }>({});

  const handleRowFileUpload = async (idx: number, file: File) => {
    if (!file) return;
    setFileUploading((prev) => ({
      ...prev,
      [idx]: { loading: true, progress: 0 },
    }));

    try {
      const res = await uploadFile(file, "dve_media", (percent) => {
        setFileUploading((prev) => ({
          ...prev,
          [idx]: { loading: true, progress: percent },
        }));
      });

      if (res && res.secure_url) {
        const newFiles = [...unitForm.files];
        newFiles[idx].url = res.secure_url;
        if (!newFiles[idx].name) {
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          newFiles[idx].name = baseName;
        }
        setUnitForm((prev) => ({ ...prev, files: newFiles }));
        message.success(`อัปโหลดไฟล์ "${file.name}" เรียบร้อยแล้ว!`);
      } else {
        message.error("อัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดระหว่างอัปโหลด");
    } finally {
      setFileUploading((prev) => ({
        ...prev,
        [idx]: { loading: false, progress: 0 },
      }));
    }
  };

  // Quiz states
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    id: "",
    subjectId: "",
    title: "",
    googleFormUrl: "",
    deadline: "",
    isBuiltIn: false,
    questions: [] as any[],
  });

  // Quiz submissions view states
  const [submissionsQuizId, setSubmissionsQuizId] = useState<string | null>(null);
  const [submissionsQuizTitle, setSubmissionsQuizTitle] = useState("");
  const [submissionsIsBuiltIn, setSubmissionsIsBuiltIn] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [submissionsClassFilter, setSubmissionsClassFilter] = useState<string>("all");
  const [submissionsPreviewUrl, setSubmissionsPreviewUrl] = useState<string | null>(null);
  const [submissionsPreviewName, setSubmissionsPreviewName] = useState<string | null>(null);

  // Checklist / Attendances checkin states
  const [checkinFilter, setCheckinFilter] = useState({
    subjectId: "",
    classGroupId: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [availableClassGroups, setAvailableClassGroups] = useState<string[]>([]);
  const [studentRoster, setStudentRoster] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [studentId: string]: {
      status: "Present" | "Late" | "Absent";
      assignmentStatus: "Submitted" | "Pending" | "None";
      score: string;
      imageUrl?: string;
      unitId?: string;
    };
  }>({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [showOnlyAttended, setShowOnlyAttended] = useState(false);
  const [showOnlyInternship, setShowOnlyInternship] = useState(false);
  const [extractingScoreStudentId, setExtractingScoreStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const logs = studentRoster.filter((student) => {
    const rec = attendanceRecords[student.id];
    return rec && (rec.status === "Present" || rec.status === "Late");
  });

  const studentSubmissionsById = useMemo(() => {
    return attendanceLogs.reduce((acc: Record<string, any[]>, record: any) => {
      if (!record.studentId) return acc;
      if (!acc[record.studentId]) acc[record.studentId] = [];
      acc[record.studentId].push(record);
      return acc;
    }, {});
  }, [attendanceLogs]);

  const internshipStats = useMemo(() => {
    const total = internshipStudents.length;
    const working = internshipStudents.filter((s) => s.isInternship).length;
    const normal = total - working;
    return { total, working, normal };
  }, [internshipStudents]);

  const displayedInternshipStudents = useMemo(() => {
    let list = internshipStudents;
    if (internshipSearchQuery.trim()) {
      const q = internshipSearchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.studentIdNum && s.studentIdNum.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [internshipStudents, internshipSearchQuery]);

  let baseRoster = showOnlyAttended ? logs : studentRoster;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    baseRoster = baseRoster.filter(
      (student) =>
        (student.name && student.name.toLowerCase().includes(q)) ||
        (student.studentIdNum && student.studentIdNum.toLowerCase().includes(q)),
    );
  }

  const displayedRoster = showOnlyInternship
    ? baseRoster.filter((student) => student.isInternship)
    : baseRoster;

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const res = await fetch("/api/dve/subjects");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Load distinct class groups that have assignment submissions for the selected subject
  useEffect(() => {
    const fetchSubmittedClassGroups = async () => {
      if (!checkinFilter.subjectId) {
        setAvailableClassGroups([]);
        return;
      }
      try {
        const res = await fetch(`/api/dve/attendances?subjectId=${checkinFilter.subjectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.attendances) {
            const classGroups = Array.from(
              new Set(
                data.attendances
                  .filter((a: any) => a.assignmentStatus === "Submitted" && a.classGroupId)
                  .map((a: any) => a.classGroupId),
              ),
            ).sort() as string[];
            setAvailableClassGroups(classGroups);
          }
        }
      } catch (err) {
        console.error("Fetch submitted class groups error:", err);
      }
    };
    fetchSubmittedClassGroups();
  }, [checkinFilter.subjectId]);

  useEffect(() => {
    if (!checkinFilter.subjectId) return;
    const selectedSubject = subjects.find((s) => s.id === checkinFilter.subjectId);
    if (selectedSubject) {
      handleManageUnits(selectedSubject);
    }
  }, [checkinFilter.subjectId]);

  // SUBJECT ACTIONS
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.code || !subjectForm.name || !subjectForm.department) {
      message.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    try {
      const isEdit = !!subjectForm.id;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/dve/subjects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectForm),
      });
      if (res.ok) {
        message.success(isEdit ? "แก้ไขวิชาทวิภาคีสำเร็จ" : "สร้างวิชาทวิภาคีสำเร็จ");
        setIsSubjectModalOpen(false);
        setSubjectForm({
          id: "",
          code: "",
          name: "",
          department: "",
          curriculum: "ปวส.",
          semester: "1/2569",
          academicYear: "2569",
        });
        fetchSubjects();
      }
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const res = await fetch(`/api/dve/subjects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("ลบรายวิชาทวิภาคีเรียบร้อยแล้ว");
        if (activeSubject?.id === id) setActiveSubject(null);
        fetchSubjects();
      }
    } catch (err) {
      message.error("ลบล้มเหลว");
    }
  };

  // UNITS ACTIONS
  const handleManageUnits = async (sub: any) => {
    setActiveSubject(sub);
    setLoadingUnits(true);
    try {
      const res = await fetch(`/api/dve/units?subjectId=${sub.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUnits(data.units || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.title) {
      message.error("กรุณาระบุหัวข้อหน่วยเรียน");
      return;
    }
    try {
      const isEdit = !!unitForm.id;
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        id: unitForm.id,
        title: unitForm.title,
        content: unitForm.content,
        sequence: unitForm.sequence,
        studyMinutes: unitForm.studyMinutes,
        subjectId: activeSubject.id,
        files: unitForm.files,
      };
      const res = await fetch("/api/dve/units", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        message.success(isEdit ? "แก้ไขหน่วยการเรียนรู้สำเร็จ" : "สร้างหน่วยการเรียนรู้สำเร็จ");
        setIsUnitModalOpen(false);
        setUnitForm({
          id: "",
          title: "",
          content: "",
          sequence: units.length + 1,
          studyMinutes: 0,
          files: [],
        });
        handleManageUnits(activeSubject);
      }
    } catch (err) {
      message.error("บันทึกหน่วยเรียนล้มเหลว");
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const res = await fetch(`/api/dve/units?id=${unitId}`, { method: "DELETE" });
      if (res.ok) {
        message.success("ลบหน่วยการเรียนเรียบร้อย");
        handleManageUnits(activeSubject);
      }
    } catch (err) {
      message.error("ลบล้มเหลว");
    }
  };

  // QUIZZES ACTIONS
  const handleLoadQuizzes = async (subjectId: string) => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch(`/api/dve/quizzes?subjectId=${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !quizForm.subjectId ||
      !quizForm.title ||
      (!quizForm.isBuiltIn && !quizForm.googleFormUrl)
    ) {
      message.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    try {
      const isEdit = !!quizForm.id;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/dve/quizzes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizForm),
      });
      if (res.ok) {
        message.success(isEdit ? "บันทึกข้อมูลสำเร็จ" : "สร้างควิซสำเร็จ");
        setIsQuizModalOpen(false);
        handleLoadQuizzes(quizForm.subjectId);
        setQuizForm({
          id: "",
          subjectId: quizForm.subjectId,
          title: "",
          googleFormUrl: "",
          deadline: "",
          isBuiltIn: false,
          questions: [],
        });
      }
    } catch (err) {
      message.error("บันทึกควิซล้มเหลว");
    }
  };

  const handleLoadSubmissions = async (quizId: string, quizTitle: string, isBuiltIn: boolean) => {
    setSubmissionsQuizId(quizId);
    setSubmissionsQuizTitle(quizTitle);
    setSubmissionsIsBuiltIn(isBuiltIn);
    setSubmissionsClassFilter("all");
    setSubmissionsPreviewUrl(null);
    setSubmissionsPreviewName(null);
    setLoadingSubmissions(true);
    setIsSubmissionsModalOpen(true);
    try {
      const res = await fetch(`/api/dve/quizzes/submissions?quizId=${quizId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubmissions(data.submissions || []);
        }
      }
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลผลคะแนนล้มเหลว");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleToggleSubjectiveGrading = async (submissionId: string, questionId: string, isCorrect: boolean) => {
    try {
      const res = await fetch("/api/dve/quizzes/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, questionId, isCorrect }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          message.success("อัปเดตผลการตรวจเรียบร้อยแล้ว!");
          // Update local submissions state in real-time
          setSubmissions((prev) =>
            prev.map((sub) => {
              if (sub.id === submissionId) {
                const updatedAnswers = (sub.answers || []).map((ans: any) => {
                  if (String(ans.questionId) === String(questionId)) {
                    return { ...ans, isCorrect };
                  }
                  return ans;
                });
                return {
                  ...sub,
                  answers: updatedAnswers,
                  score: data.score,
                  maxScore: data.maxScore,
                };
              }
              return sub;
            }),
          );
        } else {
          message.error(data.error || "อัปเดตล้มเหลว");
        }
      } else {
        message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดระหว่างสลับคะแนน");
    }
  };

  const handleDeleteQuiz = async (quizId: string, subId: string) => {
    try {
      const res = await fetch(`/api/dve/quizzes?id=${quizId}`, { method: "DELETE" });
      if (res.ok) {
        message.success("ลบควิซเรียบร้อยแล้ว");
        handleLoadQuizzes(subId);
      }
    } catch (err) {
      message.error("ลบล้มเหลว");
    }
  };

  // ATTENDANCES / ROSTER ACTIONS
  const handleLoadRoster = async () => {
    const { subjectId, classGroupId, date } = checkinFilter;
    if (!subjectId) return;

    setLoadingRoster(true);
    try {
      // 1. Get Subject details to know the department
      const sub = subjects.find((s) => s.id === subjectId);
      if (!sub) return;

      // 2. Fetch all registered students in that department & class
      const studentsRes = await fetch(
        `/api/dve/students?department=${encodeURIComponent(sub.department)}&classGroupId=${classGroupId}`,
      );

      // 3. Fetch existing attendance logs on that date
      const attendanceRes = await fetch(
        `/api/dve/attendances?subjectId=${subjectId}&date=${date}&classGroupId=${classGroupId}`,
      );

      if (studentsRes.ok && attendanceRes.ok) {
        const studentsData = await studentsRes.json();
        const attendanceData = await attendanceRes.json();

        const logs = attendanceData.attendances || [];
        setAttendanceLogs(logs);

        if (studentsData.success) {
          setStudentRoster(studentsData.students || []);
        }

        // Initialize attendance records for all students, defaulting to Absent
        const newRecords: any = {};
        (studentsData.students || []).forEach((std: any) => {
          const existing =
            logs.find((a: any) => a.studentId === std.id && !a.unitId) ||
            logs.find((a: any) => a.studentId === std.id);
          newRecords[std.id] = {
            status: existing ? existing.status : "Absent",
            assignmentStatus: existing ? existing.assignmentStatus : "None",
            score: existing ? existing.score : "",
            imageUrl: existing ? existing.imageUrl || "" : "",
            unitId: existing ? existing.unitId || "" : "",
          };
        });
        setAttendanceRecords(newRecords);
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการดึงรายชื่อนักศึกษา");
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleToggleInternship = async (student: any) => {
    try {
      const newStatus = !student.isInternship;
      setStudentRoster((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isInternship: newStatus } : s)),
      );
      setInternshipStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isInternship: newStatus } : s)),
      );

      const res = await fetch("/api/dve/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          isInternship: newStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          message.success(
            `สลับสถานะของ ${student.name} เป็น ${newStatus ? "💼 ออกฝึกงาน" : "🏫 เรียนปกติ"} เรียบร้อย!`,
          );
        } else {
          throw new Error(data.error || "เกิดข้อผิดพลาด");
        }
      } else {
        throw new Error("HTTP error");
      }
    } catch (err: any) {
      setStudentRoster((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isInternship: student.isInternship } : s)),
      );
      setInternshipStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, isInternship: student.isInternship } : s)),
      );
      message.error(err.message || "ไม่สามารถสลับสถานะการฝึกงานได้");
    }
  };

  const handleLoadInternshipStudents = async (dept: string, classGroupId: string = "") => {
    if (!dept) return;
    setLoadingInternship(true);
    try {
      const res = await fetch(
        `/api/dve/students?department=${encodeURIComponent(dept)}&classGroupId=${classGroupId}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInternshipStudents(data.students || []);
          if (data.classGroups) {
            setInternshipClassGroups(data.classGroups);
          }
        }
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาออกฝึกงาน");
    } finally {
      setLoadingInternship(false);
    }
  };

  const departments = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.department).filter(Boolean))) as string[];
  }, [subjects]);

  useEffect(() => {
    if (departments.length > 0 && !internshipFilter.department) {
      setInternshipFilter((prev) => ({ ...prev, department: departments[0] }));
    }
  }, [departments, internshipFilter.department]);

  useEffect(() => {
    if (activeTab === "internship" && internshipFilter.department) {
      handleLoadInternshipStudents(internshipFilter.department, internshipFilter.classGroupId);
    }
  }, [activeTab, internshipFilter.department, internshipFilter.classGroupId]);

  const handleExtractScoreFromImage = async (studentId: string, imageUrl: string): Promise<string | null> => {
    setExtractingScoreStudentId(studentId);
    try {
      message.loading({
        content: "กำลังอ่านคะแนนจากรูป (OCR ฟรี)...",
        key: "dve-ocr-teacher",
        duration: 0,
      });
      const extracted = await fetchExtractedScore(imageUrl);
      message.destroy("dve-ocr-teacher");

      if (extracted?.score) {
        const cleanScore = formatScoreForStorage(extracted) || extracted.score!;
        setAttendanceRecords((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            status: prev[studentId]?.status || "Absent",
            assignmentStatus: prev[studentId]?.assignmentStatus || "None",
            score: cleanScore,
            imageUrl,
          },
        }));
        message.success(formatExtractedScoreMessage(extracted));
        return cleanScore;
      } else {
        message.warning(formatExtractedScoreMessage(extracted || { score: null }));
        return null;
      }
    } catch (err) {
      console.error("Teacher extract score error:", err);
      message.error("อ่านคะแนนจากรูปไม่สำเร็จ");
      return null;
    } finally {
      setExtractingScoreStudentId(null);
    }
  };

  const handleBulkSaveAttendance = async () => {
    const { subjectId, date } = checkinFilter;
    if (!subjectId || !date) {
      message.error("กรุณาระบุข้อมูลที่จำเป็น");
      return;
    }

    setSavingAttendance(true);
    try {
      const recordsPayload = studentRoster.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        studentIdNum: s.studentIdNum,
        classGroupId: s.classGroupId,
        status: attendanceRecords[s.id]?.status || "Absent",
        assignmentStatus: attendanceRecords[s.id]?.assignmentStatus || "None",
        score: attendanceRecords[s.id]?.score || "",
        imageUrl: attendanceRecords[s.id]?.imageUrl || "",
      }));

      const res = await fetch("/api/dve/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          date,
          records: recordsPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        message.success(data.message || "บันทึกเวลาเรียนและผลงานเรียบร้อยแล้ว!");
        handleLoadRoster();
      }
    } catch (err) {
      message.error("บันทึกการเช็คชื่อล้มเหลว");
    } finally {
      setSavingAttendance(false);
    }
  };

  const [clearingAttendance, setClearingAttendance] = useState(false);

  const handleClearAttendance = async () => {
    const { subjectId, classGroupId, date } = checkinFilter;
    if (!subjectId || !date) return;

    setClearingAttendance(true);
    try {
      const url = `/api/dve/attendances?subjectId=${subjectId}&date=${date}${classGroupId ? `&classGroupId=${classGroupId}` : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        message.success(data.message || "ล้างข้อมูลเรียบร้อยแล้ว");
        handleLoadRoster();
      } else {
        message.error("ไม่สามารถล้างข้อมูลได้");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการล้างข้อมูล");
    } finally {
      setClearingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Workspace Header */}
      <div className="relative overflow-hidden rounded-[30px] bg-linear-to-br from-teal-500 to-emerald-700 text-white p-8 shadow-xl shadow-teal-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full text-white/90">
            DVE Administration Panel
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">
            ระบบจัดตารางเรียนทวิภาคี (DVE Workspace)
          </h1>
          <p className="text-white/80 font-bold mt-2 text-sm sm:text-base leading-relaxed">
            ห้องควบคุมหลักสำหรับอาจารย์: จัดการรายวิชาการเรียนการสอน, สื่อและไฟล์การเรียนรายหน่วย,
            สร้างฟอร์มควิซทดสอบ และบันทึกประวัติการขาดลามาสายและผลงานนักศึกษา
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-full sm:w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all grow sm:grow-0 whitespace-nowrap ${activeTab === "subjects" ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          <BookOpen size={13} />
          วิชา & หน่วยเรียน
        </button>
        <button
          onClick={() => {
            setActiveTab("quizzes");
            if (subjects.length > 0) {
              setQuizForm((prev) => ({ ...prev, subjectId: subjects[0].id }));
              handleLoadQuizzes(subjects[0].id);
            }
          }}
          className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all grow sm:grow-0 whitespace-nowrap ${activeTab === "quizzes" ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          <Award size={13} />
          ควิซทดสอบ
        </button>
        <button
          onClick={() => {
            setActiveTab("checkin");
            if (subjects.length > 0) {
              setCheckinFilter((prev) => ({ ...prev, subjectId: subjects[0].id }));
            }
          }}
          className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all grow sm:grow-0 whitespace-nowrap ${activeTab === "checkin" ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          <ClipboardList size={13} />
          เช็คชื่อ & งาน
        </button>
        <button
          onClick={() => {
            setActiveTab("internship");
          }}
          className={`flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all grow sm:grow-0 whitespace-nowrap ${activeTab === "internship" ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          <Briefcase size={13} />
          สถานะ: ออกฝึกงาน
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Subjects & Units Management */}
        {activeTab === "subjects" && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* List of Subjects */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-500" />
                  รายวิชาทวิภาคีทั้งหมด
                </h3>
                <button
                  onClick={() => {
                    setSubjectForm({
                      id: "",
                      code: "",
                      name: "",
                      department: session?.user?.name ? (session.user as any).department || "" : "",
                      curriculum: "ปวส.",
                      semester: "1/2569",
                      academicYear: "2569",
                    });
                    setIsSubjectModalOpen(true);
                  }}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center gap-1 text-xs font-black"
                >
                  <Plus size={14} />
                  เพิ่มวิชา
                </button>
              </div>

              {loadingSubjects ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs font-bold">
                  คุณครูยังไม่ได้เพิ่มรายวิชาใดๆ ลงในระบบ
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleManageUnits(sub)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${activeSubject?.id === sub.id ? "bg-emerald-500/5 border-emerald-500/30" : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100/50"}`}
                    >
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wide">
                        {sub.curriculum} • ภาคเรียน {sub.semester}
                      </span>
                      <h4 className="font-black text-zinc-950 dark:text-zinc-100 text-sm mt-1 truncate">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        รหัส: {sub.code} • แผนก: {sub.department}
                      </p>
                      <div
                        className="flex justify-end gap-2 mt-3 border-t dark:border-zinc-800 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setSubjectForm({ ...sub });
                            setIsSubjectModalOpen(true);
                          }}
                          className="p-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-600 dark:text-zinc-300 rounded"
                        >
                          <Edit2 size={12} />
                        </button>
                        <Popconfirm
                          title="ลบรายวิชา?"
                          description="การลบวิชานี้จะลบหน่วยการเรียน ควิซแบบทดสอบ และเวลาเรียนของนักศึกษาทั้งหมดอย่างถาวร"
                          onConfirm={() => handleDeleteSubject(sub.id)}
                          okText="ยืนยัน"
                          cancelText="ยกเลิก"
                          okButtonProps={{ danger: true }}
                        >
                          <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded">
                            <Trash2 size={12} />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of Units inside active Subject */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              {activeSubject ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">
                        หน่วยการเรียนและไฟล์แนบ
                      </span>
                      <h3 className="text-base font-black text-zinc-900 dark:text-white mt-0.5 leading-tight">
                        {activeSubject.name} ({activeSubject.code})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setUnitForm({
                          id: "",
                          title: "",
                          content: "",
                          sequence: units.length + 1,
                          studyMinutes: 0,
                          files: [],
                        });
                        setIsUnitModalOpen(true);
                      }}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center gap-1 text-xs font-black"
                    >
                      <Plus size={14} />
                      เพิ่มหน่วยเรียน
                    </button>
                  </div>

                  {loadingUnits ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : units.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <FolderOpen size={32} className="text-zinc-300 dark:text-zinc-700" />
                      วิชานี้ยังไม่มีการสร้างหน่วยเรียนใดๆ เลยในระบบ
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {units.map((unit, index) => (
                        <div
                          key={unit.id}
                          className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 relative group"
                        >
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setUnitForm({
                                  id: unit.id,
                                  title: unit.title,
                                  content: unit.content,
                                  sequence: unit.sequence,
                                  studyMinutes: unit.studyMinutes || 0,
                                  files: unit.files || [],
                                });
                                setIsUnitModalOpen(true);
                              }}
                              className="p-1.5 bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded"
                            >
                              <Edit2 size={12} />
                            </button>
                            <Popconfirm
                              title="ลบหน่วยการเรียน?"
                              onConfirm={() => handleDeleteUnit(unit.id)}
                            >
                              <button className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded">
                                <Trash2 size={12} />
                              </button>
                            </Popconfirm>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-black text-xs">
                              #{unit.sequence}
                            </div>
                            <div>
                              <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm">
                                {unit.title}
                              </h4>
                              {unit.content && (
                                <p className="text-xs text-zinc-500 mt-1 whitespace-pre-line leading-relaxed">
                                  {unit.content}
                                </p>
                              )}
                            </div>
                          </div>

                          {unit.files &&
                            unit.files.length > 0 &&
                            (() => {
                              const directFiles = unit.files.filter(
                                (f: any) =>
                                  f.type === "file" ||
                                  f.url?.startsWith("/uploads/") ||
                                  f.url?.startsWith("/api/media/"),
                              );
                              const externalLinks = unit.files.filter(
                                (f: any) => !directFiles.includes(f),
                              );
                              return (
                                <div className="mt-3 space-y-2.5 pl-12">
                                  {directFiles.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                                        📂 ไฟล์เอกสารแนบ:
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {directFiles.map((file: any, fIdx: number) => (
                                          <a
                                            key={fIdx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black rounded transition-colors border border-emerald-500/10"
                                          >
                                            <Download size={10} />
                                            {file.name}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {externalLinks.length > 0 && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                                        🔗 ลิงก์และแหล่งข้อมูลภายนอก:
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {externalLinks.map((file: any, fIdx: number) => (
                                          <a
                                            key={fIdx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[10px] font-black rounded transition-colors border border-blue-500/10"
                                          >
                                            <ExternalLink size={10} />
                                            {file.name}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm font-bold flex flex-col items-center justify-center gap-2">
                  <BookOpen size={48} className="text-zinc-200 dark:text-zinc-800" />
                  กรุณาเลือกรายวิชาในแผงด้านซ้ายเพื่อดูหรือเริ่มเขียนหน่วยการสอน
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 2: Quizzes Management */}
        {activeTab === "quizzes" && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Subject Selector for quiz management */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-emerald-500" />
                เลือกรายวิชาเพื่อควิซ
              </h3>
              <div className="space-y-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setQuizForm((prev) => ({ ...prev, subjectId: s.id }));
                      handleLoadQuizzes(s.id);
                    }}
                    className={`w-full p-4 rounded-xl text-left border transition-all ${quizForm.subjectId === s.id ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300"}`}
                  >
                    <span className="text-[9px] font-black opacity-80 block">{s.code}</span>
                    <span className="font-black text-sm truncate block mt-0.5">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quizzes List and Add Quiz */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              {quizForm.subjectId ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <Award size={16} className="text-emerald-500" />
                      แบบทดสอบและควิซทั้งหมด
                    </h3>
                    <button
                      onClick={() => {
                        setQuizForm({
                          id: "",
                          subjectId: quizForm.subjectId,
                          title: "",
                          googleFormUrl: "",
                          deadline: "",
                          isBuiltIn: false,
                          questions: [],
                        });
                        setIsQuizModalOpen(true);
                      }}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center gap-1 text-xs font-black"
                    >
                      <Plus size={14} />
                      สร้างแบบทดสอบ
                    </button>
                  </div>

                  {loadingQuizzes ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : quizzes.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <Award size={32} className="text-zinc-300 dark:text-zinc-700" />
                      ยังไม่มีการสร้างแบบทดสอบ สำหรับวิชานี้
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-xl gap-4 animate-fade-in"
                        >
                          <div className="space-y-1.5 grow">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                                {quiz.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none border ${quiz.isBuiltIn ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}`}
                              >
                                {quiz.isBuiltIn ? "🧠 ควิซในแอป" : "🔗 Google Form"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400">
                              {!quiz.isBuiltIn ? (
                                <span className="flex items-center gap-1">
                                  <ExternalLink size={10} />
                                  {quiz.googleFormUrl ? quiz.googleFormUrl.substring(0, 45) + "..." : "ไม่มีลิงก์"}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                  <ClipboardList size={10} />
                                  จำนวนคำถาม: {quiz.questions?.length || 0} ข้อ
                                </span>
                              )}
                              {quiz.deadline && (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Calendar size={10} />
                                  เดดไลน์: {quiz.deadline}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* View submissions — available for ALL quiz types */}
                            <button
                              onClick={() => handleLoadSubmissions(quiz.id, quiz.title, !!quiz.isBuiltIn)}
                              className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-600 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-lg text-xs font-black transition-all shadow-sm flex items-center gap-1"
                            >
                              <Eye size={12} />
                              ดูงานที่ส่ง
                            </button>
                            <button
                              onClick={() => {
                                setQuizForm({
                                  id: quiz.id,
                                  subjectId: quiz.subjectId,
                                  title: quiz.title,
                                  googleFormUrl: quiz.googleFormUrl || "",
                                  deadline: quiz.deadline || "",
                                  isBuiltIn: !!quiz.isBuiltIn,
                                  questions: quiz.questions || [],
                                });
                                setIsQuizModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-black transition-colors"
                            >
                              แก้ไข
                            </button>
                            <Popconfirm
                              title="ลบควิซแบบประเมินนี้?"
                              onConfirm={() => handleDeleteQuiz(quiz.id, quizForm.subjectId)}
                            >
                              <button className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-xs font-black transition-all">
                                ลบ
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm font-bold flex flex-col items-center justify-center gap-2">
                  <Award size={48} className="text-zinc-200 dark:text-zinc-800" />
                  กรุณาเลือกรายวิชาในแผงด้านซ้ายเพื่อดูหรือสร้างแบบทดสอบ Google Form
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: Attendance Checklist & Grading Panel */}
        {activeTab === "checkin" && (
          <motion.div
            key="checkin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Filter control box */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    1. เลือกรายวิชาเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกวิชาเรียน --"
                    className="w-full h-11"
                    value={checkinFilter.subjectId || undefined}
                    onChange={(val) => {
                      setCheckinFilter((prev) => ({ ...prev, subjectId: val, classGroupId: "" }));
                      setStudentRoster([]);
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    options={subjects.map((s) => ({ label: `[${s.code}] ${s.name}`, value: s.id }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    2. เลือกกลุ่มเรียน / ห้องเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกกลุ่มเรียน --"
                    className="w-full h-11"
                    value={checkinFilter.classGroupId || undefined}
                    onChange={(val) => {
                      setCheckinFilter((prev) => ({ ...prev, classGroupId: val }));
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    options={[
                      { label: "แสดงทั้งหมด", value: "" },
                      ...availableClassGroups.map((c) => ({ label: c, value: c })),
                    ]}
                    disabled={!checkinFilter.subjectId}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    3. วันที่เช็คแถว / คาบเรียน
                  </label>
                  <input
                    type="date"
                    className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                    value={checkinFilter.date}
                    onChange={(e) => {
                      setCheckinFilter((prev) => ({ ...prev, date: e.target.value }));
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    4. ค้นหารายชื่อนักเรียน / รหัสนักศึกษา
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 พิมพ์ชื่อ หรือ รหัส..."
                    className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white placeholder-zinc-400 font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleLoadRoster}
                  disabled={!checkinFilter.subjectId}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 text-white font-black rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <Search size={16} />
                  ดึงรายชื่อเด็ก
                </button>
              </div>
            </div>

            {/* Student Roster attendance checkboxes sheet */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b dark:border-zinc-800 pb-4">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <ClipboardList size={18} className="text-emerald-500" />
                    บัญชีลงเวลาการเข้าเรียนและส่งงานนักศึกษา
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold mt-1">
                    <span className="text-zinc-500">
                      วันที่เช็ค: {formatThaiDateDisplay(checkinFilter.date)}
                    </span>
                    {activeStudyUnit && (
                      <span className="text-zinc-500">
                        หน่วยการสอน: หน่วยที่ {activeStudyUnit.sequence || "-"}:{" "}
                        {activeStudyUnit.title}
                      </span>
                    )}

                    {studentRoster.length > 0 && (
                      <>
                    <label className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer select-none border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded-lg">
                          <input
                            type="checkbox"
                            className="accent-emerald-500 w-3.5 h-3.5"
                            checked={showOnlyAttended}
                            onChange={(e) => setShowOnlyAttended(e.target.checked)}
                          />
                          แสดงเฉพาะคนเข้าเรียนจริงวันนี้ (ผ่าน Auto Check-in)
                        </label>
                      </>
                    )}
                  </div>
                  {/* {units.length > 0 && (
                    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 space-y-2">
                      <span className="font-black uppercase tracking-wider">หน่วยการสอน:</span>
                      <div className="flex flex-wrap gap-2">
                        {units.map((unit: any, idx: number) => (
                          <span
                            key={unit.id || unit._id || idx}
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-[10px] font-black text-zinc-700 dark:text-zinc-300"
                          >
                            หน่วยที่ {unit.sequence || idx + 1}: {unit.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )} */}
                  {/* {allUnitFiles.length > 0 && (
                    <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="font-black uppercase tracking-wider mb-2">สื่อดาวน์โหลด:</div>
                      <div className="flex flex-wrap gap-2">
                        {allUnitFiles.map((file: any, idx: number) => (
                          <a
                            key={`${file.unitId || file.unitSequence}-${idx}`}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-[10px] font-black text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Download size={12} />
                            หน่วยที่ {file.unitSequence || "-"}: {file.unitTitle}{" "}
                            {file.name ? `- ${file.name}` : "ดาวน์โหลดสื่อ"}
                          </a>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>

                {studentRoster.length > 0 && (
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                    <Popconfirm
                      title="คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการเช็คชื่อทั้งหมดในวันนี้สำหรับกลุ่มเรียนนี้?"
                      onConfirm={handleClearAttendance}
                      okText="ใช่, ลบเลย"
                      cancelText="ยกเลิก"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        type="button"
                        disabled={clearingAttendance}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-200 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        {clearingAttendance ? "กำลังลบ..." : "🗑️ ล้างข้อมูลการเข้าเรียนวันนี้"}
                      </button>
                    </Popconfirm>

                    <button
                      onClick={handleBulkSaveAttendance}
                      disabled={savingAttendance}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                      {savingAttendance ? "กำลังบันทึก..." : "✓ บันทึกเวลาเรียน & ผลงานนักศึกษา"}
                    </button>
                  </div>
                )}
              </div>

              {/* {attendanceLogs.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                        รายการงานที่นักเรียนส่งแล้ว
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        แสดงข้อมูลการส่งงานทั้งหมดตามวันนี้และวิชาที่เลือก
                        รวมทั้งหน่วยการสอนและสื่อดาวน์โหลด
                      </p>
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {attendanceLogs.length} รายการ
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {attendanceLogs.map((att: any) => (
                      <div
                        key={att.id || `${att.studentId}-${att.unitId}-${att.score}`}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              หน่วยการสอน
                            </div>
                            <div className="text-sm font-black text-zinc-900 dark:text-white">
                              หน่วยที่ {att.unitSequence || "-"}:{" "}
                              {att.unitTitle || "ไม่ระบุชื่อหน่วย"}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            วันที่: {formatThaiDateDisplay(att.date || checkinFilter.date)} • กลุ่ม:{" "}
                            {att.classGroupId || "-"}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
                          <div className="space-y-2">
                            <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              นักศึกษา
                            </div>
                            <div className="text-sm font-black text-zinc-900 dark:text-white">
                              {att.studentName} ({att.studentIdNum})
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              สถานะงาน / คะแนน
                            </div>
                            <div className="text-sm font-black text-zinc-900 dark:text-white">
                              {att.assignmentStatus || "ไม่มีข้อมูล"} • {att.status || "-"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            คะแนน / หมายเหตุ: {att.score || "-"}
                          </div>
                          {att.imageUrl ? (
                            <a
                              href={att.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 text-[11px] font-black hover:bg-emerald-500/15 transition-all"
                            >
                              ดูสื่อที่ส่ง
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">ยังไม่มีสื่อประกอบ</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}

              {loadingRoster ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : studentRoster.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm font-bold border border-dashed dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
                  <Users size={36} className="text-zinc-200 dark:text-zinc-800" />
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-black">
                      ไม่พบข้อมูลนักเรียน
                    </p>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed">
                      กรุณาเลือกวิชาเรียนและกดยืนยันเพื่อดึงบัญชีรายชื่อนักศึกษาในแผนกหรือกลุ่มเรียนนี้ครับ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedRoster.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 font-bold text-xs border border-dashed dark:border-zinc-800 rounded-2xl">
                      ยังไม่มีนักเรียนที่ผ่านการนับเวลาเรียน (Auto Check-in) ในวันนี้
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View (hidden on mobile, visible on sm and up) */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                              <th className="py-4 px-2">รหัสประจำตัว</th>
                              <th className="py-4 px-2">ข้อมูลนักศึกษา / ประวัติงาน</th>
                              <th className="py-4 px-2 text-center">กลุ่มเรียน</th>
                              <th className="py-4 px-2 text-center">สถานะเวลาเรียน</th>
                              <th className="py-4 px-2 text-center">การส่งการบ้าน / งาน</th>
                              <th className="py-4 px-2 text-right">คะแนน / หมายเหตุ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {displayedRoster.map((student) => {
                              const rec = attendanceRecords[student.id] || {
                                status: "Absent",
                                assignmentStatus: "None",
                                score: "",
                              };
                              return (
                                <tr
                                  key={student.id}
                                  className="text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850/50"
                                >
                                  <td className="py-4 px-2 font-medium text-xs tracking-wider">{maskSensitiveData(student.studentIdNum)}</td>
                                  <td className="py-4 px-2">
                                    <div className="flex flex-col gap-2.5">
                                      <div className="flex items-center gap-3">
                                        {student.image ? (
                                          <img
                                            src={student.image}
                                            className="w-9 h-9 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-sm shrink-0"
                                          />
                                        ) : (
                                          <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                                            <User size={14} />
                                          </div>
                                        )}
                                        <div className="flex flex-col gap-1">
                                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{student.name}</span>
                                        </div>
                                      </div>
                                      
                                      {/* ประวัติการส่งงานที่ผ่านมา */}
                                      {studentSubmissionsById[student.id]?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1 bg-zinc-50 dark:bg-zinc-850/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                          {studentSubmissionsById[student.id].map((att, idx) => {
                                            const isDone = att.assignmentStatus === "Submitted";
                                            const isPending = att.assignmentStatus === "Pending";
                                            return (
                                              <div
                                                key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-black shadow-xs ${
                                                  isDone 
                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                                                    : isPending
                                                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
                                                      : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400"
                                                }`}
                                              >
                                                <span className="opacity-80">บทที่ {att.unitSequence || "-"}:</span>
                                                <span className="truncate max-w-[80px]">{att.unitTitle || "-"}</span>
                                                <span className="flex items-center gap-1 border-l border-current pl-1.5 opacity-90">
                                                  {isDone ? "✅" : isPending ? "⌛" : "❌"}
                                                  {att.score ? ` ${att.score}` : ""}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-2 text-center text-xs font-bold text-zinc-500">{student.classGroupId}</td>
                                  
                                  {/* Column 4: Attendance Status Badge */}
                                  <td className="py-4 px-2 text-center">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border ${
                                        rec.status === "Present"
                                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                                          : rec.status === "Late"
                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                                      }`}
                                    >
                                      {rec.status === "Present" ? "ตรงเวลา" : rec.status === "Late" ? "มาสาย" : "ขาดเรียน"}
                                    </span>
                                  </td>

                                  {/* Column 5: Assignment Status Badge */}
                                  <td className="py-4 px-2 text-center">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border ${
                                        rec.assignmentStatus === "Submitted"
                                          ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60"
                                          : rec.assignmentStatus === "Pending"
                                            ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60"
                                            : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60"
                                      }`}
                                    >
                                      {rec.assignmentStatus === "Submitted" ? "ส่งแล้ว" : rec.assignmentStatus === "Pending" ? "ค้างส่ง" : "ไม่มีงาน"}
                                    </span>
                                  </td>

                                  {/* Column 6: Score / Edit Action */}
                                  <td className="py-4 px-2 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <div className="text-right">
                                        <span className="text-xs font-bold text-zinc-400 block uppercase">คะแนน</span>
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                          {rec.score ? rec.score : "-"}
                                        </span>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingStudent({
                                            id: student.id,
                                            name: student.name,
                                            studentIdNum: student.studentIdNum,
                                            classGroupId: student.classGroupId,
                                            status: rec.status,
                                            assignmentStatus: rec.assignmentStatus,
                                            score: rec.score,
                                            imageUrl: rec.imageUrl,
                                            unitId: rec.unitId,
                                          });
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                                      >
                                        <Edit2 size={12} />
                                        <span>แก้ไข</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card List View (hidden on desktop, visible on small screens < sm) */}
                      <div className="block sm:hidden space-y-4">
                        {displayedRoster.map((student) => {
                          const rec = attendanceRecords[student.id] || {
                            status: "Absent",
                            assignmentStatus: "None",
                            score: "",
                          };
                          return (
                            <div
                              key={student.id}
                              className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-2xl space-y-4 shadow-xs"
                            >
                              {/* Student Info Row */}
                              <div className="flex items-center gap-3">
                                {student.image ? (
                                  <img
                                    src={student.image}
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                    <User size={16} />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                    <span className="truncate">{student.name}</span>
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                    ID: {maskSensitiveData(student.studentIdNum)} • กลุ่ม: {student.classGroupId}
                                  </p>
                                </div>
                              </div>

                              {studentSubmissionsById[student.id]?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-2 rounded-xl border dark:border-zinc-800/80">
                                  {studentSubmissionsById[student.id].map((att, idx) => {
                                    const isDone = att.assignmentStatus === "Submitted";
                                    const isPending = att.assignmentStatus === "Pending";
                                    return (
                                      <div
                                        key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black shadow-xs ${
                                          isDone 
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
                                            : isPending
                                              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400"
                                              : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400"
                                        }`}
                                      >
                                        <span className="opacity-80">บทที่ {att.unitSequence || "-"}:</span>
                                        <span className="truncate max-w-[60px]">{att.unitTitle || "-"}</span>
                                        <span className="flex items-center gap-1 border-l border-current pl-1 opacity-90">
                                          {isDone ? "✅" : isPending ? "⌛" : "❌"}
                                          {att.score ? ` ${att.score}` : ""}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2 border-t dark:border-zinc-800/80 pt-3 items-center justify-between">
                                <div className="flex flex-wrap gap-1.5">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                      rec.status === "Present"
                                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                                        : rec.status === "Late"
                                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                                    }`}
                                  >
                                    {rec.status === "Present" ? "ตรงเวลา" : rec.status === "Late" ? "มาสาย" : "ขาดเรียน"}
                                  </span>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                      rec.assignmentStatus === "Submitted"
                                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60"
                                        : rec.assignmentStatus === "Pending"
                                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60"
                                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60"
                                    }`}
                                  >
                                    {rec.assignmentStatus === "Submitted" ? "ส่งแล้ว" : rec.assignmentStatus === "Pending" ? "ค้างส่ง" : "ไม่มีงาน"}
                                  </span>
                                  <span className="text-[10px] font-bold text-zinc-500">
                                    คะแนน: <span className="font-black text-indigo-600 dark:text-indigo-400">{rec.score || "-"}</span>
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStudent({
                                      id: student.id,
                                      name: student.name,
                                      studentIdNum: student.studentIdNum,
                                      classGroupId: student.classGroupId,
                                      status: rec.status,
                                      assignmentStatus: rec.assignmentStatus,
                                      score: rec.score,
                                      imageUrl: rec.imageUrl,
                                      unitId: rec.unitId,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                                >
                                  <Edit2 size={11} />
                                  <span>แก้ไข</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "internship" && (
          <motion.div
            key="internship"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* 1. Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500 text-blue-600">
                  <Users size={72} strokeWidth={1.5} />
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">
                    นักศึกษาในแผนกทั้งหมด
                  </span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1 inline-block">
                    {internshipStats.total} <span className="text-xs font-bold text-zinc-400">คน</span>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500 text-emerald-600">
                  <Briefcase size={72} strokeWidth={1.5} />
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <Briefcase size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">
                    💼 กำลังออกฝึกงาน
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1 inline-block">
                    {internshipStats.working} <span className="text-xs font-bold text-zinc-400">คน</span>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500 text-zinc-500">
                  <BookOpen size={72} strokeWidth={1.5} />
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-zinc-650 dark:text-zinc-400">
                  <BookOpen size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">
                    🏫 เรียนปกติที่วิทยาลัย
                  </span>
                  <span className="text-2xl font-black text-zinc-700 dark:text-zinc-300 leading-none mt-1 inline-block">
                    {internshipStats.normal} <span className="text-xs font-bold text-zinc-400">คน</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Filter controls */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    เลือกแผนกวิชา
                  </label>
                  <Select
                    placeholder="-- เลือกแผนกวิชา --"
                    className="w-full h-11"
                    value={internshipFilter.department || undefined}
                    onChange={(val) => {
                      setInternshipFilter((prev) => ({ ...prev, department: val, classGroupId: "" }));
                      setInternshipStudents([]);
                    }}
                    options={departments.map((d) => ({ label: d, value: d }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    เลือกห้องเรียน / กลุ่มเรียน
                  </label>
                  <Select
                    placeholder="-- แสดงทั้งหมด --"
                    className="w-full h-11"
                    value={internshipFilter.classGroupId || ""}
                    onChange={(val) => {
                      setInternshipFilter((prev) => ({ ...prev, classGroupId: val }));
                    }}
                    options={[
                      { label: "แสดงทั้งหมด", value: "" },
                      ...internshipClassGroups.map((c) => ({ label: c, value: c })),
                    ]}
                    disabled={!internshipFilter.department}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    ค้นหาชื่อ หรือ รหัสนักศึกษา
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 พิมพ์เพื่อค้นหา..."
                    className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white placeholder-zinc-400 font-bold"
                    value={internshipSearchQuery}
                    onChange={(e) => setInternshipSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Students Table / Card view */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6 border-b dark:border-zinc-800 pb-4">
                <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-500" />
                  รายชื่อนักศึกษากับสถานะการออกฝึกงาน
                </h3>
                <span className="text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full">
                  แสดงผล {displayedInternshipStudents.length} คน
                </span>
              </div>

              {loadingInternship ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : internshipStudents.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm font-bold border border-dashed dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
                  <Users size={36} className="text-zinc-200 dark:text-zinc-800" />
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-black">
                      ไม่พบข้อมูลนักศึกษาในแผนกที่เลือก
                    </p>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed">
                      กรุณาเลือกแผนกวิชาด้านบน เพื่อทำการดึงข้อมูลรายชื่อนักศึกษารับการตั้งค่าฝึกงานครับ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedInternshipStudents.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 font-bold text-xs border border-dashed dark:border-zinc-800 rounded-2xl">
                      ไม่พบรายชื่อนักเรียนที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                              <th className="py-4 px-2">รูปโปรไฟล์</th>
                              <th className="py-4 px-2">รหัสนักศึกษา</th>
                              <th className="py-4 px-2">ชื่อ - นามสกุล</th>
                              <th className="py-4 px-2 text-center">กลุ่มเรียน / ห้อง</th>
                              <th className="py-4 px-2 text-center">แผนกวิชา</th>
                              <th className="py-4 px-2 text-right">การจัดการสถานะ (ออกฝึกงาน)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {displayedInternshipStudents.map((student) => (
                              <tr
                                key={student.id}
                                className="text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors"
                              >
                                <td className="py-4 px-2">
                                  {student.image ? (
                                    <img
                                      src={student.image}
                                      className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-sm shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0">
                                      <User size={16} />
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 px-2 font-medium text-xs tracking-wider">
                                  {maskSensitiveData(student.studentIdNum)}
                                </td>
                                <td className="py-4 px-2 text-sm text-zinc-900 dark:text-zinc-100">
                                  {student.name}
                                </td>
                                <td className="py-4 px-2 text-center text-xs font-bold text-zinc-500">
                                  {student.classGroupId}
                                </td>
                                <td className="py-4 px-2 text-center text-xs font-bold text-zinc-500">
                                  {student.department}
                                </td>
                                <td className="py-4 px-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInternship(student)}
                                    className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                                      student.isInternship
                                        ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                                    }`}
                                  >
                                    {student.isInternship ? (
                                      <>
                                        <Briefcase size={12} className="mr-1.5" />
                                        💼 ออกฝึกงานอยู่
                                      </>
                                    ) : (
                                      <>
                                        <BookOpen size={12} className="mr-1.5" />
                                        🏫 เรียนปกติที่นี่
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card List View */}
                      <div className="block sm:hidden space-y-4">
                        {displayedInternshipStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-2xl space-y-4 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              {student.image ? (
                                <img
                                  src={student.image}
                                  className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                                  <User size={16} />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm leading-tight">
                                  {student.name}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                  ID: {maskSensitiveData(student.studentIdNum)} • กลุ่ม: {student.classGroupId}
                                </p>
                                <p className="text-[9px] text-zinc-400 font-bold mt-0.5">
                                  {student.department}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t dark:border-zinc-800/80 pt-3">
                              <span className="text-[10px] font-bold text-zinc-400">สถานะฝึกงาน:</span>
                              <button
                                type="button"
                                onClick={() => handleToggleInternship(student)}
                                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                                  student.isInternship
                                    ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                                }`}
                              >
                                {student.isInternship ? (
                                  <>
                                    <Briefcase size={12} className="mr-1.5" />
                                    💼 ออกฝึกงาน
                                  </>
                                ) : (
                                  <>
                                    <BookOpen size={12} className="mr-1.5" />
                                    🏫 เรียนปกติ
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODALS / FORMS (SUBJECT, UNIT, QUIZ)
          ------------------------------------------------------------- */}
      {/* 1. Add/Edit Subject Modal */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSubjectModalOpen(false)}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              <form onSubmit={handleSaveSubject}>
                <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {subjectForm.id ? "แก้ไขข้อมูลรายวิชา" : "สร้างรายวิชาทวิภาคีใหม่"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ปิด
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        รหัสวิชา *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 30201-2001"
                        required
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={subjectForm.code}
                        onChange={(e) =>
                          setSubjectForm((prev) => ({ ...prev, code: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ระดับหลักสูตร *
                      </label>
                      <select
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={subjectForm.curriculum}
                        onChange={(e) =>
                          setSubjectForm((prev) => ({ ...prev, curriculum: e.target.value }))
                        }
                      >
                        <option value="ปวส.">ปวส.</option>
                        <option value="ปวช.">ปวช.</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      ชื่อรายวิชาเรียน *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น การฝึกอาชีพทวิภาคี 1"
                      required
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                      value={subjectForm.name}
                      onChange={(e) =>
                        setSubjectForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      แผนกวิชา *
                    </label>
                    <select
                      required
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                      value={subjectForm.department}
                      onChange={(e) =>
                        setSubjectForm((prev) => ({ ...prev, department: e.target.value }))
                      }
                    >
                      <option value="">-- เลือกแผนกวิชา --</option>
                      {DEPARTMENTS.filter(
                        (d) => d.startsWith("แผนกวิชา") || d.includes("การจัดการ"),
                      ).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ภาคเรียน *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 1/2569"
                        required
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={subjectForm.semester}
                        onChange={(e) =>
                          setSubjectForm((prev) => ({ ...prev, semester: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ปีการศึกษา *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 2569"
                        required
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={subjectForm.academicYear}
                        onChange={(e) =>
                          setSubjectForm((prev) => ({ ...prev, academicYear: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end gap-3 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-xs font-black text-zinc-500 hover:bg-zinc-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add/Edit Learning Unit Modal */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUnitModalOpen(false)}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              <form onSubmit={handleSaveUnit}>
                <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {unitForm.id ? "แก้ไขหน่วยการเรียนรู้" : "เพิ่มหน่วยการเรียนรู้ในรายวิชา"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ปิด
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-7 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        หัวข้อหน่วยการเรียน *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น หน่วยที่ 1: แนะนำวิชา"
                        required
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={unitForm.title}
                        onChange={(e) =>
                          setUnitForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ลำดับ
                      </label>
                      <input
                        type="number"
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={unitForm.sequence}
                        onChange={(e) =>
                          setUnitForm((prev) => ({ ...prev, sequence: Number(e.target.value) }))
                        }
                      />
                    </div>
                    <div className="col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-black text-emerald-650 dark:text-emerald-400 flex items-center gap-1">
                        <Clock size={12} />
                        เวลาเรียนขั้นต่ำ (นาที)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="เช่น 15 (0 = ปิดตัวจับเวลา)"
                        className="w-full h-11 border border-emerald-200 dark:border-emerald-800/80 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white font-bold text-emerald-600 dark:text-emerald-450"
                        value={unitForm.studyMinutes}
                        onChange={(e) =>
                          setUnitForm((prev) => ({
                            ...prev,
                            studyMinutes: Math.max(0, Number(e.target.value)),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      เนื้อหาบทเรียนย่อ / บรรยาย
                    </label>
                    <textarea
                      placeholder="เขียนอธิบายเนื้อหาหน่วยเรียนอย่างย่อประกอบที่นี่..."
                      rows={3}
                      className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg p-3 text-sm focus:outline-hidden dark:text-white"
                      value={unitForm.content}
                      onChange={(e) =>
                        setUnitForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                    />
                  </div>

                  {/* SECTION 1: 📂 อัปโหลดไฟล์เอกสารประกอบการเรียน */}
                  <div className="flex flex-col gap-3 p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl">
                    <label className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen size={14} />
                        ไฟล์เอกสารประกอบบทเรียน (ครูอัปโหลดเอง)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setUnitForm((prev) => ({
                            ...prev,
                            files: [...prev.files, { name: "", url: "", type: "file" }],
                          }))
                        }
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs border-0"
                      >
                        <Plus size={10} /> เพิ่มไฟล์แนบ (อัปโหลด)
                      </button>
                    </label>

                    {unitForm.files.filter(
                      (f) =>
                        f.type === "file" ||
                        f.url?.startsWith("/uploads/") ||
                        f.url?.startsWith("/api/media/"),
                    ).length === 0 ? (
                      <div className="text-center py-4 border border-dashed dark:border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold bg-white/50 dark:bg-transparent">
                        ยังไม่มีไฟล์อัปโหลดในหน่วยเรียนนี้
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unitForm.files.map((file, idx) => {
                          const isDirectFile =
                            file.type === "file" ||
                            file.url?.startsWith("/uploads/") ||
                            file.url?.startsWith("/api/media/");
                          if (!isDirectFile) return null;
                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="ชื่อไฟล์ เช่น เอกสารใบงาน 1"
                                required
                                className="flex-1 h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 text-xs focus:outline-hidden dark:text-white"
                                value={file.name}
                                onChange={(e) => {
                                  const newFiles = [...unitForm.files];
                                  newFiles[idx].name = e.target.value;
                                  setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                }}
                              />

                              <div className="relative flex-1">
                                <input
                                  type="url"
                                  placeholder="ยังไม่ได้อัปโหลดไฟล์..."
                                  required
                                  readOnly
                                  className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-lg pl-3 pr-20 text-xs focus:outline-hidden text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                                  value={file.url}
                                />
                                <label className="absolute right-1 top-1 h-8 px-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-md cursor-pointer transition-colors shadow-xs">
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const selectedFile = e.target.files?.[0];
                                      if (selectedFile) {
                                        await handleRowFileUpload(idx, selectedFile);
                                      }
                                    }}
                                    disabled={fileUploading[idx]?.loading}
                                  />
                                  {fileUploading[idx]?.loading ? (
                                    <div className="flex items-center gap-1">
                                      <Loader2 size={12} className="animate-spin text-white" />
                                      <span className="text-[9px] font-black text-white">
                                        {fileUploading[idx].progress}%
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-[10px] font-black text-white">
                                      <Upload size={12} />
                                      <span>เลือกไฟล์</span>
                                    </div>
                                  )}
                                </label>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = unitForm.files.filter((_, i) => i !== idx);
                                  setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                }}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer border-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: 🔗 ลิงก์และแหล่งข้อมูลภายนอก */}
                  <div className="flex flex-col gap-3 p-4 bg-blue-500/5 dark:bg-blue-950/10 border border-blue-500/10 rounded-2xl">
                    <label className="text-xs font-black text-blue-700 dark:text-blue-400 flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <ExternalLink size={14} />
                        ลิงก์ภายนอก / แหล่งข้อมูลเพิ่มเติม (เช่น Google Drive, YouTube)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setUnitForm((prev) => ({
                            ...prev,
                            files: [...prev.files, { name: "", url: "", type: "link" }],
                          }))
                        }
                        className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs border-0"
                      >
                        <Plus size={10} /> เพิ่มลิงก์ภายนอก
                      </button>
                    </label>

                    {unitForm.files.filter(
                      (f) =>
                        f.type === "link" ||
                        (!f.type &&
                          !f.url?.startsWith("/uploads/") &&
                          !f.url?.startsWith("/api/media/")),
                    ).length === 0 ? (
                      <div className="text-center py-4 border border-dashed dark:border-zinc-800 rounded-xl text-zinc-400 text-xs font-bold bg-white/50 dark:bg-transparent">
                        ยังไม่มีลิงก์ภายนอกในหน่วยเรียนนี้
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unitForm.files.map((file, idx) => {
                          const isDirectFile =
                            file.type === "file" ||
                            file.url?.startsWith("/uploads/") ||
                            file.url?.startsWith("/api/media/");
                          if (isDirectFile) return null;
                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="ชื่อลิงก์ เช่น สไลด์การสอน หรือ วิดีโอแนะนำ"
                                required
                                className="flex-1 h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 text-xs focus:outline-hidden dark:text-white"
                                value={file.name}
                                onChange={(e) => {
                                  const newFiles = [...unitForm.files];
                                  newFiles[idx].name = e.target.value;
                                  setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                }}
                              />

                              <input
                                type="url"
                                placeholder="วางลิงก์ เช่น https://drive.google.com/..."
                                required
                                className="flex-1 h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg px-3 text-xs focus:outline-hidden dark:text-white"
                                value={file.url}
                                onChange={(e) => {
                                  const newFiles = [...unitForm.files];
                                  newFiles[idx].url = e.target.value;
                                  setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = unitForm.files.filter((_, i) => i !== idx);
                                  setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                }}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer border-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end gap-3 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-xs font-black text-zinc-500 hover:bg-zinc-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    บันทึกหน่วยเรียน
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add/Edit Quiz Modal */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuizModalOpen(false)}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              <form onSubmit={handleSaveQuiz}>
                <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Award size={20} className="text-emerald-500" />
                    {quizForm.id ? "แก้ไขแบบทดสอบ" : "สร้างแบบทดสอบฝึกทักษะ (Quiz Builder)"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold text-zinc-500"
                  >
                    ปิด
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      หัวข้อควิซ / แบบทดสอบ *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ควิซหลังเรียนหน่วยที่ 1"
                      required
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white font-bold"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      ประเภทของแบบทดสอบ
                    </label>
                    <div className="flex border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden p-0.5 bg-slate-50 dark:bg-zinc-950">
                      <button
                        type="button"
                        onClick={() => setQuizForm((prev) => ({ ...prev, isBuiltIn: false }))}
                        className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${!quizForm.isBuiltIn ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500"}`}
                      >
                        ลิงก์ Google Form (ภายนอก)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizForm((prev) => ({ ...prev, isBuiltIn: true }))}
                        className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition-all ${quizForm.isBuiltIn ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-zinc-500"}`}
                      >
                        สร้างในตัวแอป (Built-In Quiz)
                      </button>
                    </div>
                  </div>

                  {!quizForm.isBuiltIn ? (
                    <div className="flex flex-col gap-1.5 animate-fade-in">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ลิงก์ Google Form สอบออนไลน์ *
                      </label>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/forms/d/..."
                        required={!quizForm.isBuiltIn}
                        className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                        value={quizForm.googleFormUrl}
                        onChange={(e) =>
                          setQuizForm((prev) => ({ ...prev, googleFormUrl: e.target.value }))
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in border-t dark:border-zinc-800 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                          รายการโจทย์ข้อคำถาม ({quizForm.questions?.length || 0} ข้อ)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQ = {
                              id: Date.now().toString(),
                              type: "multiple_choice",
                              text: "",
                              options: ["ตัวเลือกที่ 1", "ตัวเลือกที่ 2"],
                              correctAnswer: "",
                              points: 1,
                            };
                            setQuizForm((prev) => ({
                              ...prev,
                              questions: [...(prev.questions || []), newQ],
                            }));
                          }}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border-0 cursor-pointer"
                        >
                          <Plus size={10} /> เพิ่มโจทย์คำถาม
                        </button>
                      </div>

                      {!quizForm.questions || quizForm.questions.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-bold border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                          ยังไม่มีการสร้างคำถามย่อย กรุณากดปุ่ม "เพิ่มโจทย์คำถาม" ด้านบน
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1">
                          {quizForm.questions.map((q, qIdx) => (
                            <div
                              key={q.id}
                              className="p-4 bg-zinc-50 dark:bg-zinc-950 border dark:border-zinc-800/80 rounded-xl space-y-3 relative"
                            >
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-xs font-black text-emerald-600">
                                  ข้อที่ {qIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = quizForm.questions.filter(
                                      (_, idx) => idx !== qIdx,
                                    );
                                    setQuizForm((prev) => ({ ...prev, questions: updated }));
                                  }}
                                  className="text-rose-500 hover:text-rose-700 p-1 border-0 bg-transparent cursor-pointer"
                                >
                                  ลบคำถาม
                                </button>
                              </div>

                              <div className="space-y-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="พิมพ์โจทย์คำถาม เช่น 2 + 2 เท่ากับเท่าใด?"
                                  value={q.text}
                                  onChange={(e) => {
                                    const updated = [...quizForm.questions];
                                    updated[qIdx].text = e.target.value;
                                    setQuizForm((prev) => ({ ...prev, questions: updated }));
                                  }}
                                  className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-3 text-xs focus:outline-hidden dark:text-white font-bold"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-zinc-400">
                                      ประเภทคำตอบ
                                    </label>
                                    <select
                                      value={q.type}
                                      onChange={(e) => {
                                        const updated = [...quizForm.questions];
                                        updated[qIdx].type = e.target.value;
                                        if (e.target.value === "checkboxes") {
                                          updated[qIdx].options = updated[qIdx].options || [
                                            "ตัวเลือกที่ 1",
                                            "ตัวเลือกที่ 2",
                                          ];
                                          updated[qIdx].correctAnswer = [];
                                        } else if (e.target.value === "multiple_choice") {
                                          updated[qIdx].options = updated[qIdx].options || [
                                            "ตัวเลือกที่ 1",
                                            "ตัวเลือกที่ 2",
                                          ];
                                          updated[qIdx].correctAnswer = "";
                                        } else {
                                          delete updated[qIdx].options;
                                          updated[qIdx].correctAnswer = "";
                                        }
                                        setQuizForm((prev) => ({ ...prev, questions: updated }));
                                      }}
                                      className="h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-2 text-xs focus:outline-hidden dark:text-white"
                                    >
                                      <option value="multiple_choice">
                                        ปรนัย (เลือกตอบ 1 ข้อ)
                                      </option>
                                      <option value="checkboxes">
                                        กล่องตัวเลือก (เลือกตอบหลายข้อ)
                                      </option>
                                      <option value="short_answer">อัตนัย (เติมคำตอบสั้น)</option>
                                    </select>
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-black text-zinc-400">
                                      คะแนนดิบเต็มของข้อนี้
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      required
                                      value={q.points}
                                      onChange={(e) => {
                                        const updated = [...quizForm.questions];
                                        updated[qIdx].points = parseInt(e.target.value) || 1;
                                        setQuizForm((prev) => ({ ...prev, questions: updated }));
                                      }}
                                      className="h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-3 text-xs focus:outline-hidden dark:text-white font-bold"
                                    />
                                  </div>
                                </div>

                                {(q.type === "multiple_choice" || q.type === "checkboxes") && (
                                  <div className="space-y-2 mt-2 pt-2 border-t dark:border-zinc-900">
                                    <label className="text-[9px] font-black text-zinc-500 block">
                                      ป้อนตัวเลือกคำตอบ
                                      (และกดยืนยันปุ่มวิทยุ/กล่องเพื่อระบุเฉลยที่ถูกต้อง)
                                    </label>
                                    <div className="space-y-1.5">
                                      {(q.options || []).map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                          {q.type === "multiple_choice" ? (
                                            <input
                                              type="radio"
                                              name={`q_correct_${q.id}`}
                                              checked={q.correctAnswer === opt}
                                              onChange={() => {
                                                const updated = [...quizForm.questions];
                                                updated[qIdx].correctAnswer = opt;
                                                setQuizForm((prev) => ({
                                                  ...prev,
                                                  questions: updated,
                                                }));
                                              }}
                                              className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                                            />
                                          ) : (
                                            <input
                                              type="checkbox"
                                              checked={
                                                Array.isArray(q.correctAnswer) &&
                                                q.correctAnswer.includes(opt)
                                              }
                                              onChange={(e) => {
                                                const updated = [...quizForm.questions];
                                                let currentCorrect = Array.isArray(q.correctAnswer)
                                                  ? [...q.correctAnswer]
                                                  : [];
                                                if (e.target.checked) {
                                                  currentCorrect.push(opt);
                                                } else {
                                                  currentCorrect = currentCorrect.filter(
                                                    (val: string) => val !== opt,
                                                  );
                                                }
                                                updated[qIdx].correctAnswer = currentCorrect;
                                                setQuizForm((prev) => ({
                                                  ...prev,
                                                  questions: updated,
                                                }));
                                              }}
                                              className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                                            />
                                          )}

                                          <input
                                            type="text"
                                            required
                                            placeholder={`ตัวเลือกตอบที่ ${optIdx + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                              const updated = [...quizForm.questions];
                                              const oldVal = updated[qIdx].options[optIdx];
                                              updated[qIdx].options[optIdx] = e.target.value;
                                              if (
                                                q.type === "multiple_choice" &&
                                                q.correctAnswer === oldVal
                                              ) {
                                                updated[qIdx].correctAnswer = e.target.value;
                                              } else if (
                                                q.type === "checkboxes" &&
                                                Array.isArray(q.correctAnswer)
                                              ) {
                                                updated[qIdx].correctAnswer = q.correctAnswer.map(
                                                  (v: string) => (v === oldVal ? e.target.value : v),
                                                );
                                              }
                                              setQuizForm((prev) => ({
                                                ...prev,
                                                questions: updated,
                                              }));
                                            }}
                                            className="flex-1 h-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-2 text-[11px] focus:outline-hidden dark:text-white"
                                          />

                                          {(q.options || []).length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = [...quizForm.questions];
                                                const valToRemove = updated[qIdx].options[optIdx];
                                                updated[qIdx].options = updated[
                                                  qIdx
                                                ].options.filter((_: string, idx: number) => idx !== optIdx);
                                                if (
                                                  q.type === "multiple_choice" &&
                                                  q.correctAnswer === valToRemove
                                                ) {
                                                  updated[qIdx].correctAnswer = "";
                                                } else if (
                                                  q.type === "checkboxes" &&
                                                  Array.isArray(q.correctAnswer)
                                                ) {
                                                  updated[qIdx].correctAnswer =
                                                    q.correctAnswer.filter(
                                                      (v: string) => v !== valToRemove,
                                                    );
                                                }
                                                setQuizForm((prev) => ({
                                                  ...prev,
                                                  questions: updated,
                                                }));
                                              }}
                                              className="text-zinc-400 hover:text-rose-500 p-1 border-0 bg-transparent cursor-pointer"
                                            >
                                              <X size={12} />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...quizForm.questions];
                                        const newOptName = `ตัวเลือกที่ ${updated[qIdx].options.length + 1}`;
                                        updated[qIdx].options.push(newOptName);
                                        setQuizForm((prev) => ({ ...prev, questions: updated }));
                                      }}
                                      className="mt-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-black flex items-center gap-0.5 border-0 bg-transparent cursor-pointer"
                                    >
                                      <Plus size={10} /> เพิ่มช่องตัวเลือกใหม่
                                    </button>
                                  </div>
                                )}

                                {/* short_answer has no correct answer input field since it is subjective */}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 border-t dark:border-zinc-800 pt-4">
                    <label className="text-xs font-black text-zinc-500 dark:border-zinc-400">
                      วันหมดเขตส่งกระดาษคำตอบ (เดดไลน์)
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white font-bold"
                      value={quizForm.deadline}
                      onChange={(e) =>
                        setQuizForm((prev) => ({ ...prev, deadline: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end gap-3 border-t dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-xs font-black text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    บันทึกข้อมูลแบบทดสอบ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Quiz Submissions & Grades Modal */}
      <AnimatePresence>
        {isSubmissionsModalOpen && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsSubmissionsModalOpen(false); setSubmissionsPreviewUrl(null); }}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col"
              style={{ maxHeight: "90vh" }}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-start gap-4 bg-indigo-500/5 shrink-0">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye size={18} className="text-indigo-500" />
                    งานที่นักเรียนส่ง: {submissionsQuizTitle}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${submissionsIsBuiltIn ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"}`}>
                      {submissionsIsBuiltIn ? "🧠 ควิซในระบบ" : "🔗 Google Form / งานภายนอก"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">รวม {submissions.length} คน</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsSubmissionsModalOpen(false); setSubmissionsPreviewUrl(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
                {loadingSubmissions ? (
                  <div className="flex flex-col justify-center items-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="text-xs text-zinc-400 font-bold">กำลังโหลดข้อมูลงานที่ส่ง...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-sm font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                    <Users size={36} className="text-zinc-300 dark:text-zinc-700" />
                    ยังไม่มีนักเรียนส่งงานสำหรับแบบทดสอบนี้
                  </div>
                ) : (
                  <>
                    {Object.entries(
                      submissions.reduce((acc: Record<string, any[]>, sub: any) => {
                        const grp = sub.classGroupId || "ไม่ระบุห้อง";
                        acc[grp] = [...(acc[grp] || []), sub];
                        return acc;
                      }, {})
                    ).map(([groupId, groupSubs]) => (
                      <div key={groupId} className="space-y-2">
                        <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-b dark:border-zinc-800 pb-2 flex items-center gap-2">
                          <Users size={12} />
                          ห้อง / กลุ่มเรียน: {groupId}
                          <span className="text-zinc-400 font-bold normal-case tracking-normal">({groupSubs.length} คน)</span>
                        </h4>
                        <div className="overflow-hidden border dark:border-zinc-800 rounded-xl">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">ชื่อนักศึกษา</th>
                                {submissionsIsBuiltIn && <th className="p-3 text-center">คะแนน</th>}
                                <th className="p-3 text-center">ไฟล์/เอกสารที่แนบ</th>
                                <th className="p-3 text-center">วันที่ส่ง</th>
                                {submissionsIsBuiltIn && <th className="p-3 text-right">ตรวจคำตอบ</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                              {groupSubs.map((sub: any, idx: number) => {
                                const isExpanded = expandedSubmissionId === sub.id;
                                return (
                                  <React.Fragment key={sub.id}>
                                    <tr className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-colors">
                                      <td className="p-3 text-zinc-400 text-[10px] tabular-nums">{idx + 1}</td>
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                            {(sub.studentName || "?").charAt(0)}
                                          </div>
                                          <span className="font-black text-zinc-800 dark:text-zinc-200">{sub.studentName}</span>
                                        </div>
                                      </td>
                                      {submissionsIsBuiltIn && (
                                        <td className="p-3 text-center">
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tabular-nums border ${sub.maxScore > 0 && sub.score === sub.maxScore ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"}`}>
                                            {sub.maxScore > 0 ? `${sub.score} / ${sub.maxScore}` : "โ€”"}
                                          </span>
                                        </td>
                                      )}
                                      <td className="p-3 text-center">
                                        {sub.fileUrl ? (
                                          <button
                                            type="button"
                                            onClick={() => { setSubmissionsPreviewUrl(sub.fileUrl); setSubmissionsPreviewName(sub.fileName || "ไฟล์แนบ"); }}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-lg transition-all border border-emerald-200 dark:border-emerald-800/50 cursor-pointer"
                                          >
                                            <Eye size={10} className="shrink-0" />
                                            <span className="truncate max-w-[140px]">{sub.fileName || "ดูไฟล์"}</span>
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-zinc-400 italic font-bold">ไม่มีไฟล์แนบ</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center text-[9px] text-zinc-400 tabular-nums">
                                        {new Date(sub.submittedAt).toLocaleDateString("th-TH", { day: "2-digit", month: "short" })}
                                        <br />
                                        <span className="text-zinc-300 dark:text-zinc-600">{new Date(sub.submittedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span>
                                      </td>
                                      {submissionsIsBuiltIn && (
                                        <td className="p-3 text-right">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                                            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-[10px] font-black transition-all border-0 cursor-pointer text-zinc-600 dark:text-zinc-300"
                                          >
                                            {isExpanded ? "ซ่อน" : "ตรวจคำตอบ"}
                                          </button>
                                        </td>
                                      )}
                                    </tr>
                                    {isExpanded && submissionsIsBuiltIn && (
                                      <tr>
                                        <td colSpan={6} className="p-4 bg-indigo-50/30 dark:bg-indigo-950/10">
                                          <div className="space-y-2 pl-3 border-l-2 border-indigo-400">
                                            <h5 className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">รายละเอียดคำตอบ:</h5>
                                            {(() => {
                                              const activeQuiz = quizzes.find((q: any) => q.id === submissionsQuizId);
                                              if (!activeQuiz?.questions?.length) {
                                                return <span className="text-[10px] text-zinc-400 font-bold">ไม่พบรายละเอียดโจทย์</span>;
                                              }
                                              return activeQuiz.questions.map((question: any, qIndex: number) => {
                                                const studentAnswerObj = sub.answers?.find((a: any) => String(a.questionId) === String(question.id));
                                                const studentAnswer = studentAnswerObj ? studentAnswerObj.answer : "ไม่ได้ตอบ";
                                                 const isSubjective = question.type === "short_answer";
                                                let isCorrect = false;
                                                if (question.type === "short_answer") {
                                                  isCorrect = studentAnswerObj?.isCorrect !== false;
                                                } else if (question.type === "multiple_choice") {
                                                  isCorrect = String(studentAnswer || "").trim().toLowerCase() === String(question.correctAnswer || "").trim().toLowerCase() && String(studentAnswer || "").trim() !== "";
                                                } else if (question.type === "checkboxes") {
                                                  const sArr = Array.isArray(studentAnswer) ? studentAnswer.map((v: any) => String(v || "").trim().toLowerCase()).sort() : [];
                                                  const cArr = Array.isArray(question.correctAnswer) ? question.correctAnswer.map((v: any) => String(v || "").trim().toLowerCase()).sort() : [String(question.correctAnswer || "").trim().toLowerCase()];
                                                  isCorrect = sArr.length === cArr.length && sArr.every((v, i) => v === cArr[i]) && sArr.length > 0;
                                                }
                                                return (
                                                  <div key={question.id} className="p-2.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl text-[11px]">
                                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                                      <span className="font-black text-zinc-800 dark:text-zinc-200">{qIndex + 1}. {question.text}</span>
                                                      <span className={`shrink-0 font-black px-1.5 py-0.5 rounded text-[9px] ${isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}>
                                                        {isCorrect ? `+${question.points}` : "0"} คะแนน
                                                      </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 border-t dark:border-zinc-800 pt-1.5 text-[10px]">
                                                      <div>
                                                        <span className="text-zinc-400 font-bold block">คำตอบนักศึกษา:</span>
                                                        <span className={`font-black ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                                                          {Array.isArray(studentAnswer) ? studentAnswer.join(", ") : String(studentAnswer)}
                                                        </span>
                                                        {isSubjective && (
                                                          <button
                                                            type="button"
                                                            onClick={async () => {
                                                              await handleToggleSubjectiveGrading(sub.id, question.id, !isCorrect);
                                                            }}
                                                            className={`ml-3 px-2 py-0.5 rounded-lg text-[9px] font-black cursor-pointer border transition-all ${isCorrect ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40 hover:bg-rose-100" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100"}`}
                                                          >
                                                            {isCorrect ? "ทำเครื่องหมายเป็นผิด (0 คะแนน)" : "ทำเครื่องหมายเป็นถูก (ได้คะแนน)"}
                                                          </button>
                                                        )}
                                                      </div>
                                                      {!isSubjective && (
                                                        <div>
                                                          <span className="text-zinc-400 font-bold block">เฉลย:</span>
                                                          <span className="font-black text-zinc-600 dark:text-zinc-300">
                                                            {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(", ") : String(question.correctAnswer || "ไม่ได้ระบุ")}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                );
                                              });
                                            })()}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* File Preview Sub-overlay */}
              {submissionsPreviewUrl && (
                <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-zinc-900 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-indigo-400 shrink-0" />
                      <span className="text-xs font-black text-zinc-200 truncate">{submissionsPreviewName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={submissionsPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors border border-zinc-600"
                      >
                        <ExternalLink size={10} />
                        เปิดในแท็บใหม่
                      </a>
                      <button
                        type="button"
                        onClick={() => { setSubmissionsPreviewUrl(null); setSubmissionsPreviewName(null); }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors font-black cursor-pointer border-0 text-sm"
                      >
                        โ•
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-4 bg-zinc-950/60 overflow-hidden">
                    {/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(submissionsPreviewUrl) ? (
                      <img
                        src={submissionsPreviewUrl}
                        alt={submissionsPreviewName || "ไฟล์"}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                    ) : /\.(pdf)(\?|$)/i.test(submissionsPreviewUrl) ? (
                      <iframe
                        src={submissionsPreviewUrl}
                        title="PDF Preview"
                        className="w-full h-full rounded-xl bg-white"
                        style={{ minHeight: "300px" }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <FileText size={32} className="text-indigo-400" />
                        <p className="text-sm font-black text-zinc-200">{submissionsPreviewName}</p>
                        <a
                          href={submissionsPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black transition-colors"
                        >
                          <Download size={13} />
                          ดาวน์โหลดไฟล์
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Teacher Edit Student Attendance & Score Modal */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center bg-teal-500/5">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Edit2 size={18} className="text-emerald-500" />
                    แก้ไขข้อมูล: {editingStudent.name}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    รหัสนักศึกษา: {maskSensitiveData(editingStudent.studentIdNum)} • กลุ่ม: {editingStudent.classGroupId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold text-zinc-500 cursor-pointer border-0 bg-transparent"
                >
                  ปิด
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* 1. Status Check-in */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    สถานะเวลาเรียน
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Present", "Late", "Absent"].map((statusOption) => {
                      const label = statusOption === "Present" ? "ตรงเวลา" : statusOption === "Late" ? "มาสาย" : "ขาดเรียน";
                      const colorClass = statusOption === "Present" 
                        ? "bg-emerald-500 text-white shadow-sm" 
                        : statusOption === "Late" 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "bg-rose-500 text-white shadow-sm";
                      const active = editingStudent.status === statusOption;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => setEditingStudent({ ...editingStudent, status: statusOption })}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                            active 
                              ? colorClass 
                              : "bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Warning about read-only General Check-in */}
                {!editingStudent.unitId && (
                  <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 text-xs font-bold leading-relaxed">
                    ⚠️ เป็นเซสชันเช็คชื่อปกติ (ไม่ได้แนบรายหน่วยบทเรียนมาด้วย) จะแสดงแบบอ่านอย่างเดียวสำหรับงานมอบหมายและคะแนน และไม่สามารถแก้ไขส่วนส่งงาน/คะแนนได้
                  </div>
                )}

                {/* 2. Status Assignment */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    การส่งงาน / บ้าน (สำหรับเช็คชื่อตามบทเรียน)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["None", "Submitted", "Pending"].map((statusOption) => {
                      const label = statusOption === "None" ? "ไม่มีงาน" : statusOption === "Submitted" ? "ส่งแล้ว" : "ค้างส่ง";
                      const colorClass = statusOption === "None" 
                        ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" 
                        : statusOption === "Submitted" 
                          ? "bg-teal-500 text-white shadow-sm" 
                          : "bg-orange-500 text-white shadow-sm";
                      const active = editingStudent.assignmentStatus === statusOption;
                      const disabled = !editingStudent.unitId;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          disabled={disabled}
                          onClick={() => setEditingStudent({ ...editingStudent, assignmentStatus: statusOption })}
                          className={`py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            active 
                              ? colorClass 
                              : "bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Score Input & OCR */}
                <div className="space-y-2 border-t dark:border-zinc-800/80 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      คะแนนที่ได้ / บันทึกย่อ
                    </label>
                    {editingStudent.imageUrl && editingStudent.unitId && (
                      <button
                        type="button"
                        disabled={extractingScoreStudentId === editingStudent.id}
                        onClick={async () => {
                          const resScore = await handleExtractScoreFromImage(editingStudent.id, editingStudent.imageUrl);
                          if (resScore !== null) {
                            setEditingStudent((prev: any) => prev ? { ...prev, score: resScore } : null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/15 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {extractingScoreStudentId === editingStudent.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Sparkles size={11} />
                        )}
                        เรียกใช้ Sparkles AI OCR (อ่านคะแนนจากรูป)
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    disabled={!editingStudent.unitId}
                    placeholder={editingStudent.unitId ? "ป้อนคะแนนดิบหรือข้อสังเกต..." : "ไม่สามารถป้อนคะแนนในเซสชันเช็คชื่อปกติ"}
                    className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white font-bold disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-950"
                    value={editingStudent.score}
                    onChange={(e) => setEditingStudent({ ...editingStudent, score: e.target.value })}
                  />
                </div>

                {/* 4. Evidence Preview */}
                {editingStudent.imageUrl && (
                  <div className="space-y-2 border-t dark:border-zinc-800/80 pt-4">
                    <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                      หลักฐานการอัปโหลดของนักศึกษา
                    </span>
                    <div className="mt-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-2xl border dark:border-zinc-800 flex flex-col items-center gap-3">
                      {editingStudent.imageUrl.toLowerCase().endsWith(".pdf") ? (
                        <div className="w-full flex flex-col items-center py-4 gap-2">
                          <FolderOpen size={40} className="text-teal-500" />
                          <span className="text-xs font-black text-zinc-600 dark:text-zinc-300">
                            ไฟล์หลักฐานเป็นเอกสาร PDF
                          </span>
                          <a
                            href={editingStudent.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl transition-all shadow-sm"
                          >
                            <ExternalLink size={13} />
                            เปิดดูเอกสาร PDF ในแท็บใหม่
                          </a>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center gap-3">
                          <img
                            src={editingStudent.imageUrl}
                            alt="Uploaded evidence preview"
                            className="max-h-[220px] rounded-xl object-contain border dark:border-zinc-850 shadow-sm"
                          />
                          <div className="flex gap-2 w-full">
                            <a
                              href={editingStudent.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-black rounded-xl transition-all border dark:border-zinc-700/60"
                            >
                              <ExternalLink size={13} />
                              ดูรูปขนาดเต็ม
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end gap-3 border-t dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-5 py-2.5 rounded-lg text-xs font-black text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAttendanceRecords((prev) => ({
                      ...prev,
                      [editingStudent.id]: {
                        ...prev[editingStudent.id],
                        status: editingStudent.status,
                        assignmentStatus: editingStudent.assignmentStatus,
                        score: editingStudent.score,
                        imageUrl: editingStudent.imageUrl,
                      },
                    }));
                    message.success(`อัปเดตข้อมูลของ ${editingStudent.name} ในตารางชั่วคราวแล้ว! (กรุณากดปุ่มบันทึกสีเขียวที่ด้านบนเพื่อบันทึกถาวรลงระบบ)`);
                    setEditingStudent(null);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  ยืนยันแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN ENTRYPOINT WRAPPER WITH NEXTAUTH ROLE GUARD
// -------------------------------------------------------------
function DVEPortalContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "").toLowerCase();
  const canAccessDvePortal = role === "teacher" || role === "super_admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (!canAccessDvePortal) {
      router.replace("/dashboard");
    }
  }, [status, role, canAccessDvePortal, router]);

  if (status === "loading") {
    return <DVELoader />;
  }

  if (!session) return null;
  if (!canAccessDvePortal) {
    return <DVELoader />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-zinc-950 transition-colors duration-500 pb-20">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .ant-message {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: max-content !important;
          max-width: 90% !important;
          z-index: 10100 !important;
        }
        .ant-message-notice {
          text-align: center !important;
        }
      `,
        }}
      />
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <DVETeacherWorkspace />
      </div>
    </div>
  );
}

export default function DVEPortalPage() {
  return (
    <Suspense fallback={<DVELoader />}>
      <DVEPortalContent />
    </Suspense>
  );
}
