"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  EyeOff,
  XCircle,
  MinusCircle,
  FileCheck,
  AlertCircle,
  Settings2,
  ListChecks,
  Save, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { message, Popconfirm, Select, DatePicker, Modal } from "antd";
import { uploadFile } from "@/lib/upload";
import { DEPARTMENTS } from "@/lib/constants";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

dayjs.extend(buddhistEra);
dayjs.locale("th");
import * as XLSX from "xlsx";

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
  try {
    let dateStr = dateString;
    if (dateStr.includes(" ") && !dateStr.includes("T")) {
      dateStr = dateStr.replace(" ", "T");
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateString;

    const hasTime = dateString.includes(":") || dateString.includes("T");

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(hasTime && { hour: "2-digit", minute: "2-digit" })
    });
  } catch {
    return dateString;
  }
}

function standardizeClassGroupName(name: string): string {
  if (!name) return "";
  let clean = name.trim();
  const stripped = clean.replace(/[\s\.-]+/g, "");
  const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    if (rest) {
      return `${prefix}.${rest}`;
    }
    return prefix;
  }
  return clean;
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
  return val.trim(); // Return unmasked for the teacher so they have complete info!
}

function parseClassGroupsText(value: string): string[] {
  return Array.from(
    new Set(
      String(value || "")
        .split(",")
        .map((item) => standardizeClassGroupName(item))
        .filter(Boolean),
    ),
  );
}

function formatClassGroupsText(value: string[] | string | undefined): string {
  if (Array.isArray(value)) {
    return value.map((item) => standardizeClassGroupName(item)).filter(Boolean).join(", ");
  }
  return String(value || "");
}

function getSubjectAllowedClassGroups(subject: any): string[] {
  if (!subject) return [];
  if (Array.isArray(subject.allowedClassGroups)) {
    return subject.allowedClassGroups
      .map((group: string) => standardizeClassGroupName(group))
      .filter(Boolean);
  }
  return parseClassGroupsText(subject.allowedClassGroups || "");
}

function getDveEntityId(entity: any): string {
  return String(entity?.id || entity?._id || "").trim();
}

function getQuizTypeLabel(type: string): string {
  if (type === "pretest") return "ก่อนเรียน";
  if (type === "posttest") return "หลังเรียน";
  return "แบบทดสอบ";
}

