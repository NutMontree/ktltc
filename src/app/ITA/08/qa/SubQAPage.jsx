import TicketCard from "@/app/(components)/TicketCard";
import Link from "next/link";

const getTickets = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/Tickets`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ Fetch failed: ${res.status} ${res.statusText}`, text);
      throw new Error(`Failed to fetch topics (${res.status})`);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Error loading topics:", error);
    return { tickets: [] };
  }
};

export default async function SubQAPage() {
  const data = await getTickets();
  const tickets = data?.tickets || [];

  if (!tickets.length) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-gray-500">
        <img
          src="/images/ita/avatar.webp"
          alt="no data"
          className="mb-4 w-24 opacity-70"
        />
        <p className="text-lg">ไม่พบข้อมูลในขณะนี้</p>
      </div>
    );
  }

  const uniqueCategories = [
    ...new Set(tickets.map(({ category }) => category)),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
            💬 Q & A และช่องทางรับฟังความคิดเห็น
          </h1>
          <p className="text-gray-500">
            วิทยาลัยเทคนิคกันทรลักษ์ — ร่วมแบ่งปันความคิดเห็นของคุณ
          </p>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-blue-500"></div>
        </div>

        {/* Categories */}
        {uniqueCategories.map((uniqueCategory) => (
          <div
            key={`category-${uniqueCategory}`}
            className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center">
              <img
                src="/images/ita/avatar.webp"
                alt="category"
                className="mr-3 h-12 w-12 rounded-full border border-gray-200"
              />
              <h2 className="text-lg font-semibold text-gray-700">
                {uniqueCategory || "ไม่ระบุหมวดหมู่"}
              </h2>
            </div>

            <div className="space-y-3">
              {tickets
                .filter((ticket) => ticket.category === uniqueCategory)
                .map((filteredTicket, i) => (
                  <TicketCard
                    key={
                      filteredTicket._id || filteredTicket.id || `ticket-${i}`
                    }
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
            <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg">
              <span className="text-xl font-bold">＋</span>
              <span className="font-medium">เพิ่มความคิดเห็นใหม่</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
