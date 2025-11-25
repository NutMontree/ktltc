// src/app/EmploymentDashboard/page.tsx

import SuveryList from "@/components/SuveryList";
import Link from "next/link";
// ⚠️ ตรวจสอบ path ของ Isuvery ให้ตรงกับที่คุณเก็บไฟล์ไว้
import { Isuvery } from "@/components/Isuvery";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ✅ 1. กำหนด Interface ให้ searchParams เป็น Promise (Next.js 15 Requirement)
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getsuverys = async () => {
  try {
    const apiUrl = `${BASE_URL}/api/suvery`;
    console.log(`📡 Fetching data from: ${apiUrl}`);

    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(
        `Failed to fetch data: ${res.status} ${res.statusText}. Response body: ${errorBody}`,
      );
    }
    return res.json();
  } catch (error) {
    console.error("❌ Error loading suvery:", (error as Error).message);
    return { suverys: [] };
  }
};

// ✅ 2. รับ props แบบ PageProps
export default async function EmploymentDashboard(props: PageProps) {
  // ✅ 3. ต้อง await searchParams ก่อนใช้งานเสมอ ใน Next.js 15
  const searchParams = await props.searchParams;
  const query = searchParams?.q;

  // ดึงข้อมูล
  const suverysData = await getsuverys();
  let suverys: Isuvery[] = suverysData?.suverys || [];

  // เรียงลำดับ (ล่าสุดขึ้นก่อน)
  if (suverys.length > 0) {
    suverys = suverys.reverse();
  }

  // ✅ 4. Logic การค้นหาที่ปลอดภัย (ป้องกัน Error ถ้าข้อมูลใน DB เป็น null)
  if (query && typeof query === "string") {
    const lowerQuery = query.toLowerCase().trim();

    suverys = suverys.filter((item) => {
      // ใช้ || "" เพื่อแปลง null/undefined เป็น string ว่างก่อน .toLowerCase()
      const fullName = (item.fullName || "").toLowerCase();
      const studentId = (item.studentId || "").toLowerCase();

      return fullName.includes(lowerQuery) || studentId.includes(lowerQuery);
    });
  }

  return (
    <div className="min-h-screen bg-white/50 py-16 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-orange-200 pb-6 md:flex-row md:items-center dark:border-orange-800">
          <h1 className="flex items-center text-3xl font-extrabold tracking-tight text-green-900 sm:text-4xl dark:text-green-100">
            <svg
              className="mr-3 h-8 w-8 text-orange-500 drop-shadow-sm sm:h-10 sm:w-10 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19V6l12-3v14M9 19h12M9 19c-1.333 0-2-1.333-2-2 0-1.333 0-2 2-2M21 5c-1.333 0-2-1.333-2-2 0-1.333 0-2 2-2"
              ></path>
            </svg>
            Dashboard ข้อมูลแบบสำรวจ
          </h1>

          <Link
            href="/suvery"
            className="inline-flex w-full transform items-center justify-center rounded-xl border border-transparent bg-green-500 px-6 py-3 text-base font-semibold text-white shadow-xl drop-shadow-md transition duration-300 hover:scale-[1.03] hover:bg-green-600 focus:ring-4 focus:ring-orange-400 focus:ring-offset-2 focus:outline-none active:scale-[0.98] md:w-auto dark:bg-green-600 dark:hover:bg-green-500 dark:focus:ring-orange-800"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            กรอกแบบสำรวจใหม่
          </Link>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div>
          <h2 className="mb-8 border-b border-green-100 pb-4 text-3xl font-bold text-gray-900 dark:border-green-800 dark:text-gray-100">
            รายการข้อมูลที่ถูกบันทึก
            <span className="ml-2 text-lg text-orange-600 dark:text-orange-400">
              ({suverys.length})
            </span>
          </h2>

          {suverys && suverys.length > 0 ? (
            <SuveryList suverys={suverys} isLoading={false} isError={false} />
          ) : (
            // --- EMPTY STATE ---
            <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 p-12 text-center shadow-inner transition duration-500 hover:border-orange-500 dark:border-orange-700 dark:bg-gray-800/50 dark:hover:border-orange-500">
              <svg
                className="mx-auto h-14 w-14 text-orange-400 dark:text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 13h6m-3-3v6m-9 1-2 2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                ></path>
              </svg>

              <h3 className="mt-4 text-xl font-semibold text-green-900 dark:text-green-300">
                {query
                  ? `ไม่พบข้อมูลที่ตรงกับ "${query}"`
                  : "ยังไม่มีข้อมูลแบบสำรวจ"}
              </h3>

              <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                {query
                  ? "ลองตรวจสอบคำสะกด หรือค้นหาด้วยคำสำคัญอื่น"
                  : "ลองเพิ่มข้อมูลแบบสำรวจใหม่เพื่อเริ่มต้นใช้งาน"}
              </p>

              {!query && (
                <div className="mt-8">
                  <Link
                    href="/suvery"
                    className="inline-flex items-center rounded-full border border-green-500 bg-white px-6 py-3 text-base font-medium text-green-700 shadow-sm transition duration-300 hover:bg-green-50 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none dark:border-green-400 dark:bg-gray-800 dark:text-green-300 dark:hover:bg-gray-700"
                  >
                    กรอกข้อมูลแบบสำรวจ
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
