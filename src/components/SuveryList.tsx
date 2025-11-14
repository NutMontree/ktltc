// src/components/suveryList.tsx

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HiPencilAlt, HiOutlineTrash, HiEye } from "react-icons/hi";

// -----------------------------------------------------------------
// 💡 INTERFACES/TYPES
// -----------------------------------------------------------------

// 💡 กำหนด Type สำหรับข้อมูล suvery
export interface Isuvery {
    _id: string;
    studentId: string;
    fullName: string;
    graduationYear: number;
    currentStatus: string; // '1' หรือ '2'
    submittedAt: string; // ISO Date string
    [key: string]: any; // ใช้สำหรับ Field อื่นๆ ที่ไม่ได้ระบุชัดเจน
}

// 💡 กำหนด Type สำหรับ Props ของ suveryListItem
interface suveryListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery) => void;
}

// 💡 กำหนด Type สำหรับ Props ของ suveryList หลัก
interface suveryListProps {
    suverys: Isuvery[];
}

// -----------------------------------------------------------------
// --- Component: SurveyListItem (แถวในตาราง) ---
// -----------------------------------------------------------------
const SurveyListItem: React.FC<suveryListItemProps> = ({ suvery, onDetailClick }) => {

    // 💡 แก้ไข: กำหนด Type ให้ Parameter isoString เป็น string
    const formatDate = (isoString: string | undefined): string => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // 💡 แก้ไข: กำหนด Type ให้ Parameter status เป็น string
    const getStatusText = (status: string | undefined): string => {
        if (status === '1') return 'ไม่ได้ทำงาน';
        if (status === '2') return 'ทำงานแล้ว';
        return 'ไม่ระบุ';
    };

    return (
        <tr
            key={suvery._id}
            onClick={() => onDetailClick(suvery)}
            className="border-b transition duration-200 cursor-pointer hover:bg-gray-50"
        >
            <td className="py-3 px-4 font-medium text-gray-900">{suvery.studentId}</td>
            <td className="py-3 px-4">{suvery.fullName}</td>
            <td className="py-3 px-4">{suvery.graduationYear}</td>
            <td className="py-3 px-4">{getStatusText(suvery.currentStatus)}</td>
            <td className="py-3 px-4">{formatDate(suvery.submittedAt)}</td>
            <td className="py-3 px-4 flex justify-end gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDetailClick(suvery);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                >
                    <HiEye size={20} />
                </button>
            </td>
        </tr>
    );
};

// -----------------------------------------------------------------
// --- Component: suveryList หลัก ---
// -----------------------------------------------------------------
// 💡 แก้ไข: กำหนด Type Props เป็น suveryListProps
const suveryList: React.FC<suveryListProps> = ({ suverys }) => {
    // 💡 แก้ไข: กำหนด Type ให้ State
    const [selectedsuvery, setSelectedsuvery] = useState<Isuvery | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 💡 แก้ไข: กำหนด Type ให้ Parameter suvery
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
            <p className="text-center text-gray-500 text-lg p-10 border border-dashed rounded-lg">
                ยังไม่มีข้อมูลการสำรวจในระบบ
            </p>
        );
    }

    return (
        <>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">รหัสนศ.</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ-สกุล</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ปีที่จบ</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะงาน</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่กรอก</th>
                            <th className="py-3 px-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
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

            {/* {isModalOpen && selectedsuvery && (
                <suveryDetailModal suvery={selectedsuvery} onClose={handleCloseModal} />
            )} */}
        </>
    );
};

export default suveryList;