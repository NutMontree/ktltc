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

const CARD_WIDTH = 360;
const CARD_HEIGHT = 480;
const GAP = 32;

function Card({ item, index, containerX, containerWidth }: { item: NewsItem, index: number, containerX: any, containerWidth: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Calculate the x position of this card relative to the viewport center
  // The card's base position in the container is index * (CARD_WIDTH + GAP)
  const basePosition = index * (CARD_WIDTH + GAP);
  
  // We use useTransform to map the container's X position to the image's parallax X
  const x = useTransform(containerX, (currentX: number) => {
    if (typeof window === 'undefined') return 0;
    // The screen center
    const screenCenter = window.innerWidth / 2;
    // The card's absolute center position on screen
    const cardCenter = currentX + basePosition + (CARD_WIDTH / 2);
    // Distance from screen center
    const distance = cardCenter - screenCenter;
    
    // To prevent the image from shifting outside the card, we must limit the x offset.
    // If scale is 1.4, the image width is 1.4 * 360 = 504px.
    // Extra width = 504 - 360 = 144px.
    // Max shift each side = 144 / 2 = 72px.
    // We map the distance (which is max ~window.innerWidth/2) to max 70px.
    const maxOffset = 70;
    const progress = distance / screenCenter; // ranges approx -1 to 1
    
    // Parallax effect: shift the image slightly in the opposite direction
    return -progress * maxOffset;
  });

  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop";

  return (
    <Link href={`/news/${item._id}`} draggable={false}>
      <motion.div 
        ref={cardRef}
        className="shrink-0 rounded-2xl overflow-hidden relative group cursor-grab active:cursor-grabbing border border-transparent hover:border-white/20"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
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
        
        {/* Very subtle gradient just for text legibility */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 p-6 w-full text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
          <h4 className="text-xl font-bold mb-1 tracking-tight line-clamp-2">{item.title}</h4>
          <p className="text-white/80 text-xs">
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

  // Use a motion value for dragging
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30, bounce: 0 });

  const originalWidth = newsData.length * (CARD_WIDTH + GAP);
  // Create 4 sets of data for infinite illusion
  const loopedData = [...newsData, ...newsData, ...newsData, ...newsData];

  useEffect(() => {
    setIsClient(true);
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
            paddingLeft: 'max(5vw, calc(50vw - 180px))', 
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
