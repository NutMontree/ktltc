"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Search,
  BookOpen,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileText,
  AlertCircle,
  Briefcase,
  Layers,
  GraduationCap,
  Download,
  ExternalLink,
  FileQuestion,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { message } from "antd";

export default function DVEMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("all");
  
  // To keep track of expanded teachers and subjects
  const [expandedTeachers, setExpandedTeachers] = useState<Record<string, boolean>>({});
  
  const semesters = React.useMemo(() => {
    return Array.from(new Set(subjects.map(s => s.semester).filter(Boolean))).sort();
  }, [subjects]);

  const academicYears = React.useMemo(() => {
    return Array.from(new Set(subjects.map(s => s.academicYear).filter(Boolean))).sort().reverse();
  }, [subjects]);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      const role = (session.user as any)?.role || "";
      if (!["super_admin", "admin", "director", "deputy_academic"].includes(role)) {
        message.error("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        router.push("/dashboard/dve");
        return;
      }
      fetchSubjects();
    }
  }, [status]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dve/subjects");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubjects(data.subjects || []);
        }
      }
    } catch (err) {
      console.error(err);
      message.error("ไม่สามารถโหลดข้อมูลรายวิชาได้");
    } finally {
      setLoading(false);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setExpandedTeachers(prev => ({ ...prev, [teacherId]: !prev[teacherId] }));
  };

  // Group subjects by teacher
  const groupedData = React.useMemo(() => {
    const map = new Map<string, { teacherId: string; teacherName: string; teacherImage: string; subjects: any[] }>();
    
    let filteredSubjects = subjects;
    if (selectedSemester !== "all") {
      filteredSubjects = filteredSubjects.filter(s => s.semester === selectedSemester);
    }
    if (selectedAcademicYear !== "all") {
      filteredSubjects = filteredSubjects.filter(s => s.academicYear === selectedAcademicYear);
    }
    
    filteredSubjects.forEach(sub => {
      if (!map.has(sub.teacherId)) {
        map.set(sub.teacherId, {
          teacherId: sub.teacherId,
          teacherName: sub.teacherName || "ไม่ระบุชื่อครูผู้สอน",
          teacherImage: sub.teacherImage,
          subjects: []
        });
      }
      map.get(sub.teacherId)?.subjects.push(sub);
    });

    let result = Array.from(map.values());
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.teacherName.toLowerCase().includes(q));
    }
    
    return result;
  }, [subjects, searchQuery, selectedSemester, selectedAcademicYear]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50 p-4 sm:p-6 lg:p-8 font-prompt">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/dve">
              <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-slate-600 dark:text-zinc-400" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="text-teal-500" /> ติดตามการสอน (ทวิภาคี)
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
                ดูข้อมูลรายวิชา ห้องเรียนที่สอน และหน่วยการเรียนรู้ของครูแต่ละท่าน
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full md:w-32 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="all">ทุกภาคเรียน</option>
              {semesters.map(s => <option key={s as string} value={s as string}>ภาคเรียน {s as string}</option>)}
            </select>
            
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full md:w-40 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all dark:text-white cursor-pointer"
            >
              <option value="all">ทุกปีการศึกษา</option>
              {academicYears.map(y => <option key={y as string} value={y as string}>ปีการศึกษา {y as string}</option>)}
            </select>

            <div className="relative w-full md:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อครู..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-zinc-800/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 transition-all dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-teal-500 mb-4" size={40} />
            <p className="text-slate-500 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : groupedData.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">ไม่พบข้อมูล</h3>
            <p className="text-slate-500 dark:text-zinc-400">ไม่พบข้อมูลรายวิชาทวิภาคีในระบบ หรือไม่พบครูที่ค้นหา</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedData.map((teacher) => (
              <div key={teacher.teacherId} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                  onClick={() => toggleTeacher(teacher.teacherId)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0 border-2 border-white dark:border-zinc-700 shadow-sm">
                      {teacher.teacherImage ? (
                        <img src={teacher.teacherImage} alt={teacher.teacherName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-bold text-lg">
                          {teacher.teacherName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{teacher.teacherName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                          <BookOpen size={12} /> {teacher.subjects.length} รายวิชา
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 transition-transform duration-300 ${expandedTeachers[teacher.teacherId] ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedTeachers[teacher.teacherId] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
                    >
                      <div className="p-5 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {teacher.subjects.map(sub => (
                          <SubjectCard key={sub.id} subject={sub} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for Subject Card to handle fetching its own units
function SubjectCard({ subject }: { subject: any }) {
  const [expanded, setExpanded] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleToggle = async () => {
    if (!expanded && !fetched) {
      setLoadingUnits(true);
      try {
        const [resUnits, resQuizzes] = await Promise.all([
          fetch(`/api/dve/units?subjectId=${subject.id}`),
          fetch(`/api/dve/quizzes?subjectId=${subject.id}`)
        ]);
        
        if (resUnits.ok) {
          const data = await resUnits.json();
          if (data.success) setUnits(data.units || []);
        }
        if (resQuizzes.ok) {
          const quizData = await resQuizzes.json();
          if (quizData.success) setQuizzes(quizData.quizzes || []);
        }
        setFetched(true);
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดหน่วยการเรียนรู้และแบบทดสอบได้");
      } finally {
        setLoadingUnits(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm p-4 flex flex-col h-full">
      <div className="grow">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
            <BookOpen size={12} /> {subject.code}
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {subject.semester?.includes('/') ? subject.semester : `${subject.semester}/${subject.academicYear}`}
          </span>
        </div>
        
        <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-snug">{subject.name}</h4>
        
        <div className="mt-4 space-y-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Users size={12} /> ห้องเรียนที่สอน:
            </span>
            <div className="flex flex-wrap gap-1">
              {subject.allowedClassGroups && subject.allowedClassGroups.length > 0 ? (
                subject.allowedClassGroups.map((group: string, idx: number) => (
                  <span key={idx} className="bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 text-teal-700 dark:text-teal-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                    {group}
                  </span>
                ))
              ) : (
                <span className="text-xs text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-md">ไม่มีห้องเรียน</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <button 
          onClick={handleToggle}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-600 dark:text-zinc-300 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3 py-2 rounded-xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-500" /> หน่วยการเรียนรู้
          </span>
          {loadingUnits ? (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          ) : (
            <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {units.length > 0 ? (
                  units.sort((a, b) => (a.sequence || 0) - (b.sequence || 0)).map((unit, idx) => {
                    const unitQuizzes = quizzes.filter(q => q.unitId === unit._id);
                    const directFiles = (unit.files || []).filter((f: any) => f.type === "file" || f.url?.startsWith("/uploads/") || f.url?.startsWith("/api/media/"));
                    const externalLinks = (unit.files || []).filter((f: any) => !directFiles.includes(f));
                    
                    return (
                      <div key={unit._id || idx} className="bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                          <span className="text-indigo-500 mr-1">หน่วยที่ {unit.sequence || idx + 1}:</span> 
                          {unit.title}
                        </p>
                        {unit.content && (
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: unit.content.replace(/<[^>]+>/g, '') }}></p>
                        )}
                        
                        {(unit.files?.length > 0 || unitQuizzes.length > 0) && (
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                            {directFiles.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {directFiles.map((file: any, fIdx: number) => (
                                  <a
                                    key={fIdx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-[10px] font-bold rounded-lg transition-colors border border-blue-200 dark:border-blue-800/50"
                                  >
                                    <Download size={10} />
                                    {file.name}
                                  </a>
                                ))}
                              </div>
                            )}
                            
                            {externalLinks.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {externalLinks.map((file: any, fIdx: number) => (
                                  <a
                                    key={fIdx}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[10px] font-bold rounded-lg transition-colors border border-purple-200 dark:border-purple-800/50"
                                  >
                                    <ExternalLink size={10} />
                                    {file.name}
                                  </a>
                                ))}
                              </div>
                            )}

                            {unitQuizzes.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {unitQuizzes.map((quiz, qIdx) => (
                                  <a
                                    key={quiz._id || qIdx}
                                    href={quiz.isBuiltIn ? `/dashboard/dve/quiz-view/${quiz._id}` : quiz.googleFormUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[10px] font-bold rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800/50"
                                  >
                                    <FileQuestion size={10} />
                                    {quiz.title} ({quiz.quizType === 'pretest' ? 'ก่อนเรียน' : quiz.quizType === 'posttest' ? 'หลังเรียน' : 'ทั่วไป'})
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <p className="text-xs font-medium text-slate-500">ยังไม่มีการเพิ่มหน่วยการเรียนรู้</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
