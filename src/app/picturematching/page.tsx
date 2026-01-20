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
    <div className="flex min-w-[360px] flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
      <h2 className="mb-2 text-2xl font-black tracking-widest text-white uppercase">
        Memory Match
      </h2>

      <div className="mb-6 flex gap-8 font-bold text-slate-400">
        <span>
          Moves: <b className="text-blue-400">{moves}</b>
        </span>
        {isWon && (
          <span className="flex items-center gap-1 text-yellow-400">
            <TrophyOutlined /> YOU WON!
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="h-20 w-16"
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
                  backgroundColor: "#2563eb",
                  borderRadius: "0.75rem",
                  border: "2px solid #3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              >
                <div className="h-6 w-6 rounded-full border-2 border-blue-300 opacity-30" />
              </div>

              {/* หน้าหน้าไพ่ (Front) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)", // กลับด้านรอไว้
                  backgroundColor: card.isMatched ? "#14532d" : "#ffffff",
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
              >
                {card.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <button
        onClick={initializeGame}
        className="mt-8 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95"
      >
        <ReloadOutlined /> RESTART GAME
      </button>
    </div>
  );
};

export default MemoryGame;
