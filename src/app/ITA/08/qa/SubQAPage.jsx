import Link from "next/link";
import TicketCard from "@/app/(components)/TicketCard";
import { getAllTickets } from "@/lib/data";
import { MessageCircle, Plus, Layers, Inbox } from "lucide-react"; // แนะนำให้ลง lucide-react เพิ่มเพื่อ icon สวยๆ

/**
 * 🛠️ แก้ไข: บังคับให้หน้าเว็บโหลดข้อมูลใหม่ทุกครั้ง
 */
export const dynamic = "force-dynamic";

/**
 * 💡 2. อัปเดตฟังก์ชัน getTickets
 */
const getTickets = async () => {
  try {
    const data = await getAllTickets();
    return data;
  } catch (error) {
    console.error("❌ Error loading topics in Page:", error);
    return { tickets: [] };
  }
};

export default async function SubQAPage() {
  // ดึงข้อมูล
  const data = await getTickets();
  let tickets = data?.tickets || [];

  // ✅ 3. เรียงลำดับข้อมูล: ใหม่ -> เก่า
  tickets = tickets.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // --- ส่วนจัดการกรณีไม่มีข้อมูล ---
  if (!tickets.length) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center rounded-3xl bg-slate-50/50">
        <div className="flex flex-col items-center rounded-2xl bg-white p-10 text-center shadow-xl shadow-slate-200/50">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Inbox size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-slate-700">
            ยังไม่มีข้อมูลในขณะนี้
          </h3>
          <p className="mt-2 text-slate-500">
            มาร่วมเป็นคนแรกในการแสดงความคิดเห็นกันเถอะ
          </p>
          <Link href="/TicketPage/new" className="mt-8">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-blue-600/40">
              <Plus size={20} />
              <span>สร้างรายการใหม่</span>
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // --- 4. จัดกลุ่มด้วย reduce ---
  const ticketsByCategory = tickets.reduce((acc, ticket) => {
    const category = ticket.category || "อื่นๆ";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(ticket);
    return acc;
  }, {});

  // ดึงชื่อหมวดหมู่
  const categories = Object.keys(ticketsByCategory);

  // --- 5. ส่วนแสดงผล (Render) ---
  return (
    <div className="min-h-screen rounded-3xl font-sans text-slate-800">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl filter" />
        <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-100/40 blur-3xl filter" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-600 uppercase">
            Community Feedback
          </span>
          <h1 className="mb-4 flex justify-center gap-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            <span className="text-black dark:text-blue-100">Q & A</span>
            <span className="text-blue-600">รับฟังความคิดเห็น</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-50">
            พื้นที่สำหรับนักศึกษาและบุคลากร วิทยาลัยเทคนิคกันทรลักษ์
            <br className="hidden md:block" />
            ร่วมสอบถามและแบ่งปันข้อเสนอแนะเพื่อการพัฒนาที่ดียิ่งขึ้น
          </p>
        </div>

        {/* Categories Grid/List */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div
              key={`category-${category}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-1 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60"
            >
              {/* Category Header Bar */}
              <div className="relative flex items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4 backdrop-blur-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  {/* ใช้ Icon หรือรูปภาพ */}
                  <Layers size={24} />
                  {/* ถ้าจะใช้รูปเดิมให้ uncomment บรรทัดล่าง แล้วลบ Layers ออก */}
                  {/* <img src="/images/ita/avatar.webp" alt="icon" className="h-8 w-8 object-cover opacity-80" /> */}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {category}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {ticketsByCategory[category].length} รายการ
                  </p>
                </div>
              </div>

              {/* Tickets List Area */}
              <div className="space-y-4 bg-white p-4 md:p-6">
                {ticketsByCategory[category].map((filteredTicket, i) => (
                  <div
                    key={
                      filteredTicket._id || filteredTicket.id || `ticket-${i}`
                    }
                    className="transition-transform duration-200 hover:translate-x-1"
                  >
                    <TicketCard
                      id={filteredTicket._id || filteredTicket.id}
                      ticket={filteredTicket}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button (Sticky Bottom on Mobile, Regular on Desktop) */}
        <div className="flex justify-center pt-24">
          <Link href="/TicketPage/new">
            <button className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-slate-900 px-6 py-4 text-white shadow-2xl shadow-slate-900/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:shadow-blue-600/40 active:scale-95">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30">
                <Plus size={20} strokeWidth={3} />
              </span>
              <span className="pr-2 text-base font-bold tracking-wide">
                เพิ่มความคิดเห็น
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
