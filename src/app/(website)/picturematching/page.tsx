"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ReloadOutlined, TrophyOutlined } from "@ant-design/icons";

const CARD_ICONS = ["🍎", "🍌", "🍇", "🍓", "🍒", "🥝", "🍍", "🥥"];

type Card = {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const MemoryGame = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = useCallback(() => {
    const duplicatedIcons = [...CARD_ICONS, ...CARD_ICONS];
    const shuffledIcons = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        content: icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledIcons);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched)
      return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlippedCards;

      if (cards[firstId].content === cards[secondId].content) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card,
            ),
          );
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card,
            ),
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsWon(true);
    }
  }, [cards]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-[1600px] w-full mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent uppercase">
            จับคู่ภาพ (Memory)
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg flex items-center justify-center gap-4">
            ทดสอบความจำของคุณด้วยการจับคู่ภาพที่เหมือนกัน
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex min-w-[360px] flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl">
            <h2 className="mb-2 text-2xl font-black tracking-widest text-slate-800 dark:text-white uppercase">
              Memory Match
            </h2>

            <div className="mb-6 flex gap-8 font-bold text-slate-500 dark:text-slate-400">
              <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1 rounded-full">
                Moves: <b className="text-blue-500 dark:text-blue-400 ml-2">{moves}</b>
              </span>
              {isWon && (
                <span className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 animate-pulse">
                  <TrophyOutlined /> YOU WON!
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="h-20 w-16 cursor-pointer"
                  style={{ perspective: "1000px" }} // ทำให้ดูมีมิติ
                  onClick={() => handleCardClick(card.id)}
                >
                  <motion.div
                    animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    transition={{
                      duration: 0.6,
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      transformStyle: "preserve-3d", // สำคัญมากสำหรับการทำ 3D flip
                    }}
                  >
                    {/* หน้าหลังไพ่ (Back) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden", // ซ่อนด้านหลังเมื่อพลิก
                        backgroundColor: "#6366f1", // indigo-500
                        borderRadius: "0.75rem",
                        border: "2px solid #818cf8", // indigo-400
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      className="hover:bg-indigo-400 transition-colors"
                    >
                      <div className="h-6 w-6 rounded-full border-2 border-indigo-200 opacity-50" />
                    </div>

                    {/* หน้าหน้าไพ่ (Front) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)", // กลับด้านรอไว้
                        backgroundColor: card.isMatched ? "#dcfce7" : "#ffffff", // green-100 or white
                        borderRadius: "0.75rem",
                        border: card.isMatched
                          ? "2px solid #22c55e"
                          : "2px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.875rem",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      className="dark:text-slate-800"
                    >
                      {card.content}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            <button
              onClick={initializeGame}
              className="mt-8 flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-500 active:scale-95"
            >
              <ReloadOutlined /> RESTART GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
