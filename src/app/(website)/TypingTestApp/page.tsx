"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Card, CardBody, Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, User, Tabs, Tab } from "@heroui/react";
import { TrophyOutlined, SyncOutlined, HistoryOutlined, QuestionCircleOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

interface TopScore {
  _id: string;
  userId?: string;
  name: string;
  userImage?: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
}

import { paragraphs } from "./texts";
import { paragraphsEn } from "./texts_en";
import Link from "next/link";

const calculateWPM = (typedCharacters: number, seconds: number): number => {
  if (seconds <= 0) return 0;
  const minutes = seconds / 60;
  const words = typedCharacters / 5;
  return Math.round(words / minutes);
};

export default function TypingTestApp(): JSX.Element {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  const [editingScore, setEditingScore] = useState<TopScore | null>(null);
  const [editWpm, setEditWpm] = useState<string>("");
  const [editAccuracy, setEditAccuracy] = useState<string>("");
  const [testLang, setTestLang] = useState<"th" | "en">("th");
  const [textToType, setTextToType] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [status, setStatus] = useState<"ready" | "countdown" | "typing" | "finished">("ready");
  const [timer, setTimer] = useState<number>(60);
  const [countdown, setCountdown] = useState<number>(3);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);

  const [leaderboard, setLeaderboard] = useState<TopScore[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  const fetchLeaderboard = async (lang = testLang) => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/typing-test?lang=${lang}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.topScores);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
    setIsLoadingLeaderboard(false);
  };

  useEffect(() => {
    startTest(false, testLang);
    fetchLeaderboard(testLang);
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []); // Initial load only, language switch handled explicitly

  const saveScoreToDB = async (finalWpm: number, finalAcc: number) => {
    if (!session) return;
    try {
      const res = await fetch("/api/typing-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm: finalWpm, accuracy: finalAcc, lang: testLang }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("บันทึกสถิติของคุณเรียบร้อยแล้ว!");
        fetchLeaderboard();
      }
    } catch (error) {
      console.error("Failed to save score", error);
    }
  };

  const startTest = (startNow = true, lang = testLang): void => {
    const source = lang === "th" ? paragraphs : paragraphsEn;
    const newText = source[Math.floor(Math.random() * source.length)];
    setTextToType(newText);
    setTypedText("");
    setTimer(60);
    setWpm(0);
    setAccuracy(0);
    setCountdown(3);
    setStatus("ready");
    if (startNow) handleStartCountdown();
  };

  const handleLanguageChange = (key: React.Key) => {
    const newLang = key as "th" | "en";
    setTestLang(newLang);
    startTest(false, newLang);
    fetchLeaderboard(newLang);
  };

  const handleStartCountdown = (): void => {
    setStatus("countdown");
    const countdownId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownId);
          setStatus("typing");
          setTimeout(() => inputRef.current?.focus(), 100);
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTimer = (): void => {
    if (timerId.current) clearInterval(timerId.current);
    timerId.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerId.current!);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTest = () => {
    setStatus("finished");
    // State values might be slightly stale in this closure, but handleInputChange updates them correctly.
    // For exactness, we rely on the final render wpm and accuracy.
    // We will use a small timeout to let the last state update apply, or use refs if needed.
  };

  const handleEditSubmit = async () => {
    if (!editingScore) return;
    try {
      const res = await fetch(`/api/typing-test/${editingScore._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm: Number(editWpm), accuracy: Number(editAccuracy) })
      });
      if (res.ok) {
        toast.success("อัปเดตคะแนนสำเร็จ");
        fetchLeaderboard();
      } else {
        toast.error("อัปเดตคะแนนไม่สำเร็จ");
      }
    } catch (e) {
      toast.error("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  // When status becomes finished, save the score (using the latest state)
  useEffect(() => {
    if (status === "finished" && wpm > 0) {
      saveScoreToDB(wpm, accuracy);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (value.length > textToType.length) return;

    setTypedText(value);

    let correctCharacters = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === textToType[i]) correctCharacters++;
    }

    const elapsedTime = 60 - timer;
    const currentWPM = calculateWPM(correctCharacters, elapsedTime || 1); // Avoid div by zero
    setWpm(currentWPM);
    setAccuracy(Math.round((correctCharacters / value.length) * 100) || 0);

    if (value === textToType) {
      clearInterval(timerId.current!);
      finishTest();
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-slate-200 py-6 sm:py-12 px-4 sm:px-8 relative overflow-hidden font-sans flex flex-col">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1600px] w-full mx-auto space-y-8 relative z-10 flex flex-col flex-1">
        
        {/* Header - Slim & Modern */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:px-8 rounded-3xl border border-white/50 dark:border-slate-800/50 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
              <span className="font-black text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-black bg-linear-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent leading-none">
                ทดสอบพิมพ์ดีด
              </h1>
              {!session && (
                <p className="text-[10px] text-amber-500 font-medium mt-1">⚠️ ไม่ได้เข้าสู่ระบบ (สถิติจะไม่ถูกบันทึก)</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950/50 p-1 rounded-full border border-slate-200 dark:border-slate-800">
            <Button 
              size="sm" 
              variant={testLang === "th" ? "solid" : "light"} 
              color={testLang === "th" ? "primary" : "default"}
              className={testLang === "th" ? "rounded-full shadow-md font-bold" : "rounded-full text-slate-500"}
              onPress={() => handleLanguageChange("th")}
            >
              🇹🇭 TH
            </Button>
            <Button 
              size="sm" 
              variant={testLang === "en" ? "solid" : "light"} 
              color={testLang === "en" ? "primary" : "default"}
              className={testLang === "en" ? "rounded-full shadow-md font-bold" : "rounded-full text-slate-500"}
              onPress={() => handleLanguageChange("en")}
            >
              🇬🇧 EN
            </Button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
            <Button isIconOnly size="sm" variant="light" className="rounded-full text-slate-500" onPress={onOpen}>
              <QuestionCircleOutlined />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1">
          {/* Main Area */}
          <div className="xl:col-span-3 flex flex-col">
            
            {/* Inline HUD Stats */}
            <div className="flex justify-center gap-8 sm:gap-16 py-6 mb-4">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">เวลา</p>
                <p className={`text-4xl sm:text-5xl font-black font-mono transition-colors ${timer <= 10 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-slate-800 dark:text-slate-200'}`}>
                  {timer}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">คำ/นาที</p>
                <p className="text-4xl sm:text-5xl font-black font-mono text-teal-500 dark:text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                  {wpm}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">ความแม่นยำ</p>
                <p className="text-4xl sm:text-5xl font-black font-mono text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  {accuracy}%
                </p>
              </div>
            </div>

            {/* Minimalist Typing Canvas */}
            <div className="relative flex-1 flex flex-col justify-center">
              
              <AnimatePresence>
                {status === "countdown" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/50 dark:bg-[#09090b]/50 backdrop-blur-[2px] rounded-3xl"
                  >
                    <span className="text-[12rem] font-black text-teal-500/80 dark:text-teal-400/80 drop-shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                      {countdown}
                    </span>
                  </motion.div>
                )}
                
                {status === "finished" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-slate-800/50 shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-amber-400/20 rounded-full flex items-center justify-center mb-6">
                      <TrophyOutlined className="text-5xl text-amber-500" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">หมดเวลา!</h2>
                    <div className="flex gap-8 my-8">
                      <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">ความเร็ว</p>
                        <p className="text-3xl font-black text-teal-500 dark:text-teal-400">{wpm} <span className="text-lg">คำ/นาที</span></p>
                      </div>
                      <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                      <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">ความแม่นยำ</p>
                        <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{accuracy}%</p>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      radius="full"
                      startContent={<SyncOutlined />}
                      onClick={() => startTest(false)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 shadow-xl hover:scale-105 transition-transform"
                    >
                      ลองอีกครั้ง
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                className={`relative w-full max-w-5xl mx-auto text-2xl sm:text-3xl leading-[1.8] tracking-wide focus:outline-hidden transition-opacity duration-300 ${status === "finished" ? "opacity-10 blur-sm" : "opacity-100"}`}
                style={{ fontFamily: "'TH Sarabun PSK', 'TH Sarabun New', 'Sarabun', sans-serif" }}
                onClick={() => {
                  if (status === "typing") inputRef.current?.focus();
                }}
              >
                {/* Text Loop */}
                <div className="wrap-break-word select-none">
                  {(() => {
                    const groups: { text: string; colorClass: string; bgClass: string; isCursor: boolean }[] = [];
                    let currentGroup = { text: "", colorClass: "", bgClass: "" };

                    for (let i = 0; i < textToType.length; i++) {
                      const char = textToType[i];
                      const isTyped = i < typedText.length;
                      const isCurrent = i === typedText.length;
                      const typedChar = typedText[i];
                      const isCorrect = typedChar === char;

                      let colorClass = "text-slate-300 dark:text-slate-700/80"; // untyped
                      let bgClass = "";
                      
                      if (isTyped) {
                        if (isCorrect) {
                          colorClass = "text-slate-800 dark:text-slate-200";
                        } else {
                          colorClass = "text-red-500";
                          bgClass = "bg-red-500/20 rounded-sm";
                        }
                      }

                      const displayChar = char === " " && (!isTyped || isCorrect) ? "\u00A0" : char === " " && !isCorrect ? "_" : char;

                      if (isCurrent && status === "typing") {
                        if (currentGroup.text) {
                          groups.push({ ...currentGroup, isCursor: false });
                          currentGroup = { text: "", colorClass: "", bgClass: "" };
                        }
                        groups.push({
                          text: displayChar,
                          colorClass,
                          bgClass,
                          isCursor: true
                        });
                      } else {
                        if (currentGroup.text === "") {
                          currentGroup = { text: displayChar, colorClass, bgClass };
                        } else if (currentGroup.colorClass === colorClass && currentGroup.bgClass === bgClass) {
                          currentGroup.text += displayChar;
                        } else {
                          groups.push({ ...currentGroup, isCursor: false });
                          currentGroup = { text: displayChar, colorClass, bgClass };
                        }
                      }
                    }
                    if (currentGroup.text) {
                      groups.push({ ...currentGroup, isCursor: false });
                    }

                    return groups.map((group, index) => {
                      if (group.isCursor) {
                        return (
                          <span key={index} className="relative">
                            <motion.span 
                              layoutId="cursor"
                              className="absolute -left-px top-[15%] bottom-[15%] w-[3px] bg-teal-500 rounded-full z-10"
                              initial={{ opacity: 1 }}
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            />
                            <span className={`${group.colorClass} ${group.bgClass}`}>
                              {group.text}
                            </span>
                          </span>
                        );
                      }
                      
                      return (
                        <span key={index} className={`${group.colorClass} ${group.bgClass}`}>
                          {group.text}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Hidden Input */}
              <input
                ref={inputRef}
                type="text"
                value={typedText}
                onChange={handleInputChange}
                disabled={status !== "typing"}
                className="absolute inset-0 w-full h-full opacity-0 cursor-default z-0"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />

              {/* Start Overlay */}
              {status === "ready" && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-50/40 dark:bg-[#09090b]/40 backdrop-blur-[2px] rounded-3xl">
                  <Button
                    size="lg"
                    radius="full"
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-12 py-8 text-xl shadow-2xl hover:scale-105 transition-transform"
                    onClick={handleStartCountdown}
                  >
                    คลิกเพื่อเริ่มต้น
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 shadow-xl rounded-3xl h-[600px] xl:h-full flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-white/40 dark:bg-slate-900/40">
                <h3 className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-white uppercase tracking-wider">
                  <TrophyOutlined className="text-amber-500 text-lg" />
                  10 อันดับสูงสุด ({testLang === "th" ? "TH" : "EN"})
                </h3>
                <Button isIconOnly size="sm" variant="light" className="text-slate-500 hover:text-teal-500 transition-colors" onClick={() => fetchLeaderboard()}>
                  <SyncOutlined className={isLoadingLeaderboard ? "animate-spin" : ""} />
                </Button>
              </div>

              <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                {isLoadingLeaderboard ? (
                  <div className="flex justify-center p-8"><Spinner color="primary" /></div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((score, index) => (
                      <div key={score._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${index === 0 ? "bg-amber-400 text-amber-950 shadow-amber-400/50" :
                              index === 1 ? "bg-slate-300 text-slate-800" :
                                index === 2 ? "bg-amber-700 text-white" :
                                  "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            }`}>
                            {index + 1}
                          </div>
                          {score.userId ? (
                            <Link href={`/dashboard/profile/${score.userId}`} className="hover:opacity-80 transition-opacity">
                              <User
                                name={<span className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{score.name}</span>}
                                description={<span className="text-[10px] text-slate-400">{new Date(score.createdAt).toLocaleDateString('th-TH')}</span>}
                                avatarProps={{
                                  src: score.userImage || "",
                                  name: score.name.charAt(0).toUpperCase(),
                                  size: "sm",
                                  className: "bg-slate-200 dark:bg-slate-700"
                                }}
                              />
                            </Link>
                          ) : (
                            <User
                              name={<span className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{score.name}</span>}
                              description={<span className="text-[10px] text-slate-400">{new Date(score.createdAt).toLocaleDateString('th-TH')}</span>}
                              avatarProps={{
                                src: score.userImage || "",
                                name: score.name.charAt(0).toUpperCase(),
                                size: "sm",
                                className: "bg-slate-200 dark:bg-slate-700"
                              }}
                            />
                          )}
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="text-teal-500 dark:text-teal-400 font-bold leading-none">{score.wpm} <span className="text-[9px] text-slate-400 font-normal">WPM</span></p>
                            <p className="text-[10px] text-emerald-500/80 mt-1">{score.accuracy}%</p>
                          </div>
                          {(session?.user as any)?.role === "super_admin" && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                isIconOnly
                                size="sm"
                                color="warning"
                                variant="light"
                                className="w-6 h-6 min-w-6"
                                onClick={() => {
                                  setEditingScore(score);
                                  setEditWpm(score.wpm.toString());
                                  setEditAccuracy(score.accuracy.toString());
                                  onEditOpen();
                                }}
                              >
                                <EditOutlined className="text-xs" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                className="w-6 h-6 min-w-6"
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this score?")) return;
                                  try {
                                    const res = await fetch(`/api/typing-test/${score._id}`, { method: "DELETE" });
                                    if (res.ok) {
                                      toast.success("ลบประวัติสำเร็จ");
                                      fetchLeaderboard();
                                    } else {
                                      toast.error("ลบประวัติไม่สำเร็จ");
                                    }
                                  } catch (e) {
                                    toast.error("เกิดข้อผิดพลาดในการลบประวัติ");
                                  }
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 text-slate-400 flex flex-col items-center justify-center h-full">
                    <HistoryOutlined className="text-5xl mb-3 opacity-20" />
                    <p className="text-sm font-medium">No records yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals remain mostly the same but tweaked for aesthetics */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="text-foreground bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-teal-600 dark:text-teal-400 font-black text-xl">How to Play</ModalHeader>
              <ModalBody className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <strong className="text-slate-800 dark:text-white">WPM (Words Per Minute):</strong>
                    <p className="text-sm mt-1">หน่วยวัดความเร็วในการพิมพ์ คำนวณจากตัวอักษรที่พิมพ์ถูก (5 ตัวอักษร = 1 คำ)</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                    <strong className="text-slate-800 dark:text-white">Accuracy (ความแม่นยำ):</strong>
                    <p className="text-sm mt-1">เปอร์เซ็นต์ความถูกต้องของตัวอักษรทั้งหมดที่คุณพิมพ์เทียบกับต้นฉบับ</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>กดปุ่ม "Click to Start" เพื่อเริ่มทดสอบ</li>
                    <li>ตัวอักษรที่ยังไม่พิมพ์จะเป็นสีเทา, พิมพ์ถูกเป็นสีเข้ม, พิมพ์ผิดเป็นสีแดง</li>
                    <li>พิมพ์ให้จบภายใน 60 วินาที เพื่อบันทึกสถิติลง Leaderboard</li>
                  </ul>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" radius="full" onPress={onClose} className="font-bold px-8 shadow-md">
                  Let's Go!
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Score Modal for Super Admin */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} className="text-foreground bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-teal-600 dark:text-teal-400 font-bold">แก้ไขคะแนน ({editingScore?.name})</ModalHeader>
              <ModalBody className="text-slate-600 dark:text-slate-300">
                <Input
                  label="WPM (ความเร็ว)"
                  labelPlacement="outside"
                  placeholder="0"
                  type="number"
                  value={editWpm}
                  onChange={(e) => setEditWpm(e.target.value)}
                  variant="bordered"
                  className="mb-4 mt-2"
                  classNames={{ input: "text-slate-800 dark:text-white" }}
                />
                <Input
                  label="Accuracy (ความแม่นยำ %)"
                  labelPlacement="outside"
                  placeholder="100"
                  type="number"
                  value={editAccuracy}
                  onChange={(e) => setEditAccuracy(e.target.value)}
                  variant="bordered"
                  className="mb-2 mt-4"
                  classNames={{ input: "text-slate-800 dark:text-white" }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" radius="full" onPress={onClose}>
                  ยกเลิก
                </Button>
                <Button color="primary" radius="full" onPress={() => { handleEditSubmit(); onClose(); }} className="px-6">
                  บันทึก
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
