// app/dashboard/news/page.tsx
import clientPromise from "@/lib/db";
import Link from "next/link";
import ManageNewsList from "@/components/ManageNewsList";

export const revalidate = 0; // ป้องกันการค้าง Cache

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
    image?: string;
  };
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 }) // เรียงใหม่ไปเก่า
      .project({
        title: 1,
        category: 1,
        categories: 1,
        images: 1,
        announcementImages: 1,
        createdAt: 1,
        author: 1,
        userName: 1,
        userImage: 1,
      })
      .toArray();

    // แปลง _id เป็น string และจัดการข้อมูลให้พร้อมส่งไปยัง Client Component
    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function ManageNewsPage() {
  const newsList = await getNews();

  return (
    <div className="max-w-[1600px] py-10 mx-auto w-full px-2 text-zinc-800 dark:text-zinc-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-start gap-4">
          {/* Accent bar */}
          <div className="w-1.5 self-stretch rounded-full bg-linear-to-b from-blue-500 to-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              จัดการข่าวสาร
            </h1>
            <p className="text-zinc-400 dark:text-zinc-500 mt-1 text-sm flex items-center gap-2">
              ข่าวประชาสัมพันธ์ทั้งหมด
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30">
                {newsList.length} รายการ
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/news/add"
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มข่าวใหม่
        </Link>
      </div>

      <ManageNewsList newsList={newsList} />
    </div>
  );
}
