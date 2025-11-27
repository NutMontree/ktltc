import Link from "next/link";
import TicketCard from "@/app/(components)/TicketCard";
// 💡 1. Import ฟังก์ชัน Logic สำหรับดึงข้อมูลโดยตรง
import { getAllTickets } from "@/lib/data";

/**
 * 🛠️ แก้ไข: บังคับให้หน้าเว็บโหลดข้อมูลใหม่ทุกครั้ง
 * เพื่อป้องกัน Next.js Cache ทำให้ข้อมูลเป็นปัจจุบันเสมอ
 */
export const dynamic = "force-dynamic";

/**
 * 💡 2. อัปเดตฟังก์ชัน getTickets
 * เปลี่ยนจากการ fetch API มาเป็นการเรียกใช้ฟังก์ชัน Server Logic โดยตรง
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

  // ✅ 3. [เพิ่มใหม่] เรียงลำดับข้อมูล: ใหม่ -> เก่า (Newest First)
  // สมมติว่าในฐานข้อมูลมี field ชื่อ 'createdAt'
  tickets = tickets.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // --- ส่วนจัดการกรณีไม่มีข้อมูล ---
  if (!tickets.length) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <img
          src="/images/ita/avatar.webp"
          alt="no data"
          className="mb-4 w-24 opacity-70"
        />
        <p className="text-lg">ไม่พบข้อมูลในขณะนี้</p>
      </div>
    );
  }

  // --- 4. จัดกลุ่มด้วย reduce (logic เดิม แต่ข้อมูลถูกเรียงมาแล้ว) ---
  const ticketsByCategory = tickets.reduce((acc, ticket) => {
    const category = ticket.category || "ไม่ระบุหมวดหมู่";

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
    <div className="min-h-screen rounded-3xl bg-linear-to-b to-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">
            💬 Q & A และช่องทางรับฟังความคิดเห็น
          </h1>
          <p className="">
            วิทยาลัยเทคนิคกันทรลักษ์ — ร่วมแบ่งปันความคิดเห็นของคุณ
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-blue-500"></div>
        </div>

        {/* Categories */}
        {categories.map((category) => (
          <div
            key={`category-${category}`}
            className="mb-6 rounded-2xl border p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center">
              <img
                src="/images/ita/avatar.webp"
                alt="category"
                className="mr-3 h-12 w-12 rounded-full border"
              />
              <h2 className="text-lg font-semibold">{category}</h2>
            </div>

            <div className="space-y-3">
              {/* รายการ Tickets จะถูกเรียงตามเวลาเพราะเรา Sort ตั้งแต่ต้นแล้ว */}
              {ticketsByCategory[category].map((filteredTicket, i) => (
                <TicketCard
                  key={filteredTicket._id || filteredTicket.id || `ticket-${i}`}
                  id={filteredTicket._id || filteredTicket.id}
                  ticket={filteredTicket}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Add New Comment Button */}
        <div className="mt-10 flex justify-center">
          <Link href="/TicketPage/new">
            <button className="flex items-center gap-2 rounded-full bg-linear-to-r from-blue-500 to-blue-600 px-6 py-3 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <span className="text-xl font-bold">＋</span>
              <span className="font-medium">เพิ่มความคิดเห็นใหม่</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
