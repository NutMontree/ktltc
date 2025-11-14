// src/components/SuveryEditForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Isuvery } from '@/components/Isuvery'; // Import Interface

// 💡 กำหนด Type สำหรับ Props
interface SuveryEditFormProps {
    suvery: Isuvery;
}

export default function SuveryEditForm({ suvery }: SuveryEditFormProps) {
    const router = useRouter();

    // 1. จัดการ State ของฟอร์ม (ใช้ _id เป็นตัวระบุ)
    // 💡 การกำหนด State ของฟอร์มควรทำอย่างละเอียดตาม Isuvery
    const [formData, setFormData] = useState<Omit<Isuvery, '_id' | 'createdAt' | 'updatedAt'>>(
        // ใช้ข้อมูลเดิมจาก props
        {
            roomId: suvery.roomId || '',
            studentId: suvery.studentId || '',
            fullName: suvery.fullName || '',
            age: suvery.age || '',
            gender: suvery.gender || '',
            addrNumber: suvery.addrNumber || '',
            addrBuilding: suvery.addrBuilding || '',
            addrMoo: suvery.addrMoo || '',
            addrSoi: suvery.addrSoi || '',
            addrRoad: suvery.addrRoad || '',
            addrSubDistrict: suvery.addrSubDistrict || '',
            addrDistrict: suvery.addrDistrict || '',
            addrProvince: suvery.addrProvince || '',
            addrZipCode: suvery.addrZipCode || '',
            contactTel: suvery.contactTel || '',
            contactEmail: suvery.contactEmail || '',
            homeProvince: suvery.homeProvince || '',
            graduationYear: suvery.graduationYear || '',
            educationLevel: suvery.educationLevel || '',
            gpa: suvery.gpa || '',
            currentStatus: suvery.currentStatus || '',
            notWorkingReasonGroup: suvery.notWorkingReasonGroup || '',
            notWorkingReasonOther: suvery.notWorkingReasonOther || '',
            employmentType: suvery.employmentType || '',
            employmentTypeOther: suvery.employmentTypeOther || '',
            jobTitle: suvery.jobTitle || '',
            workplaceName: suvery.workplaceName || '',
            workplaceAddrNumber: suvery.workplaceAddrNumber || '',
            workplaceAddrMoo: suvery.workplaceAddrMoo || '',
            workplaceAddrSoi: suvery.workplaceAddrSoi || '',
            workplaceAddrRoad: suvery.workplaceAddrRoad || '',
            workplaceAddrSubDistrict: suvery.workplaceAddrSubDistrict || '',
            workplaceAddrDistrict: suvery.workplaceAddrDistrict || '',
            workplaceAddrProvince: suvery.workplaceAddrProvince || '',
            workplaceAddrZipCode: suvery.workplaceAddrZipCode || '',
            workplaceTel: suvery.workplaceTel || '',
            salaryRange: suvery.salaryRange || '',
            salaryRangeOther: suvery.salaryRangeOther || '',
            jobMatch: suvery.jobMatch || '',
            jobSatisfaction: suvery.jobSatisfaction || '',
            unemployedReason: suvery.unemployedReason || '',
            unemployedReasonOther: suvery.unemployedReasonOther || '',
            furtherStudyIntention: suvery.furtherStudyIntention || '',
            furtherStudyLevel: suvery.furtherStudyLevel || '',
            furtherStudyMajor: suvery.furtherStudyMajor || '',
            furtherStudyMajorDetail: suvery.furtherStudyMajorDetail || '',
            furtherStudyReason: suvery.furtherStudyReason || '',
            furtherStudyReasonOther: suvery.furtherStudyReasonOther || '',
            jobSearchProblem: suvery.jobSearchProblem || '',
            suggestion: suvery.suggestion || '',
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    // 2. ฟังก์ชันจัดการการส่งฟอร์ม (Submission Handler)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.studentId || !formData.fullName) {
            setError('กรุณากรอกข้อมูลที่จำเป็น (รหัสนักศึกษาและชื่อ-สกุล).');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 💡 เรียกใช้ PUT API Route แบบ Dynamic Path (/api/suvery/[id])
            const res = await fetch(`/api/suvery/${suvery._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // ส่งเฉพาะข้อมูลที่ต้องการอัปเดต
            });

            if (res.ok) {
                alert("✅ อัปเดตข้อมูลสำเร็จแล้ว");
                router.refresh();
                router.push('/'); // นำทางผู้ใช้ไปยังหน้าหลัก
            } else {
                const errorData = await res.json();
                setError(errorData.message || 'การอัปเดตข้อมูลล้มเหลว.');
            }
        } catch (err: any) {
            console.error('Submission error:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย');
        } finally {
            setIsLoading(false);
        }
    };

    // 3. โครงสร้าง Form (ตัวอย่างเฉพาะฟิลด์พื้นฐาน)
    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl space-y-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-violet-600">ข้อมูลส่วนตัว (ID: {suvery._id})</h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">เกิดข้อผิดพลาด:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา *</label>
                <input
                    id="studentId"
                    type="text"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
                    disabled={isLoading}
                />
            </div>

            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-สกุล *</label>
                <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
                    disabled={isLoading}
                />
            </div>

            {/* 💡 ควรเพิ่ม Field อื่นๆ ทั้งหมดที่นี่ โดยใช้ formData.[field_name] และ onChange={handleChange} */}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    className={`px-6 py-2 text-sm font-medium rounded-md text-white transition duration-150 ${isLoading
                            ? 'bg-violet-400 cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500'
                        }`}
                    disabled={isLoading}
                >
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข 💾'}
                </button>
            </div>
        </form>
    );
}