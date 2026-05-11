"use client";

import { cn } from "@/lib/utils";
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

/**
 * 3d-card.tsx: คอมโพเนนต์สำหรับสร้างเอฟเฟกต์การ์ด 3 มิติ (Parallax Card)
 * 
 * หน้าที่: 
 * 1. สร้างมิติความลึก (Depth) เมื่อผู้ใช้เลื่อนเมาส์ผ่านการ์ด
 * 2. จัดการสถานะ Mouse Enter/Leave เพื่อควบคุมแอนิเมชัน
 * 3. ใช้ Context API เพื่อแชร์สถานะเมาส์ไปยังคอมโพเนนต์ลูก (CardItem)
 */

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

/**
 * CardContainer: ส่วนหุ้มภายนอกที่จัดการ Perspective และการหมุน (Rotation)
 */
export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  // คำนวณมุมหมุนตามตำแหน่งเมาส์
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseEntered(true);
    if (!containerRef.current) return;
  };

  // คืนค่าตำแหน่งการ์ดเมื่อเมาส์ออก
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn(" items-center justify-center", containerClassName)}
        style={{
          perspective: "1000px", // กำหนดมิติความลึก
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center relative transition-all duration-200 ease-linear",
            className,
          )}
          style={{
            transformStyle: "preserve-3d", // รักษาความเป็น 3 มิติให้คอมโพเนนต์ลูก
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

/**
 * CardBody: ส่วนเนื้อหาภายในการ์ด
 */
export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("  ", className)}>{children}</div>;
};

/**
 * CardItem: ส่วนประกอบภายในการ์ดที่สามารถขยับแยกชิ้นได้ (Floating effect)
 */
export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    handleAnimations();
  }, [isMouseEntered]); // คอยตรวจจับเมื่อเมาส์เข้า/ออก

  const handleAnimations = () => {
    if (!ref.current) return;
    if (isMouseEntered) {
      // ขยับชิ้นส่วนออกมาตามค่า Translate ที่กำหนด
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      // กลับสู่ตำแหน่งเดิม
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  };

  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * useMouseEnter: Hook สำหรับดึงสถานะเมาส์จาก CardContainer
 */
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};

