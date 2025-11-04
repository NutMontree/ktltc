// import TicketCard from "@/app/(components)/TicketCard";
// import Link from "next/link";
// // 💡 1. Import ฟังก์ชัน Logic สำหรับดึงข้อมูลโดยตรง
// import { getAllTickets } from "@/lib/data"; // (ปรับแก้ Path นี้ ถ้าจำเป็น)

// /**
//  * 💡 2. อัปเดตฟังก์ชัน getTickets
//  * เปลี่ยนจากการ fetch API มาเป็นการเรียกใช้ฟังก์ชัน Server Logic โดยตรง
//  * เพื่อแก้ปัญหา Vercel WAF 403 Forbidden
//  */
// const getTickets = async () => {
//   try {
//     // นี่คือการเรียกใช้ฟังก์ชันบน Server โดยตรง ไม่ผ่าน Network
//     const data = await getAllTickets();
//     return data;
//   } catch (error) {
//     console.error("❌ Error loading topics in Page:", error);
//     // คืนค่าว่างตามโครงสร้างเดิม เพื่อให้ UI ไม่พัง
//     return { tickets: [] };
//   }
// };

// export default async function SubQAPage() {
//   // ดึงข้อมูลด้วยวิธีใหม่
//   const data = await getTickets();
//   const tickets = data?.tickets || [];

//   // --- ส่วนจัดการกรณีไม่มีข้อมูล (เหมือนเดิม) ---
//   if (!tickets.length) {
//     return (
//       <div className="flex h-[60vh] flex-col items-center justify-center text-gray-500">
//         <img
//           src="/images/ita/avatar.webp"
//           alt="no data"
//           className="mb-4 w-24 opacity-70"
//         />
//         <p className="text-lg">ไม่พบข้อมูลในขณะนี้</p>
//       </div>
//     );
//   }

//   // --- 💡 3. ส่วนปรับปรุงประสิทธิภาพ (จัดกลุ่มด้วย reduce) ---
//   const ticketsByCategory = tickets.reduce((acc, ticket) => {
//     // ถ้า category ไม่มีค่า หรือเป็น null/undefined ให้ใช้ค่า default
//     const category = ticket.category || "ไม่ระบุหมวดหมู่";

//     // ถ้ายังไม่มีหมวดหมู่นี้ใน object ให้สร้างเป็น Array ว่างรอไว้
//     if (!acc[category]) {
//       acc[category] = [];
//     }

//     // เพิ่ม ticket เข้าไปใน Array ของหมวดหมู่นั้นๆ
//     acc[category].push(ticket);
//     return acc;
//   }, {}); // ค่าเริ่มต้นคือ Object ว่าง {}

//   // ดึงชื่อหมวดหมู่ทั้งหมดออกมาจาก Object ที่เราสร้าง
//   const categories = Object.keys(ticketsByCategory);

//   // --- 4. ส่วนแสดงผล (Render) ---
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <div className="mx-auto max-w-5xl p-6">
//         {/* Header Section */}
//         <div className="mb-10 text-center">
//           <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
//             💬 Q & A และช่องทางรับฟังความคิดเห็น
//           </h1>
//           <p className="text-gray-500">
//             วิทยาลัยเทคนิคกันทรลักษ์ — ร่วมแบ่งปันความคิดเห็นของคุณ
//           </p>
//           <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-blue-500"></div>
//         </div>

//         {/* Categories (วนลูปจาก categories ที่จัดกลุ่มแล้ว) */}
//         {categories.map((category) => (
//           <div
//             key={`category-${category}`}
//             className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
//           >
//             <div className="mb-4 flex items-center">
//               <img
//                 src="/images/ita/avatar.webp"
//                 alt="category"
//                 className="mr-3 h-12 w-12 rounded-full border border-gray-200"
//               />
//               <h2 className="text-lg font-semibold text-gray-700">
//                 {category} {/* ใช้ชื่อ category จาก key ได้เลย */}
//               </h2>
//             </div>

