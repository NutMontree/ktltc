"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * placeholders-and-vanish-input.tsx: ช่องกรอกข้อมูลที่มีเอฟเฟกต์ "ข้อความสลายตัว" (Particle Vanish)
 * 
 * หน้าที่: 
 * 1. แสดง Placeholder แบบสลับคำอัตโนมัติ (Animated Placeholders)
 * 2. เมื่อกดตกลง (Submit) ข้อความในช่องจะถูกแปลงเป็นพิกเซลบน Canvas และสลายตัวเป็นอนุภาค (Particles)
 * 3. ใช้ Canvas API เพื่อดึงข้อมูลพิกเซล (getImageData) และ Framer Motion เพื่อจัดการแอนิเมชัน Placeholder
 * 4. จัดการเรื่อง Visibility เพื่อหยุดแอนิเมชันเมื่อผู้ใช้ไม่ได้อยู่ที่หน้าจอ (Tab Inactive)
 */

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // เริ่มต้นแอนิเมชันสลับ Placeholder
  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  // หยุดหรือเริ่มแอนิเมชันตามสถานะของหน้าต่าง (Tab Focus)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startAnimation, handleVisibilityChange]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  /**
   * draw: วาดข้อความลงบน Canvas และวิเคราะห์พิกเซลเพื่อสร้างเป็นข้อมูลอนุภาค
   */
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    // วนลูปเช็คพิกเซลที่มีสี (ไม่ใช่โปร่งใส) เพื่อเก็บตำแหน่งไปทำอนุภาค
    for (let t = 0; t < 800; t++) {
      const i = 4 * t * 800; 
      for (let n = 0; n < 800; n++) {
        const e = i + 4 * n; 
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  /**
   * animate: เล่นแอนิเมชันให้อนุภาคกระจายตัวและหายไป
   */
  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            // ใส่ความสุ่มเพื่อให้กระจายตัวดูเป็นธรรมชาติ
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  /**
   * vanishAndSubmit: เริ่มกระบวนการสลายตัวและส่งข้อมูล
   */
  const vanishAndSubmit = useCallback(() => {
    setAnimating(true);
    draw();

    const val = inputRef.current?.value || "";
    if (val && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0,
      );
      animate(maxX);
    }
  }, [draw]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating) {
      vanishAndSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      className={cn(
        "relative mx-auto h-12 w-full max-w-xl overflow-hidden rounded-full bg-white shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 dark:bg-zinc-800",
        value && "bg-gray-50",
      )}
      onSubmit={handleSubmit}
    >
      {/* Canvas สำหรับเล่นแอนิเมชันอนุภาคสลายตัว */}
      <canvas
        className={cn(
          "pointer-events-none absolute left-2 top-[20%] origin-top-left scale-50 transform pr-20 text-base invert filter dark:invert-0 sm:left-8",
          !animating ? "opacity-0" : "opacity-100",
        )}
        ref={canvasRef}
      />
      
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        className={cn(
          "relative z-50 h-full w-full rounded-full border-none bg-transparent pl-4 pr-20 text-sm text-black focus:outline-none focus:ring-0 dark:text-white sm:pl-10 sm:text-base",
          animating && "text-transparent dark:text-transparent",
        )}
      />

      {/* ปุ่มส่งข้อมูลที่มีแอนิเมชันไอคอน */}
      <button
        disabled={!value}
        type="submit"
        className="absolute right-2 top-1/2 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black transition duration-200 disabled:bg-gray-100 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-gray-300"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      {/* ส่วนแสดง Placeholder แบบสลับคำอัตโนมัติ */}
      <div className="pointer-events-none absolute inset-0 flex items-center rounded-full">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className="w-[calc(100%-2rem)] truncate pl-4 text-left text-sm font-normal text-neutral-500 dark:text-zinc-500 sm:pl-12 sm:text-base"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

