import clientPromise from "@/lib/db";
import NewsListClient from "@/components/NewsListClient";
import Link from "next/link";

// ✅ 1. เพิ่มการ Revalidate เพื่อให้ข้อมูลการประกวดราคาไม่อัปเดตล่าช้า
export const revalidate = 300; // Revalidate every 5 minutes

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
  // ✅ เพิ่ม author เพื่อรองรับการแสดงชื่อผู้โพสต์ใน NewsListClient
  author?: {
    name: string;
    image?: string;
  };
}

async function getTenderData(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    // ดึงข้อมูลโดยกรองเฉพาะหมวดหมู่ "Bidding" (ประกวดราคา)
    const tenderNews = await db
      .collection("news")
      .find({
        $or: [{ category: "Bidding" }, { categories: { $in: ["Bidding"] } }],
      })
      .sort({ createdAt: -1 })
      .limit(3)
      // ✅ มั่นใจว่าไม่ได้ใช้ .project() เพื่อให้ author ติดไปด้วย
      .toArray();

    return JSON.parse(JSON.stringify(tenderNews));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function TenderPage() {
  const tenderData = await getTenderData();

  return (
    <main className="mx-auto max-w-[1600px]">
      <div className="py-10">
        {/* --- Header Section (ธีมสี Amber สำหรับงานพัสดุ/ประกวดราคา) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 w-full">
          {/* ส่วนที่ 1: ข้อความ (อยู่ซ้ายสุด) */}
          <div className="space-y-2 border-l-4 border-amber-500 pl-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-widest text-[10px] md:text-xs dark:text-amber-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Procurement & Bidding
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-tight">
              ข่าว{" "}
              <span className="text-amber-600 dark:text-amber-500">
                ประกวดราคา
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-lg dark:text-slate-400 font-medium">
              ประกาศจัดซื้อจัดจ้าง ผลการประกวดราคา และเอกสารสอบราคา
            </p>
          </div>

          {/* ส่วนที่ 2: ปุ่ม (อยู่ขวาสุด) */}
          <Link
            href="/news?category=Bidding"
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-bold text-sm shadow-lg shadow-amber-100 hover:bg-amber-700 transition-all hover:shadow-xl active:scale-95 group dark:shadow-none dark:bg-amber-500 whitespace-nowrap"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span>ดูประกาศทั้งหมด</span>
          </Link>
        </div>

        {/* --- Grid Content --- */}
        {tenderData.length > 0 ? (
          <div className="[&_.mb-16.bg-white\/70]:hidden [&_.mb-16.dark\:bg-slate-900\/80]:hidden">
            {/* ส่งข้อมูลที่มี author ไปยัง Client Component */}
            <NewsListClient initialNews={tenderData} />
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl opacity-60">📑</span>
            </div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
              ไม่พบข้อมูลประกาศประกวดราคาในขณะนี้
            </p>
            <p className="text-sm mt-1">
              ท่านสามารถตรวจสอบข้อมูลย้อนหลังได้ที่เมนู "ดูประกาศทั้งหมด"
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
