// src/components/SuveryDetailModal.tsx

"use client";
import { Isuvery } from "./Isuvery";
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Mail,
  DollarSign,
} from "lucide-react"; // ใช้ lucide-react สำหรับไอคอนที่สวยงาม

interface ModalProps {
  suvery: Isuvery;
  isOpen: boolean;
  onClose: () => void;
}

const SuveryDetailModal = ({ isOpen, onClose, suvery }: ModalProps) => {
  if (!isOpen || !suvery) return null;

  // ฟอร์แมตวันที่
  const formatDate = (dateString: any) => {
    try {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateString);
    }
  };

  // Helper function to check valid value
  const hasValue = (val: any) => {
    if (val === null || val === undefined) return false;
    if (typeof val === "string" && val.trim() === "") return false;
    return true;
  };

  // Component ย่อยสำหรับแสดงข้อมูล 1 บรรทัด
  const DataRow = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value: any;
    fullWidth?: boolean;
  }) => {
    if (!hasValue(value)) return null;
    return (
      <div
        className={`flex flex-col ${fullWidth ? "col-span-full" : "col-span-1"}`}
      >
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </span>
        <span className="text-base font-medium text-gray-800 dark:text-gray-200 break-words [word-break:break-word] overflow-hidden leading-relaxed">
          {value}
        </span>
      </div>
    );
  };

  // Component ย่อยสำหรับ Group Header
  const SectionHeader = ({
    title,
    icon: Icon,
  }: {
    title: string;
    icon: any;
  }) => (
    <div className="flex items-center gap-2 mb-4 mt-6 pb-2 border-b border-gray-100 dark:border-gray-700">
      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        <Icon size={18} />
      </div>
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h4>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-[1600px] max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                รายละเอียดแบบสำรวจ
              </h3>
              <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed break-words [word-break:break-word] overflow-hidden">
                <Calendar size={12} /> บันทึกเมื่อ:{" "}
                {formatDate(suvery.submittedAt || suvery.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Scrollable Content --- */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {/* Status Badge Banner */}
          <div className="mb-8 p-4 rounded-2xl bg-linear-to-r from-gray-50 to-white border border-gray-100 dark:from-gray-800 dark:to-gray-800/50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                ชื่อผู้ตอบแบบสำรวจ
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {suvery.fullName}
              </h2>
            </div>
            <div
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                suvery.currentStatus === "ทำงานแล้ว"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : suvery.currentStatus === "ศึกษาต่อ"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {suvery.currentStatus}
            </div>
          </div>

          {/* 1. ข้อมูลส่วนตัว */}
          <SectionHeader title="ข้อมูลส่วนตัว" icon={User} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4 mb-2">
            <DataRow label="รหัสนักศึกษา" value={suvery.studentId} />
            <DataRow label="ห้องเรียน" value={suvery.roomId} />
            <DataRow
              label="อายุ"
              value={suvery.age ? `${suvery.age} ปี` : null}
            />
            <DataRow label="เพศ" value={suvery.gender} />
            <DataRow label="ภูมิลำเนา" value={suvery.homeProvince} />
          </div>

          {/* 2. การติดต่อ & ที่อยู่ */}
          <SectionHeader title="การติดต่อ & ที่อยู่" icon={MapPin} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2">
            <div className="flex items-center gap-2 col-span-1">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {suvery.contactTel || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2 col-span-1">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {suvery.contactEmail || "-"}
              </span>
            </div>
            <DataRow
              label="ที่อยู่"
              value={[
                suvery.addrNumber,
                suvery.addrBuilding,
                suvery.addrMoo ? `ม.${suvery.addrMoo}` : null,
                suvery.addrSoi,
                suvery.addrRoad,
                suvery.addrSubDistrict,
                suvery.addrDistrict,
                suvery.addrProvince,
                suvery.addrZipCode,
              ]
                .filter(Boolean)
                .join(" ")}
              fullWidth
            />
          </div>

          {/* 3. การศึกษา */}
          <SectionHeader title="ประวัติการศึกษา" icon={GraduationCap} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-4 mb-2">
            <DataRow label="ระดับการศึกษาที่จบ" value={suvery.educationLevel} />
            <DataRow label="ปีที่จบการศึกษา" value={suvery.graduationYear} />
            <DataRow label="เกรดเฉลี่ย (GPA)" value={suvery.gpa} />
          </div>

          {/* 4. ข้อมูลการทำงาน (ถ้ามี) */}
          {suvery.currentStatus === "ทำงานแล้ว" && (
            <>
              <SectionHeader title="ข้อมูลการทำงาน" icon={Briefcase} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2">
                <DataRow label="ตำแหน่งงาน" value={suvery.jobTitle} />
                <DataRow label="สถานที่ทำงาน" value={suvery.workplaceName} />
                <DataRow label="ประเภทหน่วยงาน" value={suvery.employmentType} />
                <DataRow
                  label="ประเภทอื่นๆ"
                  value={suvery.employmentTypeOther}
                />
                <DataRow label="รายได้" value={suvery.salaryRange} />
                <DataRow
                  label="รายได้ (ระบุ)"
                  value={suvery.salaryRangeOther}
                />
                <DataRow label="ตรงสายงานหรือไม่" value={suvery.jobMatch} />
                <DataRow label="ความพึงพอใจ" value={suvery.jobSatisfaction} />
                <DataRow
                  label="ที่อยู่ที่ทำงาน"
                  value={[
                    suvery.workplaceAddrNumber,
                    suvery.workplaceAddrMoo,
                    suvery.workplaceAddrSoi,
                    suvery.workplaceAddrRoad,
                    suvery.workplaceAddrSubDistrict,
                    suvery.workplaceAddrDistrict,
                    suvery.workplaceAddrProvince,
                    suvery.workplaceAddrZipCode,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  fullWidth
                />
              </div>
            </>
          )}

          {/* 5. ข้อมูลการศึกษาต่อ (ถ้ามี) */}
          {(suvery.currentStatus === "ศึกษาต่อ" ||
            suvery.furtherStudyIntention === "ต้องการศึกษาต่อ") && (
            <>
              <SectionHeader title="ข้อมูลการศึกษาต่อ" icon={GraduationCap} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2">
                <DataRow
                  label="ความต้องการ"
                  value={suvery.furtherStudyIntention}
                />
                <DataRow label="ระดับชั้น" value={suvery.furtherStudyLevel} />
                <DataRow label="สาขาวิชา" value={suvery.furtherStudyMajor} />
                <DataRow
                  label="สาขา (ระบุ)"
                  value={suvery.furtherStudyMajorDetail}
                />
                <DataRow
                  label="เหตุผล"
                  value={suvery.furtherStudyReason}
                  fullWidth
                />
              </div>
            </>
          )}

          {/* 6. ข้อมูลว่างงาน (ถ้ามี) */}
          {suvery.currentStatus === "ไม่ได้ทำงาน" && (
            <>
              <SectionHeader title="ข้อมูลสถานะว่างงาน" icon={User} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-2">
                <DataRow
                  label="เหตุผลหลัก"
                  value={suvery.notWorkingReasonGroup}
                />
                <DataRow
                  label="ปัญหาในการหางาน"
                  value={suvery.jobSearchProblem}
                />
                <DataRow
                  label="สาเหตุละเอียด"
                  value={suvery.unemployedReason}
                />
                <DataRow
                  label="สาเหตุอื่น"
                  value={suvery.unemployedReasonOther}
                />
              </div>
            </>
          )}

          {/* 7. ข้อเสนอแนะ */}
          {hasValue(suvery.suggestion) && (
            <div className="mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
              <h5 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2">
                <FileText size={18} /> ข้อเสนอแนะ
              </h5>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{suvery.suggestion}"
              </p>
            </div>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg shadow-gray-200 dark:shadow-none dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuveryDetailModal;
