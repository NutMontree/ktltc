// src/components/SuveryList.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { HiPencilAlt, HiOutlineTrash, HiEye } from "react-icons/hi";
import SuveryModal from '@/components/SuveryModal'
import { Isuvery } from './Isuvery';
import DeleteBtn from './DeleteBtn';

interface SurveyListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery) => void;
}

interface SuveryListProps {
    suverys: Isuvery[];
    isLoading: boolean;
    isError: boolean;
}

const SurveyListItem: React.FC<SurveyListItemProps> = ({ suvery, onDetailClick }) => {

    const formatDate = (isoString: string | undefined): string => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return 'Invalid Date';

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

    // 💡 Logic การแปลง Type จาก API ที่ใช้ String
    const getStatusText = (status: Isuvery['currentStatus'] | undefined): string => {
        if (status === 'ไม่ได้ทำงาน') return 'ไม่ได้ทำงาน';
        if (status === 'ทำงานแล้ว') return 'ทำงานแล้ว';
        return 'ไม่ระบุ';
    };

    const getStatusColor = (status: Isuvery['currentStatus'] | undefined): string => {
        if (status === 'ไม่ได้ทำงาน') return 'text-red-600 bg-red-100 border border-red-200';
        if (status === 'ทำงานแล้ว') return 'text-green-700 bg-green-100 border border-green-200';
        return 'text-gray-500 bg-gray-100';
    };

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
                    {/* 1. ปุ่มแก้ไข (Edit) */}
                    <Link
                        href={`/suvery/edit/${suvery._id}`}
                        onClick={(e) => e.stopPropagation()} // ป้องกันการเปิด Modal
                        className="text-gray-400 hover:text-yellow-600 transition p-1"
                        aria-label="แก้ไขข้อมูล"
                        title="แก้ไขข้อมูล"
                    >
                        <HiPencilAlt size={20} />
                    </Link>

                    {/* 2. ปุ่มดูรายละเอียด (View) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery);
                        }}
                        className="text-violet-600 hover:text-violet-800 transition p-1"
                        aria-label="ดูรายละเอียด"
                        title="ดูรายละเอียด"
                    >
                        <HiEye size={20} />
                    </button>

                    {/* 3. ปุ่มลบ (Delete) */}
                    {/* 💡 แทนที่ปุ่ม alert ด้วย Component DeleteBtn จริง */}
                    <DeleteBtn id={suvery._id} />
                </div>
            </td>
        </tr>
    );
};

// -----------------------------------------------------------------
// --- Component: SuveryList หลัก ---
// -----------------------------------------------------------------
const SuveryList: React.FC<SuveryListProps> = ({ suverys, isLoading, isError }) => {
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

    // 💡 การจัดการ Loading State
    if (isLoading) {
        return (
            <p className="text-center text-violet-600 text-lg p-10 border border-dashed rounded-lg bg-violet-50/50 flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังโหลดข้อมูล...
            </p>
        );
    }

    // 💡 การจัดการ Error State (รวมถึง 429 Too Many Requests)
    if (isError) {
        return (
            <p className="text-center text-red-600 text-lg p-10 border border-dashed rounded-lg bg-red-50/50">
                ❌ **Error Loading Data:** ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่อีกครั้ง หรือตรวจสอบ Rate Limit
            </p>
        );
    }

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
                <SuveryModal suvery={selectedsuvery} isOpen={isModalOpen} onClose={handleCloseModal} />
            )}
        </>
    );
};

export default SuveryList;