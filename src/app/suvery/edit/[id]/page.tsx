// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from '@/components/SuveryEditForm';
import { Isuvery } from '@/components/Isuvery'; // ตรวจสอบ Path การ Import

// 💡 กำหนด Type สำหรับ Props ที่ถูกต้องของ Server Component
interface EditPageProps {
    params: {
        id: string; // ID ที่มาจาก URL: /suvery/edit/123
    };
    // รวมถึง searchParams เพื่อความสมบูรณ์
    searchParams?: { [key: string]: string | string[] | undefined };
}

// 🚀 ฟังก์ชันดึงข้อมูลแบบสำรวจเดิมจาก API
async function getSuveryById(id: string): Promise<Isuvery | null> {
    if (!id) {
        // ป้องกันการ fetch เมื่อ id เป็น undefined ในระหว่าง pre-render
        console.error("Attempt to fetch with undefined ID.");
        return null;
    }

    // ในระหว่างการพัฒนา (dev) ควรใช้ URL เต็ม หรือใช้เพียง Path (ตามที่คุณใช้) 
    // ถ้าโค้ดรันบน Server (Server Component) การใช้ Path `/api/...` ก็เพียงพอ
    const apiUrl = `/api/suvery/${id}`;

    try {
        const res = await fetch(apiUrl, {
            cache: 'no-store', // เพื่อให้ดึงข้อมูลใหม่เสมอ
        });

        if (!res.ok) {
            // บันทึกสถานะ HTTP error
            console.error(`Failed to fetch suvery details: ${res.status} for ID: ${id}`);
            return null;
        }

        const data = await res.json();
        // สมมติว่า API ตอบกลับเป็น { suvery: Isuvery }
        return data.suvery || null;
    } catch (error) {
        console.error("Error fetching suvery details:", error);
        return null;
    }
}

// 🔑 Server Component: ต้องเป็น async function เพื่อรับ props จาก Next.js
export default async function EditSuveryPage({ params }: EditPageProps) {
    // ดึงค่า id ออกมาโดยตรง
    const { id } = params;

    // เราเพิ่มการป้องกันเพิ่มเติมที่นี่ เพราะ Next.js อาจส่ง undefined มาในระหว่างการ dev
    if (!id) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2>Invalid suvery ID Access</h2>
                <p>The system could not retrieve the dynamic segment ID.</p>
            </div>
        );
    }

    // ดึงข้อมูลเดิมมา
    const suvery = await getSuveryById(id);

    if (!suvery) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2>ไม่พบข้อมูลแบบสำรวจ ID: {id}</h2>
                <p>โปรดตรวจสอบ ID หรือลองใหม่อีกครั้ง</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">แก้ไขแบบสำรวจ</h1>
            <SuveryEditForm suvery={suvery} />
        </div>
    );
}