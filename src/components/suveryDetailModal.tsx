// src/components/suveryDetailModal.tsx
"use client";

import React from 'react';
import { X, User, Briefcase, BookOpen, MessageSquare, GraduationCap, MapPin, DollarSign, CheckCircle } from 'lucide-react';
// import { Isuvery } from './suveryList'; // Import Type จากไฟล์ suveryList.tsx
import { Isuvery } from './SuveryList'; // Import Type จากไฟล์ suveryList.tsx

// -----------------------------------------------------------------
// 💡 Interfaces และ Props
// -----------------------------------------------------------------
interface SuveryDetailModalProps {
    suvery: Isuvery | null;
    onClose: () => void;
}

// -----------------------------------------------------------------
// 💡 Helper Components สำหรับจัดรูปแบบ
// -----------------------------------------------------------------

/**
 * Helper component สำหรับแสดงแต่ละ Field
 */
const DetailItem = ({ label, value }: { label: string, value: string | number | undefined | null }) => (
    <div className="py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value || '-'}</p>
    </div>
);

/**
 * Helper component สำหรับจัดกลุ่มรายละเอียด
 */
const DetailGroup = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="mb-6 p-4 border rounded-xl bg-gray-50 shadow-sm">
        <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
            <Icon className="w-5 h-5 mr-2" /> {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
            {children}
        </div>
    </div>
);


// -----------------------------------------------------------------
// 💡 Component หลัก: SuveryDetailModal
// -----------------------------------------------------------------

