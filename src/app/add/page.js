// my-projext/src/app/add/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- New Component: Success Modal ---
const SuccessModal = ({ onClose, onNavigate }) => (
    // Backdrop/Overlay: พื้นหลังมืด/เบลอ
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {/* Modal Content */}
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100 ease-out duration-300">
            <svg
                className="mx-auto h-16 w-16 text-green-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                🎉 บันทึกข้อมูลสำเร็จ!
            </h2>
            <p className="text-gray-600 mb-6">
                ข้อมูลถูกบันทึกในระบบเรียบร้อยแล้ว
            </p>
            <button
                onClick={onNavigate} // 💡 เมื่อกดปุ่ม ให้เปลี่ยนหน้าไป Dashboard
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition duration-300 w-full"
            >
                กลับสู่ Dashboard
            </button>
        </div>
    </div>
);


// 2. มีหน้ากรอกข้อมูล POST ส่งข้อมูลไป Mongoose
export default function AddTask() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // 💡 State ใหม่สำหรับควบคุม Modal
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // ป้องกันการกดซ้ำ

    const router = useRouter();

    // ฟังก์ชันนำทางหลังจากปิด Modal
    const handleNavigate = () => {
        router.push('/EmploymentDashboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        setIsSubmitting(true); // เริ่มส่งข้อมูล

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            if (res.ok) {
                // 💡 เปลี่ยนจาก alert เป็นเปิด Modal
                setIsSuccessModalOpen(true);
                // ล้างฟอร์มหลังจากบันทึกสำเร็จ
                setTitle('');
                setDescription('');
            } else {
                throw new Error('Failed to create a task');
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล'); // แจ้งเตือนข้อผิดพลาด
        } finally {
            setIsSubmitting(false); // สิ้นสุดการส่งข้อมูล
        }
    };

    return (
        <>
            <div className="container mx-auto p-4 max-w-lg">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">📝 กรอกข้อมูลใหม่</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        value={title}
                        className="border border-slate-300 px-4 py-3 rounded-lg focus:ring-4 focus:ring-blue-100 outline-none transition duration-150"
                        type="text"
                        placeholder="หัวข้อ (เช่น ตำแหน่งงาน, ชื่อบริษัท)"
                        disabled={isSubmitting}
                    />

                    <textarea
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        className="border border-slate-300 px-4 py-3 rounded-lg h-40 resize-none focus:ring-4 focus:ring-blue-100 outline-none transition duration-150"
                        placeholder="รายละเอียด (เช่น หน้าที่, ข้อมูลติดต่อ)"
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        className={`font-bold py-3 px-6 w-full rounded-lg transition duration-300 mt-4 ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                    <Link href="/EmploymentDashboard" className="text-center text-sm text-gray-500 mt-2 hover:text-blue-600 transition duration-150">
                        ยกเลิกและกลับสู่ Dashboard
                    </Link>
                </form>
            </div>

            {/* 💡 แสดง Modal เมื่อบันทึกสำเร็จ */}
            {isSuccessModalOpen && (
                <SuccessModal
                    onClose={() => setIsSuccessModalOpen(false)}
                    onNavigate={handleNavigate}
                />
            )}
        </>
    );
}