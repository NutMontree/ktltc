import clientPromise from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import ViewAllNewslettersButton from "@/components/ViewAllNewslettersButton";

// ✅ 1. เพิ่มการ Revalidate เพื่อให้ข้อมูลจดหมายข่าวไม่อัปเดตล่าช้า
export const revalidate = 0;

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  thumbnails?: string[];
  createdAt: string;
  userName?: string;
  userImage?: string | null;
  // ✅ เพิ่ม author เข้ามาใน Interface
  author?: {
    name: string;
    image?: string;
  };
}

async function getNewsletters(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const query = {
      $or: [
        { category: "Newsletter" },
        { categories: "Newsletter" },
        { category: "จดหมายข่าวประชาสัมพันธ์" },
        { categories: "จดหมายข่าวประชาสัมพันธ์" },
      ],
    };

    const newsletters = await db
      .collection("news")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    return JSON.parse(JSON.stringify(newsletters));
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return [];
  }
}

export default async function NewsletterPage() {
  const newsletters = await getNewsletters();

  return (
    <main className="text-slate-800 dark:text-slate-200 mx-auto max-w-[1600px]">
      {/* --- Header Section --- */}
      <section className="py-12 text-center">
        <h4 className="text-yellow-500 font-bold text-xs tracking-widest uppercase mb-2">
          E-Newsletter
        </h4>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          <span className="text-slate-800 dark:text-white">จดหมายข่าว</span>
          <span className="text-yellow-500">ประชาสัมพันธ์</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto dark:text-slate-400">
          ติดตามวารสารและข่าวสารกิจกรรมต่างๆ
          ผ่านรูปแบบจดหมายข่าวอิเล็กทรอนิกส์ที่เราจัดทำขึ้นเพื่อคุณ
        </p>
        <div className="w-16 h-1 bg-yellow-400 mx-auto mt-6 rounded-full"></div>
      </section>

      {/* --- Newsletter Grid --- */}
      <section className="pb-20">
        {newsletters.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newsletters.map((news, index) => {
                const coverImage =
                  news.thumbnails && news.thumbnails.length > 0
                    ? news.thumbnails[0]
                    : news.announcementImages && news.announcementImages.length > 0
                      ? news.announcementImages[0]
                      : news.images && news.images.length > 0
                        ? news.images[0]
                        : "/no-image.png";

                return (
                  <Link
                    key={news._id}
                    href={`/news/${news._id}`}
                    className="group relative block rounded-4xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:-translate-y-2 aspect-3/4 dark:border-slate-800 dark:shadow-black/40"
                  >
                    {/* Image Area */}
                    <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-slate-800">
                      {/\.(mp4|webm|mov|m4v|avi|wmv|flv|mkv|blob)(\?.*)?$/i.test(coverImage) || coverImage.includes('video') ? (
                        <video
                          src={coverImage}
                          className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-110"
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                          className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                        />
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent"></div>
                    </div>

                    {/* Date & Time Badge */}
                    <div className="absolute top-5 right-5 z-10 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold text-white uppercase">
                      <svg
                        className="w-3 h-3 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {/* ไอคอนนาฬิกา */}
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {/* ✅ แสดงวันที่และเวลา */}
                      {new Date(news.createdAt).toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }) + " น."}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-8 text-white z-20">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-8 h-[2px] bg-yellow-400"></span>
                        <span className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em]">
                          Newsletter
                        </span>
                      </div>

                      <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-yellow-300 transition-colors line-clamp-2">
                        {news.title}
                      </h3>

                      {/* ✅ แสดงชื่อผู้โพสต์ (ตำแหน่งเดิมที่เพิ่มไว้) */}
                      {(news.userName || news.author?.name) && (
                        <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-300 font-medium">
                          {news.userImage || news.author?.image ? (
                            <div className="relative h-5 w-5 overflow-hidden rounded-full border border-white/20">
                              <Image
                                src={news.userImage || news.author?.image || "/no-image.png"}
                                alt={news.userName || news.author?.name || "Author"}
                                fill
                                unoptimized
                                className="object-cover"
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
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                            </svg>
                          )}
                          <span>
                            ผู้เขียน: {(news.userName || news.author?.name || "Author").split(" ")[0]}{" "}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                        <span>เปิดอ่านจดหมายข่าว</span>
                        <svg
                          className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
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
                  </Link>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <ViewAllNewslettersButton />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner mb-6">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              ยังไม่มีจดหมายข่าว
            </h3>
            <p className="text-slate-500 mt-2 dark:text-slate-400">
              เรากำลังเตรียมเนื้อหาใหม่ๆ ให้คุณ โปรดติดตามเร็วๆ นี้
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
