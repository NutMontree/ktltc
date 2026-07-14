"use client";

import { useState, useEffect } from "react";
import { FiYoutube, FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";
import LiteYouTubeEmbed from "@/components/LiteYouTubeEmbed";

/**
 * SocialFeedDisplay.tsx (Client Component): คอมโพเนนต์แสดงรายการวิดีโอ YouTube
 * 
 * หน้าที่: 
 * 1. รับข้อมูลรายการวิดีโอ (feeds) มาแสดงผล
 * 2. กรองเฉพาะแพลตฟอร์ม YouTube
 * 3. แสดงผลในรูปแบบรายการพับเก็บได้ (Accordion) ด้วย <details>
 * 4. รองรับการแสดงผลแบบ "ดูทั้งหมด" (View All)
 */

interface SocialFeed {
  _id: string;
  platform: "facebook" | "youtube";
  title: string;
  url: string;
  embedId?: string;
}

export default function SocialFeedDisplay({
  feeds = [],
}: {
  feeds: SocialFeed[];
}) {
  // แยกข้อมูลตามแพลตฟอร์ม (ปัจจุบันเน้น YouTube)
  const youtubeFeeds = feeds?.filter((f) => f.platform === "youtube") || [];
  const facebookFeeds = feeds?.filter((f) => f.platform === "facebook") || [];

  // สถานะการแสดงผล (ดูทั้งหมด หรือดูแค่ 3 รายการแรก)
  const [showAll, setShowAll] = useState(false);
  const itemsToShow = showAll ? youtubeFeeds.length : 3;

  // ส่วนของการตรวจสอบข้อมูล (Log ดูค่าใน Console)
  useEffect(() => {
    console.log("Feeds received:", feeds);
    console.log("YouTube Feeds:", youtubeFeeds);
  }, [feeds]);

  return (
    <section className="py-12">
      <div className="max-w-[1600px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-4 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
        
        {/* หัวข้อส่วนวิดีโอ */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-4xl flex items-center justify-center mb-6 shadow-lg shadow-red-100">
            <FiYoutube className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-white mb-2 tracking-tight">
            รับชมวิดีโอ <span className="text-red-600">YouTube</span>
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            คลิกที่รายการเพื่อรับชมวิดีโอกิจกรรม (มีทั้งหมด{" "}
            {youtubeFeeds.length} วิดีโอ)
          </p>
        </div>

        {/* รายการวิดีโอ (Accordion) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {youtubeFeeds.length > 0 ? (
            youtubeFeeds.slice(0, itemsToShow).map((feed) => (
              <div
                key={feed._id}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Iframe Area */}
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {feed.embedId ? (
                    <LiteYouTubeEmbed videoId={feed.embedId} title={feed.title} />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-zinc-400 italic text-sm">
                      ไม่พบรหัสวิดีโอ
                    </div>
                  )}
                  {/* subtle overlay border */}
                  <div className="pointer-events-none absolute inset-0 border border-black/5 dark:border-white/5 rounded-t-3xl" />
                </div>
                
                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                      <FiYoutube size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      KTLTC OFFICIAL
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-red-500 transition-colors">
                    {feed.title}
                  </h3>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800/50">
                    <span className="text-[10px] text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      ID: {feed.embedId || "N/A"}
                    </span>
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      WATCH NOW 
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // กรณีไม่มีข้อมูลวิดีโอ
            <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-800/20 rounded-4xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                NO VIDEOS DISCOVERED
              </p>
            </div>
          )}
        </div>

        {/* ปุ่มควบคุมการแสดงผล (ดูทั้งหมด / ดูน้อยลง) */}
        {youtubeFeeds.length > 3 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
            >
              {showAll ? (
                <>
                  <FiMinus /> SHOW LESS
                </>
              ) : (
                <>
                  <FiPlus /> VIEW ALL VIDEOS ({youtubeFeeds.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

