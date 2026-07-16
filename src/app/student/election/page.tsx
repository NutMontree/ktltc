"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Vote, Users, BarChart3, CheckCircle2, ChevronRight, AlertCircle, HelpCircle } from "lucide-react";

export default function StudentElectionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/election/active")
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d?.elections?.length === 1) {
          setSelectedElectionId(d.elections[0]._id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">กำลังตรวจสอบการเลือกตั้ง...</p>
      </div>
    </div>
  );

  if (!data?.active || !data?.elections || data.elections.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl p-12 sm:p-16 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 text-center border border-white/50 dark:border-gray-700/50 relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten group-hover:scale-150 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-lighten group-hover:scale-150 transition-transform duration-1000 ease-in-out pointer-events-none"></div>
            
            {/* Icon */}
            <div className="relative mb-8 flex justify-center">
              <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full scale-150 blur-xl animate-pulse"></div>
              <div className="w-24 h-24 bg-linear-to-tr from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
                <AlertCircle size={48} strokeWidth={2} />
              </div>
            </div>
            
            {/* Text */}
            <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 relative z-10">
              ขณะนี้ยังไม่มีการเลือกตั้ง
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl font-medium max-w-lg mx-auto relative z-10 leading-relaxed">
              ระบบจะแสดงข้อมูลอัตโนมัติทันที เมื่อมีการเปิดให้ลงคะแนนเสียงโดยคณะกรรมการการเลือกตั้ง
            </p>
            
            {/* Action */}
            <div className="mt-10 flex justify-center relative z-10">
              <Link href="/manual/election-student" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white rounded-full font-bold shadow-lg shadow-gray-900/20 dark:shadow-white/20 transition-all hover:-translate-y-1 active:scale-95">
                <HelpCircle size={20} />
                <span>อ่านคู่มือเตรียมความพร้อม</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If there are multiple active elections and none selected yet
  if (data.elections.length > 1 && !selectedElectionId) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-20">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden pt-12 pb-24">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
          <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-tight">
              เลือกหัวข้อการเลือกตั้ง
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              ขณะนี้มีการเลือกตั้งหลายหัวข้อที่กำลังเปิดลงคะแนนเสียง กรุณาเลือกรายการที่คุณต้องการ
            </p>
            <div className="flex justify-center">
              <Link href="/manual/election-student" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <HelpCircle size={20} />
                <span>คู่มือการลงคะแนนสำหรับนักเรียน</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] w-full mx-auto px-6 -mt-12 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.elections.map((elec: any) => (
              <div key={elec._id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all cursor-pointer group" onClick={() => setSelectedElectionId(elec._id)}>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4 border border-indigo-100 dark:border-indigo-500/20">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    กำลังเปิดลงคะแนน
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{elec.title}</h2>
                  {elec.description && <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">{elec.description}</p>}
                </div>

                <div className="flex flex-col gap-3 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-gray-500">
                    <span>เปิดโหวต:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{format(new Date(elec.startDate), "dd MMM yyyy, HH:mm")} น.</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>ปิดโหวต:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{format(new Date(elec.endDate), "dd MMM yyyy, HH:mm")} น.</span>
                  </div>
                  {elec.hasVoted && (
                    <div className="mt-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-medium">
                      <CheckCircle2 size={16} /> คุณใช้สิทธิ์แล้ว
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Selected or Single Election Data
  const activeElectionData = selectedElectionId
    ? data.elections.find((e: any) => e._id === selectedElectionId)
    : data.elections[0];

  const election = activeElectionData;
  const candidates = activeElectionData.candidates || [];
  const hasVoted = activeElectionData.hasVoted;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-20">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative overflow-hidden pt-12 pb-24">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>

        <div className="max-w-[1600px] w-full mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6 border border-indigo-100 dark:border-indigo-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              กำลังเปิดลงคะแนนเสียง
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 dark:text-white leading-tight tracking-tight">
              {election.title}
            </h1>
            {election.description && (
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-3xl leading-relaxed">
                {election.description}
              </p>
            )}
          </div>

          <Link href="/manual/election-student" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all mb-4 md:mb-0">
            <HelpCircle size={20} />
            <span>คู่มือการลงคะแนน</span>
          </Link>
        </div>

        <div className="max-w-[1600px] w-full mx-auto px-6 mt-2 relative z-10">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">เปิดโหวต</p>
                {format(new Date(election.startDate), "dd MMM yyyy, HH:mm")} น.
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">ปิดโหวต</p>
                {format(new Date(election.endDate), "dd MMM yyyy, HH:mm")} น.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-6 -mt-12 relative z-20">
        {hasVoted ? (
          <div className="bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 dark:border-green-900/30 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">คุณได้ใช้สิทธิ์ลงคะแนนเรียบร้อยแล้ว</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการเลือกตั้งครั้งนี้ เสียงของคุณมีความหมาย</p>
          </div>
        ) : (
          <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-1 md:p-1.5 rounded-4xl shadow-2xl shadow-indigo-900/20">
            <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[1.75rem] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-black mb-3 text-gray-900 dark:text-white">ถึงเวลาใช้สิทธิ์ของคุณแล้ว</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">กรุณาตรวจสอบผู้สมัครและตัดสินใจให้ดีก่อนลงคะแนน</p>
              </div>
              <Link href={`/student/election/vote?id=${election._id}`} className="shrink-0 group bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-5 px-10 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <Vote size={28} />
                เข้าสู่คูหาลงคะแนน
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-20 mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Users size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ทำความรู้จักผู้สมัคร
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {candidates.map((candidate: any) => (
            <div key={candidate._id} className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:-translate-y-1 flex flex-col h-full">
              <div className="relative aspect-4/3 w-full bg-linear-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10">
                {candidate.imageUrl ? (
                  <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl font-black text-indigo-300 dark:text-indigo-800">
                    {candidate.number}
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white dark:border-gray-800">
                  {candidate.number}
                </div>
              </div>
              <div className="p-6 pt-5 flex-1 flex flex-col">
                {candidate.partyName && (
                  <p className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-3 py-1 rounded-lg w-fit mb-3">พรรค{candidate.partyName}</p>
                )}
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-1">{candidate.name}</h3>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex-1 flex flex-col gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">นโยบาย</h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      {candidate.policy || "ไม่มีแนวนโยบายถูกระบุไว้"}
                    </p>
                  </div>
                  {candidate.members && candidate.members.length > 0 && (
                    <div className="mt-auto border-t border-gray-200 dark:border-gray-700/50 pt-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">ทีมงาน ({candidate.members.length} คน)</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.members.map((member: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-800 pr-3 pl-1.5 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm whitespace-nowrap">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 shrink-0">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{member.name}</span>
                            {member.role && <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">{member.role}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="col-span-2 text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 border-dashed">
              <div className="text-gray-400 mb-4 flex justify-center"><Users size={48} opacity={0.5} /></div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">ยังไม่มีข้อมูลผู้สมัคร</h3>
              <p className="text-gray-500">กำลังรอผู้ดูแลระบบเพิ่มรายชื่อผู้ลงสมัครรับเลือกตั้ง</p>
            </div>
          )}
        </div>

        {/* <div className="mt-24 mb-10 max-w-4xl mx-auto">
          <Link
            href={`/student/election/results/${election._id}`}
            className="group relative flex flex-col md:flex-row items-center justify-between p-8 md:p-10 bg-linear-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/20 hover:shadow-indigo-600/30 transition-all duration-300 hover:-translate-y-1 active:scale-95"
          >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-white mb-6 md:mb-0 text-center md:text-left">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BarChart3 size={40} className="text-white drop-shadow-md" />
              </div>
              <div className="flex flex-col justify-center h-full pt-1">
                <h3 className="text-2xl md:text-3xl font-black mb-2 drop-shadow-sm">ดูผลคะแนนแบบเรียลไทม์</h3>
                <p className="text-indigo-100 text-base md:text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  อัปเดตคะแนนสดๆ ทันทีที่มีผู้โหวต
                </p>
              </div>
            </div>

            <div className="relative z-10 bg-white text-indigo-700 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg group-hover:bg-indigo-50 transition-colors w-full md:w-auto mt-4 md:mt-0">
              เข้าสู่หน้าสรุปผล
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
