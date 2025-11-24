"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Briefcase,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Check,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// --- Constants & Types ---
const initialFormData = {
  // 1. ข้อมูลส่วนตัว
  roomId: "",
  studentId: "",
  fullName: "",
  age: "",
  // 2. ที่อยู่ที่ติดต่อได้
  addrNumber: "",
  addrBuilding: "",
  addrMoo: "",
  addrSoi: "",
  addrRoad: "",
  addrSubDistrict: "",
  addrDistrict: "",
  addrProvince: "",
  addrZipCode: "",
  contactTel: "",
  contactEmail: "",
  // 3. ข้อมูลการศึกษา
  homeProvince: "",
  graduationYear: "",
  educationLevel: "",
  gender: "",
  gpa: "",
  // 4. สถานการณ์ทำงานปัจจุบัน
  currentStatus: "",
  // 4.1 ข้อมูลเมื่อ "ไม่ได้ทำงาน"
  notWorkingReasonGroup: "",
  notWorkingReasonOther: "",
  // 4.2 ข้อมูลเมื่อ "ทำงานแล้ว"
  employmentType: "",
  employmentTypeOther: "",
  jobTitle: "",
  workplaceName: "",
  workplaceAddrNumber: "",
  workplaceAddrMoo: "",
  workplaceAddrSoi: "",
  workplaceAddrRoad: "",
  workplaceAddrSubDistrict: "",
  workplaceAddrDistrict: "",
  workplaceAddrProvince: "",
  workplaceAddrZipCode: "",
  workplaceTel: "",
  // 5. รายได้และลักษณะงาน
  salaryRange: "",
  salaryRangeOther: "",
  jobMatch: "",
  jobSatisfaction: "",
  // 6. สาเหตุที่ยังไม่ได้ทำงาน
  unemployedReason: "",
  unemployedReasonOther: "",
  // 7. การศึกษาต่อ
  furtherStudyIntention: "",
  furtherStudyLevel: "",
  furtherStudyMajor: "",
  furtherStudyMajorDetail: "",
  furtherStudyReason: "",
  furtherStudyReasonOther: "",
  // 8. ปัญหาในการหางาน
  jobSearchProblem: "",
  // 9. ข้อเสนอแนะ
  suggestion: "",
};

// ✅ Styles
const inputClass =
  "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition duration-150";
const labelClass =
  "text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";
const sectionTitleClass =
  "text-2xl font-extrabold text-green-800 dark:text-green-400 mb-6 flex items-center gap-3";

// ✅ Component: Form Section
const FormSection = ({ title, icon: Icon, children }) => (
  <section className="mb-8">
    <h2 className={sectionTitleClass}>
      {Icon && (
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      )}
      {title}
    </h2>
    <div className="space-y-6">{children}</div>
  </section>
);

