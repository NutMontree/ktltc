// server
import TaskList from '@/components/TaskList';
import SuveryList from '@/components/SuveryList';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

// ฟังก์ชันสำหรับดึงข้อมูล Tasks
// const getTasks = async () => {

//     const API_URL = process.env.NODE_ENV === 'development'
//         ? 'http://localhost:3000/api/tasks'
//         : '/api/tasks';

//     try {
//         const res = await fetch(API_URL, {
//             // cache: 'no-store', // เพื่อให้ข้อมูลอัปเดตล่าสุดเสมอ (ทำให้หน้านี้เป็น Dynamic)
//         });

//         if (!res.ok) {
//             const errorText = await res.text();
//             console.error(`❌ Failed to fetch tasks: Status ${res.status}, Body: ${errorText}`);
//             throw new Error('Failed to fetch tasks');
//         }

//         return res.json();
//     } catch (error) {
//         if (error instanceof Error) {
//             console.error('❌ Error loading tasks:', error.message);
//         } else {
//             console.error('❌ An unknown error occurred:', error);
//         }

//         // คืนค่าอาร์เรย์ว่างในกรณีเกิดข้อผิดพลาด เพื่อให้การ Destructure ในคอมโพเนนต์ใช้งานได้
//         return { tasks: [] };
//     }
// };

// ฟังก์ชันสำหรับดึงข้อมูล Surveys (suverys)
const getsuverys = async () => {
    const API_URL = process.env.NODE_ENV === 'development'
        // ? 'http://localhost:3000/api/suvery'
        ? 'https://ktltc.vercel.app/api/suvery'
        : '/api/suvery';

    try {
        const res = await fetch(API_URL, {

        });

        if (!res.ok) {
            const error = await res.text()
            console.error(`❌ Failed to fetch survery: Status ${res.status}, Body: ${error}`);
            throw new Error('Failed to fetch survery');
        }

        return res.json();
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error loading survery:', error.message);
        } else {
            console.error('❌ An unknown error occurred:', error);
        }

        // 💡 แก้ไขแล้ว: คืนค่า key เป็น 'suverys' (พหูพจน์) เพื่อให้ตรงกับการ Destructure ในคอมโพเนนต์
        return { suverys: [] };
    }
}

export default async function EmploymentDashboard() {
    // การ Destructure จะทำงานได้อย่างถูกต้อง แม้ว่าการ Fetch จะล้มเหลว
    // const { tasks } = await getTasks();
    const { suverys } = await getsuverys();

    return (
        <>
            {/* <div className="container mx-auto p-4">
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
            </div> */}

            <div className='pt-24'>
                <div>
                    <Link
                        href="/suvery"
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        ➕ กรอกข้อมูลใหม่
                    </Link>
                </div>

                {suverys.length > 0 ? (
                    <SuveryList suverys={suverys} />
                ) : (
                    <p className="text-center text-gray-500 text-lg p-10 border border-dashed rounded-lg">
                        ยังไม่มีข้อมูลแบบสำรวจในระบบ ลองกรอกข้อมูลใหม่ดูสิ!
                    </p>
                )}
            </div>
        </>
    );
}