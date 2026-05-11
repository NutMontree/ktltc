"use client";
import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * comet-card.tsx: การ์ดที่มีเอฟเฟกต์ 3D เอียงตามเมาส์และแสงสะท้อน (Glare Effect)
 * 
 * หน้าที่: 
 * 1. ตรวจจับตำแหน่งเมาส์บนการ์ดเพื่อคำนวณมุมการเอียง (Tilt) และการขยับ (Translate)
 * 2. สร้างแสงสะท้อน (Glare) ที่เคลื่อนที่ตามเมาส์โดยใช้ radial-gradient
 * 3. ใช้ Framer Motion `useSpring` เพื่อให้การเอียงมีความนุ่มนวลและเป็นธรรมชาติ
 * 4. ใช้ Perspective เพื่อให้เกิดมิติความลึกแบบ 3D
 */

export const CometCard = ({
  rotateDepth = 17.5,
  translateDepth = 20,
  className,
  children,
}: {
  rotateDepth?: number;
  translateDepth?: number;
  className?: string;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // เก็บค่าตำแหน่งเมาส์เป็น Motion Value
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // ใช้ Spring เพื่อลดการกระตุกของแอนิเมชัน
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // แปลงตำแหน่งเมาส์เป็นมุมการหมุนในแกน X และ Y
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`],
  );

  // แปลงตำแหน่งเมาส์เป็นการขยับตำแหน่งเล็กน้อย (Parallax)
  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );

  // คำนวณตำแหน่งของแสงสะท้อน (Glare)
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`;

  // ฟังก์ชันจัดการเมื่อเมาส์เคลื่อนที่บนการ์ด
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  // คืนค่าตำแหน่งเดิมเมื่อเมาส์ออกจากการ์ด
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={cn("perspective-distant transform-3d", className)}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{
          scale: 1.05, // ขยายเล็กน้อยเมื่อ Hover
          z: 50, // ดันขึ้นมาในแนวแกน Z
          transition: { duration: 0.2 },
        }}
        className="relative rounded-2xl"
      >
        {children}
        
        {/* เลเยอร์แสงสะท้อน (Glare Layer) */}
        <motion.div
          className="h-full w-full rounded-2xl mix-blend-overlay"
          style={{
            background: glareBackground,
            opacity: 0.6,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
};

