// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from '@/components/SuveryEditForm';
import { Isuvery } from '@/components/Isuvery'; // ตรวจสอบ Path การ Import

// 💡 กำหนด Type สำหรับ Props ที่มาจาก Dynamic Route
interface EditPageProps {
    params: {
        id: string; // ID ที่มาจาก URL: /suvery/edit/123
    };
}

// 🚀 ฟังก์ชันดึงข้อมูลแบบสำรวจเดิมจาก API
async function getSuveryById(id: string): Promise<Isuvery | null> {
    try {
        // 💡 เรียกใช้ GET API Route ของคุณ โดยใช้ ID ใน Query Parameter
        const res = await fetch(`http://localhost:3000/api/suvery/${id}`, {
            cache: 'no-store', // เพื่อให้ดึงข้อมูลใหม่เสมอ
        });

        if (!res.ok) {
            console.error("Failed to fetch suvery details:", res.status);
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

export default async function EditSuveryPage({ params }: EditPageProps) {
    const { id } = await params;

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
        <div className=" ">


            {/* 💡 ส่งข้อมูลเดิมและ ID ให้ Form Component */}
            <SuveryEditForm suvery={suvery} />
        </div>
    );
}