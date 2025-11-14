// server
import TaskList from '@/components/TaskList';
import survey from '@/app/survey/page'
import Link from 'next/link';
export const dynamic = 'force-dynamic';

const getTasks = async () => {

    const API_URL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api/tasks'
        : '/api/tasks';

    try {
        const res = await fetch(API_URL, {
            // cache: 'no-store', // เพื่อให้ข้อมูลอัปเดตล่าสุดเสมอ (ทำให้หน้านี้เป็น Dynamic)
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`❌ Failed to fetch tasks: Status ${res.status}, Body: ${errorText}`);
            throw new Error('Failed to fetch tasks');
        }

        return res.json();
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error loading tasks:', error.message);
        } else {
            console.error('❌ An unknown error occurred:', error);
        }


        return { tasks: [] };
    }
};

const getServery = async () => {
    const API_URL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/api/survey'
        : '/api/survery';
}

export default async function EmploymentDashboard() {
    const { tasks } = await getTasks();

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">✅ ข้อมูลที่ถูกบันทึก (Dashboard)</h1>
                <Link
                    href="/add"
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
                >
                    ➕ กรอกข้อมูลใหม่
                </Link>
            </div>

            {tasks.length > 0 ? (
                <TaskList tasks={tasks} />
            ) : (
                <p className="text-center text-gray-500 text-lg p-10 border border-dashed rounded-lg">
                    ยังไม่มีข้อมูลในระบบ ลองกรอกข้อมูลใหม่ดูสิ!
                </p>
            )}
        </div>
    );
}