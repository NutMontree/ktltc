"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, Suspense } from "react";
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
  if (extracted.score.includes("/")) return extracted.score;
  if (extracted.maxScore) return `${extracted.score}/${extracted.maxScore}`;
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
// STUDENT PORTAL COMPONENT
// -------------------------------------------------------------
export function DVEStudentPortal() {
  const { data: session } = useSession();
  const [searchState, setSearchState] = useState({
    department: "",
    teacherId: "",
    subjectId: "",
  });

  const [options, setOptions] = useState<{
    departments: string[];
    teachers: { id: string; name: string; department: string }[];
    subjects: { id: string; code: string; name: string; curriculum: string; teacherName: string }[];
  }>({
    departments: [],
    teachers: [],
    subjects: [],
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [activeSubject, setActiveSubject] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const allUnitFiles = units.flatMap((unit: any) =>
    (unit.files || []).map((file: any) => ({
      ...file,
      unitTitle: unit.title,
      unitSequence: unit.sequence,
      unitId: unit.id || unit._id || "",
    })),
  );
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loadingSubjectData, setLoadingSubjectData] = useState(false);

  // DVE Virtual Study Room timer states
  const [activeStudyUnit, setActiveStudyUnit] = useState<any>(null);
  const [studySecondsElapsed, setStudySecondsElapsed] = useState<number>(0);
  const [isStudyCompleted, setIsStudyCompleted] = useState<boolean>(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState<boolean>(false);
  const [uploadingRecordId, setUploadingRecordId] = useState<string | null>(null);

  const handleStudentImageUpload = async (attRecord: any, file: File) => {
    if (!file || !session?.user || !activeSubject) return;

    const recordKey = attRecord.id || attRecord.date;
    setUploadingRecordId(recordKey);
    try {
      // 1. Safe Client-side OCR with try-catch wrapper
      let extracted: DveExtractScoreResult | null = null;
      try {
        message.loading({
          content: "กำลังวิเคราะห์อ่านคะแนนจากรูปภาพ...",
          key: "dve-ocr",
          duration: 0,
        });
        const { extractScoreFromImageFile } = await import("@/lib/dve/extract-score-client");
        extracted = await extractScoreFromImageFile(file);
      } catch (ocrErr) {
        console.warn(
          "[DVE Student OCR] Client-side OCR failed, will fallback to server-side:",
          ocrErr,
        );
      } finally {
        message.destroy("dve-ocr");
      }

      // 2. Upload file to local server
      message.loading({
        content: "กำลังอัปโหลดไฟล์หลักฐานไปยังเซิร์ฟเวอร์...",
        key: "dve-ocr-upload",
        duration: 0,
      });
      const res = await uploadFile(file, "dve_evidence");
      message.destroy("dve-ocr-upload");

      if (res && res.secure_url) {
        // 3. Backend OCR fallback if client-side didn't extract any score
        if (!extracted?.score) {
          message.loading({
            content: "กำลังดึงข้อมูลและอ่านคะแนนซ้ำจากเซิร์ฟเวอร์...",
            key: "dve-ocr-retry",
            duration: 0,
          });
          extracted = await fetchExtractedScore(res.secure_url);
          message.destroy("dve-ocr-retry");
        }

        const scoreValue = formatScoreForStorage(extracted) || attRecord.score || "";

        const payload = {
          subjectId: activeSubject.id,
          date: attRecord.date,
          records: [
            {
              studentId: attRecord.studentId,
              studentName: attRecord.studentName,
              studentIdNum: attRecord.studentIdNum,
              classGroupId: attRecord.classGroupId,
              status: attRecord.status,
              assignmentStatus: "Submitted",
              score: scoreValue,
              imageUrl: res.secure_url,
              unitId: attRecord.unitId || "",
              unitTitle: attRecord.unitTitle || "",
              unitSequence: attRecord.unitSequence !== undefined ? attRecord.unitSequence : "",
            },
          ],
        };

        const saveRes = await fetch("/api/dve/attendances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (saveRes.ok) {
          if (extracted?.score) {
            message.success(`อัปโหลดหลักฐานแล้ว — ${formatExtractedScoreMessage(extracted)}`);
          } else {
            message.warning(
              `อัปโหลดรูปแล้ว — ${formatExtractedScoreMessage(extracted || { score: null })}`,
            );
          }
          const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
          if (attRes.ok) {
            const attData = await attRes.json();
            if (attData.success) setAttendances(attData.attendances || []);
          }
        } else {
          message.error("บันทึกข้อมูลหลักฐานล้มเหลว");
        }
      } else {
        message.error("อัปโหลดรูปภาพล้มเหลว");
      }
    } catch (err) {
      console.error("Student upload error:", err);
      message.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploadingRecordId(null);
    }
  };

  const handleSaveStudentScore = async (attRecord: any, scoreValue: string) => {
    if (!session?.user || !activeSubject) return;
    try {
      const payload = {
        subjectId: activeSubject.id,
        date: attRecord.date,
        records: [
          {
            studentId: attRecord.studentId,
            studentName: attRecord.studentName,
            studentIdNum: attRecord.studentIdNum,
            classGroupId: attRecord.classGroupId,
            status: attRecord.status,
            assignmentStatus: attRecord.assignmentStatus,
            score: scoreValue,
            imageUrl: attRecord.imageUrl || "",
            unitId: attRecord.unitId || "",
            unitTitle: attRecord.unitTitle || "",
            unitSequence: attRecord.unitSequence !== undefined ? attRecord.unitSequence : "",
          },
        ],
      };

      const saveRes = await fetch("/api/dve/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (saveRes.ok) {
        message.success("บันทึกคะแนนเรียบร้อยแล้ว!");
        const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
        if (attRes.ok) {
          const attData = await attRes.json();
          if (attData.success) setAttendances(attData.attendances || []);
        }
      } else {
        message.error("บันทึกคะแนนล้มเหลว");
      }
    } catch (err) {
      console.error("Save score error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึกคะแนน");
    }
  };

  const handleOpenQuizFormGlobal = async (url: string) => {
    window.open(url, "_blank");
    if (!session?.user || !activeSubject) return;
    try {
      const todayStr = new Date().toLocaleDateString("en-CA");
      const user = session.user as any;
      const existingToday = attendances.find(
        (a) =>
          a.date === todayStr &&
          a.unitId === (activeStudyUnit?.id || activeStudyUnit?._id?.toString()),
      );

      const payload = {
        subjectId: activeSubject.id,
        date: todayStr,
        records: [
          {
            studentId: user.id,
            studentName: user.name,
            studentIdNum: user.username || "",
            classGroupId: user.classGroup || "",
            status: existingToday ? existingToday.status : "Present",
            assignmentStatus: "Submitted",
            score: existingToday ? existingToday.score : "",
            imageUrl: existingToday ? existingToday.imageUrl || "" : "",
            unitId: activeStudyUnit?.id || activeStudyUnit?._id?.toString() || "",
            unitTitle: activeStudyUnit?.title || "",
            unitSequence: activeStudyUnit?.sequence !== undefined ? activeStudyUnit.sequence : "",
          },
        ],
      };

      const res = await fetch("/api/dve/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
        if (attRes.ok) {
          const attData = await attRes.json();
          if (attData.success) setAttendances(attData.attendances || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto checkin handler when timer reaches limit
  const handleAutoCheckin = async (unitToCheck: any) => {
    if (!session?.user || !activeSubject || !unitToCheck) return;
    try {
      setIsSubmittingAttendance(true);
      const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time zone
      const user = session.user as any;

      // Check quiz deadlines to see if check-in is late
      let checkinStatus = "Present";
      if (quizzes && quizzes.length > 0) {
        for (const quiz of quizzes) {
          if (quiz.deadline) {
            let deadlineDate: Date | null = null;
            if (quiz.deadline.includes("/")) {
              const parts = quiz.deadline.split("/");
              if (parts.length === 3) {
                // If MM/DD/YYYY
                deadlineDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
              } else {
                deadlineDate = new Date(quiz.deadline);
              }
            } else {
              deadlineDate = new Date(quiz.deadline);
            }

            if (deadlineDate && !isNaN(deadlineDate.getTime())) {
              const deadlineStr = deadlineDate.toLocaleDateString("en-CA");
              if (todayStr > deadlineStr) {
                checkinStatus = "Late"; // Expired quiz deadline makes attendance "Late"
                break;
              }
            }
          }
        }
      }

      const payload = {
        subjectId: activeSubject.id,
        date: todayStr,
        records: [
          {
            studentId: user.id,
            studentName: user.name,
            studentIdNum: user.username || "", // Username stores the student ID code
            classGroupId: user.classGroup || "",
            status: checkinStatus,
            assignmentStatus: "None",
            score: "",
            unitId: unitToCheck.id || unitToCheck._id?.toString() || "",
            unitTitle: unitToCheck.title || "",
            unitSequence: unitToCheck.sequence !== undefined ? unitToCheck.sequence : "",
          },
        ],
      };

      const res = await fetch("/api/dve/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (checkinStatus === "Late") {
          message.warning(
            "⚠️ เช็คชื่อเข้าเรียนสำเร็จ: แต่ท่านถูกบันทึกเป็น 'มาสาย' เนื่องจากเกินกำหนดส่งแบบทดสอบ!",
          );
        } else {
          message.success("✨ ระบบจับเวลาสำเร็จ: เช็คชื่อเข้าเรียนของท่านเรียบร้อยแล้ว!");
        }
        // Refresh attendances log in background
        const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
        if (attRes.ok) {
          const attData = await attRes.json();
          if (attData.success) setAttendances(attData.attendances || []);
        }

        // Check if there is a quiz available for this subject
        if (quizzes && quizzes.length > 0) {
          const targetQuiz = quizzes[0];
          message.loading("📝 เรียนจบเวลาแล้ว! กำลังพาท่านไปยังแบบทดสอบประเมินผล...", 3);
          setTimeout(() => {
            window.open(targetQuiz.googleFormUrl, "_blank");
          }, 3000);
        }
      } else {
        const errorData = await res.json();
        message.error(`ไม่สามารถเช็คชื่ออัตโนมัติได้: ${errorData.error || "เกิดข้อผิดพลาด"}`);
      }
    } catch (err) {
      console.error("Auto checkin error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึกเวลาเรียน");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  // Study Room timer & Auto Check-in logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeStudyUnit) {
      const studyLimitSeconds = (activeStudyUnit.studyMinutes || 0) * 60;

      // If no timer set, mark completed immediately and check in automatically
      if (studyLimitSeconds <= 0) {
        setIsStudyCompleted(true);
        handleAutoCheckin(activeStudyUnit);
      } else {
        timer = setInterval(() => {
          setStudySecondsElapsed((prev) => {
            const nextVal = prev + 1;
            if (nextVal >= studyLimitSeconds) {
              clearInterval(timer);
              setIsStudyCompleted(true);
              // Trigger auto check-in
              handleAutoCheckin(activeStudyUnit);
              return studyLimitSeconds;
            }
            return nextVal;
          });
        }, 1000);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeStudyUnit]);

  // Load subject contents once selected
  const handleSubjectSelect = async (subjectId: string) => {
    setSearchState((prev) => ({ ...prev, subjectId }));
    if (!subjectId) {
      setActiveSubject(null);
      return;
    }

    try {
      setLoadingSubjectData(true);
      // Fetch details
      const subRes = await fetch(`/api/dve/subjects?id=${subjectId}`);
      const unitsRes = await fetch(`/api/dve/units?subjectId=${subjectId}`);
      const quizzesRes = await fetch(`/api/dve/quizzes?subjectId=${subjectId}`);
      const attRes = await fetch(`/api/dve/attendances?subjectId=${subjectId}`);

      if (subRes.ok && unitsRes.ok && quizzesRes.ok && attRes.ok) {
        const subData = await subRes.json();
        const unitsData = await unitsRes.json();
        const quizzesData = await quizzesRes.json();
        const attData = await attRes.json();

        if (subData.success) setActiveSubject(subData.subject);
        if (unitsData.success) setUnits(unitsData.units || []);
        if (quizzesData.success) setQuizzes(quizzesData.quizzes || []);
        if (attData.success) setAttendances(attData.attendances || []);
      }
    } catch (err) {
      console.error("Load subject details error:", err);
      message.error("ไม่สามารถโหลดรายละเอียดวิชาเรียนได้");
    } finally {
      setLoadingSubjectData(false);
    }
  };

  // Filter teachers/subjects when department changes
  const handleDepartmentChange = async (dept: string, autoSelectSubjectId?: string) => {
    setSearchState({ department: dept, teacherId: "", subjectId: "" });
    setActiveSubject(null);
    try {
      const res = await fetch(`/api/dve/search?department=${encodeURIComponent(dept)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOptions((prev) => ({
            ...prev,
            teachers: data.teachers || [],
            subjects: data.subjects || [],
          }));

          // Auto select first subject if available
          if (data.subjects && data.subjects.length > 0) {
            const targetSubjectId = autoSelectSubjectId || data.subjects[0].id;
            handleSubjectSelect(targetSubjectId);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter subjects when teacher changes
  const handleTeacherChange = async (teacherId: string) => {
    setSearchState((prev) => ({ ...prev, teacherId, subjectId: "" }));
    setActiveSubject(null);
    try {
      const res = await fetch(`/api/dve/search?teacherId=${teacherId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOptions((prev) => ({
            ...prev,
            subjects: data.subjects || [],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load initial search options
  useEffect(() => {
    message.config({
      top: 96,
      duration: 5,
    });

    const fetchSearchOptions = async () => {
      try {
        setLoadingOptions(true);
        const res = await fetch("/api/dve/search");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setOptions((prev) => ({
              ...prev,
              departments: data.departments || [],
              teachers: data.teachers || [],
            }));

            // Auto-select department & subject from user profile
            const userDept = data.userProfile?.department;
            if (userDept) {
              const matchedDept = (data.departments || []).find(
                (d: string) =>
                  d.toLowerCase().includes(userDept.toLowerCase()) ||
                  userDept.toLowerCase().includes(d.toLowerCase()),
              );
              if (matchedDept) {
                handleDepartmentChange(matchedDept);
              }
            }
          }
        }
      } catch (err) {
        console.error("Search options load error:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchSearchOptions();
  }, []);

  // Stats calculators
  const totalClasses = attendances.length;
  const presentClasses = attendances.filter((a) => a.status === "Present").length;
  const lateClasses = attendances.filter((a) => a.status === "Late").length;
  const absentClasses = attendances.filter((a) => a.status === "Absent").length;
  const attendanceRate =
    totalClasses > 0
      ? Math.round(((presentClasses + lateClasses * 0.5) / totalClasses) * 100)
      : 100;
  const submittedAssignments = attendances.filter((a) => a.assignmentStatus === "Submitted").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 px-2 sm:px-4 py-4 sm:py-8">
      {/* Student Portal Banner */}
      <div className="relative overflow-hidden rounded-[30px] bg-linear-to-br from-emerald-500 to-teal-700 text-white p-8 shadow-xl shadow-emerald-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <GraduationCap size={160} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-white/20 backdrop-blur-md text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full text-white/90">
            Student Learning Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight">
            ศูนย์การศึกษาระบบทวิภาคี (DVE Portal)
          </h1>
          <p className="text-white/80 font-bold mt-2 text-sm sm:text-base leading-relaxed">
            ยินดีต้อนรับสู่ระบบฝึกอาชีพทวิภาคี ค้นหาบทเรียน ดาวน์โหลดสื่อส่งงาน
            และติดตามประวัติคะแนนของท่านได้ที่นี่
          </p>
        </div>
      </div>

      {/* Smart Search Filters */}
      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Search size={18} className="text-emerald-500" />
          ค้นหารายวิชาเรียนทวิภาคี
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
              1. เลือกแผนกวิชา
            </label>
            <Select
              placeholder="-- เลือกแผนกวิชา --"
              className="w-full h-11"
              value={searchState.department || undefined}
              onChange={(val) => handleDepartmentChange(val)}
              loading={loadingOptions}
              options={options.departments.map((d) => ({ label: d, value: d }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
              2. เลือกอาจารย์ผู้สอน
            </label>
            <Select
              placeholder="-- เลือกอาจารย์ --"
              className="w-full h-11"
              value={searchState.teacherId || undefined}
              onChange={(val) => handleTeacherChange(val)}
              options={options.teachers.map((t) => ({
                label: `${t.name} (${t.department || "ไม่ระบุแผนก"})`,
                value: t.id,
              }))}
              disabled={!searchState.department}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
              3. เลือกวิชาเรียน
            </label>
            <Select
              placeholder="-- เลือกวิชาเรียน --"
              className="w-full h-11"
              value={searchState.subjectId || undefined}
              onChange={handleSubjectSelect}
              options={options.subjects.map((s) => ({
                label: `[${s.code}] ${s.name} (${s.curriculum})`,
                value: s.id,
              }))}
              disabled={!searchState.teacherId && !searchState.department}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loadingSubjectData && <DVELoader />}

        {!loadingSubjectData && activeSubject && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Subject Roster Info & Personal Attendance Stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Info Card */}
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                  <BookOpen size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    {activeSubject.curriculum} • ภาคเรียน {activeSubject.semester} /{" "}
                    {activeSubject.academicYear}
                  </span>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white mt-1 leading-tight">
                    {activeSubject.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">รหัสวิชา: {activeSubject.code}</p>
                </div>
                <div className="border-t dark:border-zinc-800 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-black">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                      อาจารย์ผู้สอน
                    </p>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      {activeSubject.teacherName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Analytics Progress */}
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm text-center">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-4">
                  สรุปประวัติเวลาเรียนของฉัน
                </h4>
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-zinc-100 dark:text-zinc-800"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-emerald-500"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * attendanceRate) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {attendanceRate}%
                    </span>
                    <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase">
                      การเข้าเรียน
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t dark:border-zinc-800 pt-4 text-xs font-bold">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="block text-sm font-black text-emerald-500">
                      {presentClasses}
                    </span>
                    <span className="text-[10px] text-zinc-400">ตรงเวลา</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="block text-sm font-black text-amber-500">{lateClasses}</span>
                    <span className="text-[10px] text-zinc-400">มาสาย</span>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="block text-sm font-black text-rose-500">{absentClasses}</span>
                    <span className="text-[10px] text-zinc-400">ขาดเรียน</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 text-left flex justify-between items-center text-xs font-black text-teal-600 dark:text-teal-400">
                  <span>ส่งการบ้านสำเร็จ:</span>
                  <span>{submittedAssignments} ชิ้น</span>
                </div>
              </div>
            </div>

            {/* Units & Document Downloads & Quizzes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Units & Media Card */}
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <FolderOpen size={18} className="text-emerald-500" />
                  หน่วยการสอนและสื่อดาวน์โหลด
                </h3>
                {units.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm font-bold">
                    ยังไม่มีหน่วยการเรียนรู้หรือสื่อการเรียนอัปเดตในขณะนี้
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border dark:border-zinc-800 rounded-xl overflow-hidden">
                    {units.map((unit, index) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          setActiveStudyUnit(unit);
                          setStudySecondsElapsed(0);
                          setIsStudyCompleted(false);
                        }}
                        className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 bg-transparent flex items-center justify-between transition-colors cursor-pointer border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                            หน่วยที่ {unit.sequence || index + 1}
                          </span>
                          <span className="font-bold text-zinc-850 dark:text-zinc-200 text-sm leading-snug truncate">
                            {unit.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600">
                          {unit.studyMinutes > 0 && (
                            <span className="text-[10px] font-bold text-amber-500/90 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 hidden md:inline">
                              ⏱️ {unit.studyMinutes} นาที
                            </span>
                          )}
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* บันทึกเวลาเรียนและการส่งหลักฐานคะแนน */}
              <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardList size={18} className="text-emerald-500" />
                  บันทึกเวลาเรียนและการส่งหลักฐานคะแนน
                </h3>
                {attendances.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-sm font-bold border border-dashed dark:border-zinc-800 rounded-xl">
                    ยังไม่มีบันทึกประวัติเข้าเรียนหรือส่งงานในรายวิชานี้
                  </div>
                ) : (
                  <>
                    {/* Desktop/Tablet View (Visible on Medium screens and up) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                            <th className="py-3">วันที่เรียน</th>
                            <th className="py-3 text-center">สถานะการเข้าเรียน</th>
                            <th className="py-3 text-center">สถานะการส่งงาน</th>
                            <th className="py-3 text-center">หลักฐานคะแนน (รูปภาพ)</th>
                            <th className="py-3 text-right">คะแนน / บันทึก</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {attendances.map((att) => {
                            const dateObj = new Date(att.date);
                            const formattedDate = isNaN(dateObj.getTime())
                              ? att.date
                              : dateObj.toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                });

                            const isUploading = uploadingRecordId === (att.id || att.date);

                            return (
                              <tr
                                key={att.id || att.date}
                                className="text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-50 dark:hover:bg-zinc-850/50"
                              >
                                <td className="py-4">
                                  <div className="flex flex-col gap-1 items-start justify-center">
                                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                                      {formattedDate}
                                    </span>
                                    {att.unitId ? (
                                      <span
                                        className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px]"
                                        title={att.unitTitle}
                                      >
                                        หน่วยที่ {att.unitSequence || "-"}: {att.unitTitle}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800/40 px-2 py-0.5 rounded-md w-fit">
                                        เช็คชื่อในชั้นเรียนปกติ
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 text-center">
                                  {att.status === "Present" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      ตรงเวลา
                                    </span>
                                  )}
                                  {att.status === "Late" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      มาสาย
                                    </span>
                                  )}
                                  {att.status === "Absent" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      ขาดเรียน
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 text-center">
                                  {att.assignmentStatus === "Submitted" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      ส่งงานแล้ว
                                    </span>
                                  )}
                                  {att.assignmentStatus === "Pending" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                      ค้างส่ง
                                    </span>
                                  )}
                                  {att.assignmentStatus === "None" && (
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                      ไม่มีงาน
                                    </span>
                                  )}
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {isUploading ? (
                                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                        <span>กำลังอัปโหลด...</span>
                                      </div>
                                    ) : att.imageUrl ? (
                                      <div className="flex items-center gap-2 justify-center">
                                        <a
                                          href={att.imageUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="ดูรูปภาพหลักฐานคะแนน"
                                        >
                                          <img
                                            src={att.imageUrl}
                                            alt="Score evidence"
                                            className="w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition-transform"
                                          />
                                        </a>
                                        <div>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            id={`change-file-${att.id || att.date}`}
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleStudentImageUpload(att, file);
                                            }}
                                          />
                                          <label
                                            htmlFor={`change-file-${att.id || att.date}`}
                                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-[10px] font-black rounded-lg cursor-pointer transition-colors border-0"
                                          >
                                            เปลี่ยนรูป
                                          </label>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex justify-center">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          id={`upload-file-${att.id || att.date}`}
                                          style={{ display: "none" }}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleStudentImageUpload(att, file);
                                          }}
                                        />
                                        <label
                                          htmlFor={`upload-file-${att.id || att.date}`}
                                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 text-[10px] font-black rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                                        >
                                          <Upload size={12} />
                                          📎 อัปโหลดรูปคะแนน
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex flex-col items-end gap-1">
                                    <input
                                      key={`${att.id || att.date}-${att.score || ""}-${att.imageUrl || ""}`}
                                      type="text"
                                      placeholder="กรอกคะแนน"
                                      className="w-20 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-2 py-1 text-xs text-right focus:outline-hidden dark:text-white"
                                      defaultValue={att.score || ""}
                                      onBlur={(e) => {
                                        if (e.target.value !== (att.score || "")) {
                                          handleSaveStudentScore(att, e.target.value);
                                        }
                                      }}
                                    />
                                    {att.imageUrl && att.score && (
                                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                        <Sparkles size={10} />
                                        จากรูปหลักฐาน
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Roster Cards View (Visible on Small screens and below, optimized down to px-2 layout) */}
                    <div className="block md:hidden space-y-4">
                      {attendances.map((att) => {
                        const dateObj = new Date(att.date);
                        const formattedDate = isNaN(dateObj.getTime())
                          ? att.date
                          : dateObj.toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            });
                        const isUploading = uploadingRecordId === (att.id || att.date);

                        return (
                          <div
                            key={att.id || att.date}
                            className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 border border-zinc-150 dark:border-zinc-800 space-y-4 shadow-xs"
                          >
                            {/* Date and Status Badge Row */}
                            <div className="flex justify-between items-center border-b dark:border-zinc-800 pb-2">
                              <span className="text-sm font-black text-zinc-850 dark:text-zinc-200">
                                📅 {formattedDate}
                              </span>
                              <div className="flex gap-1.5">
                                {att.status === "Present" && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    ตรงเวลา
                                  </span>
                                )}
                                {att.status === "Late" && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    มาสาย
                                  </span>
                                )}
                                {att.status === "Absent" && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    ขาดเรียน
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Unit indicator tag */}
                            <div>
                              {att.unitId ? (
                                <span className="inline-block text-[10px] text-emerald-650 dark:text-emerald-400 font-black bg-emerald-500/10 px-2.5 py-1 rounded-lg w-full text-left">
                                  📖 หน่วยที่ {att.unitSequence || "-"}: {att.unitTitle}
                                </span>
                              ) : (
                                <span className="inline-block text-[10px] text-zinc-500 dark:text-zinc-400 font-bold bg-zinc-150 dark:bg-zinc-800 px-2.5 py-1 rounded-lg w-full text-left">
                                  🏫 เช็คชื่อในชั้นเรียนปกติ
                                </span>
                              )}
                            </div>

                            {/* Assignment and Score Row */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <span className="text-zinc-400 block text-[10px]">
                                  สถานะการส่งงาน
                                </span>
                                {att.assignmentStatus === "Submitted" && (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 block text-center w-full">
                                    ส่งงานแล้ว
                                  </span>
                                )}
                                {att.assignmentStatus === "Pending" && (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 block text-center w-full">
                                    ค้างส่ง
                                  </span>
                                )}
                                {att.assignmentStatus === "None" && (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] bg-zinc-150 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 block text-center w-full">
                                    ไม่มีงาน
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-zinc-400 block text-[10px] text-right">
                                  คะแนน / บันทึก
                                </span>
                                <div className="flex flex-col items-end gap-1">
                                  <input
                                    key={`mob-${att.id || att.date}-${att.score || ""}-${att.imageUrl || ""}`}
                                    type="text"
                                    placeholder="กรอกคะแนน"
                                    className="w-full max-w-[100px] border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-2 py-1 text-xs text-right focus:outline-hidden dark:text-white"
                                    defaultValue={att.score || ""}
                                    onBlur={(e) => {
                                      if (e.target.value !== (att.score || "")) {
                                        handleSaveStudentScore(att, e.target.value);
                                      }
                                    }}
                                  />
                                  {att.imageUrl && att.score && (
                                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                      <Sparkles size={8} />
                                      จากรูปหลักฐาน
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Image upload / evidence block */}
                            <div className="bg-zinc-100/50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <span className="text-[10px] font-black text-zinc-400">
                                รูปภาพหลักฐานคะแนน:
                              </span>
                              <div className="w-full sm:w-auto flex justify-end">
                                {isUploading ? (
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                    <span>กำลังอัปโหลด...</span>
                                  </div>
                                ) : att.imageUrl ? (
                                  <div className="flex items-center gap-3">
                                    <a
                                      href={att.imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={att.imageUrl}
                                        alt="Score evidence"
                                        className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 hover:scale-105 transition-transform"
                                      />
                                    </a>
                                    <div>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        id={`mob-change-file-${att.id || att.date}`}
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleStudentImageUpload(att, file);
                                        }}
                                      />
                                      <label
                                        htmlFor={`mob-change-file-${att.id || att.date}`}
                                        className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-[10px] font-black rounded-lg cursor-pointer transition-colors block text-center"
                                      >
                                        เปลี่ยนรูป
                                      </label>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-full sm:w-auto">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`mob-upload-file-${att.id || att.date}`}
                                      style={{ display: "none" }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleStudentImageUpload(att, file);
                                      }}
                                    />
                                    <label
                                      htmlFor={`mob-upload-file-${att.id || att.date}`}
                                      className="w-full justify-center px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 text-[10px] font-black rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                                    >
                                      <Upload size={12} />
                                      📎 อัปโหลดรูปคะแนน
                                    </label>
                                  </div>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIRTUAL STUDY ROOM OVERLAY */}
      <AnimatePresence>
        {activeStudyUnit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header Banner */}
              <div className="bg-linear-to-br from-emerald-500 to-teal-600 text-white p-6 relative">
                <button
                  onClick={() => {
                    if (activeStudyUnit.studyMinutes > 0 && !isStudyCompleted) {
                      if (
                        confirm(
                          "คุณต้องการออกจากห้องเรียนใช่หรือไม่? (การนับเวลาเพื่อเช็คชื่อจะหยุดลง)",
                        )
                      ) {
                        setActiveStudyUnit(null);
                      }
                    } else {
                      setActiveStudyUnit(null);
                    }
                  }}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/35 rounded-full transition-all text-white border-0 cursor-pointer flex items-center justify-center"
                >
                  <X size={18} />
                </button>
                <span className="bg-white/20 backdrop-blur-md text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full text-white/90">
                  ห้องเรียนเสมือนระบบออนไลน์ (DVE Virtual Study Room)
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
                  {activeStudyUnit.title}
                </h2>
                <p className="text-white/80 text-xs mt-1 font-bold">
                  วิชา: {activeSubject.name} ({activeSubject.code})
                </p>
              </div>

              {/* Study Area content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* ⏱️ TIMER BANNER */}
                {activeStudyUnit.studyMinutes > 0 && (
                  <div
                    className={`p-5 rounded-2xl border text-center transition-all ${
                      isStudyCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 animate-pulse"
                        : "bg-amber-500/5 border-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        {isStudyCompleted ? (
                          <Award size={36} className="text-emerald-500" />
                        ) : (
                          <Clock
                            size={36}
                            className="animate-spin text-amber-500"
                            style={{ animationDuration: "3s" }}
                          />
                        )}
                      </div>

                      {isStudyCompleted ? (
                        <div>
                          <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            🎉 เรียนครบเวลาและเช็คชื่อเข้าเรียนเสร็จสิ้น!
                          </h4>
                          <p className="text-xs text-emerald-500 mt-1 font-bold">
                            ท่านเข้าเรียนวิชานี้เรียบร้อยแล้ว สามารถศึกษาชีทดาวน์โหลด
                            หรือทำแบบทดสอบด้านล่างได้ทันที
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-black text-amber-700 dark:text-amber-400">
                            ⏳ ระบบกำลังจับเวลาเข้าเรียนของท่าน... ห้ามปิดหน้านี้
                          </h4>
                          <p className="text-xs text-amber-500/80 mt-1">
                            สะสมเวลาให้ครบ {activeStudyUnit.studyMinutes} นาที
                            เพื่อบันทึกชื่อเข้าเรียนอัตโนมัติ
                          </p>
                        </div>
                      )}

                      {/* Premium Timer Progress Bar */}
                      <div className="w-full max-w-md mt-4">
                        <div className="flex justify-between text-xs font-black mb-1">
                          <span>
                            สะสมเวลาแล้ว: {Math.floor(studySecondsElapsed / 60)} นาที{" "}
                            {studySecondsElapsed % 60} วินาที
                          </span>
                          <span>เป้าหมาย: {activeStudyUnit.studyMinutes} นาที</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              isStudyCompleted ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{
                              width: `${(studySecondsElapsed / (activeStudyUnit.studyMinutes * 60)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 📝 LESSON CONTENT */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
                    <BookOpen size={16} className="text-emerald-500" />
                    คำอธิบายและเนื้อหาหน่วยเรียน
                  </h3>
                  {activeStudyUnit.content ? (
                    <p className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border dark:border-zinc-800">
                      {activeStudyUnit.content}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">
                      ไม่มีรายละเอียดเนื้อหาของหน่วยเรียนนี้
                    </p>
                  )}
                </div>

                {/* 📂 DOWNLOAD FILES */}
                {(() => {
                  const directFiles = (activeStudyUnit.files || []).filter(
                    (f: any) =>
                      f.type === "file" ||
                      f.url?.startsWith("/uploads/") ||
                      f.url?.startsWith("/api/media/"),
                  );
                  const externalLinks = (activeStudyUnit.files || []).filter(
                    (f: any) => !directFiles.includes(f),
                  );

                  if (directFiles.length === 0 && externalLinks.length === 0) return null;

                  return (
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-zinc-950 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
                        <FolderOpen size={16} className="text-emerald-500" />
                        ไฟล์เอกสารและแหล่งดาวน์โหลดข้อมูล
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Direct Files */}
                        {directFiles.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider block">
                              📂 ไฟล์เอกสารประกอบการเรียน:
                            </span>
                            <div className="space-y-2">
                              {directFiles.map((file: any, fIdx: number) => (
                                <a
                                  key={fIdx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black transition-colors border border-emerald-500/10 cursor-pointer"
                                >
                                  <Download size={14} className="shrink-0" />
                                  <span className="truncate">
                                    {file.name || "เอกสารประกอบการเรียน"}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* External Links */}
                        {externalLinks.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider block">
                              🔗 ลิงก์และแหล่งข้อมูลภายนอก:
                            </span>
                            <div className="space-y-2">
                              {externalLinks.map((file: any, fIdx: number) => (
                                <a
                                  key={fIdx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black transition-colors border border-blue-500/10 cursor-pointer"
                                >
                                  <ExternalLink size={14} className="shrink-0" />
                                  <span className="truncate">
                                    {file.name || "เปิดแหล่งข้อมูลภายนอก"}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 📝 QUIZ REDIRECT */}
                {quizzes && quizzes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-950/10 border border-teal-500/10 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <span className="text-[9px] uppercase font-black text-teal-600 dark:text-teal-400 tracking-wider">
                        แบบทดสอบประเมินวิชาเรียน
                      </span>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">
                        {quizzes[0].title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      className={`px-4 py-2 text-xs font-black rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm border-0 ${
                        isStudyCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (!isStudyCompleted) {
                          message.warning(
                            `กรุณาเรียนรู้สะสมเวลาให้ครบอย่างน้อย ${activeStudyUnit.studyMinutes} นาทีก่อนทำแบบทดสอบประเมิน`,
                          );
                        } else {
                          handleOpenQuizFormGlobal(quizzes[0].googleFormUrl);
                        }
                      }}
                    >
                      เริ่มทำแบบทดสอบประเมิน
                      <ExternalLink size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button / Bottom Bar */}
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end border-t dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    if (activeStudyUnit.studyMinutes > 0 && !isStudyCompleted) {
                      if (
                        confirm(
                          "คุณต้องการออกจากห้องเรียนใช่หรือไม่? (การนับเวลาเพื่อเช็คชื่อจะหยุดลง)",
                        )
                      ) {
                        setActiveStudyUnit(null);
                      }
                    } else {
                      setActiveStudyUnit(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 transition-colors cursor-pointer border-0"
                >
                  {isStudyCompleted ? "เสร็จสิ้นการเรียนรู้ (ปิดหน้าต่าง)" : "ออกจากห้องเรียน"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// TEACHER WORKSPACE PORTAL COMPONENT
// -------------------------------------------------------------
function DVETeacherWorkspace() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"subjects" | "quizzes" | "checkin">("subjects");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

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
  });

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
    if (!quizForm.subjectId || !quizForm.title || !quizForm.googleFormUrl) {
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
        message.success(isEdit ? "แก้ไขควิซสำเร็จ" : "สร้างควิซสำเร็จ");
        setIsQuizModalOpen(false);
        handleLoadQuizzes(quizForm.subjectId);
        setQuizForm({
          id: "",
          subjectId: quizForm.subjectId,
          title: "",
          googleFormUrl: "",
          deadline: "",
        });
      }
    } catch (err) {
      message.error("บันทึกควิซล้มเหลว");
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
      message.error(err.message || "ไม่สามารถสลับสถานะการฝึกงานได้");
    }
  };

  const handleExtractScoreFromImage = async (studentId: string, imageUrl: string) => {
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
        setAttendanceRecords((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            status: prev[studentId]?.status || "Absent",
            assignmentStatus: prev[studentId]?.assignmentStatus || "None",
            score: formatScoreForStorage(extracted) || extracted.score!,
            imageUrl,
          },
        }));
        message.success(formatExtractedScoreMessage(extracted));
      } else {
        message.warning(formatExtractedScoreMessage(extracted || { score: null }));
      }
    } catch (err) {
      console.error("Teacher extract score error:", err);
      message.error("อ่านคะแนนจากรูปไม่สำเร็จ");
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
                      ยังไม่มีการสร้างแบบทดสอบ Google Form สำหรับวิชานี้
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 border dark:border-zinc-800/60 rounded-xl gap-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                              {quiz.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                              <span className="flex items-center gap-1">
                                <ExternalLink size={10} />
                                {quiz.googleFormUrl.substring(0, 40)}...
                              </span>
                              {quiz.deadline && (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Calendar size={10} />
                                  เดดไลน์: {quiz.deadline}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setQuizForm({ ...quiz });
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
                        <label className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 cursor-pointer select-none border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 rounded-lg">
                          <input
                            type="checkbox"
                            className="accent-indigo-500 w-3.5 h-3.5"
                            checked={showOnlyInternship}
                            onChange={(e) => setShowOnlyInternship(e.target.checked)}
                          />
                          💼 กรองเฉพาะเด็กฝึกงาน / ฝึกประสบการณ์วิชาชีพ
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
                              <th className="py-3">รหัสประจำตัว</th>
                              <th className="py-3">ชื่อ - นามสกุล</th>
                              <th className="py-3">กลุ่มเรียน</th>
                              <th className="py-3 text-center">สถานะเวลาเรียน</th>
                              <th className="py-3 text-center">การส่งการบ้าน / งาน</th>
                              <th className="py-3 text-right">คะแนน / หมายเหตุ</th>
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
                                  <td className="py-3.5">{student.studentIdNum}</td>
                                  <td className="py-3.5 flex items-center gap-2">
                                    {student.image ? (
                                      <img
                                        src={student.image}
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <User size={12} />
                                      </div>
                                    )}
                                    <span className="truncate">{student.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleInternship(student)}
                                      title="คลิกเพื่อสลับสถานะ (ออกฝึกงาน / เรียนปกติ)"
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border transition-all duration-350 hover:scale-105 active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                                        student.isInternship
                                          ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50"
                                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-750 hover:border-zinc-400"
                                      }`}
                                    >
                                      {student.isInternship ? "💼 ออกฝึกงาน" : "🏫 เรียนปกติ"}
                                    </button>
                                    {studentSubmissionsById[student.id]?.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                                        {studentSubmissionsById[student.id].map((att, idx) => (
                                          <span
                                            key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                                            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 font-black"
                                          >
                                            หน่วยที่ {att.unitSequence || "-"}:{" "}
                                            {att.unitTitle || "-"}
                                            {att.assignmentStatus === "Submitted"
                                              ? "✅"
                                              : att.assignmentStatus === "Pending"
                                                ? "⌛"
                                                : "❌"}
                                            {att.score ? ` ${att.score}` : ""}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5">{student.classGroupId}</td>
                                  <td className="py-3.5">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              status: "Present",
                                            },
                                          }))
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.status === "Present" ? "bg-emerald-500 text-white shadow-sm" : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100"}`}
                                      >
                                        ตรงเวลา
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: { ...prev[student.id], status: "Late" },
                                          }))
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.status === "Late" ? "bg-amber-500 text-white shadow-sm" : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100"}`}
                                      >
                                        มาสาย
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: { ...prev[student.id], status: "Absent" },
                                          }))
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.status === "Absent" ? "bg-rose-500 text-white shadow-sm" : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100"}`}
                                      >
                                        ขาดเรียน
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3.5">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              assignmentStatus: "None",
                                            },
                                          }))
                                        }
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.assignmentStatus === "None" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" : "bg-zinc-50 dark:bg-zinc-850/40 text-zinc-400 hover:bg-zinc-100"}`}
                                      >
                                        ไม่มีงาน
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              assignmentStatus: "Submitted",
                                            },
                                          }))
                                        }
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.assignmentStatus === "Submitted" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-zinc-50 dark:bg-zinc-850/40 text-zinc-400 hover:bg-zinc-100"}`}
                                      >
                                        ส่งแล้ว
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAttendanceRecords((prev) => ({
                                            ...prev,
                                            [student.id]: {
                                              ...prev[student.id],
                                              assignmentStatus: "Pending",
                                            },
                                          }))
                                        }
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${rec.assignmentStatus === "Pending" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-zinc-50 dark:bg-zinc-850/40 text-zinc-400 hover:bg-zinc-100"}`}
                                      >
                                        ค้างส่ง
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    <div className="flex flex-col items-end gap-1">
                                      <div className="flex items-center justify-end gap-2">
                                        {rec.imageUrl && (
                                          <a
                                            href={rec.imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="ดูรูปภาพคะแนนดิบที่นักเรียนส่ง"
                                            className="shrink-0"
                                          >
                                            <img
                                              src={rec.imageUrl}
                                              alt="Evidence"
                                              className="w-7 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 object-cover hover:scale-110 transition-transform cursor-pointer shadow-xs"
                                            />
                                          </a>
                                        )}
                                        {rec.imageUrl && (
                                          <button
                                            type="button"
                                            title="อ่านคะแนนจากรูปอัตโนมัติ"
                                            disabled={extractingScoreStudentId === student.id}
                                            onClick={() =>
                                              handleExtractScoreFromImage(student.id, rec.imageUrl!)
                                            }
                                            className="px-2 py-1 rounded-lg text-[9px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/15 disabled:opacity-50 flex items-center gap-1"
                                          >
                                            {extractingScoreStudentId === student.id ? (
                                              <Loader2 size={10} className="animate-spin" />
                                            ) : (
                                              <Sparkles size={10} />
                                            )}
                                            อ่านจากรูป
                                          </button>
                                        )}
                                        <input
                                          type="text"
                                          placeholder="คะแนน/บันทึก"
                                          className="w-24 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded px-2 py-1 text-xs text-right focus:outline-hidden dark:text-white"
                                          value={rec.score}
                                          onChange={(e) =>
                                            setAttendanceRecords((prev) => ({
                                              ...prev,
                                              [student.id]: {
                                                ...prev[student.id],
                                                score: e.target.value,
                                              },
                                            }))
                                          }
                                        />
                                      </div>
                                      {rec.imageUrl && rec.score && (
                                        <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                          คะแนนจากรูปหลักฐาน (ตรวจสอบก่อนบันทึก)
                                        </span>
                                      )}
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
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                    <User size={16} />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-black text-zinc-950 dark:text-zinc-50 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                                    {student.name}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleInternship(student)}
                                      title="คลิกเพื่อสลับสถานะ (ออกฝึกงาน / เรียนปกติ)"
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black border transition-all duration-350 hover:scale-105 active:scale-95 cursor-pointer shadow-sm shrink-0 ${
                                        student.isInternship
                                          ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50"
                                          : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-750 hover:border-zinc-400"
                                      }`}
                                    >
                                      {student.isInternship ? "💼 ออกฝึกงาน" : "🏫 เรียนปกติ"}
                                    </button>
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                                    ID: {student.studentIdNum} • กลุ่ม: {student.classGroupId}
                                  </p>
                                  {studentSubmissionsById[student.id]?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-600 dark:text-zinc-400">
                                      {studentSubmissionsById[student.id].map((att, idx) => (
                                        <span
                                          key={`${att.unitId || idx}-${att.studentId}-${att.date}`}
                                          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 font-black"
                                        >
                                          หน่วยที่ {att.unitSequence || "-"}: {att.unitTitle || "-"}
                                          {att.assignmentStatus === "Submitted"
                                            ? "✅"
                                            : att.assignmentStatus === "Pending"
                                              ? "⌛"
                                              : "❌"}
                                          {att.score ? ` ${att.score}` : ""}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Check-in Status Section */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                  สถานะเวลาเรียน
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], status: "Present" },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-xs font-black transition-all ${rec.status === "Present" ? "bg-emerald-500 text-white shadow-sm" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"}`}
                                  >
                                    ตรงเวลา
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], status: "Late" },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-xs font-black transition-all ${rec.status === "Late" ? "bg-amber-500 text-white shadow-sm" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"}`}
                                  >
                                    มาสาย
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: { ...prev[student.id], status: "Absent" },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-xs font-black transition-all ${rec.status === "Absent" ? "bg-rose-500 text-white shadow-sm" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"}`}
                                  >
                                    ขาดเรียน
                                  </button>
                                </div>
                              </div>

                              {/* Assignment Status Section */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                                  การส่งการบ้าน / งาน
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          assignmentStatus: "None",
                                        },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${rec.assignmentStatus === "None" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100"}`}
                                  >
                                    ไม่มีงาน
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          assignmentStatus: "Submitted",
                                        },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${rec.assignmentStatus === "Submitted" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100"}`}
                                  >
                                    ส่งแล้ว
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          assignmentStatus: "Pending",
                                        },
                                      }))
                                    }
                                    className={`py-2 rounded-xl text-[10px] font-black transition-all ${rec.assignmentStatus === "Pending" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-white dark:bg-zinc-900 border dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100"}`}
                                  >
                                    ค้างส่ง
                                  </button>
                                </div>
                              </div>

                              {/* Score & OCR Section */}
                              <div className="flex items-center justify-between border-t dark:border-zinc-800/80 pt-3 gap-2">
                                <div className="flex items-center gap-2">
                                  {rec.imageUrl && (
                                    <a
                                      href={rec.imageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0"
                                    >
                                      <img
                                        src={rec.imageUrl}
                                        alt="Evidence"
                                        className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 object-cover shadow-xs"
                                      />
                                    </a>
                                  )}
                                  {rec.imageUrl && (
                                    <button
                                      type="button"
                                      disabled={extractingScoreStudentId === student.id}
                                      onClick={() =>
                                        handleExtractScoreFromImage(student.id, rec.imageUrl!)
                                      }
                                      className="px-2.5 py-1.5 rounded-xl text-[9px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/15 disabled:opacity-50 flex items-center gap-1"
                                    >
                                      {extractingScoreStudentId === student.id ? (
                                        <Loader2 size={10} className="animate-spin" />
                                      ) : (
                                        <Sparkles size={10} />
                                      )}
                                      อ่านรูป
                                    </button>
                                  )}
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <input
                                    type="text"
                                    placeholder="คะแนน/บันทึก"
                                    className="w-28 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 py-1.5 text-xs text-right focus:outline-hidden dark:text-white"
                                    value={rec.score}
                                    onChange={(e) =>
                                      setAttendanceRecords((prev) => ({
                                        ...prev,
                                        [student.id]: {
                                          ...prev[student.id],
                                          score: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                  {rec.imageUrl && rec.score && (
                                    <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400">
                                      คะแนนจากรูป (คลิกบันทึกข้างบน)
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
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODALS / FORMS (SUBJECT, UNIT, QUIZ)
          ------------------------------------------------------------- */}
      {/* 1. Add/Edit Subject Modal */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-left"
            >
              <form onSubmit={handleSaveQuiz}>
                <div className="px-6 py-4 border-b dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                    {quizForm.id ? "แก้ไขแบบทดสอบ" : "สร้างแบบทดสอบ Google Form"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    ปิด
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      หัวข้อควิซ / แบบทดสอบ *
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ควิซหลังเรียนบทที่ 1"
                      required
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      ลิงก์ Google Form สอบออนไลน์ *
                    </label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/forms/d/..."
                      required
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
                      value={quizForm.googleFormUrl}
                      onChange={(e) =>
                        setQuizForm((prev) => ({ ...prev, googleFormUrl: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                      วันหมดเขต (เดดไลน์)
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-3 text-sm focus:outline-hidden dark:text-white"
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
                    className="px-5 py-2.5 rounded-lg text-xs font-black text-zinc-500 hover:bg-zinc-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    สร้างควิซสอบ
                  </button>
                </div>
              </form>
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
