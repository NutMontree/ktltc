"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, UserX, AlertTriangle, ArrowLeft } from "lucide-react";

function VotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const electionId = searchParams.get("id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch("/api/election/active")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
        // Find matching election if id provided, otherwise use default
        const activeElection = electionId && d.elections 
          ? d.elections.find((e: any) => e._id === electionId)
          : d.election;
        
        // If already voted or not active, redirect back
        if (!d.active || !activeElection || activeElection.hasVoted) {
          toast(activeElection?.hasVoted ? "คุณได้ใช้สิทธิ์ไปแล้ว" : "ไม่มีการเลือกตั้งในขณะนี้");
          router.push("/student/election");
        }
      })
      .catch(() => {
        setLoading(false);
        router.push("/student/election");
      });
  }, [router, electionId]);

  const activeElectionData = electionId && data?.elections 
    ? data.elections.find((e: any) => e._id === electionId) 
    : data;
    
  const election = activeElectionData?.election || activeElectionData;
  const candidates = activeElectionData?.candidates || [];

  const handleVoteSubmit = async () => {
    if (!selectedCandidate || !election?._id) return;
    
    setIsSubmitting(true);
    
    // Check if Abstain or Candidate
    const payload = {
      electionId: election._id,
      candidateId: selectedCandidate === "abstain" ? null : selectedCandidate
    };

    try {
      const res = await fetch("/api/election/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success("บันทึกคะแนนเสียงสำเร็จ ขอบคุณที่มาใช้สิทธิ์");
        router.push("/student/election");
      } else {
        const err = await res.json();
        toast.error(err.error || "ไม่สามารถบันทึกคะแนนได้");
        setShowConfirm(false);
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">กำลังเตรียมคูหาลงคะแนน...</p>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/student/election')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">{election.title}</h1>
            <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-medium">บัตรลงคะแนนเลือกตั้ง</p>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto px-6 pt-10">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-sm font-medium border border-indigo-100 dark:border-indigo-800/50 mb-2">
            <AlertTriangle size={16} />
            กรุณาเลือกผู้สมัคร 1 หมายเลข หรือ เลือกงดออกเสียง
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">แตะที่รูปหรือกล่องข้อความเพื่อเลือก และกดปุ่มยืนยันด้านล่าง</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {candidates.map((candidate: any) => {
            const isSelected = selectedCandidate === candidate._id;
            return (
              <label 
                key={candidate._id}
                className={`relative group cursor-pointer block rounded-3xl overflow-hidden transition-all duration-300 ${
                  isSelected 
                    ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-900 scale-[1.02] bg-white dark:bg-gray-800 shadow-xl' 
                    : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}
              >
                <div className="p-1">
                  <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-linear-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/10 relative">
                    {candidate.imageUrl ? (
                      <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl font-black text-indigo-200 dark:text-indigo-800/50">
                        {candidate.number}
                      </div>
                    )}
                    
                    {/* Number Badge */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-lg border-2 backdrop-blur-md transition-colors ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-white dark:border-gray-800' 
                        : 'bg-white/90 dark:bg-gray-800/90 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50'
                    }`}>
                      {candidate.number}
                    </div>

                    {/* Selection Checkmark */}
                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-indigo-500 scale-100 opacity-100 shadow-md' : 'scale-50 opacity-0 bg-white'
                    }`}>
                      <Check size={18} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                </div>
                
                <div className="p-5 text-center flex-1 flex flex-col justify-center">
                  {candidate.partyName && (
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">พรรค{candidate.partyName}</p>
                  )}
                  <h3 className={`text-xl font-bold transition-colors ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                    {candidate.name}
                  </h3>
                  {candidate.members && candidate.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {candidate.members.map((member: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 pr-2 pl-1 py-1 rounded-full border border-gray-100 dark:border-gray-700 whitespace-nowrap">
                            {member.imageUrl ? (
                              <img src={member.imageUrl} alt={member.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[9px] font-bold text-indigo-600 shrink-0">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{member.name}</span>
                            {member.role && <span className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">{member.role}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <input 
                  type="radio" 
                  name="vote" 
                  value={candidate._id}
                  className="opacity-0 absolute"
                  checked={isSelected}
                  onChange={() => setSelectedCandidate(candidate._id)}
                />
              </label>
            );
          })}

          {/* Abstain Option */}
          <label 
            className={`relative group cursor-pointer block rounded-3xl overflow-hidden transition-all duration-300 sm:col-span-2 lg:col-span-1 xl:col-span-2 ${
              selectedCandidate === "abstain" 
                ? 'ring-4 ring-gray-500 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-900 scale-[1.02] bg-gray-100 dark:bg-gray-800 shadow-xl' 
                : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="p-1 h-full flex flex-col">
              <div className="aspect-4/3g:flex-1 w-full rounded-2xl bg-gray-100 dark:bg-gray-800/50 flex flex-col items-center justify-center relative border border-dashed border-gray-300 dark:border-gray-600">
                <UserX size={64} className={selectedCandidate === "abstain" ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'} strokeWidth={1.5} />
                
                {/* Selection Checkmark */}
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  selectedCandidate === "abstain" ? 'bg-gray-600 scale-100 opacity-100 shadow-md' : 'scale-50 opacity-0 bg-white'
                }`}>
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
              </div>
              <div className="p-5 text-center shrink-0">
                <h3 className={`text-xl font-bold transition-colors ${selectedCandidate === "abstain" ? 'text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  งดออกเสียง (Abstain)
                </h3>
              </div>
            </div>
            <input 
              type="radio" 
              name="vote" 
              value="abstain"
              className="opacity-0 absolute"
              checked={selectedCandidate === "abstain"}
              onChange={() => setSelectedCandidate("abstain")}
            />
          </label>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className={`fixed bottom-0 left-0 w-full transition-transform duration-300 z-40 ${selectedCandidate ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-6 py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-500 dark:text-gray-400">คุณได้เลือก:</p>
              <p className="font-bold text-lg text-indigo-700 dark:text-indigo-400">
                {selectedCandidate === "abstain" 
                  ? "งดออกเสียง" 
                  : candidates.find((c:any) => c._id === selectedCandidate)?.name || ""}
              </p>
            </div>
            
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full sm:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-transform active:scale-95 flex justify-center items-center gap-2"
            >
              ยืนยันการลงคะแนน <Check size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">ยืนยันการตัดสินใจ?</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 my-6 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 mb-1">คุณกำลังจะลงคะแนนให้</p>
              <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                {selectedCandidate === "abstain" 
                  ? "งดออกเสียง" 
                  : `หมายเลข ${candidates.find((c:any) => c._id === selectedCandidate)?.number} - ${candidates.find((c:any) => c._id === selectedCandidate)?.name}`}
              </p>
            </div>
            <p className="text-center text-red-500 text-sm font-medium mb-6">
              ⚠️ การลงคะแนนไม่สามารถแก้ไขได้ในภายหลัง
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors"
              >
                กลับไปแก้ไข
              </button>
              <button 
                onClick={handleVoteSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 flex justify-center items-center transition-all disabled:opacity-70 disabled:scale-100 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : "ยืนยันการโหวต"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentVotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    }>
      <VotePageContent />
    </Suspense>
  );
}
