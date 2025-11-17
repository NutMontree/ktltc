// src/components/SuveryList.tsx
"use client";

import React, { useState, FC } from 'react';
import Link from 'next/link';
import { HiPencilAlt, HiOutlineTrash, HiEye } from "react-icons/hi";
// 💡 ตรวจสอบเส้นทางการนำเข้าสำหรับ SuveryModal และ Isuvery
import SuveryModal from '@/components/SuveryModal'
import { Isuvery } from './Isuvery';
import DeleteBtn from './DeleteBtn';

// 💡 กำหนดรหัส Admin และข้อความ Error
const ADMIN_PASSWORD = 'admin1234';
const MESSAGE_ACCESS_DENIED = 'รหัสผ่านไม่ถูกต้อง! การดำเนินการถูกยกเลิก.';


// -----------------------------------------------------------------
// --- Interfaces และ Types ---
// -----------------------------------------------------------------

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expectedPassword: string;
}

interface SuveryListProps {
    suverys: Isuvery[];
    isLoading: boolean;
    isError: boolean;
}

interface SurveyListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery, action: 'view' | 'edit' | 'delete') => void;
}


// -----------------------------------------------------------------
// --- Component ย่อย: PasswordModal (มี Logic Admin) ---
// -----------------------------------------------------------------
const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, expectedPassword }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleVerify = () => {
        // Logic การตรวจสอบ: Admin หรือ รหัสนักศึกษา (expectedPassword)
        if (password === ADMIN_PASSWORD || password === expectedPassword) {
            onSuccess();
        } else {
            setError('รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-100 opacity-100">
                <h3 className="text-xl font-bold text-violet-800 mb-4">🔐 ยืนยันรหัสผ่าน</h3>
                <p className="text-gray-600 mb-4">
                    โปรดป้อนรหัสนักศึกษา เพื่อดำเนินการต่อ
                </p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerify();
                    }}
                    placeholder="รหัสผ่าน"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 mb-3"
                    autoFocus
                />
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleVerify}
                        className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition"
                    >
                        ดำเนินการ
                    </button>
                </div>
            </div>
        </div>
    );
};
// -----------------------------------------------------------------

