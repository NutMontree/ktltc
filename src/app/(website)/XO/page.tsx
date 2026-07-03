"use client";
import { useState, useEffect } from "react";

export default function TicTacToeAI() {
  type Mode = "EASY" | "MEDIUM" | "IMPOSSIBLE" | "2PLAYER";
  const [mode, setMode] = useState<Mode>("IMPOSSIBLE");
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }
    return squares.includes(null) ? null : "Draw";
  };

  // AI Logic: Minimax
  const minimax = (
    newBoard: (string | null)[],
    depth: number,
    isMaximizing: boolean,
  ): number => {
    const winner = checkWinner(newBoard);
    if (winner === "O") return 10 - depth;
    if (winner === "X") return depth - 10;
    if (winner === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = "O";
          let score = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!newBoard[i]) {
          newBoard[i] = "X";
          let score = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAIMove = (currentBoard: (string | null)[]) => {
    let move = -1;
    const availableMoves = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    
    if (availableMoves.length === 0) return;

    if (mode === "EASY" || (mode === "MEDIUM" && Math.random() > 0.5)) {
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!currentBoard[i]) {
          currentBoard[i] = "O";
          let score = minimax(currentBoard, 0, false);
          currentBoard[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
    }

    if (move !== -1) {
      const nextBoard = [...currentBoard];
      nextBoard[move] = "O";
      setBoard(nextBoard);
      setCurrentPlayer("X");
    }
  };

  const handleClick = (i: number) => {
    if (board[i] || checkWinner(board)) return;
    if (mode !== "2PLAYER" && currentPlayer === "O") return; // Wait for AI

    const nextBoard = [...board];
    nextBoard[i] = currentPlayer;
    setBoard(nextBoard);
    
    if (mode === "2PLAYER") {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    } else {
      setCurrentPlayer("O"); // Hand over to AI
    }
  };

  useEffect(() => {
    if (mode !== "2PLAYER" && currentPlayer === "O" && !checkWinner(board)) {
      const timer = setTimeout(() => makeAIMove(board), 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, mode]);

  const result = checkWinner(board);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-[1600px] w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black bg-linear-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
            XO Game
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-4">
            เล่นมินิเกม XO สุดคลาสสิก พร้อมโหมดต่างๆ ให้เลือกท้าทาย
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Mode Selector */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl">
            {(["EASY", "MEDIUM", "IMPOSSIBLE", "2PLAYER"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  resetGame();
                }}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                  mode === m
                    ? "bg-white dark:bg-slate-700 text-rose-500 shadow-md"
                    : "text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {m === "EASY" ? "ง่าย (Easy)" 
                  : m === "MEDIUM" ? "ปานกลาง (Medium)" 
                  : m === "IMPOSSIBLE" ? "เป็นไปไม่ได้ (Impossible)" 
                  : "เล่น 2 คน (2-Player)"}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 shadow-2xl">
            <h2 className="mb-6 text-2xl font-black tracking-tighter text-slate-800 dark:text-white uppercase flex items-center gap-2">
              {mode === "2PLAYER" ? `Turn: Player ${currentPlayer}` : mode === "IMPOSSIBLE" ? "Impossible AI" : `${mode} AI`}
            </h2>
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-100 dark:bg-slate-800 p-3 shadow-inner">
              {board.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className="flex h-20 w-20 items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-3xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <span className={cell === "X" ? "text-blue-500" : cell === "O" ? "text-rose-500" : ""}>
                    {cell}
                  </span>
                </button>
              ))}
            </div>
            {result && (
              <div className="mt-6 animate-bounce text-xl font-bold text-slate-700 dark:text-slate-300 text-center">
                {result === "Draw"
                  ? "เสมอ!"
                  : mode === "2PLAYER" 
                    ? `ผู้เล่น ${result} ชนะ!`
                    : result === "X"
                      ? "คุณชนะ! (เก่งมาก!)"
                      : "AI ชนะ!"}
              </div>
            )}
            <button
              onClick={resetGame}
              className="mt-6 rounded-full bg-rose-500 hover:bg-rose-600 px-8 py-2 font-bold text-white transition-all shadow-lg"
            >
              เริ่มใหม่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