//             <div className="space-y-3">
//               {/* วนลูป tickets จากหมวดหมู่นั้นๆ (ไม่ต้อง .filter ซ้ำ) */}
//               {ticketsByCategory[category].map((filteredTicket, i) => (
//                 <TicketCard
//                   key={filteredTicket._id || filteredTicket.id || `ticket-${i}`}
//                   id={filteredTicket._id || filteredTicket.id}
//                   ticket={filteredTicket}
//                 />
//               ))}
//             </div>
//           </div>
//         ))}

//         {/* Add New Comment Button */}
//         <div className="mt-10 flex justify-center">
//           <Link href="/TicketPage/new">
//             <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg">
//               <span className="text-xl font-bold">＋</span>
//               <span className="font-medium">เพิ่มความคิดเห็นใหม่</span>
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
import TicketCard from "@/app/(components)/TicketCard";
import Link from "next/link";
// 💡 1. Import ฟังก์ชัน Logic สำหรับดึงข้อมูลโดยตรง
import { getAllTickets } from "@/lib/data"; // (ปรับแก้ Path นี้ ถ้าจำเป็น)

/**
 * 🛠️ แก้ไข: บังคับให้หน้าเว็บโหลดข้อมูลใหม่ทุกครั้ง
 * เพื่อป้องกัน Next.js Cache ทำให้ข้อมูลเป็นปัจจุบันเสมอ
 */
export const dynamic = "force-dynamic"; // 👈 เพิ่มบรรทัดนี้

/**
 * 💡 2. อัปเดตฟังก์ชัน getTickets
 * เปลี่ยนจากการ fetch API มาเป็นการเรียกใช้ฟังก์ชัน Server Logic โดยตรง
 * เพื่อแก้ปัญหา Vercel WAF 403 Forbidden
 */
const getTickets = async () => {
  try {
    // นี่คือการเรียกใช้ฟังก์ชันบน Server โดยตรง ไม่ผ่าน Network
    const data = await getAllTickets();
    return data;
  } catch (error) {
    console.error("❌ Error loading topics in Page:", error);
    // คืนค่าว่างตามโครงสร้างเดิม เพื่อให้ UI ไม่พัง
    return { tickets: [] };
  }
};

export default async function SubQAPage() {
  // ดึงข้อมูลด้วยวิธีใหม่
  const data = await getTickets();
  const tickets = data?.tickets || [];

  // --- ส่วนจัดการกรณีไม่มีข้อมูล (เหมือนเดิม) ---
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

  // --- 💡 3. ส่วนปรับปรุงประสิทธิภาพ (จัดกลุ่มด้วย reduce) ---
  const ticketsByCategory = tickets.reduce((acc, ticket) => {
    // ถ้า category ไม่มีค่า หรือเป็น null/undefined ให้ใช้ค่า default
    const category = ticket.category || "ไม่ระบุหมวดหมู่";

    // ถ้ายังไม่มีหมวดหมู่นี้ใน object ให้สร้างเป็น Array ว่างรอไว้
    if (!acc[category]) {
      acc[category] = [];
    }

    // เพิ่ม ticket เข้าไปใน Array ของหมวดหมู่นั้นๆ
    acc[category].push(ticket);
    return acc;
  }, {}); // ค่าเริ่มต้นคือ Object ว่าง {}

  // ดึงชื่อหมวดหมู่ทั้งหมดออกมาจาก Object ที่เราสร้าง
  const categories = Object.keys(ticketsByCategory);

  // --- 4. ส่วนแสดงผล (Render) ---
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

        {/* Categories (วนลูปจาก categories ที่จัดกลุ่มแล้ว) */}
        {categories.map((category) => (
          <div
            key={`category-${category}`}
            className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-shadow duration-300 hover:shadow-2xl"
          >
            <div className="mb-4 flex items-center">
              <img
                src="/images/ita/avatar.webp"
                alt="category"
                className="mr-3 h-12 w-12 rounded-full border border-gray-200"
              />
              <h2 className="text-lg font-semibold text-gray-700">
                {category} {/* ใช้ชื่อ category จาก key ได้เลย */}
              </h2>
            </div>

            <div className="space-y-3">
              {/* วนลูป tickets จากหมวดหมู่นั้นๆ (ไม่ต้อง .filter ซ้ำ) */}
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
