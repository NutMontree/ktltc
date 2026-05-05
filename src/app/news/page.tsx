import clientPromise from "@/lib/db";
import NewsListClient from "@/components/NewsListClient";
import RefreshButton from "@/components/RefreshButton";

interface NewsItem {
  _id: string;
  title: string;
  category?: string;
  categories?: string[];
  images?: string[];
  announcementImages?: string[];
  createdAt: string;
  author?: {
    name: string;
  };
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const collection = db.collection("news");

    try {
      await collection.createIndex({ createdAt: -1 });
    } catch (idxError) {
      console.log("Index check:", idxError);
    }

    const news = await collection
      .find({})
      .project({
        title: 1,
        category: 1,
        categories: 1,
        createdAt: 1,
        images: { $slice: 1 },
        announcementImages: { $slice: 1 },
        author: 1, // ✅ ดึงข้อมูลผู้โพสต์
      })
      .sort({ createdAt: -1 })
      .toArray();

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export default async function AllNewsPage() {
  const newsList = await getNews();

  return (
    <main className="max-w-[1600px] mx-auto bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
      <div className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-zinc-800 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Latest Updates
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                NEWS & <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  EVENTS
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                เกาะติดทุกความเคลื่อนไหว กิจกรรม และประกาศสำคัญจาก
                <span className="text-slate-900 dark:text-white font-semibold ml-1">
                  วิทยาลัยเทคนิคกันทรลักษ์
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 self-start md:self-end">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  Last Updated
                </span>
                <div className="flex items-center gap-3">
                  <RefreshButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 md:py-20 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent"></div>
        <div className="max-w-[1600px] mx-auto px-2">
          <div className="mb-12 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-linear-to-r from-slate-200 to-transparent dark:from-zinc-800"></div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Showing {newsList.length} Stories
              </span>
              <div className="h-px flex-1 bg-linear-to-l from-slate-200 to-transparent dark:from-zinc-800"></div>
            </div>
          </div>
          <div className="relative min-h-[50vh]">
            <NewsListClient initialNews={newsList} />
          </div>
        </div>
      </div>
    </main>
  );
}
