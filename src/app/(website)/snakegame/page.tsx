"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

type Position = { x: number; y: number };

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

        <div className="flex justify-center">
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
      </div>
    </div>
  );
};

export default SnakeGame;
