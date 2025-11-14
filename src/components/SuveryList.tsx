// src/components/SuveryList.tsx

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { HiPencilAlt, HiOutlineTrash, HiEye } from "react-icons/hi";
import SuveryDetailModal from './SuveryDetailModal';
// 💡 Casing Conflict (Error 1261): ต้องแน่ใจว่าชื่อไฟล์ Modal คือ 'SuveryDetailModal.tsx'
// import SuveryDetailModal from './SuveryDetailModal';


// -----------------------------------------------------------------
// 💡 INTERFACES/TYPES
// -----------------------------------------------------------------

// 💡 แก้ไข: เพิ่ม Field ที่ขาดหายไปตามที่ SuveryDetailModal คาดหวัง
export interface Isuvery {
    _id: string;
    roomId: String;
    studentId: string;
    fullName: string;
    graduationYear: number;
    currentStatus: string; // '1' หรือ '2' (สำหรับ List)
    submittedAt: string; // ISO Date string (สำหรับ List)

    // 🔥 เพิ่ม Field เหล่านี้เพื่อแก้ไข Error 2740 (Type Mismatch)
    major: string;
    employmentStatus: string; // ข้อมูลสถานะการทำงานแบบละเอียด
    companyName: string;
    salary: number; // หากเก็บใน DB เป็น Number
    satisfaction: number; // หากเก็บใน DB เป็น Number
    createdAt: string; // วันที่สร้าง/บันทึก (มักใช้ใน Modal แทน submittedAt)

    [key: string]: any; // ใช้สำหรับ Field อื่นๆ ที่ไม่ได้ระบุชัดเจน
}

// 💡 กำหนด Type สำหรับ Props ของ SurveyListItem
interface SurveyListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery) => void;
}

// 💡 กำหนด Type สำหรับ Props ของ SuveryList หลัก
interface SuveryListProps {
    suverys: Isuvery[];
}

// -----------------------------------------------------------------
// --- Component: SurveyListItem (แถวในตาราง) ---
// -----------------------------------------------------------------
const SurveyListItem: React.FC<SurveyListItemProps> = ({ suvery, onDetailClick }) => {
    // ... (formatDate, getStatusText, getStatusColor functions เหมือนเดิม)
    const formatDate = (isoString: string | undefined): string => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const getStatusText = (status: string | undefined): string => {
        if (status === '1') return 'ไม่ได้ทำงาน';
        if (status === '2') return 'ทำงานแล้ว';
        return 'ไม่ระบุ';
    };

    const getStatusColor = (status: string | undefined): string => {
        if (status === '1') return 'text-red-600 bg-red-100 border border-red-200';
        if (status === '2') return 'text-green-700 bg-green-100 border border-green-200';
        return 'text-gray-500 bg-gray-100';
    };
    // ... (โค้ด TR ของ SurveyListItem เหมือนเดิม)
    return (
        <tr
            key={suvery._id}
            onClick={() => onDetailClick(suvery)}
            className="border-b transition duration-200 cursor-pointer hover:bg-violet-50/50"
        >
            <td className="py-3 px-4 font-medium text-gray-900">{suvery.studentId}</td>
            <td className="py-3 px-4">{suvery.fullName}</td>
            <td className="py-3 px-4 text-center">{suvery.graduationYear}</td>
            <td className="py-3 px-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(suvery.currentStatus)}`}>
                    {getStatusText(suvery.currentStatus)}
                </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(suvery.submittedAt)}</td>
            <td className="py-3 px-4">
                <div className='flex justify-end gap-3'>
                    <Link
                        href={`/suvery/edit/${suvery._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-yellow-600 transition p-1"
                    >
                        <HiPencilAlt size={20} />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery);
                        }}
                        className="text-violet-600 hover:text-violet-800 transition p-1"
                        aria-label="ดูรายละเอียด"
                    >
                        <HiEye size={20} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            alert(`ต้องการลบข้อมูลของ ${suvery.fullName} ใช่หรือไม่?`);
                        }}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        aria-label="ลบข้อมูล"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// -----------------------------------------------------------------
// --- Component: SuveryList หลัก ---
// -----------------------------------------------------------------
const SuveryList: React.FC<SuveryListProps> = ({ suverys }) => {
    // State ไม่ต้องเปลี่ยนเพราะใช้ Isuvery แล้ว
    const [selectedsuvery, setSelectedsuvery] = useState<Isuvery | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDetailClick = (suvery: Isuvery) => {
        setSelectedsuvery(suvery);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedsuvery(null);
    };

    if (!suverys || suverys.length === 0) {
        return (
            <p className="text-center text-gray-500 text-lg p-10 border border-dashed rounded-lg bg-gray-50/50">
                ยังไม่มีข้อมูลการสำรวจในระบบ
            </p>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-violet-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">รหัสนศ.</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ชื่อ-สกุล</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">ปีที่จบ</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">สถานะงาน</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">วันที่กรอก</th>
                            <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {suverys.map((suvery) => (
                            <SurveyListItem
                                key={suvery._id}
                                suvery={suvery}
                                onDetailClick={handleDetailClick}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedsuvery && (
                <SuveryDetailModal suvery={selectedsuvery} isOpen={isModalOpen} onClose={handleCloseModal} />
            )}
        </>
    );
};

export default SuveryList;