// ✅ Component: Custom Alert Modal (New)
const CustomAlertModal = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    // Overlay: พื้นหลังเบลอและสีดำจาง
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      {/* Modal Box: กล่องขาวตรงกลาง */}
      <div className="w-full max-w-sm scale-100 transform overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${type === "success" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
          >
            {type === "success" ? (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            )}
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-center bg-gray-50 px-6 py-4 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className={`inline-flex w-full justify-center rounded-xl px-4 py-2 text-base font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
              type === "success"
                ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            }`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GraduatesuveryForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // ✅ State สำหรับ Modal แจ้งเตือน
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
  });

  const collegeName = "วิทยาลัยเทคนิคกันทรลักษ์";
  const collegeProvince = "ศรีสะเกษ";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // --- Logic Cleansing ---
      if (name === "currentStatus") {
        if (value === "ไม่ได้ทำงาน") {
          // Clear Working Data
          newData.employmentType = "";
          newData.employmentTypeOther = "";
          newData.jobTitle = "";
          newData.workplaceName = "";
          newData.workplaceAddrNumber = "";
          newData.workplaceAddrMoo = "";
          newData.workplaceAddrSoi = "";
          newData.workplaceAddrRoad = "";
          newData.workplaceAddrSubDistrict = "";
          newData.workplaceAddrDistrict = "";
          newData.workplaceAddrProvince = "";
          newData.workplaceAddrZipCode = "";
          newData.workplaceTel = "";
          newData.salaryRange = "";
          newData.salaryRangeOther = "";
          newData.jobMatch = "";
          newData.jobSatisfaction = "";
          // Clear Study Data
          newData.furtherStudyLevel = "";
          newData.furtherStudyMajor = "";
          newData.furtherStudyMajorDetail = "";
          newData.furtherStudyReason = "";
          newData.furtherStudyReasonOther = "";
        } else if (value === "ทำงานแล้ว") {
          // Clear Not Working Data
          newData.notWorkingReasonGroup = "";
          newData.notWorkingReasonOther = "";
          newData.unemployedReason = "";
          newData.unemployedReasonOther = "";
          newData.jobSearchProblem = "";
          // Clear Study Data
          newData.furtherStudyLevel = "";
          newData.furtherStudyMajor = "";
          newData.furtherStudyMajorDetail = "";
          newData.furtherStudyReason = "";
          newData.furtherStudyReasonOther = "";
        } else if (value === "ศึกษาต่อ") {
          // Clear All Work & Not Work Data
          newData.employmentType = "";
          newData.employmentTypeOther = "";
          newData.jobTitle = "";
          newData.workplaceName = "";
          newData.workplaceAddrNumber = "";
          newData.workplaceAddrMoo = "";
          newData.workplaceAddrSoi = "";
          newData.workplaceAddrRoad = "";
          newData.workplaceAddrSubDistrict = "";
          newData.workplaceAddrDistrict = "";
          newData.workplaceAddrProvince = "";
          newData.workplaceAddrZipCode = "";
          newData.workplaceTel = "";
          newData.salaryRange = "";
          newData.salaryRangeOther = "";
          newData.jobMatch = "";
          newData.jobSatisfaction = "";
          newData.notWorkingReasonGroup = "";
          newData.notWorkingReasonOther = "";
          newData.unemployedReason = "";
          newData.unemployedReasonOther = "";
          newData.jobSearchProblem = "";

          // Auto-set Study Intention
          newData.furtherStudyIntention = "ต้องการศึกษาต่อ";
        }
      }

      // Other Logic...
      if (name === "notWorkingReasonGroup" && value !== "หางานทำไม่ได้")
        newData.jobSearchProblem = "";
      if (name === "unemployedReason" && value !== "4")
        newData.unemployedReasonOther = "";
      if (name === "employmentType" && value !== "อื่นๆ")
        newData.employmentTypeOther = "";
      if (name === "salaryRange" && value !== "5")
        newData.salaryRangeOther = "";
      if (name === "furtherStudyIntention" && value === "ไม่ต้องการศึกษาต่อ") {
        newData.furtherStudyLevel = "";
        newData.furtherStudyMajor = "";
        newData.furtherStudyMajorDetail = "";
        newData.furtherStudyReason = "";
        newData.furtherStudyReasonOther = "";
      }
      if (name === "furtherStudyMajor" && value !== "ระบุสาขา")
        newData.furtherStudyMajorDetail = "";
      if (name === "furtherStudyReason" && value !== "4")
        newData.furtherStudyReasonOther = "";

      return newData;
    });
  };

  const isWorking = formData.currentStatus === "ทำงานแล้ว";
  const isNotWorking = formData.currentStatus === "ไม่ได้ทำงาน";
  const isStudying = formData.currentStatus === "ศึกษาต่อ";

  const isEmploymentTypeOther =
    isWorking && formData.employmentType === "อื่นๆ";
  const isSalaryOther = isWorking && formData.salaryRange === "5";
  const isFurtherStudy =
    formData.furtherStudyIntention === "ต้องการศึกษาต่อ" || isStudying;
  const isFurtherStudyReasonOther =
    isFurtherStudy && formData.furtherStudyReason === "4";
  const isUnemployedOther = isNotWorking && formData.unemployedReason === "4";
  const isUnemployedLookingForJob =
    isNotWorking && formData.notWorkingReasonGroup === "หางานทำไม่ได้";

  // ✅ ฟังก์ชันปิด Modal และ Redirect หากสำเร็จ
  const handleCloseAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));

    // ถ้าเป็น Success ให้ Redirect ไปหน้า Dashboard
    if (alertState.type === "success") {
      router.push("/EmploymentDashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submissionData = {
      ...formData,
      college: collegeName,
      collegeProvince: collegeProvince,
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/suvery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "การส่งข้อมูลล้มเหลวที่เซิร์ฟเวอร์",
        );
      }

      // ✅ เรียก Modal สำเร็จ แทน window.alert
      setAlertState({
        isOpen: true,
        type: "success",
        title: "บันทึกข้อมูลสำเร็จ!",
        message: "ขอบคุณที่สละเวลาในการกรอกข้อมูลแบบสำรวจ",
      });
    } catch (error) {
      console.error(error);
      // ✅ เรียก Modal Error
      setAlertState({
        isOpen: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-inter min-h-screen bg-gray-50 px-4 py-12 transition-colors duration-300 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold leading-tight text-green-900 dark:text-green-400">
            📋 แบบสำรวจภาวะการมีงานทำของศิษย์เก่า
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
            {collegeName} จังหวัด{collegeProvince}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="">
          {/* --- 1. ข้อมูลส่วนตัวและติดต่อ --- */}
          <FormSection title="1. ข้อมูลส่วนตัวและการติดต่อ" icon={User}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <label className={labelClass} htmlFor="studentId">
                  รหัสนักศึกษา *
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  onChange={handleChange}
                  value={formData.studentId}
                  className={inputClass}
                  type="text"
                  placeholder="รหัสนักศึกษา"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass} htmlFor="fullName">
                  ชื่อ-สกุล *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  onChange={handleChange}
                  value={formData.fullName}
                  className={inputClass}
                  type="text"
                  placeholder="ชื่อ-สกุล"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass} htmlFor="roomId">
                  ห้องเรียน *
                </label>
                <input
                  id="roomId"
                  name="roomId"
                  onChange={handleChange}
                  value={formData.roomId}
                  className={inputClass}
                  type="text"
                  placeholder="ห้องเรียน"
                  required
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass} htmlFor="age">
                  อายุ
                </label>
                <input
                  id="age"
                  name="age"
                  onChange={handleChange}
                  value={formData.age}
                  className={inputClass}
                  type="number"
                  placeholder="อายุ"
                  min="15"
                />
              </div>
              <div className="col-span-1">
                <label className={labelClass} htmlFor="contactTel">
                  เบอร์ที่สามารถติดต่อได้
                </label>
                <input
                  id="contactTel"
                  name="contactTel"
                  onChange={handleChange}
                  value={formData.contactTel}
                  className={inputClass}
                  type="tel"
                  placeholder="เบอร์โทรศัพท์"
                />
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="contactEmail">
                  E-mail
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  onChange={handleChange}
                  value={formData.contactEmail}
                  className={inputClass}
                  type="email"
                  placeholder="E-mail"
                />
              </div>
            </div>

            <h3 className="mt-6 border-t pt-4 text-xl font-bold text-gray-800 dark:border-gray-700 dark:text-gray-200">
              ที่อยู่ที่สามารถติดต่อได้
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <input
                name="addrNumber"
                onChange={handleChange}
                value={formData.addrNumber}
                className={inputClass}
                type="text"
                placeholder="เลขที่"
              />
              <input
                name="addrBuilding"
                onChange={handleChange}
                value={formData.addrBuilding}
                className={inputClass}
                type="text"
                placeholder="อาคาร/หมู่บ้าน"
              />
              <input
                name="addrMoo"
                onChange={handleChange}
                value={formData.addrMoo}
                className={inputClass}
                type="text"
                placeholder="หมู่"
              />
              <input
                name="addrSoi"
                onChange={handleChange}
                value={formData.addrSoi}
                className={inputClass}
                type="text"
                placeholder="ซอย"
              />
              <input
                name="addrRoad"
                onChange={handleChange}
                value={formData.addrRoad}
                className={inputClass}
                type="text"
                placeholder="ถนน"
              />
              <input
                name="addrSubDistrict"
                onChange={handleChange}
                value={formData.addrSubDistrict}
                className={inputClass}
                type="text"
                placeholder="ตำบล/แขวง"
              />
              <input
                name="addrDistrict"
                onChange={handleChange}
                value={formData.addrDistrict}
                className={inputClass}
                type="text"
                placeholder="อำเภอ/เขต"
              />
              <input
                name="addrProvince"
                onChange={handleChange}
                value={formData.addrProvince}
                className={inputClass}
                type="text"
                placeholder="จังหวัด"
              />
              <input
                name="addrZipCode"
                onChange={handleChange}
                value={formData.addrZipCode}
                className={inputClass}
                type="text"
                placeholder="รหัสไปรษณีย์"
              />
            </div>
          </FormSection>

          {/* --- 2. ข้อมูลการศึกษา --- */}
          <FormSection title="2. ข้อมูลการศึกษา" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col">
                <label className={labelClass}>วิทยาลัยที่จบ:</label>
                <input
                  value={collegeName}
                  className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300`}
                  type="text"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>จังหวัด (วิทยาลัย):</label>
                <input
                  value={collegeProvince}
                  className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300`}
                  type="text"
                  disabled
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass} htmlFor="homeProvince">
                  ภูมิลำเนา (จังหวัด)
                </label>
                <input
                  id="homeProvince"
                  name="homeProvince"
                  onChange={handleChange}
                  value={formData.homeProvince}
                  className={inputClass}
                  type="text"
                  placeholder="ภูมิลำเนา (จังหวัด)"
                />
              </div>
              <div className="flex flex-col">
                <label className={labelClass} htmlFor="graduationYear">
                  ปีที่จบการศึกษา
                </label>
                <input
                  id="graduationYear"
                  name="graduationYear"
                  onChange={handleChange}
                  value={formData.graduationYear}
                  className={inputClass}
                  type="number"
                  placeholder="ปี พ.ศ. ที่จบการศึกษา"
                  min="1990"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass} htmlFor="educationLevel">
                ระดับการศึกษาสายอาชีวศึกษาที่จบ *
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                onChange={handleChange}
                value={formData.educationLevel}
                className={inputClass}
                required
              >
                <option value="">-- เลือกระดับการศึกษา --</option>
                <option value="ปวช">ระดับประกาศนียบัตรวิชาชีพ (ปวช.)</option>
                <option value="ปวส">
                  ระดับประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)
                </option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className={labelClass}>เพศ:</label>
              <div className="mt-1 flex gap-6">
                {["ชาย", "หญิง"].map((g) => (
                  <label
                    key={g}
                    className="group inline-flex cursor-pointer items-center"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="form-radio h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-700 transition group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className={labelClass} htmlFor="gpa">
                เกรดเฉลี่ยสะสมตลอดหลักสูตร
              </label>
              <input
                id="gpa"
                name="gpa"
                onChange={handleChange}
                value={formData.gpa}
                className={inputClass}
                type="number"
                step="0.01"
                min="0.00"
                max="4.00"
                placeholder="เช่น 3.50"
              />
            </div>
          </FormSection>

          {/* --- 3. สถานการณ์ทำงานปัจจุบัน --- */}
          <FormSection title="3. สถานการณ์ทำงานปัจจุบัน" icon={Briefcase}>
            <div className="flex flex-col">
              <label className={labelClass} htmlFor="currentStatus">
                สถานการณ์ทำงานปัจจุบัน *
              </label>
              <select
                id="currentStatus"
                name="currentStatus"
                onChange={handleChange}
                value={formData.currentStatus}
                className={inputClass}
                required
              >
                <option value="">-- เลือกสถานะ --</option>
                <option value="ไม่ได้ทำงาน">1 ไม่ได้ทำงาน</option>
                <option value="ทำงานแล้ว">2 ทำงานแล้ว</option>
                <option value="ศึกษาต่อ">3 ศึกษาต่อ</option>
              </select>
            </div>

            {/* --- 3.1 ไม่ได้ทำงาน --- */}
            {isNotWorking && (
              <div className="mt-6 space-y-4 rounded-xl border border-red-200 bg-red-50 p-6 shadow-inner transition duration-300 dark:border-red-800 dark:bg-red-900/20">
                <h4 className="flex items-center text-lg font-bold text-red-700 dark:text-red-400">
                  <X className="mr-2 h-5 w-5" /> รายละเอียดสำหรับผู้ที่ *ยัง*
                  ไม่ได้ทำงาน
                </h4>

                <label className={labelClass}>
                  เหตุผลที่ยังไม่ได้ทำงาน (เลือกกลุ่มเหตุผล):
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    "ศึกษาต่อ",
                    "หางานทำไม่ได้",
                    "รอฟังคำตอบจากหน่วยงาน",
                    "ไม่ประสงค์จะทำงาน",
                  ].map((option) => (
                    <label
                      key={option}
                      className={`inline-flex cursor-pointer items-center rounded-lg border p-3 transition duration-150 ${formData.notWorkingReasonGroup === option ? "border-red-500 bg-red-200 shadow-md dark:bg-red-800" : "border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"}`}
                    >
                      <input
                        type="radio"
                        name="notWorkingReasonGroup"
                        value={option}
                        checked={formData.notWorkingReasonGroup === option}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 text-red-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>

                {isUnemployedLookingForJob && (
                  <div className="mt-6 border-t border-red-200 pt-4 dark:border-red-800">
                    <label className={labelClass} htmlFor="jobSearchProblem">
                      ปัญหาในการหางานทำ (ถ้ามี):
                    </label>
                    <select
                      id="jobSearchProblem"
                      name="jobSearchProblem"
                      onChange={handleChange}
                      value={formData.jobSearchProblem}
                      className={inputClass}
                      required
                    >
                      <option value="">-- เลือกปัญหา --</option>
                      <option value="ไม่มีปัญหา">ไม่มีปัญหา</option>
                      <option value="1 ไม่ทราบแหล่งงาน">
                        1 ไม่ทราบแหล่งงาน
                      </option>
                      <option value="2 หางานที่ถูกใจไม่ได้">
                        2 หางานที่ถูกใจไม่ได้
                      </option>
                      <option value="3 ต้องสอบจึงไม่อยากสมัคร">
                        3 ต้องสอบจึงไม่อยากสมัคร
                      </option>
                      <option value="4 ขาดคนสนับสนุน">4 ขาดคนสนับสนุน</option>
                      <option value="5 ขาดคนหรือเงินค้ำประกัน">
                        5 ขาดคนหรือเงินค้ำประกัน
                      </option>
                      <option value="6 หน่วยงานไม่ต้องการ">
                        6 หน่วยงานไม่ต้องการ
                      </option>
                      <option value="7 เงินเดือนน้อย">7 เงินเดือนน้อย</option>
                      <option value="8 สอบเข้าทำงานไม่ได้">
                        8 สอบเข้าทำงานไม่ได้
                      </option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* --- 3.2 ทำงานแล้ว --- */}
            {isWorking && (
              <div className="mt-6 space-y-4 rounded-xl border border-green-200 bg-green-50 p-6 shadow-inner transition duration-300 dark:border-green-800 dark:bg-green-900/20">
                <h4 className="flex items-center text-lg font-bold text-green-700 dark:text-green-400">
                  <Check className="mr-2 h-5 w-5" /> รายละเอียดสำหรับผู้ที่
                  *ทำงาน* แล้ว
                </h4>

                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="employmentType">
                    ประเภทหน่วยงาน/สถานะการทำงาน *
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    onChange={handleChange}
                    value={formData.employmentType}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกประเภท --</option>
                    <option value="ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ">
                      ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ
                    </option>
                    <option value="รัฐวิสาหกิจ">รัฐวิสาหกิจ</option>
                    <option value="พนักงานบริษัทิ/องค์กรธุรกิจเอกชน">
                      พนักงานบริษัทิ/องค์กรธุรกิจเอกชน
                    </option>
                    <option value="ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ">
                      ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ
                    </option>
                    <option value="พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ">
                      พนักงานองค์กรต่างประเทศ/ระหว่างประเทศ
                    </option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                  {isEmploymentTypeOther && (
                    <input
                      name="employmentTypeOther"
                      onChange={handleChange}
                      value={formData.employmentTypeOther}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุประเภทอื่นๆ"
                    />
                  )}
                </div>

                <h3 className="mt-6 border-t pt-4 text-lg font-bold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                  รายละเอียดงานและสถานที่
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    name="jobTitle"
                    onChange={handleChange}
                    value={formData.jobTitle}
                    className={inputClass}
                    type="text"
                    placeholder="ตำแหน่งงานและหน้าที่ที่รับผิดชอบ"
                  />
                  <input
                    name="workplaceName"
                    onChange={handleChange}
                    value={formData.workplaceName}
                    className={inputClass}
                    type="text"
                    placeholder="ชื่อสถานที่ทำงาน"
                  />
                  <input
                    name="workplaceTel"
                    onChange={handleChange}
                    value={formData.workplaceTel}
                    className={inputClass}
                    type="tel"
                    placeholder="เบอร์โทรศัพท์สถานที่ทำงาน"
                  />
                </div>

                <h3 className="mt-6 border-t pt-4 text-lg font-bold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                  ที่อยู่สถานที่ทำงาน
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <input
                    name="workplaceAddrNumber"
                    onChange={handleChange}
                    value={formData.workplaceAddrNumber}
                    className={inputClass}
                    type="text"
                    placeholder="เลขที่"
                  />
                  <input
                    name="workplaceAddrMoo"
                    onChange={handleChange}
                    value={formData.workplaceAddrMoo}
                    className={inputClass}
                    type="text"
                    placeholder="หมู่"
                  />
                  <input
                    name="workplaceAddrSoi"
                    onChange={handleChange}
                    value={formData.workplaceAddrSoi}
                    className={inputClass}
                    type="text"
                    placeholder="ซอย"
                  />
                  <input
                    name="workplaceAddrRoad"
                    onChange={handleChange}
                    value={formData.workplaceAddrRoad}
                    className={inputClass}
                    type="text"
                    placeholder="ถนน"
                  />
                  <input
                    name="workplaceAddrSubDistrict"
                    onChange={handleChange}
                    value={formData.workplaceAddrSubDistrict}
                    className={inputClass}
                    type="text"
                    placeholder="ตำบล/แขวง"
                  />
                  <input
                    name="workplaceAddrDistrict"
                    onChange={handleChange}
                    value={formData.workplaceAddrDistrict}
                    className={inputClass}
                    type="text"
                    placeholder="อำเภอ/เขต"
                  />
                  <input
                    name="workplaceAddrProvince"
                    onChange={handleChange}
                    value={formData.workplaceAddrProvince}
                    className={inputClass}
                    type="text"
                    placeholder="จังหวัด"
                  />
                  <input
                    name="workplaceAddrZipCode"
                    onChange={handleChange}
                    value={formData.workplaceAddrZipCode}
                    className={inputClass}
                    type="text"
                    placeholder="รหัสไปรษณีย์"
                  />
                </div>

                <h3 className="mt-6 border-t pt-4 text-lg font-bold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                  รายได้และความพึงพอใจ
                </h3>
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="salaryRange">
                    ปัจจุบันท่านได้รับเงินค่าจ้าง (โดยเฉลี่ยต่อเดือน) *
                  </label>
                  <select
                    id="salaryRange"
                    name="salaryRange"
                    onChange={handleChange}
                    value={formData.salaryRange}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกช่วงรายได้ --</option>
                    <option value="ต่ำกว่า 7,940 บาท">
                      1 ต่ำกว่า 7,940 บาท
                    </option>
                    <option value="7,941 - 10,000 บาท">
                      2 7,941 - 10,000 บาท
                    </option>
                    <option value="10,001 - 15,000 บาท">
                      3 10,001 - 15,000 บาท
                    </option>
                    <option value="15,001 - 20,000 บาท">
                      4 15,001 - 20,000 บาท
                    </option>
                    <option value="5">5 อื่นๆ (โปรดระบุ)</option>
                  </select>
                  {isSalaryOther && (
                    <input
                      name="salaryRangeOther"
                      onChange={handleChange}
                      value={formData.salaryRangeOther}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุจำนวนเงิน"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    ลักษณะงานที่ทำ ตรงกับสาขาที่ท่านได้สำเร็จการศึกษาหรือไม่ *
                  </label>
                  <div className="mt-1 flex gap-6">
                    <label className="group inline-flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="jobMatch"
                        value="ตรง"
                        checked={formData.jobMatch === "ตรง"}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-green-600 dark:text-gray-300 dark:group-hover:text-green-400">
                        1 ตรง
                      </span>
                    </label>
                    <label className="group inline-flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="jobMatch"
                        value="ไม่ตรง"
                        checked={formData.jobMatch === "ไม่ตรง"}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-red-600 dark:text-gray-300 dark:group-hover:text-red-400">
                        2 ไม่ตรง
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>
                    ท่านพึงพอใจกับงานที่ทำอยู่๋ในปัจจุบันหรือไม่ *
                  </label>
                  <div className="mt-1 flex gap-6">
                    <label className="group inline-flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="jobSatisfaction"
                        value="พึงพอใจ"
                        checked={formData.jobSatisfaction === "พึงพอใจ"}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-green-600 dark:text-gray-300 dark:group-hover:text-green-400">
                        1 พึงพอใจ
                      </span>
                    </label>
                    <label className="group inline-flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="jobSatisfaction"
                        value="ไม่พึงพอใจ"
                        checked={formData.jobSatisfaction === "ไม่พึงพอใจ"}
                        onChange={handleChange}
                        className="form-radio h-5 w-5 border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-red-600 dark:text-gray-300 dark:group-hover:text-red-400">
                        2 ไม่พึงพอใจ
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {/* --- 4. การศึกษาต่อ --- */}
          <FormSection title="4. ความต้องการศึกษาต่อ" icon={BookOpen}>
            <div className="flex flex-col">
              <label className={labelClass}>ความต้องการศึกษาต่อ:</label>
              <div className="mt-1 flex gap-6">
                <label
                  className={`group inline-flex cursor-pointer items-center ${isStudying ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="furtherStudyIntention"
                    value="ต้องการศึกษาต่อ"
                    checked={
                      formData.furtherStudyIntention === "ต้องการศึกษาต่อ" ||
                      isStudying
                    }
                    onChange={handleChange}
                    className="form-radio h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-700"
                    disabled={isStudying}
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                    ต้องการศึกษาต่อ
                  </span>
                </label>

                <label
                  className={`group inline-flex cursor-pointer items-center ${isStudying ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="furtherStudyIntention"
                    value="ไม่ต้องการศึกษาต่อ"
                    checked={
                      formData.furtherStudyIntention === "ไม่ต้องการศึกษาต่อ" &&
                      !isStudying
                    }
                    onChange={handleChange}
                    className="form-radio h-5 w-5 border-gray-300 text-gray-600 focus:ring-gray-500 dark:border-gray-500 dark:bg-gray-700"
                    disabled={isStudying}
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                    ไม่ต้องการศึกษาต่อ
                  </span>
                </label>
              </div>
            </div>

            {/* แสดงฟอร์มถ้า เลือกต้องการศึกษาต่อ หรือ สถานะเป็นศึกษาต่อ */}
            {(formData.furtherStudyIntention === "ต้องการศึกษาต่อ" ||
              isStudying) && (
              <div className="mt-6 space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-inner transition duration-300 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="furtherStudyLevel">
                    ระดับการศึกษาที่ต้องการศึกษาต่อ/กำลังศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyLevel"
                    name="furtherStudyLevel"
                    onChange={handleChange}
                    value={formData.furtherStudyLevel}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกระดับ --</option>
                    <option value="ระดับปริญญาตรี">
                      1 ระดับประกาศนียบัตรวิชาชีพชั้นสูง ปวส.
                    </option>
                    <option value="ระดับปริญญาตรี">2 ระดับปริญญาตรี</option>
                    <option value="ระดับปริญญาโท">3 ระดับปริญญาโท</option>
                    <option value="ระดับปริญญาเอก">4 ระดับปริญญาเอก</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="furtherStudyMajor">
                    สาขาที่ท่านต้องการศึกษาต่อ/กำลังศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyMajor"
                    name="furtherStudyMajor"
                    onChange={handleChange}
                    value={formData.furtherStudyMajor}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกสาขา --</option>
                    <option value="สาขาเดิม">สาขาเดิม (ต่อเนื่อง)</option>
                    <option value="ระบุสาขา">ระบุสาขา (สาขาใหม่)</option>
                  </select>
                  {formData.furtherStudyMajor === "ระบุสาขา" && (
                    <input
                      name="furtherStudyMajorDetail"
                      onChange={handleChange}
                      value={formData.furtherStudyMajorDetail}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุสาขาใหม่"
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className={labelClass} htmlFor="furtherStudyReason">
                    สาเหตุที่ต้องการศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyReason"
                    name="furtherStudyReason"
                    onChange={handleChange}
                    value={formData.furtherStudyReason}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกสาเหตุ --</option>
                    <option value="เป็นความต้องการของบิดา/มารดา หรือผู้ปกครอง">
                      1 เป็นความต้องการของบิดา/มารดา หรือผู้ปกครอง
                    </option>
                    <option value="ได้รับทุนการศึกษาต่อ">
                      2 ได้รับทุนการศึกษาต่อ
                    </option>
                    <option value="งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.">
                      3 งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.
                    </option>
                    <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                  </select>
                  {isFurtherStudyReasonOther && (
                    <input
                      name="furtherStudyReasonOther"
                      onChange={handleChange}
                      value={formData.furtherStudyReasonOther}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุสาเหตุอื่นๆ"
                    />
                  )}
                </div>
              </div>
            )}
          </FormSection>

          {/* --- 5. ข้อเสนอแนะ --- */}
          <FormSection title="5. ข้อเสนอแนะ" icon={MessageSquare}>
            <div className="flex flex-col">
              <label className={labelClass} htmlFor="suggestion">
                ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย (ไม่บังคับ)
              </label>
              <textarea
                id="suggestion"
                name="suggestion"
                onChange={handleChange}
                value={formData.suggestion}
                className={`${inputClass} h-32 resize-none`}
                placeholder="ข้อเสนอแนะ"
              />
            </div>
          </FormSection>

          {/* --- ปุ่มส่งข้อมูล --- */}
          <div className="flex flex-col justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
            <Link href="/EmploymentDashboard" passHref className="text-center">
              <button
                type="button"
                className="w-full rounded-xl border border-gray-300 bg-gray-200 px-6 py-3 font-semibold text-gray-700 shadow-md transition duration-300 hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:w-auto"
              >
                <X className="mr-2 inline h-5 w-5" /> ยกเลิก
              </button>
            </Link>

            <button
              type="submit"
              className={`flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold shadow-xl transition duration-300 sm:w-auto ${isSubmitting ? "cursor-not-allowed bg-gray-400" : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-blue-500/30 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                  กำลังบันทึก...
                </>
              ) : (
                // เปลี่ยนข้อความให้ชัดเจน
                <>
                  <Check className="mr-1 h-5 w-5" /> ยืนยันการบันทึกข้อมูล
                </>
              )}
            </button>
          </div>
        </form>

        {/* ✅ แสดง Modal เมื่อ alertState.isOpen เป็น true */}
        <CustomAlertModal
          isOpen={alertState.isOpen}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          onClose={handleCloseAlert}
        />
      </div>
    </div>
  );
}
