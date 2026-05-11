
"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

/**
 * meteors.tsx: เอฟเฟกต์ฝนดาวตก (Shooting Stars Animation)
 * 
 * หน้าที่: 
 * 1. สร้างลำแสงขนาดเล็กที่วิ่งพาดผ่านหน้าจอแบบสุ่มเวลา (Animation Delay)
 * 2. มีส่วนหาง (Tail) ที่จางลงด้วย Gradient
 * 3. ใช้ CSS Animation `meteor-effect` เพื่อประหยัดทรัพยากรเครื่อง
 * 4. จัดวางตำแหน่งแบบกระจายตัวตามความกว้างของ Container
 */

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {meteors.map((el, idx) => {
        const meteorCount = number || 20;
        // คำนวณตำแหน่งให้กระจายตัวทั่วพื้นที่
        const position = idx * (800 / meteorCount) - 400;

        return (
          <span
            key={"meteor" + idx}
            className={cn(
              "animate-meteor-effect absolute h-0.5 w-0.5 rotate-45 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
              // ส่วนหางของดาวตก
              "before:absolute before:top-1/2 before:h-px before:w-[50px] before:-translate-y-[50%] before:transform before:bg-linear-to-r before:from-[#64748b] before:to-transparent before:content-['']",
              className,
            )}
            style={{
              top: "-40px", // เริ่มต้นเหนือขอบ Container
              left: position + "px",
              animationDelay: Math.random() * 5 + "s", // สุ่มเวลาเริ่ม
              animationDuration: Math.floor(Math.random() * (10 - 5) + 5) + "s", // สุ่มความเร็ว
            }}
          ></span>
        );
      })}
    </motion.div>
  );
};

