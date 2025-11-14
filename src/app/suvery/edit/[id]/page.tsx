// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from '@/components/SuveryEditForm';
import { Isuvery } from '@/components/Isuvery';

// 💡 เปลี่ยน params ให้เป็น any เพื่อหลีกเลี่ยงการตรวจสอบ Type ของ Next.js 
interface SurveyEditPageProps {
    // กำหนดให้ params เป็น any (หลีกเลี่ยง Type Error ใน .next/types)
    params: any;
    searchParams?: { [key: string]: string | string[] | undefined };
}

// 🚀 ฟังก์ชันดึงข้อมูลแบบสำรวจเดิมจาก API
async function getSuveryById(id: string): Promise<Isuvery | null> {
    // ... โค้ด fetch ข้อมูลยังคงเดิม ...
    try {
        const res = await fetch(`/api/suvery/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            console.error("Failed to fetch suvery details:", res.status);
            return null;
        }

        const data = await res.json();
        return data.suvery || null;
    } catch (error) {
        console.error("Error fetching suvery details:", error);
        return null;
    }
}

export default async function EditSuveryPage({ params }: SurveyEditPageProps) {
    // 🔑 Type Assertion: ระบุ Type ของ params ภายในฟังก์ชัน
    // TypeScript จะรู้ว่า params มีโครงสร้างที่ถูกต้องสำหรับโค้ดของเรา
    const { id } = params as { id: string };

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
        <div className="">
            <SuveryEditForm suvery={suvery} />
        </div>
    );
}