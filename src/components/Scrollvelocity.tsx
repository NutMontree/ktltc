"use client";

import { useRef, useEffect } from "react";
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
  children: string;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 50 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 500,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 2000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef<number>(1);
  const isMobile = useRef(false);

  // ตรวจสอบขนาดหน้าจอว่าเป็นมือถือหรือไม่
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.innerWidth <= 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 3000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div
        className="scroller flex flex-nowrap uppercase font-black text-6xl md:text-8xl"
        style={{ x }}
      >
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
        <span className="block mr-8">{children} </span>
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  text1,
  text2,
}: {
  text1?: string;
  text2?: string;
}) {
  return (
    <section className="py-10 overflow-hidden">
      <div className="pb-4">
        <ParallaxText baseVelocity={-3}>
          {text1 || "Kantharalak Technical College KTLTC"}
        </ParallaxText>
      </div>
      <div className="pt-4 text-orange-500">
        <ParallaxText baseVelocity={3}>
          {text2 || "Welcome to KTLTC Official Website"}
        </ParallaxText>
      </div>
    </section>
  );
}
