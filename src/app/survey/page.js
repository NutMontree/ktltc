// my-projext/src/app/survey/page.js

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- State Initialization (ใช้สำหรับฟอร์มที่มี Field เยอะมาก) ---
const initialFormData = {
    // 1. ข้อมูลส่วนตัว
    studentId: '',
    fullName: '',
    age: '',

    // 2. ที่อยู่ที่ติดต่อได้
    addrNumber: '',
    addrBuilding: '',
    addrMoo: '',
    addrSoi: '',
    addrRoad: '',
    addrSubDistrict: '',
    addrDistrict: '',
    addrProvince: '',
    addrZipCode: '',
    contactTel: '',
    contactEmail: '',

    // 3. ข้อมูลการศึกษา
    homeProvince: '',
    // college: 'วิทยาลัยเทคนิคกันทรลักษ์', // กำหนดค่าตายตัว ไม่ต้องอยู่ใน State ถ้าไม่เปลี่ยน
    // collegeProvince: 'ศรีสะเกษ', // กำหนดค่าตายตัว
    graduationYear: '',
    educationLevel: '', // ปวช./ปวส.
    gender: '', // ชาย/หญิง
    gpa: '', // เกรดเฉลี่ยสะสม

    // 4. สถานการณ์ทำงานปัจจุบัน
    currentStatus: '', // 1 ไม่ได้ทำงาน / 2 ทำงานแล้ว

    // 4.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
    notWorkingReasonGroup: '', // ศึกษาต่อ, หางานทำไม่ได้, รอฟังคำตอบ, ไม่ประสงค์จะทำงาน
    notWorkingReasonOther: '', // อื่นๆ (โปรดระบุ)

    // 4.2 ข้อมูลเมื่อ "ทำงานแล้ว"
    employmentType: '', // ข้าราชการ, รัฐวิสาหกิจ, พนักงานบริษัท, ดำเนินธุรกิจอิสระ, พนักงานองค์กรต่างประเทศ, อื่นๆ
    employmentTypeOther: '', // อื่นๆ (โปรดระบุ)
    jobTitle: '',
    workplaceName: '',
    workplaceAddrNumber: '',
    workplaceAddrMoo: '',
    workplaceAddrSoi: '',
    workplaceAddrRoad: '',
    workplaceAddrSubDistrict: '',
    workplaceAddrDistrict: '',
    workplaceAddrProvince: '',
    workplaceAddrZipCode: '',
    workplaceTel: '',

    // 5. รายได้และลักษณะงาน
    salaryRange: '', // 1, 2, 3, 4, 5
    salaryRangeOther: '', // อื่นๆ (โปรดระบุ)
    jobMatch: '', // 1 ตรง / 2 ไม่ตรง
    jobSatisfaction: '', // 1 พึงพอใจ / 2 ไม่พึงพอใจ

    // 6. สาเหตุที่ยังไม่ได้ทำงาน (ใช้เฉพาะในกรณีไม่ได้ทำงานและไม่ใช่ศึกษาต่อ)
    unemployedReason: '', // 1, 2, 3, 4
    unemployedReasonOther: '', // อื่นๆ (โปรดระบุ)

    // 7. การศึกษาต่อ
    furtherStudyIntention: '', // ต้องการศึกษาต่อ / ไม่ต้องการศึกษาต่อ
    furtherStudyLevel: '', // ระดับปริญญาตรี, โท, เอก
    furtherStudyMajor: '', // สาขาเดิม / ระบุสาขา
    furtherStudyMajorDetail: '', // ระบุสาขา (text input)
    furtherStudyReason: '', // 1, 2, 3, 4
    furtherStudyReasonOther: '', // อื่นๆ (โปรดระบุ)

    // 8. ปัญหาในการหางาน (ใช้เฉพาะในกรณีที่ระบุว่า "หางานทำไม่ได้" ในข้อ 4.1)
    jobSearchProblem: '', // ไม่มีปัญหา, 1, 2, ...

    // 9. ข้อเสนอแนะ
    suggestion: '',
};

// -----------------------------------------------------------

