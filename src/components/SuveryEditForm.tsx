// src/components/SuveryEditForm.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// นำเข้าไอคอนสำหรับส่วนต่างๆ ของฟอร์ม
import { User, Briefcase, BookOpen, MessageSquare, GraduationCap, MapPin, X, ChevronRight, Loader2, Check } from 'lucide-react';

// -----------------------------------------------------------------
// 💡 INTERFACE (กำหนด Interface ที่สมบูรณ์ในไฟล์นี้เพื่อแก้ปัญหา Property Not Found)
// -----------------------------------------------------------------
interface Isuvery {
    _id: string; // ID สำหรับการอัปเดต API
    // 1. ข้อมูลส่วนตัว
    roomId: string;
    studentId: string;
    fullName: string;
    age: string;
    // 2. ที่อยู่ที่ติดต่อได้
    addrNumber: string;
    addrBuilding: string;
    addrMoo: string;
    addrSoi: string;
    addrRoad: string;
    addrSubDistrict: string;
    addrDistrict: string;
    addrProvince: string;
    addrZipCode: string;
    contactTel: string;
    contactEmail: string;
    // 3. ข้อมูลการศึกษา
    homeProvince: string;
    graduationYear: string;
    educationLevel: string; // ปวช./ปวส.
    gender: string; // ชาย/หญิง
    gpa: string; // เกรดเฉลี่ยสะสม
    // 4. สถานการณ์ทำงานปัจจุบัน
    currentStatus: string; // '1' ไม่ได้ทำงาน / '2' ทำงานแล้ว
    // 4.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
    notWorkingReasonGroup: string; // ศึกษาต่อ, หางานทำไม่ได้, รอฟังคำตอบ, ไม่ประสงค์จะทำงาน
    notWorkingReasonOther: string; // อื่นๆ (โปรดระบุ)
    // 4.2 ข้อมูลเมื่อ "ทำงานแล้ว"
    employmentType: string; // ข้าราชการ, รัฐวิสาหกิจ, พนักงานบริษัท, อื่นๆ
    employmentTypeOther: string; // อื่นๆ (โปรดระบุ)
    jobTitle: string;
    workplaceName: string;
    workplaceAddrNumber: string;
    workplaceAddrMoo: string;
    workplaceAddrSoi: string;
    workplaceAddrRoad: string;
    workplaceAddrSubDistrict: string;
    workplaceAddrDistrict: string;
    workplaceAddrProvince: string;
    workplaceAddrZipCode: string;
    workplaceTel: string;
    // 5. รายได้และลักษณะงาน
    salaryRange: string; // '1', '2', '3', '4', '5'
    salaryRangeOther: string; // อื่นๆ (โปรดระบุ)
    jobMatch: string; // '1' ตรง / '2' ไม่ตรง
    jobSatisfaction: string; // '1' พึงพอใจ / '2' ไม่พึงพอใจ
    // 6. สาเหตุที่ยังไม่ได้ทำงาน (ใช้เฉพาะในกรณีไม่ได้ทำงานและไม่ใช่ศึกษาต่อ)
    unemployedReason: string; // '1', '2', '3', '4'
    unemployedReasonOther: string; // อื่นๆ (โปรดระบุ)
    // 7. การศึกษาต่อ
    furtherStudyIntention: string; // ต้องการศึกษาต่อ / ไม่ต้องการศึกษาต่อ
    furtherStudyLevel: string; // ระดับปริญญาตรี, โท, เอก
    furtherStudyMajor: string; // สาขาเดิม / ระบุสาขา
    furtherStudyMajorDetail: string; // ระบุสาขา (text input)
    furtherStudyReason: string; // '1', '2', '3', '4'
    furtherStudyReasonOther: string; // อื่นๆ (โปรดระบุ)
    // 8. ปัญหาในการหางาน
    jobSearchProblem: string; // ไม่มีปัญหา, 1, 2, ...
    // 9. ข้อเสนอแนะ
    suggestion: string;
}

interface SuveryEditFormProps {
    suvery: Isuvery;
}

