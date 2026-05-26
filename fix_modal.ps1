$file = "d:\ktltc\src\app\dashboard\dve\page.tsx"
$lines = Get-Content $file -Encoding UTF8

$newModal = @'
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
                                            {sub.maxScore > 0 ? `${sub.score} / ${sub.maxScore}` : "—"}
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
                                                const studentAnswerObj = sub.answers?.find((a: any) => a.questionId === question.id);
                                                const studentAnswer = studentAnswerObj ? studentAnswerObj.answer : "ไม่ได้ตอบ";
                                                let isCorrect = false;
                                                if (question.type === "multiple_choice" || question.type === "short_answer") {
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
                                                      </div>
                                                      <div>
                                                        <span className="text-zinc-400 font-bold block">เฉลย:</span>
                                                        <span className="font-black text-zinc-600 dark:text-zinc-300">
                                                          {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(", ") : String(question.correctAnswer || "ไม่ได้ระบุ")}
                                                        </span>
                                                      </div>
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
                        ✕
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
'@

# Lines are 1-indexed; we keep lines 1-3050 and lines 3226 to end
$before = $lines[0..3049]   # lines 1-3050 (0-based: 0-3049)
$after  = $lines[3225..($lines.Length - 1)]  # lines 3226+ (0-based: 3225+)

$newLines = $before + ($newModal -split "`r`n|`n") + $after

[System.IO.File]::WriteAllLines($file, $newLines, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done. Total lines: $($newLines.Count)"
