// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from "@/components/SuveryEditForm"; // ต้องมั่นใจว่าไฟล์นี้มีอยู่จริง
import connectDB from "@/lib/mongodb";
import Suvery from "@/lib/models/suvery";
import { Types } from "mongoose";
import Link from "next/link";

// 💡 บังคับให้เป็น Dynamic Page (ไม่ Cache)
export const dynamic = "force-dynamic";

interface EditPageProps {
  params: {
    id: string;
  };
}

// 🚀 ฟังก์ชันดึงข้อมูลจาก DB โดยตรง (เร็วกว่า fetch)
async function getSuveryById(encodedId: string) {
  try {
    await connectDB();

    // 1. 🔓 ถอดรหัส Base64 (เพราะ SuveryList ส่งมาแบบ encoded)
    // ถ้า encodedId ไม่ใช่ Base64 ที่ถูกต้อง อาจจะ error ได้ เลยต้อง try-catch หรือระวังตรงนี้
    let id = encodedId;
    try {
      id = atob(encodedId);
    } catch (e) {
      console.warn("ID might not be base64 encoded, using as is.");
    }

    // 2. ตรวจสอบความถูกต้องของ ObjectId
    if (!Types.ObjectId.isValid(id)) {
      console.error("Invalid ObjectId:", id);
      return null;
    }

    // 3. Query ข้อมูล
    const suveryData = await Suvery.findById(id).lean();

    if (!suveryData) return null;

    // 4. แปลง ObjectId และ Date เป็น String เพื่อส่งให้ Client Component
    return JSON.parse(JSON.stringify(suveryData));
  } catch (error) {
    console.error("Error fetching suvery details:", error);
    return null;
  }
}

export default async function EditSuveryPage({ params }: EditPageProps) {
  // ✅ Next.js 15 Support: await params ก่อนใช้งาน
  const { id } = await params;

  // ดึงข้อมูล
  const suvery = await getSuveryById(id);

  // ❌ กรณีไม่พบข้อมูล
  if (!suvery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            ไม่พบข้อมูลแบบสำรวจ
          </h2>
          <p className="mb-6 break-all text-gray-500 dark:text-gray-400">
            รหัสอ้างอิง:{" "}
            <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-red-500 dark:bg-gray-700">
              {id}
            </span>
          </p>
          <Link
            href="/EmploymentDashboard"
            className="inline-block w-full rounded-xl bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            กลับไปหน้า Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ✅ กรณีพบข้อมูล: แสดงฟอร์มแก้ไข
  return (
    <div className="min-h-screen bg-gray-50 py-12 transition-colors duration-300 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold text-green-800 dark:text-green-400">
              <span className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
              </span>
              แก้ไขข้อมูลแบบสำรวจ
            </h1>
            <p className="ml-1 mt-2 text-gray-600 dark:text-gray-400">
              แก้ไขข้อมูลของ:{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {suvery.fullName}
              </span>{" "}
              ({suvery.studentId})
            </p>
          </div>

          <Link
            href="/EmploymentDashboard"
            className="self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 md:self-center"
          >
            ← ย้อนกลับ
          </Link>
        </div>

        {/* ส่งข้อมูล suvery prop เข้าไปที่ฟอร์ม */}
        <SuveryEditForm suvery={suvery} />
      </div>
    </div>
  );
}
