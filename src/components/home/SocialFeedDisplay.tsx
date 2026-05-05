"use client";

import { useState, useEffect } from "react"; // เพิ่ม useEffect มาเช็คค่า
import { FiYoutube, FiChevronDown, FiPlus, FiMinus } from "react-icons/fi";

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
  // ✅ ตรวจสอบว่า feeds มีข้อมูลไหม
  const youtubeFeeds = feeds?.filter((f) => f.platform === "youtube") || [];
  const facebookFeeds = feeds?.filter((f) => f.platform === "facebook") || [];

  const [showAll, setShowAll] = useState(false);
  const itemsToShow = showAll ? youtubeFeeds.length : 3;

  // ส่วนของ Debug (ลบออกได้เมื่อโชว์แล้ว)
  useEffect(() => {
    console.log("Feeds received:", feeds);
    console.log("YouTube Feeds:", youtubeFeeds);
  }, [feeds]);

  return (
    <section className="py-12 px-4">
      <div className="max-w-[1600px] mx-auto bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-zinc-200/50 dark:shadow-none">
        {/* Header */}
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

        {/* รายการวิดีโอ */}
        <div className="space-y-4">
          {youtubeFeeds.length > 0 ? (
            youtubeFeeds.slice(0, itemsToShow).map((feed) => (
              <details
                key={feed._id}
                className="group border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none bg-white dark:bg-zinc-900 outline-none">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500">
                      <FiYoutube size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                        {feed.title}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-wider">
                        KTLTC Official • Video ID: {feed.embedId || "N/A"}
                      </p>
                    </div>
                  </div>
                  <FiChevronDown
                    className="text-zinc-400 transition-transform duration-300 group-open:rotate-180"
                    size={24}
                  />
                </summary>

                {/* ตรวจสอบว่ามี embedId ไหมก่อนแสดง iframe */}
                <div className="p-6 pt-0 bg-zinc-50 dark:bg-zinc-800/30">
                  {feed.embedId ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-700">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${feed.embedId}`}
                        title={feed.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="py-10 text-center text-zinc-400 italic text-sm">
                      ไม่พบข้อมูลรหัสวิดีโอ (ID)
                    </div>
                  )}
                </div>
              </details>
            ))
          ) : (
            <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-800/20 rounded-4xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                NO VIDEOS DISCOVERED
              </p>
            </div>
          )}
        </div>

        {/* ปุ่มดูทั้งหมด */}
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