// --- Component: SurveyListItem ย่อย ---
const SurveyListItem: React.FC<SurveyListItemProps> = ({ suvery, onDetailClick }) => {

    const encodeId = (id: string): string => {
        if (typeof window !== 'undefined') {
            return btoa(id);
        }
        return id;
    };

    const formatDate = (isoString: string | undefined): string => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return 'Invalid Date';

            return date.toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

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

    // ส่วน return ของ SurveyListItem
    return (
        <tr
            key={suvery._id}
            onClick={() => onDetailClick(suvery, 'view')}
            className="border-b transition duration-200 cursor-pointer hover:bg-violet-50/50"
        >
            <td className="py-3 px-4">{suvery.fullName}</td>
            {/* รหัสนักศึกษา และ ปีที่จบ ถูกลบออกจากการแสดงผลแล้ว */}

            <td className="py-3 px-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(suvery.currentStatus)}`}>
                    {getStatusText(suvery.currentStatus)}
                </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(suvery.submittedAt)}</td>
            <td className="py-3 px-4">
                <div className='flex justify-end gap-3'>

                    {/* 1. ปุ่มแก้ไข (Edit) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, 'edit');
                        }}
                        className="text-gray-400 hover:text-yellow-600 transition p-1"
                        aria-label="แก้ไขข้อมูล"
                        title="แก้ไขข้อมูล"
                    >
                        <HiPencilAlt size={20} />
                    </button>

                    {/* 2. ปุ่มดูรายละเอียด (View) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, 'view');
                        }}
                        className="text-violet-600 hover:text-violet-800 transition p-1"
                        aria-label="ดูรายละเอียด"
                        title="ดูรายละเอียด"
                    >
                        <HiEye size={20} />
                    </button>

                    {/* 3. ปุ่มลบ (Delete) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, 'delete');
                        }}
                        className="text-red-600 hover:text-red-800 transition p-1"
                        aria-label="ลบข้อมูล"
                        title="ลบข้อมูล"
                    >
                        <HiOutlineTrash size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
};
// -----------------------------------------------------------------

// -----------------------------------------------------------------
// --- Component: SuveryList หลัก ---
// -----------------------------------------------------------------
const SuveryList: FC<SuveryListProps> = ({ suverys, isLoading, isError }) => {
    const [selectedsuvery, setSelectedsuvery] = useState<Isuvery | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    // 💡 State เพื่อจำ ID ที่เพิ่งยืนยันสำเร็จ (เพื่อให้สามารถดูซ้ำได้โดยไม่ต้องกรอกรหัส)
    const [verifiedSuveryId, setVerifiedSuveryId] = useState<string | null>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'view' | 'edit' | 'delete' | null>(null);
    const [encodedId, setEncodedId] = useState<string | null>(null);
    const [pendingStudentId, setPendingStudentId] = useState<string>(''); // รหัสนักศึกษาที่คาดหวัง

    // ฟังก์ชันหลักในการดำเนินการ (ดู, แก้ไข, ลบ)
    const executeAction = (suvery: Isuvery, action: 'view' | 'edit' | 'delete', encodedId: string) => {
        setSelectedsuvery(suvery);

        switch (action) {
            case 'view':
                // เปิด Detail Modal
                setIsDetailModalOpen(true);
                break;
            case 'edit':
                // นำทางไปยังหน้าแก้ไข 
                window.location.href = `/suvery/edit/${encodedId}`;
                break;
            case 'delete':
                // Logic การลบ
                if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลของ ' + suvery.fullName + '?')) {
                    // ** ในการนำไปใช้งานจริง คุณจะต้องสร้าง Logic การลบ API call ที่นี่ **
                    alert(`✅ (Action) ลบข้อมูล ID: ${suvery._id} (จำลองการลบ)`);
                    // หากลบสำเร็จ: window.location.reload(); 
                }
                break;
            default:
                break;
        }

        // ล้าง selectedsuvery หากไม่ใช่ 'view'
        if (action !== 'view') {
            setSelectedsuvery(null);
        }
    };

    // ฟังก์ชันจัดการการกระทำที่มีการป้องกันรหัสผ่าน (Logic ป้องกันการเข้าถึง)
    const handleProtectedAction = (suvery: Isuvery, action: 'view' | 'edit' | 'delete') => {

        // 1. กำหนด Action และ ID ที่ต้องการทำ
        setSelectedsuvery(suvery);
        setPendingAction(action);
        const currentEncodedId = btoa(suvery._id);
        setEncodedId(currentEncodedId);
        setPendingStudentId(suvery.studentId); // เก็บ studentId ไว้ใช้ตรวจสอบ

        // 💡 Logic การป้องกัน: ต้องกรอกรหัสผ่านถ้า ID ปัจจุบันไม่ตรงกับ ID ที่เคยยืนยันสำเร็จไปแล้ว
        const isAccessVerified = suvery._id === verifiedSuveryId;

        if (isAccessVerified) {
            // ถ้ารายการนี้เคยยืนยันแล้ว: ดำเนินการทันที
            executeAction(suvery, action, currentEncodedId);
        } else {
            // ถ้าเป็นรายการใหม่ หรือยังไม่เคยยืนยัน: เปิด Modal ขอรหัสผ่าน
            setIsPasswordModalOpen(true);
        }
    };

    // ฟังก์ชันที่ทำงานหลังจากตรวจสอบรหัสผ่านสำเร็จ
    const handleActionSuccess = () => {
        // 💡 อัปเดต verifiedSuveryId ด้วย ID ของรายการที่เพิ่งยืนยันสำเร็จ
        if (selectedsuvery) {
            setVerifiedSuveryId(selectedsuvery._id);
        }

        setIsPasswordModalOpen(false);

        if (selectedsuvery && pendingAction && encodedId) {
            executeAction(selectedsuvery, pendingAction, encodedId);
        }

        // ล้าง State ที่เกี่ยวข้องกับการดำเนินการเฉพาะกิจ
        setPendingAction(null);
        setEncodedId(null);
        setPendingStudentId('');
    };

    // ฟังก์ชันปิด Modal รายละเอียด
    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedsuvery(null);
    }

    // --- ส่วนแสดงผลตามสถานะ (Loading, Error, No Data) ---
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

    if (isError) {
        return (
            <p className="text-center text-red-600 text-lg p-10 border border-dashed rounded-lg bg-red-50/50">
                ❌ **Error Loading Data:** ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่อีกครั้ง
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

    // --- JSX Return (แสดงรายการ) ---
    return (
        <>
            <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-violet-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ชื่อ-สกุล</th>
                            {/* ปีที่จบ ถูกลบออกแล้ว */}
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
                                onDetailClick={handleProtectedAction}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal ดูรายละเอียด */}
            {isDetailModalOpen && selectedsuvery && (
                <SuveryModal suvery={selectedsuvery} isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} />
            )}

            {/* Modal ขอรหัสผ่าน */}
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSuccess={handleActionSuccess}
                expectedPassword={pendingStudentId}
            />
        </>
    );
};

export default SuveryList;