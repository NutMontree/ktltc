"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, RefreshCw, Trophy, Users, BarChart3, AlertCircle } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value, isFloat = false }: { value: number, isFloat?: boolean }) {
  const spring = useSpring(value, { mass: 1, stiffness: 75, damping: 15 });
  const displayString = useTransform(spring, (current) => current.toFixed(1));
  const displayNumber = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{isFloat ? displayString as any : displayNumber}</motion.span>;
}

export default function StudentElectionResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [totalEligibleVoters, setTotalEligibleVoters] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [elecRes, candRes] = await Promise.all([
        fetch(`/api/election/${id}`),
        fetch(`/api/election/${id}/candidates`)
      ]);
      if (elecRes.ok) setElection(await elecRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResultsData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const resultRes = await fetch(`/api/election/${id}/results`);
      if (resultRes.ok) {
        const data = await resultRes.json();
        setResults(data.results || []);
        setTotalEligibleVoters(data.totalEligibleVoters || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleRefresh = async () => {
    fetchInitialData();
    fetchResultsData(true);
  };

  useEffect(() => {
    fetchInitialData();
    fetchResultsData();
    const interval = setInterval(() => fetchResultsData(), 3000); // Polling every 3 seconds for real-time updates
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !election) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">กำลังโหลดผลคะแนน...</p>
      </div>
    </div>
  );

  if (!election) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl text-center border border-red-100 dark:border-red-900/30 max-w-md w-full">
        <AlertCircle size={64} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">ไม่พบข้อมูล</h2>
        <p className="text-gray-500 mb-8">การเลือกตั้งนี้อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <Link href="/student/election" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );

  const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
  const turnoutPercentage = totalEligibleVoters > 0 ? ((totalVotes / totalEligibleVoters) * 100).toFixed(1) : "0";

  const getCandidateVotes = (cId: string | null) => {
    const found = results.find(r => r._id === cId);
    return found ? found.count : 0;
  };

  const sortedCandidates = [...candidates].map(c => ({
    ...c,
    votes: getCandidateVotes(c._id)
  })).sort((a, b) => b.votes - a.votes);

  const first = sortedCandidates[0];
  const second = sortedCandidates[1];
  const third = sortedCandidates[2];
  const others = sortedCandidates.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/student/election" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <div className="text-center flex-1 px-4 min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">ผลคะแนน: {election.title}</h1>
            <p className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium flex items-center justify-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              เรียลไทม์ (อัปเดตอัตโนมัติ)
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`}
            title="รีเฟรชตอนนี้"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-10">

        {/* Turnout Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-900/5 border border-gray-100 dark:border-gray-700 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0">
              <BarChart3 size={40} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">ผู้มาใช้สิทธิ์ทั้งหมด</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white"><AnimatedNumber value={totalVotes} /></span>
                <span className="text-xl text-gray-400">/ {totalEligibleVoters} คน</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-gray-500">คิดเป็นเปอร์เซ็นต์</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"><AnimatedNumber value={parseFloat(turnoutPercentage)} isFloat={true} />%</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${turnoutPercentage}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-size-[1rem_1rem] animate-[progress_1s_linear_infinite]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Podium */}
        {sortedCandidates.length > 0 && (
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white inline-flex items-center gap-3">
                <Trophy className="text-yellow-500" size={32} />
                อันดับผู้นำ
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end h-[400px] max-w-4xl mx-auto px-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center justify-end h-full relative group">
                {second && (
                  <div className="flex flex-col items-center w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-xl sm:text-2xl mb-1"><AnimatedNumber value={second.votes} /> <span className="text-sm font-medium">โหวต</span></p>
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-slate-300 dark:border-slate-500 mb-4 bg-white shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {second.imageUrl ? <img src={second.imageUrl} alt={second.name} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-4xl font-black text-slate-400">{second.number}</div>}
                    </div>
                    <div className="text-center px-1 mb-4 flex flex-col items-center">
                      {second.partyName && <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-1">พรรค{second.partyName}</span>}
                      <p className="font-bold text-sm sm:text-lg line-clamp-1 text-gray-800 dark:text-gray-200">{second.name}</p>
                    </div>
                    <div className="w-full bg-linear-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 h-40 sm:h-48 rounded-t-3xl flex justify-center pt-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] border border-b-0 border-slate-300/50 dark:border-slate-600">
                      <span className="text-7xl sm:text-8xl font-black text-slate-300 dark:text-slate-600/50 opacity-50">2</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center justify-end h-full relative group">
                {first && (
                  <div className="flex flex-col items-center w-full z-10 animate-fade-in-up">
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-2xl sm:text-3xl pb-12 mb-10"><AnimatedNumber value={first.votes} /> <span className="text-sm font-medium">โหวต</span></p>
                    <div className="relative mb-4">
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl sm:text-6xl animate-bounce filter drop-shadow-lg z-20">👑</div>
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-yellow-400 dark:border-yellow-500 bg-white shadow-2xl shadow-yellow-400/30 relative z-10 group-hover:scale-110 transition-transform duration-300">
                        {first.imageUrl ? <img src={first.imageUrl} alt={first.name} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full bg-yellow-50 flex items-center justify-center text-5xl font-black text-yellow-500">{first.number}</div>}
                      </div>
                    </div>
                    <div className="text-center px-1 mb-4 flex flex-col items-center">
                      {first.partyName && <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full mb-1">พรรค{first.partyName}</span>}
                      <p className="font-bold text-base sm:text-xl line-clamp-1 text-gray-900 dark:text-white">{first.name}</p>
                    </div>
                    <div className="w-full bg-linear-to-t from-yellow-300 to-yellow-100 dark:from-yellow-600 dark:to-yellow-500 h-56 sm:h-64 rounded-t-3xl shadow-[0_-10px_30px_rgba(250,204,21,0.2),inset_0_4px_10px_rgba(255,255,255,0.5)] flex justify-center pt-4 relative border border-b-0 border-yellow-300/50 dark:border-yellow-400">
                      <span className="text-8xl sm:text-9xl font-black text-yellow-400 dark:text-yellow-300/50 opacity-60">1</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center justify-end h-full relative group">
                {third && (
                  <div className="flex flex-col items-center w-full animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-xl sm:text-2xl mb-1"><AnimatedNumber value={third.votes} /> <span className="text-sm font-medium">โหวต</span></p>
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-amber-600 dark:border-amber-700 mb-4 bg-white shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {third.imageUrl ? <img src={third.imageUrl} alt={third.name} className="w-full h-full object-cover object-top" /> : <div className="w-full h-full bg-amber-50 flex items-center justify-center text-4xl font-black text-amber-600">{third.number}</div>}
                    </div>
                    <div className="text-center px-1 mb-4 flex flex-col items-center">
                      {third.partyName && <span className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mb-1">พรรค{third.partyName}</span>}
                      <p className="font-bold text-sm sm:text-lg line-clamp-1 text-gray-800 dark:text-gray-200">{third.name}</p>
                    </div>
                    <div className="w-full bg-linear-to-t from-amber-200 to-amber-100 dark:from-amber-800 dark:to-amber-700 h-32 sm:h-40 rounded-t-3xl flex justify-center pt-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)] border border-b-0 border-amber-300/50 dark:border-amber-600">
                      <span className="text-7xl sm:text-8xl font-black text-amber-300 dark:text-amber-600/50 opacity-50">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Candidates & Abstain */}
        <div className="bg-white  dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-700 mb-10 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-8 pt-28 text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={24} className="text-gray-400 pt-20" />
            คะแนนผู้สมัครท่านอื่นๆ
          </h3>

          <div className="space-y-6">
            {others.map((candidate, index) => {
              const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : "0";
              return (
                <div key={candidate._id} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center text-gray-400 font-bold">#{index + 4}</div>
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600 shrink-0">
                        {candidate.imageUrl ? <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" /> : <span className="font-black text-gray-500">{candidate.number}</span>}
                      </div>
                      <div className="flex flex-col">
                        {candidate.partyName && <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">พรรค{candidate.partyName}</span>}
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">{candidate.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-2xl text-gray-900 dark:text-white"><AnimatedNumber value={candidate.votes} /></span>
                      <span className="text-sm font-medium text-gray-500 ml-1">(<AnimatedNumber value={parseFloat(percentage)} isFloat={true} />%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden ml-16 max-w-[calc(100%-4rem)] shadow-inner">
                    <div
                      className="bg-blue-400 dark:bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            {/* Abstain */}
            {(() => {
              const abstainVotes = getCandidateVotes(null);
              const abstainPercentage = totalVotes > 0 ? ((abstainVotes / totalVotes) * 100).toFixed(1) : "0";
              return (
                <div className="mt-12 pt-8 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center text-gray-400 font-bold">-</div>
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0 border-2 border-gray-200 dark:border-gray-600">
                        <AlertCircle className="text-gray-400" size={20} />
                      </div>
                      <span className="font-bold text-gray-600 dark:text-gray-400 text-lg">งดออกเสียง</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-2xl text-gray-600 dark:text-gray-400"><AnimatedNumber value={abstainVotes} /></span>
                      <span className="text-sm font-medium text-gray-500 ml-1">(<AnimatedNumber value={parseFloat(abstainPercentage)} isFloat={true} />%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden ml-16 max-w-[calc(100%-4rem)] shadow-inner">
                    <div
                      className="bg-gray-400 dark:bg-gray-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${abstainPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}