// -----------------------------------------------------------------
// --- CONSTANTS & HELPERS ---
// -----------------------------------------------------------------
const COLLEGE_NAME = 'วิทยาลัยเทคนิคกันทรลักษ์';
const COLLEGE_PROVINCE = 'ศรีสะเกษ';
const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-violet-600 focus:border-violet-600 shadow-sm transition duration-150";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionTitleClass = "text-2xl font-extrabold text-gray-800 mb-6 flex items-center gap-3";

// Component สำหรับ Section Header/Container
// 💡 แก้ปัญหา Implicit 'any' type โดยการกำหนด Props Type ชัดเจน
interface FormSectionProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}
const FormSection: React.FC<FormSectionProps> = ({ title, icon: Icon, children }) => (
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-inner mb-8">
        <h2 className={sectionTitleClass}>
            <Icon className="w-6 h-6 text-violet-600" />
            {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

// -----------------------------------------------------------------
// --- Component: SuveryEditForm ---
// -----------------------------------------------------------------
const SuveryEditForm: React.FC<SuveryEditFormProps> = ({ suvery }) => {
    // 💡 แก้ปัญหา Redeclaration (2451) โดยการลบโค้ดซ้ำซ้อน
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 💡 1. ใช้ useState เพื่อจัดการข้อมูลฟอร์ม และใส่ข้อมูลเดิมเป็นค่าเริ่มต้น
    // 💡 กำหนด Type เป็น Isuvery ให้ชัดเจน
    const [formData, setFormData] = useState<Isuvery>({ ...suvery });

    // 💡 2. Handler สำหรับการเปลี่ยนแปลงค่าใน Input/Select/TextArea
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // สำหรับ Radio buttons/Selects, ใช้ค่าจาก event target
        const newValue = type === 'radio' ? e.target.value : value;

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue,
        }));
    };

    // 💡 3. Handler สำหรับการ Submit ฟอร์ม (เรียก API PUT)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // 🚀 เรียก API PUT ที่เราสร้างไว้: /api/suvery?id=<ID>
            const res = await fetch(`/api/suvery?id=${formData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('✅ ข้อมูลแบบสำรวจได้รับการอัปเดตสำเร็จแล้ว');
                // 💡 รีเฟรชหน้ารายการ (List Page)
                router.push('/suvery');
                router.refresh();
            } else {
                const errorData = await res.json();
                const errorMessage = errorData.message || 'การอัปเดตข้อมูลล้มเหลว';
                setError(errorMessage);
                console.error(`❌ อัปเดตไม่สำเร็จ: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Client update error:", err);
            // 💡 แก้ปัญหา Implicit 'any' type โดยการกำหนด type ของ err
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Conditional Rendering Logic ---
    // 💡 แก้ไขการเปรียบเทียบ Type จากตัวเลขเป็น String (currentStatus เป็น string: '1', '2')
    const isWorking = formData.currentStatus === '2'; // 2: ทำงานแล้ว
    const isNotWorking = formData.currentStatus === '1'; // 1: ไม่ได้ทำงาน

    // ใช้ Optional Chaining (?) เพื่อป้องกัน Error หาก formData ยังไม่สมบูรณ์ (แม้จะตั้งค่าเริ่มต้นแล้วก็ตาม)
    const isWorkingOther = isWorking && formData.employmentType === 'อื่นๆ';
    const isSalaryOther = isWorking && formData.salaryRange === '5';

    // สำหรับผู้ที่ "ไม่ได้ทำงาน"
    const isUnemployedLookingForJob = isNotWorking && formData.notWorkingReasonGroup === 'หางานทำไม่ได้';
    const isUnemployedReasonOther = isNotWorking && formData.unemployedReason === '4';

    // สำหรับ "การศึกษาต่อ"
    const isFurtherStudyIntention = formData.furtherStudyIntention === 'ต้องการศึกษาต่อ';
    const isFurtherStudyMajorNew = isFurtherStudyIntention && formData.furtherStudyMajor === 'ระบุสาขา';
    const isFurtherStudyReasonOther = isFurtherStudyIntention && formData.furtherStudyReason === '4';

    // --- UI (User Interface) ---
    return (
        <div className="max-w-5xl mx-auto py-12">
            <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100">
                <h1 className="text-4xl font-extrabold text-violet-800 mb-10 text-center">
                    📝 แก้ไขข้อมูลแบบสำรวจภาวะการมีงานทำ
                </h1>

                {error && (
                    <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        <span className="font-medium">⚠️ Error:</span> {error}
                    </div>
                )}

                {/* --- 1. ข้อมูลส่วนตัวและที่ติดต่อ --- */}
                <FormSection title="1. ข้อมูลส่วนตัว" icon={User}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* studentId, fullName, roomId, age */}
                        <div className="md:col-span-1">
                            <label htmlFor="studentId" className={labelClass}>รหัสนักศึกษา *</label>
                            <input id="studentId" name="studentId" type="text" value={formData.studentId} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="fullName" className={labelClass}>ชื่อ-สกุล *</label>
                            <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="roomId" className={labelClass}>ห้องเรียน</label>
                            {/* 💡 การใช้ value={formData.roomId} หากเป็น string/number จะไม่เกิด error 2322 */}
                            <input id="roomId" name="roomId" type="text" value={formData.roomId} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="age" className={labelClass}>อายุ</label>
                            <input id="age" name="age" type="number" value={formData.age} onChange={handleChange} className={inputClass} />
                        </div>

                        {/* contactTel, contactEmail */}
                        <div className="md:col-span-1">
                            <label htmlFor="contactTel" className={labelClass}>เบอร์โทรศัพท์ติดต่อ</label>
                            <input id="contactTel" name="contactTel" type="tel" value={formData.contactTel} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="contactEmail" className={labelClass}>E-mail</label>
                            <input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} className={inputClass} />
                        </div>

                        {/* gender */}
                        <div className="flex flex-col md:col-span-4">
                            <label className={labelClass}>เพศ *</label>
                            <div className="flex gap-6 mt-1">
                                <label className="inline-flex items-center">
                                    <input type="radio" name="gender" value="ชาย" checked={formData.gender === 'ชาย'} onChange={handleChange} className="form-radio h-5 w-5 text-violet-600" required />
                                    <span className="ml-2 text-gray-700">ชาย</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" name="gender" value="หญิง" checked={formData.gender === 'หญิง'} onChange={handleChange} className="form-radio h-5 w-5 text-violet-600" required />
                                    <span className="ml-2 text-gray-700">หญิง</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ที่อยู่ที่ติดต่อได้ */}
                    <h3 className="text-lg font-bold text-gray-700 mt-4 border-t pt-4">ที่อยู่ที่สามารถติดต่อได้ (ปัจจุบัน)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {/* 💡 ฟิลด์ที่อยู่: ตรวจสอบให้แน่ใจว่าค่าที่ส่งคือ string (Type ที่กำหนดไว้ใน Interface) */}
                        <input name="addrNumber" value={formData.addrNumber} onChange={handleChange} className={inputClass} type="text" placeholder="เลขที่" />
                        <input name="addrBuilding" value={formData.addrBuilding} onChange={handleChange} className={inputClass} type="text" placeholder="อาคาร/หมู่บ้าน" />
                        <input name="addrMoo" value={formData.addrMoo} onChange={handleChange} className={inputClass} type="text" placeholder="หมู่" />
                        <input name="addrSoi" value={formData.addrSoi} onChange={handleChange} className={inputClass} type="text" placeholder="ซอย" />
                        <input name="addrRoad" value={formData.addrRoad} onChange={handleChange} className={inputClass} type="text" placeholder="ถนน" />
                        <input name="addrSubDistrict" value={formData.addrSubDistrict} onChange={handleChange} className={inputClass} type="text" placeholder="ตำบล/แขวง" />
                        <input name="addrDistrict" value={formData.addrDistrict} onChange={handleChange} className={inputClass} type="text" placeholder="อำเภอ/เขต" />
                        <input name="addrProvince" value={formData.addrProvince} onChange={handleChange} className={inputClass} type="text" placeholder="จังหวัด" />
                        <input name="addrZipCode" value={formData.addrZipCode} onChange={handleChange} className={inputClass} type="text" placeholder="รหัสไปรษณีย์" />
                    </div>
                </FormSection>

                {/* --- 2. ข้อมูลการศึกษา --- */}
                <FormSection title="2. ข้อมูลการศึกษา" icon={GraduationCap}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* ข้อมูลวิทยาลัย (ค่าคงที่) */}
                        <div className="flex flex-col md:col-span-2">
                            <label className={labelClass}>วิทยาลัย</label>
                            <input value={COLLEGE_NAME} className={`${inputClass} bg-gray-200 cursor-not-allowed`} type="text" disabled />
                        </div>
                        <div className="flex flex-col">
                            <label className={labelClass}>จังหวัด (วิทยาลัย)</label>
                            <input value={COLLEGE_PROVINCE} className={`${inputClass} bg-gray-200 cursor-not-allowed`} type="text" disabled />
                        </div>
                        {/* homeProvince */}
                        <div className="flex flex-col">
                            <label htmlFor="homeProvince" className={labelClass}>ภูมิลำเนา (จังหวัด)</label>
                            <input id="homeProvince" name="homeProvince" value={formData.homeProvince} onChange={handleChange} className={inputClass} type="text" />
                        </div>

                        {/* graduationYear, educationLevel, gpa */}
                        <div className="flex flex-col">
                            <label htmlFor="graduationYear" className={labelClass}>ปีที่จบการศึกษา *</label>
                            <input id="graduationYear" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className={inputClass} type="number" required />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="educationLevel" className={labelClass}>ระดับการศึกษาที่จบ *</label>
                            <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={inputClass} required>
                                <option value="">-- เลือกระดับ --</option>
                                <option value="ปวช.">ปวช.</option>
                                <option value="ปวส.">ปวส.</option>
                            </select>
                        </div>
                        <div className="flex flex-col md:col-span-2">
                            <label htmlFor="gpa" className={labelClass}>เกรดเฉลี่ยสะสม</label>
                            <input id="gpa" name="gpa" value={formData.gpa} onChange={handleChange} className={inputClass} type="number" step="0.01" max="4.00" placeholder="เช่น 3.50" />
                        </div>
                    </div>
                </FormSection>

                {/* --- 3. สถานการณ์ทำงานปัจจุบัน --- */}
                <FormSection title="3. สถานการณ์ทำงานปัจจุบัน" icon={Briefcase}>
                    {/* currentStatus */}
                    <div className="flex flex-col">
                        <label htmlFor="currentStatus" className={labelClass}>สถานการณ์ทำงานปัจจุบัน *</label>
                        <select id="currentStatus" name="currentStatus" value={formData.currentStatus} onChange={handleChange} className={inputClass} required>
                            <option value="">-- เลือกสถานะ --</option>
                            <option value="1">1 ไม่ได้ทำงาน</option>
                            <option value="2">2 ทำงานแล้ว</option>
                        </select>
                    </div>

                    {/* --- 3.1 ไม่ได้ทำงาน (currentStatus === '1') --- */}
                    {isNotWorking && (
                        <div className="bg-red-50 p-5 rounded-lg border border-red-200 space-y-4">
                            <p className="text-lg font-bold text-red-700">รายละเอียดสำหรับผู้ที่ **ยังไม่ได้ทำงาน**</p>

                            {/* notWorkingReasonGroup */}
                            <div className="flex flex-col">
                                <label className={labelClass}>เหตุผลที่ยังไม่ได้ทำงาน (เลือกกลุ่มเหตุผล) *</label>
                                <select name="notWorkingReasonGroup" value={formData.notWorkingReasonGroup} onChange={handleChange} className={inputClass} required={isNotWorking}>
                                    <option value="">-- เลือกเหตุผลหลัก --</option>
                                    <option value="ศึกษาต่อ">ศึกษาต่อ</option>
                                    <option value="หางานทำไม่ได้">หางานทำไม่ได้</option>
                                    <option value="รอฟังคำตอบ">รอฟังคำตอบจากหน่วยงาน</option>
                                    <option value="ไม่ประสงค์จะทำงาน">ไม่ประสงค์จะทำงาน</option>
                                </select>
                            </div>

                            {/* jobSearchProblem (Conditional: หางานทำไม่ได้) */}
                            {isUnemployedLookingForJob && (
                                <div className="flex flex-col">
                                    <label htmlFor="jobSearchProblem" className={labelClass}>ปัญหาในการหางานทำ *</label>
                                    <select id="jobSearchProblem" name="jobSearchProblem" value={formData.jobSearchProblem} onChange={handleChange} className={inputClass} required={isUnemployedLookingForJob}>
                                        <option value="">-- เลือกปัญหา --</option>
                                        <option value="ไม่มีปัญหา">ไม่มีปัญหา</option>
                                        <option value="1">1 ไม่ทราบแหล่งงาน</option>
                                        <option value="2">2 หางานที่ถูกใจไม่ได้</option>
                                        <option value="3">3 ความสามารถไม่ตรงกับงาน</option>
                                        {/* ... เพิ่มตัวเลือกอื่น ๆ ... */}
                                    </select>
                                </div>
                            )}

                            {/* unemployedReason (รายละเอียดเพิ่มเติม) */}
                            <div className="flex flex-col">
                                <label htmlFor="unemployedReason" className={labelClass}>สาเหตุที่ยังไม่ได้ทำงาน (รายละเอียด) *</label>
                                <select id="unemployedReason" name="unemployedReason" value={formData.unemployedReason} onChange={handleChange} className={inputClass} required={isNotWorking}>
                                    <option value="">-- เลือกสาเหตุ --</option>
                                    <option value="1">1 ยังไม่ประสงค์ทำงาน</option>
                                    <option value="2">2 รอฟังคำตอบจากหน่วยงาน</option>
                                    <option value="3">3 หางานทำไม่ได้</option>
                                    <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                </select>
                                {isUnemployedReasonOther && (
                                    <input name="unemployedReasonOther" value={formData.unemployedReasonOther} onChange={handleChange} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุสาเหตุอื่นๆ" required />
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- 3.2 ทำงานแล้ว (currentStatus === '2') --- */}
                    {isWorking && (
                        <div className="bg-green-50 p-5 rounded-lg border border-green-200 space-y-4">
                            <p className="text-lg font-bold text-green-700">รายละเอียดสำหรับผู้ที่ **ทำงานแล้ว**</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* jobTitle, workplaceName */}
                                <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputClass} type="text" placeholder="ตำแหน่งงานและหน้าที่ *" required={isWorking} />
                                <input name="workplaceName" value={formData.workplaceName} onChange={handleChange} className={inputClass} type="text" placeholder="ชื่อสถานที่ทำงาน *" required={isWorking} />

                                {/* employmentType (Select) */}
                                <div className="md:col-span-2">
                                    <label htmlFor="employmentType" className={labelClass}>ประเภทหน่วยงาน/สถานะการทำงาน *</label>
                                    <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputClass} required={isWorking}>
                                        <option value="">-- เลือกประเภท --</option>
                                        <option value="ข้าราชการ">ข้าราชการ</option>
                                        <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                                        <option value="พนักงานบริษัท">พนักงานบริษัทิ/องค์กรธุรกิจเอกชน</option>
                                        <option value="ดำเนินธุรกิจอิสระ">ดำเนินธุรกิจอิสระ</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                    {isWorkingOther && (
                                        <input name="employmentTypeOther" value={formData.employmentTypeOther} onChange={handleChange} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุประเภทอื่นๆ" required />
                                    )}
                                </div>
                            </div>

                            {/* ที่อยู่สถานที่ทำงาน */}
                            <h3 className="text-md font-bold text-gray-700 pt-3 flex items-center gap-1"><MapPin className="w-4 h-4" /> ที่อยู่สถานที่ทำงาน</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <input name="workplaceAddrNumber" value={formData.workplaceAddrNumber} onChange={handleChange} className={inputClass} type="text" placeholder="เลขที่" />
                                <input name="workplaceAddrMoo" value={formData.workplaceAddrMoo} onChange={handleChange} className={inputClass} type="text" placeholder="หมู่" />
                                <input name="workplaceAddrSoi" value={formData.workplaceAddrSoi} onChange={handleChange} className={inputClass} type="text" placeholder="ซอย" />
                                <input name="workplaceAddrRoad" value={formData.workplaceAddrRoad} onChange={handleChange} className={inputClass} type="text" placeholder="ถนน" />
                                <input name="workplaceAddrSubDistrict" value={formData.workplaceAddrSubDistrict} onChange={handleChange} className={inputClass} type="text" placeholder="ตำบล/แขวง" />
                                <input name="workplaceAddrDistrict" value={formData.workplaceAddrDistrict} onChange={handleChange} className={inputClass} type="text" placeholder="อำเภอ/เขต" />
                                <input name="workplaceAddrProvince" value={formData.workplaceAddrProvince} onChange={handleChange} className={inputClass} type="text" placeholder="จังหวัด" />
                                <input name="workplaceAddrZipCode" value={formData.workplaceAddrZipCode} onChange={handleChange} className={inputClass} type="text" placeholder="รหัสไปรษณีย์" />
                                <div className="md:col-span-4">
                                    <input name="workplaceTel" value={formData.workplaceTel} onChange={handleChange} className={inputClass} type="tel" placeholder="เบอร์โทรศัพท์สถานที่ทำงาน" />
                                </div>
                            </div>

                            {/* 5. รายได้และลักษณะงาน */}
                            <h3 className="text-md font-bold text-gray-700 pt-3 flex items-center gap-1"><Check className="w-4 h-4" /> รายได้และความพึงพอใจ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* salaryRange */}
                                <div className="md:col-span-3">
                                    <label htmlFor="salaryRange" className={labelClass}>ปัจจุบันท่านได้รับเงินค่าจ้าง (เฉลี่ยต่อเดือน) *</label>
                                    <select id="salaryRange" name="salaryRange" value={formData.salaryRange} onChange={handleChange} className={inputClass} required={isWorking}>
                                        <option value="">-- เลือกช่วงรายได้ --</option>
                                        <option value="1">1 ต่ำกว่า 7,940 บาท</option>
                                        <option value="2">2 7,941 - 10,000 บาท</option>
                                        <option value="3">3 10,001 - 15,000 บาท</option>
                                        <option value="4">4 15,001 - 20,000 บาท</option>
                                        <option value="5">5 อื่นๆ (โปรดระบุ)</option>
                                    </select>
                                    {isSalaryOther && (
                                        <input name="salaryRangeOther" value={formData.salaryRangeOther} onChange={handleChange} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุจำนวนเงิน" required />
                                    )}
                                </div>

                                {/* jobMatch, jobSatisfaction */}
                                <div>
                                    <label className={labelClass}>ลักษณะงานตรงกับสาขาที่จบหรือไม่ *</label>
                                    <select name="jobMatch" value={formData.jobMatch} onChange={handleChange} className={inputClass} required={isWorking}>
                                        <option value="">-- เลือก --</option>
                                        <option value="1">1 ตรงกับสาขาที่จบ</option>
                                        <option value="2">2 ไม่ตรงกับสาขาที่จบ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>ความพึงพอใจต่องานปัจจุบัน *</label>
                                    <select name="jobSatisfaction" value={formData.jobSatisfaction} onChange={handleChange} className={inputClass} required={isWorking}>
                                        <option value="">-- เลือก --</option>
                                        <option value="1">1 พึงพอใจ</option>
                                        <option value="2">2 ไม่พึงพอใจ</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </FormSection>

                {/* --- 4. การศึกษาต่อ --- */}
                <FormSection title="4. ความต้องการศึกษาต่อ" icon={BookOpen}>
                    {/* furtherStudyIntention */}
                    <div className="flex flex-col">
                        <label className={labelClass}>ท่านมีความประสงค์จะศึกษาต่อหรือไม่ *</label>
                        <select name="furtherStudyIntention" value={formData.furtherStudyIntention} onChange={handleChange} className={inputClass} required>
                            <option value="">-- เลือกความประสงค์ --</option>
                            <option value="ต้องการศึกษาต่อ">ต้องการศึกษาต่อ</option>
                            <option value="ไม่ต้องการศึกษาต่อ">ไม่ต้องการศึกษาต่อ</option>
                        </select>
                    </div>

                    {/* Conditional Fields: ต้องการศึกษาต่อ */}
                    {isFurtherStudyIntention && (
                        <div className="bg-purple-50 p-5 rounded-lg border border-purple-200 space-y-4">
                            <p className="text-lg font-bold text-purple-700">รายละเอียดการศึกษาต่อ</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* furtherStudyLevel */}
                                <div>
                                    <label htmlFor="furtherStudyLevel" className={labelClass}>ระดับการศึกษาที่ต้องการศึกษาต่อ *</label>
                                    <select id="furtherStudyLevel" name="furtherStudyLevel" value={formData.furtherStudyLevel} onChange={handleChange} className={inputClass} required={isFurtherStudyIntention}>
                                        <option value="">-- เลือกระดับ --</option>
                                        <option value="ปริญญาตรี">ระดับปริญญาตรี</option>
                                        <option value="ปริญญาโท">ระดับปริญญาโท</option>
                                        <option value="ปริญญาเอก">ระดับปริญญาเอก</option>
                                    </select>
                                </div>

                                {/* furtherStudyMajor */}
                                <div>
                                    <label htmlFor="furtherStudyMajor" className={labelClass}>สาขาที่ต้องการศึกษาต่อ *</label>
                                    <select id="furtherStudyMajor" name="furtherStudyMajor" value={formData.furtherStudyMajor} onChange={handleChange} className={inputClass} required={isFurtherStudyIntention}>
                                        <option value="">-- เลือกสาขา --</option>
                                        <option value="สาขาเดิม">ศึกษาต่อสาขาเดิม</option>
                                        <option value="ระบุสาขา">ระบุสาขาใหม่</option>
                                    </select>
                                    {isFurtherStudyMajorNew && (
                                        <input name="furtherStudyMajorDetail" value={formData.furtherStudyMajorDetail} onChange={handleChange} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุสาขาใหม่" required />
                                    )}
                                </div>

                                {/* furtherStudyReason */}
                                <div className="md:col-span-2">
                                    <label htmlFor="furtherStudyReason" className={labelClass}>เหตุผลที่ท่านต้องการศึกษาต่อ *</label>
                                    <select id="furtherStudyReason" name="furtherStudyReason" value={formData.furtherStudyReason} onChange={handleChange} className={inputClass} required={isFurtherStudyIntention}>
                                        <option value="">-- เลือกเหตุผล --</option>
                                        <option value="1">1 เพื่อเพิ่มพูนความรู้ความสามารถ</option>
                                        <option value="2">2 เพื่อปรับวุฒิการศึกษา</option>
                                        <option value="3">3 เพื่อปรับปรุงตำแหน่งหน้าที่การงาน</option>
                                        <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                    </select>
                                    {isFurtherStudyReasonOther && (
                                        <input name="furtherStudyReasonOther" value={formData.furtherStudyReasonOther} onChange={handleChange} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุเหตุผลอื่นๆ" required />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </FormSection>

                {/* --- 5. ข้อเสนอแนะ --- */}
                <FormSection title="5. ข้อเสนอแนะ" icon={MessageSquare}>
                    <div className="mb-8">
                        <label htmlFor="suggestion" className={labelClass}>ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย (ไม่บังคับ)</label>
                        <textarea
                            id="suggestion"
                            name="suggestion"
                            value={formData.suggestion}
                            onChange={handleChange}
                            rows={4}
                            className={`${inputClass} resize-none`}
                            placeholder="กรอกข้อเสนอแนะที่นี่..."
                        />
                    </div>
                </FormSection>

                {/* --- ปุ่มควบคุม --- */}
                <div className="mt-8 flex justify-end gap-3 pt-6 border-t">

                    <Link
                        href="/EmploymentDashboard"
                        className="flex items-center gap-1 px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition font-medium"
                    >
                        <X className="w-4 h-4" /> ยกเลิก
                    </Link>

                    {/* ปุ่มบันทึก */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-md shadow-lg hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                        บันทึกการแก้ไข
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SuveryEditForm;