const SuveryDetailModal: React.FC<SuveryDetailModalProps> = ({ suvery, onClose }) => {
    if (!suvery) return null;

    // แปลงข้อมูลตัวเลือกให้เป็นข้อความที่อ่านง่าย
    const statusText = suvery.currentStatus === '2' ? 'ทำงานแล้ว' :
        suvery.currentStatus === '1' ? 'ไม่ได้ทำงาน' : 'ไม่ระบุ';
    const jobMatchText = suvery.jobMatch === '1' ? 'ตรง' : suvery.jobMatch === '2' ? 'ไม่ตรง' : '-';
    const jobSatText = suvery.jobSatisfaction === '1' ? 'พึงพอใจ' : suvery.jobSatisfaction === '2' ? 'ไม่พึงพอใจ' : '-';

    // แปลงวันที่และเวลา
    const submissionDate = new Date(suvery.submittedAt).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });


    return (
        // Overlay
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 transition-opacity"
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                className="flex items-center justify-center min-h-screen p-4 sm:p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all p-6 sm:p-8">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-4 mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-900">
                            รายละเอียดข้อมูล: <span className="text-blue-600">{suvery.fullName}</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Close modal"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* --- 1. ข้อมูลส่วนตัวและติดต่อ --- */}
                    <DetailGroup title="1. ข้อมูลส่วนตัวและติดต่อ" icon={User}>
                        <DetailItem label="รหัสนักศึกษา" value={suvery.studentId} />
                        <DetailItem label="ชื่อ-สกุล" value={suvery.fullName} />
                        <DetailItem label="อายุ" value={suvery.age} />
                        <DetailItem label="เพศ" value={suvery.gender} />
                        <DetailItem label="เบอร์ติดต่อ" value={suvery.contactTel} />
                        <DetailItem label="E-mail" value={suvery.contactEmail} />
                    </DetailGroup>

                    {/* ที่อยู่ปัจจุบัน */}
                    <DetailGroup title="ที่อยู่ปัจจุบัน" icon={MapPin}>
                        <DetailItem label="บ้านเลขที่" value={suvery.addrNumber} />
                        <DetailItem label="หมู่" value={suvery.addrMoo} />
                        <DetailItem label="ซอย/ถนน" value={`${suvery.addrSoi || ''} ${suvery.addrRoad || ''}`} />
                        <DetailItem label="ตำบล/แขวง" value={suvery.addrSubDistrict} />
                        <DetailItem label="อำเภอ/เขต" value={suvery.addrDistrict} />
                        <DetailItem label="จังหวัด" value={suvery.addrProvince} />
                        <DetailItem label="รหัสไปรษณี" value={suvery.addrZipCode} />
                    </DetailGroup>

                    {/* --- 2. ข้อมูลการศึกษา --- */}
                    <DetailGroup title="2. ข้อมูลการศึกษา" icon={GraduationCap}>
                        <DetailItem label="ระดับการศึกษาที่จบ" value={suvery.educationLevel} />
                        <DetailItem label="ปีที่จบการศึกษา" value={suvery.graduationYear} />
                        <DetailItem label="เกรดเฉลี่ยสะสม" value={suvery.gpa} />
                        <DetailItem label="ภูมิลำเนา (จังหวัด)" value={suvery.homeProvince} />
                        <DetailItem label="วิทยาลัย" value={suvery.college} />
                    </DetailGroup>

                    {/* --- 3. สถานการณ์ทำงานปัจจุบัน --- */}
                    <DetailGroup title="3. สถานะการทำงาน" icon={Briefcase}>
                        <div className='col-span-3'>
                            <p className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm ${suvery.currentStatus === '2' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                สถานะปัจจุบัน: {statusText}
                            </p>
                        </div>

                        {/* ข้อมูลเมื่อ 'ไม่ได้ทำงาน' (currentStatus === '1') */}
                        {suvery.currentStatus === '1' && (
                            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 p-3 my-2 bg-red-50 rounded-lg">
                                <DetailItem label="เหตุผล (กลุ่ม)" value={suvery.notWorkingReasonGroup} />
                                <DetailItem
                                    label="สาเหตุที่ยังไม่ได้ทำงาน"
                                    value={suvery.unemployedReason === '4' ? suvery.unemployedReasonOther : suvery.unemployedReason}
                                />
                                {suvery.notWorkingReasonGroup === 'หางานทำไม่ได้' && (
                                    <DetailItem label="ปัญหาในการหางานทำ" value={suvery.jobSearchProblem} />
                                )}
                            </div>
                        )}

                        {/* ข้อมูลเมื่อ 'ทำงานแล้ว' (currentStatus === '2') */}
                        {suvery.currentStatus === '2' && (
                            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 p-3 my-2 bg-green-50 rounded-lg">
                                <DetailItem
                                    label="ประเภทหน่วยงาน/สถานะ"
                                    value={suvery.employmentType === 'อื่นๆ' ? suvery.workplaceName : suvery.employmentType}
                                />
                                <DetailItem label="ตำแหน่งงาน" value={suvery.jobTitle} />
                                <DetailItem label="ชื่อสถานที่ทำงาน" value={suvery.workplaceName} />
                                <DetailItem label="เบอร์โทรสถานที่ทำงาน" value={suvery.workplaceTel} />

                                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-700">ที่อยู่สถานที่ทำงาน</h4>
                                    <p className='text-sm text-gray-600'>
                                        {`เลขที่ ${suvery.workplaceAddrNumber || '-'} หมู่ ${suvery.workplaceAddrMoo || '-'} 
                                        ต.${suvery.workplaceAddrSubDistrict || '-'} อ.${suvery.workplaceAddrDistrict || '-'} 
                                        จ.${suvery.workplaceAddrProvince || '-'} รหัส ${suvery.workplaceAddrZipCode || '-'}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </DetailGroup>

                    {/* --- 4. รายได้และความพึงพอใจ (เฉพาะคนทำงาน) --- */}
                    {suvery.currentStatus === '2' && (
                        <DetailGroup title="4. รายได้และความพึงพอใจ" icon={DollarSign}>
                            <DetailItem label="เงินเดือนโดยเฉลี่ย" value={suvery.salaryRange === '5' ? suvery.salaryRangeOther : suvery.salaryRange} />
                            <DetailItem label="ลักษณะงานตรงกับสาขาหรือไม่" value={jobMatchText} />
                            <DetailItem label="ความพึงพอใจกับงาน" value={jobSatText} />
                        </DetailGroup>
                    )}

                    {/* --- 5. การศึกษาต่อ --- */}
                    <DetailGroup title="5. การศึกษาต่อ" icon={BookOpen}>
                        <div className='col-span-3'>
                            <p className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm ${suvery.furtherStudyIntention === 'ต้องการศึกษาต่อ' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                                ความต้องการศึกษาต่อ: {suvery.furtherStudyIntention || '-'}
                            </p>
                        </div>

                        {suvery.furtherStudyIntention === 'ต้องการศึกษาต่อ' && (
                            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 p-3 my-2 bg-indigo-50 rounded-lg">
                                <DetailItem label="ระดับที่ต้องการ/กำลังศึกษา" value={suvery.furtherStudyLevel} />
                                <DetailItem label="สาขาที่ต้องการ/กำลังศึกษา" value={suvery.furtherStudyMajor === 'ระบุสาขา' ? suvery.furtherStudyMajorDetail : suvery.furtherStudyMajor} />
                                <DetailItem
                                    label="สาเหตุที่ต้องการศึกษาต่อ"
                                    value={suvery.furtherStudyReason === '4' ? suvery.furtherStudyReasonOther : suvery.furtherStudyReason}
                                />
                            </div>
                        )}
                    </DetailGroup>

                    {/* --- 6. ข้อเสนอแนะ --- */}
                    <DetailGroup title="6. ข้อเสนอแนะ" icon={MessageSquare}>
                        <div className="col-span-3">
                            <DetailItem label="ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย" value={suvery.suggestion} />
                        </div>
                    </DetailGroup>

                    {/* Footer / Submission Info */}
                    <div className="mt-6 pt-4 border-t text-right text-sm text-gray-500">
                        <CheckCircle className='w-4 h-4 inline-block mr-1 text-green-500' />
                        บันทึกข้อมูลเมื่อ: **{submissionDate}**
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SuveryDetailModal;