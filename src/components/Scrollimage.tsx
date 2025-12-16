"use client";

import React from "react";
import { Carousel, ConfigProvider } from "antd";
import { Image } from "@heroui/image";
import { motion } from "framer-motion";

// 1. แยกข้อมูลรูปภาพออกมาเพื่อให้จัดการง่าย
const slides = [
  "/images/ปก/19.webp",
  "/images/ปก/17.webp",
  "/images/ปก/18.webp",
  "/images/ปก/8.webp",
  "/images/ปก/1.webp",
  "/images/ปก/2.webp",
];

const Scrollimage: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            // ปรับแต่งสีของจุด (Dots) ให้ดูทันสมัย
            dotActiveWidth: 30,
            dotWidth: 8,
            dotHeight: 8,
          },
        },
      }}
    >
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative w-full overflow-hidden" // พื้นหลังสีเข้มกันภาพโหลดไม่ทัน
      >
        <Carousel
          arrows
          infinite
          autoplay
          autoplaySpeed={4000} // ช้าลงนิดนึงเพื่อให้คนดูภาพทัน
          effect="fade" // *สำคัญ* เปลี่ยนเป็น Fade เพื่อความหรูหรา
          className="group" // ใช้ group เพื่อทำ hover effect ที่ลูกศรได้ (ถ้าต้องการ Custom CSS เพิ่ม)
        >
          {slides.map((src, index) => (
            <div key={index} className="">
              {/* Overlay Gradient: ช่วยให้ภาพดูมีมิติ และทำให้ Text/Arrow ชัดขึ้น */}
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/40 via-transparent to-black/10" />

              <Image
                removeWrapper
                src={src}
                alt={`Slide ${index + 1}`}
                classNames={{
                  img: "h-full w-full object-cover object-center", // สำคัญ: ทำให้ภาพเต็มพื้นที่โดยไม่เบี้ยว
                }}
                radius="none" // ภาพ Banner ไม่ควรมีขอบมน
              />
            </div>
          ))}
        </Carousel>
      </motion.section>
    </ConfigProvider>
  );
};

export default Scrollimage;
