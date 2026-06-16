"use client";

import { useState } from "react";
import Image from "next/image";

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

export default function NewsGallery({ media }: NewsGalleryProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  if (!media || media.length === 0) return null;

  return (
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
            ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
            : "flex flex-col gap-8 max-w-4xl mx-auto"
        }
      >
        {media.map((img, idx) => (
          <div
            key={`media-${idx}`}
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
                unoptimized
                className={`w-full h-auto rounded-xl transition-transform duration-500 ${
                  layout === "grid" ? "object-contain group-hover:scale-105" : "object-cover"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
