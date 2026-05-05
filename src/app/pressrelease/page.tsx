import clientPromise from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import ViewAllButton from "@/components/ViewAllButton";

// ✅ 1. เพิ่ม revalidate เพื่อให้หน้าแรกอัปเดตข่าวใหม่เสมอ
export const revalidate = 0;

// Interface ข้อมูลข่าว
interface NewsItem {
  _id: string;
  title: string;
  category: string;
  images?: string[];
  content?: string;
  createdAt: string;
  userName?: string;
  userImage?: string | null;
  // ✅ เพิ่ม author เข้ามาใน Interface
  author?: {
    name: string;
    image?: string;
  };
}

// ดึงข่าวล่าสุด
async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 })
      .limit(3)
      // ✅ 2. เอา .project() ออก เพื่อให้ข้อมูล author ติดมาด้วย (หรือใส่ author: 1)
      .toArray();

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Fetch Latest News Error:", error);
    return [];
  }
}

// ✅ 3. ปรับ Helper: แปลงวันที่และเวลาเป็นภาษาไทย
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

export default async function PressRelease() {
  const latestNews = await getLatestNews();

  return (
    <main className="flex-col relative max-w-[1600px] mx-auto flex items-center justify-between dark:bg-transparent">
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex gap-4">
            <div className="w-1.5 bg-orange-500 rounded-full h-auto self-stretch"></div>
            <div className="space-y-1">
              <h4 className="text-orange-500 font-bold text-xs tracking-widest uppercase">
                อัปเดตข่าวสาร
              </h4>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-white">
                ข่าวประชาสัมพันธ์
              </h1>
              <p className="text-zinc-500 text-sm dark:text-zinc-400">
                ติดตามข่าวสารและกิจกรรมล่าสุดของเรา
              </p>
            </div>
          </div>
          <ViewAllButton />
        </div>

        {/* --- News Grid --- */}
        {latestNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <Link 
                href={`/news/${news._id}`}
                key={news._id}
                className="group flex flex-col rounded-2xl overflow-hidden border border-zinc-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full dark:bg-zinc-900 dark:border-zinc-800"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {((news.images?.[0] && (/\.(mp4|webm|mov|m4v|avi|wmv|flv|mkv|blob)(\?.*)?$/i.test(news.images[0]) || news.images[0].includes('video'))) || (news.images?.[0] && !/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(news.images[0]))) ? (
                    <video
                      src={news.images[0]}
                      className="w-full h-full object-cover object-top"
                      muted
                      playsInline
                      autoPlay
                      loop
                    />
                  ) : (
                    <Image
                      src={news.images?.[0] || "/no-image.png"}
                      alt={news.title}
                      unoptimized
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>

                {/* 2. เนื้อหาการ์ด */}
                <div className="p-5 flex flex-col flex-1">
                  {/* ✅ แถวข้อมูล: วันที่/เวลา + ผู้โพสต์ */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-zinc-400 text-[10px] font-bold uppercase tracking-tight dark:text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-400/80"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatDateTime(news.createdAt)}</span>
                    </div>

                    {/* ✅ Badge ผู้เขียน (ดึงชื่อแรกมาแสดงเหมือนหน้า NewsList) */}
                    {(news.userName || news.author?.name) && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400">
                        {news.userImage || news.author?.image ? (
                          <div className="relative h-4 w-4 overflow-hidden rounded-full border border-orange-200 dark:border-orange-800">
                            <Image
                              src={news.userImage || news.author?.image || "/no-image.png"}
                              alt={news.userName || news.author?.name || "ผู้เขียน"}
                              fill
                              unoptimized
                              className="object-cover object-top"
                            />
                          </div>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                        <span>{(news.userName || news.author?.name || "ผู้เขียน").split(" ")[0]}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-zinc-800 mb-3 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors dark:text-zinc-100 dark:group-hover:text-orange-400">
                    {news.title}
                  </h3>

                  <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed dark:text-zinc-400">
                    {news.content?.replace(/<[^>]+>/g, "").substring(0, 150) ||
                      "อ่านรายละเอียดเพิ่มเติม..."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-300 rounded-2xl dark:border-zinc-700">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-300">
              ยังไม่มีข่าวประชาสัมพันธ์
            </h3>
            <p className="text-zinc-400 dark:text-zinc-500">
              โปรดรอติดตามการอัปเดตเร็วๆ นี้
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
