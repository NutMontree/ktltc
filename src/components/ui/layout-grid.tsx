"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * layout-grid.tsx: ตารางเลย์เอาต์ที่สามารถกดเพื่อขยายภาพ (Expanding Grid)
 * 
 * หน้าที่: 
 * 1. แสดงรายการภาพในรูปแบบตาราง (Grid)
 * 2. เมื่อกดที่ภาพ ภาพจะขยายตัวออกมาตรงกลางหน้าจอ (Selected State) พร้อมแอนิเมชัน
 * 3. ใช้ Framer Motion `layoutId` เพื่อให้ภาพเคลื่อนที่จากตำแหน่งในตารางไปยังจุดกึ่งกลางได้อย่างราบรื่น
 * 4. มีฉากหลังสีดำจางๆ (Overlay) เมื่อเปิดภาพเพื่อเน้นจุดสนใจ
 */

type Card = {
  id: number;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  // จัดการการคลิกเพื่อเลือกภาพ
  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  // ปิดภาพเมื่อคลิกพื้นที่ว่างข้างนอก
  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-3  max-w-[1600px] mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden",
              selected?.id === card.id
                ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                  ? "z-40 bg-white rounded-xl h-full w-full"
                  : "bg-white rounded-xl h-full w-full",
            )}
            layoutId={`card-${card.id}`} // เชื่อมโยงแอนิเมชันข้าม State
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} />
          </motion.div>
        </div>
      ))}
      {/* ฉากหลังสีดำจางๆ (Overlay) */}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none",
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

/**
 * ImageComponent: ส่วนแสดงผลรูปภาพพร้อมแอนิเมชัน
 */
const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={card.thumbnail}
      height="500"
      width="500"
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200",
      )}
      alt="thumbnail"
    />
  );
};

/**
 * SelectedCard: ส่วนแสดงผลเนื้อหาเพิ่มเติมเมื่อภาพถูกขยาย
 */
const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-60">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-4 z-70"
      >
        {/* สามารถใส่เนื้อหาเพิ่มเติม เช่น คำอธิบายภาพ ได้ที่นี่ */}
      </motion.div>
    </div>
  );
};

