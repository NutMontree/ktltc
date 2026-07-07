import clientPromise from "@/lib/db";
import NewsListClient from "@/components/NewsListClient";
import Link from "next/link";

// ✅ 1. บังคับให้หน้าเว็บดึงข้อมูลใหม่เสมอ (ปิด Cache เพื่อให้เห็นความเคลื่อนไหวล่าสุด)
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
  // ✅ เพิ่ม author เพื่อรองรับการแสดงผลชื่อผู้ลงข่าว
  author?: {
    name: string;
    image?: string;
  };
}

async function getInternshipData(): Promise<NewsItem[]> {
  try {
    const client = await clientPromise;
    const db = client.db("ktltc_db");

    const internshipNews = await db
      .collection("news")
      .find({
        $or: [
          { category: "Internship" },
          { categories: { $in: ["Internship"] } },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(4)
      // ✅ ดึง author มาด้วยโดยไม่ใช้ .project()
      .toArray();

    return JSON.parse(JSON.stringify(internshipNews));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export default async function InternshipPage() {
  const internshipData = await getInternshipData();

  return (
    <main className="mx-auto max-w-[1600px]">
      <div className="py-10">
        {/* --- Header Section (ธีม Emerald เพื่อสื่อถึงความสดใหม่และการเรียนรู้) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-200 pb-8 dark:border-slate-800 w-full">
          {/* ส่วนข้อความ (ชิดซ้ายสุด) */}
          <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px] md:text-xs dark:text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Experience & Training
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white leading-tight">
              นักศึกษาออก{" "}
              <span className="text-emerald-600 dark:text-emerald-500">
                ฝึกประสบการณ์
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-lg dark:text-slate-400 font-medium">
              ข่าวสารการฝึกงาน การนิเทศ และความร่วมมือกับสถานประกอบการ
            </p>
          </div>

          {/* ส่วนปุ่ม (ชิดขวาสุด) */}
          <Link
            href="/news?category=Internship"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 group dark:shadow-none dark:bg-emerald-500 whitespace-nowrap"
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
            <span>ดูทั้งหมด</span>
          </Link>
        </div>

        {/* --- Grid Content --- */}
        {internshipData.length > 0 ? (
          <div className="[&_.mb-16.bg-white\/70]:hidden [&_.mb-16.dark\:bg-slate-900\/80]:hidden">
            <NewsListClient initialNews={internshipData} hideFourthOnLg={true} />
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800 dark:bg-slate-900/20">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl opacity-60">🌿</span>
            </div>
            <p className="text-xl font-bold text-slate-600 dark:text-slate-300">
              ยังไม่มีข้อมูลการฝึกประสบการณ์ในขณะนี้
            </p>
            <p className="text-sm mt-1">
              ข้อมูลจะถูกอัปเดตเมื่อนักศึกษาเริ่มออกฝึกงานในสถานประกอบการ
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
