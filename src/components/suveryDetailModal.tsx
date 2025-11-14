'use client';

import React from 'react';

// Interface ยังคงเหมือนเดิม
export interface SuveryItem {
    _id: string;
    roomId: String | undefined;
    studentId: string;
    fullName: string;
    major: string;
    employmentStatus: string;
    companyName: string;
    salary: number;
    satisfaction: number;
    createdAt: string;
    [key: string]: any;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    suvery: SuveryItem | null;
}

const SuveryDetailModal = ({ isOpen, onClose, suvery }: ModalProps) => {
    if (!isOpen || !suvery) return null;

    // *** ลบฟังก์ชัน formatLabel ออกไป เนื่องจากใช้ placeholders แทน ***
    // const formatLabel = (key: string): string => { ... }; 

    const formatValue = (key: string, value: any): string => {
        // จัดรูปแบบวันที่
        if (key === 'createdAt' && value) {
            return new Date(value).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        // จัดรูปแบบเงินเดือน
        if (key === 'salary' && typeof value === 'number') {
            return value.toLocaleString('th-TH');
        }
        // จัดรูปแบบค่าอื่นๆ
        return String(value);
    };

    // อ็อบเจกต์ placeholders ที่คุณให้มา
    const placeholders: Record<string, string> = {
        // 1. ข้อมูลส่วนตัวและติดต่อ
        roomId: "ห้องเรียน",
        studentId: "รหัสนักศึกษา",
        fullName: "ชื่อ-สกุล",
        age: "อายุ",
        contactTel: "เบอร์ที่สามารถติดต่อได้",
        contactEmail: "อีเมล",
        // 2. ที่อยู่ติดต่อได้
        addrNumber: "เลขที่",
        addrBuilding: "อาคาร/หมู่บ้าน",
        addrMoo: "หมู่",
        addrSoi: "ซอย",
        addrRoad: "ถนน",
        addrSubDistrict: "ตำบล/แขวง",
        addrDistrict: "อำเภอ/เขต",
        addrProvince: "จังหวัด",
        addrZipCode: "รหัสไปรษณีย์",
        // 3. ข้อมูลการศึกษา
        homeProvince: "ภูมิลำเนา (จังหวัด)",
        graduationYear: "ปีที่จบการศึกษา",
        educationLevel: "ระดับการศึกษาที่จบ",
        gender: "เพศ",
        gpa: "เกรดเฉลี่ยสะสม",
        // 4. สถานการณ์ทำงานปัจจุบัน
        currentStatus: "สถานะการทำงานปัจจุบัน",
        // 4.1 ไม่ได้ทำงาน
        notWorkingReasonGroup: "เหตุผลที่ยังไม่ได้ทำงาน (กลุ่ม)",
        jobSearchProblem: "ปัญหาในการหางาน",
        unemployedReason: "สาเหตุที่ยังไม่ได้ทำงาน",
        unemployedReasonOther: "โปรดระบุสาเหตุอื่น",
        // 4.2 ทำงานแล้ว
        employmentType: "ประเภทหน่วยงาน",
        employmentTypeOther: "โปรดระบุประเภทหน่วยงานอื่น",
        jobTitle: "ตำแหน่งงาน",
        workplaceName: "ชื่อสถานที่ทำงาน",
        workplaceTel: "เบอร์โทรศัพท์สถานที่ทำงาน",
        // ที่อยู่สถานที่ทำงาน
        workplaceAddrNumber: "เลขที่ (ที่ทำงาน)",
        workplaceAddrMoo: "หมู่ (ที่ทำงาน)",
        workplaceAddrSoi: "ซอย (ที่ทำงาน)",
        workplaceAddrRoad: "ถนน (ที่ทำงาน)",
        workplaceAddrSubDistrict: "ตำบล/แขวง (ที่ทำงาน)",
        workplaceAddrDistrict: "อำเภอ/เขต (ที่ทำงาน)",
        workplaceAddrProvince: "จังหวัด (ที่ทำงาน)",
        workplaceAddrZipCode: "รหัสไปรษณีย์ (ที่ทำงาน)",
        // รายได้
        salaryRange: "ช่วงรายได้",
        salaryRangeOther: "รายได้ (ระบุเอง)",
        // ความสัมพันธ์งาน–สาขา
        jobMatch: "ตรงกับสาขาหรือไม่",
        jobSatisfaction: "ความพึงพอใจในงาน",
        // 5. การศึกษาต่อ
        furtherStudyIntention: "ความต้องการศึกษาต่อ",
        furtherStudyLevel: "ระดับที่ต้องการศึกษาต่อ",
        furtherStudyMajor: "สาขาที่ต้องการศึกษาต่อ",
        furtherStudyMajorDetail: "โปรดระบุสาขาใหม่",
        furtherStudyReason: "สาเหตุที่ต้องการศึกษาต่อ",
        furtherStudyReasonOther: "โปรดระบุสาเหตุอื่น",
        // 6. ข้อเสนอแนะ
        suggestion: "ข้อเสนอแนะ",
        createdAt: "วันที่กรอกข้อมูล"
    };

    // 🔥 ปรับปรุงการกรองข้อมูล: ไม่แสดงฟิลด์ระบบ และฟิลด์ที่ไม่มีค่า
    const displayData = Object.entries(suvery)
        .filter(([key, value]) => {
            const excludedKeys = ['__v', '_id', 'submittedAt', 'updatedAt'];
            if (excludedKeys.includes(key)) return false;

            // กรองค่าที่เป็น null, undefined หรือ string ว่าง
            if (value === null || value === undefined) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            // กรองค่าที่เป็น 0 หรือ false ออก หากไม่ต้องการแสดง (แต่โดยทั่วไปมักจะแสดงตัวเลข 0)
            // if (value === 0 || value === false) return false; 

            // แสดงเฉพาะ Field ที่มี Label ใน placeholders
            return placeholders.hasOwnProperty(key);
        });

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="
                    bg-white 
                    w-full 
                    max-w-4xl 
                    rounded-2xl 
                    shadow-2xl 
                    border 
                    border-white/30 
                    p-6 
                    transform 
                    transition-all 
                    duration-300
                    max-h-[95vh]
                    overflow-y-auto
                    scrollbar-thin 
                    scrollbar-thumb-gray-300
                    scrollbar-track-transparent
                "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur-lg py-3 z-10 border-b">
                    <h3 className="text-2xl font-bold text-violet-600">
                        รายละเอียดแบบสำรวจ
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 transition"
                        aria-label="Close"
                    >
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Name Section */}
                <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100 shadow-sm">
                    <p className="text-sm text-violet-600 font-medium">
                        ชื่อผู้ตอบแบบสำรวจ
                    </p>
                    <p className="text-2xl font-semibold mt-1 break-words">
                        {suvery.fullName}
                    </p>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayData.map(([key, value]) => (
                        <div
                            key={key}
                            className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200"
                        >
                            <p className="text-xs font-medium text-violet-700 uppercase tracking-wide">
                                {/* 🔥 ใช้ placeholders[key] เพื่อแสดง Label ภาษาไทย */}
                                {placeholders[key] || key}
                            </p>
                            <p className="text-lg font-semibold text-gray-900 mt-1 break-words">
                                {formatValue(key, value)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="text-right mt-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-violet-600 text-white font-medium shadow-md hover:bg-violet-700 transition"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuveryDetailModal;