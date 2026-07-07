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
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
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
  furtherStudyInstitution: "",
  furtherStudyReason: "",
  furtherStudyReasonOther: "",
  // 8. ปัญหาในการหางาน
  jobSearchProblem: "",
  // 9. ข้อเสนอแนะ
  suggestion: "",
};

// ✅ Modern Styles
const inputContainerClass = "relative group";
const iconInputClass =
  "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors";
const inputClass =
  "w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 ease-in-out hover:bg-white";
const labelClass = "block text-sm font-semibold text-gray-700 mb-2 ml-1";
const sectionCardClass =
  "bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 transition-shadow hover:shadow-md";
const sectionHeaderClass =
  "text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b border-gray-100";

// ✅ Component: Form Section Wrapper
const FormSection = ({
  title,
  icon: Icon,
  children,
  color = "text-emerald-600",
}) => (
  <section className={sectionCardClass}>
    <h2 className={sectionHeaderClass}>
      <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      {title}
    </h2>
    <div className="space-y-6">{children}</div>
  </section>
);

// ✅ Component: Custom Alert Modal
const CustomAlertModal = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-sm scale-100 transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="p-8 text-center">
          <div
            className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
              type === "success"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {type === "success" ? (
              <CheckCircle className="h-10 w-10" />
            ) : (
              <AlertCircle className="h-10 w-10" />
            )}
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className={`w-full rounded-xl py-3.5 text-base font-semibold text-white shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-4 ${
              type === "success"
                ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 focus:ring-emerald-100"
                : "bg-rose-600 hover:bg-rose-700 hover:shadow-rose-200 focus:ring-rose-100"
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

  const [alertState, setAlertState] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const collegeName = "วิทยาลัยเทคนิคกันทรลักษ์";
  const collegeProvince = "ศรีสะเกษ";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // ... (Logic cleansing code เหมือนเดิม - ละไว้เพื่อความกระชับ) ...
      // copy logic cleansing เดิมมาใส่ตรงนี้ได้เลยครับ
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
          newData.furtherStudyInstitution = "";
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
          newData.furtherStudyInstitution = "";
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

  // Helper variables for conditional rendering
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

  const handleCloseAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
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
        throw new Error(errorData.message || "การส่งข้อมูลล้มเหลว");
      }

      setAlertState({
        isOpen: true,
        type: "success",
        title: "บันทึกข้อมูลสำเร็จ!",
        message: "ขอบคุณที่สละเวลาในการกรอกข้อมูลแบบสำรวจ",
      });
    } catch (error) {
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
    <div className="max-w-[1600px] mx-auto bg-slate-50 font-sans text-gray-900">
      {/* Background Graphic (Optional) */}
      <div className="absolute inset-0 z-0 h-96 w-full bg-linear-to-br from-emerald-600 to-teal-800 opacity-90" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            แบบสำรวจภาวะการมีงานทำ
          </h1>
          <p className="text-lg text-emerald-50 opacity-90">
            {collegeName} จังหวัด{collegeProvince}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. ข้อมูลส่วนตัว */}
          <FormSection title="ข้อมูลส่วนตัวและการติดต่อ" icon={User}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="studentId">
                  รหัสนักศึกษา *
                </label>
                <div className={inputContainerClass}>
                  <Building className={iconInputClass} size={18} />
                  <input
                    id="studentId"
                    name="studentId"
                    onChange={handleChange}
                    value={formData.studentId}
                    className={inputClass}
                    type="text"
                    placeholder="ระบุรหัสนักศึกษา"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="fullName">
                  ชื่อ-สกุล *
                </label>
                <div className={inputContainerClass}>
                  <User className={iconInputClass} size={18} />
                  <input
                    id="fullName"
                    name="fullName"
                    onChange={handleChange}
                    value={formData.fullName}
                    className={inputClass}
                    type="text"
                    placeholder="ระบุชื่อ-สกุล"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="roomId">
                  ห้องเรียน *
                </label>
                <div className={inputContainerClass}>
                  <Building className={iconInputClass} size={18} />
                  <input
                    id="roomId"
                    name="roomId"
                    onChange={handleChange}
                    value={formData.roomId}
                    className={inputClass}
                    type="text"
                    placeholder="ระบุห้องเรียน"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="age">
                  อายุ
                </label>
                <div className={inputContainerClass}>
                  <Calendar className={iconInputClass} size={18} />
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
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="contactTel">
                  เบอร์ติดต่อ *
                </label>
                <div className={inputContainerClass}>
                  <Phone className={iconInputClass} size={18} />
                  <input
                    id="contactTel"
                    name="contactTel"
                    onChange={handleChange}
                    value={formData.contactTel}
                    className={inputClass}
                    type="tel"
                    placeholder="0xx-xxxxxxx"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <label className={labelClass} htmlFor="contactEmail">
                  อีเมล
                </label>
                <div className={inputContainerClass}>
                  <Mail className={iconInputClass} size={18} />
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    onChange={handleChange}
                    value={formData.contactEmail}
                    className={inputClass}
                    type="email"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <MapPin className="h-5 w-5 text-emerald-500" />{" "}
                ที่อยู่ที่ติดต่อได้
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
            </div>
          </FormSection>

          {/* 2. ข้อมูลการศึกษา */}
          <FormSection title="ข้อมูลการศึกษา" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col">
                <label className={labelClass}>วิทยาลัย</label>
                <div className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3.5 text-gray-500 cursor-not-allowed">
                  {collegeName}
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>จังหวัด</label>
                <div className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3.5 text-gray-500 cursor-not-allowed">
                  {collegeProvince}
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass} htmlFor="graduationYear">
                  ปีที่จบการศึกษา (พ.ศ.) *
                </label>
                <input
                  id="graduationYear"
                  name="graduationYear"
                  onChange={handleChange}
                  value={formData.graduationYear}
                  className={inputClass}
                  type="number"
                  placeholder="25xx"
                  min="2500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="educationLevel">
                  ระดับการศึกษาที่จบ *
                </label>
                <div className={inputContainerClass}>
                  <select
                    id="educationLevel"
                    name="educationLevel"
                    onChange={handleChange}
                    value={formData.educationLevel}
                    className={`${inputClass} appearance-none`}
                    required
                  >
                    <option value="">-- เลือก --</option>
                    <option value="ปวช">ปวช.</option>
                    <option value="ปวส">ปวส.</option>
                  </select>
                  <ChevronRight
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400"
                    size={18}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="gpa">
                  เกรดเฉลี่ยสะสม
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
            </div>

            <div className="mt-6">
              <label className={labelClass}>เพศ</label>
              <div className="flex gap-4">
                {["ชาย", "หญิง"].map((g) => (
                  <label
                    key={g}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-6 py-3 transition-all ${formData.gender === g ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium">{g}</span>
                  </label>
                ))}
              </div>
            </div>
          </FormSection>

          {/* 3. สถานการณ์ทำงานปัจจุบัน (Highlight Section) */}
          <FormSection
            title="สถานการณ์ทำงานปัจจุบัน"
            icon={Briefcase}
            color="text-indigo-600"
          >
            <div className="p-1">
              <label className={labelClass} htmlFor="currentStatus">
                สถานะของคุณในปัจจุบัน *
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    val: "ไม่ได้ทำงาน",
                    label: "1. ไม่ได้ทำงาน",
                    color:
                      "peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700",
                  },
                  {
                    val: "ทำงานแล้ว",
                    label: "2. ทำงานแล้ว",
                    color:
                      "peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700",
                  },
                  {
                    val: "ศึกษาต่อ",
                    label: "3. ศึกษาต่อ",
                    color:
                      "peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700",
                  },
                ].map((item) => (
                  <label key={item.val} className="cursor-pointer">
                    <input
                      type="radio"
                      name="currentStatus"
                      value={item.val}
                      checked={formData.currentStatus === item.val}
                      onChange={handleChange}
                      className="peer sr-only"
                      required
                    />
                    <div
                      className={`rounded-xl border border-gray-200 bg-white px-4 py-4 text-center font-semibold text-gray-600 transition-all hover:border-gray-300 hover:shadow-sm ${item.color}`}
                    >
                      {item.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* --- Conditional: ไม่ได้ทำงาน --- */}
            {isNotWorking && (
              <div className="animate-in fade-in slide-in-from-top-4 mt-6 rounded-2xl border border-rose-100 bg-rose-50/50 p-6 duration-300">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-rose-700">
                  <X className="h-5 w-5" /> รายละเอียด (กรณีไม่ได้ทำงาน)
                </h4>

                <div className="mb-4">
                  <label className={labelClass}>เหตุผลหลัก</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      "ศึกษาต่อ",
                      "หางานทำไม่ได้",
                      "รอฟังคำตอบ",
                      "ไม่ประสงค์จะทำงาน",
                    ].map((opt) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 shadow-sm transition-all ${formData.notWorkingReasonGroup === opt ? "border-rose-500 ring-1 ring-rose-500" : "border-gray-200"}`}
                      >
                        <input
                          type="radio"
                          name="notWorkingReasonGroup"
                          value={opt}
                          checked={formData.notWorkingReasonGroup === opt}
                          onChange={handleChange}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {isUnemployedLookingForJob && (
                  <div className="mb-4">
                    <label className={labelClass}>ปัญหาในการหางาน</label>
                    <select
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
                      <option value="6 หน่วยงานไม่ต้องการ">
                        6 หน่วยงานไม่ต้องการ
                      </option>
                      {/* ... other options */}
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className={labelClass}>สาเหตุโดยละเอียด</label>
                  <select
                    name="unemployedReason"
                    value={formData.unemployedReason}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="">-- เลือกสาเหตุ --</option>
                    <option value="1">ยังไม่ประสงค์ทำงาน</option>
                    <option value="2">รอฟังคำตอบ</option>
                    <option value="3">หางานทำไม่ได้</option>
                    <option value="4">อื่นๆ</option>
                  </select>
                  {isUnemployedOther && (
                    <input
                      name="unemployedReasonOther"
                      onChange={handleChange}
                      value={formData.unemployedReasonOther}
                      className={`${inputClass} mt-2`}
                      placeholder="ระบุสาเหตุ"
                      required
                    />
                  )}
                </div>
              </div>
            )}

            {/* --- Conditional: ทำงานแล้ว --- */}
            {isWorking && (
              <div className="animate-in fade-in slide-in-from-top-4 mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 duration-300">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-700">
                  <Briefcase className="h-5 w-5" /> รายละเอียดการทำงาน
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>ประเภทหน่วยงาน *</label>
                    <select
                      name="employmentType"
                      onChange={handleChange}
                      value={formData.employmentType}
                      className={inputClass}
                      required
                    >
                      <option value="">-- เลือกประเภท --</option>
                      <option value="ข้าราชการ/เจ้าหน้าที่หน่วยงานของรัฐ">
                        ข้าราชการ/รัฐวิสาหกิจ
                      </option>
                      <option value="พนักงานบริษัทิ/องค์กรธุรกิจเอกชน">
                        บริษัทเอกชน
                      </option>
                      <option value="ดำเนินธุรกิจอิสระ/เจ้าของธุรกิจ">
                        ธุรกิจส่วนตัว/อิสระ
                      </option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                    {isEmploymentTypeOther && (
                      <input
                        name="employmentTypeOther"
                        onChange={handleChange}
                        value={formData.employmentTypeOther}
                        className={`${inputClass} mt-2`}
                        placeholder="ระบุประเภท"
                        required
                      />
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <label className={labelClass}>ตำแหน่งงาน</label>
                    <input
                      name="jobTitle"
                      onChange={handleChange}
                      value={formData.jobTitle}
                      className={inputClass}
                      placeholder="เช่น ธุรการ, ช่างเทคนิค"
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className={labelClass}>ชื่อสถานที่ทำงาน</label>
                    <input
                      name="workplaceName"
                      onChange={handleChange}
                      value={formData.workplaceName}
                      className={inputClass}
                      placeholder="ชื่อบริษัท/ร้าน"
                      required
                    />
                  </div>

                  {/* Workplace Address - Simplified for demo, add all fields in real use */}
                  <div className="md:col-span-2 border-t border-emerald-200 pt-4 mt-2">
                    <p className="text-sm font-semibold text-emerald-700 mb-3">
                      ที่อยู่ที่ทำงาน
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="workplaceAddrProvince"
                        onChange={handleChange}
                        value={formData.workplaceAddrProvince}
                        className={inputClass}
                        placeholder="จังหวัด"
                      />
                      <input
                        name="workplaceTel"
                        onChange={handleChange}
                        value={formData.workplaceTel}
                        className={inputClass}
                        placeholder="เบอร์โทรที่ทำงาน"
                      />
                      {/* Add other address fields here... */}
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className={labelClass}>รายได้ต่อเดือน *</label>
                    <select
                      name="salaryRange"
                      onChange={handleChange}
                      value={formData.salaryRange}
                      className={inputClass}
                      required
                    >
                      <option value="">-- ช่วงรายได้ --</option>
                      <option value="ต่ำกว่า 7,940 บาท">
                        ต่ำกว่า 7,940 บาท
                      </option>
                      <option value="7,941 - 10,000 บาท">
                        7,941 - 10,000 บาท
                      </option>
                      <option value="10,001 - 15,000 บาท">
                        10,001 - 15,000 บาท
                      </option>
                      <option value="15,001 - 20,000 บาท">
                        15,001 - 20,000 บาท
                      </option>
                      <option value="5">อื่นๆ</option>
                    </select>
                    {isSalaryOther && (
                      <input
                        name="salaryRangeOther"
                        onChange={handleChange}
                        value={formData.salaryRangeOther}
                        className={`${inputClass} mt-2`}
                        placeholder="ระบุจำนวน"
                      />
                    )}
                  </div>

                  <div className="md:col-span-1">
                    <label className={labelClass}>งานตรงสาขาหรือไม่ *</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="jobMatch"
                          value="ตรง"
                          checked={formData.jobMatch === "ตรง"}
                          onChange={handleChange}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />{" "}
                        ตรงสาขา
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="jobMatch"
                          value="ไม่ตรง"
                          checked={formData.jobMatch === "ไม่ตรง"}
                          onChange={handleChange}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />{" "}
                        ไม่ตรงสาขา
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {/* 4. การศึกษาต่อ */}
          <FormSection
            title="ความต้องการศึกษาต่อ"
            icon={BookOpen}
            color="text-sky-600"
          >
            <div className="mb-6">
              <label className={labelClass}>ท่านประสงค์ศึกษาต่อหรือไม่</label>
              <div className="flex gap-4 mt-2">
                <label
                  className={`cursor-pointer px-5 py-2.5 rounded-xl border transition-all ${formData.furtherStudyIntention === "ต้องการศึกษาต่อ" || isStudying ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-white border-gray-200"}`}
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
                    disabled={isStudying}
                    className="mr-2"
                  />
                  ต้องการ / กำลังศึกษา
                </label>
                <label
                  className={`cursor-pointer px-5 py-2.5 rounded-xl border transition-all ${formData.furtherStudyIntention === "ไม่ต้องการศึกษาต่อ" && !isStudying ? "bg-gray-100 border-gray-400 text-gray-800" : "bg-white border-gray-200"}`}
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
                    disabled={isStudying}
                    className="mr-2"
                  />
                  ไม่ต้องการ
                </label>
              </div>
            </div>

            {isFurtherStudy && (
              <div className="animate-in fade-in slide-in-from-top-4 rounded-2xl border border-sky-100 bg-sky-50/50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>ระดับการศึกษา *</label>
                    <select
                      name="furtherStudyLevel"
                      onChange={handleChange}
                      value={formData.furtherStudyLevel}
                      className={inputClass}
                      required
                    >
                      <option value="">-- ระดับ --</option>
                      <option value="ระดับปริญญาตรี">ป.ตรี / ปวส.</option>
                      <option value="ระดับปริญญาโท">ป.โท</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>สาขาวิชา *</label>
                    <select
                      name="furtherStudyMajor"
                      onChange={handleChange}
                      value={formData.furtherStudyMajor}
                      className={inputClass}
                      required
                    >
                      <option value="">-- สาขา --</option>
                      <option value="สาขาเดิม">สาขาเดิม</option>
                      <option value="ระบุสาขา">สาขาใหม่</option>
                    </select>
                    {formData.furtherStudyMajor === "ระบุสาขา" && (
                      <input
                        name="furtherStudyMajorDetail"
                        onChange={handleChange}
                        value={formData.furtherStudyMajorDetail}
                        className={`${inputClass} mt-2`}
                        placeholder="ระบุสาขา"
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>ชื่อสถาบัน *</label>
                    <input
                      name="furtherStudyInstitution"
                      onChange={handleChange}
                      value={formData.furtherStudyInstitution}
                      className={inputClass}
                      placeholder="ระบุชื่อสถาบันการศึกษา"
                      required
                    />
                  </div>
                  <div className="md:col-span-1 lg:col-span-2">
                    <label className={labelClass}>เหตุผล *</label>
                    <select
                      name="furtherStudyReason"
                      onChange={handleChange}
                      value={formData.furtherStudyReason}
                      className={inputClass}
                      required
                    >
                      <option value="">-- เหตุผล --</option>
                      <option value="เพื่อเพิ่มพูนความรู้ความสามารถ">
                        เพื่อเพิ่มพูนความรู้
                      </option>
                      <option value="ได้รับทุนการศึกษาต่อ">ได้รับทุน</option>
                      <option value="งานที่ทำต้องการใช้วุฒิที่สูงกว่า ปวช./ปวส.">
                        งานต้องการวุฒิสูงขึ้น
                      </option>
                      <option value="4">อื่นๆ</option>
                    </select>
                    {isFurtherStudyReasonOther && (
                      <input
                        name="furtherStudyReasonOther"
                        onChange={handleChange}
                        value={formData.furtherStudyReasonOther}
                        className={`${inputClass} mt-2`}
                        placeholder="ระบุเหตุผล"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </FormSection>

          {/* 5. ข้อเสนอแนะ */}
          <FormSection
            title="ข้อเสนอแนะเพิ่มเติม"
            icon={MessageSquare}
            color="text-amber-500"
          >
            <textarea
              name="suggestion"
              onChange={handleChange}
              value={formData.suggestion}
              className={`${inputClass} min-h-[120px] resize-y`}
              placeholder="ข้อเสนอแนะเพื่อการพัฒนาวิทยาลัย (ไม่บังคับ)"
            />
          </FormSection>

          {/* Submit Actions */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 p-4 backdrop-blur-md md:static md:mt-12 md:bg-transparent md:p-0 md:border-0 md:backdrop-blur-none">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:justify-end">
              <Link
                href="/EmploymentDashboard"
                className="order-2 w-full md:order-1 md:w-auto"
              >
                <button
                  type="button"
                  className="w-full rounded-xl border border-gray-200 bg-white px-8 py-3.5 font-semibold text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 md:w-auto"
                >
                  ยกเลิก
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`order-1 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:ring-4 md:w-auto md:order-2 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 focus:ring-emerald-100"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" /> ยืนยันข้อมูล
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Spacer for mobile fixed bottom bar */}
          <div className="h-24 md:h-0" />
        </form>

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
