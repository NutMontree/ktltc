"use client";
import { useState, useEffect } from "react";

export default function TicTacToeAI() {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

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
    let bestScore = -Infinity;
    let move = -1;
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
    if (move !== -1) {
      const nextBoard = [...currentBoard];
      nextBoard[move] = "O";
      setBoard(nextBoard);
      setIsPlayerTurn(true);
    }
  };

  const handleClick = (i: number) => {
    if (board[i] || checkWinner(board) || !isPlayerTurn) return;
    const nextBoard = [...board];
    nextBoard[i] = "X";
    setBoard(nextBoard);
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && !checkWinner(board)) {
      const timer = setTimeout(() => makeAIMove(board), 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn]);

  const result = checkWinner(board);

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl">
      <h2 className="mb-6 text-2xl font-black tracking-tighter text-slate-800 uppercase">
        Impossible AI Mode
      </h2>
      <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-100 p-3 shadow-inner">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="flex h-20 w-20 items-center justify-center rounded-xl bg-white text-3xl font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <span className={cell === "X" ? "text-blue-600" : "text-red-500"}>
              {cell}
            </span>
          </button>
        ))}
      </div>
      {result && (
        <div className="mt-6 animate-bounce text-xl font-bold text-slate-700">
          {result === "Draw"
            ? "เสมอ!"
            : result === "X"
              ? "คุณชนะ! (เป็นไปได้ไง?)"
              : "AI ชนะ!"}
        </div>
      )}
      <button
        onClick={() => {
          setBoard(Array(9).fill(null));
          setIsPlayerTurn(true);
        }}
        className="mt-6 rounded-full bg-slate-800 px-8 py-2 font-bold text-white transition-all hover:bg-slate-700"
      >
        RESET
      </button>
    </div>
  );
}
