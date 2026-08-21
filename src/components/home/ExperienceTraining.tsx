"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useAnimationFrame } from "framer-motion";
import Link from "next/link";

interface NewsItem {
  _id: string;
  title: string;
  images?: string[];
  createdAt: string;
}

const CARD_WIDTH_DESKTOP = 360;
const CARD_HEIGHT_DESKTOP = 480;
const CARD_WIDTH_MOBILE = 280;
const CARD_HEIGHT_MOBILE = 380;
const GAP = 32;

function Card({ item, index, containerX, containerWidth }: { item: NewsItem; index: number; containerX: any, containerWidth: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  const cardHeight = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;

  const x = useTransform(containerX, () => {
    if (!cardRef.current || containerWidth === 0) return 0;
    
    // Get the card's current absolute position relative to the viewport
    const rect = cardRef.current.getBoundingClientRect();
    const cardCenter = rect.left + (rect.width / 2);
    const screenCenter = window.innerWidth / 2;
    
    // Distance from screen center
    const distance = cardCenter - screenCenter;
    
    // Max shift each side
    const maxOffset = isMobile ? 50 : 70;
    const progress = distance / screenCenter; 
    
    // Parallax effect
    return -progress * maxOffset;
  });

  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

  return (
    <Link href={`/news/${item._id}`} draggable={false}>
      <motion.div 
        ref={cardRef}
        className="shrink-0 rounded-2xl overflow-hidden relative group cursor-grab active:cursor-grabbing border border-transparent hover:border-white/20"
        style={{ width: cardWidth, height: cardHeight }}
        whileHover={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {/* Parallax Image */}
          <motion.img 
            src={imageUrl} 
            style={{ x, scale: 1.4 }}
            className="absolute inset-0 w-full h-full object-cover origin-center brightness-90 group-hover:brightness-100 transition-all duration-500"
            alt={item.title}
            draggable={false}
            loading="lazy"
          />
        </div>
        
        {/* Gradient for text legibility (Always visible on mobile, visible on hover on desktop) */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none opacity-100" />
        
        {/* Text content (Always visible on mobile, slides up on desktop) */}
        <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full text-white transform translate-y-0 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 pointer-events-none opacity-100">
          <h4 className="text-lg md:text-xl font-bold mb-1 tracking-tight line-clamp-2 md:line-clamp-3">{item.title}</h4>
          <p className="text-white/80 text-xs mt-2">
            {new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function ExperienceTraining({ newsData = [] }: { newsData?: NewsItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Use a motion value for dragging
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30, bounce: 0 });

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
  const originalWidth = newsData.length * (cardWidth + GAP);
  // Create 4 sets of data for infinite illusion
  const loopedData = [...newsData, ...newsData, ...newsData, ...newsData];

  useEffect(() => {
    if (!isClient) return;
    // Start at the second set to allow dragging left (backwards) immediately
    if (originalWidth > 0) {
      x.set(-originalWidth);
    }
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.scrollWidth);
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [newsData, originalWidth, x]);

  useAnimationFrame(() => {
    if (isDragging.current || originalWidth === 0) return;
    
    let currentX = x.get();
    // Auto-scroll speed (adjust the number to change speed, e.g. 0.5 or 1)
    currentX -= 0.5;
    
    // Seamless wrapping logic
    // If we scrolled past the second set, jump back to the start of the second set
    if (currentX <= -originalWidth * 2) {
      x.set(currentX + originalWidth);
    } 
    // If we dragged backwards past the first set, jump forward
    else if (currentX >= 0) {
      x.set(currentX - originalWidth);
    } else {
      x.set(currentX);
    }
  });

  if (!newsData || newsData.length === 0) {
    return null; // Don't show if no news
  }

  return (
    <div className="relative z-10 overflow-hidden bg-transparent w-full">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-200 dark:border-slate-800 w-full"
        >
          {/* ส่วนข้อความ (ชิดซ้ายสุด) */}
          <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px] md:text-xs dark:text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Experience & Training
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-tight">
              นักศึกษาออก{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                ฝึกประสบการณ์
              </span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg dark:text-slate-400 font-medium">
              ข่าวสารการฝึกงาน การนิเทศ และความร่วมมือกับสถานประกอบการ
            </p>
          </div>

          {/* ส่วนปุ่ม (ชิดขวาสุด) */}
          <Link
            href="/news?category=Internship"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 group dark:shadow-none dark:bg-emerald-500 whitespace-nowrap shrink-0"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span>ดูทั้งหมด</span>
          </Link>
        </motion.div>
      </div>

      {/* The Draggable & Auto-Scrolling Carousel */}
      <div ref={carouselRef} className="relative w-full overflow-hidden pb-10 pt-4" style={{ cursor: 'grab' }}>
        <motion.div 
          ref={containerRef}
          className="flex items-center w-max"
          style={{ 
            x,
            gap: GAP,
            paddingLeft: isMobile ? 'max(16px, 5vw)' : 'max(5vw, calc(50vw - 180px))', 
            // We remove right padding because infinite loop needs continuous gap
          }}
          drag="x"
          // We remove dragConstraints so it can be dragged infinitely in either direction
          // (wrapping logic will handle bounds)
          dragElastic={0}
          onPointerDown={() => { hasDragged.current = false; }}
          onDragStart={() => { isDragging.current = true; hasDragged.current = true; }}
          onDragEnd={() => { isDragging.current = false; }}
          onClickCapture={(e) => {
            if (hasDragged.current) {
              e.stopPropagation();
              e.preventDefault();
            }
          }}
          // dragTransition doesn't work well with infinite loop wrapping, so we keep it default
        >
          {isClient && loopedData.map((item, idx) => (
            <Card 
              key={`${item._id}-${idx}`} 
              item={item} 
              index={idx} 
              containerX={x} // using x for instant parallax response without spring delay during auto-scroll
              containerWidth={containerWidth}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
