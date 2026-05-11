"use client";
import { Image } from "@heroui/image";
import { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

/**
 * animated-tooltip.tsx: คอมโพเนนต์ Tooltip (คำอธิบาย) แบบมีแอนิเมชันเคลื่อนตามเมาส์
 * 
 * หน้าที่: 
 * 1. แสดงชื่อและตำแหน่งเมื่อผู้ใช้เอาเมาส์ไปวางบนรูปภาพ
 * 2. มีแอนิเมชันการขยับ (Tilt) และการเคลื่อนที่ (Follow mouse) ตามตำแหน่งเมาส์
 * 3. ใช้ Framer Motion สำหรับคำนวณฟิสิกส์การเคลื่อนที่ (Spring physics)
 */

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // ตั้งค่าความเด้งของแอนิเมชัน
  const springConfig = { stiffness: 100, damping: 5 };
  
  // สร้างตัวแปรเก็บค่าตำแหน่งเมาส์ในแนวแกน X
  const x = useMotionValue(0); 

  // คำนวณค่าการหมุน (Rotate) ตามตำแหน่ง X ของเมาส์
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );

  // คำนวณค่าการเลื่อน (Translate) ตามตำแหน่ง X ของเมาส์
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  /**
   * handleMouseMove: ตรวจจับตำแหน่งเมาส์บนรูปภาพและอัปเดตค่า x
   */
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth); 
  };

  return (
    <>
      {items.map((item) => (
        <div
          className="group relative grid gap-4 px-4 py-4"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 z-50 flex translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
              >
                {/* เอฟเฟกต์เส้นใต้เรืองแสง */}
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-linear-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-linear-to-r from-transparent via-sky-500 to-transparent" />
                
                <div className="relative z-30 text-base font-bold text-white">
                  {item.name}
                </div>
                <div className="text-sm text-white">{item.designation}</div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Image
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative m-0! h-32 w-32 rounded-full border-2 border-white object-cover object-top p-0! transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
};

