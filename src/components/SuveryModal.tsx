// src/components/SuveryDetailModal.tsx

"use client";
import React from "react";
import { Isuvery } from "./Isuvery"; // ตรวจสอบว่าไฟล์ Isuvery.ts อยู่ในโฟลเดอร์เดียวกันหรือแก้ไข path

interface ModalProps {
  suvery: Isuvery;
  isOpen: boolean;
  onClose: () => void;
}

const SuveryModal = ({ isOpen, onClose, suvery }: ModalProps) => {
  if (!isOpen || !suvery) return null;

  const formatValue = (key: string, value: any): string => {
    if (!value) return "-";

    if (key === "createdAt" || key === "submittedAt") {
      try {
        return new Date(value).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return String(value);
      }
    }
    if (key.toLowerCase().includes("salary") && typeof value === "number") {
      return `${value.toLocaleString("th-TH")} บาท`;
    }
    if (key === "currentStatus") {
      if (value === "1") return "ไม่ได้ทำงาน";
      if (value === "2") return "ทำงานแล้ว";
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
    createdAt: "วันที่บันทึก",
  };

  const displayData = Object.entries(suvery).filter(([key, value]) => {
    const excludedKeys = [
      "__v",
      "_id",
      "updatedAt",
      "fullName",
      "college",
      "collegeProvince",
    ];
    if (excludedKeys.includes(key)) return false;
    if (value === null || value === undefined) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (typeof value === "object" && Object.keys(value).length === 0)
      return false;
    return placeholders.hasOwnProperty(key);
  });

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl transform flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Sticky) */}
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-gray-100 bg-white pb-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="flex items-center gap-2 text-2xl font-bold text-green-700 dark:text-green-400">
            <svg
              className="h-8 w-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            รายละเอียดแบบสำรวจ
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 overflow-y-auto pr-2">
          {/* Name Section */}
          <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/20">
            <p className="text-sm font-medium tracking-wide text-orange-600 uppercase dark:text-orange-400">
              ชื่อผู้ตอบแบบสำรวจ
            </p>
            <p className="mt-1 text-2xl font-bold break-words text-gray-900 dark:text-white">
              {suvery.fullName}
            </p>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 gap-4 pb-4 md:grid-cols-2">
            {displayData.map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors duration-200 hover:border-green-200 dark:border-gray-700 dark:bg-gray-700/50 dark:hover:border-green-800"
              >
                <p className="mb-1 text-xs font-semibold tracking-wide text-green-700 uppercase dark:text-green-400">
                  {placeholders[key] || key}
                </p>
                <p className="text-base leading-relaxed font-medium break-words text-gray-800 dark:text-gray-200">
                  {formatValue(key, value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="transform rounded-xl bg-green-600 px-6 py-2.5 font-medium text-white shadow-md shadow-green-200 transition-all duration-200 hover:bg-green-700 active:scale-95 dark:shadow-none"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuveryModal;
