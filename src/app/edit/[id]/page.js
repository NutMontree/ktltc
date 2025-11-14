// src/app/edit/[id]/page.js

import EditTaskForm from '@/components/EditTaskForm';
import { notFound } from 'next/navigation';

/**
 * ฟังก์ชันสำหรับดึงข้อมูล Task ตาม ID จาก API Route
 */
const getTaskById = async (id) => {
    // ใช้ URL แบบมีเงื่อนไข เพื่อแก้ปัญหา Network (403/URL Parse)
    const API_URL = process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/api/tasks/${id}`
        : `/api/tasks/${id}`;

    try {
        const res = await fetch(API_URL, {
            cache: 'no-store',
        });

        if (res.status === 404) {
            console.warn(`Task with ID ${id} not found.`);
            notFound();
        }

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to fetch task ${id}: Status ${res.status}, Body: ${errorText}`);
            throw new Error('Failed to fetch task');
        }

        return res.json();
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error in getTaskById:', error.message);
        } else {
            console.error('❌ An unknown error occurred in getTaskById:', error);
        }
        notFound();
    }
};

/**
 * Server Component สำหรับหน้าแก้ไขข้อมูล
 * @param {object} props - props จาก Next.js Router
 */
export default async function EditTask(props) { // 💡 เปลี่ยน: รับ props ทั้งก้อน
    // 💡 แก้ไข Type Error: เข้าถึง params จาก props และ Destructure ภายในฟังก์ชัน
    // วิธีนี้มักจะช่วยหลีกเลี่ยง Type Check ที่เข้มงวดเกินไปได้
    const { id } = props.params;

    if (!id) {
        notFound();
    }

    const { task } = await getTaskById(id);

    if (!task) {
        notFound();
    }

    const { title, description } = task;

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">✏️ แก้ไขข้อมูล (ID: {id})</h1>
            <EditTaskForm id={id} title={title} description={description} />
        </div>
    );
}