// my-projext/src/app/add/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 2. มีหน้ากรอกข้อมูล POST ส่งข้อมูลไป Mongoose
export default function AddTask() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            if (res.ok) {
                alert('บันทึกข้อมูลสำเร็จ!');
                router.push('/EmploymentDashboard');
            } else {
                throw new Error('Failed to create a task');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 กรอกข้อมูลใหม่</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white p-6 rounded-lg shadow-md border">
                <input
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className="border border-slate-500 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    type="text"
                    placeholder="หัวข้อ"
                />

                <textarea
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    className="border border-slate-500 px-4 py-2 rounded-md h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="รายละเอียด"
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-3 px-6 w-fit rounded-lg hover:bg-blue-700 transition duration-300 mt-4"
                >
                    บันทึกข้อมูล
                </button>
                <Link href="/EmploymentDashboard" className="text-center text-sm text-gray-500 mt-2 hover:underline">
                    กลับสู่ Dashboard
                </Link>
            </form>
        </div>
    );
}