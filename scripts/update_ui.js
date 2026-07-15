const fs = require('fs');

const file = 'd:\\ktltc\\src\\app\\(admin)\\teacher-verification\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Print Button
content = content.replace(
  '<button className="hidden md:flex px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold items-center gap-2 mb-2 hover:scale-105 transition-transform text-sm">',
  '<button onClick={() => window.print()} className="hidden md:flex px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold items-center gap-2 mb-2 hover:scale-105 transition-transform text-sm">'
);

// 2. View Lesson Plan Button
content = content.replace(
  /<button className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900\/30 dark:text-indigo-400 rounded-xl text-\[10px\] font-black uppercase tracking-widest">\s*ดูแผนการสอน\s*<\/button>/g,
  '<button onClick={() => router.push(`/dashboard/director/lesson-plans?teacher=${encodeURIComponent(selectedTeacher.name)}`)} className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest">ดูแผนการสอน</button>'
);

// 3. Checklist
const checklistTarget = `<div className="space-y-3">
                          <div className="flex items-center gap-3"><CheckCircle className="text-emerald-500 w-5 h-5" /> <span className="text-sm font-bold">1. จัดทำแผนการสอนล่วงหน้า</span></div>
                          <div className="flex items-center gap-3"><CheckCircle className="text-emerald-500 w-5 h-5" /> <span className="text-sm font-bold">2. บันทึกหลังสอนครบถ้วน</span></div>
                          <div className="flex items-center gap-3"><AlertCircle className="text-amber-500 w-5 h-5" /> <span className="text-sm font-bold">3. อัปโหลดคลิปวิดีโอการสอน (ขาด 1 คลิป)</span></div>
                          <div className="flex items-center gap-3"><CheckCircle className="text-emerald-500 w-5 h-5" /> <span className="text-sm font-bold">4. รายงานผลลัพธ์ผู้เรียน</span></div>
                        </div>`;
const checklistReplace = `<div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasLessonPlan ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-rose-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">1. จัดทำแผนการสอนล่วงหน้า</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasAfterClassNote ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">2. บันทึกหลังสอนครบถ้วน</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.videoCount >= 2 ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">3. อัปโหลดคลิปวิดีโอการสอน ({selectedTeacher.checklist?.videoCount || 0}/2 คลิป)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {selectedTeacher.checklist?.hasStudentOutcome ? <CheckCircle className="text-emerald-500 w-5 h-5" /> : <AlertCircle className="text-amber-500 w-5 h-5" />} 
                            <span className="text-sm font-bold">4. รายงานผลลัพธ์ผู้เรียน</span>
                          </div>
                        </div>`;
content = content.replace(checklistTarget, checklistReplace);

// 4. PA1 Download
content = content.replace(
  '<button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold w-full">ดาวน์โหลดเอกสาร</button>',
  '<button onClick={() => { if (selectedTeacher.checklist?.evidenceLink) window.open(selectedTeacher.checklist.evidenceLink, "_blank"); else message.warning("ยังไม่มีไฟล์เอกสาร"); }} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold w-full">{selectedTeacher.checklist?.evidenceLink ? "ดาวน์โหลดเอกสาร" : "ยังไม่ส่งเอกสาร"}</button>'
);

// 5. Supervision tab
const supervisionTarget = `<div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center justify-center min-h-[300px]">
                    <Video className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-2">ผลการนิเทศการสอนภายใน</h3>
                    <p className="text-sm text-slate-500 max-w-md mb-6">คลิกเพื่อดูสรุปคะแนนการประเมินการจัดการเรียนรู้ในชั้นเรียนจากหัวหน้าแผนก หรือผู้อำนวยการ</p>
                    <button className="px-6 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold uppercase tracking-wider text-xs">
                      ดูแบบบันทึกการนิเทศ
                    </button>
                  </div>`;
const supervisionReplace = `<div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center justify-center min-h-[300px]">
                    <Video className="w-16 h-16 text-slate-200 dark:text-zinc-800 mb-4" />
                    <h3 className="font-black text-xl text-slate-800 dark:text-white mb-2">ผลการนิเทศการสอนภายใน</h3>
                    {selectedTeacher.supervisions && selectedTeacher.supervisions.length > 0 ? (
                      <div className="mb-6 space-y-4 w-full max-w-md">
                        {selectedTeacher.supervisions.map((sup: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl flex justify-between items-center w-full">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                              ครั้งที่ {idx + 1} ({new Date(sup.date).toLocaleDateString("th-TH")})
                            </span>
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                              {sup.score}/{sup.maxScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 max-w-md mb-6">ยังไม่มีผลการประเมินการจัดการเรียนรู้ในชั้นเรียน</p>
                    )}
                    <button onClick={() => router.push('/dashboard/director/plc?teacher=' + encodeURIComponent(selectedTeacher.name))} className="px-6 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-100 transition-colors">
                      ไปที่ระบบนิเทศ/PLC
                    </button>
                  </div>`;
content = content.replace(supervisionTarget, supervisionReplace);

fs.writeFileSync(file, content);
console.log("Teacher verification page updated successfully.");
