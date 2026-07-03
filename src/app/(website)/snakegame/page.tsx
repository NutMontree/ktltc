"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  TrophyOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { Card, CardBody, Button, Spinner, User } from "@heroui/react";
import Link from "next/link";
import toast from "react-hot-toast";

type Position = { x: number; y: number };

interface SnakeTopScore {
  _id: string;
  userId?: string;
  name: string;
  userImage?: string;
  score: number;
  createdAt: string;
}

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 5, y: 5 },
  { x: 4, y: 5 },
];
const INITIAL_FOOD = { x: 10, y: 10 };

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<string>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<SnakeTopScore[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  
  const { data: session } = useSession();

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch("/api/snake-score");
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
    fetchLeaderboard();
  }, []);

  const saveScoreToDB = async (finalScore: number) => {
    if (!session || finalScore === 0) return;
    try {
      const res = await fetch("/api/snake-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeaderboard();
        if (data.message === "Score saved!" || data.message === "New high score updated!") {
          toast.success("บันทึกสถิติใหม่สำเร็จ!");
        } else {
          toast.success("คะแนนยังไม่ทำลายสถิติเดิมของคุณ");
        }
      }
    } catch (error) {
      console.error("Failed to save score", error);
    }
  };

  useEffect(() => {
    if (gameOver && score > 0) {
      saveScoreToDB(score);
    }
  }, [gameOver]);

  // ใช้สำหรับการกดปุ่มบนจอ
  const changeDirection = (newDir: string) => {
    if (gameOver) return;
    if (newDir === "UP" && direction !== "DOWN") setDirection("UP");
    if (newDir === "DOWN" && direction !== "UP") setDirection("DOWN");
    if (newDir === "LEFT" && direction !== "RIGHT") setDirection("LEFT");
    if (newDir === "RIGHT" && direction !== "LEFT") setDirection("RIGHT");
  };

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      // เพิ่มเงื่อนไขเช็คว่าถ้ากดปุ่มลูกศร ให้หยุดการเลื่อนหน้าจอ Browser
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); // ป้องกันหน้าจอขยับ
      }

      if (e.key === "ArrowUp" && direction !== "DOWN") {
        setDirection("UP");
      } else if (e.key === "ArrowDown" && direction !== "UP") {
        setDirection("DOWN");
      } else if (e.key === "ArrowLeft" && direction !== "RIGHT") {
        setDirection("LEFT");
      } else if (e.key === "ArrowRight" && direction !== "LEFT") {
        setDirection("RIGHT");
      }
    },
    [direction, gameOver],
  );

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      if (direction === "UP") head.y -= 1;
      if (direction === "DOWN") head.y += 1;
      if (direction === "LEFT") head.x -= 1;
      if (direction === "RIGHT") head.x += 1;

      // Check Walls
      if (
        head.x < 0 ||
        head.x >= BOARD_SIZE ||
        head.y < 0 ||
        head.y >= BOARD_SIZE
      ) {
        setGameOver(true);
        return;
      }

      // Check Self Collision
      if (newSnake.some((s) => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        return;
      }

      newSnake.unshift(head);

      // Eat Food
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        setFood({
          x: Math.floor(Math.random() * BOARD_SIZE),
          y: Math.floor(Math.random() * BOARD_SIZE),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, 120);
    return () => clearInterval(interval);
  }, [snake, direction, food, gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const restartGame = () => {
    if (score > highScore) setHighScore(score);
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-[1600px] w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black bg-linear-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent uppercase">
            เกมงู (Snake)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-4">
            สะสมคะแนนจากการกินอาหารและระวังอย่าชนกำแพง
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col items-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl">
              {/* Score Board */}
              <div className="mb-6 flex w-full justify-between px-4 gap-8">
                <div className="text-slate-800 dark:text-white flex flex-col items-center bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest">SCORE</p>
                  <p className="text-2xl font-black text-green-500 dark:text-green-400">{score}</p>
                </div>
                <div className="text-slate-800 dark:text-white flex flex-col items-center bg-slate-100 dark:bg-slate-800 px-6 py-2 rounded-2xl shadow-sm">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest">BEST</p>
                  <p className="text-2xl font-black text-yellow-500 dark:text-yellow-400">{highScore}</p>
                </div>
              </div>

              {/* Game Board */}
              <div className="relative overflow-hidden rounded-xl border-4 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner w-[90vw] max-w-[400px] aspect-square">
                {/* Snake Render */}
                {snake.map((segment, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-sm transition-all duration-100 ${i === 0 ? "z-10 bg-green-500 dark:bg-green-400" : "bg-green-600"}`}
                    style={{
                      top: `${segment.y * 5}%`,
                      left: `${segment.x * 5}%`,
                      width: "5%",
                      height: "5%",
                      transform: "scale(0.9)", // For margin effect
                    }}
                  />
                ))}

                {/* Food Render */}
                <div
                  className="absolute animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  style={{
                    top: `${food.y * 5}%`,
                    left: `${food.x * 5}%`,
                    width: "5%",
                    height: "5%",
                    transform: "scale(0.9)",
                  }}
                />

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <h2 className="mb-4 text-3xl font-black text-slate-800 dark:text-white">GAME OVER</h2>
                    <button
                      onClick={restartGame}
                      className="flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
                    >
                      <ReloadOutlined /> RESTART
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Controls */}
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-[240px]">
                <div />
                <button
                  onClick={() => changeDirection("UP")}
                  className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 text-slate-700 dark:text-white shadow-sm active:bg-cyan-500 active:text-white transition-colors"
                >
                  <ArrowUpOutlined className="text-xl" />
                </button>
                <div />
                <button
                  onClick={() => changeDirection("LEFT")}
                  className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 text-slate-700 dark:text-white shadow-sm active:bg-cyan-500 active:text-white transition-colors"
                >
                  <ArrowLeftOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => changeDirection("DOWN")}
                  className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 text-slate-700 dark:text-white shadow-sm active:bg-cyan-500 active:text-white transition-colors"
                >
                  <ArrowDownOutlined className="text-xl" />
                </button>
                <button
                  onClick={() => changeDirection("RIGHT")}
                  className="flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 p-5 text-slate-700 dark:text-white shadow-sm active:bg-cyan-500 active:text-white transition-colors"
                >
                  <ArrowRightOutlined className="text-xl" />
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Area */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl h-full">
              <CardBody className="p-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 sticky top-0 z-10">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <TrophyOutlined className="text-cyan-500 dark:text-cyan-400" />
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
                      {leaderboard.map((sc, index) => (
                        <div key={sc._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? "bg-cyan-400 text-slate-900" :
                                index === 1 ? "bg-slate-300 text-slate-800" :
                                  index === 2 ? "bg-cyan-700 text-white" :
                                    "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                              }`}>
                              {index + 1}
                            </div>
                            {sc.userId ? (
                              <Link href={`/profile/${sc.userId}`} className="hover:opacity-80 transition-opacity">
                                <User
                                  name={<span className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{sc.name}</span>}
                                  description={<span className="text-xs text-slate-500 dark:text-slate-400">{new Date(sc.createdAt).toLocaleDateString('th-TH')}</span>}
                                  avatarProps={{
                                    src: sc.userImage || "",
                                    name: sc.name.charAt(0).toUpperCase(),
                                    size: "sm",
                                    className: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                  }}
                                />
                              </Link>
                            ) : (
                              <User
                                name={<span className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{sc.name}</span>}
                                description={<span className="text-xs text-slate-500 dark:text-slate-400">{new Date(sc.createdAt).toLocaleDateString('th-TH')}</span>}
                                avatarProps={{
                                  src: sc.userImage || "",
                                  name: sc.name.charAt(0).toUpperCase(),
                                  size: "sm",
                                  className: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                }}
                              />
                            )}
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <p className="text-green-500 dark:text-green-400 font-bold">{sc.score} <span className="text-[10px] text-slate-500 font-normal">pts</span></p>
                            </div>
                            {(session?.user as any)?.role === "super_admin" && (
                              <div className="flex gap-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onClick={async () => {
                                    if (confirm("ลบคะแนนนี้?")) {
                                      try {
                                        const res = await fetch(`/api/snake-score/${sc._id}`, { method: "DELETE" });
                                        if (res.ok) {
                                          toast.success("ลบประวัติสำเร็จ");
                                          fetchLeaderboard();
                                        } else {
                                          toast.error("เกิดข้อผิดพลาด");
                                        }
                                      } catch (error) {
                                        toast.error("เกิดข้อผิดพลาด");
                                      }
                                    }
                                  }}
                                >
                                  ❌
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                      ยังไม่มีสถิติในระบบ
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
