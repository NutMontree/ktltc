"use client";
import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

/**
 * cover.tsx: คอมโพเนนต์สำหรับสร้างเอฟเฟกต์ "Cover" ที่มีแอนิเมชันซ้อนทับ
 * 
 * หน้าที่: 
 * 1. แสดงเอฟเฟกต์แสงวิ่ง (Beams) และประกายไฟ (Sparkles) เมื่อมีการ Hover หรือตามเงื่อนไข
 * 2. จัดการตำแหน่งของลำแสงให้พอดีกับความกว้างและความสูงของ Container
 * 3. มีแอนิเมชันการสั่น (Shake) และการขยาย (Scale) ของตัวอักษรหรือเนื้อหาภายใน
 */

export const Cover = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [hovered] = useState(false); // สถานะการ Hover (ปัจจุบันตั้งเป็น false เป็นค่าเริ่มต้น)

  const ref = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState<number[]>([]);

  // คำนวณตำแหน่งลำแสงตามขนาดจริงของ Component
  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current?.clientWidth ?? 0);

      const height = ref.current?.clientHeight ?? 0;
      const numberOfBeams = Math.floor(height / 10); // จำนวนลำแสงสัมพันธ์กับความสูง
      const positions = Array.from(
        { length: numberOfBeams },
        (_, i) => (i + 1) * (height / (numberOfBeams + 1)),
      );
      setBeamPositions(positions);
    }
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* เอฟเฟกต์ประกายไฟ (Sparkles) เมื่อมีการ Hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 overflow-hidden"
          >
            <motion.div
              animate={{ translateX: ["-50%", "0%"] }}
              transition={{
                translateX: {
                  duration: 10,
                  ease: "linear",
                  repeat: Infinity,
                },
              }}
              className="flex h-full w-[200%]"
            >
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={500}
                className="h-full w-full"
                particleColor="#FFFFFF"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* เรนเดอร์ลำแสง (Beams) ตามตำแหน่งที่คำนวณไว้ */}
      {beamPositions.map((position, index) => (
        <Beam
          key={index}
          hovered={hovered}
          duration={Math.random() * 2 + 1}
          delay={Math.random() * 2 + 1}
          width={containerWidth}
          style={{
            top: `${position}px`,
          }}
        />
      ))}

      {/* ส่วนเนื้อหาหลักที่มีแอนิเมชันขยับ */}
      <motion.span
        key={String(hovered)}
        animate={{
          scale: hovered ? 0.8 : 1,
          x: hovered ? [0, -30, 30, -30, 30, 0] : 0,
          y: hovered ? [0, 30, -30, 30, -30, 0] : 0,
        }}
        transition={{
          duration: 0.2,
          x: { duration: 0.2, repeat: Infinity },
          y: { duration: 0.2, repeat: Infinity },
          scale: { duration: 0.2 },
        }}
        className={cn(
          "relative z-20 inline-block text-neutral-900 transition duration-200 group-hover/cover:text-white dark:text-white",
          className,
        )}
      >
        {children}
      </motion.span>

      {/* ไอคอนประดับตามมุม (ถ้ามี) */}
      <CircleIcon className="absolute -top-0.5 -right-0.5" />
      <CircleIcon className="absolute -right-0.5 -bottom-0.5" delay={0.4} />
      <CircleIcon className="absolute -top-0.5 -left-0.5" delay={0.8} />
      <CircleIcon className="absolute -bottom-0.5 -left-0.5" delay={1.6} />
    </div>
  );
};

/**
 * Beam: ส่วนประกอบของเส้นแสงที่วิ่งผ่านพื้นหลัง
 */
export const Beam = ({
  className,
  delay,
  duration,
  hovered,
  width = 600,
  ...svgProps
}: {
  className?: string;
  delay?: number;
  duration?: number;
  hovered?: boolean;
  width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
  const id = useId();

  return (
    <motion.svg
      width={width ?? "600"}
      height="1"
      viewBox={`0 0 ${width ?? "600"} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute inset-x-0 w-full", className)}
      {...svgProps}
    >
      <motion.path
        d={`M0 0.5H${width ?? "600"}`}
        stroke={`url(#svgGradient-${id})`}
      />

      <defs>
        <motion.linearGradient
          id={`svgGradient-${id}`}
          key={String(hovered)}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: hovered ? "-10%" : "-5%",
          }}
          animate={{
            x1: "110%",
            x2: hovered ? "100%" : "105%",
          }}
          transition={{
            duration: hovered ? 0.5 : (duration ?? 2),
            ease: "linear",
            repeat: Infinity,
            delay: hovered ? Math.random() * (1 - 0.2) + 0.2 : 0,
            repeatDelay: hovered ? Math.random() * (2 - 1) + 1 : (delay ?? 1),
          }}
        >
          <stop stopColor="#2EB9DF" stopOpacity="0" />
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </motion.svg>
  );
};

export const CircleIcon = ({
  className,
}: {
  className?: string;
  delay?: number;
}) => {
  return <div className={cn(``, className)}></div>;
};

