import clientPromise from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

// ✅ 1. เพิ่มการ Revalidate เพื่อให้ข่าวประกาศอัปเดตทันที
export const revalidate = 0;

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  content?: string;
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
  userName?: string;
  userImage?: string | null;
  // ✅ เพิ่ม author เพื่อรองรับการแสดงชื่อผู้โพสต์
  author?: {
    name: string;
    image?: string;
  };
}

async function getAnnouncements(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const query = {
      $or: [
        { category: "Announcement" },
        { categories: "Announcement" },
        { category: "ข่าวประกาศ" },
        { categories: "ข่าวประกาศ" },
      ],
    };

    const news = await db
      .collection("news")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      // ✅ มั่นใจว่าไม่ได้ใช้ .project() ที่ไปตัด author ออก
      .toArray();

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

const truncateText = (text: string, length: number) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, "") || "";
};

// ✅ ปรับปรุง Helper: แสดงทั้งวันที่และเวลา
const formatDateTime = (dateString: string) => {
  return (
    new Date(dateString).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " น."
  );
};

export default async function AnnouncementPage() {
  const announcements = await getAnnouncements();

  return (
    <main className="bg-slate-50 text-slate-800 dark:bg-transparent dark:text-slate-200 mx-auto max-w-[1600px]">
      <div className="py-10">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 w-full">
          {/* ส่วนข้อความ (ชิดซ้าย/Start) */}
          <div className="space-y-2 border-l-4 border-red-500 pl-4">
            <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Official Announcements
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-tight">
              ข่าวประกาศ <span className="text-red-500">ประชาสัมพันธ์</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-lg dark:text-slate-400">
              รวมประกาศสำคัญ ข่าวสารราชการ และคำสั่งต่างๆ
            </p>
          </div>

          {/* ส่วนปุ่ม (ชิดขวา/End) */}
          <Link
            href="/news?category=Announcement"
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 group dark:shadow-none whitespace-nowrap"
          >
            ดูประกาศทั้งหมด
          </Link>
        </div>

        {/* --- Grid Section --- */}
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((news) => {
              const coverImage =
                news.announcementImages && news.announcementImages.length > 0
                  ? news.announcementImages[0]
                  : news.images && news.images.length > 0
                    ? news.images[0]
                    : "/no-image.png";

              return (
                <Link
                  key={news._id}
                  href={`/news/${news._id}`}
                  className="group flex flex-col rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full bg-white dark:bg-slate-900 dark:border-slate-800"
                >
                  {/* Image Area */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
                      <svg
                        className="w-3.5 h-3.5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {/* ✅ เปลี่ยนเป็นไอคอนนาฬิกา */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {/* ✅ แสดงวันที่พร้อมเวลา */}
                      {formatDateTime(news.createdAt)}
                    </div>

                    <Image
                      src={coverImage}
                      alt={news.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-red-600 text-[10px] font-black uppercase tracking-[0.15em] dark:text-red-500">
                          News Update
                        </h4>

                        {/* ✅ แสดงชื่อผู้เขียน */}
                        {(news.userName || news.author?.name) && (
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-2 py-1 rounded-lg dark:bg-slate-800/50 dark:text-slate-500">
                            {news.userImage || news.author?.image ? (
                              <div className="relative h-4 w-4 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                                <Image
                                  src={news.userImage || news.author?.image || "/no-image.png"}
                                  alt={news.userName || news.author?.name || "Author"}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400/50"></div>
                            )}
                            <span>
                              ผู้เขียน: {(news.userName || news.author?.name || "Author").split(" ")[0]}{" "}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors dark:text-slate-100 dark:group-hover:text-red-400">
                        {news.title}
                      </h3>
                    </div>

                    <p className="text-slate-500 text-xs md:text-sm line-clamp-3 mb-6 leading-relaxed dark:text-slate-400">
                      {news.content
                        ? truncateText(stripHtml(news.content), 120)
                        : "คลิกเพื่ออ่านรายละเอียดของประกาศฉบับนี้เพิ่มเติม..."}
                    </p>

                    {/* Footer ของการ์ด */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-red-500 text-sm font-bold group/btn dark:border-slate-800">
                      <span>อ่านประกาศฉบับเต็ม</span>
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover/btn:bg-red-500 group-hover/btn:text-white transition-all dark:bg-red-500/10">
                        <svg
                          className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl opacity-50">📣</span>
            </div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
              ยังไม่มีประกาศในขณะนี้
            </p>
            <p className="text-sm mt-1">
              ระบบจะทำการอัปเดตข้อมูลทันทีเมื่อมีประกาศใหม่
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
