import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";
import Image from "next/image";
import { FootTitle } from "@/components/FootTitle";
import NewsShareBar from "@/components/news/NewsShareBar";

// --- Icons (เพิ่ม Icon User สำหรับผู้โพสต์) ---
const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconChevronLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconArrowLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconExternalLink = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

// ✅ 1. เพิ่ม authorName ใน Interface
interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  content?: string;
  images?: string[];
  announcementImages?: string[];
  links?: { label: string; url: string }[];
  videoEmbeds?: string[];
  createdAt: Date | string;
  userName?: string;
  userImage?: string | null;
  author?: {
    name: string;
    image?: string;
  };
}

// ฟังก์ชันสำหรับ SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNewsDetail(id);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ktltc.vercel.app";
  const pageUrl = `${baseUrl}/news/${id}`;
  const plainTextContent = news?.content?.replace(/<[^>]+>/g, "").trim() || "";
  const description =
    plainTextContent.slice(0, 160) ||
    "ข่าวสารและกิจกรรมจากวิทยาลัยเทคนิคกันทรลักษ์";
  const imageUrl =
    news?.images?.[0] ||
    news?.announcementImages?.[0] ||
    `${baseUrl}/og-image.png`;
  return {
    title: news ? news.title : "News Detail",
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: news?.title || "News Detail",
      description,
      url: pageUrl,
      type: "article",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: news?.title || "News Detail",
      description,
      images: [imageUrl],
    },
  };
}

async function getNewsDetail(id: string): Promise<NewsItem | null> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    if (!ObjectId.isValid(id)) return null;
    const news = await db.collection("news").findOne({ _id: new ObjectId(id) });
    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch {
    return null;
  }
}

