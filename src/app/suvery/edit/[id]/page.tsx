// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from '@/components/SuveryEditForm';
import { Isuvery } from '@/components/Isuvery';
import { unstable_noStore as noStore } from 'next/cache'; // 💡 ต้อง Import ตัวนี้กลับมา
import mongoose from "mongoose";

// -----------------------------------------------------------------
// 💡 INTERFACES/TYPES (คงเดิม)
// -----------------------------------------------------------------

interface EditPageProps {
    params: {
        id: string;
    };
    searchParams?: { [key: string]: string | string[] | undefined };
}

// -----------------------------------------------------------------
// 🚀 ฟังก์ชันดึงข้อมูลแบบสำรวจเดิมจาก API (ต้องเป็น async)
// -----------------------------------------------------------------
async function getSuveryById(id: string): Promise<Isuvery | null> {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        console.error("Invalid or missing ID provided.");
        return null;
    }

    // ใช้ Path Parameter
    const apiUrl = `/api/suvery/${id}`;

    try {
        const res = await fetch(apiUrl, {
            cache: 'no-store', // เพื่อให้ดึงข้อมูลใหม่เสมอ
        });

        if (!res.ok) {
            console.error(`Failed to fetch suvery details: ${res.status} for ID: ${id}`);
            return null;
        }

        const data = await res.json();
        return data.suvery || null;
    } catch (error) {
        console.error("Error fetching suvery details:", error);
        return null;
    }
}

// -----------------------------------------------------------------
// 🔑 Server Component: EditSuveryPage (ต้องมี 'async' เสมอ)
// -----------------------------------------------------------------
export default async function EditSuveryPage({ params }: EditPageProps) {
    // 🛑 ส่วนที่สำคัญที่สุด: บังคับให้รันในโหมด Dynamic
    noStore();

    // ✅ Next.js จะ Resolve params ให้เมื่อเรียกใช้ noStore()
    const { id } = params;

    // ✅ ใช้ await เพื่อรอการดึงข้อมูล
    const suvery = await getSuveryById(id);

    if (!suvery) {
        return (
            <div className="p-8 text-center bg-white min-h-[40vh] shadow-lg rounded-xl flex flex-col justify-center items-center">
                <h2 className="text-3xl font-extrabold text-red-600 mb-2">ไม่พบข้อมูลแบบสำรวจ 🙁</h2>
                <p className="text-gray-500">รหัสที่ท่านต้องการแก้ไข: <span className="font-mono bg-gray-100 p-1 rounded text-sm">{id || "N/A"}</span></p>
                <a
                    href="/EmploymentDashboard"
                    className="mt-6 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                    กลับไปหน้าแสดงรายการ
                </a>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <h1 className="text-4xl font-extrabold mb-8 text-violet-800 border-b pb-4">✏️ แก้ไขข้อมูลแบบสำรวจ</h1>
            <SuveryEditForm suvery={suvery} />
        </div>
    );
}