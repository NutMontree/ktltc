import TaskList from '@/components/TaskList';
import Link from 'next/link';

// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมด
const getTasks = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/tasks', {
            cache: 'no-store',
        });

        if (!res.ok) {
            // ... (โค้ดจัดการ error)
        }

        return res.json();
    } catch (error) { // <--- ตรงนี้คือที่เกิดปัญหา
        // 💡 การแก้ไข: Type Check ก่อนใช้งาน
        if (error instanceof Error) {
            console.error('❌ Error loading tasks:', error.message);
        } else {
            // จัดการกับ error ชนิดอื่นๆ ที่ไม่ใช่ Error object
            console.error('❌ An unknown error occurred:', error);
        }

        return { tasks: [] };
    }
};

// 1. มีหน้า dashbord เพื่อแสดงข้อมูลทั้งหมดที่ผู้ใช้งานกรอกข้อมูล
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