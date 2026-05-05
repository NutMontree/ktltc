"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

interface Question {
  _id: string;
  guestName: string;
  subject: string;
  content: string;
  answer: string | null;
  status: "pending" | "answered";
  createdAt: string;
  posterIp?: string;
}

interface QuestionEditForm {
  guestName: string;
  subject: string;
  content: string;
  createdAt: string;
}

const toDateTimeLocalValue = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null,
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<QuestionEditForm>({
    guestName: "",
    subject: "",
    content: "",
    createdAt: "",
  });

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions/public");
      if (!res.ok) {
        throw new Error("LOAD_FAILED");
      }

      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      toast.error("โหลดข้อมูลคำถามไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setRole(data.role ?? null);
      } catch (error) {
        console.error("PROFILE_FETCH_ERROR:", error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-4", "ring-cyan-400", "scale-[1.01]", "z-10");
          setTimeout(() => {
            element.classList.remove(
              "ring-4",
              "ring-cyan-400",
              "scale-[1.01]",
              "z-10",
            );
          }, 3000);
        }, 500);
      }
    }
  }, [loading, questions]);

  const stats = useMemo(() => {
    const pending = questions.filter((question) => question.status === "pending");
    const answered = questions.filter(
      (question) => question.status === "answered",
    );

    return {
      total: questions.length,
      pending: pending.length,
      answered: answered.length,
      latest: questions[0]?.createdAt ?? null,
    };
  }, [questions]);

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบคำถามนี้หรือไม่ ข้อมูลจะไม่สามารถกู้คืนได้")) {
      return;
    }

    try {
      const res = await fetch(`/api/questions/reply?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "ลบข้อมูลไม่สำเร็จ");
        return;
      }

      toast.success("ลบคำถามเรียบร้อย");
      fetchQuestions();
    } catch (error) {
      toast.error("DELETE_FAILED");
    }
  };

  const handleReply = async () => {
    if (!answerText.trim()) {
      toast.error("กรุณากรอกคำตอบ");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await fetch("/api/questions/reply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion?._id,
          answerText,
          isEditing:
            selectedQuestion?.status === "answered" ||
            !!selectedQuestion?.answer,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "REPLY_FAILED");
        return;
      }

      toast.success(selectedQuestion?.answer ? "อัปเดตคำตอบแล้ว" : "ส่งคำตอบแล้ว");
      setSelectedQuestion(null);
      setAnswerText("");
      fetchQuestions();
    } finally {
      setSubmittingReply(false);
    }
  };

  const openEditQuestionModal = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      guestName: question.guestName,
      subject: question.subject,
      content: question.content,
      createdAt: toDateTimeLocalValue(question.createdAt),
    });
  };

  const handleQuestionUpdate = async () => {
    if (!editingQuestion) {
      return;
    }

    if (
      !questionForm.guestName.trim() ||
      !questionForm.subject.trim() ||
      !questionForm.content.trim() ||
      !questionForm.createdAt
    ) {
      toast.error("กรุณากรอกข้อมูลคำถามให้ครบ");
      return;
    }

    setSubmittingQuestion(true);
    try {
      const res = await fetch("/api/questions/reply", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingQuestion._id,
          guestName: questionForm.guestName,
          subject: questionForm.subject,
          content: questionForm.content,
          createdAt: questionForm.createdAt,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "UPDATE_FAILED");
        return;
      }

      toast.success("อัปเดตคำถามแล้ว");
      setEditingQuestion(null);
      await fetchQuestions();
    } catch (error) {
      toast.error("UPDATE_FAILED");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-[1600px] items-center justify-center px-4 py-24">
        <div className="rounded-full border border-cyan-100 bg-white px-6 py-3 text-sm font-bold text-slate-500 shadow-sm">
          กำลังโหลดคำถาม...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-8 md:px-4 md:py-10">
      {/* <Toaster position="top-right" /> */}

      <section className="relative overflow-hidden rounded-4xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#f8fafc_45%,#ffffff_100%)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] md:p-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(34,211,238,0.10),transparent)] md:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-100 backdrop-blur">
              Dashboard Questions
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-serif text-4xl font-black leading-none tracking-tight text-white md:text-6xl">
                ศูนย์จัดการคำถามและคำตอบ
              </h1>
              <p className="max-w-2xl text-sm font-medium leading-7 text-slate-300 md:text-base">
                ดูคำถามล่าสุด ตอบกลับอย่างรวดเร็ว และจัดการรายละเอียดคำถามจากหน้าเดียว
                โดยเฉพาะสำหรับทีมแอดมินและ super admin
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-wider text-slate-800">
              <div className="rounded-full bg-white px-4 py-2 shadow-sm">
                ระบบออนไลน์
              </div>
              <div className="rounded-full bg-cyan-300 px-4 py-2 text-slate-900 shadow-sm">
                {role === "super_admin" ? "Super Admin Mode" : "Admin Workspace"}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/60 bg-white/80 p-5 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                ทั้งหมด
              </p>
              <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                {stats.total}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-700">
                  รอตอบ
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-700">
                  ตอบแล้ว
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">
                  {stats.answered}
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                ล่าสุด
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                {stats.latest ? formatDateTime(stats.latest) : "ยังไม่มีข้อมูล"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6">
        {questions.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <p className="text-lg font-black tracking-tight text-slate-400">
              ยังไม่มีคำถามในระบบ
            </p>
          </div>
        ) : (
          questions.map((question, index) => {
            const isAnswered = question.status === "answered";

            return (
              <article
                key={question._id}
                id={question._id}
                className="group relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.10)] md:p-7"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#22d3ee,#0f172a,#10b981)] opacity-70" />

                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.25em] ${
                          isAnswered
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-cyan-50 text-cyan-700"
                        }`}
                      >
                        {isAnswered ? "Answered" : "Pending"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {formatDateTime(question.createdAt)}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black uppercase text-white">
                        {(question.guestName || "G").slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          ผู้ส่งคำถาม
                        </p>
                        <p className="text-base font-black text-slate-900">
                          {question.guestName}
                        </p>
                      </div>
                      {role === "super_admin" && question.posterIp && (
                        <div className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700">
                          IP {question.posterIp}
                        </div>
                      )}
                    </div>

                    <h2 className="mt-5 max-w-4xl text-2xl font-black leading-tight tracking-tight text-slate-950 md:text-3xl">
                      {question.subject}
                    </h2>

                    <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">
                        {question.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3 xl:w-[240px] xl:flex-col">
                    <button
                      onClick={() => {
                        setSelectedQuestion(question);
                        setAnswerText(question.answer || "");
                      }}
                      className={`rounded-2xl px-5 py-3 text-sm font-black tracking-wide transition ${
                        isAnswered
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-950 text-white hover:bg-cyan-600"
                      }`}
                    >
                      {isAnswered ? "แก้ไขคำตอบ" : "ตอบคำถาม"}
                    </button>

                    {role === "super_admin" && (
                      <button
                        onClick={() => openEditQuestionModal(question)}
                        className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-black text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-500 hover:text-white"
                      >
                        แก้ไขคำถาม
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(question._id)}
                      className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:border-rose-500 hover:bg-rose-500 hover:text-white"
                    >
                      ลบรายการ
                    </button>
                  </div>
                </div>

                {question.answer && (
                  <div className="mt-6 rounded-[1.75rem] border border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4_0%,#ecfeff_100%)] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white">
                        Response
                      </span>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                        ทีมงานตอบกลับแล้ว
                      </p>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-7 text-slate-800">
                      {question.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {selectedQuestion && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.25)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-600">
                  {selectedQuestion.answer ? "Edit Response" : "Reply Question"}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {selectedQuestion.subject}
                </h2>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  จาก {selectedQuestion.guestName}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 transition hover:bg-slate-900 hover:text-white"
              >
                ปิด
              </button>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {selectedQuestion.content}
              </p>
            </div>

            <textarea
              className="mt-5 h-56 w-full rounded-3xl border border-slate-200 bg-white p-5 text-base font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
              placeholder="พิมพ์คำตอบ..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-500 transition hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReply}
                disabled={submittingReply}
                className={`rounded-2xl px-5 py-3.5 text-sm font-black text-white transition ${
                  submittingReply
                    ? "bg-slate-400"
                    : "bg-cyan-500 hover:bg-cyan-600"
                }`}
              >
                {submittingReply ? "กำลังบันทึก..." : "บันทึกคำตอบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingQuestion && (
        <div className="fixed inset-0 z-110 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.25)] md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-600">
                    Edit Question
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    ปรับรายละเอียดคำถาม
                  </h2>
                </div>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 transition hover:bg-slate-900 hover:text-white"
                >
                  ปิด
                </button>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    ชื่อผู้โพสต์
                  </label>
                  <input
                    className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    value={questionForm.guestName}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        guestName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    หัวข้อคำถาม
                  </label>
                  <input
                    className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    value={questionForm.subject}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    รายละเอียด
                  </label>
                  <textarea
                    className="h-52 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 font-medium text-slate-800 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    value={questionForm.content}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                    วันเวลาที่โพสต์
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 font-bold text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                    value={questionForm.createdAt}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({
                        ...prev,
                        createdAt: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-black text-slate-500 transition hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleQuestionUpdate}
                  disabled={submittingQuestion}
                  className={`rounded-2xl px-5 py-3.5 text-sm font-black text-white transition ${
                    submittingQuestion
                      ? "bg-slate-400"
                      : "bg-cyan-500 hover:bg-cyan-600"
                  }`}
                >
                  {submittingQuestion ? "กำลังบันทึก..." : "อัปเดตคำถาม"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
