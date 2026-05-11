"use client";
import React, { useEffect, useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

/**
 * container-scroll-animation.tsx: แอนิเมชันการเอียงและยืดขยายตามการ Scroll (Scroll-linked 3D Animation)
 * 
 * หน้าที่: 
 * 1. ContainerScroll: ส่วนควบคุมหลักที่ใช้ `useScroll` ตรวจจับความคืบหน้าการเลื่อนหน้าจอภายในขอบเขตของมัน
 * 2. Header: ส่วนหัวข้อที่ขยับขึ้นลง (Translate) ตามการเลื่อน
 * 3. Card: ส่วนเนื้อหาหลักที่หมุน (RotateX) จากระนาบเอียงเป็นแนวตั้งตรง และขยายขนาด (Scale) เมื่อเลื่อนลงมา
 * 4. รองรับการปรับขนาดแอนิเมชันให้เหมาะสมกับหน้าจอ Mobile และ Desktop
 */

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<any>(null);
  
  // ตรวจจับ Scroll Progress ของ Container นี้
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  // แปลงค่า Scroll Progress (0 ถึง 1) เป็นค่าแอนิเมชัน (องศา, ขนาด, ตำแหน่ง)
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-240 sm:h-[4 0rem] md:h-280 flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px", // กำหนดความลึกของมิติ 3D
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

/**
 * Header: ส่วนหัวเรื่องที่มีการเคลื่อนที่ตามแรง Scroll
 */
export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-[1600px] mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

/**
 * Card: ส่วนการ์ดเนื้อหาที่หมุนและขยายตามแรง Scroll
 */
export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate, // การหมุนในระนาบ X (เอียง)
        scale,           // การย่อ/ขยาย
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-120 md:h-160 w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 ">
        {children}
      </div>
    </motion.div>
  );
};