// -------------------------------------------------------------
// TEACHER WORKSPACE PORTAL COMPONENT
// -------------------------------------------------------------
function DVETeacherWorkspace() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId");
  const teacherName = searchParams.get("teacherName");
  const teacherDept = searchParams.get("teacherDept");
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const checkReadOnly = () => {
    if (teacherId) {
      message.warning("ในโหมดผู้ตรวจสอบ คุณไม่สามารถแก้ไขข้อมูลได้");
      return true;
    }
    return false;
  };
  const [activeTab, setActiveTab] = useState<
    "subjects" | "quizzes" | "checkin" | "timeline" | "internship"
  >("subjects");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Global Filter for Academic Year and Semester
  const [globalAcademicYear, setGlobalAcademicYear] = useState<string>("all");
  const [globalSemester, setGlobalSemester] = useState<string>("all");

  const availableAcademicYears = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.academicYear)))
      .filter(Boolean)
      .sort((a, b) => b.localeCompare(a));
  }, [subjects]);

  const availableSemesters = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.semester?.split("/")[0] || s.semester)))
      .filter(Boolean)
      .sort();
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchYear = globalAcademicYear === "all" || s.academicYear === globalAcademicYear;
      const sTerm = s.semester?.split("/")[0] || s.semester;
      const matchTerm = globalSemester === "all" || sTerm === globalSemester;
      return matchYear && matchTerm;
    });
  }, [subjects, globalAcademicYear, globalSemester]);

  // แท็บสถานะออกฝึกงาน (Internship Tab States)
  const [internshipStudents, setInternshipStudents] = useState<any[]>([]);
  const [loadingInternship, setLoadingInternship] = useState(false);

  // Location settings for Internship students
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedLocationStudent, setSelectedLocationStudent] = useState<any | null>(null);
  const [locationForm, setLocationForm] = useState({ lat: "", lng: "" });
  const [mapsUrl, setMapsUrl] = useState("");
  const [extractingGps, setExtractingGps] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Profile Image
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState("");

  // Edit Profile
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ id: "", name: "", department: "", studentIdNum: "", phone: "", classGroupId: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleExtractGps = async () => {
    if (!mapsUrl.trim()) return message.warning("กรุณาวางลิงก์ Google Maps ก่อน");
    setExtractingGps(true);
    try {
      const res = await fetch("/api/utils/extract-gps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mapsUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setLocationForm({ lat: data.lat, lng: data.lng });
        message.success("ดึงพิกัดจากลิงก์สำเร็จ");
        setMapsUrl("");
      } else {
        message.error(data.error || "ไม่สามารถดึงพิกัดได้");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setExtractingGps(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.id) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/dve/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profileForm.id,
          name: profileForm.name,
          department: profileForm.department,
          studentIdNum: profileForm.studentIdNum,
          phone: profileForm.phone,
          classGroupId: profileForm.classGroupId
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว");
        setIsEditProfileModalOpen(false);
        if (activeTab === "internship") {
          handleLoadInternshipStudents(internshipFilter.department || "all", internshipFilter.classGroupId);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly() || !selectedLocationStudent) return;
    setSavingLocation(true);
    try {
      const res = await fetch("/api/dve/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedLocationStudent.id,
          dveLat: locationForm.lat ? Number(locationForm.lat) : null,
          dveLng: locationForm.lng ? Number(locationForm.lng) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        message.success("บันทึกพิกัดสถานประกอบการเรียบร้อย");
        setIsLocationModalOpen(false);
        if (activeTab === "internship") {
          handleLoadInternshipStudents(internshipFilter.department || "all", internshipFilter.classGroupId);
        }
      } else {
        message.error(data.error || "เกิดข้อผิดพลาดในการบันทึกพิกัด");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    } finally {
      setSavingLocation(false);
    }
  };

  const [internshipFilter, setInternshipFilter] = useState({
    department: "all",
    classGroupId: "",
  });
  const [internshipClassGroups, setInternshipClassGroups] = useState<string[]>([]);
  const [internshipSearchQuery, setInternshipSearchQuery] = useState("");
  const [internshipStatusFilter, setInternshipStatusFilter] = useState<"all" | "working" | "normal">("all");

  // Timeline Tab States
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState({
    subjectId: "",
    classGroupId: "",
    dateRange: "30", // days
  });

  // Subject Modal states
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [teachersList, setTeachersList] = useState<{ id: string; name: string; department?: string; role?: string }[]>([]);
  const [subjectForm, setSubjectForm] = useState({
    id: "",
    code: "",
    name: "",
    department: "",
    curriculum: "ปวส.",
    semester: "1/2569",
    academicYear: "2569",
    teacherId: "",
    teacherName: "",
    totalWeeks: "",
    daysPerWeek: "",
    hoursPerDay: "",
    totalHours: "",
    allowedClassGroups: "",
  });
  const [subjectAllowedClassGroupRows, setSubjectAllowedClassGroupRows] = useState<string[]>([""]);
  const [subjectClassGroupOptions, setSubjectClassGroupOptions] = useState<string[]>([]);
  const [loadingSubjectClassGroups, setLoadingSubjectClassGroups] = useState(false);

  const subjectClassGroupSelectOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...subjectClassGroupOptions,
        ...subjectAllowedClassGroupRows.map((group) => standardizeClassGroupName(group)).filter(Boolean),
      ]),
    ).sort((a, b) => a.localeCompare(b, "th"));
  }, [subjectAllowedClassGroupRows, subjectClassGroupOptions]);

  const syncSubjectAllowedClassGroupRows = (rows: string[]) => {
    const nextRows = rows.length > 0 ? rows : [""];
    const cleanGroups = Array.from(
      new Set(nextRows.map((group) => standardizeClassGroupName(group)).filter(Boolean)),
    );
    setSubjectAllowedClassGroupRows(nextRows);
    setSubjectForm((prev) => ({
      ...prev,
      allowedClassGroups: cleanGroups.join(", "),
    }));
  };

  // Unit Managing states
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [activeStudyUnit, setActiveStudyUnit] = useState<any>(null);
  const activeStudyUnitId = getDveEntityId(activeStudyUnit);
  const allUnitFiles = units.flatMap((unit: any) =>
    (unit.files || []).map((file: any) => ({
      ...file,
      unitTitle: unit.title,
      unitSequence: unit.sequence,
      unitId: unit.id || unit._id || "",
    })),
  );
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitForm, setUnitForm] = useState<{
    id: string;
    title: string;
    content: string;
    sequence: number;
    studyMinutes: string;
    totalMinutes: string;
    dueDate: string;
    files: Array<{ name: string; url: string; type?: string }>;
  }>({
    id: "",
    title: "",
    content: "",
    sequence: 0,
    studyMinutes: "",
    totalMinutes: "",
    dueDate: "",
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
  const [allSubjectQuizSubmissions, setAllSubjectQuizSubmissions] = useState<any[]>([]);
  const [loadingQuizSubmissions, setLoadingQuizSubmissions] = useState(false);

  const unitQuizResultsByStudent = useMemo(() => {
    if (!activeStudyUnitId || !allSubjectQuizSubmissions.length) return {};
    const filtered = allSubjectQuizSubmissions.filter((sub) =>
      String(sub.unitId || "").trim() === activeStudyUnitId
    );
    return filtered.reduce((acc: Record<string, any[]>, submission: any) => {
      if (!submission.studentId) return acc;
      if (!acc[submission.studentId]) acc[submission.studentId] = [];
      acc[submission.studentId].push(submission);
      return acc;
    }, {});
  }, [activeStudyUnitId, allSubjectQuizSubmissions]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    id: "",
    subjectId: "",
    title: "",
    googleFormUrl: "",
    deadline: "",
    startDate: "",
    unitId: "",
    isBuiltIn: true,
    questions: [] as any[],
    isShuffle: false,
    quizType: "general",
    maxScaleScore: null as number | null,
  });
  const [showQuizAnswers, setShowQuizAnswers] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const ws_data = [
      ["คำถาม (Question)", "ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4", "คำตอบที่ถูก (1-4)", "คะแนน (Points)"],
      ["ภาษาใดใช้สำหรับโครงสร้างหน้าเว็บ (ตัวอย่าง)", "HTML", "C++", "Python", "Java", "1", "1"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wscols = [
      { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];
    ws['!cols'] = wscols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Test_Builder_Template.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const rows = data.slice(1).filter(row => row.length > 0 && row[0]);

        const importedQuestions = rows.map((row, index) => {
          const text = String(row[0] || "");
          const op1 = String(row[1] || "");
          const op2 = String(row[2] || "");
          const op3 = String(row[3] || "");
          const op4 = String(row[4] || "");

          let correctAnsIndex = null;
          let correctAnsStr = String(row[5] || "");

          if (["1", "2", "3", "4"].includes(correctAnsStr)) {
            correctAnsIndex = parseInt(correctAnsStr) - 1;
          } else {
            const opts = [op1, op2, op3, op4];
            const foundIdx = opts.findIndex(o => o && o.trim() === correctAnsStr.trim());
            if (foundIdx !== -1) correctAnsIndex = foundIdx;
          }

          const points = parseFloat(String(row[6])) || 1;

          return {
            id: `excel_${Date.now()}_${index}`,
            type: "multiple_choice",
            text,
            options: [op1, op2, op3, op4],
            correctAnswer: correctAnsIndex !== null ? [op1, op2, op3, op4][correctAnsIndex] : "",
            correctAnswerIndex: correctAnsIndex,
            points
          };
        });

        if (importedQuestions.length > 0) {
          setQuizForm(prev => ({
            ...prev,
            questions: [...(prev.questions || []), ...importedQuestions]
          }));
          message.success(`นำเข้าข้อสอบสำเร็จจำนวน ${importedQuestions.length} ข้อ`);
        } else {
          message.warning("ไม่พบข้อมูลข้อสอบในไฟล์");
        }
      } catch (err) {
        console.error(err);
        message.error("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const res = await fetch("/api/dve/quizzes/templates");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("fetchTemplates error:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!quizForm.title) {
      message.error("กรุณาระบุหัวข้อเพื่อใช้เป็นชื่อแม่แบบ");
      return;
    }
    if (!quizForm.questions || quizForm.questions.length === 0) {
      message.error("กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อเพื่อบันทึกแม่แบบ");
      return;
    }
    try {
      message.loading({ content: "กำลังบันทึกแม่แบบ...", key: "dve-save-template", duration: 0 });
      const res = await fetch("/api/dve/quizzes/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quizForm.title,
          questions: quizForm.questions,
        }),
      });
      message.destroy("dve-save-template");
      if (res.ok) {
        message.success("บันทึกเป็นแม่แบบเพื่อใช้ซ้ำสำเร็จ!");
        fetchTemplates();
      } else {
        message.error("บันทึกแม่แบบล้มเหลว");
      }
    } catch (err) {
      console.error("handleSaveAsTemplate error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึกแม่แบบ");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/dve/quizzes/templates?id=${templateId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        message.success("ลบแม่แบบสำเร็จ");
        fetchTemplates();
      } else {
        message.error("ลบแม่แบบล้มเหลว");
      }
    } catch (err) {
      console.error("handleDeleteTemplate error:", err);
      message.error("เกิดข้อผิดพลาดในการลบแม่แบบ");
    }
  };

  useEffect(() => {
    if (activeTab === "quizzes") {
      fetchTemplates();
    }
  }, [activeTab]);

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
  const [timelineClassGroups, setTimelineClassGroups] = useState<string[]>([]);
  const [studentRoster, setStudentRoster] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{
    [studentId: string]: {
      status: "Present" | "Late" | "Absent" | "Studying";
      assignmentStatus: "Submitted" | "Pending" | "None";
      score: string;
      imageUrl?: string;
      unitId?: string;
      unitTitle?: string;
      unitSequence?: string | number;
      studySeconds?: number;
      createdAt?: string;
      updatedAt?: string;
    };
  }>({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [showOnlyAttended, setShowOnlyAttended] = useState(false);
  const [showOnlyInternship, setShowOnlyInternship] = useState(true);
  const [extractingScoreStudentId, setExtractingScoreStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const handleFetchActiveDates = async () => {
    if (!checkinFilter.subjectId) {
      message.warning("กรุณาเลือกวิชาเรียนก่อน");
      return;
    }
    setLoadingDates(true);
    setIsDateModalOpen(true);
    try {
      let url = `/api/dve/attendances?subjectId=${checkinFilter.subjectId}`;
      if (checkinFilter.classGroupId) {
        url += `&classGroupId=${encodeURIComponent(checkinFilter.classGroupId)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.attendances) {
          const dates = Array.from(new Set(data.attendances.map((a: any) => a.date))).filter(Boolean).sort().reverse();
          setActiveDates(dates as string[]);
        }
      }
    } catch (err) {
      message.error("โหลดข้อมูลวันที่ล้มเหลว");
    } finally {
      setLoadingDates(false);
    }
  };

  // Individual student details & progress states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedStudentLogs, setSelectedStudentLogs] = useState<any[]>([]);
  const [loadingStudentProgress, setLoadingStudentProgress] = useState(false);
  const [selectedMobileStudent, setSelectedMobileStudent] = useState<any | null>(null);

  const handleSelectStudentProgress = async (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = studentRoster.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
    if (!student) {
      setSelectedStudentLogs([]);
      return;
    }

    setLoadingStudentProgress(true);
    try {
      const res = await fetch(`/api/dve/attendances?subjectId=${checkinFilter.subjectId}&studentId=${studentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSelectedStudentLogs(data.attendances || []);
        }
      }
    } catch (err) {
      console.error(err);
      message.error("ดึงข้อมูลประวัติการส่งงานล้มเหลว");
    } finally {
      setLoadingStudentProgress(false);
    }
  };

  const handleClearSelectedStudentProgress = () => {
    setSelectedStudentId(null);
    setSelectedStudent(null);
    setSelectedStudentLogs([]);
  };

  const logs = studentRoster.filter((student) => {
    const rec = attendanceRecords[student.id];
    return (
      rec &&
      (rec.status === "Present" ||
        rec.status === "Late" ||
        rec.status === "Studying" ||
        rec.assignmentStatus === "Submitted" ||
        rec.assignmentStatus === "Pending")
    );
  });

  const studentSubmissionsById = useMemo(() => {
    return attendanceLogs.reduce((acc: Record<string, any[]>, record: any) => {
      if (!record.studentId) return acc;
      if (activeStudyUnitId && String(record.unitId || "") !== activeStudyUnitId) return acc;
      if (!acc[record.studentId]) acc[record.studentId] = [];
      acc[record.studentId].push(record);
      return acc;
    }, {});
  }, [activeStudyUnitId, attendanceLogs]);

  const internshipStats = useMemo(() => {
    const total = internshipStudents.length;
    const working = internshipStudents.filter((s) => s.isInternship).length;
    const normal = total - working;
    return { total, working, normal };
  }, [internshipStudents]);

  const displayedInternshipStudents = useMemo(() => {
    let list = [...internshipStudents];

    if (internshipStatusFilter === "working") {
      list = list.filter((s) => s.isInternship);
    } else if (internshipStatusFilter === "normal") {
      list = list.filter((s) => !s.isInternship);
    }

    if (internshipSearchQuery.trim()) {
      const q = internshipSearchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.studentIdNum && s.studentIdNum.toLowerCase().includes(q)),
      );
    }

    list.sort((a, b) => {
      const classA = standardizeClassGroupName(a.classGroupId || "");
      const classB = standardizeClassGroupName(b.classGroupId || "");
      if (classA !== classB) {
        return classA.localeCompare(classB, "th");
      }
      return (a.studentIdNum || "").localeCompare(b.studentIdNum || "", "th");
    });

    return list;
  }, [internshipStudents, internshipSearchQuery, internshipStatusFilter]);

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
  const selectedCheckinSubject = subjects.find((s) => s.id === checkinFilter.subjectId);
  const selectedCheckinAllowedGroups = getSubjectAllowedClassGroups(selectedCheckinSubject);
  const activeUnitQuizzes = useMemo(() => {
    if (!activeStudyUnitId) return [];
    return quizzes.filter((quiz) => String(quiz.unitId || "").trim() === activeStudyUnitId);
  }, [activeStudyUnitId, quizzes]);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const url = teacherId ? `/api/dve/subjects?teacherId=${teacherId}` : "/api/dve/subjects";
      const res = await fetch(url);
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

  // Fetch all teachers list
  const fetchTeachersList = async () => {
    try {
      const res = await fetch("/api/dve/teachers");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.teachers)) {
          setTeachersList(data.teachers);
        }
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachersList();
  }, []);

  // Load class groups for the selected subject. Prefer explicit subject settings,
  // then fall back to groups that already have submissions.
  useEffect(() => {
    const fetchSubmittedClassGroups = async () => {
      if (!checkinFilter.subjectId) {
        setAvailableClassGroups([]);
        return;
      }
      const selectedSubject = subjects.find((s) => s.id === checkinFilter.subjectId);
      const subjectGroups = getSubjectAllowedClassGroups(selectedSubject);
      if (subjectGroups.length > 0) {
        setAvailableClassGroups(subjectGroups);
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
                  .map((a: any) => standardizeClassGroupName(a.classGroupId))
                  .filter((c: string) => c && !/^[\d\s-]+$/.test(c)),
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
  }, [checkinFilter.subjectId, subjects]);

  useEffect(() => {
    if (!checkinFilter.subjectId) return;
    const selectedSubject = subjects.find((s) => s.id === checkinFilter.subjectId);
    if (selectedSubject) {
      handleManageUnits(selectedSubject);
      handleLoadQuizzes(selectedSubject.id);
      handleLoadAllQuizSubmissions(selectedSubject.id);
    }
  }, [checkinFilter.subjectId]);

  // Auto-load roster whenever the check-in filter changes.
  // This keeps the roster in sync when the teacher switches class groups/rooms.
  useEffect(() => {
    if (activeTab !== "checkin") return;
    if (checkinFilter.subjectId && checkinFilter.date) {
      handleLoadRoster();
    }
  }, [activeTab, checkinFilter.subjectId, checkinFilter.classGroupId, checkinFilter.date, activeStudyUnitId]);

  useEffect(() => {
    if (!isSubjectModalOpen) return;

    const departments = subjectForm.department
      .split(",")
      .map((dept) => dept.trim())
      .filter(Boolean);

    if (departments.length === 0) {
      setSubjectClassGroupOptions([]);
      return;
    }

    let cancelled = false;
    const loadSubjectClassGroups = async () => {
      setLoadingSubjectClassGroups(true);
      try {
        const params = new URLSearchParams({ department: departments.join(",") });
        const res = await fetch(`/api/dve/class-groups?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setSubjectClassGroupOptions(Array.isArray(data.classGroups) ? data.classGroups : []);
        }
      } catch (err) {
        if (!cancelled) {
          setSubjectClassGroupOptions([]);
          message.error("ไม่สามารถโหลดรายชื่อห้องเรียนจากฐานข้อมูลได้");
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjectClassGroups(false);
        }
      }
    };

    loadSubjectClassGroups();

    return () => {
      cancelled = true;
    };
  }, [isSubjectModalOpen, subjectForm.department]);

  // SUBJECT ACTIONS
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly()) return;
    if (!subjectForm.code || !subjectForm.name || !subjectForm.department) {
      message.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    try {
      const isEdit = !!subjectForm.id;
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...subjectForm,
        allowedClassGroups: parseClassGroupsText(subjectForm.allowedClassGroups || ""),
      };
      const res = await fetch("/api/dve/subjects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          teacherId: "",
          teacherName: "",
          totalWeeks: "",
          daysPerWeek: "",
          hoursPerDay: "",
          totalHours: "",
          allowedClassGroups: "",
        });
        setSubjectAllowedClassGroupRows([""]);
        fetchSubjects();
      }
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (checkReadOnly()) return;
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
        if (data.success) {
          const sortedUnits = (data.units || []).sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            return (b.sequence || 0) - (a.sequence || 0);
          });
          setUnits(sortedUnits);
          setActiveStudyUnit((prev: any) => {
            if (prev && sortedUnits.some((unit: any) => getDveEntityId(unit) === getDveEntityId(prev))) {
              return sortedUnits.find((unit: any) => getDveEntityId(unit) === getDveEntityId(prev)) || prev;
            }
            return sortedUnits[0] || null;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly()) return;
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
        studyMinutes: unitForm.studyMinutes ? Number(unitForm.studyMinutes) : 0,
        totalMinutes: unitForm.totalMinutes ? Number(unitForm.totalMinutes) : 0,
        dueDate: unitForm.dueDate,
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
          studyMinutes: "",
          totalMinutes: "",
          dueDate: "",
          files: [],
        });
        handleManageUnits(activeSubject);
      }
    } catch (err) {
      message.error("บันทึกหน่วยเรียนล้มเหลว");
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (checkReadOnly()) return;
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
      const [resQuizzes, resUnits] = await Promise.all([
        fetch(`/api/dve/quizzes?subjectId=${subjectId}`),
        fetch(`/api/dve/units?subjectId=${subjectId}`)
      ]);

      if (resQuizzes.ok) {
        const data = await resQuizzes.json();
        if (data.success) setQuizzes(data.quizzes || []);
      }

      if (resUnits.ok) {
        const data = await resUnits.json();
        if (data.success) {
          const sortedUnits = (data.units || []).sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            return (b.sequence || 0) - (a.sequence || 0);
          });
          setUnits(sortedUnits);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly()) return;
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
        message.success(isEdit ? "บันทึกข้อมูลสำเร็จ" : "สร้างแบบทดสอบสำเร็จ");
        setIsQuizModalOpen(false);
        handleLoadQuizzes(quizForm.subjectId);
        setQuizForm({
          id: "",
          subjectId: quizForm.subjectId,
          title: "",
          googleFormUrl: "",
          deadline: "",
          startDate: "",
          unitId: "",
          isBuiltIn: true,
          questions: [],
          isShuffle: false,
          quizType: "general",
          maxScaleScore: null,
        });
      }
    } catch (err) {
      message.error("บันทึกแบบทดสอบล้มเหลว");
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

  const handleLoadAllQuizSubmissions = async (subjectId: string) => {
    setLoadingQuizSubmissions(true);
    try {
      const res = await fetch(`/api/dve/quizzes/submissions?subjectId=${subjectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAllSubjectQuizSubmissions(data.submissions || []);
        }
      }
    } catch (err) {
      console.error("Load all quiz submissions error:", err);
      setAllSubjectQuizSubmissions([]);
    } finally {
      setLoadingQuizSubmissions(false);
    }
  };

  const handleToggleSubjectiveGrading = async (
    submissionId: string,
    questionId: string,
    isCorrect: boolean,
  ) => {
    if (checkReadOnly()) return;
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
    if (checkReadOnly()) return;
    try {
      const res = await fetch(`/api/dve/quizzes?id=${quizId}`, { method: "DELETE" });
      if (res.ok) {
        message.success("ลบแบบทดสอบเรียบร้อยแล้ว");
        handleLoadQuizzes(subId);
      }
    } catch (err) {
      message.error("ลบล้มเหลว");
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (checkReadOnly()) return;
    console.log("handleDeleteSubmission called with submissionId:", submissionId);
    try {
      const res = await fetch(`/api/dve/quizzes/submissions?submissionId=${submissionId}`, { method: "DELETE" });
      console.log("Delete response status:", res.status);
      if (res.ok) {
        message.success("ลบงานที่ส่งเรียบร้อยแล้ว");
        // Reload submissions
        if (submissionsQuizId) {
          handleLoadSubmissions(submissionsQuizId, submissionsQuizTitle, submissionsIsBuiltIn);
        }
      } else {
        const errorData = await res.json();
        console.error("Delete failed:", errorData);
        message.error("ลบงานที่ส่งล้มเหลว");
      }
    } catch (err) {
      console.error("Delete error:", err);
      message.error("เกิดข้อผิดพลาดในการลบงานที่ส่ง");
    }
  };

  const handleDeleteAttendanceRecord = async (recordId: string) => {
    if (checkReadOnly()) return;
    console.log("handleDeleteAttendanceRecord called with recordId:", recordId);
    try {
      const res = await fetch(`/api/dve/attendances?id=${recordId}`, { method: "DELETE" });
      console.log("Delete attendance response status:", res.status);
      if (res.ok) {
        message.success("ลบบันทึกการส่งงานเรียบร้อยแล้ว");
        // Reload student progress
        if (selectedStudentId) {
          handleSelectStudentProgress(selectedStudentId);
        }
      } else {
        const errorData = await res.json();
        console.error("Delete attendance failed:", errorData);
        message.error("ลบบันทึกการส่งงานล้มเหลว");
      }
    } catch (err) {
      console.error("Delete attendance error:", err);
      message.error("เกิดข้อผิดพลาดในการลบบันทึกการส่งงาน");
    }
  };

  // ATTENDANCES / ROSTER ACTIONS
  const handleLoadRoster = async () => {
    const { subjectId, classGroupId, date } = checkinFilter;
    if (!subjectId) return;
    const selectedUnitId = getDveEntityId(activeStudyUnit);

    handleClearSelectedStudentProgress();
    setLoadingRoster(true);
    try {
      handleLoadAllQuizSubmissions(subjectId);
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
          const existing = selectedUnitId
            ? logs.find((a: any) => a.studentId === std.id && String(a.unitId || "") === selectedUnitId)
            : logs.find((a: any) => a.studentId === std.id && !a.unitId);
          newRecords[std.id] = {
            status: existing ? existing.status : "Absent",
            assignmentStatus: existing ? existing.assignmentStatus : "None",
            score: existing ? existing.score : "",
            imageUrl: existing ? existing.imageUrl || "" : "",
            unitId: existing ? existing.unitId || "" : selectedUnitId,
            unitTitle: existing ? existing.unitTitle || activeStudyUnit?.title || "" : activeStudyUnit?.title || "",
            unitSequence:
              existing && existing.unitSequence !== undefined
                ? existing.unitSequence
                : activeStudyUnit?.sequence !== undefined
                  ? activeStudyUnit.sequence
                  : "",
            studySeconds: existing ? existing.studySeconds || 0 : 0,
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

  // Auto-check attendance based on quiz submissions, assignments, and study time
  useEffect(() => {
    if (activeTab !== "checkin" || !activeStudyUnitId || studentRoster.length === 0) return;

    setAttendanceRecords((prevRecords) => {
      let hasChanges = false;
      const newRecords = { ...prevRecords };

      studentRoster.forEach((student) => {
        const rec = newRecords[student.id];
        if (!rec) return;

        const hasQuizSub = unitQuizResultsByStudent[student.id]?.length > 0;
        const isTimeCompleted = activeStudyUnit?.studyMinutes && (rec.studySeconds || 0) >= activeStudyUnit.studyMinutes * 60;
        const hasAssignment = studentSubmissionsById[student.id]?.length > 0;

        let changed = false;

        // Auto-check Present
        if ((hasQuizSub || isTimeCompleted || hasAssignment) && (rec.status === "Absent" || rec.status === "Studying")) {
          rec.status = "Present";
          changed = true;
        }

        // Auto-check Submitted
        if ((hasQuizSub || hasAssignment) && (rec.assignmentStatus === "None" || rec.assignmentStatus === "Pending")) {
          rec.assignmentStatus = "Submitted";
          changed = true;
        }

        if (changed) hasChanges = true;
      });

      return hasChanges ? newRecords : prevRecords;
    });
  }, [studentRoster, unitQuizResultsByStudent, studentSubmissionsById, activeStudyUnitId, activeStudyUnit, activeTab]);

  const handleToggleInternship = async (student: any) => {
    if (checkReadOnly()) return;
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

  const handleLoadInternshipStudents = React.useCallback(async (dept: string = "all", classGroupId: string = "") => {
    setLoadingInternship(true);
    try {
      const res = await fetch(
        `/api/dve/students?department=${encodeURIComponent(dept || "all")}&classGroupId=${classGroupId}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setInternshipStudents(data.students || []);
          if (data.classGroups) {
            const standardized = Array.from(
              new Set(data.classGroups.map((c: string) => standardizeClassGroupName(c))),
            );
            setInternshipClassGroups(standardized as string[]);
          }
        }
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษาออกฝึกงาน");
    } finally {
      setLoadingInternship(false);
    }
  }, []);

  const departments = useMemo(() => {
    return DEPARTMENTS.filter(d => d.startsWith("แผนก") || d.startsWith("การจัดการ"));
  }, []);

  useEffect(() => {
    if (activeTab === "internship") {
      handleLoadInternshipStudents(internshipFilter.department || "all", internshipFilter.classGroupId);
    }
  }, [activeTab, internshipFilter.department, internshipFilter.classGroupId, handleLoadInternshipStudents]);

  // Timeline data fetch function
  const handleLoadTimelineData = async () => {
    if (!timelineFilter.subjectId) return;
    setLoadingTimeline(true);
    try {
      const { subjectId, classGroupId, dateRange } = timelineFilter;
      const days = parseInt(dateRange) || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split("T")[0];

      let url = `/api/dve/attendances?subjectId=${subjectId}&startDate=${startDateStr}`;
      if (classGroupId) {
        url += `&classGroupId=${encodeURIComponent(classGroupId)}`;
        console.log("Timeline filter - classGroupId:", classGroupId);
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log("Timeline API response:", data);
        if (data.success) {
          // Group submissions by date and classroom
          const grouped = (data.attendances || []).reduce((acc: any, att: any) => {
            const date = att.date || "ไม่ระบุวันที่";
            const rawClassGroup = att.classGroupId || "ไม่ระบุกลุ่ม";
            const classGroup =
              rawClassGroup === "ไม่ระบุกลุ่ม"
                ? rawClassGroup
                : standardizeClassGroupName(rawClassGroup);
            const key = `${date}|${classGroup}`;
            if (!acc[key]) {
              acc[key] = {
                date,
                classGroupId: classGroup,
                submissions: [],
              };
            }
            acc[key].submissions.push(att);
            return acc;
          }, {});
          setTimelineData(
            Object.values(grouped).sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
          );
        }
      }
    } catch (err) {
      console.error("Load timeline error:", err);
      message.error("โหลดข้อมูล Timeline ล้มเหลว");
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    if (activeTab === "timeline" && timelineFilter.subjectId) {
      handleLoadTimelineData();
    }
  }, [activeTab, timelineFilter.subjectId, timelineFilter.classGroupId, timelineFilter.dateRange]);

  // Fetch class groups for timeline filter
  useEffect(() => {
    const fetchTimelineClassGroups = async () => {
      if (!timelineFilter.subjectId) {
        setTimelineClassGroups([]);
        return;
      }
      try {
        const res = await fetch(`/api/dve/attendances?subjectId=${timelineFilter.subjectId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.attendances) {
            const classGroups = Array.from(
              new Set(
                data.attendances
                  .filter((a: any) => a.classGroupId)
                  .map((a: any) => standardizeClassGroupName(a.classGroupId))
                  .filter((c: string) => c && c.trim() !== "" && !/^[\d\s-]+$/.test(c)),
              ),
            ).sort() as string[];
            console.log("Timeline class groups fetched:", classGroups);
            setTimelineClassGroups(classGroups);
          }
        }
      } catch (err) {
        console.error("Fetch timeline class groups error:", err);
      }
    };
    fetchTimelineClassGroups();
  }, [timelineFilter.subjectId]);

  const handleExtractScoreFromImage = async (
    studentId: string,
    imageUrl: string,
  ): Promise<string | null> => {
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
    if (checkReadOnly()) return;
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
        unitId: attendanceRecords[s.id]?.unitId || activeStudyUnitId || "",
        unitTitle: attendanceRecords[s.id]?.unitTitle || activeStudyUnit?.title || "",
        unitSequence:
          attendanceRecords[s.id]?.unitSequence !== undefined && attendanceRecords[s.id]?.unitSequence !== ""
            ? attendanceRecords[s.id].unitSequence
            : activeStudyUnit?.sequence !== undefined
              ? activeStudyUnit.sequence
              : "",
        studySeconds: attendanceRecords[s.id]?.studySeconds || 0,
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

  const handleDeleteIndividualAttendance = async (studentId: string) => {
    const { subjectId, classGroupId, date } = checkinFilter;
    if (!subjectId || !date) return;

    try {
      const url = `/api/dve/attendances?subjectId=${subjectId}&date=${date}&studentId=${studentId}${classGroupId ? `&classGroupId=${classGroupId}` : ""}`;
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        message.success("ลบข้อมูลการเข้าเรียนเรียบร้อยแล้ว");
        handleLoadRoster();
      } else {
        message.error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
      {teacherId && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">โหมดผู้ตรวจสอบ (ผู้บริหาร)</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              กำลังดูข้อมูลรายวิชาและการสอนของครู: {teacherName || teacherId} {teacherDept ? `(${teacherDept})` : ""}
            </p>
          </div>
          <Link href="/teacher-verification" className="px-4 py-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs font-bold transition-colors">
            กลับไปหน้าตรวจสอบ
          </Link>
        </div>
      )}
      {/* Teacher Workspace Header (Premium Glassmorphism) */}
      <div className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/10 group">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000">
          <BookOpen size={180} className="w-32 h-32 sm:w-56 sm:h-56 drop-shadow-2xl" />
        </div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute right-1/4 top-0 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none mix-blend-screen -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-2xl space-y-5">
          <span className="bg-white/10 backdrop-blur-md text-[10px] sm:text-xs uppercase font-black tracking-widest px-4 py-1.5 rounded-full text-blue-200 border border-white/10 shadow-sm flex items-center gap-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            DVE Administration Panel
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            ระบบบริหารการจัดการ<br className="sm:hidden" /> อาชีวศึกษา ทวิภาคี{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400 block sm:inline relative">
              (DVE Portal)
            </span>
          </h1>
          <p className="text-zinc-300 font-medium text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            ห้องควบคุมหลักสำหรับอาจารย์: จัดการรายวิชาการเรียนการสอน, สื่อและไฟล์การเรียนรายหน่วย, สร้างแบบทดสอบ และบันทึกประวัติการขาดลามาสายและผลงานนักศึกษา
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/dashboard/dve/grading")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer border border-white/10 hover:shadow-blue-500/40"
            >
              <ClipboardList className="w-4 h-4" />
              <span>ระบบตรวจงานและให้คะแนน (Grading)</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs Switcher - Ultra Premium Glassmorphic Segmented Control */}
        <div className="flex flex-wrap sm:flex-nowrap gap-1 p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-2xl sm:rounded-[24px] w-full md:w-auto overflow-x-auto scrollbar-hide shadow-lg shadow-zinc-950/5">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-[18px] text-xs font-black transition-all flex-1 sm:flex-none whitespace-nowrap cursor-pointer z-10 ${activeTab === "subjects"
                ? "text-white shadow-md shadow-emerald-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              }`}
          >
            {activeTab === "subjects" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl sm:rounded-[18px] -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <BookOpen size={15} className={activeTab === "subjects" ? "text-emerald-100" : "text-zinc-400"} />
            <span className="hidden sm:inline">วิชา & หน่วยเรียน</span>
            <span className="sm:hidden">วิชา</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("quizzes");
              if (subjects.length > 0) {
                setQuizForm((prev) => ({ ...prev, subjectId: subjects[0].id }));
                handleLoadQuizzes(subjects[0].id);
              }
            }}
            className={`relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-[18px] text-xs font-black transition-all flex-1 sm:flex-none whitespace-nowrap cursor-pointer z-10 ${activeTab === "quizzes"
                ? "text-white shadow-md shadow-emerald-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              }`}
          >
            {activeTab === "quizzes" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl sm:rounded-[18px] -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Award size={15} className={activeTab === "quizzes" ? "text-emerald-100" : "text-zinc-400"} />
            <span className="hidden sm:inline">แบบทดสอบ</span>
            <span className="sm:hidden">ทดสอบ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("checkin");
              if (subjects.length > 0) {
                setCheckinFilter((prev) => ({ ...prev, subjectId: subjects[0].id }));
              }
            }}
            className={`relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-[18px] text-xs font-black transition-all flex-1 sm:flex-none whitespace-nowrap cursor-pointer z-10 ${activeTab === "checkin"
                ? "text-white shadow-md shadow-emerald-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              }`}
          >
            {activeTab === "checkin" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl sm:rounded-[18px] -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <CheckCircle size={15} className={activeTab === "checkin" ? "text-emerald-100" : "text-zinc-400"} />
            <span className="hidden sm:inline">เช็คชื่อ & ตรวจงาน</span>
            <span className="sm:hidden">เช็คชื่อ</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("internship");
            }}
            className={`relative flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-[18px] text-xs font-black transition-all flex-1 sm:flex-none whitespace-nowrap cursor-pointer z-10 ${activeTab === "internship"
                ? "text-white shadow-md shadow-emerald-500/25"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
              }`}
          >
            {activeTab === "internship" && (
              <motion.div
                layoutId="active-tab-glow"
                className="absolute inset-0 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-xl sm:rounded-[18px] -z-10 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Briefcase size={15} className={activeTab === "internship" ? "text-emerald-100" : "text-zinc-400"} />
            <span className="hidden sm:inline">ออกฝึกงาน</span>
            <span className="sm:hidden">ฝึกงาน</span>
          </button>
        </div>

        {/* Global Filter UI */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 px-4 py-2.5 rounded-2xl shadow-lg shadow-zinc-950/5 hover:border-emerald-400/50 dark:hover:border-emerald-600/50 transition-all group">
            <Calendar size={15} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider hidden sm:inline">
              ปีการศึกษา
            </label>
            <select
              value={globalAcademicYear}
              onChange={(e) => setGlobalAcademicYear(e.target.value)}
              className="bg-transparent text-xs font-black text-zinc-800 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">ทุกปี</option>
              {availableAcademicYears.map((year) => (
                <option key={year} value={year} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 px-4 py-2.5 rounded-2xl shadow-lg shadow-zinc-950/5 hover:border-emerald-400/50 dark:hover:border-emerald-600/50 transition-all group">
            <Filter size={15} className="text-teal-500 group-hover:scale-110 transition-transform" />
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider hidden sm:inline">
              เทอม
            </label>
            <select
              value={globalSemester}
              onChange={(e) => setGlobalSemester(e.target.value)}
              className="bg-transparent text-xs font-black text-zinc-800 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">ทุกเทอม</option>
              {availableSemesters.map((term) => (
                <option key={term} value={term} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">เทอม {term}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Description */}
      <motion.div
        key={`tab-desc-${activeTab}`}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="px-2 mb-2"
      >
        {activeTab === "subjects" && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            จัดการวิชาเรียน หน่วยการเรียน และสื่อการสอน
          </p>
        )}
        {activeTab === "quizzes" && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            สร้างและจัดการแบบทดสอบ คลังข้อสอบ และการให้คะแนน
          </p>
        )}
        {activeTab === "checkin" && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            เช็คชื่อเข้าเรียน ตรวจงานส่ง และให้คะแนน
          </p>
        )}
        {activeTab === "timeline" && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ดูประวัติการส่งงานแบบ Timeline ตามวันที่และห้องเรียน
          </p>
        )}
        {activeTab === "internship" && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ติดตามสถานะการออกฝึกงานของนักศึกษา
          </p>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Tab 1: Subjects & Units Management */}
        {activeTab === "subjects" && (
          <motion.div
            key="subjects"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {/* List of Subjects */}
            <div className="lg:col-span-1 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-4 sm:p-5 shadow-xl shadow-zinc-950/5 space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                      รายวิชาทวิภาคีทั้งหมด
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      {filteredSubjects.length} รายวิชาในระบบ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const currentUserId = (session?.user as any)?.id || "";
                    const currentUserName = session?.user?.name || "";
                    const defaultTeacher = teachersList.find((t) => t.id === currentUserId) || teachersList[0];
                    setSubjectForm({
                      id: "",
                      code: "",
                      name: "",
                      department: session?.user?.name ? session.user.department || "" : "",
                      curriculum: "ปวส.",
                      semester: "1/2569",
                      academicYear: "2569",
                      teacherId: defaultTeacher?.id || currentUserId,
                      teacherName: defaultTeacher?.name || currentUserName,
                      totalWeeks: "",
                      daysPerWeek: "",
                      hoursPerDay: "",
                      totalHours: "",
                      allowedClassGroups: "",
                    });
                    setSubjectAllowedClassGroupRows([""]);
                    setIsSubjectModalOpen(true);
                  }}
                  className="px-3 py-2 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 border-0 cursor-pointer"
                >
                  <Plus size={14} className="stroke-3" />
                  เพิ่มวิชา
                </button>
              </div>

              {loadingSubjects ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin opacity-80" />
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-700 dark:text-zinc-300">ไม่มีรายวิชา</h4>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] sm:text-xs font-bold mt-1 max-w-[250px] mx-auto">
                      ไม่พบรายวิชาในภาคเรียนที่เลือก หรือยังไม่ได้เพิ่มวิชาลงในระบบ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleManageUnits(sub)}
                      className={`p-4 sm:p-5 rounded-[24px] border transition-all duration-300 cursor-pointer text-left group relative overflow-hidden ${activeSubject?.id === sub.id
                        ? "bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg shadow-emerald-500/10 dark:from-emerald-950/40 dark:via-zinc-900/80 dark:to-teal-950/30 scale-[1.01]"
                        : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800/80 hover:bg-white/90 hover:border-emerald-300 dark:hover:bg-zinc-800/80 dark:hover:border-emerald-500/30 hover:shadow-md"
                        }`}
                    >
                      {/* Active indicator bar */}
                      {activeSubject?.id === sub.id && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {sub.curriculum} • ภาคเรียน {sub.semester}
                            </span>
                          </div>
                          <h4 className="font-black text-zinc-900 dark:text-zinc-50 text-sm sm:text-base truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                            {sub.name}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate font-medium flex items-center gap-1.5">
                            <span>รหัส:</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                              {sub.code}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-700">•</span>
                            <span className="truncate">แผนก: <span className="font-bold text-zinc-700 dark:text-zinc-300">{sub.department}</span></span>
                          </p>
                        </div>
                      </div>

                      {sub.allowedClassGroups && (Array.isArray(sub.allowedClassGroups) ? sub.allowedClassGroups.length > 0 : String(sub.allowedClassGroups).trim()) && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] bg-teal-50/80 dark:bg-teal-950/40 w-fit px-2.5 py-1 rounded-xl border border-teal-200/60 dark:border-teal-800/40 shadow-xs">
                          <Users size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                          <p className="text-teal-800 dark:text-teal-200 font-bold line-clamp-1">
                            {formatClassGroupsText(sub.allowedClassGroups)}
                          </p>
                        </div>
                      )}

                      {sub.teacherName && (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] bg-indigo-50/80 dark:bg-indigo-950/40 w-fit px-2.5 py-1 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs">
                          <User size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <p className="text-indigo-800 dark:text-indigo-200 font-bold truncate">
                            ครูผู้สอน: {sub.teacherName}
                          </p>
                        </div>
                      )}

                      <div
                        className="flex justify-end gap-2 mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            const allowedClassGroups = parseClassGroupsText(
                              formatClassGroupsText(sub.allowedClassGroups),
                            );
                            setSubjectForm({
                              ...sub,
                              teacherId: sub.teacherId || (session?.user as any)?.id || "",
                              teacherName: sub.teacherName || session?.user?.name || "",
                              allowedClassGroups: allowedClassGroups.join(", "),
                            });
                            setSubjectAllowedClassGroupRows(
                              allowedClassGroups.length > 0 ? allowedClassGroups : [""],
                            );
                            setIsSubjectModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-zinc-600 dark:text-zinc-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer shadow-xs"
                        >
                          <Edit2 size={11} />
                          <span>แก้ไขวิชา</span>
                        </button>
                        <Popconfirm
                          title="ลบรายวิชาทวิภาคี?"
                          description="การลบวิชานี้จะลบข้อมูลทั้งหมดที่เกี่ยวข้องอย่างถาวร ยืนยันใช่หรือไม่?"
                          onConfirm={() => handleDeleteSubject(sub.id)}
                          okText="ยืนยันลบ"
                          cancelText="ยกเลิก"
                          okButtonProps={{ danger: true }}
                        >
                          <button className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-rose-500 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-rose-200/60 dark:border-rose-900/60 cursor-pointer shadow-xs">
                            <Trash2 size={11} />
                            <span>ลบ</span>
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of Units inside active Subject */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-6 shadow-xl shadow-zinc-950/5 space-y-6">
              {activeSubject ? (
                <>
                  <div className="flex justify-between items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block">
                          หน่วยการเรียนและไฟล์แนบ
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                          {units.length} หน่วยเรียน
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-1.5 leading-tight flex items-center gap-2 flex-wrap">
                        <span>{activeSubject.name}</span>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                          {activeSubject.code}
                        </span>
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setUnitForm({
                          id: "",
                          title: "",
                          content: "",
                          sequence: units.length + 1,
                          studyMinutes: "",
                          totalMinutes: "",
                          dueDate: "",
                          files: [],
                        });
                        setIsUnitModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 border-0 cursor-pointer shrink-0"
                    >
                      <Plus size={14} className="stroke-3" />
                      เพิ่มหน่วยเรียน
                    </button>
                  </div>

                  {loadingUnits ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin opacity-80" />
                    </div>
                  ) : units.length === 0 ? (
                    <div className="text-center py-16 px-4 flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500">
                        <FolderOpen size={32} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-zinc-700 dark:text-zinc-300">ยังไม่มีหน่วยเรียน</h4>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[11px] sm:text-xs font-bold mt-1.5 max-w-[280px] mx-auto">
                          วิชานี้ยังไม่มีการสร้างหน่วยเรียนใดๆ ในระบบ คลิก "เพิ่มหน่วยเรียน" เพื่อเริ่มต้น
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {units.map((unit, index) => (
                        <div
                          key={unit.id}
                          className="p-5 sm:p-6 rounded-[24px] bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 relative group hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                        >
                          <div className="absolute top-5 right-5 flex gap-2 transition-all duration-200">
                            <button
                              onClick={() => {
                                setUnitForm({
                                  id: unit.id,
                                  title: unit.title,
                                  content: unit.content,
                                  sequence: unit.sequence,
                                  studyMinutes: unit.studyMinutes !== undefined && unit.studyMinutes !== null ? String(unit.studyMinutes) : "",
                                  totalMinutes: unit.totalMinutes !== undefined && unit.totalMinutes !== null ? String(unit.totalMinutes) : "",
                                  dueDate: unit.dueDate || "",
                                  files: unit.files || [],
                                });
                                setIsUnitModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-zinc-600 dark:text-zinc-400 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer shadow-xs"
                            >
                              <Edit2 size={11} />
                              <span className="hidden sm:inline">แก้ไข</span>
                            </button>
                            <Popconfirm
                              title="ลบหน่วยการเรียน?"
                              onConfirm={() => handleDeleteUnit(unit.id)}
                              okText="ยืนยันลบ"
                              cancelText="ยกเลิก"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-rose-500 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold border border-rose-200/60 dark:border-rose-900/60 cursor-pointer shadow-xs">
                                <Trash2 size={11} />
                                <span className="hidden sm:inline">ลบ</span>
                              </button>
                            </Popconfirm>
                          </div>

                          <div className="flex items-start gap-4">
                            <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white font-black text-base shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/20">
                              #{unit.sequence}
                            </div>
                            <div className="flex-1 min-w-0 pr-16 md:pr-0">
                              <h4 className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-snug">
                                {unit.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                {unit.createdAt && (
                                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-bold bg-zinc-100/80 dark:bg-zinc-800/80 px-2.5 py-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 flex items-center gap-1">
                                    <Calendar size={12} className="text-zinc-400" />
                                    {new Date(unit.createdAt).toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                                {unit.studyMinutes > 0 && (
                                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-black bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1 shadow-xs">
                                    <Clock size={12} className="text-amber-500" /> {unit.studyMinutes} นาที
                                  </span>
                                )}
                                {unit.dueDate && (
                                  <span className="text-[11px] text-rose-700 dark:text-rose-300 font-black bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-200/60 dark:border-rose-800/60 flex items-center gap-1 shadow-xs">
                                    <AlertCircle size={12} className="text-rose-500" /> ส่ง: {new Date(unit.dueDate).toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {unit.content && (
                            <div className="mt-4 pl-0 sm:pl-16">
                              <div className="p-3.5 bg-zinc-50/90 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 border-l-4 border-l-emerald-500 shadow-xs">
                                <p
                                  className={`text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-medium transition-all ${!expandedUnits[unit.id] ? "line-clamp-3" : ""
                                    }`}
                                >
                                  {unit.content}
                                </p>
                                {unit.content.length > 100 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedUnits((prev) => ({
                                        ...prev,
                                        [unit.id]: !prev[unit.id],
                                      }))
                                    }
                                    className="mt-2 text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer border-0 bg-transparent p-0 flex items-center gap-1 transition-colors"
                                  >
                                    {expandedUnits[unit.id] ? "ย่อลง ▲" : "ดูเพิ่มเติม ▼"}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

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
                                <div className="mt-4 space-y-3 pl-0 sm:pl-16">
                                  {directFiles.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText size={12} /> ไฟล์เอกสารแนบ
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {directFiles.map((file: any, fIdx: number) => (
                                          <a
                                            key={fIdx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-[11px] font-bold rounded-xl transition-colors border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs"
                                          >
                                            <Download size={12} className="text-emerald-500" />
                                            {file.name}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {externalLinks.length > 0 && (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <ExternalLink size={12} /> ลิงก์ภายนอก
                                      </span>
                                      <div className="flex flex-wrap gap-2">
                                        {externalLinks.map((file: any, fIdx: number) => (
                                          <a
                                            key={fIdx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/60 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-950/60 text-[11px] font-bold rounded-xl transition-colors border border-teal-200/60 dark:border-teal-800/60 shadow-xs"
                                          >
                                            <ExternalLink size={12} className="text-teal-500" />
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
                <div className="text-center py-24 text-zinc-400 dark:text-zinc-500 text-sm font-bold flex flex-col items-center justify-center gap-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[28px] bg-zinc-50/50 dark:bg-zinc-900/20">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center">
                    <BookOpen size={32} className="text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <div className="max-w-xs">
                    <h4 className="text-zinc-600 dark:text-zinc-400 text-base mb-1">ยังไม่ได้เลือกรายวิชา</h4>
                    <p className="text-xs font-medium">กรุณาเลือกรายวิชาในแผงด้านซ้ายเพื่อดูหรือเริ่มเขียนหน่วยการสอน</p>
                  </div>
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
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Subject Selector for quiz management */}
            <div className="lg:col-span-1 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-4 sm:p-5 shadow-xl shadow-zinc-950/5 space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                      เลือกรายวิชา
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      เพื่อจัดการแบบทดสอบ ({filteredSubjects.length} วิชา)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {filteredSubjects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs font-bold">
                    ไม่พบรายวิชาในภาคเรียนนี้
                  </div>
                ) : (
                  filteredSubjects.map((s) => {
                    const isSelected = quizForm.subjectId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setQuizForm((prev) => ({ ...prev, subjectId: s.id }));
                          handleLoadQuizzes(s.id);
                        }}
                        className={`w-full p-4 rounded-[22px] text-left border transition-all duration-300 relative overflow-hidden cursor-pointer group ${isSelected
                            ? "bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/40 dark:border-emerald-500/30 shadow-lg shadow-emerald-500/10 scale-[1.01]"
                            : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800/80 hover:bg-white/90 hover:border-emerald-300 dark:hover:bg-zinc-800/80 dark:hover:border-emerald-500/30 hover:shadow-md"
                          }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-linear-to-b from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-700/50"
                              }`}
                          >
                            {s.code}
                          </span>
                        </div>
                        <h4
                          className={`font-black text-sm truncate leading-snug transition-colors ${isSelected
                              ? "text-emerald-950 dark:text-emerald-100"
                              : "text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}
                        >
                          {s.name}
                        </h4>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quizzes List and Add Quiz */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-6 shadow-xl shadow-zinc-950/5 space-y-6">
              {quizForm.subjectId ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-md inline-block">
                          แบบทดสอบและแบบวัดผล
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white mt-1">
                        แบบทดสอบทั้งหมด ({quizzes.length} ชุด)
                      </h3>
                    </div>

                    <button
                      onClick={() => {
                        setQuizForm({
                          id: "",
                          subjectId: quizForm.subjectId,
                          title: "",
                          googleFormUrl: "",
                          deadline: "",
                          startDate: "",
                          unitId: "",
                          isBuiltIn: true,
                          questions: [],
                          isShuffle: false,
                          quizType: "general",
                          maxScaleScore: null,
                        });
                        setIsQuizModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 border-0 cursor-pointer shrink-0"
                    >
                      <Plus size={14} className="stroke-3" />
                      สร้างแบบทดสอบ
                    </button>
                  </div>

                  {loadingQuizzes ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 animate-spin opacity-80" />
                    </div>
                  ) : quizzes.length === 0 ? (
                    <div className="text-center py-16 px-4 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500">
                        <Award size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                          ยังไม่มีการสร้างแบบทดสอบ
                        </h4>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] sm:text-xs font-bold mt-1 max-w-[280px] mx-auto">
                          วิชานี้ยังไม่มีชุดแบบทดสอบ คลิก "สร้างแบบทดสอบ" เพื่อเริ่มต้นสร้าง
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="p-5 sm:p-6 rounded-[24px] bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 relative group hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-2.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-50 leading-snug">
                                {quiz.title}
                              </h4>
                              {quiz.quizType === "pretest" && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60 shadow-xs">
                                  ก่อนเรียน (Pre-test)
                                </span>
                              )}
                              {quiz.quizType === "posttest" && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60 shadow-xs">
                                  หลังเรียน (Post-test)
                                </span>
                              )}
                              {quiz.quizType === "midterm" && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60 shadow-xs">
                                  สอบกลางภาค (Midterm)
                                </span>
                              )}
                              {quiz.quizType === "final" && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60 shadow-xs">
                                  สอบปลายภาค (Final)
                                </span>
                              )}
                              {(!quiz.quizType || quiz.quizType === "general") && (
                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black border bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-700/50 shadow-xs">
                                  ทั่วไป
                                </span>
                              )}
                              <span
                                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border shadow-xs ${quiz.isBuiltIn
                                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60"
                                    : "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60"
                                  }`}
                              >
                                {quiz.isBuiltIn ? "🧠 แบบทดสอบในแอป" : "🔗 Google Form"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                              {!quiz.isBuiltIn ? (
                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-lg border border-blue-200/40 dark:border-blue-800/40">
                                  <ExternalLink size={12} />
                                  {quiz.googleFormUrl
                                    ? quiz.googleFormUrl.substring(0, 40) + "..."
                                    : "ไม่มีลิงก์"}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs font-black">
                                  <ClipboardList size={12} className="text-emerald-500" />
                                  จำนวนคำถาม: {quiz.questions?.length || 0} ข้อ
                                </span>
                              )}
                              {quiz.deadline && (
                                <span className="flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-lg border border-rose-200/60 dark:border-rose-800/60 shadow-xs font-black">
                                  <Calendar size={12} className="text-rose-500" />
                                  เดดไลน์: {new Date(quiz.deadline).toLocaleDateString("th-TH", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                              {quiz.maxScaleScore !== null && quiz.maxScaleScore !== undefined && (
                                <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs font-black">
                                  <Award size={12} className="text-indigo-500" />
                                  คะแนนเต็ม: {quiz.maxScaleScore} คะแนน
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/60 justify-end">
                            {/* View submissions */}
                            <button
                              onClick={() =>
                                handleLoadSubmissions(quiz.id, quiz.title, !!quiz.isBuiltIn)
                              }
                              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200/60 dark:border-blue-800/60 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:shadow-md hover:shadow-blue-500/20"
                            >
                              <Eye size={13} />
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
                                  startDate: quiz.startDate || "",
                                  unitId: quiz.unitId || "",
                                  isBuiltIn: !!quiz.isBuiltIn,
                                  questions: quiz.questions || [],
                                  isShuffle: !!quiz.isShuffle,
                                  quizType: quiz.quizType || "general",
                                  maxScaleScore: quiz.maxScaleScore || null,
                                });
                                setIsQuizModalOpen(true);
                              }}
                              className="px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer shadow-xs flex items-center gap-1 transition-colors"
                            >
                              <Edit2 size={12} />
                              แก้ไข
                            </button>
                            <Popconfirm
                              title="ลบแบบทดสอบนี้?"
                              description="การลบแบบทดสอบจะลบข้อมูลผลคะแนนที่เกี่ยวข้อง ยืนยันใช่หรือไม่?"
                              onConfirm={() => handleDeleteQuiz(quiz.id, quizForm.subjectId)}
                              okText="ยืนยันลบ"
                              cancelText="ยกเลิก"
                              okButtonProps={{ danger: true }}
                            >
                              <button className="px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-rose-500 rounded-xl text-xs font-bold border border-rose-200/60 dark:border-rose-900/60 cursor-pointer shadow-xs flex items-center gap-1 transition-colors">
                                <Trash2 size={12} />
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
                <div className="text-center py-20 px-4 text-zinc-400 dark:text-zinc-500 text-sm font-bold flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800/60 flex items-center justify-center text-zinc-400">
                    <Award size={32} />
                  </div>
                  <div>
                    <h4 className="text-zinc-600 dark:text-zinc-400 text-base mb-1">ยังไม่ได้เลือกรายวิชา</h4>
                    <p className="text-xs font-medium max-w-[280px] mx-auto">
                      กรุณาเลือกรายวิชาในแผงด้านซ้ายเพื่อดูหรือสร้างแบบทดสอบ
                    </p>
                  </div>
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
            <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-7 shadow-xl shadow-zinc-950/5 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-1000" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5 items-end relative z-10">
                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-[11px] sm:text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-wide flex items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black inline-flex items-center justify-center mr-1.5 border border-emerald-500/20">1</span>
                    เลือกรายวิชาเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกวิชาเรียน --"
                    className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                    value={checkinFilter.subjectId || undefined}
                    onChange={(val) => {
                      const selectedSubject = subjects.find((s) => s.id === val);
                      const allowedGroups = getSubjectAllowedClassGroups(selectedSubject);
                      setCheckinFilter((prev) => ({ ...prev, subjectId: val, classGroupId: allowedGroups[0] || "" }));
                      setActiveStudyUnit(null);
                      setQuizzes([]);
                      setStudentRoster([]);
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    options={filteredSubjects.map((s) => ({ label: `[${s.code}] ${s.name}`, value: s.id }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-[11px] sm:text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-wide flex items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black inline-flex items-center justify-center mr-1.5 border border-emerald-500/20">2</span>
                    เลือกหน่วยเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกหน่วยเรียน --"
                    className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                    value={activeStudyUnitId || undefined}
                    onChange={(val) => {
                      const nextUnit = units.find((unit) => getDveEntityId(unit) === val) || null;
                      setActiveStudyUnit(nextUnit);
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    options={units.map((unit) => ({
                      label: `หน่วยที่ ${unit.sequence || "-"}: ${unit.title}`,
                      value: getDveEntityId(unit),
                    }))}
                    disabled={!checkinFilter.subjectId || loadingUnits || units.length === 0}
                    loading={loadingUnits}
                  />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-[11px] sm:text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-wide flex items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black inline-flex items-center justify-center mr-1.5 border border-emerald-500/20">3</span>
                    เลือกห้องเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกห้องเรียน --"
                    className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                    value={checkinFilter.classGroupId || undefined}
                    onChange={(val) => {
                      setCheckinFilter((prev) => ({ ...prev, classGroupId: val }));
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    options={[
                      ...(selectedCheckinAllowedGroups.length === 0
                        ? [{ label: "แสดงทั้งหมด", value: "" }]
                        : []),
                      ...availableClassGroups.map((c) => ({ label: c, value: c })),
                    ]}
                    disabled={!checkinFilter.subjectId}
                  />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] sm:text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-wide truncate pr-2 flex items-center">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black inline-flex items-center justify-center mr-1.5 border border-emerald-500/20">4</span>
                      วันที่เช็คชื่อ
                    </label>
                    <button
                      onClick={handleFetchActiveDates}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 border border-blue-200/50 dark:border-blue-500/30 cursor-pointer"
                    >
                      <Calendar size={11} />
                      <span className="hidden xl:inline">ดูประวัติ</span>
                    </button>
                  </div>
                  <DatePicker
                    format="DD/MM/BBBB"
                    className="w-full h-12 border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 rounded-2xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-xs"
                    value={checkinFilter.date ? dayjs(checkinFilter.date) : null}
                    onChange={(date) => {
                      setCheckinFilter((prev) => ({ ...prev, date: date ? date.format("YYYY-MM-DD") : "" }));
                      setAttendanceLogs([]);
                      setAttendanceRecords({});
                    }}
                    placeholder="วว/ดด/ปปปป"
                  />
                </div>

                <div className="flex flex-col gap-1.5 lg:col-span-1">
                  <label className="text-[11px] sm:text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-wide truncate flex items-center">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black inline-flex items-center justify-center mr-1.5 border border-emerald-500/20">5</span>
                    ค้นหาชื่อ / รหัส
                  </label>
                  <input
                    type="text"
                    placeholder="🔍 พิมพ์ค้นหา..."
                    className="w-full h-12 border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 rounded-2xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white placeholder-zinc-400 font-bold shadow-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-1 h-[48px]">
                  <button
                    onClick={handleLoadRoster}
                    disabled={!checkinFilter.subjectId}
                    className="w-full h-full bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-zinc-200 disabled:to-zinc-300 disabled:text-zinc-400 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer border-0 active:scale-95"
                  >
                    <Search size={16} className="stroke-3" />
                    ดึงรายชื่อ
                  </button>
                </div>
              </div>
            </div>

            {/* Active Dates Modal */}
            <Modal
              title={
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black">
                  <Calendar size={20} />
                  <span>วันที่มีประวัติการส่งงาน / เช็คชื่อ</span>
                </div>
              }
              open={isDateModalOpen}
              onCancel={() => setIsDateModalOpen(false)}
              footer={null}
              centered
              mask={{ closable: false }}
              keyboard={false}
              width="100vw"
              style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw', height: '100vh', paddingBottom: 0 }}
              styles={{
                header: { padding: "20px 24px 0" },
                body: { padding: "20px 24px", height: 'calc(100vh - 60px)', overflowY: 'auto' }
              }}
            >
              {loadingDates ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-zinc-500 font-medium text-sm">กำลังโหลดข้อมูลวันที่...</p>
                </div>
              ) : activeDates.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-zinc-100 dark:bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={24} className="text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 font-bold text-sm">ยังไม่มีประวัติการส่งงานหรือเช็คชื่อ<br />ในวิชาและห้องเรียนที่คุณเลือกครับ</p>
                  <p className="text-xs text-zinc-400 mt-2 font-medium">(เมื่อคุณครูทำการเช็คชื่อหรือตรวจงาน ประวัติวันที่จะมาปรากฏที่นี่ครับ)</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-zinc-500 mb-4">
                    พบ {activeDates.length} วันที่มีการบันทึกข้อมูล (เรียงจากล่าสุด)
                  </p>
                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {activeDates.map(date => {
                      // Format to Thai Display if needed
                      const d = new Date(date);
                      const displayDate = !isNaN(d.getTime()) ? d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : date;

                      return (
                        <button
                          key={date}
                          onClick={() => {
                            setCheckinFilter(prev => ({ ...prev, date }));
                            setAttendanceLogs([]);
                            setAttendanceRecords({});
                            setIsDateModalOpen(false);
                            // handleLoadRoster will need to be clicked manually, or we can auto-click it? The user can just click the button after.
                          }}
                          className="w-full p-4 flex items-center justify-between text-left border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="font-black text-sm text-zinc-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                {displayDate}
                              </p>
                              <p className="text-xs font-medium text-zinc-500">
                                {date}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-zinc-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Modal>


            {/* 🔍 Individual Student Progress Analyzer */}
            {studentRoster.length > 0 && (
              <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-7 shadow-xl shadow-zinc-950/5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white leading-tight">
                      ตรวจสอบข้อมูลการส่งงานรายบุคคล (งานที่ส่งและยังไม่ส่ง)
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      ดูประวัติการเข้าเรียน การส่งแบบฝึกหัด และคะแนนทดสอบของนักเรียนแต่ละคน
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <Select
                      showSearch
                      placeholder="-- ค้นหาหรือเลือกชื่อนักเรียนเพื่อดูประวัติงานทั้งหมด --"
                      className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                      optionFilterProp="children"
                      value={selectedStudentId || undefined}
                      onChange={(val) => handleSelectStudentProgress(val)}
                      filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={studentRoster.map((s) => ({
                        label: `${s.studentIdNum} - ${s.name}`,
                        value: s.id,
                      }))}
                    />
                  </div>
                  {selectedStudentId && (
                    <button
                      onClick={() => handleClearSelectedStudentProgress()}
                      className="px-5 py-3 border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs"
                    >
                      ล้างการเลือก
                    </button>
                  )}
                </div>

                {loadingStudentProgress ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                ) : selectedStudent ? (
                  <div className="border border-emerald-500/20 dark:border-emerald-500/20 rounded-[24px] p-5 sm:p-6 space-y-5 bg-linear-to-br from-emerald-500/5 via-white/80 to-teal-500/5 dark:from-emerald-950/20 dark:via-zinc-900/60 dark:to-teal-950/20 shadow-xs">
                    {/* Student Info Profile Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80">
                      <div className="flex items-center gap-3.5">
                        {selectedStudent.image ? (
                          <img
                            src={selectedStudent.image}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-500/25">
                            {selectedStudent.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-zinc-900 dark:text-white text-base leading-tight">
                            {selectedStudent.name}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-1">
                            รหัสนักศึกษา: <span className="font-black text-zinc-700 dark:text-zinc-200">{selectedStudent.studentIdNum}</span> • กลุ่ม: <span className="font-black text-emerald-600 dark:text-emerald-400">{standardizeClassGroupName(selectedStudent.classGroupId)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Overall Task Completion Badge */}
                      <div className="bg-white/80 dark:bg-zinc-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 px-5 py-3 rounded-2xl text-center shrink-0 shadow-xs">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          ส่งการบ้านสำเร็จ
                        </span>
                        <span className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          {selectedStudentLogs.filter((l) => l.assignmentStatus === "Submitted").length} / {units.length}
                        </span>
                        <span className="text-[10px] font-bold block mt-0.5 text-zinc-400">
                          หน่วยการเรียน
                        </span>
                      </div>
                    </div>

                    {/* Unit Breakdown Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        รายงานการส่งงานรายหน่วยเรียน
                      </h4>
                      {units.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-6 font-bold">
                          ยังไม่มีหน่วยเรียนในวิชานี้
                        </p>
                      ) : (
                        <div className="grid gap-2.5">
                          {units.map((unit) => {
                            const record = selectedStudentLogs.find((l) => l.unitId === unit.id);
                            const isSubmitted = record?.assignmentStatus === "Submitted";
                            const isPending = record?.assignmentStatus === "Pending";

                            const studentUnitSubs = allSubjectQuizSubmissions.filter(
                              (sub) =>
                                sub.studentId === selectedStudent.id &&
                                String(sub.unitId || "").trim() === String(unit.id || unit._id || "").trim()
                            );
                            const pretestSub = studentUnitSubs.find((s) => s.quizType === "pretest");
                            const posttestSub = studentUnitSubs.find((s) => s.quizType === "posttest");

                            return (
                              <div
                                key={unit.id}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800 rounded-2xl gap-3 text-xs shadow-xs hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors"
                              >
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-black text-zinc-600 dark:text-zinc-300">
                                      หน่วยที่ {unit.sequence}
                                    </span>
                                    <span className="font-black text-zinc-900 dark:text-zinc-100 truncate">
                                      {unit.title}
                                    </span>
                                  </div>
                                  {record?.date && (
                                    <span className="text-[10px] text-zinc-400 font-bold block">
                                      📅 บันทึกเมื่อ: {formatThaiDateDisplay(record.date)}
                                    </span>
                                  )}
                                  {(pretestSub || posttestSub) && (
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                      {pretestSub && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-650 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 text-[9px] font-black">
                                          ก่อนเรียน: {pretestSub.score} / {pretestSub.maxScore}
                                        </span>
                                      )}
                                      {posttestSub && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/30 text-cyan-650 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/50 text-[9px] font-black">
                                          หลังเรียน: {posttestSub.score} / {posttestSub.maxScore}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                  {/* Status Indicator */}
                                  <div>
                                    {isSubmitted ? (
                                      <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
                                        ส่งงานแล้ว {record.score ? `(${record.score} คะแนน)` : ""}
                                      </span>
                                    ) : isPending ? (
                                      <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 shadow-xs">
                                        ค้างส่ง
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-xl text-[10px] font-black bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 shadow-xs">
                                        ยังไม่ได้ส่ง
                                      </span>
                                    )}
                                  </div>

                                  {/* Evidence Link */}
                                  {record?.imageUrl && (
                                    <a
                                      href={record.imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/60 text-[10px] font-black rounded-xl transition-colors cursor-pointer shadow-xs"
                                    >
                                      <Eye size={12} />
                                      <span>เปิดดูงาน</span>
                                    </a>
                                  )}

                                  {/* Delete Button */}
                                  {record && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`ลบบันทึกการส่งงานของ ${selectedStudent.name} ในหน่วยที่ ${unit.sequence}?`)) {
                                          handleDeleteAttendanceRecord(record.id || record._id?.toString());
                                        }
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200/60 dark:border-rose-900/60 text-[10px] font-black rounded-xl transition-colors cursor-pointer shadow-xs"
                                    >
                                      <Trash2 size={12} />
                                      <span>ลบ</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Student Roster attendance checkboxes sheet */}
            <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-7 shadow-xl shadow-zinc-950/5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                      <ClipboardList size={18} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white leading-tight">
                        บัญชีลงเวลาการเข้าเรียนและส่งงานนักศึกษา
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">
                        ระบบ Auto Check-in และบันทึกผลการเข้าเรียนตามหน่วยการสอน
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold pt-2">
                    <span className="text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                      📅 วันที่เช็ค: {formatThaiDateDisplay(checkinFilter.date)}
                    </span>
                    {activeStudyUnit && (
                      <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                        📖 หน่วยการสอน: หน่วยที่ {activeStudyUnit.sequence || "-"}: {activeStudyUnit.title}
                      </span>
                    )}
                    {activeStudyUnit && (
                      <span className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-200/60 dark:border-blue-800/60">
                        📝 แบบทดสอบในหน่วยนี้:{" "}
                        {activeUnitQuizzes.length > 0
                          ? activeUnitQuizzes.map((quiz) => quiz.title).join(", ")
                          : "ยังไม่มีแบบทดสอบที่ผูกกับหน่วยนี้"}
                      </span>
                    )}

                    {studentRoster.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <label className="flex items-center gap-2 text-blue-700 dark:text-blue-300 cursor-pointer select-none border border-blue-200/60 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition-colors hover:bg-blue-100">
                          <input
                            type="checkbox"
                            className="accent-blue-500 w-4 h-4 rounded cursor-pointer"
                            checked={showOnlyInternship}
                            onChange={(e) => setShowOnlyInternship(e.target.checked)}
                          />
                          แสดงเฉพาะนักศึกษาทวิภาคี (DVE)
                        </label>
                        <label className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 cursor-pointer select-none border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs transition-colors hover:bg-emerald-100">
                          <input
                            type="checkbox"
                            className="accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                            checked={showOnlyAttended}
                            onChange={(e) => setShowOnlyAttended(e.target.checked)}
                          />
                          แสดงเฉพาะคนที่มีข้อมูลวันนี้ (เข้าเรียน/ส่งงาน)
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {studentRoster.length > 0 && (
                  <div className="flex gap-2 flex-wrap w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={handleBulkSaveAttendance}
                      disabled={savingAttendance}
                      className="px-6 py-3 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-zinc-300 disabled:to-zinc-400 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95 cursor-pointer border-0 flex items-center gap-1.5"
                    >
                      {savingAttendance ? "กำลังบันทึก..." : "✓ บันทึกเวลาเรียน & ผลงานนักศึกษา"}
                    </button>
                  </div>
                )}
              </div>

              {loadingRoster ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : studentRoster.length === 0 ? (
                <div className="text-center py-16 px-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[28px] bg-zinc-50/50 dark:bg-zinc-900/20 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Users size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-black">
                      ไม่พบข้อมูลนักเรียน
                    </p>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed max-w-[280px] mx-auto">
                      กรุณาเลือกวิชาเรียนและกดยืนยันเพื่อดึงบัญชีรายชื่อนักศึกษาในแผนกหรือห้องเรียนนี้
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedRoster.length === 0 ? (
                    <div className="text-center py-14 px-4 text-zinc-400 dark:text-zinc-500 font-bold text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-zinc-50/50 dark:bg-zinc-900/20">
                      ยังไม่มีนักเรียนที่ผ่านการนับเวลาเรียน (Auto Check-in) ในวันนี้
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View (hidden on mobile, visible on sm and up) */}
                      <div className="hidden sm:block overflow-x-auto rounded-[24px] border border-zinc-200/70 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 font-black text-[11px] uppercase tracking-wider">
                              <th className="py-4 px-3">รหัสประจำตัว</th>
                              <th className="py-4 px-3">ข้อมูลนักศึกษา / ประวัติงาน</th>
                              <th className="py-4 px-3 text-center">ห้องเรียน</th>
                              <th className="py-4 px-3 text-center">สถานะเวลาเรียน</th>
                              <th className="py-4 px-3 text-center">การส่งการบ้าน / งาน</th>
                              {activeUnitQuizzes.length > 0 ? (
                                activeUnitQuizzes.map((quiz) => (
                                  <th key={quiz.id} className="py-4 px-3 text-center" title={quiz.title}>
                                    <div className="truncate max-w-[150px] mx-auto">
                                      {quiz.quizType === "pretest" ? "ก่อนเรียน" : quiz.quizType === "posttest" ? "หลังเรียน" : quiz.title}
                                    </div>
                                  </th>
                                ))
                              ) : (
                                <th className="py-4 px-3 text-center text-zinc-400 font-normal">ไม่มีแบบทดสอบ</th>
                              )}
                              <th className="py-4 px-3 text-right">คะแนน / จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {displayedRoster.map((student) => {
                              const rec = attendanceRecords[student.id] || {
                                status: "Absent" as const,
                                assignmentStatus: "None" as const,
                                score: "",
                                studySeconds: 0,
                                createdAt: undefined,
                                updatedAt: undefined,
                              };
                              const hasPretest = activeUnitQuizzes.some(q => q.quizType === "pretest");
                              const hasPosttest = activeUnitQuizzes.some(q => q.quizType === "posttest");
                              return (
                                <tr
                                  key={student.id}
                                  className="text-zinc-700 dark:text-zinc-300 font-bold hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors"
                                >
                                  <td className="py-4 px-3 font-bold text-xs tracking-wider">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400">
                                      {maskSensitiveData(student.studentIdNum)}
                                    </span>
                                  </td>
                                  <td className="py-4 px-3">
                                    <div className="flex flex-col gap-2.5">
                                      <div className="flex items-center gap-3">
                                        <Link href={`/dashboard/profile/${student.id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                          {student.image ? (
                                            <img
                                              src={student.image}
                                              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-sm"
                                            />
                                          ) : (
                                            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black shadow-sm">
                                              {student.name?.charAt(0) || "U"}
                                            </div>
                                          )}
                                        </Link>
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                            {student.name}
                                          </span>
                                        </div>
                                      </div>

                                      {/* ประวัติการส่งงานที่ผ่านมา */}
                                      {studentSubmissionsById[student.id]?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1 bg-white/80 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
                                          {studentSubmissionsById[student.id].map((att, idx) => {
                                            const isDone = att.assignmentStatus === "Submitted";
                                            const isPending = att.assignmentStatus === "Pending";
                                            return (
                                              <div
                                                key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[9px] font-black shadow-2xs ${isDone
                                                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                                                  : isPending
                                                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-300"
                                                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
                                                  }`}
                                              >
                                                <span className="opacity-80">
                                                  บทที่ {att.unitSequence || "-"}:
                                                </span>
                                                <span className="truncate max-w-[80px]">
                                                  {att.unitTitle || "-"}
                                                </span>
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
                                  <td className="py-4 px-3 text-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                      {standardizeClassGroupName(student.classGroupId)}
                                    </span>
                                  </td>

                                  {/* Column 4: Attendance Status Badge */}
                                  <td className="py-4 px-3 text-center">
                                    {rec.status === "Studying" ? (
                                      <span className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl text-[10px] font-black border bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 animate-pulse shadow-xs">
                                        <span>กำลังเรียนอยู่ ⏱️</span>
                                        <span className="text-[9px] opacity-85 mt-0.5 font-bold">
                                          {Math.round((rec.studySeconds || 0) / 60)} / {activeStudyUnit?.studyMinutes || 0} นาที
                                        </span>
                                      </span>
                                    ) : (
                                      <span
                                        className={`inline-flex flex-col items-center px-3 py-1.5 rounded-xl text-[10px] font-black border shadow-xs ${rec.status === "Present"
                                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60"
                                          : rec.status === "Late"
                                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60"
                                            : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60"
                                          }`}
                                      >
                                        <span>
                                          {rec.status === "Present"
                                            ? "ตรงเวลา"
                                            : rec.status === "Late"
                                              ? "มาสาย"
                                              : "ยังไม่เข้าเรียน"}
                                        </span>
                                        {(rec.studySeconds || 0) > 0 && (
                                          <span className="text-[9px] opacity-75 mt-0.5 font-bold">
                                            ({Math.round((rec.studySeconds || 0) / 60)} นาที)
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {rec.createdAt && (rec.status !== "Absent") && (
                                      <div className="mt-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
                                        <Clock size={10} />
                                        เข้าเมื่อ: {new Date(rec.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                                      </div>
                                    )}
                                  </td>

                                  {/* Column 5: Assignment Status Badge */}
                                  <td className="py-4 px-3 text-center">
                                    <span
                                      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black border shadow-xs ${rec.assignmentStatus === "Submitted"
                                        ? "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/60"
                                        : rec.assignmentStatus === "Pending"
                                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/60"
                                          : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60"
                                        }`}
                                    >
                                      {rec.assignmentStatus === "Submitted"
                                        ? "ส่งแล้ว"
                                        : rec.assignmentStatus === "Pending"
                                          ? "ค้างส่ง"
                                          : "ไม่มีงาน"}
                                    </span>
                                  </td>

                                  {activeUnitQuizzes.length > 0 ? (
                                    activeUnitQuizzes.map((quiz) => {
                                      const quizSub = unitQuizResultsByStudent[student.id]?.find(s => s.quizId === quiz.id || s.quizType === quiz.quizType);
                                      return (
                                        <td key={quiz.id} className="py-4 px-3 text-center">
                                          {quizSub ? (
                                            <span className="inline-flex flex-col items-center">
                                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-black text-[10px] shadow-xs">
                                                {quizSub.score} / {quizSub.maxScore}
                                              </span>
                                              <span className="text-[9px] text-zinc-400 mt-0.5">
                                                {new Date(quizSub.submittedAt).toLocaleDateString("th-TH", {
                                                  day: "2-digit",
                                                  month: "short",
                                                })}
                                              </span>
                                            </span>
                                          ) : (
                                            <span className="text-zinc-400 text-[10px] italic font-bold">ยังไม่ทำ</span>
                                          )}
                                        </td>
                                      );
                                    })
                                  ) : (
                                    <td className="py-4 px-3 text-center">
                                      <span className="text-zinc-300 dark:text-zinc-600 text-[10px] italic">ไม่มีแบบทดสอบ</span>
                                    </td>
                                  )}

                                  {/* Column 6: Score / Edit Action */}
                                  <td className="py-4 px-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <div className="text-right pr-1">
                                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                                          คะแนน
                                        </span>
                                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                          {rec.score ? rec.score : "-"}
                                        </span>
                                      </div>

                                      {rec.imageUrl && (
                                        <a
                                          href={rec.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs"
                                        >
                                          <Eye size={12} />
                                          <span>ดูงาน</span>
                                        </a>
                                      )}

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
                                            unitTitle: rec.unitTitle || activeStudyUnit?.title || "",
                                            unitSequence:
                                              rec.unitSequence !== undefined && rec.unitSequence !== ""
                                                ? rec.unitSequence
                                                : activeStudyUnit?.sequence || "",
                                            studySeconds: rec.studySeconds || 0,
                                          });
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer border border-blue-200/60 dark:border-blue-800/60 shadow-xs"
                                      >
                                        <Edit2 size={12} />
                                        <span>แก้ไข</span>
                                      </button>

                                      <Popconfirm
                                        title={`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการเข้าเรียนของ ${student.name}?`}
                                        onConfirm={() =>
                                          handleDeleteIndividualAttendance(student.id)
                                        }
                                        okText="ใช่, ลบ"
                                        cancelText="ยกเลิก"
                                        okButtonProps={{ danger: true }}
                                      >
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer border border-rose-200/60 dark:border-rose-900/60 shadow-xs"
                                        >
                                          <Trash2 size={12} />
                                          <span>ลบ</span>
                                        </button>
                                      </Popconfirm>
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
                            status: "Absent" as const,
                            assignmentStatus: "None" as const,
                            score: "",
                            studySeconds: 0,
                          };
                          return (
                            <div
                              key={student.id}
                              onClick={() => setSelectedMobileStudent(student)}
                              className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-2xl space-y-3 shadow-xs cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-[0.99]"
                            >
                              {/* Student Info Row */}
                              <div className="flex items-center gap-3">
                                <Link href={`/dashboard/profile/${student.id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                  {student.image ? (
                                    <img
                                      src={student.image}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                      <User size={16} />
                                    </div>
                                  )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                    <span className="truncate">{student.name}</span>
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                    ID: {maskSensitiveData(student.studentIdNum)} • กลุ่ม:{" "}
                                    {standardizeClassGroupName(student.classGroupId)}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  {rec.status === "Studying" ? (
                                    <span className="flex h-3 w-3 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                  ) : rec.status === "Present" || rec.status === "Late" ? (
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
                                  ) : (
                                    <span className="text-zinc-300 dark:text-zinc-600">
                                      <ChevronRight size={18} />
                                    </span>
                                  )}
                                </div>
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

        {/* Tab 4: Timeline View for Submissions */}
        {activeTab === "timeline" && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            {/* Filter control box */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    1. เลือกรายวิชาเรียน
                  </label>
                  <Select
                    placeholder="-- เลือกวิชาเรียน --"
                    className="w-full h-11"
                    value={timelineFilter.subjectId || undefined}
                    onChange={(val) => {
                      setTimelineFilter((prev) => ({ ...prev, subjectId: val, classGroupId: "" }));
                      setTimelineData([]);
                    }}
                    options={filteredSubjects.map((s) => ({ label: `[${s.code}] ${s.name}`, value: s.id }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    2. เลือกห้องเรียน
                  </label>
                  <Select
                    placeholder="-- ทั้งหมด --"
                    className="w-full h-11"
                    value={timelineFilter.classGroupId || undefined}
                    onChange={(val) => {
                      setTimelineFilter((prev) => ({ ...prev, classGroupId: val }));
                    }}
                    options={[
                      { label: "ทั้งหมด", value: "" },
                      ...timelineClassGroups.map((c) => ({ label: c, value: c })),
                    ]}
                    disabled={!timelineFilter.subjectId}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                    3. ช่วงเวลา
                  </label>
                  <Select
                    className="w-full h-11"
                    value={timelineFilter.dateRange}
                    onChange={(val) => {
                      setTimelineFilter((prev) => ({ ...prev, dateRange: val }));
                    }}
                    options={[
                      { label: "7 วันล่าสุด", value: "7" },
                      { label: "30 วันล่าสุด", value: "30" },
                      { label: "90 วันล่าสุด", value: "90" },
                      { label: "ทั้งหมด", value: "365" },
                    ]}
                  />
                </div>

                <button
                  onClick={handleLoadTimelineData}
                  disabled={!timelineFilter.subjectId}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 text-white font-black rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  <Clock3 size={16} />
                  ดึงข้อมูล Timeline
                </button>
              </div>
            </div>

            {/* Timeline Display */}
            <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
              {loadingTimeline ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : timelineData.length === 0 ? (
                <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm font-bold border border-dashed dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
                  <Clock3 size={36} className="text-zinc-200 dark:text-zinc-800" />
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-black">
                      ไม่พบข้อมูลการส่งงาน
                    </p>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed">
                      กรุณาเลือกวิชาเรียนและกดยืนยันเพื่อดู Timeline การส่งงานของนักศึกษา
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {timelineData.map((group: any, groupIdx: number) => (
                    <div key={`${group.date}-${group.classGroupId}`} className="relative">
                      {/* Timeline date header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/20">
                            {new Date(group.date).getDate()}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                              {formatThaiDateDisplay(group.date)}
                            </h3>
                            <p className="text-xs font-bold text-zinc-500">
                              ห้องเรียน: {group.classGroupId}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 h-px bg-linear-to-r from-emerald-500/30 to-transparent" />
                      </div>

                      {/* Timeline items */}
                      <div className="ml-6 space-y-3 relative">
                        {/* Vertical line */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-px bg-linear-to-b from-emerald-500/30 to-transparent"
                          style={{ left: "-12px" }}
                        />

                        {group.submissions.map((submission: any, idx: number) => (
                          <motion.div
                            key={`${submission.studentId}-${submission.unitId}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative pl-6"
                          >
                            {/* Timeline dot */}
                            <div
                              className="absolute left-0 top-4 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-sm"
                              style={{ left: "-13px" }}
                            />

                            <div className="bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-xl p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    {submission.studentImage ? (
                                      <img
                                        src={submission.studentImage}
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
                                        <User size={14} />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-black text-sm text-zinc-900 dark:text-white">
                                        {submission.studentName}
                                      </p>
                                      <p className="text-[10px] text-zinc-500">
                                        ID: {maskSensitiveData(submission.studentIdNum)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black border border-blue-200 dark:border-blue-800/50">
                                      บทที่ {submission.unitSequence || "-"}:{" "}
                                      {submission.unitTitle || "-"}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black border ${submission.assignmentStatus === "Submitted"
                                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50"
                                        : submission.assignmentStatus === "Pending"
                                          ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                                          : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50"
                                        }`}
                                    >
                                      {submission.assignmentStatus === "Submitted"
                                        ? "ส่งแล้ว"
                                        : submission.assignmentStatus === "Pending"
                                          ? "ค้างส่ง"
                                          : "ไม่ส่ง"}
                                    </span>
                                    {submission.score && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black border border-blue-200 dark:border-blue-800/50">
                                        คะแนน: {submission.score}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {submission.imageUrl && (
                                  <a
                                    href={submission.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-black transition-all"
                                  >
                                    <Eye size={12} />
                                    ดูงาน
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
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
            {/* 1. Statistics Cards (Clickable Filters) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Total Department Students */}
              <button
                type="button"
                onClick={() => setInternshipStatusFilter("all")}
                className={`text-left bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border rounded-[32px] p-6 shadow-xl shadow-zinc-950/5 flex items-center gap-4 relative overflow-hidden group transition-all duration-300 bg-linear-to-br from-blue-500/5 via-white/80 to-indigo-500/5 dark:from-blue-950/20 dark:via-zinc-900/80 dark:to-indigo-950/20 cursor-pointer ${internshipStatusFilter === "all"
                    ? "ring-2 ring-blue-500 border-blue-500/50 shadow-blue-500/15 scale-[1.02]"
                    : "border-white/60 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-2xl hover:scale-[1.01]"
                  }`}
              >
                <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 text-blue-600 pointer-events-none">
                  <Users size={96} strokeWidth={1.5} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 group-hover:scale-105 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">
                      นักศึกษาในแผนกทั้งหมด
                    </span>
                    {internshipStatusFilter === "all" && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none">
                      {internshipStats.total}
                    </span>
                    <span className="text-xs font-black text-zinc-400">คน</span>
                  </div>
                </div>
              </button>

              {/* In-Internship Students */}
              <button
                type="button"
                onClick={() => setInternshipStatusFilter((prev) => (prev === "working" ? "all" : "working"))}
                className={`text-left bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border rounded-[32px] p-6 shadow-xl shadow-zinc-950/5 flex items-center gap-4 relative overflow-hidden group transition-all duration-300 bg-linear-to-br from-emerald-500/10 via-white/80 to-teal-500/10 dark:from-emerald-950/30 dark:via-zinc-900/80 dark:to-teal-950/30 cursor-pointer ${internshipStatusFilter === "working"
                    ? "ring-2 ring-emerald-500 border-emerald-500/50 shadow-emerald-500/20 scale-[1.02]"
                    : "border-emerald-500/20 dark:border-emerald-500/20 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-2xl hover:scale-[1.01]"
                  }`}
              >
                <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 text-emerald-600 pointer-events-none">
                  <Briefcase size={96} strokeWidth={1.5} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                      💼 กำลังออกฝึกงาน
                    </span>
                    {internshipStatusFilter === "working" && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                      {internshipStats.working}
                    </span>
                    <span className="text-xs font-black text-emerald-600/70 dark:text-emerald-400/70">คน</span>
                  </div>
                </div>
              </button>

              {/* Regular College Students */}
              <button
                type="button"
                onClick={() => setInternshipStatusFilter((prev) => (prev === "normal" ? "all" : "normal"))}
                className={`text-left bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border rounded-[32px] p-6 shadow-xl shadow-zinc-950/5 flex items-center gap-4 relative overflow-hidden group transition-all duration-300 bg-linear-to-br from-zinc-500/5 via-white/80 to-slate-500/5 dark:from-zinc-950/20 dark:via-zinc-900/80 dark:to-slate-950/20 cursor-pointer ${internshipStatusFilter === "normal"
                    ? "ring-2 ring-zinc-700 dark:ring-zinc-400 border-zinc-600 shadow-zinc-950/15 scale-[1.02]"
                    : "border-white/60 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-2xl hover:scale-[1.01]"
                  }`}
              >
                <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 text-zinc-500 pointer-events-none">
                  <BookOpen size={96} strokeWidth={1.5} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-zinc-700 to-slate-800 text-white flex items-center justify-center shadow-lg shadow-zinc-700/25 shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">
                      🏫 เรียนปกติที่วิทยาลัย
                    </span>
                    {internshipStatusFilter === "normal" && (
                      <span className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-300 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-black text-zinc-800 dark:text-zinc-100 leading-none">
                      {internshipStats.normal}
                    </span>
                    <span className="text-xs font-black text-zinc-400">คน</span>
                  </div>
                </div>
              </button>
            </div>

            {/* 2. Filter controls */}
            <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-7 shadow-xl shadow-zinc-950/5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    เลือกแผนกวิชา
                  </label>
                  <Select
                    placeholder="-- เลือกแผนกวิชา --"
                    className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                    value={internshipFilter.department || "all"}
                    onChange={(val) => {
                      setInternshipFilter((prev) => ({
                        ...prev,
                        department: val,
                        classGroupId: "",
                      }));
                      setInternshipStudents([]);
                    }}
                    options={[
                      { label: "🏢 แผนกทั้งหมด", value: "all" },
                      ...departments.map((d) => ({ label: d, value: d })),
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    เลือกห้องเรียน
                  </label>
                  <Select
                    placeholder="-- แสดงทั้งหมด --"
                    className="w-full [&>.ant-select-selector]:h-12! [&>.ant-select-selector]:rounded-2xl! [&>.ant-select-selector]:border-zinc-200/80! dark:[&>.ant-select-selector]:border-zinc-800! [&>.ant-select-selector]:bg-white/60! dark:[&>.ant-select-selector]:bg-zinc-950/60! [&>.ant-select-selector]:flex [&>.ant-select-selector]:items-center [&>.ant-select-selector]:shadow-xs"
                    value={internshipFilter.classGroupId || ""}
                    onChange={(val) => {
                      setInternshipFilter((prev) => ({ ...prev, classGroupId: val }));
                    }}
                    options={[
                      { label: "แสดงทั้งหมด", value: "" },
                      ...internshipClassGroups.map((c) => ({ label: c, value: c })),
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    ค้นหาชื่อ หรือ รหัสนักศึกษา
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 พิมพ์เพื่อค้นหา..."
                      className="w-full h-12 border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 rounded-2xl px-4 text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-xs"
                      value={internshipSearchQuery}
                      onChange={(e) => setInternshipSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Students Table / Card view */}
            <div className="bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/60 dark:border-zinc-800/80 rounded-[32px] p-5 sm:p-7 shadow-xl shadow-zinc-950/5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white leading-tight">
                      รายชื่อนักศึกษากับสถานะการออกฝึกงาน
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5">
                      จัดการกำหนดสถานะการออกฝึกงานหรือเรียนตามปกติของนักศึกษา
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {internshipStatusFilter !== "all" && (
                    <button
                      onClick={() => setInternshipStatusFilter("all")}
                      className="text-xs font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white underline cursor-pointer"
                    >
                      ล้างตัวกรองสถานะ
                    </button>
                  )}
                  <span className="text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3.5 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                    {internshipStatusFilter === "working"
                      ? `แสดงเฉพาะ: กำลังออกฝึกงาน (${displayedInternshipStudents.length} คน)`
                      : internshipStatusFilter === "normal"
                        ? `แสดงเฉพาะ: เรียนปกติ (${displayedInternshipStudents.length} คน)`
                        : `แสดงผล ${displayedInternshipStudents.length} คน`}
                  </span>
                </div>
              </div>

              {loadingInternship ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                </div>
              ) : internshipStudents.length === 0 ? (
                <div className="text-center py-16 px-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[28px] bg-zinc-50/50 dark:bg-zinc-900/20 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Users size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-800 dark:text-zinc-200 text-sm font-black">
                      ไม่พบข้อมูลนักศึกษาในแผนกที่เลือก
                    </p>
                    <p className="text-zinc-400 font-medium text-xs leading-relaxed max-w-[280px] mx-auto">
                      กรุณาเลือกแผนกวิชาด้านบน เพื่อทำการดึงข้อมูลรายชื่อนักศึกษารับการตั้งค่าฝึกงาน
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedInternshipStudents.length === 0 ? (
                    <div className="text-center py-14 px-4 text-zinc-400 dark:text-zinc-500 font-bold text-xs border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-zinc-50/50 dark:bg-zinc-900/20">
                      ไม่พบรายชื่อนักเรียนที่ตรงกับคำค้นหา
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto rounded-[24px] border border-zinc-200/70 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 font-black text-[11px] uppercase tracking-wider">
                              <th className="py-4 px-3 text-center w-20">รูปโปรไฟล์</th>
                              <th className="py-4 px-3">รหัสนักศึกษา</th>
                              <th className="py-4 px-3">ชื่อ - นามสกุล</th>
                              <th className="py-4 px-3 text-center">ห้องเรียน</th>
                              <th className="py-4 px-3 text-center">แผนกวิชา</th>
                              <th className="py-4 px-3 text-right">การจัดการสถานะ (ออกฝึกงาน)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {displayedInternshipStudents.map((student) => (
                              <tr
                                key={student.id}
                                className="text-zinc-700 dark:text-zinc-300 font-bold hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors"
                              >
                                <td className="py-4 px-3 text-center">
                                  <div className="flex justify-center">
                                    {student.image ? (
                                      <img
                                        src={student.image}
                                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-sm shrink-0 cursor-pointer hover:ring-emerald-500/50 transition-all" onClick={(e) => { e.stopPropagation(); setSelectedProfileImage(student.image); setIsProfileModalOpen(true); }}
                                      />
                                    ) : (
                                      <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                        {student.name?.charAt(0) || "U"}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-3 font-bold text-xs tracking-wider">
                                  <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400">
                                    {maskSensitiveData(student.studentIdNum)}
                                  </span>
                                </td>
                                <td className="py-4 px-3">
                                  <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                                    {student.name}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-center text-xs font-bold">
                                  <span className="bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg">
                                    {standardizeClassGroupName(student.classGroupId)}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                  <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                    {student.department}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleInternship(student)}
                                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-xs font-black border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${student.isInternship
                                        ? "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-transparent shadow-md shadow-emerald-500/25"
                                        : "bg-white/90 dark:bg-zinc-800/90 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80"
                                      }`}
                                  >
                                    {student.isInternship ? (
                                      <>
                                        <Briefcase size={14} className="mr-1.5 text-white stroke-2.5" />
                                        💼 ออกฝึกงานอยู่
                                      </>
                                    ) : (
                                      <>
                                        <BookOpen size={14} className="mr-1.5 text-zinc-500 dark:text-zinc-400 stroke-2.5" />
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
                      <div className="block sm:hidden space-y-3.5">
                        {displayedInternshipStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-[24px] space-y-4 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              {student.image ? (
                                <img
                                  src={student.image}
                                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-sm shrink-0 cursor-pointer hover:ring-emerald-500/50 transition-all" onClick={(e) => { e.stopPropagation(); setSelectedProfileImage(student.image); setIsProfileModalOpen(true); }}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                  {student.name?.charAt(0) || "U"}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm leading-tight">
                                  {student.name}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                  ID: {maskSensitiveData(student.studentIdNum)} • กลุ่ม:{" "}
                                  {standardizeClassGroupName(student.classGroupId)}
                                </p>
                                <p className="text-[9px] text-zinc-400 font-bold mt-0.5">
                                  {student.department}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                สถานะฝึกงาน:
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleInternship(student)}
                                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black border transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xs ${student.isInternship
                                    ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md shadow-emerald-500/25"
                                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
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
          <div className="fixed inset-0 z-9999 flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/65 dark:bg-zinc-950/80 backdrop-blur-md"
              onClick={() => setIsSubjectModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-zinc-900 sm:rounded-[32px] sm:border border-white/20 dark:border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-left flex flex-col overflow-hidden sm:max-w-4xl"
            >
              <form onSubmit={handleSaveSubject} className="flex flex-col flex-1 min-h-0 w-full">
                <div className="shrink-0 px-8 py-6 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100">
                        {subjectForm.id ? "แก้ไขข้อมูลรายวิชา" : "สร้างรายวิชาทวิภาคีใหม่"}
                      </h3>
                      <p className="text-xs text-emerald-700/70 dark:text-emerald-400/80 font-bold mt-1">
                        กรอกรายละเอียดวิชาและตั้งค่าชั่วโมงเรียน
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors relative z-10 border-0 bg-transparent"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        รหัสวิชา *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น 30201-2001"
                        required
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold"
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
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold cursor-pointer"
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
                      className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold"
                      value={subjectForm.name}
                      onChange={(e) =>
                        setSubjectForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  {/* ครูผู้สอน / อาจารย์ประจำวิชา */}
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-linear-to-r from-emerald-50/50 via-teal-50/30 to-blue-50/40 dark:from-emerald-950/20 dark:via-zinc-900/40 dark:to-blue-950/20 border border-emerald-200/70 dark:border-emerald-800/40 shadow-xs">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <User size={14} className="text-emerald-500" />
                        ครูผู้สอน / อาจารย์ประจำวิชา *
                      </label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/50">
                        มอบหมายครูผู้สอน
                      </span>
                    </div>
                    <select
                      required
                      className="w-full h-12 border-2 border-emerald-200/80 dark:border-emerald-800/80 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold cursor-pointer shadow-xs"
                      value={subjectForm.teacherId || (session?.user as any)?.id || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedTeacher = teachersList.find((t) => t.id === selectedId);
                        setSubjectForm((prev) => ({
                          ...prev,
                          teacherId: selectedId,
                          teacherName: selectedTeacher?.name || prev.teacherName,
                        }));
                      }}
                    >
                      <option value="">-- เลือกอาจารย์ผู้สอน --</option>
                      {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.department ? `(${t.department})` : ""} {t.id === (session?.user as any)?.id ? "★ [ฉัน]" : ""}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                      วิชานี้จะถูกจัดสรรให้นักศึกษาค้นหาและส่งงานภายใต้ชื่ออาจารย์ผู้สอนที่เลือก
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        แผนกวิชาที่ร่วมจัดการเรียนการสอน *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const depts = subjectForm.department
                            ? subjectForm.department
                              .split(",")
                              .map((d) => d.trim())
                              .filter(Boolean)
                            : [];
                          depts.unshift("");
                          setSubjectForm((prev) => ({ ...prev, department: depts.join(", ") }));
                        }}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border-0 cursor-pointer"
                      >
                        <Plus size={10} /> เพิ่มแผนกวิชา
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(() => {
                        const depts = subjectForm.department
                          ? subjectForm.department.split(",").map((d) => d.trim())
                          : [""];
                        return depts.map((currentDept, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <select
                              required
                              className="flex-1 h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold cursor-pointer"
                              value={currentDept}
                              onChange={(e) => {
                                const newDepts = [...depts];
                                newDepts[idx] = e.target.value;
                                setSubjectForm((prev) => ({
                                  ...prev,
                                  department: newDepts.filter((d) => d !== undefined).join(", "),
                                }));
                              }}
                            >
                              <option value="">-- เลือกแผนกวิชา --</option>
                              {DEPARTMENTS.filter(
                                (d) => d.startsWith("แผนกวิชา") || d.includes("การจัดการ"),
                              ).map((d) => (
                                <option
                                  key={d}
                                  value={d}
                                  disabled={depts.includes(d) && d !== currentDept}
                                >
                                  {d}
                                </option>
                              ))}
                            </select>

                            {depts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newDepts = depts.filter((_, i) => i !== idx);
                                  setSubjectForm((prev) => ({
                                    ...prev,
                                    department: newDepts.join(", "),
                                  }));
                                }}
                                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg border-0 cursor-pointer shrink-0 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                      <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                        ห้องเรียนที่อนุญาตให้เรียน
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubjectAllowedClassGroupRows((prev) => ["", ...prev])}
                        className="px-2.5 py-1 bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 border-0 cursor-pointer"
                      >
                        <Plus size={10} /> เพิ่มห้องเรียนที่อนุญาตให้เรียน
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subjectAllowedClassGroupRows.map((currentGroup, idx) => (
                        <div key={`${currentGroup}-${idx}`} className="flex gap-2 items-center">
                          <select
                            className="flex-1 h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent dark:bg-zinc-900 rounded-lg px-3 text-sm focus:outline-hidden dark:text-white disabled:opacity-50"
                            value={currentGroup || ""}
                            disabled={!subjectForm.department || loadingSubjectClassGroups}
                            onChange={(e) => {
                              const nextRows = [...subjectAllowedClassGroupRows];
                              nextRows[idx] = e.target.value;
                              syncSubjectAllowedClassGroupRows(nextRows);
                            }}
                          >
                            <option value="">
                              {subjectForm.department
                                ? "-- เลือกห้องเรียนจากฐานข้อมูล --"
                                : "-- เลือกแผนกวิชาก่อน --"}
                            </option>
                            {subjectClassGroupSelectOptions.map((group) => (
                              <option
                                key={group}
                                value={group}
                                disabled={
                                  subjectAllowedClassGroupRows.includes(group) &&
                                  group !== currentGroup
                                }
                              >
                                {group}
                              </option>
                            ))}
                          </select>

                          {subjectAllowedClassGroupRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextRows = subjectAllowedClassGroupRows.filter(
                                  (_, rowIdx) => rowIdx !== idx,
                                );
                                syncSubjectAllowedClassGroupRows(nextRows);
                              }}
                              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg border-0 cursor-pointer shrink-0 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-zinc-400 font-medium">
                      ดึงรายชื่อห้องเรียนจากฐานข้อมูลนักศึกษาในแผนกที่เลือก หากไม่เลือกห้องเรียน ระบบจะเปิดให้ห้องเรียนตามแผนกเข้าถึงตามปกติ
                    </p>
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
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold"
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
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold"
                        value={subjectForm.academicYear}
                        onChange={(e) =>
                          setSubjectForm((prev) => ({ ...prev, academicYear: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="col-span-12 relative overflow-hidden p-6 rounded-[24px] border border-white/60 dark:border-emerald-800/30 bg-linear-to-br from-emerald-50/80 via-white/50 to-teal-50/80 dark:from-emerald-950/40 dark:via-zinc-900/60 dark:to-teal-950/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(16,185,129,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] space-y-6">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-500 relative group">
                        <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-md group-hover:blur-lg transition-all opacity-0 group-hover:opacity-100"></div>
                        <Clock size={18} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                          ตั้งค่าเวลาเรียน
                        </h4>
                        <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500/70">
                          สำหรับคำนวณ % การเข้าเรียน
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                      {/* จำนวนสัปดาห์ */}
                      <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-black text-emerald-800/80 dark:text-emerald-300/80 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                          จำนวนสัปดาห์
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="เช่น 18"
                            className="w-full h-12 border-2 border-white dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-sm"
                            value={(subjectForm as any).totalWeeks || ""}
                            onChange={(e) => {
                              const w = e.target.value;
                              const d = (subjectForm as any).daysPerWeek;
                              const h = (subjectForm as any).hoursPerDay;
                              let th = (subjectForm as any).totalHours;
                              if (w && d && h) th = String(Number(w) * Number(d) * Number(h));
                              setSubjectForm((prev) => ({ ...prev, totalWeeks: w, totalHours: th }));
                            }}
                          />
                        </div>
                      </div>
                      {/* วัน / สัปดาห์ */}
                      <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-black text-emerald-800/80 dark:text-emerald-300/80 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                          วัน / สัปดาห์
                        </label>
                        <input
                          type="number"
                          placeholder="เช่น 1"
                          className="w-full h-12 border-2 border-white dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-sm"
                          value={(subjectForm as any).daysPerWeek || ""}
                          onChange={(e) => {
                            const d = e.target.value;
                            const w = (subjectForm as any).totalWeeks;
                            const h = (subjectForm as any).hoursPerDay;
                            let th = (subjectForm as any).totalHours;
                            if (w && d && h) th = String(Number(w) * Number(d) * Number(h));
                            setSubjectForm((prev) => ({ ...prev, daysPerWeek: d, totalHours: th }));
                          }}
                        />
                      </div>
                      {/* ชั่วโมง / วัน */}
                      <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-black text-emerald-800/80 dark:text-emerald-300/80 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                          ชั่วโมง / วัน
                        </label>
                        <input
                          type="number"
                          placeholder="เช่น 2"
                          className="w-full h-12 border-2 border-white dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-sm"
                          value={(subjectForm as any).hoursPerDay || ""}
                          onChange={(e) => {
                            const h = e.target.value;
                            const w = (subjectForm as any).totalWeeks;
                            const d = (subjectForm as any).daysPerWeek;
                            let th = (subjectForm as any).totalHours;
                            if (w && d && h) th = String(Number(w) * Number(d) * Number(h));
                            setSubjectForm((prev) => ({ ...prev, hoursPerDay: h, totalHours: th }));
                          }}
                        />
                      </div>
                      {/* เวลารวม (ชั่วโมง) * */}
                      <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-amber-500 animate-pulse" />
                          เวลารวม (ชั่วโมง) *
                        </label>
                        <div className="relative rounded-xl shadow-lg shadow-amber-500/10 group-focus-within:shadow-amber-500/20 transition-shadow">
                          <div className="absolute inset-0 bg-linear-to-r from-amber-400 to-orange-400 rounded-xl blur-[3px] opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                          <input
                            type="number"
                            required
                            placeholder="เช่น 36"
                            className="relative w-full h-12 border-2 border-amber-300/80 dark:border-amber-600/80 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60 backdrop-blur-md rounded-xl px-4 text-sm font-black focus:outline-hidden focus:border-amber-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-amber-500/30 transition-all text-amber-900 dark:text-amber-100"
                            value={(subjectForm as any).totalHours || ""}
                            onChange={(e) =>
                              setSubjectForm((prev) => ({ ...prev, totalHours: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 px-8 py-5 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <button
                    type="button"
                    onClick={() => setIsSubjectModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-sm font-black text-zinc-500 bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="relative overflow-hidden px-8 py-3 rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 border-0 cursor-pointer group ring-1 ring-white/20 inset-ring inset-ring-white/10 flex items-center gap-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-100 group-hover:text-white transition-colors" />
                      บันทึกข้อมูลรายวิชา
                    </span>
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
          <div className="fixed inset-0 z-9999 flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-md"
              onClick={() => setIsUnitModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] bg-white/95 dark:bg-zinc-900/95 sm:rounded-[36px] sm:border border-white/60 dark:border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.2)] text-left flex flex-col overflow-hidden sm:max-w-4xl backdrop-blur-3xl"
            >
              <form onSubmit={handleSaveUnit} className="flex flex-col flex-1 min-h-0 w-full">
                {/* Header */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white ring-2 ring-emerald-500/20">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
                        {unitForm.id ? "แก้ไขหน่วยการเรียนรู้" : "เพิ่มหน่วยการเรียนรู้ในรายวิชา"}
                      </h3>
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-bold mt-0.5">
                        {unitForm.id ? "แก้ไขและอัปเดตข้อมูลหน่วยเรียน" : "กรอกข้อมูลเพื่อสร้างหน่วยเรียนใหม่"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors border-0 cursor-pointer relative z-10"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                  {/* Card 1: ข้อมูลหลัก */}
                  <div className="relative overflow-hidden bg-linear-to-br from-emerald-500/5 via-white/80 to-teal-500/5 dark:from-emerald-950/20 dark:via-zinc-900/80 dark:to-teal-950/20 border border-emerald-500/20 dark:border-emerald-800/40 rounded-[28px] p-5 sm:p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-100/60 dark:border-emerald-800/40 pb-3.5">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-500" />
                        ข้อมูลหลักของหน่วยเรียน
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full text-[10px] font-black">
                        จำเป็น *
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 group">
                      <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                        หัวข้อหน่วยการเรียน *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น หน่วยที่ 1: แนะนำวิชา"
                        required
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-xs"
                        value={unitForm.title}
                        onChange={(e) =>
                          setUnitForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>

                    {/* Sequence & Duration fields with Color Separations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Sequence: Slate/Gray Card */}
                      <div className="bg-white/80 dark:bg-zinc-900/80 border-2 border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 shadow-xs group focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all">
                        <label className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          ลำดับที่ของหน่วย
                        </label>
                        <input
                          type="number"
                          required
                          className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl px-3 text-sm focus:outline-hidden dark:text-white font-black"
                          value={unitForm.sequence}
                          onChange={(e) =>
                            setUnitForm((prev) => ({ ...prev, sequence: Number(e.target.value) }))
                          }
                        />
                      </div>

                      {/* Total Minutes: Emerald/Teal Card */}
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col gap-2 shadow-xs group focus-within:border-emerald-500 transition-all">
                        <label className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
                          เวลารวมของหน่วย (นาที) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          required
                          placeholder="เช่น 60"
                          className="w-full h-10 border-2 border-emerald-300/80 dark:border-emerald-700/80 bg-white dark:bg-zinc-950 rounded-xl px-3 text-sm font-black text-emerald-700 dark:text-emerald-300 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/20 transition-all"
                          value={unitForm.totalMinutes}
                          onChange={(e) =>
                            setUnitForm((prev) => ({
                              ...prev,
                              totalMinutes: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {/* Minimum Study Minutes: Amber/Orange Card */}
                      <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col gap-2 shadow-xs group focus-within:border-amber-500 transition-all">
                        <label className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
                          เวลาขั้นต่ำที่เรียน (นาที)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          placeholder="เช่น 15"
                          className="w-full h-10 border-2 border-amber-300/80 dark:border-amber-700/80 bg-white dark:bg-zinc-950 rounded-xl px-3 text-sm font-black text-amber-700 dark:text-amber-300 focus:outline-hidden focus:ring-4 focus:ring-amber-500/20 transition-all"
                          value={unitForm.studyMinutes}
                          onChange={(e) =>
                            setUnitForm((prev) => ({
                              ...prev,
                              studyMinutes: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-200/80 dark:border-rose-800/60 rounded-2xl p-4 flex flex-col gap-2">
                      <label className="text-[11px] font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-rose-500" />
                        วันกำหนดส่งของหน่วยเรียน
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full h-11 border-2 border-rose-200 dark:border-rose-800/80 bg-white dark:bg-zinc-950 rounded-xl px-4 text-xs font-black text-rose-700 dark:text-rose-300 focus:outline-hidden focus:ring-4 focus:ring-rose-500/20 transition-all"
                        value={unitForm.dueDate}
                        onChange={(e) =>
                          setUnitForm((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                        <span>⚠️</span> ถ้าเรียนครบเวลาแต่เกินวันนี้ ระบบจะบันทึกเป็น "สาย" อัตโนมัติ
                      </p>
                    </div>
                  </div>

                  {/* Card 2: รายละเอียด (Description) */}
                  <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 space-y-3 shadow-sm">
                    <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                      <FileText size={16} className="text-emerald-500" />
                      คำอธิบายเนื้อหาหน่วยเรียนย่อ (Description)
                    </label>
                    <textarea
                      placeholder="เขียนรายละเอียด คำอธิบายเนื้อหา หรือใบงานประกอบหน่วยการเรียนรู้ เพื่อให้นักเรียนเข้าใจขอบเขตการเรียน..."
                      rows={5}
                      className="w-full border-2 border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-2xl p-4 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:text-white placeholder:text-zinc-400 leading-relaxed font-medium transition-all"
                      value={unitForm.content}
                      onChange={(e) =>
                        setUnitForm((prev) => ({ ...prev, content: e.target.value }))
                      }
                    />
                  </div>

                  {/* Card 3: 📂 ไฟล์แนบและสื่อการสอน */}
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-900/40 rounded-[28px] p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-3.5">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <FolderOpen size={16} className="text-emerald-500" />
                        ไฟล์เอกสารดาวน์โหลด (PDF, Word, Powerpoint)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setUnitForm((prev) => ({
                            ...prev,
                            files: [{ name: "", url: "", type: "file" }, ...prev.files],
                          }))
                        }
                        className="px-3.5 py-1.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-95 border-0 shrink-0"
                      >
                        <Plus size={12} className="stroke-3" /> เพิ่มไฟล์แนบ
                      </button>
                    </div>

                    {unitForm.files.filter(
                      (f) =>
                        f.type === "file" ||
                        f.url?.startsWith("/uploads/") ||
                        f.url?.startsWith("/api/media/"),
                    ).length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-emerald-200/70 dark:border-emerald-800/50 rounded-2xl text-emerald-700/70 dark:text-emerald-400/60 text-xs font-bold bg-white/40 dark:bg-zinc-950/20">
                        ยังไม่มีไฟล์แนบในหน่วยเรียนนี้
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unitForm.files.map((file, idx) => {
                          const isDirectFile =
                            file.type === "file" ||
                            file.url?.startsWith("/uploads/") ||
                            file.url?.startsWith("/api/media/");
                          if (!isDirectFile) return null;
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="ชื่อไฟล์ เช่น เอกสารใบงาน 1"
                                  required
                                  className="w-full h-10 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl px-3 text-xs focus:outline-hidden focus:border-emerald-500 dark:text-white font-bold"
                                  value={file.name}
                                  onChange={(e) => {
                                    const newFiles = [...unitForm.files];
                                    newFiles[idx].name = e.target.value;
                                    setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                  }}
                                />
                              </div>

                              <div className="flex-1 flex gap-2 items-center">
                                <div className="relative flex-1 min-w-0">
                                  <input
                                    type="url"
                                    placeholder="ยังไม่ได้อัปโหลดไฟล์..."
                                    required
                                    readOnly
                                    className="w-full h-10 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl pl-3 pr-24 text-xs focus:outline-hidden text-zinc-500 dark:text-zinc-400 cursor-not-allowed truncate font-medium"
                                    value={file.url}
                                  />
                                  <label className="absolute right-1.5 top-1.5 h-7 px-3 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer transition-colors shadow-xs text-[10px] font-black">
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
                                        <Loader2 size={10} className="animate-spin text-white" />
                                        <span>{fileUploading[idx].progress}%</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Upload size={10} />
                                        <span>อัปโหลด</span>
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
                                  className="w-10 h-10 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card 4: 🔗 ลิงก์และแหล่งข้อมูลภายนอก */}
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-900/40 rounded-[28px] p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-blue-100 dark:border-blue-900/40 pb-3.5">
                      <span className="text-xs font-black text-blue-800 dark:text-blue-300 flex items-center gap-2">
                        <ExternalLink size={16} className="text-blue-500" />
                        ลิงก์ภายนอก / แหล่งเรียนรู้ (เช่น YouTube, Slides)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setUnitForm((prev) => ({
                            ...prev,
                            files: [{ name: "", url: "", type: "link" }, ...prev.files],
                          }))
                        }
                        className="px-3.5 py-1.5 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 border-0 shrink-0"
                      >
                        <Plus size={12} className="stroke-3" /> เพิ่มลิงก์ภายนอก
                      </button>
                    </div>

                    {unitForm.files.filter(
                      (f) =>
                        f.type === "link" ||
                        (!f.type &&
                          !f.url?.startsWith("/uploads/") &&
                          !f.url?.startsWith("/api/media/")),
                    ).length === 0 ? (
                      <div className="text-center py-6 border-2 border-dashed border-blue-200/70 dark:border-blue-800/50 rounded-2xl text-blue-700/70 dark:text-blue-400/60 text-xs font-bold bg-white/40 dark:bg-zinc-950/20">
                        ยังไม่มีลิงก์ภายนอกในหน่วยเรียนนี้
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unitForm.files.map((file, idx) => {
                          const isDirectFile =
                            file.type === "file" ||
                            file.url?.startsWith("/uploads/") ||
                            file.url?.startsWith("/api/media/");
                          if (isDirectFile) return null;
                          return (
                            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-all hover:border-blue-300 dark:hover:border-blue-700">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="ชื่อลิงก์ เช่น สไลด์การสอน หรือ วิดีโอแนะนำ"
                                  required
                                  className="w-full h-10 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl px-3 text-xs focus:outline-hidden focus:border-blue-500 dark:text-white font-bold"
                                  value={file.name}
                                  onChange={(e) => {
                                    const newFiles = [...unitForm.files];
                                    newFiles[idx].name = e.target.value;
                                    setUnitForm((prev) => ({ ...prev, files: newFiles }));
                                  }}
                                />
                              </div>

                              <div className="flex-1 flex gap-2 items-center">
                                <input
                                  type="url"
                                  placeholder="วางลิงก์ เช่น https://drive.google.com/..."
                                  required
                                  className="flex-1 h-10 border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl px-3 text-xs focus:outline-hidden focus:border-blue-500 dark:text-white truncate font-medium"
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
                                  className="w-10 h-10 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 sm:px-8 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 border-t border-zinc-200/60 dark:border-zinc-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-sm font-black text-zinc-500 bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="relative overflow-hidden px-8 py-3 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 border-0 cursor-pointer group ring-1 ring-white/20 inset-ring inset-ring-white/10 flex items-center gap-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-100 group-hover:text-white transition-colors" />
                      บันทึกหน่วยเรียน
                    </span>
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
          <div className="fixed inset-0 z-9999 flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/60 dark:bg-zinc-950/80 backdrop-blur-md"
              onClick={() => setIsQuizModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] bg-white/95 dark:bg-zinc-900/95 sm:rounded-[36px] sm:border border-white/60 dark:border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.2)] text-left flex flex-col overflow-hidden sm:max-w-6xl backdrop-blur-3xl"
            >
              <form onSubmit={handleSaveQuiz} className="flex flex-col flex-1 min-h-0 w-full">
                {/* Header */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center text-white ring-2 ring-emerald-500/20">
                      <Award size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-50 leading-tight">
                        {quizForm.id ? "แก้ไขแบบทดสอบ" : "สร้างแบบทดสอบ (Test Builder)"}
                      </h3>
                      <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-bold mt-0.5">
                        กำหนดข้อมูลทั่วไป เงื่อนไขการสอบ และชุดคำถามสำหรับผู้เรียน
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors border-0 cursor-pointer relative z-10"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto min-h-0 bg-zinc-50/40 dark:bg-zinc-950/40 custom-scrollbar">
                  {/* Section 1: ข้อมูลทั่วไป (General Information) */}
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={16} className="text-emerald-500" />
                        ข้อมูลทั่วไป (General Info)
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 group">
                      <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors">
                        หัวข้อแบบทดสอบ *
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น แบบทดสอบหลังเรียนหน่วยที่ 1"
                        required
                        className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-xs"
                        value={quizForm.title}
                        onChange={(e) =>
                          setQuizForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          ผูกกับหน่วยการเรียน (Link to Unit)
                        </label>
                        <select
                          className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold cursor-pointer shadow-xs"
                          value={quizForm.unitId}
                          onChange={(e) =>
                            setQuizForm((prev) => ({ ...prev, unitId: e.target.value }))
                          }
                        >
                          <option
                            value=""
                            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                          >
                            -- ไม่ผูกกับหน่วยใด (อิสระ) --
                          </option>
                          {units.map((u: any, idx: number) => (
                            <option
                              key={u.id || idx}
                              value={u.id || u._id?.toString()}
                              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                            >
                              หน่วยที่ {u.sequence || idx + 1}: {u.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          ประเภทของแบบทดสอบ / การวัดผล
                        </label>
                        <select
                          className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold cursor-pointer shadow-xs"
                          value={quizForm.quizType || "general"}
                          onChange={(e) =>
                            setQuizForm((prev) => ({ ...prev, quizType: e.target.value }))
                          }
                        >
                          <option value="general">แบบทดสอบทั่วไป / เก็บคะแนน</option>
                          <option value="pretest">แบบทดสอบก่อนเรียน (Pre-test)</option>
                          <option value="posttest">แบบทดสอบหลังเรียน (Post-test)</option>
                          <option value="midterm">สอบกลางภาค (Midterm)</option>
                          <option value="final">สอบปลายภาค (Final)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: การตั้งค่าระบบ (Settings) */}
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                        <Settings2 size={16} className="text-emerald-500" />
                        การตั้งค่าระบบ (Settings)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          รูปแบบทางเทคนิค (Platform)
                        </label>
                        <div className="flex border-2 border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden p-1 bg-zinc-100/70 dark:bg-zinc-950 gap-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => setQuizForm((prev) => ({ ...prev, isBuiltIn: false }))}
                            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${!quizForm.isBuiltIn
                                ? "bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                          >
                            ลิงก์ภายนอก (Google Form)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuizForm((prev) => ({ ...prev, isBuiltIn: true }))}
                            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer ${quizForm.isBuiltIn
                                ? "bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                              }`}
                          >
                            สร้างในแอป (Built-In)
                          </button>
                        </div>
                      </div>

                      {quizForm.isBuiltIn ? (
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-2.5 text-xs font-black text-zinc-700 dark:text-zinc-300 cursor-pointer select-none bg-white dark:bg-zinc-950 px-4 h-13 rounded-2xl border-2 border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-emerald-400/50 transition-all">
                            <input
                              type="checkbox"
                              className="accent-emerald-500 w-4 h-4 rounded"
                              checked={!!quizForm.isShuffle}
                              onChange={(e) =>
                                setQuizForm((prev) => ({ ...prev, isShuffle: e.target.checked }))
                              }
                            />
                            <span>🔀 สลับลำดับข้อคำถาม (Shuffle)</span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 animate-fade-in">
                          <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                            ลิงก์ Google Form สอบออนไลน์ *
                          </label>
                          <input
                            type="url"
                            placeholder="https://docs.google.com/forms/d/..."
                            required={!quizForm.isBuiltIn}
                            className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white font-bold shadow-xs"
                            value={quizForm.googleFormUrl}
                            onChange={(e) =>
                              setQuizForm((prev) => ({ ...prev, googleFormUrl: e.target.value }))
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          วันเริ่มเปิดให้ทำแบบทดสอบ (Start Date)
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-xs font-bold focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white shadow-xs"
                          value={quizForm.startDate}
                          onChange={(e) =>
                            setQuizForm((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          วันหมดเขตส่งกระดาษคำตอบ (Deadline)
                        </label>
                        <input
                          type="datetime-local"
                          className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-xs font-bold focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white shadow-xs"
                          value={quizForm.deadline}
                          onChange={(e) =>
                            setQuizForm((prev) => ({ ...prev, deadline: e.target.value }))
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          คะแนนที่ใช้จริง (หารคะแนน / Scale Score)
                        </label>
                        <input
                          type="number"
                          placeholder="ปล่อยว่างหากใช้คะแนนดิบ"
                          className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm font-bold focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 transition-all dark:text-white shadow-xs"
                          value={quizForm.maxScaleScore === null ? "" : quizForm.maxScaleScore}
                          onChange={(e) =>
                            setQuizForm((prev) => ({
                              ...prev,
                              maxScaleScore: e.target.value ? Number(e.target.value) : null,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: จัดการคำถามแบบทดสอบ (Quiz Content) */}
                  {quizForm.isBuiltIn && (
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-sm space-y-5 animate-fade-in flex flex-col">
                      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3.5">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                          <ListChecks size={16} className="text-emerald-500" />
                          จัดการคำถามแบบทดสอบ (Quiz Content)
                        </span>
                      </div>

                      {/* Reusable Templates Box */}
                      <div className="p-5 bg-linear-to-br from-emerald-500/5 via-white/80 to-teal-500/5 dark:from-emerald-950/20 dark:via-zinc-900/80 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl space-y-4 shadow-xs">
                        <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                          <Save size={15} className="text-emerald-500" /> การจัดการแม่แบบแบบทดสอบเพื่อใช้งานซ้ำ
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-8">
                            {loadingTemplates ? (
                              <div className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                                <Loader2 size={12} className="animate-spin text-emerald-500" />
                                กำลังโหลดแม่แบบคำถาม...
                              </div>
                            ) : templates.length === 0 ? (
                              <div className="text-xs text-zinc-400 font-bold italic">
                                ยังไม่มีการบันทึกแม่แบบคำถามใดๆ
                                คุณครูสามารถสร้างข้อสอบด้านล่างแล้วกด "บันทึกแม่แบบคำถามนี้" ได้ครับ
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                  โหลดข้อมูลจากแม่แบบที่เคยบันทึกไว้
                                </label>
                                <select
                                  className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl px-3 text-xs focus:outline-hidden dark:text-white font-bold shadow-xs cursor-pointer"
                                  defaultValue=""
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val) return;
                                    const selectedTpl = templates.find((t) => t.id === val);
                                    if (selectedTpl) {
                                      setQuizForm((prev) => ({
                                        ...prev,
                                        title: prev.title || selectedTpl.title,
                                        questions: JSON.parse(
                                          JSON.stringify(selectedTpl.questions),
                                        ),
                                      }));
                                      message.success(
                                        `โหลดข้อมูลแม่แบบ "${selectedTpl.title}" เรียบร้อยแล้ว!`,
                                      );
                                      e.target.value = ""; // reset
                                    }
                                  }}
                                >
                                  <option value="">-- เลือกแม่แบบที่จะโหลดใช้ --</option>
                                  {templates.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.title} ({t.questions?.length || 0} ข้อ)
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="sm:col-span-4 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveAsTemplate}
                              disabled={!quizForm.questions || quizForm.questions.length === 0}
                              className="w-full h-11 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-zinc-200 disabled:to-zinc-300 dark:disabled:from-zinc-800 dark:disabled:to-zinc-800 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 border-0 disabled:opacity-50"
                            >
                              บันทึกแม่แบบคำถามนี้
                            </button>
                          </div>
                        </div>

                        {/* List of stored templates so they can be deleted! */}
                        {templates.length > 0 && (
                          <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3 mt-3 space-y-1.5">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                              แม่แบบของฉันทั้งหมด (สามารถลบออกได้):
                            </span>
                            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1">
                              {templates.map((tpl) => (
                                <div
                                  key={tpl.id}
                                  className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-[10px] font-black text-zinc-700 dark:text-zinc-300 shadow-xs"
                                >
                                  <span>
                                    {tpl.title} ({tpl.questions?.length || 0} ข้อ)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm("ลบแม่แบบคำถามนี้อย่างถาวร?")) {
                                        handleDeleteTemplate(tpl.id);
                                      }
                                    }}
                                    className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded border-0 bg-transparent cursor-pointer text-zinc-400 transition-colors"
                                    title="ลบแม่แบบคำถามนี้"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                            รายการโจทย์ข้อคำถาม ({quizForm.questions?.length || 0} ข้อ)
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowQuizAnswers(!showQuizAnswers)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all border cursor-pointer flex items-center gap-1 shadow-xs ${showQuizAnswers
                                ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                              }`}
                          >
                            {showQuizAnswers ? <EyeOff size={11} /> : <Eye size={11} />}
                            {showQuizAnswers ? "ปิดเฉลย" : "แสดงเฉลย"}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="px-3.5 py-2 bg-blue-50/80 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/60 cursor-pointer shadow-xs"
                            title="ดาวน์โหลดไฟล์ต้นแบบ (Excel Template)"
                          >
                            <Download size={14} className="text-blue-500" /> โหลด Template
                          </button>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImportExcel}
                            accept=".xlsx, .xls, .csv, .ods"
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-amber-50/80 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-800/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800/60 cursor-pointer shadow-xs"
                            title="นำเข้าจากไฟล์ Excel"
                          >
                            <Upload size={14} className="text-amber-500" /> Import Excel
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const newQ = {
                                id: Date.now().toString(),
                                type: "multiple_choice",
                                text: "",
                                options: ["", "", "", ""],
                                correctAnswer: "",
                                correctAnswerIndex: null as number | null,
                                points: 1,
                              };
                              setQuizForm((prev) => ({
                                ...prev,
                                questions: [...(prev.questions || []), newQ],
                              }));
                            }}
                            className="px-4 py-2 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border-0 cursor-pointer shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95"
                          >
                            <Plus size={14} className="stroke-3" /> เพิ่มโจทย์คำถาม
                          </button>
                        </div>
                      </div>

                      {!quizForm.questions || quizForm.questions.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-xs font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20">
                          ยังไม่มีการสร้างคำถามย่อย กรุณากดปุ่ม "เพิ่มโจทย์คำถาม" ด้านบน
                        </div>
                      ) : (
                        <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
                          {[...(quizForm.questions || [])].reverse().map((q, reverseIdx) => {
                            const qIdx = quizForm.questions.length - 1 - reverseIdx;
                            return (
                              <div
                                key={q.id}
                                className="p-5 sm:p-6 bg-white dark:bg-zinc-900/90 shadow-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-[26px] space-y-4 relative transition-all hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 group"
                              >
                                <div className="flex justify-between items-center gap-2">
                                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1 rounded-xl">
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
                                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg transition-colors border border-rose-200/60 dark:border-rose-900/60 cursor-pointer text-[10px] font-black"
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
                                    className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 dark:focus:border-emerald-500 transition-all dark:text-white font-bold shadow-xs"
                                  />

                                  <div className="flex flex-col gap-1 mt-2">
                                    <div className="flex items-center gap-2">
                                      {q.image ? (
                                        <div className="relative">
                                          <img src={q.image} alt="Question" className="h-20 w-auto object-cover rounded-lg border border-zinc-200 dark:border-zinc-800" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updated = [...quizForm.questions];
                                              updated[qIdx].image = "";
                                              setQuizForm((prev) => ({ ...prev, questions: updated }));
                                            }}
                                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="flex items-center justify-center h-9 px-3.5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-fit">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;

                                              message.loading({ content: "กำลังอัปโหลดรูปภาพ...", key: "uploadingImage" });
                                              const { secure_url } = await uploadFile(file, "dve_quiz");
                                              if (secure_url) {
                                                const updated = [...quizForm.questions];
                                                updated[qIdx].image = secure_url;
                                                setQuizForm((prev) => ({ ...prev, questions: updated }));
                                                message.success({ content: "อัปโหลดรูปภาพสำเร็จ!", key: "uploadingImage" });
                                              } else {
                                                message.error({ content: "เกิดข้อผิดพลาดในการอัปโหลด", key: "uploadingImage" });
                                              }
                                            }}
                                          />
                                          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                            <ImageIcon size={14} /> เพิ่มรูปภาพประกอบ (ตัวเลือก)
                                          </div>
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                        ประเภทคำตอบ
                                      </label>
                                      <select
                                        value={q.type}
                                        onChange={(e) => {
                                          const updated = [...quizForm.questions];
                                          updated[qIdx].type = e.target.value;
                                          if (e.target.value === "checkboxes") {
                                            updated[qIdx].options = updated[qIdx].options || [
                                              "",
                                              "",
                                              "",
                                              "",
                                            ];
                                            updated[qIdx].correctAnswer = [];
                                            updated[qIdx].correctAnswerIndex = [];
                                          } else if (e.target.value === "multiple_choice") {
                                            updated[qIdx].options = updated[qIdx].options || [
                                              "",
                                              "",
                                              "",
                                              "",
                                            ];
                                            updated[qIdx].correctAnswer = "";
                                            updated[qIdx].correctAnswerIndex = null;
                                          } else {
                                            delete updated[qIdx].options;
                                            updated[qIdx].correctAnswer = "";
                                          }
                                          setQuizForm((prev) => ({ ...prev, questions: updated }));
                                        }}
                                        className="h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-3 text-xs focus:outline-hidden focus:border-emerald-500 transition-all dark:text-white font-bold shadow-xs cursor-pointer"
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
                                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
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
                                        className="h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl px-3 text-xs focus:outline-hidden focus:border-emerald-500 transition-all dark:text-white font-bold shadow-xs"
                                      />
                                    </div>
                                  </div>

                                  {(q.type === "multiple_choice" || q.type === "checkboxes") && (
                                    <div className="space-y-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                      <label className="text-[10px] font-black text-zinc-500 block uppercase tracking-wider">
                                        ป้อนตัวเลือกคำตอบ (และกดยืนยันปุ่มวิทยุ/กล่องเพื่อระบุเฉลยที่ถูกต้อง)
                                      </label>
                                      <div className="space-y-2">
                                        {(q.options || []).map((opt: string, optIdx: number) => (
                                          <div key={optIdx} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all">
                                            {q.type === "multiple_choice" ? (
                                              <input
                                                type="radio"
                                                name={`q_correct_${q.id}`}
                                                checked={showQuizAnswers ? (opt === "" ? q.correctAnswerIndex === optIdx : q.correctAnswer === opt) : false}
                                                onChange={() => {
                                                  if (!showQuizAnswers) setShowQuizAnswers(true);
                                                  const updated = [...quizForm.questions];
                                                  updated[qIdx].correctAnswer = opt;
                                                  updated[qIdx].correctAnswerIndex = optIdx;
                                                  setQuizForm((prev) => ({
                                                    ...prev,
                                                    questions: updated,
                                                  }));
                                                }}
                                                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                              />
                                            ) : (
                                              <input
                                                type="checkbox"
                                                checked={
                                                  showQuizAnswers ? (
                                                    opt === ""
                                                      ? (Array.isArray(q.correctAnswerIndex) && q.correctAnswerIndex.includes(optIdx))
                                                      : (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))
                                                  ) : false
                                                }
                                                onChange={(e) => {
                                                  if (!showQuizAnswers) setShowQuizAnswers(true);
                                                  const updated = [...quizForm.questions];
                                                  let currentArr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
                                                  let currentIdxArr = Array.isArray(q.correctAnswerIndex) ? [...q.correctAnswerIndex] : [];
                                                  if (e.target.checked) {
                                                    if (opt !== "") currentArr.push(opt);
                                                    currentIdxArr.push(optIdx);
                                                  } else {
                                                    currentArr = currentArr.filter((v: string) => v !== opt);
                                                    currentIdxArr = currentIdxArr.filter((v: number) => v !== optIdx);
                                                  }
                                                  updated[qIdx].correctAnswer = currentArr;
                                                  updated[qIdx].correctAnswerIndex = currentIdxArr;
                                                  setQuizForm((prev) => ({
                                                    ...prev,
                                                    questions: updated,
                                                  }));
                                                }}
                                                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                              />
                                            )}
                                            <input
                                              type="text"
                                              placeholder=""
                                              required
                                              value={opt}
                                              onChange={(e) => {
                                                const updated = [...quizForm.questions];
                                                const oldVal = updated[qIdx].options[optIdx];
                                                updated[qIdx].options[optIdx] = e.target.value;

                                                if (q.type === "multiple_choice") {
                                                  if (oldVal === "" && q.correctAnswer === "" && q.correctAnswerIndex === optIdx) {
                                                    updated[qIdx].correctAnswer = e.target.value;
                                                  } else if (oldVal !== "" && q.correctAnswer === oldVal) {
                                                    updated[qIdx].correctAnswer = e.target.value;
                                                  }
                                                } else if (q.type === "checkboxes") {
                                                  if (oldVal === "" && Array.isArray(q.correctAnswerIndex) && q.correctAnswerIndex.includes(optIdx)) {
                                                    if (!Array.isArray(updated[qIdx].correctAnswer)) updated[qIdx].correctAnswer = [];
                                                    updated[qIdx].correctAnswer.push(e.target.value);
                                                  } else if (oldVal !== "" && Array.isArray(q.correctAnswer)) {
                                                    updated[qIdx].correctAnswer = q.correctAnswer.map((v: string) => v === oldVal ? e.target.value : v);
                                                  }
                                                }
                                                setQuizForm((prev) => ({
                                                  ...prev,
                                                  questions: updated,
                                                }));
                                              }}
                                              className="flex-1 h-10 border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 rounded-xl px-3 text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white font-bold"
                                            />
                                            {showQuizAnswers && (
                                              (q.type === "multiple_choice" && q.correctAnswer === opt) ||
                                              (q.type === "checkboxes" && Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt))
                                            ) && (
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                  ✅ เฉลย
                                                </span>
                                              )}
                                            <button
                                              type="button"
                                              disabled={(q.options || []).length <= 2}
                                              onClick={() => {
                                                const updated = [...quizForm.questions];
                                                const valToRemove = updated[qIdx].options[optIdx];
                                                updated[qIdx].options = updated[qIdx].options.filter(
                                                  (_: string, idx: number) => idx !== optIdx,
                                                );
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
                                              className="text-rose-500 hover:text-rose-700 p-1 border-0 bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...quizForm.questions];
                                          updated[qIdx].options.push("");
                                          setQuizForm((prev) => ({ ...prev, questions: updated }));
                                        }}
                                        className="mt-3 w-full h-10 border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                                      >
                                        <Plus size={14} className="stroke-3" /> เพิ่มช่องตัวเลือกใหม่
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 sm:px-8 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md flex justify-end gap-3 border-t border-zinc-200/60 dark:border-zinc-800/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="px-6 py-3 rounded-xl text-sm font-black text-zinc-500 bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="relative overflow-hidden px-8 py-3 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 border-0 cursor-pointer group ring-1 ring-white/20 inset-ring inset-ring-white/10 flex items-center gap-2"
                  >
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-100 group-hover:text-white transition-colors" />
                      บันทึกข้อมูลแบบทดสอบ
                    </span>
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
          <div className="fixed inset-0 z-9999 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 dark:bg-zinc-950/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full h-full bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-2xl overflow-hidden text-left flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-start gap-4 bg-blue-500/5 shrink-0">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye size={18} className="text-blue-500" />
                    งานที่นักเรียนส่ง: {submissionsQuizTitle}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${submissionsIsBuiltIn ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"}`}
                    >
                      {submissionsIsBuiltIn ? "🧠 แบบทดสอบในระบบ" : "🔗 Google Form / งานภายนอก"}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      รวม {submissions.length} คน
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmissionsModalOpen(false);
                    setSubmissionsPreviewUrl(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
                {loadingSubmissions ? (
                  <div className="flex flex-col justify-center items-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-zinc-400 font-bold">
                      กำลังโหลดข้อมูลงานที่ส่ง...
                    </span>
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
                        const grp = standardizeClassGroupName(sub.classGroupId) || "ไม่ระบุห้อง";
                        acc[grp] = [...(acc[grp] || []), sub];
                        return acc;
                      }, {}),
                    ).map(([groupId, groupSubs]) => (
                      <div key={groupId} className="space-y-2">
                        <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b dark:border-zinc-800 pb-2 flex items-center gap-2">
                          <Users size={12} />
                          ห้องเรียน: {groupId}
                          <span className="text-zinc-400 font-bold normal-case tracking-normal">
                            ({groupSubs.length} คน)
                          </span>
                        </h4>
                        <div className="overflow-x-auto border dark:border-zinc-800 rounded-xl">
                          <table className="w-full text-xs border-collapse whitespace-nowrap">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">ชื่อนักศึกษา</th>
                                {submissionsIsBuiltIn && <th className="p-3 text-center">คะแนน</th>}
                                <th className="p-3 text-center">ไฟล์/เอกสารที่แนบ</th>
                                <th className="p-3 text-center">วันที่ส่ง</th>
                                {submissionsIsBuiltIn && (
                                  <th className="p-3 text-right">ตรวจคำตอบ</th>
                                )}
                                <th className="p-3 text-center">จัดการ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                              {groupSubs.map((sub: any, idx: number) => {
                                const isExpanded = expandedSubmissionId === sub.id;
                                return (
                                  <React.Fragment key={sub.id}>
                                    <tr className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                                      <td className="p-3 text-zinc-400 text-[10px] tabular-nums">
                                        {idx + 1}
                                      </td>
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          {sub.image ? (
                                            <img
                                              src={sub.image}
                                              alt={sub.studentName}
                                              className="w-6 h-6 rounded-full object-cover shrink-0 border dark:border-zinc-700"
                                            />
                                          ) : (
                                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-black shrink-0">
                                              {(sub.studentName || "?").charAt(0)}
                                            </div>
                                          )}
                                          <div className="flex flex-col">
                                            <span className="font-black text-zinc-800 dark:text-zinc-200">
                                              {sub.studentName}
                                            </span>
                                            {sub.studentIdNum && (
                                              <span className="text-[10px] text-zinc-400 font-bold">
                                                ID: {maskSensitiveData(sub.studentIdNum)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      {submissionsIsBuiltIn && (
                                        <td className="p-3 text-center">
                                          <span
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tabular-nums border ${sub.maxScore > 0 && sub.score === sub.maxScore ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"}`}
                                          >
                                            {sub.maxScore > 0
                                              ? `${sub.score} / ${sub.maxScore}`
                                              : "โ€”"}
                                          </span>
                                        </td>
                                      )}
                                      <td className="p-3 text-center">
                                        {sub.fileUrl ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSubmissionsPreviewUrl(sub.fileUrl);
                                              setSubmissionsPreviewName(sub.fileName || "ไฟล์แนบ");
                                            }}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-lg transition-all border border-emerald-200 dark:border-emerald-800/50 cursor-pointer"
                                          >
                                            <Eye size={10} className="shrink-0" />
                                            <span className="truncate max-w-[140px]">
                                              {sub.fileName || "ดูไฟล์"}
                                            </span>
                                          </button>
                                        ) : (
                                          <span className="text-[10px] text-zinc-400 italic font-bold">
                                            ไม่มีไฟล์แนบ
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center text-[9px] text-zinc-400 tabular-nums">
                                        {new Date(sub.submittedAt).toLocaleDateString("th-TH", {
                                          day: "2-digit",
                                          month: "short",
                                        })}
                                        <br />
                                        <span className="text-zinc-300 dark:text-zinc-600">
                                          {new Date(sub.submittedAt).toLocaleTimeString("th-TH", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </td>
                                      {submissionsIsBuiltIn && (
                                        <td className="p-3 text-right">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setExpandedSubmissionId(isExpanded ? null : sub.id)
                                            }
                                            className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-[10px] font-black transition-all border-0 cursor-pointer text-zinc-600 dark:text-zinc-300"
                                          >
                                            {isExpanded ? "ซ่อน" : "ตรวจคำตอบ"}
                                          </button>
                                        </td>
                                      )}
                                      <td className="p-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (window.confirm(`ลบงานที่ส่งของ ${sub.studentName}?`)) {
                                              handleDeleteSubmission(sub.id);
                                            }
                                          }}
                                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg text-[10px] font-black transition-all border-0 cursor-pointer"
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                      </td>
                                    </tr>
                                    {isExpanded && submissionsIsBuiltIn && (
                                      <tr>
                                        <td
                                          colSpan={7}
                                          className="p-4 bg-blue-50/30 dark:bg-blue-950/10"
                                        >
                                          <div className="space-y-2 pl-3 border-l-2 border-blue-400">
                                            <h5 className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                                              รายละเอียดคำตอบ:
                                            </h5>
                                            {(() => {
                                              const activeQuiz = quizzes.find(
                                                (q: any) => q.id === submissionsQuizId,
                                              );
                                              if (!activeQuiz?.questions?.length) {
                                                return (
                                                  <span className="text-[10px] text-zinc-400 font-bold">
                                                    ไม่พบรายละเอียดโจทย์
                                                  </span>
                                                );
                                              }
                                              return activeQuiz.questions.map(
                                                (question: any, qIndex: number) => {
                                                  const studentAnswerObj = sub.answers?.find(
                                                    (a: any) =>
                                                      String(a.questionId) === String(question.id),
                                                  );
                                                  const studentAnswer = studentAnswerObj
                                                    ? studentAnswerObj.answer
                                                    : "ไม่ได้ตอบ";
                                                  const isSubjective =
                                                    question.type === "short_answer";
                                                  let isCorrect = false;
                                                  if (question.type === "short_answer") {
                                                    isCorrect =
                                                      studentAnswerObj?.isCorrect !== false;
                                                  } else if (question.type === "multiple_choice") {
                                                    isCorrect =
                                                      String(studentAnswer || "")
                                                        .trim()
                                                        .toLowerCase() ===
                                                      String(question.correctAnswer || "")
                                                        .trim()
                                                        .toLowerCase() &&
                                                      String(studentAnswer || "").trim() !== "";
                                                  } else if (question.type === "checkboxes") {
                                                    const sArr = Array.isArray(studentAnswer)
                                                      ? studentAnswer
                                                        .map((v: any) =>
                                                          String(v || "")
                                                            .trim()
                                                            .toLowerCase(),
                                                        )
                                                        .sort()
                                                      : [];
                                                    const cArr = Array.isArray(
                                                      question.correctAnswer,
                                                    )
                                                      ? question.correctAnswer
                                                        .map((v: any) =>
                                                          String(v || "")
                                                            .trim()
                                                            .toLowerCase(),
                                                        )
                                                        .sort()
                                                      : [
                                                        String(question.correctAnswer || "")
                                                          .trim()
                                                          .toLowerCase(),
                                                      ];
                                                    isCorrect =
                                                      sArr.length === cArr.length &&
                                                      sArr.every((v, i) => v === cArr[i]) &&
                                                      sArr.length > 0;
                                                  }
                                                  return (
                                                    <div
                                                      key={question.id}
                                                      className="p-2.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl text-[11px]"
                                                    >
                                                      <div className="flex justify-between items-start gap-2 mb-1.5">
                                                        <span className="font-black text-zinc-800 dark:text-zinc-200">
                                                          {qIndex + 1}. {question.text}
                                                        </span>
                                                        <span
                                                          className={`shrink-0 font-black px-1.5 py-0.5 rounded text-[9px] ${isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}
                                                        >
                                                          {isCorrect ? `+${question.points}` : "0"}{" "}
                                                          คะแนน
                                                        </span>
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-2 border-t dark:border-zinc-800 pt-1.5 text-[10px]">
                                                        <div>
                                                          <span className="text-zinc-400 font-bold block">
                                                            คำตอบนักศึกษา:
                                                          </span>
                                                          <span
                                                            className={`font-black ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                                                          >
                                                            {Array.isArray(studentAnswer)
                                                              ? studentAnswer.join(", ")
                                                              : String(studentAnswer)}
                                                          </span>
                                                          {isSubjective && (
                                                            <button
                                                              type="button"
                                                              onClick={async () => {
                                                                await handleToggleSubjectiveGrading(
                                                                  sub.id,
                                                                  question.id,
                                                                  !isCorrect,
                                                                );
                                                              }}
                                                              className={`ml-3 px-2 py-0.5 rounded-lg text-[9px] font-black cursor-pointer border transition-all ${isCorrect ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40 hover:bg-rose-100" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100"}`}
                                                            >
                                                              {isCorrect
                                                                ? "ทำเครื่องหมายเป็นผิด (0 คะแนน)"
                                                                : "ทำเครื่องหมายเป็นถูก (ได้คะแนน)"}
                                                            </button>
                                                          )}
                                                        </div>
                                                        {!isSubjective && (
                                                          <div>
                                                            <span className="text-zinc-400 font-bold block">
                                                              เฉลย:
                                                            </span>
                                                            <span className="font-black text-zinc-600 dark:text-zinc-300">
                                                              {Array.isArray(question.correctAnswer)
                                                                ? question.correctAnswer.join(", ")
                                                                : String(
                                                                  question.correctAnswer ||
                                                                  "ไม่ได้ระบุ",
                                                                )}
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                },
                                              );
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
                      <FileText size={14} className="text-blue-400 shrink-0" />
                      <span className="text-xs font-black text-zinc-200 truncate">
                        {submissionsPreviewName}
                      </span>
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
                        onClick={() => {
                          setSubmissionsPreviewUrl(null);
                          setSubmissionsPreviewName(null);
                        }}
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
                        <FileText size={32} className="text-blue-400" />
                        <p className="text-sm font-black text-zinc-200">{submissionsPreviewName}</p>
                        <a
                          href={submissionsPreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black transition-colors"
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
          <div className="fixed inset-0 z-9999 flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/65 dark:bg-zinc-950/80 backdrop-blur-md"
              onClick={() => setEditingStudent(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[90vh] bg-white dark:bg-zinc-900 sm:rounded-[32px] sm:border border-white/20 dark:border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-left flex flex-col overflow-hidden sm:max-w-2xl"
            >
              <div className="px-6 py-5 border-b dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-lg font-black text-teal-800 dark:text-teal-200 flex items-center gap-2">
                    <Edit2 size={20} className="text-teal-600 dark:text-teal-400" />
                    แก้ไขข้อมูล: {editingStudent.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1.5">
                    <User size={12} /> {maskSensitiveData(editingStudent.studentIdNum)} <span className="text-zinc-300 dark:text-zinc-700">|</span> <Users size={12} /> {standardizeClassGroupName(editingStudent.classGroupId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors relative z-10 border-0 bg-transparent"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 flex-1 overflow-y-auto min-h-0">
                {/* 1. Status Check-in */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    สถานะเวลาเรียน
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Present", "Late", "Absent"].map((statusOption) => {
                      const label =
                        statusOption === "Present"
                          ? "ตรงเวลา"
                          : statusOption === "Late"
                            ? "มาสาย"
                            : "ขาดเรียน";
                      const active = editingStudent.status === statusOption;
                      const Icon = statusOption === "Present" ? CheckCircle : statusOption === "Late" ? Clock : XCircle;

                      const activeColor =
                        statusOption === "Present" ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm" :
                          statusOption === "Late" ? "bg-amber-50 text-amber-700 ring-2 ring-amber-500/50 dark:bg-amber-500/20 dark:text-amber-300 shadow-sm" :
                            "bg-rose-50 text-rose-700 ring-2 ring-rose-500/50 dark:bg-rose-500/20 dark:text-rose-300 shadow-sm";

                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() =>
                            setEditingStudent({ ...editingStudent, status: statusOption })
                          }
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer ${active
                            ? activeColor
                            : "bg-white dark:bg-zinc-800/50 ring-1 ring-zinc-200 dark:ring-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600"
                            }`}
                        >
                          <Icon size={18} className={active ? "" : "opacity-60"} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Warning about read-only General Check-in */}
                {!editingStudent.unitId && (
                  <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 text-xs font-bold leading-relaxed">
                    ⚠️ เป็นเซสชันเช็คชื่อปกติ (ไม่ได้แนบรายหน่วยบทเรียนมาด้วย)
                    จะแสดงแบบอ่านอย่างเดียวสำหรับงานมอบหมายและคะแนน
                    และไม่สามารถแก้ไขส่วนส่งงาน/คะแนนได้
                  </div>
                )}

                {/* 2. Status Assignment */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                    การส่งงาน / บ้าน (สำหรับเช็คชื่อตามบทเรียน)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["None", "Submitted", "Pending"].map((statusOption) => {
                      const label =
                        statusOption === "None"
                          ? "ไม่มีงาน"
                          : statusOption === "Submitted"
                            ? "ส่งแล้ว"
                            : "ค้างส่ง";
                      const active = editingStudent.assignmentStatus === statusOption;
                      const disabled = !editingStudent.unitId;
                      const Icon = statusOption === "None" ? MinusCircle : statusOption === "Submitted" ? FileCheck : AlertCircle;

                      const activeColor =
                        statusOption === "None" ? "bg-zinc-100 text-zinc-700 ring-2 ring-zinc-400/50 dark:bg-zinc-800 dark:text-zinc-300 shadow-sm" :
                          statusOption === "Submitted" ? "bg-teal-50 text-teal-700 ring-2 ring-teal-500/50 dark:bg-teal-500/20 dark:text-teal-300 shadow-sm" :
                            "bg-orange-50 text-orange-700 ring-2 ring-orange-500/50 dark:bg-orange-500/20 dark:text-orange-300 shadow-sm";

                      return (
                        <button
                          key={statusOption}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            setEditingStudent({ ...editingStudent, assignmentStatus: statusOption })
                          }
                          className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-black transition-all border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${active
                            ? activeColor
                            : "bg-white dark:bg-zinc-800/50 ring-1 ring-zinc-200 dark:ring-zinc-700/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-600"
                            }`}
                        >
                          <Icon size={18} className={active ? "" : "opacity-60"} />
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
                          const resScore = await handleExtractScoreFromImage(
                            editingStudent.id,
                            editingStudent.imageUrl,
                          );
                          if (resScore !== null) {
                            setEditingStudent((prev: any) =>
                              prev ? { ...prev, score: resScore } : null,
                            );
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 hover:bg-teal-500/15 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
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
                    placeholder={
                      editingStudent.unitId
                        ? "ป้อนคะแนนดิบหรือข้อสังเกต..."
                        : "ไม่สามารถป้อนคะแนนในเซสชันเช็คชื่อปกติ"
                    }
                    className="w-full h-12 border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl px-4 text-sm focus:outline-hidden focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20 transition-all dark:text-white font-bold disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-zinc-900"
                    value={editingStudent.score}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, score: e.target.value })
                    }
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

              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/80 flex justify-end gap-3 border-t dark:border-zinc-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-zinc-500 bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
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
                        unitId: editingStudent.unitId,
                        unitTitle: editingStudent.unitTitle || activeStudyUnit?.title || "",
                        unitSequence:
                          editingStudent.unitSequence !== undefined && editingStudent.unitSequence !== ""
                            ? editingStudent.unitSequence
                            : activeStudyUnit?.sequence || "",
                        studySeconds: editingStudent.studySeconds || 0,
                      },
                    }));
                    message.success(
                      `อัปเดตข้อมูลของ ${editingStudent.name} ในตารางชั่วคราวแล้ว! (กรุณากดปุ่มบันทึกสีเขียวที่ด้านบนเพื่อบันทึกถาวรลงระบบ)`,
                    );
                    setEditingStudent(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 border-0 cursor-pointer"
                >
                  ยืนยันแก้ไข
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Mobile Student Details Modal */}
      <Modal
        title={null}
        open={!!selectedMobileStudent}
        onCancel={() => setSelectedMobileStudent(null)}
        footer={null}
        centered
        mask={{ closable: false }}
        keyboard={false}
        width="100vw"
        style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw', height: '100vh', paddingBottom: 0 }}
        styles={{ body: { height: '100vh', overflowY: 'auto', padding: "20px 24px" } }}
        className="dve-mobile-student-modal"
        closeIcon={<X className="w-5 h-5 text-zinc-500" />}
      >
        {selectedMobileStudent && (() => {
          const student = selectedMobileStudent;
          const rec = attendanceRecords[student.id] || {
            status: "Absent" as const,
            assignmentStatus: "None" as const,
            score: "",
            studySeconds: 0,
            createdAt: undefined,
            updatedAt: undefined,
          };
          const hasPretest = activeUnitQuizzes.some(q => q.quizType === "pretest");
          const hasPosttest = activeUnitQuizzes.some(q => q.quizType === "posttest");
          const pretestSub = unitQuizResultsByStudent[student.id]?.find(s => s.quizType === "pretest");
          const posttestSub = unitQuizResultsByStudent[student.id]?.find(s => s.quizType === "posttest");

          return (
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3 border-b dark:border-zinc-800 pb-3">
                <Link href={`/dashboard/profile/${student.id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  {student.image ? (
                    <img src={student.image} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <User size={20} />
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-base leading-tight">
                    {student.name}
                  </h4>
                  <p className="text-xs text-zinc-500 font-bold mt-1">
                    ID: {maskSensitiveData(student.studentIdNum)} • กลุ่ม: {standardizeClassGroupName(student.classGroupId)}
                  </p>
                </div>
              </div>

              {/* ประวัติการส่งงาน */}
              {studentSubmissionsById[student.id]?.length > 0 && (
                <div className="flex flex-col gap-2 bg-zinc-50 dark:bg-zinc-850/50 p-3 rounded-xl border dark:border-zinc-800/80">
                  <h5 className="text-[10px] uppercase font-black tracking-wider text-zinc-400">ประวัติงานที่ผ่านมา</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {studentSubmissionsById[student.id].map((att: any, idx: number) => {
                      const isDone = att.assignmentStatus === "Submitted";
                      const isPending = att.assignmentStatus === "Pending";
                      return (
                        <div
                          key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-xs ${isDone
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
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">สถานะเวลาเรียน:</span>
                  {rec.status === "Studying" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-500/20 animate-pulse">
                      กำลังเรียนอยู่ ⏱️ ({Math.round((rec.studySeconds || 0) / 60)}/{activeStudyUnit?.studyMinutes || 0} น.)
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${rec.status === "Present"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                        : rec.status === "Late"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                        }`}
                    >
                      {rec.status === "Present" ? "ตรงเวลา" : rec.status === "Late" ? "มาสาย" : "ยังไม่เข้าเรียน"}
                      {(rec.studySeconds || 0) > 0 && ` (${Math.round((rec.studySeconds || 0) / 60)} น.)`}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">การส่งงาน:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${rec.assignmentStatus === "Submitted"
                      ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60"
                      : rec.assignmentStatus === "Pending"
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60"
                      }`}
                  >
                    {rec.assignmentStatus === "Submitted" ? "ส่งแล้ว" : rec.assignmentStatus === "Pending" ? "ค้างส่ง" : "ไม่มีงาน"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">คะแนน:</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 text-sm">
                    {rec.score || "-"}
                  </span>
                </div>
              </div>

              {/* Quiz Scores on Mobile */}
              {activeUnitQuizzes.length > 0 && (
                <div className="flex flex-col gap-2 text-[11px] font-bold text-zinc-500 mt-2 bg-zinc-150/45 dark:bg-zinc-900/40 p-3 rounded-xl border dark:border-zinc-800/80">
                  {activeUnitQuizzes.map((quiz) => {
                    const quizSub = unitQuizResultsByStudent[student.id]?.find(s => s.quizId === quiz.id || s.quizType === quiz.quizType);
                    return (
                      <div key={quiz.id} className="flex items-center justify-between gap-2">
                        <span className="truncate max-w-[150px]" title={quiz.title}>
                          📝 {quiz.quizType === "pretest" ? "ก่อนเรียน" : quiz.quizType === "posttest" ? "หลังเรียน" : quiz.title}:
                        </span>
                        {quizSub ? (
                          <span className="font-black text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded border border-blue-250 dark:border-blue-800/50">
                            {quizSub.score} / {quizSub.maxScore}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">ยังไม่ทำ</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t dark:border-zinc-800/80 pt-4 mt-2 justify-end">
                {rec.imageUrl && (
                  <a
                    href={rec.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center flex-1 gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-black rounded-xl transition-all cursor-pointer border border-emerald-500/10 shadow-sm"
                  >
                    <Eye size={14} />
                    <span>ดูงาน</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMobileStudent(null);
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
                      unitTitle: rec.unitTitle || activeStudyUnit?.title || "",
                      unitSequence:
                        rec.unitSequence !== undefined && rec.unitSequence !== ""
                          ? rec.unitSequence
                          : activeStudyUnit?.sequence || "",
                      studySeconds: rec.studySeconds || 0,
                    });
                  }}
                  className="inline-flex items-center justify-center flex-1 gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Edit2 size={14} />
                  <span>แก้ไข</span>
                </button>

                <Popconfirm
                  title={`ลบข้อมูลของ ${student.name}?`}
                  onConfirm={() => {
                    setSelectedMobileStudent(null);
                    handleDeleteIndividualAttendance(student.id);
                  }}
                  okText="ลบ"
                  cancelText="ยกเลิก"
                >
                  <button
                    type="button"
                    className="inline-flex items-center justify-center flex-1 gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-black rounded-xl transition-all cursor-pointer border border-rose-500/10 shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span>ลบ</span>
                  </button>
                </Popconfirm>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Edit2 size={18} />
            <span className="font-black">แก้ไขข้อมูลนักเรียน</span>
          </div>
        }
        open={isEditProfileModalOpen}
        onCancel={() => setIsEditProfileModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                required
                className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-amber-500 transition-all dark:text-white"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                รหัสนักศึกษา
              </label>
              <input
                type="text"
                required
                className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-amber-500 transition-all dark:text-white"
                value={profileForm.studentIdNum}
                onChange={(e) => setProfileForm(prev => ({ ...prev, studentIdNum: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                รหัสกลุ่มเรียน / ห้องเรียน
              </label>
              <input
                type="text"
                className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-amber-500 transition-all dark:text-white"
                value={profileForm.classGroupId}
                onChange={(e) => setProfileForm(prev => ({ ...prev, classGroupId: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                แผนกวิชา
              </label>
              <select
                className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-amber-500 transition-all dark:text-white"
                value={profileForm.department}
                onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
              >
                <option value="">-- เลือกแผนกวิชา --</option>
                {DEPARTMENTS.filter(d => d.startsWith("แผนกวิชา") || d.includes("การจัดการ")).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-amber-500 transition-all dark:text-white"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black rounded-xl transition-all cursor-pointer text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 text-xs"
            >
              {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </Modal>

      {/* Location Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <MapPin size={18} />
            <span className="font-black">ตั้งค่าพิกัด GPS สถานประกอบการ</span>
          </div>
        }
        open={isLocationModalOpen}
        onCancel={() => setIsLocationModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        {selectedLocationStudent && (
          <form onSubmit={handleSaveLocation} className="space-y-4 pt-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50 mb-4 text-xs text-blue-700 dark:text-blue-400">
              ตั้งค่าละติจูดและลองจิจูดสำหรับ <strong className="text-blue-900 dark:text-blue-300">{selectedLocationStudent.name}</strong> 
              <br/>พิกัดนี้จะใช้สำหรับเช็คชื่อหน้าเสาธง (Flagpole) แทนพิกัดของวิทยาลัย หากไม่ตั้งค่าระบบจะใช้พิกัดวิทยาลัยเป็นค่าเริ่มต้น
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 mb-4">
              <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 block">
                แกะพิกัดจากลิงก์ Google Maps อัตโนมัติ
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 rounded-lg text-xs font-bold focus:outline-hidden focus:border-blue-500 transition-all dark:text-white"
                  placeholder="วางลิงก์ เช่น https://maps.app.goo.gl/..."
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleExtractGps();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleExtractGps}
                  disabled={extractingGps || !mapsUrl}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-lg text-xs font-black transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {extractingGps ? <Loader2 size={14} className="animate-spin" /> : "ดึงพิกัด"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                  ละติจูด (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all dark:text-white"
                  placeholder="เช่น 14.754043"
                  value={locationForm.lat}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, lat: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-black text-zinc-600 dark:text-zinc-400 block mb-1">
                  ลองจิจูด (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 rounded-xl text-sm font-bold focus:outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all dark:text-white"
                  placeholder="เช่น 104.65807"
                  value={locationForm.lng}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, lng: e.target.value }))}
                />
              </div>
            </div>

            {/* Map Preview */}
            {locationForm.lat && locationForm.lng && !isNaN(Number(locationForm.lat)) && !isNaN(Number(locationForm.lng)) && (
              <div className="mt-4 rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-sm relative">
                <div className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-zinc-600 dark:text-zinc-300 shadow-xs z-10">
                  พรีวิวแผนที่ (จุดนี้คือที่เช็คชื่อ)
                </div>
                <iframe
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${locationForm.lat},${locationForm.lng}&hl=th&z=16&output=embed`}
                ></iframe>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black rounded-xl transition-all cursor-pointer text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={savingLocation}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 text-xs"
              >
                {savingLocation ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                บันทึกพิกัด
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Profile Image Modal */}
      <Modal
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        width="max-content"
        className="p-0!"
        destroyOnHidden
        closable={false}
        centered
      >
        <div className="relative group cursor-pointer" onClick={() => setIsProfileModalOpen(false)}>
          <img
            src={selectedProfileImage}
            className="max-w-[90vw] max-h-[85vh] rounded-3xl object-contain shadow-2xl"
            alt="Profile"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
            <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md">
              คลิกเพื่อปิด
            </span>
          </div>
        </div>
      </Modal>

    </div>
  );
}

// -------------------------------------------------------------
function DVEPortalContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const role = (session?.user?.role || "").toLowerCase();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const canAccessDvePortal = ["teacher", "super_admin", "admin", "editor", "director", "deputy_academic"].includes(role);

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

  if (!isMounted || status === "loading") {
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
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
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
