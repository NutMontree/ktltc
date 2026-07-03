"use client";

import { useState, useEffect, useRef, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Card, CardBody, Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from "@heroui/react";
import { TrophyOutlined, SyncOutlined, HistoryOutlined, QuestionCircleOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

interface TopScore {
  _id: string;
  name: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
}

import { paragraphs } from "./texts";

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

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/typing-test");
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
    startTest(false);
    fetchLeaderboard();
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  const saveScoreToDB = async (finalWpm: number, finalAcc: number) => {
    if (!session) return;
    try {
      const res = await fetch("/api/typing-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm: finalWpm, accuracy: finalAcc }),
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

  const startTest = (startNow = true): void => {
    const newText = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setTextToType(newText);
    setTypedText("");
    setTimer(60);
    setWpm(0);
    setAccuracy(0);
    setCountdown(3);
    setStatus("ready");
    if (startNow) handleStartCountdown();
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
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black bg-linear-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
            Typing Speed Test
          </h1>
          <p className="text-slate-400 text-lg flex items-center justify-center gap-4">
            ทดสอบความเร็วและความแม่นยำในการพิมพ์ของคุณ
            <Button size="sm" variant="flat" color="primary" onPress={onOpen} startContent={<QuestionCircleOutlined />}>
              วิธีการเล่น
            </Button>
          </p>
          {!session && (
            <p className="text-amber-500 text-sm bg-amber-500/10 py-2 px-4 rounded-full inline-block border border-amber-500/20">
              ⚠️ คุณยังไม่ได้เข้าสู่ระบบ สถิติการพิมพ์ของคุณจะไม่ถูกบันทึกใน Leaderboard
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Typing Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-slate-900 border-none shadow-xl shadow-slate-900/50">
                <CardBody className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-1">เวลาที่เหลือ (วิ)</p>
                  <p className={`text-4xl font-black ${timer <= 10 ? 'text-red-500' : 'text-white'}`}>{timer}s</p>
                </CardBody>
              </Card>
              <Card className="bg-slate-900 border-none shadow-xl shadow-slate-900/50">
                <CardBody className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-1">ความเร็ว (WPM)</p>
                  <p className="text-4xl font-black text-teal-400">{wpm}</p>
                </CardBody>
              </Card>
              <Card className="bg-slate-900 border-none shadow-xl shadow-slate-900/50">
                <CardBody className="text-center py-6">
                  <p className="text-slate-400 text-sm font-medium mb-1">ความแม่นยำ</p>
                  <p className="text-4xl font-black text-emerald-400">{accuracy}%</p>
                </CardBody>
              </Card>
            </div>

            {/* Typing Canvas */}
            <Card className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <CardBody className="p-8 sm:p-10">
                <div className="relative text-2xl sm:text-3xl leading-relaxed tracking-wide min-h-[200px] font-medium selection:bg-teal-500/30">
                  <AnimatePresence>
                    {status === "countdown" && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-2xl"
                      >
                        <span className="text-8xl font-black text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                          {countdown}
                        </span>
                      </motion.div>
                    )}
                    {status === "finished" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-2xl"
                      >
                        <TrophyOutlined className="text-6xl text-amber-400 mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">หมดเวลา!</h2>
                        <p className="text-xl text-slate-300 mb-6">
                          ความเร็ว: <span className="text-teal-400 font-bold">{wpm} WPM</span> | 
                          ความแม่นยำ: <span className="text-emerald-400 font-bold">{accuracy}%</span>
                        </p>
                        <Button
                          color="primary"
                          size="lg"
                          startContent={<SyncOutlined />}
                          onClick={() => startTest(false)}
                          className="bg-linear-to-r from-teal-500 to-emerald-500 font-bold shadow-lg shadow-teal-500/30"
                        >
                          ลองอีกครั้ง
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="text-slate-600 flex flex-wrap leading-14">
                    {textToType.split("").map((char, index) => {
                      const isTyped = index < typedText.length;
                      const typedChar = typedText[index];
                      const isCorrect = typedChar === char;

                      if (!isTyped) {
                        return <span key={index} className={`text-slate-500/50 ${char === " " ? "opacity-30" : ""}`}>{char === " " ? "␣" : char}</span>;
                      }

                      if (isCorrect) {
                        return <span key={index} className="text-green-400 font-bold">{char === " " ? "␣" : char}</span>;
                      }

                      return (
                        <span key={index} className="relative inline-flex flex-col items-center justify-center">
                          <span className="absolute -top-7 text-[12px] text-red-400 font-black bg-red-950/90 px-1.5 py-0.5 rounded-md border border-red-500/40 shadow-sm whitespace-pre z-20">
                            {typedChar === " " ? "␣" : typedChar}
                          </span>
                          <span className="text-red-400 font-bold line-through opacity-60">{char === " " ? "␣" : char}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Input Field (Hidden visually but active) */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typedText}
                  onChange={handleInputChange}
                  disabled={status !== "typing"}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                {/* Start Button Overlay */}
                {status === "ready" && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/50 backdrop-blur-sm">
                    <Button
                      size="lg"
                      className="bg-white text-slate-900 font-black px-12 py-8 text-2xl rounded-full shadow-2xl hover:scale-105 transition-transform"
                      onClick={handleStartCountdown}
                    >
                      เริ่มพิมพ์
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Leaderboard Area */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900 border border-slate-800 shadow-xl h-full">
              <CardBody className="p-0">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 sticky top-0 z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <TrophyOutlined className="text-amber-400" />
                    Top 10 Leaderboard
                  </h3>
                  <Button isIconOnly size="sm" variant="flat" onClick={fetchLeaderboard}>
                    <SyncOutlined className={isLoadingLeaderboard ? "animate-spin" : ""} />
                  </Button>
                </div>
                
                <div className="p-2">
                  {isLoadingLeaderboard ? (
                    <div className="flex justify-center p-8"><Spinner color="primary" /></div>
                  ) : leaderboard.length > 0 ? (
                    <div className="space-y-2">
                      {leaderboard.map((score, index) => (
                        <div key={score._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? "bg-amber-400 text-amber-950" : 
                              index === 1 ? "bg-slate-300 text-slate-800" : 
                              index === 2 ? "bg-amber-700 text-white" : 
                              "bg-slate-700 text-slate-300"
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm line-clamp-1">{score.name}</p>
                              <p className="text-xs text-slate-400">{new Date(score.createdAt).toLocaleDateString('th-TH')}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-teal-400 font-bold">{score.wpm} <span className="text-[10px] text-slate-500 font-normal">WPM</span></p>
                              <p className="text-[10px] text-emerald-500">{score.accuracy}% Acc</p>
                            </div>
                            {(session?.user as any)?.role === "super_admin" && (
                              <div className="flex gap-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="warning"
                                  variant="light"
                                  onClick={() => {
                                    setEditingScore(score);
                                    setEditWpm(score.wpm.toString());
                                    setEditAccuracy(score.accuracy.toString());
                                    onEditOpen();
                                  }}
                                >
                                  <EditOutlined />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="light"
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
                    <div className="text-center p-8 text-slate-500 flex flex-col items-center">
                      <HistoryOutlined className="text-4xl mb-2 opacity-20" />
                      <p>ยังไม่มีสถิติในระบบ</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* How to Play Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark text-foreground bg-slate-900 border border-slate-800">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-teal-400">วิธีการเล่นเกมพิมพ์ดีด</ModalHeader>
              <ModalBody className="text-slate-300">
                <p>
                  <strong>WPM ย่อมาจาก Words Per Minute (คำต่อนาที):</strong>
                  <br />
                  คือหน่วยวัดความเร็วในการพิมพ์ โดยระบบนี้จะคำนวณจากจำนวนตัวอักษรที่คุณพิมพ์ถูก (เฉลี่ย 5 ตัวอักษร นับเป็น 1 คำ) ยิ่ง WPM สูง แสดงว่าพิมพ์ได้เร็ว
                </p>
                <p>
                  <strong>ความแม่นยำ (Accuracy):</strong>
                  <br />
                  คือเปอร์เซ็นต์ความถูกต้องของตัวอักษรทั้งหมดที่คุณพิมพ์ เทียบกับตัวอักษรของข้อความต้นฉบับ
                </p>
                <p>
                  <strong>วิธีเล่น:</strong>
                  <br />
                  1. กดปุ่ม "เริ่มพิมพ์" แล้วระบบจะนับถอยหลัง 3 วินาที<br />
                  2. ให้คุณพิมพ์ข้อความตามที่เห็นบนหน้าจอให้เร็วและแม่นยำที่สุด<br />
                  3. ตัวอักษรสีเขียว = พิมพ์ถูก, ตัวอักษรสีแดง = พิมพ์ผิด<br />
                  4. เมื่อหมดเวลา 60 วินาที หรือ พิมพ์ข้อความจนจบ ระบบจะบันทึกคะแนนที่ดีที่สุดของคุณลง Leaderboard
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  เข้าใจแล้ว
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Score Modal for Super Admin */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} className="dark text-foreground bg-slate-900 border border-slate-800">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-teal-400">แก้ไขคะแนน ({editingScore?.name})</ModalHeader>
              <ModalBody className="text-slate-300">
                <Input
                  label="WPM (ความเร็ว)"
                  type="number"
                  value={editWpm}
                  onChange={(e) => setEditWpm(e.target.value)}
                  variant="bordered"
                  classNames={{ input: "text-white" }}
                />
                <Input
                  label="Accuracy (ความแม่นยำ %)"
                  type="number"
                  value={editAccuracy}
                  onChange={(e) => setEditAccuracy(e.target.value)}
                  variant="bordered"
                  classNames={{ input: "text-white" }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  ยกเลิก
                </Button>
                <Button color="primary" onPress={() => { handleEditSubmit(); onClose(); }}>
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
