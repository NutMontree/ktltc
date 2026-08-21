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
      // เราอาจจะดึงมาเยอะกว่า 10 สำหรับหน้าดูทั้งหมด หรือดึงทั้งหมดเลยถ้าใช้ Pagination
      .limit(20) 
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
    <main className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="py-10">
        {/* --- Header Section (ธีม Emerald เพื่อสื่อถึงความสดใหม่และการเรียนรู้) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6 border-b border-slate-200 pb-6 dark:border-slate-800 w-full">
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
        </div>

        {/* --- Grid Content --- */}
        {internshipData.length > 0 ? (
          <div className="w-full mt-10">
            <NewsListClient initialNews={internshipData} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-200 text-slate-400 dark:border-slate-800 dark:bg-slate-900/20 mt-10">
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
