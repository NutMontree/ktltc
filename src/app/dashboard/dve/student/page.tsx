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
import { message, Popconfirm, Select } from "antd";
import { uploadFile } from "@/lib/upload";

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
                    <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase">
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
                    <span className="text-[9px] font-black text-zinc-450 dark:text-zinc-550 uppercase">
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
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-650">
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
                          <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-450 font-bold uppercase tracking-wider">
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
                                    <span className="text-sm font-black text-zinc-850 dark:text-zinc-200">
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
                                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-555 dark:text-zinc-400">
                                      ไม่มีงาน
                                    </span>
                                  )}
                                </td>
                                <td className="py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    {isUploading ? (
                                      <div className="flex items-center gap-1.5 text-xs text-zinc-555">
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
                                      className="w-20 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-2 py-1 text-xs text-right focus:outline-none dark:text-white"
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
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] bg-zinc-150 dark:bg-zinc-800 text-zinc-555 dark:text-zinc-400 block text-center w-full">
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
                                    className="w-full max-w-[100px] border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-lg px-2 py-1 text-xs text-right focus:outline-none dark:text-white"
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
                                  <div className="flex items-center gap-1.5 text-xs text-zinc-555">
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
                  <h3 className="text-sm font-black text-zinc-955 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
                    <BookOpen size={16} className="text-emerald-500" />
                    คำอธิบายและเนื้อหาหน่วยเรียน
                  </h3>
                  {activeStudyUnit.content ? (
                    <p className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border dark:border-zinc-800">
                      {activeStudyUnit.content}
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-450 italic">
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
                      <h3 className="text-sm font-black text-zinc-955 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
                        <FolderOpen size={16} className="text-emerald-500" />
                        ไฟล์เอกสารและแหล่งดาวน์โหลดข้อมูล
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Direct Files */}
                        {directFiles.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider block">
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
                            <span className="text-[10px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-wider block">
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
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-650 cursor-not-allowed"
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

function StudentPortalContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <DVELoader />;
  }

  if (!session) return null;

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
      <DVEStudentPortal />
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<DVELoader />}>
      <StudentPortalContent />
    </Suspense>
  );
}
