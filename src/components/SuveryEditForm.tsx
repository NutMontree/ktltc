// src/components/SuveryEditForm.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Briefcase,
  BookOpen,
  MessageSquare,
  GraduationCap,
  MapPin,
  X,
  ChevronRight,
  Loader2,
  Check,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Interface should ideally come from a shared file, keeping it here for now.
interface Isuvery {
  _id: string;
  roomId: string;
  studentId: string;
  fullName: string;
  age: string;
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
  homeProvince: string;
  graduationYear: string;
  educationLevel: string;
  gender: string;
  gpa: string;
  currentStatus: string;
  notWorkingReasonGroup: string;
  notWorkingReasonOther: string;
  employmentType: string;
  employmentTypeOther: string;
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
  salaryRange: string;
  salaryRangeOther: string;
  jobMatch: string;
  jobSatisfaction: string;
  unemployedReason: string;
  unemployedReasonOther: string;
  furtherStudyIntention: string;
  furtherStudyLevel: string;
  furtherStudyMajor: string;
  furtherStudyMajorDetail: string;
  furtherStudyReason: string;
  furtherStudyReasonOther: string;
  jobSearchProblem: string;
  suggestion: string;
}

interface SuveryEditFormProps {
  suvery: Isuvery;
}

const COLLEGE_NAME = "วิทยาลัยเทคนิคกันทรลักษ์";
const COLLEGE_PROVINCE = "ศรีสะเกษ";

// ✅ Styles: blue/Green Theme & Dark Mode Support (Same as GraduatesuveryForm)
const inputClass =
  "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition duration-150";
const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const sectionTitleClass =
  "text-2xl font-extrabold text-green-800 dark:text-green-400 mb-6 flex items-center gap-3";

const FormSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h2 className={sectionTitleClass}>
      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      {title}
    </h2>
    <div className="space-y-6">{children}</div>
  </div>
);

