"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

/**
 * background-gradient.tsx: สร้างขอบเรืองแสงแบบสีรุ้งเคลื่อนที่ได้ (Animated Gradient Border)
 * 
 * หน้าที่: 
 * 1. ใช้เลเยอร์ซ้อนกัน (Layered Divs) เพื่อสร้างขอบที่มีความฟุ้ง (Blur) และสีที่สดใส
 * 2. แอนิเมชันการเปลี่ยนตำแหน่งพื้นหลัง (Background Position) เพื่อให้สีดูเหมือนมีการเคลื่อนไหว
 * 3. มีเอฟเฟกต์เพิ่มความสว่าง (Opacity) เมื่อเอาเมาส์ไปวาง (Hover)
 * 4. รองรับการเปิด/ปิดแอนิเมชันผ่าน Prop `animate`
 */

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  // กำหนดรูปแบบการเคลื่อนที่ของสีพื้นหลัง
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div className={cn("relative p-1 group ", containerClassName)}>
      {/* เลเยอร์ล่าง: สำหรับเอฟเฟกต์ฟุ้งเรืองแสง (Blur Glow) */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-1 opacity-60 group-hover:opacity-100 blur-xl transition duration-500 will-change-transform",
          " bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
        )}
      />
      
      {/* เลเยอร์บน: สำหรับขอบสีที่คมชัด */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-3xl z-1 will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"
        )}
      />

      {/* ส่วนเนื้อหาหลักภายใน */}
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

