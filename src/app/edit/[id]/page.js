// src/app/edit/[id]/page.js

import EditTaskForm from '@/components/EditTaskForm';
import { notFound } from 'next/navigation';

/**
 * ฟังก์ชันสำหรับดึงข้อมูล Task ตาม ID จาก API Route
 * @param {string} id - ObjectID ของ Task ที่ต้องการแก้ไข
 * @returns {Promise<object>} ข้อมูล Task
 */
const getTaskById = async (id) => {
    // 💡 แก้ไข: ใช้ URL เต็มใน Development แต่ใช้ Path ภายในใน Production
    const API_URL = process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/api/tasks/${id}`
        : `/api/tasks/${id}`;

    try {
        const res = await fetch(API_URL, {
            cache: 'no-store', // เพื่อให้ข้อมูลอัปเดตล่าสุด
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
 * @param {object} props.params - พารามิเตอร์ของ Dynamic Route (มี id)
 */
export default async function EditTask({ params }) {
    // 💡 แก้ไข: ใช้ Destructure โดยตรง ซึ่งเป็นวิธีที่ถูกต้องที่สุด
    const { id } = params;

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