async function getAdjacentNews(currentNews: NewsItem) {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const currentId = new ObjectId(currentNews._id);
    const currentDate = new Date(currentNews.createdAt);

    const prevNews = await db
      .collection("news")
      .find({
        $or: [
          { createdAt: { $lt: currentDate } },
          { createdAt: currentDate, _id: { $lt: currentId } },
        ],
      })
      .sort({ createdAt: -1, _id: -1 })
      .limit(1)
      .project({ _id: 1, title: 1 })
      .toArray();

    const nextNews = await db
      .collection("news")
      .find({
        $or: [
          { createdAt: { $gt: currentDate } },
          { createdAt: currentDate, _id: { $gt: currentId } },
        ],
      })
      .sort({ createdAt: 1, _id: 1 })
      .limit(1)
      .project({ _id: 1, title: 1 })
      .toArray();

    return {
      prev:
        prevNews.length > 0 ? JSON.parse(JSON.stringify(prevNews[0])) : null,
      next:
        nextNews.length > 0 ? JSON.parse(JSON.stringify(nextNews[0])) : null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await getNewsDetail(id);

  if (!news) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6 text-center">
        <div className="text-6xl mb-6 opacity-20">🔍</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          ไม่พบข้อมูลข่าวสาร
        </h1>
        <Link
          href="/news"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const { prev, next } = await getAdjacentNews(news);
  const displayCategories = news.categories?.length
    ? news.categories
    : news.category
      ? [news.category]
      : ["ข่าวทั่วไป"];

  const authorName =
    news.userName ||
    news.author?.name ||
    "เธ‡เธฒเธ™เธจเธนเธ™เธขเนŒเธ‚เน‰เธญเธกเธนเธฅ";
  const authorImage = news.userImage || news.author?.image || null;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://ktltc.vercel.app";
  const pageUrl = `${baseUrl}/news/${id}`;

  return (
    <div className="max-w-7xl mx-auto bg-slate-50/50 dark:bg-zinc-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <main className="pb-16 md:pb-24">
        {/* --- Hero / Header Section --- */}
        <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 pt-12 pb-8 px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors group"
            >
              <div className="p-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                <IconArrowLeft />
              </div>
              ย้อนกลับหน้าข่าวสาร
            </Link>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {displayCategories.map((cat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* ✅ แสดงชื่อข่าวจริง (เอา Comment ออกแล้ว) */}
              <h1 className="text-3xl text-center md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {/* {news.title} */}
                <p>วิทยาลัยเทคนิคกันทรลักษ์</p>
              </h1>

              {/* ✅ ส่วนข้อมูล Meta: วันที่ + ผู้โพสต์ */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="font-medium">เผยแพร่เมื่อ:</span>
                  <time className="text-slate-700 dark:text-slate-300">
                    {new Date(news.createdAt).toLocaleDateString("th-TH", {
                      timeZone: "Asia/Bangkok",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {/* แสดงชื่อผู้โพสต์ข่าว */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 dark:bg-green-600"></div>
                  <span className="font-medium">เวลา:</span>
                  <time className="text-slate-700 dark:text-slate-300">
                    {new Date(news.createdAt).toLocaleTimeString("th-TH", {
                      timeZone: "Asia/Bangkok",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </time>
                </div>

                <div className="flex items-center gap-2">
                  {authorImage ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800">
                      <Image
                        src={authorImage}
                        alt={authorName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-400">
                      <IconUser />
                    </div>
                  )}
                  <span className="font-medium">ผู้เขียน:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {authorName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-10 space-y-12">
          <NewsShareBar title={news.title} url={pageUrl} />
          {/* --- Content Body --- */}
          <article
            className="prose prose-lg prose-slate dark:prose-invert max-w-none 
            prose-headings:font-bold prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:my-10
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-zinc-900 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            [&_a]:text-blue-600! [&_a]:underline! [&_a]:break-all! hover:[&_a]:text-blue-800!"
          >
            <div dangerouslySetInnerHTML={{ __html: news.content || "" }} />
          </article>

          <div className="py-4">
            <FootTitle />
          </div>
          <hr className="border-slate-200 dark:border-zinc-800" />

          {/* --- 🎥 Video Section --- */}
          {news.videoEmbeds && news.videoEmbeds.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-red-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  วิดีโอประกอบ
                </h3>
              </div>
              <div
                className={`grid gap-6 ${news.videoEmbeds.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
              >
                {news.videoEmbeds.map((embedCode, index) => (
                  <div
                    key={index}
                    className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black border border-slate-200 dark:border-zinc-800 [&>iframe]:w-full [&>iframe]:h-full"
                    dangerouslySetInnerHTML={{ __html: embedCode }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* --- Documents / Links Section --- */}
          {news.links && news.links.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                  <IconDownload />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  เอกสารและลิงก์ที่เกี่ยวข้อง
                </h3>
              </div>
              <div className=" ">
                {news.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center p-5 bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
                    <div className="flex-1 min-w-0 mr-4">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 truncate">
                        {link.label}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-1 font-mono">
                        {link.url}
                      </p>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                      <IconExternalLink />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* --- Posters Section --- */}
          {news.announcementImages && news.announcementImages.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-amber-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  จดหมายข่าวประชาสัมพันธ์
                </h3>
              </div>
              <div className="flex flex-col gap-10">
                {news.announcementImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800"
                  >
                    <Image
                      src={img}
                      alt="Announcement"
                      width={1200}
                      height={1600}
                      unoptimized
                      className="w-full h-auto"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- Gallery Section --- */}
          {news.images && news.images.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  ประมวลภาพกิจกรรม{" "}
                  <span className="text-slate-400 font-normal ml-2">
                    ({news.images.length})
                  </span>
                </h3>
              </div>
              <div
                className={`${news.images.length < 5 ? "columns-1" : "columns-1 sm:columns-2 lg:columns-3"} gap-4 space-y-4`}
              >
                {news.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="break-inside-avoid relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <Image
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      width={800}
                      height={600}
                      unoptimized
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- Navigation --- */}
          <nav className="border-t border-slate-200 dark:border-zinc-800 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={`/news/${prev._id}`}
                  className="group p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-blue-600">
                    <IconChevronLeft /> ข่าวก่อนหน้า
                  </div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {prev.title}
                  </h4>
                </Link>
              ) : (
                <div className="hidden md:block" />
              )}
              {next ? (
                <Link
                  href={`/news/${next._id}`}
                  className="group p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-blue-600">
                    ข่าวถัดไป <IconChevronRight />
                  </div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {next.title}
                  </h4>
                </Link>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
