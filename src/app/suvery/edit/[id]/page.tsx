// src/app/suvery/edit/[id]/page.tsx

import SuveryEditForm from '@/components/SuveryEditForm';
import { Isuvery } from '@/components/Isuvery'; // Import Interface

// 💡 กำหนด Type สำหรับ Props ที่มาจาก Dynamic Route
interface EditPageProps {
    params: {
        id: string; // ID ที่มาจาก URL: /suvery/edit/123
    };
}

// 🚀 ฟังก์ชันดึงข้อมูลแบบสำรวจเดิมจาก API
async function getSuveryById(id: string): Promise<Isuvery | null> {
    try {
        // 💡 เรียกใช้ GET API Route (Dynamic Path)
        // 🚨 สำคัญ: URL ต้องถูกต้อง
        const res = await fetch(`/api/suvery/${id}`, {
            cache: 'no-store', // เพื่อให้ดึงข้อมูลใหม่เสมอ
        });

        if (!res.ok) {
            console.error("Failed to fetch suvery details:", res.status);
            return null;
        }

        const data = await res.json();
        // 💡 เราต้องกำหนด type ให้ _id เป็น string
        return data.suvery ? { ...data.suvery, _id: data.suvery._id } as Isuvery : null;
    } catch (error) {
        console.error("Error fetching suvery details:", error);
        return null;
    }
}

// ✅ แก้ไข: เราใช้การ Destructuring ที่รอบคอบขึ้น
export default async function EditSuveryPage(props: EditPageProps) {
    // 💡 เข้าถึง params ผ่าน props ก่อน Destructure
    const { id } = props.params;

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
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-violet-700 mb-6">✏️ แก้ไขข้อมูลแบบสำรวจ</h1>
            <SuveryEditForm suvery={suvery} />
        </div>
    );
}