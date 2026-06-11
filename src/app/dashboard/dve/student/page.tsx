"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
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
  Bell,
  XCircle,
  Info,
  ClipboardList,
  X,
  Sparkles,
  FileText,
  Paperclip,
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

function getBangkokDateString(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value || "";
  const month = parts.find((part) => part.type === "month")?.value || "";
  const day = parts.find((part) => part.type === "day")?.value || "";
  return year && month && day ? `${year}-${month}-${day}` : "";
}

function resolveSessionClassGroup(user: any): string {
  return (
    user?.classGroup ||
    user?.classGroupId ||
    user?.groupCode ||
    user?.classroomName ||
    ""
  ).toString().trim();
}

function resolveUnitCheckinStatus(unit: any, todayStr: string): "Present" | "Late" {
  const dueDate = String(unit?.dueDate || "").trim();
  if (dueDate) {
    return todayStr > dueDate ? "Late" : "Present";
  }

  const createdAt = getBangkokDateString(unit?.createdAt);
  if (createdAt) {
    return todayStr > createdAt ? "Late" : "Present";
  }

  return "Present";
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
    assignmentName: "",
    timePeriod: "all", // all, today, week, month, semester
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
  const [taskView, setTaskView] = useState<"todo" | "submitted">("todo");

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Student in-app quiz states
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; maxScore: number } | null>(null);

  // DVE Virtual Study Room timer states
  const [activeStudyUnit, setActiveStudyUnit] = useState<any>(null);
  const [unitQuizMode, setUnitQuizMode] = useState<"pretest" | "learning" | "posttest" | null>(
    null,
  );
  const [studySecondsElapsed, setStudySecondsElapsed] = useState<number>(0);
  const [isStudyCompleted, setIsStudyCompleted] = useState<boolean>(false);
  const [isMinimumTimeReached, setIsMinimumTimeReached] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMinimumTimeReachedRef = useRef(false);
  const timerActiveRef = useRef(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState<boolean>(false);
  const [uploadingRecordId, setUploadingRecordId] = useState<string | null>(null);

  // Submission modal state
  const [imageModalAtt, setImageModalAtt] = useState<any | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  // File preview sub-modal state (opens inside submission modal)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string | null>(null);
  const openImageModal = (att: any) => {
    setImageModalAtt(att);
    setImageModalOpen(true);
  };
  const closeImageModal = () => {
    setImageModalOpen(false);
    setImageModalAtt(null);
    setFilePreviewUrl(null);
    setFilePreviewName(null);
  };

  const handleStudentWorkUpload = async (quizId: string, file: File) => {
    if (!file || !session?.user || !activeSubject) return;

    setUploadingRecordId(quizId);
    try {
      message.loading({
        content: "กำลังอัปโหลดไฟล์งานไปยังเซิร์ฟเวอร์...",
        key: "dve-work-upload",
        duration: 0,
      });
      const res = await uploadFile(file, "dve_evidence");
      message.destroy("dve-work-upload");

      if (res && res.secure_url) {
        const payload = {
          quizId: quizId,
          fileUrl: res.secure_url,
          fileName: file.name,
        };

        const saveRes = await fetch("/api/dve/quizzes/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (saveRes.ok) {
          const data = await saveRes.json();
          if (data.success) {
            message.success("อัปโหลดไฟล์งานสำเร็จแล้ว!");
            // Refresh quizzes list in local state
            setQuizzes((prev) =>
              prev.map((q) =>
                q.id === quizId
                  ? { ...q, isSubmitted: true, fileUrl: res.secure_url, fileName: file.name }
                  : q,
              ),
            );

            // Refresh attendance list
            const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
            if (attRes.ok) {
              const attData = await attRes.json();
              if (attData.success) setAttendances(attData.attendances || []);
            }
          } else {
            message.error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
          }
        } else {
          message.error("บันทึกข้อมูลล้มเหลว");
        }
      } else {
        message.error("อัปโหลดไฟล์งานล้มเหลว");
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

  const handleOpenQuizFormGlobal = async (quiz: any) => {
    if (!quiz) return;

    if (quiz.isBuiltIn) {
      let processedQuiz = { ...quiz };
      if (quiz.isShuffle && quiz.questions && quiz.questions.length > 0) {
        const shuffledQuestions = [...quiz.questions];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQuestions[i], shuffledQuestions[j]] = [
            shuffledQuestions[j],
            shuffledQuestions[i],
          ];
        }
        processedQuiz.questions = shuffledQuestions;
      }
      setActiveQuiz(processedQuiz);
      const initialAnswers = (processedQuiz.questions || []).map((q: any) => ({
        questionId: q.id,
        answer: q.type === "checkboxes" ? [] : "",
      }));
      setQuizAnswers(initialAnswers);
      setQuizResult(null);
      setIsQuizModalOpen(true);
      return;
    }

    // External Google Form URL logic
    const url = quiz.googleFormUrl || "";
    window.open(url, "_blank");
    if (!session?.user || !activeSubject) return;

    // Mark this quiz as submitted in local state
    setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? { ...q, isSubmitted: true } : q)));

    try {
      // Record a dummy submission in the database to prevent doing it again
      fetch("/api/dve/quizzes/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: [{ questionId: "external", answer: "clicked" }],
        }),
      }).catch(() => { });

      const todayStr = getBangkokDateString(new Date());
      const user = session.user as any;
      const checkinStatus = resolveUnitCheckinStatus(activeStudyUnit, todayStr);
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
            classGroupId: resolveSessionClassGroup(user),
            status: existingToday ? existingToday.status : checkinStatus,
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

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !session?.user) return;

    // Validate that all questions are answered
    for (const q of activeQuiz.questions || []) {
      const studentAnsObj = quizAnswers.find((a) => String(a.questionId) === String(q.id));
      if (
        !studentAnsObj ||
        (q.type !== "checkboxes" && String(studentAnsObj.answer).trim() === "") ||
        (q.type === "checkboxes" &&
          (!Array.isArray(studentAnsObj.answer) || studentAnsObj.answer.length === 0))
      ) {
        message.warning(`กรุณาตอบคำถามข้อ "${q.text}" ให้เรียบร้อยก่อนส่ง`);
        return;
      }
    }

    setSubmittingQuiz(true);
    try {
      const res = await fetch("/api/dve/quizzes/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: quizAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          message.success("ส่งกระดาษคำตอบสำเร็จแล้ว!");
          setQuizResult({
            score: data.score,
            maxScore: data.maxScore,
          });

          // Mark this quiz as submitted in local state
          setQuizzes((prev) =>
            prev.map((q) => (q.id === activeQuiz.id ? { ...q, isSubmitted: true } : q)),
          );

          // Refresh attendances log in background to sync the new score in DVE portal
          if (activeSubject) {
            const attRes = await fetch(`/api/dve/attendances?subjectId=${activeSubject.id}`);
            if (attRes.ok) {
              const attData = await attRes.json();
              if (attData.success) setAttendances(attData.attendances || []);
            }
          }
        } else {
          message.error(data.error || "ส่งข้อสอบล้มเหลว");
        }
      } else {
        message.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      }
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดระหว่างส่งข้อสอบ");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // Helper to save study progress directly to backend
  const handleSaveStudyProgressDirect = async (unitToCheck: any, seconds: number, isFinished: boolean = false) => {
    if (!session?.user || !activeSubject || !unitToCheck) return;
    try {
      const todayStr = getBangkokDateString(new Date());
      const user = session.user as any;
      const currentUnitId = unitToCheck.id || unitToCheck._id?.toString();

      // Find if we have already completed this unit on ANY day
      const alreadyCompletedAnyDay = attendances.some(
        (a) => a.unitId === currentUnitId && (a.status === "Present" || a.status === "Late")
      );
      if (alreadyCompletedAnyDay) {
        return; // Prevent duplicate check-in if already completed
      }

      // Find if we have an existing check-in record for today
      const existingToday = attendances.find(
        (a) =>
          a.date === todayStr &&
          a.unitId === currentUnitId,
      );

      // Determine correct status
      let currentStatus = "Studying";
      if (isFinished) {
        currentStatus = resolveUnitCheckinStatus(unitToCheck, todayStr);
      } else {
        const studyLimitSeconds = (Number(unitToCheck.studyMinutes) || 0) * 60;
        if (seconds >= studyLimitSeconds) {
          currentStatus = resolveUnitCheckinStatus(unitToCheck, todayStr);
        }
      }

      const payload = {
        subjectId: activeSubject.id,
        date: todayStr,
        records: [
          {
            studentId: user.id,
            studentName: user.name,
            studentIdNum: user.username || "",
            classGroupId: resolveSessionClassGroup(user),
            status: currentStatus,
            assignmentStatus: existingToday ? existingToday.assignmentStatus : "None",
            score: existingToday ? existingToday.score : "",
            imageUrl: existingToday ? existingToday.imageUrl || "" : "",
            unitId: currentUnitId,
            unitTitle: unitToCheck.title || "",
            unitSequence: unitToCheck.sequence !== undefined ? unitToCheck.sequence : "",
            studySeconds: seconds,
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
      console.error("Failed to save study progress:", err);
    }
  };

  const handleSaveStudyProgress = async (seconds: number, isFinished: boolean = false) => {
    if (!activeStudyUnit) return;
    await handleSaveStudyProgressDirect(activeStudyUnit, seconds, isFinished);
  };

  // Auto checkin handler when timer reaches limit
  const handleAutoCheckin = async (unitToCheck: any) => {
    if (!session?.user || !activeSubject || !unitToCheck) return;
    try {
      setIsSubmittingAttendance(true);
      const todayStr = getBangkokDateString(new Date());
      const user = session.user as any;
      const checkinStatus = resolveUnitCheckinStatus(unitToCheck, todayStr);
      const currentUnitId = unitToCheck.id || unitToCheck._id?.toString();

      // Find if we have an existing check-in record for today
      const existingToday = attendances.find(
        (a) =>
          a.date === todayStr &&
          a.unitId === currentUnitId,
      );

      const payload = {
        subjectId: activeSubject.id,
        date: todayStr,
        records: [
          {
            studentId: user.id,
            studentName: user.name,
            studentIdNum: user.username || "",
            classGroupId: resolveSessionClassGroup(user),
            status: checkinStatus,
            assignmentStatus: existingToday ? existingToday.assignmentStatus : "None",
            score: existingToday ? existingToday.score : "",
            imageUrl: existingToday ? existingToday.imageUrl || "" : "",
            unitId: currentUnitId,
            unitTitle: unitToCheck.title || "",
            unitSequence: unitToCheck.sequence !== undefined ? unitToCheck.sequence : "",
            studySeconds: (Number(unitToCheck.studyMinutes) || 0) * 60,
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
            "⚠️ เช็คชื่อเข้าเรียนสำเร็จ: แต่ท่านถูกบันทึกเป็น 'มาสาย' เนื่องจากเกินวันกำหนดของหน่วยเรียน!",
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

        // Check if there is a quiz available for this specific unit
        const targetQuizzes = quizzes.filter((q) => q.unitId === currentUnitId);

        if (targetQuizzes && targetQuizzes.length > 0) {
          // Find posttest or just use the first quiz for this unit
          const targetQuiz =
            targetQuizzes.find(
              (q) => q.title.toLowerCase().includes("post") || q.title.includes("หลังเรียน"),
            ) || targetQuizzes[0];
          message.loading("📝 เรียนจบเวลาแล้ว! กำลังเตรียมแบบทดสอบประเมินผล...", 3);
          setTimeout(() => {
            handleOpenQuizFormGlobal(targetQuiz);
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
  // Keep ref in sync with state
  useEffect(() => {
    isMinimumTimeReachedRef.current = isMinimumTimeReached;
  }, [isMinimumTimeReached]);

  // Periodic save of progress every 20 seconds
  useEffect(() => {
    if (studySecondsElapsed > 0 && studySecondsElapsed % 20 === 0) {
      handleSaveStudyProgress(studySecondsElapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studySecondsElapsed]);

  // Cleanup timer when study unit changes or unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        timerActiveRef.current = false;
      }
    };
  }, [activeStudyUnit]);

  // Start timer when entering learning mode
  useEffect(() => {
    // Only start timer when conditions are met and timer isn't already running
    if (!activeStudyUnit || unitQuizMode !== "learning" || timerActiveRef.current || isStudyCompleted) {
      return;
    }

    const studyLimitSeconds = (Number(activeStudyUnit.studyMinutes) || 0) * 60;
    const totalLimitSeconds = (Number(activeStudyUnit.totalMinutes) || Number(activeStudyUnit.studyMinutes) || 0) * 60;

    // หากหน่วยนี้ไม่ได้ตั้งเวลาไว้ ให้ข้ามการจับเวลาไปเลย
    if (totalLimitSeconds <= 0) {
      setIsStudyCompleted(true);
      setIsMinimumTimeReached(true);
      handleAutoCheckin(activeStudyUnit);
      return;
    }

    // Mark timer as active to prevent double-start
    timerActiveRef.current = true;

    timerRef.current = setInterval(() => {
      setStudySecondsElapsed((prev) => {
        const nextVal = prev + 1;

        // Check if minimum time is reached (use ref to avoid stale closure)
        if (!isMinimumTimeReachedRef.current && nextVal >= studyLimitSeconds) {
          setIsMinimumTimeReached(true);
          isMinimumTimeReachedRef.current = true;
          // Trigger auto check-in when minimum time is reached
          handleAutoCheckin(activeStudyUnit);
          message.success("เรียนครบเวลาขั้นต่ำแล้ว! บันทึกเข้าเรียนสำเร็จ สามารถทำแบบทดสอบได้ทันที");

          // Auto-forward to total limit seconds when minimum time is reached
          if (totalLimitSeconds > studyLimitSeconds) {
            return totalLimitSeconds;
          }
        }

        // Check if total time is reached
        if (nextVal >= totalLimitSeconds) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            timerActiveRef.current = false;
          }
          setIsStudyCompleted(true);
          handleSaveStudyProgress(totalLimitSeconds, true);

          // Automatically jump to Post-test if it exists and is not submitted
          const currentUnitIdStr = activeStudyUnit.id || activeStudyUnit._id?.toString();
          const posttest = quizzes.find(
            (q) =>
              q.unitId === currentUnitIdStr &&
              (q.title.includes("หลังเรียน") || q.title.toLowerCase().includes("post")),
          );
          if (posttest && !posttest.isSubmitted) {
            setUnitQuizMode("posttest");
            message.success("เรียนครบเวลาทั้งหมดแล้ว! กำลังเปิดแบบทดสอบหลังเรียน...");
            setTimeout(() => {
              handleOpenQuizFormGlobal(posttest);
            }, 500);
          } else {
            message.success("เรียนครบเวลาทั้งหมดแล้ว!");
          }

          return totalLimitSeconds;
        }
        return nextVal;
      });
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudyUnit, unitQuizMode]);

  // Handle Pre-test / Post-test flow when Quiz Modal is closed
  useEffect(() => {
    if (!isQuizModalOpen && activeStudyUnit) {
      if (unitQuizMode === "pretest") {
        const unitIdStr = activeStudyUnit.id || activeStudyUnit._id?.toString();
        const pretest = quizzes.find(
          (q) =>
            q.unitId === unitIdStr &&
            (q.title.includes("ก่อนเรียน") || q.title.toLowerCase().includes("pre")),
        );
        if (pretest?.isSubmitted) {
          // After pre-test is submitted, switch to learning mode (timer)
          // Reset timer tracking so the timer can start fresh
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          timerActiveRef.current = false;
          isMinimumTimeReachedRef.current = false;
          setStudySecondsElapsed(0);
          setIsStudyCompleted(false);
          setIsMinimumTimeReached(false);
          setUnitQuizMode("learning");
          message.success("ทำแบบทดสอบก่อนเรียนเสร็จสิ้น กำลังเริ่มจับเวลาเรียน...");
        } else {
          setActiveStudyUnit(null);
          setUnitQuizMode(null);
          message.warning("คุณต้องทำแบบทดสอบก่อนเรียนให้เสร็จก่อนเข้าสู่บทเรียน");
        }
      } else if (unitQuizMode === "posttest") {
        // After post-test is completed, return to learning mode
        setUnitQuizMode("learning");
        message.success("ทำแบบทดสอบหลังเรียนเสร็จสิ้น");
      }
    }
  }, [isQuizModalOpen, quizzes, activeStudyUnit, unitQuizMode]);

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
        if (unitsData.success) {
          const sortedUnits = (unitsData.units || []).sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            return (b.sequence || 0) - (a.sequence || 0);
          });
          setUnits(sortedUnits);
        }
        if (quizzesData.success) {
          const today = new Date().toISOString().split("T")[0];
          const filteredQuizzes = (quizzesData.quizzes || []).filter((q: any) => {
            if (!q.startDate) return true;
            return today >= q.startDate;
          });
          setQuizzes(filteredQuizzes);
        }
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
  const handleDepartmentChange = async (dept: string) => {
    setSearchState({
      department: dept,
      teacherId: "",
      subjectId: "",
      assignmentName: "",
      timePeriod: "all",
    });
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

            // Do not auto-select department from user profile to keep page clean
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

  // Stats calculators - Filter to show only study unit data (exclude internship/normal classroom data)
  const studyUnitAttendances = useMemo(() => attendances.filter((att) => att.unitId), [attendances]);
  const totalClasses = studyUnitAttendances.length;
  const presentClasses = studyUnitAttendances.filter((a) => a.status === "Present").length;
  const lateClasses = studyUnitAttendances.filter((a) => a.status === "Late").length;
  const absentClasses = studyUnitAttendances.filter((a) => a.status === "Absent").length;

  // คำนวณเปอร์เซ็นต์การเข้าเรียนแบบใหม่ (อิงตามเวลาเรียนรวม)
  const studiedMinutes = studyUnitAttendances.reduce((sum, att) => {
    // ให้เครดิตเวลาเรียนเต็มโควต้าของหน่วยนั้น ถ้านักเรียนเรียนผ่านแล้ว
    const unit = units.find((u) => u.id === att.unitId);
    return sum + (Number(unit?.totalMinutes) || 0);
  }, 0);

  const requiredTotalMinutes = (Number(activeSubject?.totalHours) || 0) * 60;

  // ถ้าครูตั้งค่าเวลาเรียนไว้ ให้ใช้สูตรใหม่ ถ้ายังไม่ตั้ง (วิชาเก่า) ให้ใช้สูตรเดิมไปก่อน
  const attendanceRate =
    requiredTotalMinutes > 0
      ? Math.min(100, Math.round((studiedMinutes / requiredTotalMinutes) * 100))
      : totalClasses > 0
        ? Math.round(((presentClasses + lateClasses * 0.5) / totalClasses) * 100)
        : 100;
  const submittedAssignments = studyUnitAttendances.filter((a) => a.assignmentStatus === "Submitted").length;
  const pendingAssignmentsCount = studyUnitAttendances.filter(
    (a) => a.assignmentStatus === "Pending",
  ).length;
  const unstudiedUnitsCount = Math.max(0, units.length - studyUnitAttendances.length);
  const missingTasksCount = unstudiedUnitsCount + pendingAssignmentsCount;

  // Generate notifications - Use filtered study unit attendances
  useEffect(() => {
    const newNotifications: any[] = [];

    // Notification for incomplete assignments
    const pendingAssignments = studyUnitAttendances.filter((a) => a.assignmentStatus === "Pending");
    if (pendingAssignments.length > 0) {
      newNotifications.push({
        id: "pending-assignments",
        type: "warning",
        title: "งานที่ค้างส่ง",
        message: `มี ${pendingAssignments.length} งานที่ยังไม่ได้ส่ง`,
        count: pendingAssignments.length,
      });
    }

    // Notification for new quizzes (not submitted)
    const newQuizzes = quizzes.filter((q) => !q.isSubmitted);
    if (newQuizzes.length > 0) {
      newNotifications.push({
        id: "new-quizzes",
        type: "info",
        title: "แบบทดสอบใหม่",
        message: `มี ${newQuizzes.length} แบบทดสอบที่ยังไม่ได้ทำ`,
        count: newQuizzes.length,
      });
    }

    // Notification for missed attendance
    const missedClasses = studyUnitAttendances.filter((a) => a.status === "Absent");
    if (missedClasses.length > 0) {
      newNotifications.push({
        id: "missed-attendance",
        type: "error",
        title: "ขาดเรียน",
        message: `ขาดเรียน ${missedClasses.length} ครั้ง`,
        count: missedClasses.length,
      });
    }

    setNotifications(newNotifications);
  }, [studyUnitAttendances, quizzes]);

  const getRoleThaiLabel = (role?: string) => {
    if (!role) return "นักเรียน / นักศึกษา";
    const r = role.toLowerCase();
    if (r === "super_admin") return "ผู้ดูแลระบบสูงสุด (Super Admin)";
    if (r === "admin") return "ผู้ดูแลระบบ (Admin)";
    if (r === "teacher") return "อาจารย์ / ครูผู้สอน (Teacher)";
    if (r === "student") return "นักเรียน / นักศึกษา (Student)";
    return role.toUpperCase();
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 px-4 py-4 sm:py-8 font-sans">
      {/* Student Portal Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-cyan-500 via-blue-600 to-blue-700 text-white p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 group">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <GraduationCap size={180} className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-2xl" />
        </div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none mix-blend-overlay" />
        <div className="absolute right-1/4 top-0 w-32 h-32 rounded-full bg-blue-300/20 blur-2xl pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <span className="bg-white/20 backdrop-blur-xl text-[10px] sm:text-xs uppercase font-black tracking-widest px-4 py-1.5 rounded-full text-white/95 border border-white/20 shadow-sm flex items-center gap-1.5 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              Student Learning Hub
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
              ศูนย์การศึกษาระบบทวิภาคี{" "}
              <span className="text-cyan-200 block sm:inline relative">
                (DVE Portal)
                <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-cyan-300/50 rounded-full"></div>
              </span>
            </h1>
            <p className="text-white/90 font-medium text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
              เข้าถึงเนื้อหาการเรียน ทำแบบทดสอบก่อน-หลังเรียน และส่งผลงานของคุณได้ทุกที่ทุกเวลาในรูปแบบห้องเรียนเสมือนจริง
            </p>
          </div>

          {/* User Profile Bento Box */}
          {session?.user && (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[24px] p-4 sm:p-5 flex items-center gap-4 shadow-xl min-w-[260px] sm:min-w-[300px] hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] overflow-hidden bg-linear-to-tr from-cyan-300 to-blue-400 text-white flex items-center justify-center font-black text-2xl shadow-inner border-2 border-white/30 shrink-0">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : session.user.name ? (
                  session.user.name.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <div className="space-y-1 overflow-hidden flex-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-cyan-200 tracking-widest block drop-shadow-sm">
                  ผู้ใช้งานระบบ
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white truncate leading-tight drop-shadow-sm">
                  {session.user.name}
                </h2>
                <p className="text-xs text-white/80 font-medium truncate bg-black/10 w-fit px-2 py-0.5 rounded-md mt-0.5">
                  {getRoleThaiLabel((session.user as any)?.role)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Search Filters (Glassmorphic Bento) */}
      <div className="bg-white/60 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
            ค้นหารายวิชาเรียนทวิภาคี
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] sm:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              1. เลือกแผนกวิชา
            </label>
            <Select
              placeholder="-- เลือกแผนกวิชา --"
              className="w-full h-10 sm:h-12 shadow-xs"
              value={searchState.department || undefined}
              onChange={(val) => handleDepartmentChange(val)}
              loading={loadingOptions}
              options={options.departments.map((d) => ({ label: d, value: d }))}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] sm:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              2. เลือกอาจารย์ผู้สอน
            </label>
            <Select
              placeholder="-- เลือกอาจารย์ --"
              className="w-full h-10 sm:h-12 shadow-xs"
              value={searchState.teacherId || undefined}
              onChange={(val) => handleTeacherChange(val)}
              options={options.teachers.map((t) => ({
                label: `${t.name} (${t.department || "ไม่ระบุแผนก"})`,
                value: t.id,
              }))}
              disabled={!searchState.department}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] sm:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              3. เลือกวิชาเรียน
            </label>
            <Select
              placeholder="-- เลือกวิชาเรียน --"
              className="w-full h-10 sm:h-12 shadow-xs"
              value={searchState.subjectId || undefined}
              onChange={handleSubjectSelect}
              options={options.subjects.map((s) => ({
                label: `[${s.code}] ${s.name} (${s.curriculum})`,
                value: s.id,
              }))}
              disabled={!searchState.teacherId || !searchState.department}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] sm:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              ค้นหาชื่องาน/แบบทดสอบ
            </label>
            <input
              type="text"
              placeholder="พิมพ์ชื่องาน..."
              className="w-full h-10 sm:h-12 border border-slate-200/80 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 rounded-xl px-3 sm:px-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder-zinc-400 font-bold shadow-xs transition-all"
              value={searchState.assignmentName}
              onChange={(e) =>
                setSearchState((prev) => ({ ...prev, assignmentName: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] sm:text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              ช่วงเวลา
            </label>
            <Select
              className="w-full h-10 sm:h-12 shadow-xs"
              value={searchState.timePeriod}
              onChange={(val) => setSearchState((prev) => ({ ...prev, timePeriod: val }))}
              options={[
                { label: "ทั้งหมด", value: "all" },
                { label: "วันนี้", value: "today" },
                { label: "สัปดาห์นี้", value: "week" },
                { label: "เดือนนี้", value: "month" },
                { label: "ภาคเรียนนี้", value: "semester" },
              ]}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loadingSubjectData && <DVELoader />}

        {!loadingSubjectData &&
          searchState.department &&
          searchState.teacherId &&
          searchState.subjectId &&
          activeSubject ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {/* Subject Roster Info & Personal Attendance Stats (Bento Grid Left Column) */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Course Info Card */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 sm:space-y-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-400/10 to-teal-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                <div className="p-3 bg-linear-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit shadow-inner">
                  <BookOpen size={24} className="drop-shadow-sm" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-100 dark:border-emerald-500/20">
                    {activeSubject.curriculum} • ภาคเรียน {activeSubject.semester} /{" "}
                    {activeSubject.academicYear}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1 leading-tight tracking-tight">
                    {activeSubject.name}
                  </h2>
                  <p className="text-xs font-bold text-zinc-500 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600"></span>
                    รหัสวิชา: {activeSubject.code}
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-5 flex items-center gap-3">
                  {activeSubject.teacherImage ? (
                    <img
                      src={activeSubject.teacherImage}
                      alt={activeSubject.teacherName || "อาจารย์ผู้สอน"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md ring-2 ring-emerald-500/20">
                      {activeSubject.teacherName?.charAt(0) || "A"}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      อาจารย์ผู้สอน
                    </p>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      {activeSubject.teacherName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task Completion Status */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookmarkCheck size={18} className="text-emerald-500 drop-shadow-sm" />
                  สถานะการทำงาน
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3.5 bg-linear-to-tr from-emerald-50 to-transparent dark:from-emerald-900/10 dark:to-transparent rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                        <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        เข้าเรียน/งานที่ส่งแล้ว
                      </span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {attendances.length} / {units.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-linear-to-tr from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent rounded-2xl border border-amber-100/50 dark:border-amber-800/30 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        หน่วยเรียน/งานที่ค้าง
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {missingTasksCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-linear-to-tr from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-2xl border border-blue-100/50 dark:border-blue-800/30 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <Award size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        แบบทดสอบที่ทำแล้ว
                      </span>
                    </div>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                      {quizzes.filter((q) => q.isSubmitted).length} / {quizzes.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-linear-to-tr from-rose-50 to-transparent dark:from-rose-900/10 dark:to-transparent rounded-2xl border border-rose-100/50 dark:border-rose-800/30 hover:border-rose-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-rose-100 dark:bg-rose-900/40 rounded-lg">
                        <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        งานทั้งหมดที่ค้าง
                      </span>
                    </div>
                    <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {missingTasksCount + quizzes.filter((q) => !q.isSubmitted).length}
                    </span>
                  </div>

                  {units.length > 0 &&
                    missingTasksCount === 0 &&
                    quizzes.filter((q) => q.isSubmitted).length === quizzes.length && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 p-3 mt-4 bg-linear-to-tr from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20"
                      >
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-xs font-black tracking-wide">ทำงานครบถ้วนแล้ว! 🎉</span>
                      </motion.div>
                    )}
                </div>
              </div>

              {/* Attendance Analytics Progress */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-tr from-emerald-400 to-teal-500 opacity-50" />
                <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-6">
                  สรุปประวัติเวลาเรียนของฉัน
                </h4>

                <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full bg-emerald-50 dark:bg-emerald-900/10 animate-pulse scale-110" />
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm relative z-10" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-100 dark:text-zinc-800"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-emerald-500"
                      fill="transparent"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 - (251.2 * attendanceRate) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center z-20">
                    <span className="text-3xl font-black text-zinc-900 dark:text-white drop-shadow-sm">
                      {attendanceRate}%
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      การเข้าเรียน
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-zinc-800/80 pt-5 text-xs font-bold">
                  <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 hover:-translate-y-1 transition-transform">
                    <span className="block text-lg font-black text-emerald-500 drop-shadow-sm">
                      {presentClasses}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ตรงเวลา</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 hover:-translate-y-1 transition-transform">
                    <span className="block text-lg font-black text-amber-500 drop-shadow-sm">{lateClasses}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">มาสาย</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white/50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/50 hover:-translate-y-1 transition-transform">
                    <span className="block text-lg font-black text-rose-500 drop-shadow-sm">{absentClasses}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ขาดเรียน</span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-linear-to-tr from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 rounded-2xl border border-teal-200/50 dark:border-teal-800/30 text-left flex justify-between items-center text-xs font-black text-teal-700 dark:text-teal-400">
                  <span className="flex items-center gap-1.5">
                    <Upload size={14} className="text-teal-600" />
                    ส่งการบ้านสำเร็จ:
                  </span>
                  <span className="bg-white/60 dark:bg-black/20 px-2 py-1 rounded-lg">{submittedAssignments} ชิ้น</span>
                </div>
              </div>
            </div>

            {/* Units & Document Downloads & Quizzes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Units & Media Card */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-5 flex items-center gap-2.5 relative z-10">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <FolderOpen size={20} className="drop-shadow-sm" />
                  </div>
                  หน่วยการสอนและสื่อดาวน์โหลด
                </h3>
                {units.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-sm font-bold bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    ยังไม่มีหน่วยการเรียนรู้หรือสื่อการเรียนอัปเดตในขณะนี้
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10">
                    {units.map((unit, index) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => {
                          const unitIdStr = unit.id || unit._id?.toString();
                          const pretest = quizzes.find(
                            (q) =>
                              q.unitId === unitIdStr &&
                              (q.title.includes("ก่อนเรียน") ||
                                q.title.toLowerCase().includes("pre")),
                          );

                          // Find if there is an existing attendance record for this unit
                          const unitAtts = attendances.filter((a) => a.unitId === unitIdStr);
                          const existingAtt = unitAtts.sort((a, b) => (b.studySeconds || 0) - (a.studySeconds || 0))[0];

                          const studyLimitSeconds = (Number(unit.studyMinutes) || 0) * 60;
                          const totalLimitSeconds = (Number(unit.totalMinutes) || Number(unit.studyMinutes) || 0) * 60;

                          // Treat the unit as fully completed if they already checked in on a past day
                          const hasPastRecord = existingAtt && (existingAtt.status === "Present" || existingAtt.status === "Late" || (existingAtt.studySeconds || 0) >= studyLimitSeconds);
                          const savedSeconds = hasPastRecord ? Math.max((existingAtt?.studySeconds || 0), totalLimitSeconds) : (existingAtt?.studySeconds || 0);

                          const hasMetMinTime = savedSeconds >= studyLimitSeconds;
                          const isCompleted = savedSeconds >= totalLimitSeconds;

                          if (pretest && !pretest.isSubmitted) {
                            setUnitQuizMode("pretest");
                            // Clear any existing timer before starting a new one
                            if (timerRef.current) {
                              clearInterval(timerRef.current);
                              timerRef.current = null;
                            }
                            timerActiveRef.current = false;
                            isMinimumTimeReachedRef.current = hasMetMinTime;
                            setActiveStudyUnit(unit);
                            setStudySecondsElapsed(savedSeconds);
                            setIsStudyCompleted(isCompleted);
                            setIsMinimumTimeReached(hasMetMinTime);
                            message.info("พบแบบทดสอบก่อนเรียน กรุณาทำแบบทดสอบก่อนเรียนก่อนเข้าสู่บทเรียน");
                            handleOpenQuizFormGlobal(pretest);
                            return;
                          }

                          setUnitQuizMode("learning");
                          // Clear any existing timer before starting a new one
                          if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                          }
                          timerActiveRef.current = false;
                          isMinimumTimeReachedRef.current = hasMetMinTime;
                          setActiveStudyUnit(unit);
                          setStudySecondsElapsed(savedSeconds);
                          setIsStudyCompleted(isCompleted);
                          setIsMinimumTimeReached(hasMetMinTime);

                          // Save progress once on entry if not already completed/checked-in
                          if (!hasMetMinTime && existingAtt?.status !== "Present" && existingAtt?.status !== "Late") {
                            setTimeout(() => {
                              handleSaveStudyProgressDirect(unit, savedSeconds);
                            }, 100);
                          }
                        }}
                        className="w-full text-left p-4 bg-white/50 dark:bg-zinc-800/50 hover:bg-linear-to-tr hover:from-emerald-50/50 hover:to-transparent dark:hover:from-emerald-900/10 dark:hover:to-transparent rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300 border border-slate-100 dark:border-zinc-700/50 shadow-sm hover:shadow-md hover:border-emerald-200/50 dark:hover:border-emerald-800/50 hover:-translate-y-0.5 group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-[11px] shadow-inner border border-emerald-200/30 dark:border-emerald-700/30 shrink-0 transition-transform group-hover:scale-110">
                            EP.{unit.sequence || index + 1}
                          </div>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 sm:line-clamp-1">
                            {unit.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 shrink-0 ml-12 sm:ml-0">
                          {Number(unit.studyMinutes) > 0 && (
                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-800/30 flex items-center gap-1">
                              <Clock3 size={12} />
                              {unit.studyMinutes} นาที
                            </span>
                          )}
                          {unit.dueDate && (
                            <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-800/30 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatThaiDateDisplay(unit.dueDate)}
                            </span>
                          )}
                          <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ml-1">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* บันทึกเวลาเรียนและการส่งหลักฐานคะแนน */}
              <div className="bg-white/70 backdrop-blur-xl dark:bg-zinc-900/80 border border-white/50 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <ClipboardList size={20} className="drop-shadow-sm" />
                    </div>
                    บันทึกเวลาเรียนและการส่งหลักฐานคะแนน
                  </h3>
                  <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    วันที่: {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {attendances.length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 dark:text-zinc-500 text-sm font-bold bg-zinc-50/50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
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
                            <th className="py-3 text-center">ส่งงาน/เอกสารเพิ่มเติม</th>
                            <th className="py-3 text-right">คะแนนสอบรวม</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                          {attendances
                            .filter((att) => att.unitId) // Filter to show only records with unitId (study units)
                            .map((att) => {
                              const dateObj = new Date(att.date);
                              const formattedDate = isNaN(dateObj.getTime())
                                ? att.date
                                : dateObj.toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                });

                              const isUploading = uploadingRecordId !== null;

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
                                    {att.status === "Studying" && (
                                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                        กำลังเรียน
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
                                    <div className="flex items-center justify-center">
                                      {isUploading ? (
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-555">
                                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                          <span>กำลังโหลด...</span>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setImageModalAtt({});
                                            setImageModalOpen(true);
                                          }}
                                          className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 text-[10px] font-black rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                                        >
                                          <Upload size={11} />
                                          <span>📎 จัดการส่งงาน/เอกสาร</span>
                                          {quizzes.filter((q) => q.fileUrl).length > 0 && (
                                            <span className="ml-1 bg-emerald-500 text-white rounded-full px-1.5 py-0.2 text-[8px] font-black leading-none">
                                              {quizzes.filter((q) => q.fileUrl).length}
                                            </span>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 text-right">
                                    <div className="flex items-center justify-end">
                                      {att.score ? (
                                        <span className="text-sm font-black text-zinc-850 dark:text-zinc-100 tabular-nums">
                                          {att.score} คะแนน
                                        </span>
                                      ) : (
                                        <span className="text-xs text-zinc-400 font-bold">-</span>
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
                      {attendances
                        .filter((att) => att.unitId) // Filter to show only records with unitId (study units)
                        .map((att) => {
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
                                  {(!att.assignmentStatus || att.assignmentStatus === "None") && (
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[10px]">
                                      ไม่มีงาน
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1.5">
                                  <span className="text-zinc-400 block text-[10px]">
                                    คะแนนสอบรวม
                                  </span>
                                  <span className="font-black text-cyan-600 dark:text-cyan-400">
                                    {att.score ? `${att.score} คะแนน` : "-"}
                                  </span>
                                </div>
                              </div>

                              {/* Action Row */}
                              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <button
                                  onClick={() => {
                                    openImageModal(att);
                                  }}
                                  className="text-cyan-600 dark:text-cyan-400 text-xs font-bold hover:underline flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-xl transition-colors"
                                >
                                  <Paperclip size={14} />
                                  จัดการส่งงาน/เอกสาร
                                </button>

                                {att.imageUrl && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setFilePreviewUrl(att.imageUrl);
                                        setFilePreviewName(`เอกสารแนบ - ${att.date}`);
                                      }}
                                      className="text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                      title="ดูไฟล์แนบ"
                                    >
                                      <FileText size={18} />
                                    </button>
                                  </div>
                                )}
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
        ) : (
          !loadingSubjectData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="text-center py-20 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-3xl max-w-2xl mx-auto flex flex-col items-center justify-center gap-4 shadow-sm"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                <BookOpen size={28} />
              </div>
              <div className="space-y-2 px-6">
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  กรุณาเลือกข้อมูลเพื่อแสดงรายละเอียดรายวิชา
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-medium">
                  กรุณาเลือก <b>แผนกวิชา</b>, <b>อาจารย์ผู้สอน</b> และ <b>รายวิชาทวิภาคี</b>{" "}
                  ให้ครบทั้ง 3 รายการด้านบน เพื่อเปิดหอเรียนรู้เสมือนจริง ดาวน์โหลดเอกสารประกอบ
                  และเช็คชื่อเข้าเรียนครับ
                </p>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* VIRTUAL STUDY ROOM OVERLAY */}
      <AnimatePresence>
        {activeStudyUnit && unitQuizMode !== "pretest" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
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
                    if (Number(activeStudyUnit.studyMinutes) > 0 && !isStudyCompleted) {
                      if (
                        confirm(
                          "คุณต้องการออกจากห้องเรียนใช่หรือไม่? (การนับเวลาเพื่อเช็คชื่อจะหยุดลง)",
                        )
                      ) {
                        if (timerRef.current) {
                          clearInterval(timerRef.current);
                          timerRef.current = null;
                        }
                        timerActiveRef.current = false;
                        handleSaveStudyProgress(studySecondsElapsed);
                        setActiveStudyUnit(null);
                        setUnitQuizMode(null);
                      }
                    } else {
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      timerActiveRef.current = false;
                      handleSaveStudyProgress(studySecondsElapsed);
                      setActiveStudyUnit(null);
                      setUnitQuizMode(null);
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
                {Number(activeStudyUnit.studyMinutes) > 0 && (
                  <div
                    className={`p-6 rounded-[24px] border relative overflow-hidden transition-all duration-500 ${isStudyCompleted
                      ? "bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                      : "bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border-amber-200 dark:border-amber-800/50 shadow-sm"
                      }`}
                  >
                    {isStudyCompleted && (
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
                    )}
                    <div className="flex flex-col items-center gap-4 relative z-10">
                      <div className="flex items-center gap-3">
                        {isStudyCompleted ? (
                          <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-2xl shadow-inner">
                            <Award size={36} className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm animate-pulse" />
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-2xl shadow-inner relative">
                            <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 dark:border-amber-500 border-t-transparent border-r-transparent animate-spin opacity-50"></div>
                            <Clock
                              size={36}
                              className="text-amber-600 dark:text-amber-400 drop-shadow-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        {isStudyCompleted ? (
                          <>
                            <h4 className="text-lg font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                              🎉 เรียนครบเวลาทั้งหมดแล้ว!
                            </h4>
                            <p className="text-[13px] text-emerald-600/90 dark:text-emerald-500/90 mt-1 font-bold">
                              ท่านเข้าเรียนวิชานี้เรียบร้อยแล้ว สามารถศึกษาชีทดาวน์โหลด หรือทำแบบทดสอบด้านล่างได้ทันที
                            </p>
                          </>
                        ) : isMinimumTimeReached ? (
                          <>
                            <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                              ✅ เรียนครบเวลาขั้นต่ำแล้ว! บันทึกเข้าเรียนสำเร็จ
                            </h4>
                            <p className="text-[13px] text-emerald-600/80 dark:text-emerald-500/80 mt-1 font-bold">
                              สามารถทำแบบทดสอบได้ทันที หรือศึกษาต่อจนครบเวลาทั้งหมด
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="text-base font-black text-amber-800 dark:text-amber-400 tracking-tight">
                              ⏳ ระบบกำลังจับเวลาเข้าเรียนของท่าน... ห้ามปิดหน้านี้
                            </h4>
                            <p className="text-[13px] text-amber-700/80 dark:text-amber-500/80 mt-1 font-bold">
                              สะสมเวลาให้ครบ {activeStudyUnit.studyMinutes} นาที เพื่อบันทึกชื่อเข้าเรียนอัตโนมัติ
                            </p>
                          </>
                        )}
                      </div>

                      {/* Premium Timer Progress Bar */}
                      <div className="w-full max-w-md mt-2 bg-white/50 dark:bg-zinc-950/50 p-4 rounded-[20px] border border-white/50 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
                        <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                            สะสมแล้ว: <span className="text-zinc-900 dark:text-white tabular-nums text-xs">{Math.floor(studySecondsElapsed / 60)} น. {studySecondsElapsed % 60} วิ.</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md">
                              ขั้นต่ำ: {Number(activeStudyUnit.studyMinutes)} น.
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-4 rounded-full overflow-hidden relative shadow-inner">
                          <div
                            className={`h-full transition-all duration-1000 relative ${isStudyCompleted ? "bg-linear-to-r from-emerald-400 to-emerald-500" : isMinimumTimeReached ? "bg-linear-to-r from-teal-400 to-emerald-500" : "bg-linear-to-r from-amber-400 to-orange-400"
                              }`}
                            style={{
                              width: `${(studySecondsElapsed / ((Number(activeStudyUnit.totalMinutes) || Number(activeStudyUnit.studyMinutes)) * 60)) * 100}%`,
                            }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[progress_1s_linear_infinite]" />
                          </div>
                          {/* Minimum time marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-zinc-900/20 dark:bg-zinc-100/30 shadow-[0_0_5px_rgba(0,0,0,0.5)] z-10"
                            style={{
                              left: `${(Number(activeStudyUnit.studyMinutes) / (Number(activeStudyUnit.totalMinutes) || Number(activeStudyUnit.studyMinutes))) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="mt-2 text-[10px] text-center font-bold text-zinc-400">
                          เป้าหมายสูงสุด: {Number(activeStudyUnit.totalMinutes) || Number(activeStudyUnit.studyMinutes)} นาที
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 📝 QUIZZES (Pre-test & Post-test) */}
                {(() => {
                  const currentUnitId = activeStudyUnit.id || activeStudyUnit._id?.toString();
                  const targetQuizzes = quizzes.filter((q) => q.unitId === currentUnitId);
                  const pretest = targetQuizzes.find((q) => q.quizType === "pretest" || q.title?.includes("ก่อนเรียน"));
                  const posttest = targetQuizzes.find((q) => q.quizType === "posttest" || q.title?.includes("หลังเรียน"));

                  if (!pretest && !posttest) return null;

                  return (
                    <div className="space-y-4 bg-zinc-50/50 dark:bg-zinc-800/30 p-5 rounded-[24px] border border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2 border-b pb-3 dark:border-zinc-800 border-zinc-200">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                          <BookmarkCheck size={16} />
                        </div>
                        แบบทดสอบประจำหน่วยเรียน
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pretest && (
                          <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${pretest.isSubmitted ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50 shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-lg'}`}>
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                                  Pre-test
                                </span>
                                {pretest.isSubmitted && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <CheckCircle size={10} /> ทำแล้ว
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">{pretest.title}</h4>
                            </div>
                            <button
                              onClick={() => {
                                setUnitQuizMode("pretest");
                                handleOpenQuizFormGlobal(pretest);
                              }}
                              disabled={pretest.isSubmitted}
                              className={`mt-4 py-2.5 px-4 rounded-xl text-xs font-black w-full transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${pretest.isSubmitted ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 active:scale-95'}`}
                            >
                              {pretest.isSubmitted ? 'ส่งคำตอบแล้ว' : 'ทำแบบทดสอบก่อนเรียน'}
                              {!pretest.isSubmitted && <ArrowRight size={14} />}
                            </button>
                          </div>
                        )}
                        {posttest && (
                          <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${posttest.isSubmitted ? 'bg-cyan-50/50 dark:bg-cyan-900/10 border-cyan-100 dark:border-cyan-800/50 shadow-sm' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-lg'}`}>
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/50 px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan-800/50">
                                  Post-test
                                </span>
                                {posttest.isSubmitted && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                    <CheckCircle size={10} /> ทำแล้ว
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">{posttest.title}</h4>
                            </div>
                            <button
                              onClick={() => {
                                if (!isMinimumTimeReached && !posttest.isSubmitted && Number(activeStudyUnit.studyMinutes) > 0) {
                                  message.warning(`กรุณาเรียนให้ครบเวลาขั้นต่ำ ${activeStudyUnit.studyMinutes} นาที ก่อนทำแบบทดสอบหลังเรียน`);
                                  return;
                                }
                                setUnitQuizMode("posttest");
                                handleOpenQuizFormGlobal(posttest);
                              }}
                              disabled={posttest.isSubmitted}
                              className={`mt-4 py-2.5 px-4 rounded-xl text-xs font-black w-full transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 ${posttest.isSubmitted ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : !isMinimumTimeReached && Number(activeStudyUnit.studyMinutes) > 0 ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-linear-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-[0_4px_14px_0_rgba(6,182,212,0.39)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.23)] hover:-translate-y-0.5 active:scale-95'}`}
                            >
                              {posttest.isSubmitted ? 'ส่งคำตอบแล้ว' : !isMinimumTimeReached && Number(activeStudyUnit.studyMinutes) > 0 ? 'ต้องเรียนให้ครบเวลาก่อน' : 'ทำแบบทดสอบหลังเรียน'}
                              {(!posttest.isSubmitted && (!Number(activeStudyUnit.studyMinutes) || isMinimumTimeReached)) && <ArrowRight size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {/* 📝 LESSON CONTENT */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-zinc-955 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-zinc-800">
                    <BookOpen size={16} className="text-emerald-500" />
                    คำอธิบายและเนื้อหาหน่วยเรียน
                  </h3>
                  {activeStudyUnit.content ? (
                    <p className="text-xs text-zinc-700   leading-relaxed whitespace-pre-line bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border dark:border-zinc-800">
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
                {(() => {
                  const currentUnitId = activeStudyUnit.id || activeStudyUnit._id?.toString();
                  const unitQuizzes = quizzes.filter((q) => q.unitId === currentUnitId);
                  if (unitQuizzes.length === 0) return null;

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black text-teal-600 dark:text-teal-400 tracking-wider block">
                          📝 แบบทดสอบของหน่วยเรียน ({unitQuizzes.length}):
                        </span>
                        {/* To-Do / Submitted Toggle */}
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1">
                          <button
                            onClick={() => setTaskView("todo")}
                            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${taskView === "todo"
                              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                              }`}
                          >
                            งานที่ต้องทำ
                          </button>
                          <button
                            onClick={() => setTaskView("submitted")}
                            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${taskView === "submitted"
                              ? "bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                              }`}
                          >
                            ส่งแล้ว
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {unitQuizzes
                          .filter((quiz: any) => {
                            if (taskView === "submitted") return quiz.isSubmitted;
                            return !quiz.isSubmitted;
                          })
                          .map((quiz: any, qIdx: number) => {
                            const isQuizSubmitted = !!quiz.isSubmitted;
                            return (
                              <div
                                key={quiz.id || qIdx}
                                className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-3 transition-all duration-300 ${isQuizSubmitted
                                  ? "bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800/80 opacity-75 animate-none"
                                  : "bg-teal-500/5 dark:bg-teal-950/10 border-teal-500/10"
                                  }`}
                              >
                                <div className="space-y-0.5 text-center sm:text-left">
                                  <span className="text-[9px] uppercase font-black text-teal-600 dark:text-teal-400 tracking-wider">
                                    แบบทดสอบวิชาเรียนที่ {qIdx + 1}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
                                    <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">
                                      {quiz.title}
                                    </h4>
                                    {quiz.quizType === "pretest" && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black leading-none border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                        ก่อนเรียน (Pre-test)
                                      </span>
                                    )}
                                    {quiz.quizType === "posttest" && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black leading-none border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                        หลังเรียน (Post-test)
                                      </span>
                                    )}
                                    {quiz.quizType === "general" && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black leading-none border bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20">
                                        ทั่วไป
                                      </span>
                                    )}
                                    {quiz.isBuiltIn && quiz.isShuffle && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black leading-none border bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20">
                                        🔀 สลับข้อ
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  disabled={isQuizSubmitted}
                                  className={`px-4 py-2 text-xs font-black rounded-lg inline-flex items-center gap-1.5 transition-all shadow-sm border-0 ${isQuizSubmitted
                                    ? "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-650 cursor-not-allowed select-none"
                                    : isMinimumTimeReached
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                      : "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-650 cursor-not-allowed"
                                    }`}
                                  onClick={() => {
                                    if (isQuizSubmitted) return;
                                    if (!isMinimumTimeReached) {
                                      message.warning(
                                        `กรุณาเรียนรู้สะสมเวลาให้ครบอย่างน้อย ${Number(activeStudyUnit.studyMinutes)} นาทีก่อนทำแบบทดสอบประเมิน`,
                                      );
                                    } else {
                                      handleOpenQuizFormGlobal(quiz);
                                    }
                                  }}
                                >
                                  {isQuizSubmitted ? (
                                    <>
                                      <CheckCircle size={12} className="text-emerald-500" />
                                      ทำแบบทดสอบแล้ว
                                    </>
                                  ) : (
                                    <>
                                      {quiz.isBuiltIn
                                        ? "เริ่มทำข้อสอบท้ายบทเรียน"
                                        : "เริ่มทำแบบทดสอบประเมิน"}
                                      {quiz.isBuiltIn ? (
                                        <ArrowRight size={12} />
                                      ) : (
                                        <ExternalLink size={12} />
                                      )}
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Close Button / Bottom Bar */}
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850/50 flex justify-end border-t dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    if (Number(activeStudyUnit.studyMinutes) > 0 && !isStudyCompleted) {
                      if (
                        confirm(
                          "คุณต้องการออกจากห้องเรียนใช่หรือไม่? (การนับเวลาเพื่อเช็คชื่อจะหยุดลง)",
                        )
                      ) {
                        if (timerRef.current) {
                          clearInterval(timerRef.current);
                          timerRef.current = null;
                        }
                        timerActiveRef.current = false;
                        handleSaveStudyProgress(studySecondsElapsed);
                        setActiveStudyUnit(null);
                        setUnitQuizMode(null);
                      }
                    } else {
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }
                      timerActiveRef.current = false;
                      handleSaveStudyProgress(studySecondsElapsed);
                      setActiveStudyUnit(null);
                      setUnitQuizMode(null);
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

      {/* 📝 In-App Google Forms Replica Quiz Filler Modal */}
      <AnimatePresence>
        {isQuizModalOpen && activeQuiz && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (
                  !quizResult &&
                  !confirm("คุณต้องการปิดข้อสอบนี้ใช่หรือไม่? (คำตอบที่ตอบไว้จะสูญหาย)")
                )
                  return;
                setIsQuizModalOpen(false);
              }}
              className="absolute inset-0 bg-slate-900/50 dark:bg-zinc-950/80 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f0ebf8] dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col my-8 border dark:border-zinc-800"
            >
              {/* iconic Google Forms top purple bar */}
              <div className="h-2.5 w-full bg-[#673ab7]" />

              <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                {!quizResult ? (
                  <>
                    {/* Header Card */}
                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-xs border-t-8 border-[#673ab7] space-y-3">
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                        {activeQuiz.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                          แบบทดสอบระบบเก็บคะแนนอัตโนมัติ
                        </span>
                        {activeQuiz.deadline && (
                          <span className="text-amber-500">เดดไลน์ส่ง: {activeQuiz.deadline}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold border-t dark:border-zinc-900 pt-3">
                        คำแนะนำ: กรุณาอ่านโจทย์และเลือกคำตอบที่ถูกต้องที่สุดให้ครบทุกข้อ
                        ระบบจะตรวจคะแนนและบันทึกคะแนนเข้าสู่สมุดเกรดอัตโนมัติเมื่อท่านส่งข้อสอบ
                      </p>
                    </div>

                    {/* Questions cards */}
                    <div className="space-y-4">
                      {(activeQuiz.questions || []).map((q: any, qIdx: number) => {
                        const studentAnsObj = quizAnswers.find(
                          (a) => String(a.questionId) === String(q.id),
                        );
                        const currentAnswer = studentAnsObj ? studentAnsObj.answer : "";

                        return (
                          <div
                            key={q.id}
                            className="p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-xs border dark:border-zinc-850 space-y-4 transition-all hover:border-[#673ab7]/30"
                          >
                            <div className="flex justify-between items-start gap-3">
                              <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                                {qIdx + 1}. {q.text} <span className="text-rose-500">*</span>
                              </h3>
                              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 px-2 py-0.5 rounded shrink-0 leading-none">
                                {q.points} คะแนน
                              </span>
                            </div>

                            {/* Multiple Choice Options */}
                            {q.type === "multiple_choice" && (
                              <div className="space-y-2.5">
                                {(q.options || []).map((opt: string, oIdx: number) => (
                                  <label
                                    key={oIdx}
                                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 hover:bg-purple-50/20 dark:hover:bg-purple-950/5 cursor-pointer transition-colors text-xs font-bold text-zinc-700 dark:text-zinc-350"
                                  >
                                    <input
                                      type="radio"
                                      name={`ans_${q.id}`}
                                      checked={currentAnswer === opt}
                                      onChange={() => {
                                        const updated = quizAnswers.map((a) =>
                                          String(a.questionId) === String(q.id)
                                            ? { ...a, answer: opt }
                                            : a,
                                        );
                                        setQuizAnswers(updated);
                                      }}
                                      className="w-4 h-4 accent-[#673ab7] cursor-pointer shrink-0"
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            )}

                            {/* Checkboxes Options */}
                            {q.type === "checkboxes" && (
                              <div className="space-y-2.5">
                                {(q.options || []).map((opt: string, oIdx: number) => {
                                  const currentArr = Array.isArray(currentAnswer)
                                    ? currentAnswer
                                    : [];
                                  const isChecked = currentArr.includes(opt);

                                  return (
                                    <label
                                      key={oIdx}
                                      className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 hover:bg-purple-50/20 dark:hover:bg-purple-950/5 cursor-pointer transition-colors text-xs font-bold text-zinc-700 dark:text-zinc-350"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          let nextArr = [...currentArr];
                                          if (e.target.checked) {
                                            nextArr.push(opt);
                                          } else {
                                            nextArr = nextArr.filter((v) => v !== opt);
                                          }
                                          const updated = quizAnswers.map((a) =>
                                            String(a.questionId) === String(q.id)
                                              ? { ...a, answer: nextArr }
                                              : a,
                                          );
                                          setQuizAnswers(updated);
                                        }}
                                        className="w-4 h-4 accent-[#673ab7] rounded cursor-pointer shrink-0"
                                      />
                                      {opt}
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* Short Answer text input */}
                            {q.type === "short_answer" && (
                              <div>
                                <input
                                  type="text"
                                  placeholder="พิมพ์คำตอบของคุณที่นี่..."
                                  value={(currentAnswer as string) || ""}
                                  onChange={(e) => {
                                    const updated = quizAnswers.map((a) =>
                                      String(a.questionId) === String(q.id)
                                        ? { ...a, answer: e.target.value }
                                        : a,
                                    );
                                    setQuizAnswers(updated);
                                  }}
                                  className="w-full h-10 border-0 border-b border-zinc-200 dark:border-zinc-800 bg-transparent py-2 text-xs font-bold text-zinc-800 dark:text-white focus:outline-hidden focus:border-[#673ab7] transition-all"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Form Controls */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("คุณต้องการออกจากแบบทดสอบใช่หรือไม่?")) {
                            setIsQuizModalOpen(false);
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-black text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-0 bg-transparent cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        disabled={submittingQuiz}
                        className="px-6 py-2.5 rounded-xl bg-[#673ab7] hover:bg-[#5e35b1] text-white text-xs font-black shadow-md cursor-pointer border-0 flex items-center gap-1.5"
                      >
                        {submittingQuiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            กำลังส่งข้อสอบ...
                          </>
                        ) : (
                          "ส่งแบบทดสอบ (Submit)"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* 🎉 Visual Congratulations Screen & Real-time Auto-Grading */
                  <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-zinc-950 rounded-xl shadow-xs border-t-8 border-emerald-500 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl mx-auto">
                        🎉
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                          ส่งกระดาษคำตอบเรียบร้อยแล้ว!
                        </h2>
                        <p className="text-xs text-zinc-400 font-bold">
                          ระบบประมวลผลการสอบและบันทึกคะแนนสะสมเข้าสู่รายงานฝึกงานเรียบร้อยแล้ว
                        </p>
                      </div>

                      {/* circular score badge */}
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl max-w-xs mx-auto border dark:border-purple-900/30">
                        <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                          คะแนนที่คุณสอบได้
                        </span>
                        <div className="text-3xl font-black text-purple-700 dark:text-purple-300 tabular-nums">
                          {quizResult.score}{" "}
                          <span className="text-sm text-zinc-400">
                            / {quizResult.maxScore} คะแนน
                          </span>
                        </div>
                        <span className="text-[9px] text-zinc-400 font-bold block mt-1">
                          (คิดเป็นเกรดสำเร็จรูป:{" "}
                          {Math.round((quizResult.score / (quizResult.maxScore || 1)) * 100)}%)
                        </span>
                      </div>
                    </div>

                    {/* Detailed Review Sheet */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 block">
                        แผ่นตรวจคำตอบของคุณ:
                      </h3>
                      <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                        {(activeQuiz.questions || []).map((q: any, qIdx: number) => {
                          const studentAnsObj = quizAnswers.find(
                            (a) => String(a.questionId) === String(q.id),
                          );
                          const studentAns = studentAnsObj ? studentAnsObj.answer : "";

                          let isCorrect = false;
                          if (q.type === "short_answer") {
                            isCorrect = studentAnsObj?.isCorrect !== false;
                          } else if (q.type === "multiple_choice") {
                            isCorrect =
                              String(studentAns || "")
                                .trim()
                                .toLowerCase() ===
                              String(q.correctAnswer || "")
                                .trim()
                                .toLowerCase();
                          } else if (q.type === "checkboxes") {
                            const sArr = Array.isArray(studentAns)
                              ? studentAns
                                .map((v) =>
                                  String(v || "")
                                    .trim()
                                    .toLowerCase(),
                                )
                                .sort()
                              : [];
                            const cArr = Array.isArray(q.correctAnswer)
                              ? q.correctAnswer
                                .map((v: any) =>
                                  String(v || "")
                                    .trim()
                                    .toLowerCase(),
                                )
                                .sort()
                              : [
                                String(q.correctAnswer || "")
                                  .trim()
                                  .toLowerCase(),
                              ];
                            isCorrect =
                              sArr.length === cArr.length && sArr.every((v, i) => v === cArr[i]);
                          }

                          return (
                            <div
                              key={q.id}
                              className="p-4 bg-white dark:bg-zinc-950 border dark:border-zinc-850 rounded-xl space-y-2"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                                  {qIdx + 1}. {q.text}
                                </span>
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isCorrect ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                                >
                                  {isCorrect ? `+${q.points} คะแนน` : "0 คะแนน"}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100 dark:border-zinc-900">
                                <div>
                                  <span className="text-zinc-400 font-bold block">
                                    คำตอบของคุณ:
                                  </span>
                                  <span
                                    className={`font-black ${isCorrect ? "text-emerald-600" : "text-rose-500"}`}
                                  >
                                    {Array.isArray(studentAns)
                                      ? studentAns.join(", ")
                                      : String(studentAns || "ไม่ได้ระบุ")}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-zinc-400 font-bold block">
                                    เฉลยที่ถูกต้อง:
                                  </span>
                                  <span className="text-zinc-600 dark:text-zinc-300 font-black">
                                    {activeQuiz.showCorrectAnswers ? (
                                      Array.isArray(q.correctAnswer)
                                        ? q.correctAnswer.join(", ")
                                        : String(q.correctAnswer || "ไม่ระบุเฉลย")
                                    ) : (
                                      <span className="text-zinc-400 font-bold italic">🔒 ปิดการแสดงเฉลย</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Close action */}
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setIsQuizModalOpen(false)}
                        className="px-8 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-700 dark:hover:bg-zinc-650 text-xs font-black shadow-md cursor-pointer border-0"
                      >
                        เสร็จสิ้นและปิดหน้าต่าง
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== STUDENT ADDITIONAL SUBMISSIONS MODAL ===== */}
      <AnimatePresence>
        {imageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md"
              onClick={closeImageModal}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="bg-linear-to-r from-emerald-500 to-teal-650 px-6 py-5 flex items-center justify-between text-white shadow-xs shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-100 uppercase tracking-widest block leading-none">
                    Student Submission Portal
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">
                    ส่งงานเพิ่มเติม หรือส่งเอกสารเพิ่มเติม
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all border-0 cursor-pointer text-white flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Active Subject Info */}
                {activeSubject && (
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col gap-1 text-left">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none">
                      รายวิชาปัจจุบัน
                    </span>
                    <h4 className="text-sm font-black text-zinc-850 dark:text-zinc-150 leading-normal">
                      [{activeSubject.code}] {activeSubject.name}
                    </h4>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      อาจารย์ผู้สอน: {activeSubject.teacherName || "ไม่ระบุ"}
                    </p>
                  </div>
                )}

                {/* Submissions List per Quiz Topic */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 pl-1">
                    <ClipboardList size={14} className="text-emerald-500" />
                    หัวข้อการส่งงานและแบบทดสอบแยกตามหัวข้อ
                  </h4>

                  {quizzes.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                      <ClipboardList
                        size={32}
                        className="text-zinc-350 dark:text-zinc-755 animate-pulse"
                      />
                      <p className="text-xs text-zinc-400 dark:text-zinc-555 font-black">
                        ยังไม่มีหัวข้อแบบทดสอบหรือการส่งงานในวิชานี้
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizzes.filter(quiz => {
                        if (!quiz.unitId) return true;

                        const unit = units.find(u => (u.id || u._id?.toString()) === quiz.unitId);
                        if (!unit) return false;

                        const hasAttendance = attendances.some(a => a.unitId === quiz.unitId);
                        const isActive = activeStudyUnit && (activeStudyUnit.id || activeStudyUnit._id?.toString()) === quiz.unitId;

                        if (hasAttendance || isActive) return true;

                        const unitIndex = units.findIndex(u => (u.id || u._id?.toString()) === quiz.unitId);
                        if (unitIndex === 0) return true;

                        let maxCheckedInSeq = 0;
                        units.forEach((u, idx) => {
                          const uId = u.id || u._id?.toString();
                          if (attendances.some(a => a.unitId === uId)) {
                            const seq = u.sequence || (idx + 1);
                            if (seq > maxCheckedInSeq) maxCheckedInSeq = seq;
                          }
                        });

                        const seq = unit.sequence || (unitIndex + 1);
                        return seq <= maxCheckedInSeq + 1;
                      }).map((quiz) => {
                        const isUploadedFile = !!quiz.fileUrl;
                        const isUploading = uploadingRecordId === quiz.id;
                        // Built-in system quizzes: score comes from quiz submission system, no file upload needed
                        const isBuiltIn = quiz.isBuiltIn;

                        return (
                          <div
                            key={quiz.id}
                            className={`border rounded-2xl transition-all ${isBuiltIn
                              ? "bg-purple-50/40 dark:bg-purple-950/10 border-purple-200/50 dark:border-purple-800/30"
                              : "bg-zinc-50 dark:bg-zinc-850/30 border-zinc-150 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-800/50"
                              }`}
                          >
                            {/* Header: Quiz Title + Status */}
                            <div className="flex items-start justify-between gap-3 p-4 pb-3">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isBuiltIn
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                      }`}
                                  >
                                    {isBuiltIn ? "🧠 แบบทดสอบในระบบ" : "🔗 งานภายนอก"}
                                  </span>
                                  {quiz.quizType === "pretest" && (
                                    <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-350 border border-amber-500/10">
                                      ก่อนเรียน (Pre-test)
                                    </span>
                                  )}
                                  {quiz.quizType === "posttest" && (
                                    <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-350 border border-purple-500/10">
                                      หลังเรียน (Post-test)
                                    </span>
                                  )}
                                  {quiz.quizType === "general" && (
                                    <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-500/10">
                                      ทั่วไป
                                    </span>
                                  )}
                                  {quiz.isBuiltIn && quiz.isShuffle && (
                                    <span className="inline-block text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-350 border border-teal-500/10">
                                      🔀 สลับข้อ
                                    </span>
                                  )}
                                  {quiz.deadline && (
                                    <span className="text-[8px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-800/70 px-2 py-0.5 rounded-full">
                                      📅 กำหนดส่ง: {formatThaiDateDisplay(quiz.deadline)}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-150 leading-normal">
                                  {quiz.title}
                                </h5>
                              </div>

                              <div className="shrink-0">
                                {quiz.isSubmitted ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500 text-white shadow-sm">
                                    <CheckCircle size={9} />
                                    <span>ส่งแล้ว</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black bg-zinc-200 dark:bg-zinc-750 text-zinc-500 dark:text-zinc-400">
                                    <Clock size={9} />
                                    <span>ยังไม่ส่ง</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Built-in quiz: show score info only, no file upload */}
                            {isBuiltIn ? (
                              <div className="mx-4 mb-4 bg-white dark:bg-zinc-900 border border-purple-100 dark:border-purple-900/40 rounded-xl p-3 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                                  <Award
                                    size={14}
                                    className="text-purple-600 dark:text-purple-400"
                                  />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-zinc-700 dark:text-zinc-300">
                                    คะแนนของแบบทดสอบนี้บันทึกจากระบบตรวจอัตโนมัติ
                                  </p>
                                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                                    ไม่ต้องแนบไฟล์เพิ่มเติม — ระบบจะคำนวณคะแนนให้อัตโนมัติ
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800/80 mx-3 pt-3 pb-4 px-1 space-y-3">
                                {/* Uploaded file row */}
                                {isUploadedFile && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilePreviewUrl(quiz.fileUrl);
                                      setFilePreviewName(quiz.fileName || "เอกสารหลักฐานแนบ");
                                    }}
                                    className="w-full flex items-center gap-3 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600/70 rounded-xl px-3 py-2.5 transition-all group cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                      <FolderOpen
                                        size={15}
                                        className="text-emerald-600 dark:text-emerald-400"
                                      />
                                    </div>
                                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-black truncate flex-1 text-left">
                                      {quiz.fileName || "เอกสารหลักฐานแนบ"}
                                    </span>
                                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg shrink-0 border border-emerald-200 dark:border-emerald-800/50 group-hover:bg-emerald-100 transition-colors">
                                      🔍 ดูไฟล์
                                    </span>
                                  </button>
                                )}

                                {/* Upload controls row */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">
                                    {isUploadedFile
                                      ? "🔄 เปลี่ยน/อัปเดตไฟล์:"
                                      : "📎 แนบไฟล์งานยืนยัน:"}
                                  </span>
                                  <div className="flex gap-2 flex-wrap">
                                    {isUploading ? (
                                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                                        <span>กำลังอัปโหลด...</span>
                                      </div>
                                    ) : (
                                      <>
                                        {quiz.googleFormUrl && (
                                          <a
                                            href={quiz.googleFormUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all"
                                          >
                                            <ExternalLink size={10} />
                                            <span>เปิดทำแบบทดสอบภายนอก</span>
                                          </a>
                                        )}
                                        <input
                                          type="file"
                                          id={`quiz-upload-${quiz.id}`}
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleStudentWorkUpload(quiz.id, file);
                                          }}
                                        />
                                        <label
                                          htmlFor={`quiz-upload-${quiz.id}`}
                                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black cursor-pointer border transition-all ${isUploadedFile
                                            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                            : "bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-sm"
                                            }`}
                                        >
                                          <Upload size={10} />
                                          <span>
                                            {isUploadedFile ? "เปลี่ยนไฟล์" : "อัปโหลดไฟล์งาน"}
                                          </span>
                                        </label>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* File Preview Sub-modal (overlay inside main modal) */}
              {filePreviewUrl && (
                <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-zinc-900 border-b border-zinc-800/80 shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FolderOpen size={15} className="text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-zinc-200 truncate">
                        {filePreviewName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={filePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors border border-zinc-700"
                      >
                        <ExternalLink size={10} />
                        <span>เปิดในแท็บใหม่</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviewUrl(null);
                          setFilePreviewName(null);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors text-xs font-black cursor-pointer border-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-zinc-950/60 min-h-0">
                    {/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(filePreviewUrl) ? (
                      <img
                        src={filePreviewUrl}
                        alt={filePreviewName || "ไฟล์แนบ"}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      />
                    ) : /\.(pdf)(\?|$)/i.test(filePreviewUrl) ? (
                      <iframe
                        src={filePreviewUrl}
                        title={filePreviewName || "ไฟล์แนบ"}
                        className="w-full h-full rounded-xl bg-white"
                        style={{ minHeight: "300px" }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                          <FolderOpen size={28} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-200">{filePreviewName}</p>
                          <p className="text-xs text-zinc-500 mt-1 font-bold">
                            ไม่สามารถแสดงตัวอย่างได้
                          </p>
                        </div>
                        <a
                          href={filePreviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-colors"
                        >
                          <Download size={13} />
                          ดาวน์โหลดไฟล์
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white dark:bg-zinc-750 dark:hover:bg-zinc-700 text-xs font-black shadow-xs cursor-pointer border-0"
                >
                  เสร็จสิ้นและปิดหน้าต่าง
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
    <div className="max-w-[1600px] mx-auto w-full bg-[#f0f2f5] dark:bg-zinc-950 transition-colors duration-500 pb-20">
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