// ✅ Component: Custom Alert Modal
const CustomAlertModal = ({ isOpen, type, title, message, onClose }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
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
            className={`inline-flex w-full justify-center rounded-xl px-4 py-2 text-base font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${type === "success" ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" : "bg-red-600 hover:bg-red-700 focus:ring-red-500"}`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

const SuveryEditForm: React.FC<SuveryEditFormProps> = ({ suvery }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Isuvery>({ ...suvery });

  // ✅ Alert State
  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    // Handle radio buttons specifically if needed, though standard value works for both usually in this setup
    const newValue = value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: newValue };

      // --- Logic Cleansing (Same as GraduatesuveryForm) ---
      if (name === "currentStatus") {
        if (value === "ไม่ได้ทำงาน") {
          // Clear Work
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
          // Clear Study
          newData.furtherStudyLevel = "";
          newData.furtherStudyMajor = "";
          newData.furtherStudyMajorDetail = "";
          newData.furtherStudyReason = "";
          newData.furtherStudyReasonOther = "";
        } else if (value === "ทำงานแล้ว") {
          // Clear Not Work
          newData.notWorkingReasonGroup = "";
          newData.notWorkingReasonOther = "";
          newData.unemployedReason = "";
          newData.unemployedReasonOther = "";
          newData.jobSearchProblem = "";
          // Clear Study
          newData.furtherStudyLevel = "";
          newData.furtherStudyMajor = "";
          newData.furtherStudyMajorDetail = "";
          newData.furtherStudyReason = "";
          newData.furtherStudyReasonOther = "";
        } else if (value === "ศึกษาต่อ") {
          // ✅ Clear All Work & Not Work
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

          // ✅ Auto-set Intention
          newData.furtherStudyIntention = "ต้องการศึกษาต่อ";
        }
      }

      // Dependent field clearing
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

  const handleCloseAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
    if (alertState.type === "success") {
      router.push("/EmploymentDashboard");
      router.refresh();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/suvery?id=${formData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setAlertState({
          isOpen: true,
          type: "success",
          title: "บันทึกการแก้ไขสำเร็จ!",
          message: "ข้อมูลของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "การอัปเดตข้อมูลล้มเหลว");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setAlertState({
        isOpen: true,
        type: "error",
        title: "เกิดข้อผิดพลาด",
        message: err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logic variables
  const isWorking = formData.currentStatus === "ทำงานแล้ว";
  const isNotWorking = formData.currentStatus === "ไม่ได้ทำงาน";
  const isStudying = formData.currentStatus === "ศึกษาต่อ"; // ✅ Added

  const isWorkingOther = isWorking && formData.employmentType === "อื่นๆ";
  const isSalaryOther = isWorking && formData.salaryRange === "5";
  const isUnemployedLookingForJob =
    isNotWorking && formData.notWorkingReasonGroup === "หางานทำไม่ได้";
  const isUnemployedReasonOther =
    isNotWorking && formData.unemployedReason === "4";

  // ✅ Updated Logic for Further Study Section
  const isFurtherStudyIntention =
    formData.furtherStudyIntention === "ต้องการศึกษาต่อ" || isStudying;

  const isFurtherStudyMajorNew =
    isFurtherStudyIntention && formData.furtherStudyMajor === "ระบุสาขา";
  const isFurtherStudyReasonOther =
    isFurtherStudyIntention && formData.furtherStudyReason === "4";

  return (
    <div className="font-inter mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <form onSubmit={handleSubmit} className="">
        {/* Header */}
        <h1 className="mb-10 flex items-center justify-center gap-3 text-center text-4xl font-extrabold text-green-800 dark:text-green-400">
          <span className="hidden sm:inline">📝</span> แก้ไขข้อมูลแบบสำรวจ
        </h1>

        {/* 1. ข้อมูลส่วนตัว */}
        <FormSection title="1. ข้อมูลส่วนตัว" icon={User}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="md:col-span-1">
              <label htmlFor="studentId" className={labelClass}>
                รหัสนักศึกษา *
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="fullName" className={labelClass}>
                ชื่อ-สกุล *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="roomId" className={labelClass}>
                ห้องเรียน
              </label>
              <input
                id="roomId"
                name="roomId"
                type="text"
                value={formData.roomId}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="age" className={labelClass}>
                อายุ
              </label>
              <input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="contactTel" className={labelClass}>
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                id="contactTel"
                name="contactTel"
                type="tel"
                value={formData.contactTel}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contactEmail" className={labelClass}>
                E-mail
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col md:col-span-4">
              <label className={labelClass}>เพศ *</label>
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
                      required
                    />
                    <span className="ml-2 text-gray-700 transition group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400">
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <h3 className="mt-4 border-t pt-4 text-lg font-bold text-gray-800 dark:border-gray-700 dark:text-gray-200">
            ที่อยู่ที่สามารถติดต่อได้ (ปัจจุบัน)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <input
              name="addrNumber"
              value={formData.addrNumber}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="เลขที่"
            />
            <input
              name="addrBuilding"
              value={formData.addrBuilding}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="อาคาร/หมู่บ้าน"
            />
            <input
              name="addrMoo"
              value={formData.addrMoo}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="หมู่"
            />
            <input
              name="addrSoi"
              value={formData.addrSoi}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="ซอย"
            />
            <input
              name="addrRoad"
              value={formData.addrRoad}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="ถนน"
            />
            <input
              name="addrSubDistrict"
              value={formData.addrSubDistrict}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="ตำบล/แขวง"
            />
            <input
              name="addrDistrict"
              value={formData.addrDistrict}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="อำเภอ/เขต"
            />
            <input
              name="addrProvince"
              value={formData.addrProvince}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="จังหวัด"
            />
            <input
              name="addrZipCode"
              value={formData.addrZipCode}
              onChange={handleChange}
              className={inputClass}
              type="text"
              placeholder="รหัสไปรษณีย์"
            />
          </div>
        </FormSection>

        {/* 2. ข้อมูลการศึกษา */}
        <FormSection title="2. ข้อมูลการศึกษา" icon={GraduationCap}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="flex flex-col md:col-span-2">
              <label className={labelClass}>วิทยาลัย</label>
              <input
                value={COLLEGE_NAME}
                className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400`}
                type="text"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>จังหวัด (วิทยาลัย)</label>
              <input
                value={COLLEGE_PROVINCE}
                className={`${inputClass} cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-gray-600 dark:text-gray-400`}
                type="text"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="homeProvince" className={labelClass}>
                ภูมิลำเนา (จังหวัด)
              </label>
              <input
                id="homeProvince"
                name="homeProvince"
                value={formData.homeProvince}
                onChange={handleChange}
                className={inputClass}
                type="text"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="graduationYear" className={labelClass}>
                ปีที่จบการศึกษา *
              </label>
              <input
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className={inputClass}
                type="number"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="educationLevel" className={labelClass}>
                ระดับการศึกษาที่จบ *
              </label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">-- เลือกระดับ --</option>
                <option value="ปวช.">ปวช.</option>
                <option value="ปวส.">ปวส.</option>
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="gpa" className={labelClass}>
                เกรดเฉลี่ยสะสม
              </label>
              <input
                id="gpa"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className={inputClass}
                type="number"
                step="0.01"
                max="4.00"
                placeholder="เช่น 3.50"
              />
            </div>
          </div>
        </FormSection>

        {/* 3. สถานการณ์ทำงานปัจจุบัน */}
        <FormSection title="3. สถานการณ์ทำงานปัจจุบัน" icon={Briefcase}>
          <div className="flex flex-col">
            <label htmlFor="currentStatus" className={labelClass}>
              สถานการณ์ทำงานปัจจุบัน *
            </label>
            <select
              id="currentStatus"
              name="currentStatus"
              value={formData.currentStatus}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">-- เลือกสถานะ --</option>
              <option value="ไม่ได้ทำงาน">1 ไม่ได้ทำงาน</option>
              <option value="ทำงานแล้ว">2 ทำงานแล้ว</option>
              <option value="ศึกษาต่อ">3 ศึกษาต่อ</option>{" "}
              {/* ✅ Option added */}
            </select>
          </div>

          {/* --- 3.1 ไม่ได้ทำงาน --- */}
          {isNotWorking && (
            <div className="mt-4 space-y-4 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
              <p className="flex items-center gap-2 text-lg font-bold text-red-700 dark:text-red-400">
                <X className="h-5 w-5" /> รายละเอียดสำหรับผู้ที่
                **ยังไม่ได้ทำงาน**
              </p>

              <div className="flex flex-col">
                <label className={labelClass}>
                  เหตุผลที่ยังไม่ได้ทำงาน (เลือกกลุ่มเหตุผล) *
                </label>
                <select
                  name="notWorkingReasonGroup"
                  value={formData.notWorkingReasonGroup}
                  onChange={handleChange}
                  className={inputClass}
                  required={isNotWorking}
                >
                  <option value="">-- เลือกเหตุผลหลัก --</option>
                  <option value="ศึกษาต่อ">ศึกษาต่อ</option>
                  <option value="หางานทำไม่ได้">หางานทำไม่ได้</option>
                  <option value="รอฟังคำตอบ">รอฟังคำตอบจากหน่วยงาน</option>
                  <option value="ไม่ประสงค์จะทำงาน">ไม่ประสงค์จะทำงาน</option>
                </select>
              </div>

              {isUnemployedLookingForJob && (
                <div className="flex flex-col">
                  <label htmlFor="jobSearchProblem" className={labelClass}>
                    ปัญหาในการหางานทำ *
                  </label>
                  <select
                    id="jobSearchProblem"
                    name="jobSearchProblem"
                    value={formData.jobSearchProblem}
                    onChange={handleChange}
                    className={inputClass}
                    required={isUnemployedLookingForJob}
                  >
                    <option value="">-- เลือกปัญหา --</option>
                    <option value="ไม่มีปัญหา">ไม่มีปัญหา</option>
                    <option value="1 ไม่ทราบแหล่งงาน">1 ไม่ทราบแหล่งงาน</option>
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

              <div className="flex flex-col">
                <label htmlFor="unemployedReason" className={labelClass}>
                  สาเหตุที่ยังไม่ได้ทำงาน (รายละเอียด) *
                </label>
                <select
                  id="unemployedReason"
                  name="unemployedReason"
                  value={formData.unemployedReason}
                  onChange={handleChange}
                  className={inputClass}
                  required={isNotWorking}
                >
                  <option value="">-- เลือกสาเหตุ --</option>
                  <option value="ยังไม่ประสงค์ทำงาน">
                    1 ยังไม่ประสงค์ทำงาน
                  </option>
                  <option value="รอฟังคำตอบจากหน่วยงาน">
                    2 รอฟังคำตอบจากหน่วยงาน
                  </option>
                  <option value="หางานทำไม่ได้">3 หางานทำไม่ได้</option>
                  <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                </select>
                {isUnemployedReasonOther && (
                  <input
                    name="unemployedReasonOther"
                    value={formData.unemployedReasonOther}
                    onChange={handleChange}
                    className={`${inputClass} mt-2`}
                    type="text"
                    placeholder="โปรดระบุสาเหตุอื่นๆ"
                    required
                  />
                )}
              </div>
            </div>
          )}

          {/* --- 3.2 ทำงานแล้ว --- */}
          {isWorking && (
            <div className="mt-4 space-y-4 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/20">
              <p className="flex items-center gap-2 text-lg font-bold text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" /> รายละเอียดสำหรับผู้ที่
                **ทำงานแล้ว**
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="ตำแหน่งงานและหน้าที่ *"
                  required={isWorking}
                />
                <input
                  name="workplaceName"
                  value={formData.workplaceName}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="ชื่อสถานที่ทำงาน *"
                  required={isWorking}
                />

                <div className="md:col-span-2">
                  <label htmlFor="employmentType" className={labelClass}>
                    ประเภทหน่วยงาน/สถานะการทำงาน *
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    onChange={handleChange}
                    value={formData.employmentType}
                    className={inputClass}
                    required={isWorking}
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
                  {isWorkingOther && (
                    <input
                      name="employmentTypeOther"
                      value={formData.employmentTypeOther}
                      onChange={handleChange}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุประเภทอื่นๆ"
                      required
                    />
                  )}
                </div>
              </div>

              <h3 className="text-md flex items-center gap-1 pt-3 font-bold text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4" /> ที่อยู่สถานที่ทำงาน
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <input
                  name="workplaceAddrNumber"
                  value={formData.workplaceAddrNumber}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="เลขที่"
                />
                <input
                  name="workplaceAddrMoo"
                  value={formData.workplaceAddrMoo}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="หมู่"
                />
                <input
                  name="workplaceAddrSoi"
                  value={formData.workplaceAddrSoi}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="ซอย"
                />
                <input
                  name="workplaceAddrRoad"
                  value={formData.workplaceAddrRoad}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="ถนน"
                />
                <input
                  name="workplaceAddrSubDistrict"
                  value={formData.workplaceAddrSubDistrict}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="ตำบล/แขวง"
                />
                <input
                  name="workplaceAddrDistrict"
                  value={formData.workplaceAddrDistrict}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="อำเภอ/เขต"
                />
                <input
                  name="workplaceAddrProvince"
                  value={formData.workplaceAddrProvince}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="จังหวัด"
                />
                <input
                  name="workplaceAddrZipCode"
                  value={formData.workplaceAddrZipCode}
                  onChange={handleChange}
                  className={inputClass}
                  type="text"
                  placeholder="รหัสไปรษณีย์"
                />
                <div className="md:col-span-4">
                  <input
                    name="workplaceTel"
                    value={formData.workplaceTel}
                    onChange={handleChange}
                    className={inputClass}
                    type="tel"
                    placeholder="เบอร์โทรศัพท์สถานที่ทำงาน"
                  />
                </div>
              </div>

              <h3 className="text-md flex items-center gap-1 pt-3 font-bold text-gray-700 dark:text-gray-300">
                <Check className="h-4 w-4" /> รายได้และความพึงพอใจ
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label htmlFor="salaryRange" className={labelClass}>
                    ปัจจุบันท่านได้รับเงินค่าจ้าง (เฉลี่ยต่อเดือน) *
                  </label>
                  <select
                    id="salaryRange"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className={inputClass}
                    required={isWorking}
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
                      value={formData.salaryRangeOther}
                      onChange={handleChange}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุจำนวนเงิน"
                      required
                    />
                  )}
                </div>

                <div className="flex flex-col">
                  <label className={labelClass}>งานตรงสาขาหรือไม่ *</label>
                  <div className="mt-2 flex gap-6">
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
                  <label className={labelClass}>ความพึงพอใจ *</label>
                  <div className="mt-2 flex gap-6">
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
            </div>
          )}
        </FormSection>

        {/* 4. การศึกษาต่อ */}
        <FormSection title="4. ความต้องการศึกษาต่อ" icon={BookOpen}>
          <div className="flex flex-col">
            <label className={labelClass}>
              ท่านมีความประสงค์จะศึกษาต่อหรือไม่ *
            </label>
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

          {/* ✅ Updated condition: show if intention is study OR current status is study */}
          {isFurtherStudyIntention && (
            <div className="mt-4 space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="flex items-center gap-2 text-lg font-bold text-blue-700 dark:text-blue-400">
                <BookOpen className="h-5 w-5" /> รายละเอียดการศึกษาต่อ
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="furtherStudyLevel" className={labelClass}>
                    ระดับการศึกษาที่ต้องการศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyLevel"
                    name="furtherStudyLevel"
                    value={formData.furtherStudyLevel}
                    onChange={handleChange}
                    className={inputClass}
                    required={isFurtherStudyIntention}
                  >
                    <option value="">-- เลือกระดับ --</option>
                    <option value="ปริญญาตรี">ระดับปริญญาตรี</option>
                    <option value="ปริญญาโท">ระดับปริญญาโท</option>
                    <option value="ปริญญาเอก">ระดับปริญญาเอก</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="furtherStudyMajor" className={labelClass}>
                    สาขาที่ต้องการศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyMajor"
                    name="furtherStudyMajor"
                    value={formData.furtherStudyMajor}
                    onChange={handleChange}
                    className={inputClass}
                    required={isFurtherStudyIntention}
                  >
                    <option value="">-- เลือกสาขา --</option>
                    <option value="สาขาเดิม">ศึกษาต่อสาขาเดิม</option>
                    <option value="ระบุสาขา">ระบุสาขาใหม่</option>
                  </select>
                  {isFurtherStudyMajorNew && (
                    <input
                      name="furtherStudyMajorDetail"
                      value={formData.furtherStudyMajorDetail}
                      onChange={handleChange}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุสาขาใหม่"
                      required
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="furtherStudyReason" className={labelClass}>
                    เหตุผลที่ท่านต้องการศึกษาต่อ *
                  </label>
                  <select
                    id="furtherStudyReason"
                    name="furtherStudyReason"
                    value={formData.furtherStudyReason}
                    onChange={handleChange}
                    className={inputClass}
                    required={isFurtherStudyIntention}
                  >
                    <option value="">-- เลือกเหตุผล --</option>
                    <option value="เพื่อเพิ่มพูนความรู้ความสามารถ">
                      1 เพื่อเพิ่มพูนความรู้ความสามารถ
                    </option>
                    <option value="เพื่อปรับวุฒิการศึกษา">
                      2 เพื่อปรับวุฒิการศึกษา
                    </option>
                    <option value="เพื่อปรับปรุงตำแหน่งหน้าที่การงาน">
                      3 เพื่อปรับปรุงตำแหน่งหน้าที่การงาน
                    </option>
                    <option value="4">4 อื่นๆ (โปรดระบุ)</option>
                  </select>
                  {isFurtherStudyReasonOther && (
                    <input
                      name="furtherStudyReasonOther"
                      value={formData.furtherStudyReasonOther}
                      onChange={handleChange}
                      className={`${inputClass} mt-2`}
                      type="text"
                      placeholder="โปรดระบุเหตุผลอื่นๆ"
                      required
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </FormSection>

        {/* 5. ข้อเสนอแนะ */}
        <FormSection title="5. ข้อเสนอแนะ" icon={MessageSquare}>
          <div className="mb-8">
            <label htmlFor="suggestion" className={labelClass}>
              ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย (ไม่บังคับ)
            </label>
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
        <div className="mt-8 flex flex-col justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
          <Link
            href="/EmploymentDashboard"
            className="flex items-center justify-center gap-1 rounded-xl border border-gray-300 bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <X className="h-5 w-5" /> ยกเลิก
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-blue-600/40 focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> กำลังบันทึก...
              </>
            ) : (
              <>
                <ChevronRight className="h-5 w-5" /> บันทึกการแก้ไข
              </>
            )}
          </button>
        </div>
      </form>

      {/* ✅ Custom Alert Modal */}
      <CustomAlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={handleCloseAlert}
      />
    </div>
  );
};

export default SuveryEditForm;
