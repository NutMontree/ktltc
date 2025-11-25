// src/components/SuveryDetailModal.tsx

'use client';
import React from 'react';
import { Isuvery } from './Isuvery'; // ตรวจสอบว่าไฟล์ Isuvery.ts อยู่ในโฟลเดอร์เดียวกันหรือแก้ไข path

interface ModalProps {
    suvery: Isuvery;
    isOpen: boolean;
    onClose: () => void;
}

const SuveryModal = ({ isOpen, onClose, suvery }: ModalProps) => {
    if (!isOpen || !suvery) return null;

    const formatValue = (key: string, value: any): string => {
        if (!value) return "-";

        if (key === 'createdAt' || key === 'submittedAt') {
            try {
                return new Date(value).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                });
            } catch { return String(value); }
        }
        if (key.toLowerCase().includes('salary') && typeof value === 'number') {
            return `${value.toLocaleString('th-TH')} บาท`;
        }
        if (key === 'currentStatus') {
            if (value === '1') return 'ไม่ได้ทำงาน';
            if (value === '2') return 'ทำงานแล้ว';
            return String(value);
        }
        return String(value);
    };

    const placeholders: Record<string, string> = {
        roomId: "ห้องเรียน",
        studentId: "รหัสนักศึกษา",
        fullName: "ชื่อ-สกุล",
        age: "อายุ",
        contactTel: "เบอร์ที่สามารถติดต่อได้",
        contactEmail: "อีเมล",
        addrNumber: "เลขที่",
        addrBuilding: "อาคาร/หมู่บ้าน",
        addrMoo: "หมู่",
        addrSoi: "ซอย",
        addrRoad: "ถนน",
        addrSubDistrict: "ตำบล/แขวง",
        addrDistrict: "อำเภอ/เขต",
        addrProvince: "จังหวัด",
        addrZipCode: "รหัสไปรษณีย์",
        homeProvince: "ภูมิลำเนา (จังหวัด)",
        graduationYear: "ปีที่จบการศึกษา",
        educationLevel: "ระดับการศึกษาที่จบ",
        gender: "เพศ",
        gpa: "เกรดเฉลี่ยสะสม",
        major: "สาขาวิชา",
        satisfaction: "ความพึงพอใจในสาขา",
        currentStatus: "สถานะการทำงานปัจจุบัน",
        notWorkingReasonGroup: "เหตุผลที่ยังไม่ได้ทำงาน (กลุ่ม)",
        jobSearchProblem: "ปัญหาในการหางาน",
        unemployedReason: "สาเหตุที่ยังไม่ได้ทำงาน",
        unemployedReasonOther: "โปรดระบุสาเหตุอื่น",
        employmentStatus: "สถานะงาน (เต็มเวลา/ชั่วคราว)",
        employmentType: "ประเภทหน่วยงาน",
        employmentTypeOther: "โปรดระบุประเภทหน่วยงานอื่น",
        jobTitle: "ตำแหน่งงาน",
        companyName: "ชื่อสถานที่ทำงาน",
        workplaceName: "ชื่อสถานที่ทำงาน",
        workplaceTel: "เบอร์โทรศัพท์สถานที่ทำงาน",
        workplaceAddrNumber: "เลขที่ (ที่ทำงาน)",
        workplaceAddrMoo: "หมู่ (ที่ทำงาน)",
        workplaceAddrSoi: "ซอย (ที่ทำงาน)",
        workplaceAddrRoad: "ถนน (ที่ทำงาน)",
        workplaceAddrSubDistrict: "ตำบล/แขวง (ที่ทำงาน)",
        workplaceAddrDistrict: "อำเภอ/เขต (ที่ทำงาน)",
        workplaceAddrProvince: "จังหวัด (ที่ทำงาน)",
        workplaceAddrZipCode: "รหัสไปรษณีย์ (ที่ทำงาน)",
        salary: "เงินเดือน/รายได้ต่อเดือน",
        salaryRange: "ช่วงรายได้",
        salaryRangeOther: "รายได้ (ระบุเอง)",
        jobMatch: "ตรงกับสาขาหรือไม่",
        jobSatisfaction: "ความพึงพอใจในงาน",
        furtherStudyIntention: "ความต้องการศึกษาต่อ",
        furtherStudyLevel: "ระดับที่ต้องการศึกษาต่อ",
        furtherStudyMajor: "สาขาที่ต้องการศึกษาต่อ",
        furtherStudyMajorDetail: "โปรดระบุสาขาใหม่",
        furtherStudyReason: "สาเหตุที่ต้องการศึกษาต่อ",
        furtherStudyReasonOther: "โปรดระบุสาเหตุอื่น",
        suggestion: "ข้อเสนอแนะ",
        submittedAt: "วันที่กรอกข้อมูล", // เปลี่ยนจาก createdAt ให้ตรงกับ Schema
        createdAt: "วันที่บันทึก"
    };

    const displayData = Object.entries(suvery)
        .filter(([key, value]) => {
            const excludedKeys = ['__v', '_id', 'updatedAt', 'fullName', 'college', 'collegeProvince'];
            if (excludedKeys.includes(key)) return false;
            if (value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return placeholders.hasOwnProperty(key);
        });

    return (
        <div
            className="fixed inset-0 z-80 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transform transition-all duration-300 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header (Sticky) */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        รายละเอียดแบบสำรวจ
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {/* Name Section */}
                    <div className="mb-6 p-5 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
                        <p className="text-sm text-orange-600 dark:text-orange-400 font-medium uppercase tracking-wide">
                            ชื่อผู้ตอบแบบสำรวจ
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 wrap-break-word">
                            {suvery.fullName}
                        </p>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                        {displayData.map(([key, value]) => (
                            <div
                                key={key}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors duration-200"
                            >
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                                    {placeholders[key] || key}
                                </p>
                                <p className="text-base font-medium text-gray-800 dark:text-gray-200 wrap-w leading-relaxed">
                                    {formatValue(key, value)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-md shadow-green-200 dark:shadow-none transition-all duration-200 transform active:scale-95"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuveryModal;