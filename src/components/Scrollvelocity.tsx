"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { wrap } from "@motionone/utils";

interface ParallaxProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}

function ParallaxText({
  children,
  baseVelocity = 100,
  className,
}: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="m-0 flex flex-nowrap overflow-hidden leading-[0.85] whitespace-nowrap">
      <motion.div
        // 🛠️ แก้ไข 1: เปลี่ยน tracking-tighter เป็น tracking-wide (เว้นระยะตัวอักษรให้ห่างขึ้น)
        className={`flex flex-nowrap font-black tracking-wide whitespace-nowrap uppercase ${className}`}
        style={{ x }}
      >
        {/* 🛠️ แก้ไข 2: เพิ่ม mr-8 เป็น mr-24 (เว้นระยะห่างระหว่างชุดข้อความให้มากขึ้น) */}
        <span className="mr-24 block">{children}</span>
        <span className="mr-24 block">{children}</span>
        <span className="mr-24 block">{children}</span>
        <span className="mr-24 block">{children}</span>
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 blur-[120px] dark:bg-indigo-500/10" />

      <div className="relative z-10 flex flex-col gap-6">
        {" "}
        {/* เพิ่ม gap เป็น 6 ให้บรรทัดห่างกันหน่อย */}
        {/* บรรทัดที่ 1: สีน้ำเงินเข้ม */}
        <ParallaxText
          baseVelocity={-2}
          className="text-6xl text-indigo-900 md:text-8xl dark:text-indigo-100"
        >
          Kantharalak Technical College • KTLTC •
        </ParallaxText>
        {/* บรรทัดที่ 2: เส้นขอบสีม่วง */}
        <ParallaxText
          baseVelocity={2}
          className="text-stroke-violet text-6xl text-transparent md:text-8xl"
        >
          Welcome to KTLTC • Vocational Education •
        </ParallaxText>
        {/* บรรทัดที่ 3: ภาษาไทย */}
        {/* 🛠️ แก้ไข 3: เปลี่ยน baseVelocity จาก -3 เป็น 1.5 (เลขบวกคือวิ่งไปอีกทาง และลดเลขลงเพื่อให้วิ่งช้าลง อ่านทัน) */}
        <ParallaxText
          baseVelocity={1.5}
          className="py-2 text-5xl opacity-90 md:text-7xl"
        >
          <span className="bg-linear-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            วิทยาลัยเทคนิคกันทรลักษ์ • มุ่งมั่นพัฒนาวิชาชีพ • สู่ความเป็นเลิศ •
          </span>
        </ParallaxText>
      </div>

      <style jsx global>{`
        .text-stroke-violet {
          -webkit-text-stroke: 1.5px #8b5cf6;
        }
        .dark .text-stroke-violet {
          -webkit-text-stroke: 1.5px #a78bfa;
        }
      `}</style>
    </section>
  );
}
