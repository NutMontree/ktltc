"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface NewsGalleryProps {
  media: string[];
}

// Icons for Layout Toggle
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// Icons for Modal
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PrevIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function NewsGallery({ media }: NewsGalleryProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Handle keyboard navigation for modal
  useEffect(() => {
    if (selectedIndex === null) return;
    
    // Prevent background scrolling when modal is open
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft" && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
      if (e.key === "ArrowRight" && selectedIndex < media.length - 1) setSelectedIndex(selectedIndex + 1);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, media.length]);

  if (!media || media.length === 0) return null;

  const getGridLayout = () => {
    const len = media.length;
    if (len === 1) return "columns-1 max-w-3xl mx-auto gap-4 space-y-4";
    if (len === 2) return "columns-1 sm:columns-2 max-w-5xl mx-auto gap-4 space-y-4";
    if (len === 3) return "columns-1 sm:columns-2 md:columns-3 max-w-6xl mx-auto gap-4 space-y-4";
    return "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4";
  };

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              ประมวลภาพกิจกรรม <span className="text-slate-400 font-normal ml-2">({media.length})</span>
            </h3>
          </div>

          <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setLayout("grid")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                layout === "grid"
                  ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-label="Grid View"
            >
              <GridIcon /> แบบกริด
            </button>
            <button
              onClick={() => setLayout("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                layout === "list"
                  ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              aria-label="List View"
            >
              <ListIcon /> แนวตั้ง
            </button>
          </div>
        </div>

        <div
          className={
            layout === "grid"
              ? getGridLayout()
              : "flex flex-col gap-8 max-w-4xl mx-auto"
          }
        >
          {media.map((img, idx) => (
            <div
              key={`media-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className={`break-inside-avoid w-full flex justify-center items-start overflow-hidden rounded-xl group cursor-pointer ${
                layout === "list" ? "shadow-md bg-white dark:bg-zinc-900 p-2 border border-slate-100 dark:border-zinc-800" : ""
              }`}
            >
              {/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(img) ? (
                <video
                  src={img}
                  className="w-full h-auto rounded-xl transition-transform duration-500 group-hover:scale-105"
                  controls
                  playsInline
                />
              ) : (
                <Image
                  src={img}
                  alt={`Gallery Media ${idx + 1}`}
                  width={layout === "list" ? 1200 : 800}
                  height={layout === "list" ? 900 : 600}
                  priority={idx < 2} // โหลดรูป 2 รูปแรกทันที
                  className={`w-full h-auto rounded-xl transition-transform duration-500 ${
                    layout === "grid" ? "object-contain group-hover:scale-105" : "object-cover"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- Lightbox Modal --- */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // z-[9999] makes it appear above the navbar and everything else
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setSelectedIndex(null)} // Click background to close
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-lg z-50"
              title="ปิด (Esc)"
            >
              <CloseIcon />
            </button>

            {/* Previous Button */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex - 1);
                }}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-lg z-50"
                title="รูปก่อนหน้า (ลูกศรซ้าย)"
              >
                <PrevIcon />
              </button>
            )}

            {/* Next Button */}
            {selectedIndex < media.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex + 1);
                }}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all shadow-lg z-50"
                title="รูปถัดไป (ลูกศรขวา)"
              >
                <NextIcon />
              </button>
            )}

            {/* Media Container */}
            <div
              className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center p-4 md:p-12 select-none"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking the media itself
            >
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(media[selectedIndex]) ? (
                  <video
                    src={media[selectedIndex]}
                    className="max-w-full max-h-full rounded-2xl shadow-2xl"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <Image
                    src={media[selectedIndex]}
                    alt={`Gallery Full ${selectedIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1280px) 100vw, 1200px"
                  />
                )}
              </motion.div>
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-bold tracking-widest shadow-lg">
              {selectedIndex + 1} / {media.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
