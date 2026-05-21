"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ScrollUp() {
  const [isVisible, setIsVisible] = useState(false);

  // ตรวจจับการเลื่อนหน้าจอ
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // ฟังก์ชันเลื่อนขึ้นบนสุด
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-999">
      <AnimatePresence>
        {isVisible && (
          <motion.button
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{
              scale: 1.1,
              y: -3,
              boxShadow: "0px 6px 18px rgba(217, 119, 6, 0.5)", // เงาสีทองที่เล็กลงตามสัดส่วน
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="group relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/20 bg-linear-to-tr from-yellow-600 via-amber-500 to-yellow-400 text-white shadow-lg backdrop-blur-sm"
            aria-label="Scroll to top"
          >
            {/* วงแหวน Pulse Effect ตอน Hover */}
            <span className="absolute inset-0 -z-10 rounded-full bg-amber-400 opacity-0 transition-opacity duration-500 group-hover:animate-ping group-hover:opacity-30" />
 
            {/* ไอคอนลูกศร (SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:-translate-y-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
