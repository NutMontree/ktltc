"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const COLS = 10;
const ROWS = 20;

const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "bg-cyan-400",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-blue-500",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-orange-500",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-yellow-400",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "bg-green-500",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-purple-500",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "bg-red-500",
  },
};

export default function Tetris() {
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null)),
  );
  const [activePiece, setActivePiece] = useState({
    pos: { x: 3, y: 0 },
    ...TETROMINOS.T,
  });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const checkCollision = (pos: { x: number; y: number }, shape: number[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          if (
            !grid[y + pos.y] ||
            grid[y + pos.y][x + pos.x] !== null ||
            x + pos.x < 0 ||
            x + pos.x >= COLS
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = () => {
    const matrix = activePiece.shape;
    const rotated = matrix[0].map((_, index) =>
      matrix.map((col) => col[index]).reverse(),
    );
    if (!checkCollision(activePiece.pos, rotated)) {
      setActivePiece((prev) => ({ ...prev, shape: rotated }));
    }
  };

  const freeze = () => {
    const newGrid = grid.map((row) => [...row]);
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = y + activePiece.pos.y;
          const gridX = x + activePiece.pos.x;
          if (newGrid[gridY]) newGrid[gridY][gridX] = activePiece.color;
        }
      });
    });

    // ตรวจสอบและลบแถวที่เต็ม + คำนวณคะแนน
    const filteredGrid = newGrid.filter((row) =>
      row.some((cell) => cell === null),
    );
    const linesCleared = ROWS - filteredGrid.length;

    if (linesCleared > 0) {
      const linePoints = [0, 100, 300, 500, 800];
      setScore((prev) => prev + linePoints[linesCleared]);
    }

    const newRows = Array(ROWS - filteredGrid.length)
      .fill(null)
      .map(() => Array(COLS).fill(null));
    setGrid([...newRows, ...filteredGrid]);
    resetPiece();
  };

  const resetPiece = () => {
    const keys = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>;
    const randomPiece =
      TETROMINOS[keys[Math.floor(Math.random() * keys.length)]];
    if (checkCollision({ x: 3, y: 0 }, randomPiece.shape)) {
      setGameOver(true);
    } else {
      setActivePiece({ pos: { x: 3, y: 0 }, ...randomPiece });
    }
  };

  const move = useCallback(
    (dir: { x: number; y: number }) => {
      if (gameOver) return;
      const newPos = {
        x: activePiece.pos.x + dir.x,
        y: activePiece.pos.y + dir.y,
      };
      if (!checkCollision(newPos, activePiece.shape)) {
        setActivePiece((prev) => ({ ...prev, pos: newPos }));
      } else if (dir.y > 0) {
        freeze();
      }
    },
    [activePiece, grid, gameOver],
  );

  // คีย์บอร์ดคอมพิวเตอร์
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
        e.preventDefault();
      if (e.key === "ArrowLeft") move({ x: -1, y: 0 });
      if (e.key === "ArrowRight") move({ x: 1, y: 0 });
      if (e.key === "ArrowDown") move({ x: 0, y: 1 });
      if (e.key === "ArrowUp") rotate();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, activePiece.shape, gameOver]);

  // เวลาตกอัตโนมัติ
  useEffect(() => {
    if (gameOver) return;
    const drop = setInterval(() => move({ x: 0, y: 1 }), 800);
    return () => clearInterval(drop);
  }, [move, gameOver]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950 p-4 font-sans text-white">
      {/* Score Header */}
      <div className="mt-4 mb-6 text-center">
        <h1 className="text-3xl font-black tracking-widest text-blue-500">
          TETRIS
        </h1>
        <div className="mt-2 rounded-full border border-slate-600 bg-slate-800 px-6 py-1 text-xl font-bold shadow-lg shadow-blue-500/10">
          SCORE:{" "}
          <span className="text-yellow-400">{score.toLocaleString()}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative border-4 border-slate-700 bg-slate-900 p-0.5 shadow-2xl">
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell: string | null, x: number) => {
              let color = cell;
              const pieceY = y - activePiece.pos.y;
              const pieceX = x - activePiece.pos.x;
              if (activePiece.shape[pieceY]?.[pieceX])
                color = activePiece.color;

              return (
                <div
                  key={x}
                  className={`h-6 w-6 border-[0.5px] border-slate-800/50 sm:h-7 sm:w-7 ${color || "bg-slate-950/40"}`}
                />
              );
            })}
          </div>
        ))}

        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-6 text-center backdrop-blur-md">
            <h2 className="mb-2 text-4xl font-black text-red-500">GAME OVER</h2>
            <p className="mb-6 text-xl">Final Score: {score}</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 font-bold shadow-xl transition-all hover:bg-blue-500 active:scale-90"
            >
              <ReloadOutlined /> RESTART
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls - ปุ่มกดบนหน้าจอ */}
      <div className="mt-10 grid w-full max-w-[300px] grid-cols-3 gap-4">
        <div />
        <button
          onPointerDown={rotate}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 border-slate-900 bg-slate-800 active:translate-y-1 active:border-b-0"
        >
          <ReloadOutlined className="text-2xl text-blue-400" />
        </button>
        <div />

        <button
          onPointerDown={() => move({ x: -1, y: 0 })}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 border-slate-900 bg-slate-800 active:translate-y-1 active:border-b-0"
        >
          <ArrowLeftOutlined className="text-2xl text-white" />
        </button>
        <button
          onPointerDown={() => move({ x: 0, y: 1 })}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 border-slate-900 bg-slate-800 active:translate-y-1 active:border-b-0"
        >
          <ArrowDownOutlined className="text-2xl text-white" />
        </button>
        <button
          onPointerDown={() => move({ x: 1, y: 0 })}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-b-4 border-slate-900 bg-slate-800 active:translate-y-1 active:border-b-0"
        >
          <ArrowRightOutlined className="text-2xl text-white" />
        </button>
      </div>

      <p className="mt-6 text-[10px] tracking-widest text-slate-500 uppercase">
        Desktop: Arrow Keys to Play
      </p>
    </div>
  );
}
