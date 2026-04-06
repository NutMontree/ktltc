"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import DeleteNewsBtn from "@/components/DeleteNewsBtn";

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
  userName?: string;
  userImage?: string;
  author?: {
    name: string;
    image?: string;
    role?: string;
  };
}

const EyeIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const GridIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const ListIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 10h16M4 14h16M4 18h16"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4 text-zinc-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export default function ManageNewsList({ newsList }: { newsList: NewsItem[] }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const sortedNews = useMemo(() => {
    return [...newsList].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [newsList]);

  // รวบรวม categories ทั้งหมด
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    sortedNews.forEach((n) => {
      if (n.categories?.length) n.categories.forEach((c) => cats.add(c));
      else if (n.category) cats.add(n.category);
    });
    return ["ทั้งหมด", ...Array.from(cats)];
  }, [sortedNews]);

  // รวบรวมปีที่มีข้อมูล
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    sortedNews.forEach((n) =>
      years.add(String(new Date(n.createdAt).getFullYear())),
    );
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [sortedNews]);

  // รวบรวมเดือนตามปีที่เลือก
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    sortedNews.forEach((n) => {
      const d = new Date(n.createdAt);
      if (!selectedYear || String(d.getFullYear()) === selectedYear) {
        months.add(String(d.getMonth() + 1).padStart(2, "0"));
      }
    });
    return Array.from(months).sort();
  }, [sortedNews, selectedYear]);

  // รวบรวมวันตามปี+เดือนที่เลือก
  const availableDays = useMemo(() => {
    const days = new Set<string>();
    sortedNews.forEach((n) => {
      const d = new Date(n.createdAt);
      const y = String(d.getFullYear());
      const m = String(d.getMonth() + 1).padStart(2, "0");
      if (
        (!selectedYear || y === selectedYear) &&
        (!selectedMonth || m === selectedMonth)
      ) {
        days.add(String(d.getDate()).padStart(2, "0"));
      }
    });
    return Array.from(days).sort();
  }, [sortedNews, selectedYear, selectedMonth]);

  const thaiMonths = [
    "มค",
    "กพ",
    "มีค",
    "เมย",
    "พค",
    "มิย",
    "กค",
    "สค",
    "กย",
    "ตค",
    "พย",
    "ธค",
  ];

  const filteredNews = useMemo(() => {
    return sortedNews.filter((n) => {
      const matchSearch = n.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const cats = n.categories?.length
        ? n.categories
        : n.category
          ? [n.category]
          : [];
      const matchCat =
        selectedCategory === "ทั้งหมด" || cats.includes(selectedCategory);
      const d = new Date(n.createdAt);
      const matchYear =
        !selectedYear || String(d.getFullYear()) === selectedYear;
      const matchMonth =
        !selectedMonth ||
        String(d.getMonth() + 1).padStart(2, "0") === selectedMonth;
      const matchDay =
        !selectedDay || String(d.getDate()).padStart(2, "0") === selectedDay;
      return matchSearch && matchCat && matchYear && matchMonth && matchDay;
    });
  }, [
    sortedNews,
    searchQuery,
    selectedCategory,
    selectedYear,
    selectedMonth,
    selectedDay,
  ]);

  const displayedNews = filteredNews.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* ── Row 1: Search + View Toggle ── */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อข่าว..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(12);
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition"
          />
        </div>
        {/* View Toggle */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-zinc-700 shadow text-blue-600" : "text-zinc-400 hover:text-zinc-600"}`}
            title="Grid View"
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-zinc-700 shadow text-blue-600" : "text-zinc-400 hover:text-zinc-600"}`}
            title="List View"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* ── Row 2: Category Filter ── */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:block">
          หมวดหมู่
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(12);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-blue-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Row 3: Date Filter ── */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:block">
          วันที่
        </span>
        <div className="flex gap-2 flex-wrap">
          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth("");
              setSelectedDay("");
              setVisibleCount(12);
            }}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition cursor-pointer"
          >
            <option value="">ทุกปี</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {Number(y) + 543}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setSelectedDay("");
              setVisibleCount(12);
            }}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition cursor-pointer"
          >
            <option value="">ทุกเดือน</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {thaiMonths[Number(m) - 1]}
              </option>
            ))}
          </select>

          {/* Day */}
          <select
            value={selectedDay}
            onChange={(e) => {
              setSelectedDay(e.target.value);
              setVisibleCount(12);
            }}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition cursor-pointer"
          >
            <option value="">ทุกวัน</option>
            {availableDays.map((d) => (
              <option key={d} value={d}>
                {Number(d)}
              </option>
            ))}
          </select>

          {/* Reset Date */}
          {(selectedYear || selectedMonth || selectedDay) && (
            <button
              onClick={() => {
                setSelectedYear("");
                setSelectedMonth("");
                setSelectedDay("");
                setVisibleCount(12);
              }}
              className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 text-red-400 hover:text-red-600 hover:bg-red-100 transition text-xs font-bold"
              title="ล้างตัวกรองวันที่"
            >
              ✕ ล้างวันที่
            </button>
          )}
        </div>
      </div>

      {/* Result Count */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        แสดง{" "}
        <span className="font-bold text-zinc-600 dark:text-zinc-300">
          {Math.min(visibleCount, filteredNews.length)}
        </span>{" "}
        จาก{" "}
        <span className="font-bold text-zinc-600 dark:text-zinc-300">
          {filteredNews.length}
        </span>{" "}
        รายการ
        {selectedCategory !== "ทั้งหมด" && (
          <span className="ml-1">ในหมวด &quot;{selectedCategory}&quot;</span>
        )}
      </p>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="text-6xl opacity-20">🔍</div>
          <p className="text-zinc-400 font-medium">
            ไม่พบข่าวที่ตรงกับการค้นหา
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ทั้งหมด");
            }}
            className="text-sm text-blue-500 hover:underline"
          >
            รีเซ็ตตัวกรอง
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && filteredNews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {displayedNews.map((news, index) => {
            const displayImage =
              news.images?.[0] ||
              news.announcementImages?.[0] ||
              "/no-image.png";
            const displayCategories = news.categories?.length
              ? news.categories
              : news.category
                ? [news.category]
                : ["ไม่ระบุ"];
            const rawAuthorName =
              news.userName || news.author?.name || "งานศูนย์ข้อมูล";
            const authorName = rawAuthorName.split(" ")[0];
            const authorAvatar = news.userImage || news.author?.image || null;

            return (
              <div
                key={news._id}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={news.title}
                    fill
                    priority={index < 4}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Categories */}
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

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-1 px-3 pb-3">
                  <div className="flex gap-1">
                    <Link
                      href={`/news/${news._id}`}
                      target="_blank"
                      title="ดูหน้าเว็บ"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                    >
                      <EyeIcon /> ดู
                    </Link>
                    <Link
                      href={`/dashboard/news/edit/${news._id}`}
                      title="แก้ไข"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                      <EditIcon /> แก้ไข
                    </Link>
                  </div>
                  <DeleteNewsBtn id={news._id} title={news.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && filteredNews.length > 0 && (
        <div className="flex flex-col gap-2">
          {displayedNews.map((news, index) => {
            const displayImage =
              news.images?.[0] ||
              news.announcementImages?.[0] ||
              "/no-image.png";
            const displayCategories = news.categories?.length
              ? news.categories
              : news.category
                ? [news.category]
                : ["ไม่ระบุ"];
            const rawAuthorName =
              news.userName || news.author?.name || "งานศูนย์ข้อมูล";
            const authorName = rawAuthorName.split(" ")[0];
            const authorAvatar = news.userImage || news.author?.image || null;

            return (
              <div
                key={news._id}
                className="group flex items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 hover:shadow-md hover:border-blue-200 dark:hover:border-zinc-700 transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                  <Image
                    src={displayImage}
                    alt={news.title}
                    fill
                    priority={index < 4}
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {displayCategories.slice(0, 2).map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-blue-600 transition-colors">
                    {news.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {authorAvatar ? (
                      <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={authorAvatar}
                          alt={authorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-[8px] text-white font-bold shrink-0">
                        {authorName.charAt(0)}
                      </div>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      {authorName}
                    </span>
                    <span className="text-zinc-200 dark:text-zinc-700">·</span>
                    <span className="text-[11px] text-zinc-400">
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

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/news/${news._id}`}
                    target="_blank"
                    title="ดูหน้าเว็บ"
                    className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                  >
                    <EyeIcon />
                  </Link>
                  <Link
                    href={`/dashboard/news/edit/${news._id}`}
                    title="แก้ไข"
                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                  >
                    <EditIcon />
                  </Link>
                  <DeleteNewsBtn id={news._id} title={news.title} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {visibleCount < filteredNews.length && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-full max-w-xs bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((visibleCount / filteredNews.length) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-zinc-400">
            {visibleCount} / {filteredNews.length} รายการ
          </p>
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-8 py-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-bold shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
          >
            โหลดเพิ่มเติม ({filteredNews.length - visibleCount} รายการ)
          </button>
        </div>
      )}
    </div>
  );
}
