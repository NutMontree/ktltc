"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, GraduationCap, Briefcase, ChevronRight, BookOpen, MessageSquare, Check, X, Loader2 } from 'lucide-react';

const initialFormData = {
    // 1. ข้อมูลส่วนตัว
    roomId: '',
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

const inputClass = "w-full p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-150";
const labelClass = "text-sm font-semibold text-gray-700 mb-1";

const FormSection = ({ title, icon: Icon, children }) => (
    <section className="space-y-4 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-bold flex items-center text-blue-700">
            {Icon && <Icon className="w-6 h-6 mr-3 text-blue-500" />}
            {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </section>
);

export default function GraduatesuveryForm() {
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const collegeName = 'วิทยาลัยเทคนิคกันทรลักษ์';
    const collegeProvince = 'ศรีสะเกษ';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'radio' ? value : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };


    const isWorking = formData.currentStatus === '2';
    const isNotWorking = formData.currentStatus === '1';
    const isEmploymentTypeOther = isWorking && formData.employmentType === 'อื่นๆ';
    const isSalaryOther = isWorking && formData.salaryRange === '5';
    const isFurtherStudy = formData.furtherStudyIntention === 'ต้องการศึกษาต่อ';
    const isFurtherStudyReasonOther = isFurtherStudy && formData.furtherStudyReason === '4';
    const isUnemployedOther = isNotWorking && formData.unemployedReason === '4';
    const isUnemployedLookingForJob = isNotWorking && formData.notWorkingReasonGroup === 'หางานทำไม่ได้';

    const showMessage = (msg, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${msg}`);
        if (typeof window !== 'undefined') {
            window.alert(msg);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.studentId) {
            showMessage('กรุณากรอกชื่อและรหัสนักศึกษาให้ครบถ้วน', 'warning');
            return;
        }

        const submissionData = {
            ...formData,
            college: collegeName,
            collegeProvince: collegeProvince,
            submittedAt: new Date().toISOString(),
        };

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const isMockSuccess = true;
            if (isMockSuccess) {
                showMessage('บันทึกข้อมูลสำรวจสำเร็จ!', 'success');
                router.push('/EmploymentDashboard'); 
            } else {
                throw new Error('Failed to submit survey data');
            }
        } catch (error) {
            console.error(error);
            showMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูลสำรวจ', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-inter py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                        📋 แบบสำรวจภาวะการมีงานทำของศิษย์เก่า
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        {collegeName} จังหวัด{collegeProvince}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-100 space-y-12">

                    {/* --- 1. ข้อมูลส่วนตัวและติดต่อ --- */}
                    <FormSection title="1. ข้อมูลส่วนตัวและการติดต่อ" icon={User}>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="studentId">รหัสนักศึกษา *</label>
                                <input id="studentId" name="studentId" onChange={handleChange} value={formData.studentId} className={inputClass} type="text" placeholder="รหัสนักศึกษา" required />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="fullName">ชื่อ-สกุล *</label>
                                <input id="fullName" name="fullName" onChange={handleChange} value={formData.fullName} className={inputClass} type="text" placeholder="ชื่อ-สกุล" required />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="roomId">ห้องเรียน *</label>
                                <input id="roomId" name="roomId" onChange={handleChange} value={formData.roomId} className={inputClass} type="text" placeholder="ห้องเรียน" required />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="age">อายุ</label>
                                <input id="age" name="age" onChange={handleChange} value={formData.age} className={inputClass} type="number" placeholder="อายุ" min="15" />
                            </div>
                            <div className="col-span-1">
                                <label className={labelClass} htmlFor="contactTel">เบอร์ที่สามารถติดต่อได้</label>
                                <input id="contactTel" name="contactTel" onChange={handleChange} value={formData.contactTel} className={inputClass} type="tel" placeholder="เบอร์โทรศัพท์" />
                            </div>
                            <div className="md:col-span-1">
                                <label className={labelClass} htmlFor="contactEmail">E-mail</label>
                                <input id="contactEmail" name="contactEmail" onChange={handleChange} value={formData.contactEmail} className={inputClass} type="email" placeholder="E-mail" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 pt-4 border-t mt-6">ที่อยู่ที่สามารถติดต่อได้</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <input name="addrNumber" onChange={handleChange} value={formData.addrNumber} className={inputClass} type="text" placeholder="เลขที่" />
                            <input name="addrBuilding" onChange={handleChange} value={formData.addrBuilding} className={inputClass} type="text" placeholder="อาคาร/หมู่บ้าน" />
                            <input name="addrMoo" onChange={handleChange} value={formData.addrMoo} className={inputClass} type="text" placeholder="หมู่" />
                            <input name="addrSoi" onChange={handleChange} value={formData.addrSoi} className={inputClass} type="text" placeholder="ซอย" />
                            <input name="addrRoad" onChange={handleChange} value={formData.addrRoad} className={inputClass} type="text" placeholder="ถนน" />
                            <input name="addrSubDistrict" onChange={handleChange} value={formData.addrSubDistrict} className={inputClass} type="text" placeholder="ตำบล/แขวง" />
                            <input name="addrDistrict" onChange={handleChange} value={formData.addrDistrict} className={inputClass} type="text" placeholder="อำเภอ/เขต" />
                            <input name="addrProvince" onChange={handleChange} value={formData.addrProvince} className={inputClass} type="text" placeholder="จังหวัด" />
                            <input name="addrZipCode" onChange={handleChange} value={formData.addrZipCode} className={inputClass} type="text" placeholder="รหัสไปรษณี" />
                        </div>
                    </FormSection>

                    {/* --- 2. ข้อมูลการศึกษา --- */}
                    <FormSection title="2. ข้อมูลการศึกษา" icon={GraduationCap}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col">
                                <label className={labelClass}>วิทยาลัยที่จบ:</label>
                                <input value={collegeName} className={`${inputClass} bg-gray-100 cursor-not-allowed text-gray-600`} type="text" disabled />
                            </div>
                            <div className="flex flex-col">
                                <label className={labelClass}>จังหวัด (วิทยาลัย):</label>
                                <input value={collegeProvince} className={`${inputClass} bg-gray-100 cursor-not-allowed text-gray-600`} type="text" disabled />
                            </div>
                            <div className="flex flex-col">
                                <label className={labelClass} htmlFor="homeProvince">ภูมิลำเนา (จังหวัด)</label>
                                <input id="homeProvince" name="homeProvince" onChange={handleChange} value={formData.homeProvince} className={inputClass} type="text" placeholder="ภูมิลำเนา (จังหวัด)" />
                            </div>
                            <div className="flex flex-col">
                                <label className={labelClass} htmlFor="graduationYear">ปีที่จบการศึกษา</label>
                                <input id="graduationYear" name="graduationYear" onChange={handleChange} value={formData.graduationYear} className={inputClass} type="number" placeholder="ปี พ.ศ. ที่จบการศึกษา" min="1990" />
                            </div>
                        </div>

                        {/* ระดับการศึกษาสายอาชีวศึกษาที่จบ */}
                        <div className="flex flex-col">
                            <label className={labelClass} htmlFor="educationLevel">ระดับการศึกษาสายอาชีวศึกษาที่จบ *</label>
                            <select id="educationLevel" name="educationLevel" onChange={handleChange} value={formData.educationLevel} className={inputClass} required>
                                <option value="">-- เลือกระดับการศึกษา --</option>
                                <option value="ปวช">ระดับประกาศนียบัตรวิชาชีพ (ปวช.)</option>
                                <option value="ปวส">ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</option>
                            </select>
                        </div>

                        {/* เพศ */}
                        <div className="flex flex-col">
                            <label className={labelClass}>เพศ:</label>
                            <div className="flex gap-6 mt-1">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="gender" value="ชาย" checked={formData.gender === 'ชาย'} onChange={handleChange} className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-2 text-gray-700">ชาย</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="gender" value="หญิง" checked={formData.gender === 'หญิง'} onChange={handleChange} className="form-radio h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-2 text-gray-700">หญิง</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className={labelClass} htmlFor="gpa">เกรดเฉลี่ยสะสมตลอดหลักสูตร</label>
                            <input id="gpa" name="gpa" onChange={handleChange} value={formData.gpa} className={inputClass} type="number" step="0.01" min="0.00" max="4.00" placeholder="เช่น 3.50" />
                        </div>
                    </FormSection>

                    {/* --- 3. สถานการณ์ทำงานปัจจุบัน --- */}
                    <FormSection title="3. สถานการณ์ทำงานปัจจุบัน" icon={Briefcase}>
                        <div className="flex flex-col">
                            <label className={labelClass} htmlFor="currentStatus">สถานการณ์ทำงานปัจจุบัน *</label>
                            <select id="currentStatus" name="currentStatus" onChange={handleChange} value={formData.currentStatus} className={inputClass} required>
                                <option value="">-- เลือกสถานะ --</option>
                                <option value="ไม่ได้ทำงาน">1 ไม่ได้ทำงาน</option>
                                <option value="ทำงานแล้ว">2 ทำงานแล้ว</option>
                            </select>
                        </div>

                        {/* --- 3.1 ไม่ได้ทำงาน (Conditional Rendering) --- */}
                        {isNotWorking && (
                            <div className="bg-blue-50 p-6 rounded-xl space-y-4 border border-blue-200 transition duration-300 shadow-inner">
                                <h4 className="text-lg font-bold text-blue-700 flex items-center"><X className="w-5 h-5 mr-2" /> รายละเอียดสำหรับผู้ที่ *ยัง* ไม่ได้ทำงาน</h4>

                                <label className={labelClass}>เหตุผลที่ยังไม่ได้ทำงาน (เลือกกลุ่มเหตุผล):</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['ศึกษาต่อ', 'หางานทำไม่ได้', 'รอฟังคำตอบจากหน่วยงาน', 'ไม่ประสงค์จะทำงาน'].map(option => (
                                        <label key={option} className={`inline-flex items-center p-3 rounded-lg border cursor-pointer transition duration-150 ${formData.notWorkingReasonGroup === option ? 'bg-blue-200 border-blue-500 shadow-md' : 'bg-white hover:bg-gray-100 border-gray-300'}`}>
                                            <input type="radio" name="notWorkingReasonGroup" value={option} checked={formData.notWorkingReasonGroup === option} onChange={handleChange} className="form-radio h-5 w-5 text-blue-600" />
                                            <span className="ml-3 font-medium text-sm">{option}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* แสดงส่วนปัญหาในการหางาน ถ้าเลือก 'หางานทำไม่ได้' */}
                                {isUnemployedLookingForJob && (
                                    <div className="mt-6 pt-4 border-t border-blue-200">
                                        <label className={labelClass} htmlFor="jobSearchProblem">ปัญหาในการหางานทำ (ถ้ามี):</label>
                                        <select id="jobSearchProblem" name="jobSearchProblem" onChange={handleChange} value={formData.jobSearchProblem} className={inputClass} required>
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

                                {/* สาเหตุที่ยังไม่ได้ทำงาน (รายละเอียด) */}
                                <div className="mt-6 pt-4 border-t border-blue-200">
                                    <label className={labelClass} htmlFor="unemployedReason">สาเหตุที่ยังไม่ได้ทำงาน (รายละเอียดเพิ่มเติม):</label>
                                    <select id="unemployedReason" name="unemployedReason" onChange={handleChange} value={formData.unemployedReason} className={inputClass} required>
                                        <option value="">-- เลือกสาเหตุ --</option>
                                        <option value="ยังไม่ประสงค์ทำงาน">1 ยังไม่ประสงค์ทำงาน</option>
                                        <option value="รอฟังคำตอบจากหน่วยงาน">2 รอฟังคำตอบจากหน่วยงาน</option>
                                        <option value="หางานทำไม่ได้">3 หางานทำไม่ได้</option>
                                        <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                    </select>
                                    {isUnemployedOther && (
                                        <input name="unemployedReasonOther" onChange={handleChange} value={formData.unemployedReasonOther} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุสาเหตุอื่นๆ" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- 3.2 ทำงานแล้ว (Conditional Rendering) --- */}
                        {isWorking && (
                            <div className="bg-green-50 p-6 rounded-xl space-y-4 border border-green-200 transition duration-300 shadow-inner">
                                <h4 className="text-lg font-bold text-green-700 flex items-center"><Check className="w-5 h-5 mr-2" /> รายละเอียดสำหรับผู้ที่ *ทำงาน* แล้ว</h4>

                                <div className="flex flex-col">
                                    <label className={labelClass} htmlFor="employmentType">ประเภทหน่วยงาน/สถานะการทำงาน *</label>
                                    <select id="employmentType" name="employmentType" onChange={handleChange} value={formData.employmentType} className={inputClass} required>
                                        <option value="">-- เลือกประเภท --</option>
                                        <option value="ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ">ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ</option>
                                        <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                                        <option value="พนักงานบริษัทิ/องค์กรธุรกิจเอกชน">พนักงานบริษัทิ/องค์กรธุรกิจเอกชน</option>
                                        <option value="ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ">ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ</option>
                                        <option value="พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ">พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                    {isEmploymentTypeOther && (
                                        <input name="employmentTypeOther" onChange={handleChange} value={formData.employmentTypeOther} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุประเภทอื่นๆ" />
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 pt-4 border-t mt-6">รายละเอียดงานและสถานที่</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="jobTitle" onChange={handleChange} value={formData.jobTitle} className={inputClass} type="text" placeholder="ตำแหน่งงานและหน้าที่ที่รับผิดชอบ" />
                                    <input name="workplaceName" onChange={handleChange} value={formData.workplaceName} className={inputClass} type="text" placeholder="ชื่อสถานที่ทำงาน" />
                                    <input name="workplaceTel" onChange={handleChange} value={formData.workplaceTel} className={inputClass} type="tel" placeholder="เบอร์โทรศัพท์สถานที่ทำงาน" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 pt-4 border-t mt-6">ที่อยู่สถานที่ทำงาน</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <input name="workplaceAddrNumber" onChange={handleChange} value={formData.workplaceAddrNumber} className={inputClass} type="text" placeholder="เลขที่" />
                                    <input name="workplaceAddrMoo" onChange={handleChange} value={formData.workplaceAddrMoo} className={inputClass} type="text" placeholder="หมู่" />
                                    <input name="workplaceAddrSoi" onChange={handleChange} value={formData.workplaceAddrSoi} className={inputClass} type="text" placeholder="ซอย" />
                                    <input name="workplaceAddrRoad" onChange={handleChange} value={formData.workplaceAddrRoad} className={inputClass} type="text" placeholder="ถนน" />
                                    <input name="workplaceAddrSubDistrict" onChange={handleChange} value={formData.workplaceAddrSubDistrict} className={inputClass} type="text" placeholder="ตำบล/แขวง" />
                                    <input name="workplaceAddrDistrict" onChange={handleChange} value={formData.workplaceAddrDistrict} className={inputClass} type="text" placeholder="อำเภอ/เขต" />
                                    <input name="workplaceAddrProvince" onChange={handleChange} value={formData.workplaceAddrProvince} className={inputClass} type="text" placeholder="จังหวัด" />
                                    <input name="workplaceAddrZipCode" onChange={handleChange} value={formData.workplaceAddrZipCode} className={inputClass} type="text" placeholder="รหัสไปรษณี" />
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 pt-4 border-t mt-6">รายได้และความพึงพอใจ</h3>
                                <div className="flex flex-col">
                                    <label className={labelClass} htmlFor="salaryRange">ปัจจุบันท่านได้รับเงินค่าจ้าง (โดยเฉลี่ยต่อเดือน) *</label>
                                    <select id="salaryRange" name="salaryRange" onChange={handleChange} value={formData.salaryRange} className={inputClass} required>
                                        <option value="">-- เลือกช่วงรายได้ --</option>
                                        <option value="ต่ำกว่า 7,940 บาท">1 ต่ำกว่า 7,940 บาท</option>
                                        <option value="7,941 - 10,000 บาท">2 7,941 - 10,000 บาท</option>
                                        <option value="10,001 - 15,000 บาท">3 10,001 - 15,000 บาท</option>
                                        <option value="15,001 - 20,000 บาท">4 15,001 - 20,000 บาท</option>
                                        <option value="5">5 อื่นๆ (โปรดระบุ)</option>
                                    </select>
                                    {isSalaryOther && (
                                        <input name="salaryRangeOther" onChange={handleChange} value={formData.salaryRangeOther} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุจำนวนเงิน" />
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass}>ลักษณะงานที่ทำ ตรงกับสาขาที่ท่านได้สำเร็จการศึกษาหรือไม่ *</label>
                                    <div className="flex gap-6 mt-1">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="radio" name="jobMatch" value="ไม่ตรง" checked={formData.jobMatch === '1'} onChange={handleChange} className="form-radio h-5 w-5 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-gray-700">1 ตรง</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="radio" name="jobMatch" value="ไม่ตรง" checked={formData.jobMatch === '2'} onChange={handleChange} className="form-radio h-5 w-5 text-red-600 focus:ring-red-500" />
                                            <span className="ml-2 text-gray-700">2 ไม่ตรง</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass}>ท่านพึงพอใจกับงานที่ทำอยู่๋ในปัจจุบันหรือไม่ *</label>
                                    <div className="flex gap-6 mt-1">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="radio" name="jobSatisfaction" value="พึงพอใจ" checked={formData.jobSatisfaction === '1'} onChange={handleChange} className="form-radio h-5 w-5 text-green-600 focus:ring-green-500" />
                                            <span className="ml-2 text-gray-700">1 พึงพอใจ</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input type="radio" name="jobSatisfaction" value="ไม่พึงพอใจ" checked={formData.jobSatisfaction === '2'} onChange={handleChange} className="form-radio h-5 w-5 text-red-600 focus:ring-red-500" />
                                            <span className="ml-2 text-gray-700">2 ไม่พึงพอใจ</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </FormSection>

                    {/* --- 4. การศึกษาต่อ --- */}
                    <FormSection title="4. การศึกษาต่อ" icon={BookOpen}>
                        <div className="flex flex-col">
                            <label className={labelClass}>ความต้องการศึกษาต่อ:</label>
                            <div className="flex gap-6 mt-1">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="furtherStudyIntention" value="ต้องการศึกษาต่อ" checked={formData.furtherStudyIntention === 'ต้องการศึกษาต่อ'} onChange={handleChange} className="form-radio h-5 w-5 text-purple-600 focus:ring-purple-500" />
                                    <span className="ml-2 text-gray-700">ต้องการศึกษาต่อ</span>
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="radio" name="furtherStudyIntention" value="ไม่ต้องการศึกษาต่อ" checked={formData.furtherStudyIntention === 'ไม่ต้องการศึกษาต่อ'} onChange={handleChange} className="form-radio h-5 w-5 text-gray-600 focus:ring-gray-500" />
                                    <span className="ml-2 text-gray-700">ไม่ต้องการศึกษาต่อ</span>
                                </label>
                            </div>
                        </div>

                        {isFurtherStudy && (
                            <div className="bg-purple-50 p-6 rounded-xl space-y-4 border border-purple-200 transition duration-300 shadow-inner">
                                <div className="flex flex-col">
                                    <label className={labelClass} htmlFor="furtherStudyLevel">ระดับการศึกษาที่ต้องการศึกษาต่อ/กำลังศึกษาต่อ *</label>
                                    <select id="furtherStudyLevel" name="furtherStudyLevel" onChange={handleChange} value={formData.furtherStudyLevel} className={inputClass} required>
                                        <option value="">-- เลือกระดับ --</option>
                                        <option value="ระดับปริญญาตรี">1 ระดับปริญญาตรี</option>
                                        <option value="ระดับปริญญาโท">2 ระดับปริญญาโท</option>
                                        <option value="ระดับปริญญาเอก">3 ระดับปริญญาเอก</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass} htmlFor="furtherStudyMajor">สาขาที่ท่านต้องการศึกษาต่อ/กำลังศึกษาต่อ *</label>
                                    <select id="furtherStudyMajor" name="furtherStudyMajor" onChange={handleChange} value={formData.furtherStudyMajor} className={inputClass} required>
                                        <option value="">-- เลือกสาขา --</option>
                                        <option value="สาขาเดิม">สาขาเดิม (ต่อเนื่อง)</option>
                                        <option value="ระบุสาขา">ระบุสาขา (สาขาใหม่)</option>
                                    </select>
                                    {formData.furtherStudyMajor === 'ระบุสาขา' && (
                                        <input name="furtherStudyMajorDetail" onChange={handleChange} value={formData.furtherStudyMajorDetail} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุสาขาใหม่" />
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass} htmlFor="furtherStudyReason">สาเหตุที่ต้องการศึกษาต่อ *</label>
                                    <select id="furtherStudyReason" name="furtherStudyReason" onChange={handleChange} value={formData.furtherStudyReason} className={inputClass} required>
                                        <option value="">-- เลือกสาเหตุ --</option>
                                        <option value="เป็นความต้องการของบิดา/มารดา หรือผู้ปกครอง">1 เป็นความต้องการของบิดา/มารดา หรือผู้ปกครอง</option>
                                        <option value="ได้รับทุนการศึกษาต่อ">2 ได้รับทุนการศึกษาต่อ</option>
                                        <option value="งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.">3 งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.</option>
                                        <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                                    </select>
                                    {isFurtherStudyReasonOther && (
                                        <input name="furtherStudyReasonOther" onChange={handleChange} value={formData.furtherStudyReasonOther} className={`${inputClass} mt-2`} type="text" placeholder="โปรดระบุสาเหตุอื่นๆ" />
                                    )}
                                </div>
                            </div>
                        )}
                    </FormSection>

                    {/* --- 5. ข้อเสนอแนะ --- */}
                    <FormSection title="5. ข้อเสนอแนะ" icon={MessageSquare}>
                        <div className="flex flex-col">
                            <label className={labelClass} htmlFor="suggestion">ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย (ไม่บังคับ)</label>
                            <textarea id="suggestion" name="suggestion" onChange={handleChange} value={formData.suggestion} className={`${inputClass} h-32 resize-none`} placeholder="ข้อเสนอแนะ" />
                        </div>
                    </FormSection>

                    {/* --- ปุ่มส่งข้อมูล --- */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                        {/* Link should navigate */}
                        <Link href="/EmploymentDashboard" passHref className="text-center">
                            <button
                                type="button"
                                className="w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition duration-300 shadow-md text-gray-700 bg-gray-200 hover:bg-gray-300"
                            >
                                <X className="w-5 h-5 inline mr-2" /> ยกเลิก
                            </button>
                        </Link>

                        <button
                            type="submit"
                            className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-xl transition duration-300 shadow-xl flex items-center justify-center ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> กำลังบันทึก...</>
                            ) : (
                                <><ChevronRight className="w-5 h-5 mr-1" /> แก้ไขข้อมูลแบบสำรวจ</>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}