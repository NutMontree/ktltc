"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const FILTER_CATEGORIES = [
  { value: "All", label: "ทุกหมวดหมู่" },
  { value: "PR", label: "ข่าวประชาสัมพันธ์" },
  { value: "Newsletter", label: "จดหมายข่าว" },
  { value: "Internship", label: "ฝึกประสบการณ์" },
  { value: "Announcement", label: "ข่าวประกาศ" },
  { value: "Bidding", label: "ประกวดราคา" },
  { value: "Order", label: "คำสั่งวิทยาลัย" },
];

const MONTHS = [
  { value: "All", label: "ทุกเดือน" },
  { value: "0", label: "มกราคม" },
  { value: "1", label: "กุมภาพันธ์" },
  { value: "2", label: "มีนาคม" },
  { value: "3", label: "เมษายน" },
  { value: "4", label: "พฤษภาคม" },
  { value: "5", label: "มิถุนายน" },
  { value: "6", label: "กรกฎาคม" },
  { value: "7", label: "สิงหาคม" },
  { value: "8", label: "กันยายน" },
  { value: "9", label: "ตุลาคม" },
  { value: "10", label: "พฤศจิกายน" },
  { value: "11", label: "ธันวาคม" },
];

const REDIRECT_URLS: Record<string, string> = {
  "2566": "https://ktltcv1.vercel.app/pressrelease/2566",
  "2567": "https://ktltcv1.vercel.app/pressrelease/2567",
  "2568": "https://ktltcv3.vercel.app/pressrelease/2568",
};

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
  userName?: string;
  userImage?: string | null;
  authorId?: string;
  author?: {
    name: string;
    image?: string;
  };
}


export default function NewsListClient({
  initialNews = [],
}: {
  initialNews: NewsItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    if (REDIRECT_URLS[selectedYear]) {
      const confirmMsg = `คุณเลือกดูข้อมูลปี ${selectedYear}\nระบบจะพาคุณไปยังเว็บไซต์เวอร์ชันเก่า ต้องการดำเนินการต่อหรือไม่?`;
      if (window.confirm(confirmMsg)) {
        window.open(REDIRECT_URLS[selectedYear], "_blank");
      }
      setSelectedYear("All");
    }
  }, [selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    initialNews.forEach((news) => {
      const year = new Date(news.createdAt).getFullYear() + 543;
      years.add(year.toString());
    });
    years.add("2566");
    years.add("2567");
    years.add("2568");
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [initialNews]);

  const filteredNews = useMemo(() => {
    let result = Array.isArray(initialNews) ? initialNews : [];
    if (selectedCategory !== "All") {
      result = result.filter((news) => {
        const cats = news.categories || (news.category ? [news.category] : []);
        return cats.includes(selectedCategory);
      });
    }
    if (selectedYear !== "All" && !REDIRECT_URLS[selectedYear]) {
      result = result.filter((news) => {
        const year = new Date(news.createdAt).getFullYear() + 543;
        return year.toString() === selectedYear;
      });
    }
    if (selectedMonth !== "All") {
      result = result.filter((news) => {
        const month = new Date(news.createdAt).getMonth();
        return month.toString() === selectedMonth;
      });
    }
    return result;
  }, [initialNews, selectedCategory, selectedMonth, selectedYear]);

  const paginatedNews = filteredNews.slice(0, visibleCount);
  const handleLoadMore = () => setVisibleCount((prev) => prev + 12);

  return (
    <div className="w-full">
      {/* --- Filter Section (คงเดิม) --- */}
      <div className="mb-16 bg-white/70 backdrop-blur-xl p-3 md:p-4 rounded-[2.5rem] border border-slate-200/60 shadow-xl dark:bg-slate-900/80 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setVisibleCount(12);
            }}
            className="w-full bg-white border-none rounded-full px-6 py-4 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {FILTER_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setVisibleCount(12);
            }}
            className="w-full bg-white border-none rounded-full px-6 py-4 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="All">ทุกปี พ.ศ.</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                พ.ศ. {year} {REDIRECT_URLS[year] ? "🔗" : ""}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setVisibleCount(12);
            }}
            className="w-full bg-white border-none rounded-full px-6 py-4 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- News Grid --- */}
      {paginatedNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginatedNews.map((news) => {
            const coverImage =
              news.images?.[0] ||
              news.announcementImages?.[0] ||
              "/no-image.png";
            const displayCategories = news.categories?.length
              ? news.categories
              : news.category
                ? [news.category]
                : [];
            const authorName = (news.author?.name || "งานศูนย์ข้อมูล").split(
              " ",
            )[0];
            const authorAvatar = news.userImage || news.author?.image || null;

            return (
              <Link
                key={news._id}
                href={`/news/${news._id}`}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {/\.(mp4|webm|mov|m4v|avi|wmv|flv|mkv|blob)(\?.*)?$/i.test(coverImage) || coverImage.includes('video') ? (
                    <video
                      src={coverImage}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      autoPlay
                      loop
                    />
                  ) : (
                    <Image
                      src={coverImage}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  )}
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Categories */}
                  {displayCategories.length > 0 && (
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 max-w-[90%]">
                      {displayCategories.slice(0, 2).map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm dark:bg-zinc-900/90 dark:text-blue-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 py-8 px-4 gap-3">
                  <h3 className="text-[14px] font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {news.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs">ผู้เขียน</p>
                      {authorAvatar ? (
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <Image
                            src={authorAvatar}
                            alt={authorName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
                          {authorName.charAt(0)}
                        </div>
                      )}
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[80px]">
                        {authorName}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                      {new Date(news.createdAt).toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* --- Empty State --- */
        <div className="py-48 text-center flex flex-col items-center">
          <span className="text-5xl opacity-20 mb-8">📂</span>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            ไม่พบข้อมูลที่คุณค้นหา
          </h4>
        </div>
      )}

      {/* --- Load More --- */}
      {filteredNews.length > 0 && (
        <div className="mt-16 flex flex-col items-center gap-4">
          {/* Count info */}
          <p className="text-sm text-slate-400 dark:text-slate-500">
            แสดง{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {Math.min(visibleCount, filteredNews.length)}
            </span>{" "}
            จาก{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {filteredNews.length}
            </span>{" "}
            รายการ
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((Math.min(visibleCount, filteredNews.length) / filteredNews.length) * 100, 100)}%`,
              }}
            />
          </div>

          {/* Load More Button */}
          {visibleCount < filteredNews.length && (
            <button
              onClick={handleLoadMore}
              className="mt-2 inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 active:scale-95"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              โหลดเพิ่มเติม
              <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black">
                {filteredNews.length - visibleCount} รายการ
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
