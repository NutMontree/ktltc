"use client";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { encode } from "qss";
import React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * link-preview.tsx: คอมโพเนนต์สำหรับแสดงตัวอย่างภาพหน้าเว็บ (Screenshot) เมื่อเอาเมาส์ไปชี้ที่ลิงก์
 * 
 * หน้าที่: 
 * 1. ใช้บริการ Microlink API เพื่อดึงภาพ Screenshot ของ URL ที่กำหนดแบบ Real-time
 * 2. แสดงผลด้วย HoverCard (จาก Radix UI) พร้อมแอนิเมชันการเด้ง (Spring)
 * 3. มีแอนิเมชันการขยับตามเมาส์ในแนวแกน X เพื่อให้ดูมีมิติ
 * 4. รองรับทั้งภาพ Static (กำหนดเอง) และภาพ Dynamic (จาก URL)
 */

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
  target?: React.HTMLAttributeAnchorTarget;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  let src;
  
  // จัดเตรียม URL สำหรับดึงภาพ Screenshot
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });
    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }

  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  // คำนวณตำแหน่งภาพตัวอย่างให้ขยับตามเมาส์เล็กน้อย
  const handleMouseMove = (event: any) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <>
      {/* ซ่อนรูปภาพเพื่อ Preload ข้อมูล */}
      {isMounted ? (
        <div className="hidden">
          <img src={src} width={width} height={height} alt="hidden image" />
        </div>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn("text-black dark:text-white", className)}
          href={url}
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content
          className="origin-(--radix-hover-card-content-transform-origin)"
          side="top"
          align="center"
          sideOffset={10}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="rounded-xl shadow-xl"
                style={{
                  x: translateX, // ขยับตามเมาส์
                }}
              >
                <a
                  href={url}
                  className="block rounded-xl border-2 border-transparent bg-white p-1 shadow hover:border-neutral-200 dark:hover:border-neutral-800"
                  style={{ fontSize: 0 }}
                >
                  <img
                    src={isStatic ? imageSrc : src}
                    width={width}
                    height={height}
                    className="rounded-lg"
                    alt="preview image"
                  />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};

