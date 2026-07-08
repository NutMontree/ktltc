import Link from "next/link";
import Image from "next/image";
import clientPromise from "@/lib/db";

// Interface ของข่าว
interface NewsItem {
  _id: string;
  title: string;
  category?: string; // รองรับข้อมูลเก่า
  categories?: string[]; // รองรับข้อมูลใหม่
  images?: string[];
  createdAt: string;
}

// ฟังก์ชันดึงข่าวล่าสุด 6 รายการ
async function getLatestNews(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");
    const news = await db
      .collection("news")
      .find({})
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .limit(6) // เอาแค่ 6 อัน
      .toArray();
    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// ฟังก์ชันแปลงหมวดหมู่เป็น Label ภาษาไทย (Optional)
const getCategoryLabel = (val: string) => {
  const map: Record<string, string> = {
    PR: "ข่าวประชาสัมพันธ์",
    Newsletter: "จดหมายข่าว",
    Internship: "ฝึกประสบการณ์",
    Announcement: "ข่าวประกาศ",
    Bidding: "ประกวดราคา",
    Order: "คำสั่งวิทยาลัย",
  };
  return map[val] || val;
};

export default async function HomePage() {
  const latestNews = await getLatestNews();

  return (
    <main className="max-w-[1600px] mx-auto bg-slate-50  text-slate-800">
      {/* --- Hero Section (แบนเนอร์ส่วนหัว) --- */}
      <section className="relative w-full h-100 md:h-125 bg-slate-900 overflow-hidden flex items-center justify-center text-center px-4">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent z-10"></div>
        {/* ใส่รูป Background จริงๆ ตรงนี้ได้ (ถ้ามี) */}
        <div className="absolute inset-0 opacity-30">
          {/* <Image src="/path/to/hero-bg.jpg" fill className="object-cover" alt="Hero BG" /> */}
          {/* Fallback pattern */}
          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        <div className="relative z-20 max-w-[1600px] mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30 text-sm font-bold tracking-wide uppercase">
            Welcome to KTLTC
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            วิทยาลัยเทคนิค<span className="text-blue-500">กันทรลักษ์</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light">
            มุ่งเน้นสร้างสรรค์นวัตกรรมและเทคโนโลยี
            เพื่อพัฒนาผู้เรียนสู่ความเป็นเลิศทางวิชาชีพ
          </p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link
              href="/news"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/50"
            >
              ดูข่าวทั้งหมด
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 /10 hover:/20 text-white border border-white/20 rounded-full font-bold transition-all backdrop-blur-sm"
            >
              เกี่ยวกับเรา
            </Link>
          </div>
        </div>
      </section>

      {/* --- Latest News Section --- */}
      <section className="py-16md:py-24 max-w-[1600px] mx-auto md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              ข่าวประชาสัมพันธ์ล่าสุด
            </h2>
            <p className="text-slate-500 mt-2 ml-4">
              อัปเดตข้อมูลข่าวสารและกิจกรรมล่าสุดของวิทยาลัย
            </p>
          </div>
          <Link
            href="/news?category=PR"
            className="group flex items-center gap-2 text-blue-600 font-bold hover:underline"
          >
            ดูข่าวทั้งหมด
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
          </Link>
        </div>

        {/* Grid ข่าว */}
        {latestNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news) => {
              // จัดการหมวดหมู่ (รองรับ Array และ String)
              const categoryToShow =
                news.categories && news.categories.length > 0
                  ? news.categories[0]
                  : news.category || "ทั่วไป";

              return (
                <Link
                  key={news._id}
                  href={`/news/${news._id}`}
                  className="group  rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <Image
                      src={news.images?.[0] || "/no-image.png"}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 /95 backdrop-blur text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                        {getCategoryLabel(categoryToShow)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(news.createdAt).toLocaleDateString("th-TH", {
                        timeZone: "Asia/Bangkok",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-relaxed mb-4 group-hover:text-blue-600 transition-colors">
                      {news.title}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center text-slate-400 text-sm group-hover:text-blue-600 font-medium transition-colors">
                      อ่านเพิ่มเติม
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <p className="text-slate-400">ยังไม่มีข่าวสารในขณะนี้</p>
          </div>
        )}
      </section>
    </main>
  );
}