export default function GraduateSurveyForm() {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const collegeName = 'วิทยาลัยเทคนิคกันทรลักษ์';
    const collegeProvince = 'ศรีสะเกษ';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ฟังก์ชันจัดการ Logic การแสดงผลตามเงื่อนไข
    const isWorking = formData.currentStatus === '2';
    const isNotWorking = formData.currentStatus === '1';

    const isEmploymentTypeOther = isWorking && formData.employmentType === 'อื่นๆ';

    const isSalaryOther = isWorking && formData.salaryRange === '5';

    const isFurtherStudy = formData.furtherStudyIntention === 'ต้องการศึกษาต่อ';
    const isFurtherStudyReasonOther = isFurtherStudy && formData.furtherStudyReason === '4';

    const isUnemployedOther = isNotWorking && formData.unemployedReason === '4';

    const isUnemployedLookingForJob = isNotWorking && formData.notWorkingReasonGroup === 'หางานทำไม่ได้';

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 💡 ในโปรเจกต์จริง ควรมี Validation ที่ละเอียดกว่านี้
        if (!formData.fullName || !formData.studentId) {
            alert('กรุณากรอกชื่อและรหัสนักศึกษาให้ครบถ้วน');
            return;
        }

        // 💡 เพิ่มการเก็บวันเวลาที่กรอกข้อมูล
        const submissionData = {
            ...formData,
            college: collegeName,
            collegeProvince: collegeProvince,
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);

        // 💡 สมมติว่ามี API Route สำหรับรับข้อมูลสำรวจนี้
        try {
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (res.ok) {
                alert('บันทึกข้อมูลสำรวจสำเร็จ!');
                router.push('/EmploymentDashboard'); // นำทางกลับ Dashboard
            } else {
                throw new Error('Failed to submit survey data');
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">📋 แบบสำรวจภาวะการมีงานทำของศิษย์เก่า</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-white p-10 rounded-xl shadow-2xl border border-gray-100">

                {/* --- 1. ข้อมูลส่วนตัวและติดต่อ --- */}
                <section className="space-y-4 border-b pb-6">
                    <h2 className="text-2xl font-semibold text-blue-700">1. ข้อมูลส่วนตัวและการติดต่อ</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="studentId" onChange={handleChange} value={formData.studentId} className="input-field" type="text" placeholder="รหัสนักศึกษา *" required />
                        <input name="fullName" onChange={handleChange} value={formData.fullName} className="input-field" type="text" placeholder="ชื่อ-สกุล *" required />
                        <input name="age" onChange={handleChange} value={formData.age} className="input-field" type="number" placeholder="อายุ" min="15" />
                        <input name="contactTel" onChange={handleChange} value={formData.contactTel} className="input-field" type="tel" placeholder="เบอร์ที่สามารถติดต่อได้" />
                        <input name="contactEmail" onChange={handleChange} value={formData.contactEmail} className="input-field md:col-span-2" type="email" placeholder="E-mail" />
                    </div>

                    <h3 className="text-xl font-medium text-gray-700 pt-4">ที่อยู่ที่สามารถติดต่อได้</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <input name="addrNumber" onChange={handleChange} value={formData.addrNumber} className="input-field" type="text" placeholder="เลขที่" />
                        <input name="addrBuilding" onChange={handleChange} value={formData.addrBuilding} className="input-field" type="text" placeholder="อาคาร/หมู่บ้าน" />
                        <input name="addrMoo" onChange={handleChange} value={formData.addrMoo} className="input-field" type="text" placeholder="หมู่" />
                        <input name="addrSoi" onChange={handleChange} value={formData.addrSoi} className="input-field" type="text" placeholder="ซอย" />
                        <input name="addrRoad" onChange={handleChange} value={formData.addrRoad} className="input-field" type="text" placeholder="ถนน" />
                        <input name="addrSubDistrict" onChange={handleChange} value={formData.addrSubDistrict} className="input-field" type="text" placeholder="ตำบล/แขวง" />
                        <input name="addrDistrict" onChange={handleChange} value={formData.addrDistrict} className="input-field" type="text" placeholder="อำเภอ/เขต" />
                        <input name="addrProvince" onChange={handleChange} value={formData.addrProvince} className="input-field" type="text" placeholder="จังหวัด" />
                        <input name="addrZipCode" onChange={handleChange} value={formData.addrZipCode} className="input-field" type="text" placeholder="รหัสไปรษณี" />
                    </div>
                </section>

                {/* --- 2. ข้อมูลการศึกษา --- */}
                <section className="space-y-4 border-b pb-6">
                    <h2 className="text-2xl font-semibold text-blue-700">2. ข้อมูลการศึกษา</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label className="input-label">วิทยาลัยที่จบ:</label>
                            <input value={collegeName} className="input-field bg-gray-100 cursor-not-allowed" type="text" disabled />
                        </div>
                        <div className="flex flex-col">
                            <label className="input-label">จังหวัด (วิทยาลัย):</label>
                            <input value={collegeProvince} className="input-field bg-gray-100 cursor-not-allowed" type="text" disabled />
                        </div>
                        <input name="homeProvince" onChange={handleChange} value={formData.homeProvince} className="input-field" type="text" placeholder="ภูมิลำเนา (จังหวัด)" />
                        <input name="graduationYear" onChange={handleChange} value={formData.graduationYear} className="input-field" type="number" placeholder="ปีที่จบการศึกษา" min="1990" />
                    </div>

                    {/* ระดับการศึกษาสายอาชีวศึกษาที่จบ */}
                    <div className="flex flex-col">
                        <label className="input-label">ระดับการศึกษาสายอาชีวศึกษาที่จบ:</label>
                        <select name="educationLevel" onChange={handleChange} value={formData.educationLevel} className="input-field" required>
                            <option value="">-- เลือกระดับการศึกษา --</option>
                            <option value="ปวช">ระดับประกาศนียบัตรวิชาชีพ (ปวช.)</option>
                            <option value="ปวส">ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</option>
                        </select>
                    </div>

                    {/* เพศ */}
                    <div className="flex flex-col">
                        <label className="input-label">เพศ:</label>
                        <div className="flex gap-4">
                            <label><input type="radio" name="gender" value="ชาย" checked={formData.gender === 'ชาย'} onChange={handleChange} className="mr-2" />ชาย</label>
                            <label><input type="radio" name="gender" value="หญิง" checked={formData.gender === 'หญิง'} onChange={handleChange} className="mr-2" />หญิง</label>
                        </div>
                    </div>

                    <input name="gpa" onChange={handleChange} value={formData.gpa} className="input-field" type="number" step="0.01" min="0.00" max="4.00" placeholder="เกรดเฉลี่ยสะสมตลอดหลักสูตร" />
                </section>

                {/* --- 3. สถานการณ์ทำงานปัจจุบัน --- */}
                <section className="space-y-4 border-b pb-6">
                    <h2 className="text-2xl font-semibold text-blue-700">3. สถานการณ์ทำงานปัจจุบัน</h2>

                    <div className="flex flex-col">
                        <label className="input-label">สถานการณ์ทำงานปัจจุบัน:</label>
                        <select name="currentStatus" onChange={handleChange} value={formData.currentStatus} className="input-field" required>
                            <option value="">-- เลือกสถานะ --</option>
                            <option value="1">1 ไม่ได้ทำงาน</option>
                            <option value="2">2 ทำงานแล้ว</option>
                        </select>
                    </div>

                    {/* --- 3.1 ไม่ได้ทำงาน (Conditional Rendering) --- */}
                    {isNotWorking && (
                        <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                            <label className="input-label font-medium">เหตุผลที่ยังไม่ได้ทำงาน:</label>
                            <div className="flex flex-col gap-2">
                                {['ศึกษาต่อ', 'หางานทำไม่ได้', 'รอฟังคำตอบจากหน่วยงาน', 'ไม่ประสงค์จะทำงาน'].map(option => (
                                    <label key={option}>
                                        <input type="radio" name="notWorkingReasonGroup" value={option} checked={formData.notWorkingReasonGroup === option} onChange={handleChange} className="mr-2" />
                                        {option}
                                    </label>
                                ))}
                            </div>

                            {/* แสดงส่วนปัญหาในการหางาน ถ้าเลือก 'หางานทำไม่ได้' */}
                            {isUnemployedLookingForJob && (
                                <div className="mt-4 pt-3 border-t">
                                    <label className="input-label font-medium">ปัญหาในการหางานทำ:</label>
                                    <select name="jobSearchProblem" onChange={handleChange} value={formData.jobSearchProblem} className="input-field mt-1" required>
                                        <option value="">-- เลือกปัญหา --</option>
                                        <option value="ไม่มีปัญหา">ไม่มีปัญหา</option>
                                        <option value="1 ไม่ทราบแหล่งงาน">1 ไม่ทราบแหล่งงาน</option>
                                        <option value="2 หางานที่ถูกใจไม่ได้">2 หางานที่ถูกใจไม่ได้</option>
                                        <option value="3 ต้องสอบจึงไม่อยากสมัคร">3 ต้องสอบจึงไม่อยากสมัคร</option>
                                        <option value="4 ขาดคนสนับสนุน">4 ขาดคนสนับสนุน</option>
                                        <option value="5 ขาดคนหรือเงินค้ำประกัน">5 ขาดคนหรือเงินค้ำประกัน</option>
                                        <option value="6 หน่วยงานไม่ต้องการ">6 หน่วยงานไม่ต้องการ</option>
                                        <option value="7 เงินเดือนน้อย">7 เงินเดือนน้อย</option>
                                        <option value="8 สอบเข้าทำงานไม่ได้">8 สอบเข้าทำงานไม่ได้</option>
                                    </select>
                                </div>
                            )}

                            {/* สาเหตุที่ยังไม่ได้ทำงาน (แยกจากกลุ่มด้านบน) */}
                            <div className="mt-4 pt-3 border-t">
                                <label className="input-label font-medium">สาเหตุที่ยังไม่ได้ทำงาน (รายละเอียด):</label>
                                <select name="unemployedReason" onChange={handleChange} value={formData.unemployedReason} className="input-field mt-1" required>
                                    <option value="">-- เลือกสาเหตุ --</option>
                                    <option value="1">1 ยังไม่ประสงค์ทำงาน</option>
                                    <option value="2">2 รอฟังคำตอบจากหน่วยงาน</option>
                                    <option value="3">3 หางานทำไม่ได้</option>
                                    <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                </select>
                                {isUnemployedOther && (
                                    <input name="unemployedReasonOther" onChange={handleChange} value={formData.unemployedReasonOther} className="input-field mt-2" type="text" placeholder="โปรดระบุสาเหตุอื่นๆ" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- 3.2 ทำงานแล้ว (Conditional Rendering) --- */}
                    {isWorking && (
                        <div className="bg-green-50 p-4 rounded-lg space-y-4 border border-green-200">
                            <label className="input-label font-medium">ประเภทหน่วยงาน/สถานะการทำงาน:</label>
                            <select name="employmentType" onChange={handleChange} value={formData.employmentType} className="input-field" required>
                                <option value="">-- เลือกประเภท --</option>
                                <option value="ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ">ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ</option>
                                <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                                <option value="พนักงานบริษัทิ/องค์กรธุรกิจเอกชน">พนักงานบริษัทิ/องค์กรธุรกิจเอกชน</option>
                                <option value="ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ">ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ</option>
                                <option value="พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ">พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                            {isEmploymentTypeOther && (
                                <input name="employmentTypeOther" onChange={handleChange} value={formData.employmentTypeOther} className="input-field mt-2" type="text" placeholder="โปรดระบุประเภทอื่นๆ" />
                            )}

                            <h3 className="text-xl font-medium text-gray-700 pt-4">รายละเอียดงานและสถานที่</h3>
                            <input name="jobTitle" onChange={handleChange} value={formData.jobTitle} className="input-field" type="text" placeholder="ตำแหน่งงานและหน้าที่ที่รับผิดชอบ" />
                            <input name="workplaceName" onChange={handleChange} value={formData.workplaceName} className="input-field" type="text" placeholder="ชื่อสถานที่ทำงาน" />
                            <input name="workplaceTel" onChange={handleChange} value={formData.workplaceTel} className="input-field" type="tel" placeholder="เบอร์โทรศัพท์สถานที่ทำงาน" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <input name="workplaceAddrNumber" onChange={handleChange} value={formData.workplaceAddrNumber} className="input-field" type="text" placeholder="เลขที่" />
                                <input name="workplaceAddrMoo" onChange={handleChange} value={formData.workplaceAddrMoo} className="input-field" type="text" placeholder="หมู่" />
                                <input name="workplaceAddrSoi" onChange={handleChange} value={formData.workplaceAddrSoi} className="input-field" type="text" placeholder="ซอย" />
                                <input name="workplaceAddrRoad" onChange={handleChange} value={formData.workplaceAddrRoad} className="input-field" type="text" placeholder="ถนน" />
                                <input name="workplaceAddrSubDistrict" onChange={handleChange} value={formData.workplaceAddrSubDistrict} className="input-field" type="text" placeholder="ตำบล/แขวง" />
                                <input name="workplaceAddrDistrict" onChange={handleChange} value={formData.workplaceAddrDistrict} className="input-field" type="text" placeholder="อำเภอ/เขต" />
                                <input name="workplaceAddrProvince" onChange={handleChange} value={formData.workplaceAddrProvince} className="input-field" type="text" placeholder="จังหวัด" />
                                <input name="workplaceAddrZipCode" onChange={handleChange} value={formData.workplaceAddrZipCode} className="input-field" type="text" placeholder="รหัสไปรษณี" />
                            </div>

                            <h3 className="text-xl font-medium text-gray-700 pt-4">รายได้และความพึงพอใจ</h3>

                            <div className="flex flex-col">
                                <label className="input-label">ปัจจุบันท่านได้รับเงินค่าจ้าง (โดยเฉลี่ยต่อเดือน):</label>
                                <select name="salaryRange" onChange={handleChange} value={formData.salaryRange} className="input-field" required>
                                    <option value="">-- เลือกช่วงรายได้ --</option>
                                    <option value="1">1 ต่ำกว่า 7,940 บาท</option>
                                    <option value="2">2 7,941 - 10,000 บาท</option>
                                    <option value="3">3 10,001 - 15,000 บาท</option>
                                    <option value="4">4 15,001 - 20,000 บาท</option>
                                    <option value="5">5 อื่นๆ (โปรดระบุ)</option>
                                </select>
                                {isSalaryOther && (
                                    <input name="salaryRangeOther" onChange={handleChange} value={formData.salaryRangeOther} className="input-field mt-2" type="text" placeholder="โปรดระบุจำนวนเงิน" />
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="input-label">ลักษณะงานที่ทำ ตรงกับสาขาที่ท่านได้สำเร็จการศึกษาหรือไม่:</label>
                                <div className="flex gap-4">
                                    <label><input type="radio" name="jobMatch" value="1" checked={formData.jobMatch === '1'} onChange={handleChange} className="mr-2" />1 ตรง</label>
                                    <label><input type="radio" name="jobMatch" value="2" checked={formData.jobMatch === '2'} onChange={handleChange} className="mr-2" />2 ไม่ตรง</label>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="input-label">ท่านพึงพอใจกับงานที่ทำอยู่๋ในปัจจุบันหรือไม่:</label>
                                <div className="flex gap-4">
                                    <label><input type="radio" name="jobSatisfaction" value="1" checked={formData.jobSatisfaction === '1'} onChange={handleChange} className="mr-2" />1 พึงพอใจ</label>
                                    <label><input type="radio" name="jobSatisfaction" value="2" checked={formData.jobSatisfaction === '2'} onChange={handleChange} className="mr-2" />2 ไม่พึงพอใจ</label>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* --- 4. การศึกษาต่อ --- */}
                <section className="space-y-4 border-b pb-6">
                    <h2 className="text-2xl font-semibold text-blue-700">4. การศึกษาต่อ</h2>

                    <div className="flex flex-col">
                        <label className="input-label">ความต้องการศึกษาต่อ:</label>
                        <div className="flex gap-4">
                            <label><input type="radio" name="furtherStudyIntention" value="ต้องการศึกษาต่อ" checked={formData.furtherStudyIntention === 'ต้องการศึกษาต่อ'} onChange={handleChange} className="mr-2" />ต้องการศึกษาต่อ</label>
                            <label><input type="radio" name="furtherStudyIntention" value="ไม่ต้องการศึกษาต่อ" checked={formData.furtherStudyIntention === 'ไม่ต้องการศึกษาต่อ'} onChange={handleChange} className="mr-2" />ไม่ต้องการศึกษาต่อ</label>
                        </div>
                    </div>

                    {isFurtherStudy && (
                        <div className="bg-yellow-50 p-4 rounded-lg space-y-3 border border-yellow-200">
                            <div className="flex flex-col">
                                <label className="input-label">ระดับการศึกษาที่ต้องการศึกษาต่อ/กำลังศึกษาต่อ:</label>
                                <select name="furtherStudyLevel" onChange={handleChange} value={formData.furtherStudyLevel} className="input-field" required>
                                    <option value="">-- เลือกระดับ --</option>
                                    <option value="1">1 ระดับปริญญาตรี</option>
                                    <option value="2">2 ระดับปริญญาโท</option>
                                    <option value="3">3 ระดับปริญญาเอก</option>
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="input-label">สาขาที่ท่านต้องการศึกษาต่อ/กำลังศึกษาต่อ:</label>
                                <select name="furtherStudyMajor" onChange={handleChange} value={formData.furtherStudyMajor} className="input-field" required>
                                    <option value="">-- เลือกสาขา --</option>
                                    <option value="สาขาเดิม">สาขาเดิม</option>
                                    <option value="ระบุสาขา">ระบุสาขา</option>
                                </select>
                                {formData.furtherStudyMajor === 'ระบุสาขา' && (
                                    <input name="furtherStudyMajorDetail" onChange={handleChange} value={formData.furtherStudyMajorDetail} className="input-field mt-2" type="text" placeholder="โปรดระบุสาขาใหม่" />
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="input-label">สาเหตุที่ต้องการศึกษาต่อ:</label>
                                <select name="furtherStudyReason" onChange={handleChange} value={formData.furtherStudyReason} className="input-field" required>
                                    <option value="">-- เลือกสาเหตุ --</option>
                                    <option value="1">1 เป็นความต้องการของบิดา/มารดา หรือผู้ปกครอง</option>
                                    <option value="2">2 ได้รับทุนการศึกษาต่อ</option>
                                    <option value="3">3 งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.</option>
                                    <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                </select>
                                {isFurtherStudyReasonOther && (
                                    <input name="furtherStudyReasonOther" onChange={handleChange} value={formData.furtherStudyReasonOther} className="input-field mt-2" type="text" placeholder="โปรดระบุสาเหตุอื่นๆ" />
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* --- 5. ข้อเสนอแนะ --- */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-blue-700">5. ข้อเสนอแนะ</h2>
                    <textarea name="suggestion" onChange={handleChange} value={formData.suggestion} className="input-field h-32 resize-none" placeholder="ข้อเสนอแนะ" />
                </section>

                {/* --- ปุ่มส่งข้อมูล --- */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <Link href="/EmploymentDashboard" className="button-cancel">
                        ยกเลิก
                    </Link>
                    <button
                        type="submit"
                        className={`button-submit ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'กำลังบันทึก...' : '✅ ตกลง'}
                    </button>
                </div>
            </form>

            {/* 💡 Note: Success Modal จากหน้า Add/Edit สามารถนำมาใช้กับหน้านี้ได้ถ้าต้องการ */}
        </div>
    );
}

// --- Global Styles for Form (เพื่อให้โค้ดหลักสะอาดขึ้น) ---
// Note: ในโปรเจกต์จริง ควรใช้ Global CSS หรือ Component
/*
.input-field {
    @apply border border-slate-300 px-4 py-3 rounded-lg focus:ring-4 focus:ring-blue-100 outline-none transition duration-150;
}
.input-label {
    @apply text-gray-600 mb-1 text-sm;
}
.button-cancel {
    @apply bg-white text-gray-800 border border-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300;
}
.button-submit {
    @apply font-bold py-3 px-6 rounded-lg transition duration-300;
}
*/