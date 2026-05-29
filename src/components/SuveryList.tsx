// src/components/SuveryList.tsx
"use client";

import React, { useState, FC, ReactNode } from "react";
import { HiPencilAlt, HiEye, HiTrash, HiDownload } from "react-icons/hi";
import SuveryModal from "@/components/SuveryModal";
import { Isuvery } from "./Isuvery";
import CustomAlertDialog from "./CustomAlertDialog";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ---------------------------------------------
// Admin Password
// ---------------------------------------------
const ADMIN_PASSWORD = "admin1234";

// ---------------------------------------------
// Types
// ---------------------------------------------
interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPassword: string;
  suveryIdToDelete: string | null;
  onDeleteConfirmed: (id: string) => void;
}

interface SuveryListProps {
  suverys: Isuvery[];
  isLoading: boolean;
  isError: boolean;
}

interface CommonItemProps {
  suvery: Isuvery;
  onDetailClick: (suvery: Isuvery, action: "view" | "edit" | "delete") => void;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fullName: string;
  isDeleting: boolean;
}

// ---------------------------------------------
// Helpers & Constants
// ---------------------------------------------
const getDepartmentFromRoomId = (roomId?: string): string => {
  if (!roomId || roomId === "-") return "ไม่ระบุ";
  const r = roomId.toLowerCase().trim();
  
  if (r.startsWith("ชย") || r.startsWith("สชย")) return "แผนกวิชาช่างยนต์";
  if (r.startsWith("ยว") || r.startsWith("สยว")) return "แผนกวิชายานยนต์ไฟฟ้า";
  if (r.startsWith("ชก") || r.startsWith("สชก")) return "แผนกวิชาช่างกลโรงงาน";
  if (r.startsWith("ชช") || r.startsWith("สชช") || r.startsWith("ชล") || r.startsWith("สชล")) return "แผนกวิชาช่างเชื่อมโลหะ";
  if (r.startsWith("ฟฟ") || r.startsWith("สฟฟ") || r.startsWith("ทผ") || r.startsWith("สทผ") || r.startsWith("ชฟ") || r.startsWith("สชฟ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (r.startsWith("อล") || r.startsWith("สอล") || r.includes("อิเล็ก")) return "แผนกวิชาช่างอิเล็กทรอนิกส์";
  if (r.startsWith("กส") || r.startsWith("สกส") || r.startsWith("ชกอ") || r.startsWith("สชกอ")) return "แผนกวิชาช่างก่อสร้าง";
  if (r.startsWith("พบ") || r.startsWith("สบค") || r.startsWith("บช") || r.includes("บัญชี")) return "แผนกวิชาการบัญชี";
  if (r.startsWith("มคก") || r.startsWith("สบตา") || r.includes("ตลาด")) return "แผนกวิชาการตลาด";
  if (r.startsWith("พค") || r.startsWith("สบบ") || r.includes("ดิจิทัล") || r.includes("คอม")) return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  if (r.startsWith("รร") || r.startsWith("สอรร") || r.includes("โรงแรม")) return "แผนกวิชาการโรงแรม";
  if (r.startsWith("มลจ") || r.includes("โลจิส")) return "แผนกวิชาการตลาด/โลจิสติก์";
  if (r.startsWith("สส") || r.includes("สามัญ")) return "แผนกวิชาสามัญสัมพันธ์";

  // Fallback checks
  if (r.includes("ชย")) return "แผนกวิชาช่างยนต์";
  if (r.includes("ชก")) return "แผนกวิชาช่างกลโรงงาน";
  if (r.includes("ชช")) return "แผนกวิชาช่างเชื่อมโลหะ";
  if (r.includes("ไฟฟ้า") || r.includes("ทผ")) return "แผนกวิชาช่างไฟฟ้ากำลัง";
  if (r.includes("พบ") || r.includes("สบค")) return "แผนกวิชาการบัญชี";
  if (r.includes("พค") || r.includes("สบบ")) return "แผนกวิชาเทคโนโลยีธุรกิจดิจิทัล";
  if (r.includes("มค") || r.includes("สบตา")) return "แผนกวิชาการตลาด";

  return "ไม่ระบุ";
};

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_COLOR_MAP: Record<string, string> = {
  "1": "text-red-700 bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  "2": "text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  ไม่ได้ทำงาน:
    "text-red-700 bg-red-100 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  ทำงานแล้ว:
    "text-green-700 bg-green-100 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
};

// ---------------------------------------------
// Sub-Components (เพื่อลด code duplicate)
// ---------------------------------------------

// 1. Badge แสดงสถานะ
const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const statusColor =
    STATUS_COLOR_MAP[status || ""] ||
    "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${statusColor}`}
    >
      {status === "1"
        ? "ไม่ได้ทำงาน"
        : status === "2"
          ? "ทำงานแล้ว"
          : status || "ไม่ระบุ"}
    </span>
  );
};

// 2. ปุ่ม Action (Edit, View, Delete)
const ActionButtons: FC<CommonItemProps> = ({ suvery, onDetailClick }) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick(suvery, "edit");
        }}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
        title="แก้ไข"
      >
        <HiPencilAlt size={20} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick(suvery, "view");
        }}
        className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
        title="ดูรายละเอียด"
      >
        <HiEye size={20} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDetailClick(suvery, "delete");
        }}
        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        title="ลบ"
      >
        <HiTrash size={20} />
      </button>
    </div>
  );
};

// 3. Desktop Table Row
const DesktopTableRow: FC<CommonItemProps> = ({ suvery, onDetailClick }) => {
  const dept = getDepartmentFromRoomId(suvery.roomId);
  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50"
      onClick={() => onDetailClick(suvery, "view")}
    >
      <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
        {suvery.fullName}
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-700 dark:text-gray-300 font-semibold">
        {dept}
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {suvery.roomId || "-"}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusBadge status={suvery.currentStatus || ""} />
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
        {formatDate(suvery.submittedAt)}
      </td>
      <td className="px-4 py-4 text-right whitespace-nowrap">
        <div className="flex justify-end">
          <ActionButtons suvery={suvery} onDetailClick={onDetailClick} />
        </div>
      </td>
    </tr>
  );
};

// 4. Mobile Card Item
const MobileCardItem: FC<CommonItemProps> = ({ suvery, onDetailClick }) => {
  const dept = getDepartmentFromRoomId(suvery.roomId);
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={() => onDetailClick(suvery, "view")}
    >
      {/* Header: Name & Status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
          {suvery.fullName}
        </h3>
        <StatusBadge status={suvery.currentStatus || ""} />
      </div>

      {/* Dept & Room Badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">
          {dept}
        </span>
        <span className="bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">
          ห้อง: {suvery.roomId || "-"}
        </span>
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <span className="mr-1 font-medium">บันทึกเมื่อ:</span>
        {formatDate(suvery.submittedAt)}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-gray-100 dark:bg-gray-700" />

      {/* Footer: Actions */}
      <div className="flex items-center justify-end">
        <ActionButtons suvery={suvery} onDetailClick={onDetailClick} />
      </div>
    </div>
  );
};

// ---------------------------------------------
// Component: DeleteConfirmModal
// ---------------------------------------------
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fullName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm scale-100 transform overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center p-6 pb-0 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <HiTrash className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            ยืนยันการลบข้อมูล
          </h3>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            คุณต้องการลบข้อมูลของ <br />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
              "{fullName}"
            </span>
            <br />
            ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
        </div>

        <div className="flex gap-3 p-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-5000 flex-1 rounded-xl bg-gray-100 px-4 py-2.5 font-medium transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-700 disabled:opacity-70"
          >
            {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------
// Component: PasswordModal
// ---------------------------------------------
const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPassword,
  suveryIdToDelete,
  onDeleteConfirmed,
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleVerify = () => {
    if (!password) {
      setError("โปรดป้อนรหัสผ่าน");
      return;
    }
    if (password === ADMIN_PASSWORD || (expectedPassword && password === expectedPassword)) {
      if (suveryIdToDelete) {
        onDeleteConfirmed(suveryIdToDelete);
      } else {
        onSuccess();
      }
    } else {
      setError("รหัสผ่านไม่ถูกต้อง โปรดลองอีกครั้ง");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-6 shadow-2xl sm:p-8 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-center text-xl font-bold text-green-700 dark:text-green-400">
          🔐 ยืนยันรหัสผ่าน
        </h3>
        <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
          ป้อนรหัสนักศึกษา <b>หรือ</b> รหัส Admin
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          placeholder="รหัสผ่าน"
          className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />

        {error && (
          <p className="mb-3 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              onClose();
              setPassword("");
              setError("");
            }}
            className="order-2 w-full rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200 sm:order-1 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleVerify}
            className="order-1 w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 sm:order-2 dark:focus:ring-blue-800"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------
// Main: SuveryList
// ---------------------------------------------
const SuveryList: FC<SuveryListProps> = ({ suverys, isLoading, isError }) => {
  const [selectedSuvery, setSelectedSuvery] = useState<Isuvery | null>(null);
  const [verifiedSuveryId, setVerifiedSuveryId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal Password & Action states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "view" | "edit" | "delete" | "exportExcel" | "exportPdf" | null
  >(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [studentPassword, setStudentPassword] = useState<string>("");

  // Delete Modal States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  // Custom Alert
  const [isCustomAlertOpen, setIsCustomAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "" as ReactNode,
    type: "info" as "success" | "error" | "warning" | "info",
  });

  // Client-side Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  // Get all unique departments and roomIds from the entire dataset for filter options
  const uniqueDepartments = Array.from(
    new Set(suverys.map((s) => getDepartmentFromRoomId(s.roomId)))
  ).filter((d) => d !== "ไม่ระบุ").sort();

  const uniqueRooms = Array.from(
    new Set(suverys.map((s) => s.roomId).filter(Boolean))
  ).sort();

  // Dynamic room options based on selected department
  const filteredRoomOptions = selectedDepartment
    ? uniqueRooms.filter((r) => getDepartmentFromRoomId(r) === selectedDepartment)
    : uniqueRooms;

  // Filter client-side
  const filteredSuverys = suverys.filter((sv) => {
    // 1. Search Query
    if (searchQuery) {
      const lower = searchQuery.toLowerCase().trim();
      const name = (sv.fullName || "").toLowerCase();
      const id = (sv.studentId || "").toLowerCase();
      const room = (sv.roomId || "").toLowerCase();
      if (!name.includes(lower) && !id.includes(lower) && !room.includes(lower)) {
        return false;
      }
    }
    // 2. Department
    if (selectedDepartment) {
      if (getDepartmentFromRoomId(sv.roomId) !== selectedDepartment) {
        return false;
      }
    }
    // 3. RoomId
    if (selectedRoomId) {
      if (sv.roomId !== selectedRoomId) {
        return false;
      }
    }
    return true;
  });

  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    setSelectedRoomId("");
  };

  const handleProtectedAction = (
    suvery: Isuvery,
    action: "view" | "edit" | "delete",
  ) => {
    setSelectedSuvery(suvery);
    setPendingAction(action);
    setTargetId(suvery._id);
    setStudentPassword(suvery.studentId);

    if (verifiedSuveryId === suvery._id) {
      executeAction(suvery, action);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handleExportAction = (action: "exportExcel" | "exportPdf") => {
    setSelectedSuvery(null);
    setPendingAction(action);
    setTargetId(null);
    setStudentPassword("");
    setIsPasswordModalOpen(true);
  };

  const executeExportExcel = () => {
    const data = filteredSuverys.map((sv, idx) => ({
      "ลำดับ": idx + 1,
      "รหัสนักศึกษา": sv.studentId || "-",
      "ชื่อ-นามสกุล": sv.fullName || "-",
      "อายุ": sv.age || "-",
      "เพศ": sv.gender || "-",
      "เบอร์โทรศัพท์": sv.contactTel || "-",
      "อีเมล": sv.contactEmail || "-",
      "แผนกวิชา": getDepartmentFromRoomId(sv.roomId),
      "ห้องเรียน": sv.roomId || "-",
      "เกรดเฉลี่ยสะสม (GPA)": sv.gpa || "-",
      "ปีที่สำเร็จการศึกษา": sv.graduationYear || "-",
      "ระดับการศึกษา": sv.educationLevel || "-",
      "สถานะปัจจุบัน": sv.currentStatus || "ไม่ระบุ",
      "รายละเอียดอาชีพ/การศึกษาต่อ": sv.currentStatus === "ทำงานแล้ว" 
        ? `${sv.jobTitle || "-"} (${sv.workplaceName || "-"})` 
        : sv.currentStatus === "ศึกษาต่อ" 
          ? `ศึกษาต่อระดับ ${sv.furtherStudyLevel || "-"} (${sv.furtherStudyMajorDetail || "-"})` 
          : "ไม่ได้ทำงาน",
      "รายได้ต่อเดือน": sv.salaryRange || "-",
      "ตรงสาขาที่เรียน": sv.jobMatch === "1" ? "ตรงสาขา" : sv.jobMatch === "2" ? "ไม่ตรงสาขา" : "-",
      "ความพึงพอใจในงาน": sv.jobSatisfaction === "1" ? "พึงพอใจ" : sv.jobSatisfaction === "2" ? "ไม่พึงพอใจ" : "-",
      "สาเหตุที่ยังหางานไม่ได้": sv.currentStatus === "ไม่ได้ทำงาน" ? (sv.notWorkingReasonGroup || "-") : "-",
      "ข้อเสนอแนะเพิ่มเติม": sv.suggestion || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ข้อมูลศิษย์เก่า");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const finalData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(finalData, `Employment_Suvery_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const executeExportPdf = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>รายงานข้อมูลศิษย์เก่า</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
              body {
                font-family: 'Sarabun', sans-serif;
                padding: 30px;
                color: #1f2937;
                background-color: #ffffff;
                line-height: 1.5;
              }
              h1 {
                text-align: center;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 5px;
                color: #111827;
              }
              .subtitle {
                text-align: center;
                font-size: 14px;
                color: #4b5563;
                margin-bottom: 25px;
                font-weight: 400;
              }
              .summary-cards {
                display: flex;
                justify-content: space-around;
                margin-bottom: 30px;
                background-color: #f9fafb;
                padding: 15px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
              }
              .summary-item {
                text-align: center;
              }
              .summary-label {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                margin-bottom: 4px;
              }
              .summary-value {
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                font-size: 12px;
              }
              th, td {
                border: 1px solid #e5e7eb;
                padding: 10px 8px;
                text-align: left;
              }
              th {
                background-color: #f3f4f6;
                font-weight: 700;
                color: #374151;
                font-size: 11px;
                text-transform: uppercase;
              }
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
              .status-badge {
                display: inline-block;
                padding: 2px 8px;
                font-size: 10px;
                font-weight: 600;
                border-radius: 9999px;
              }
              .status-working {
                background-color: #d1fae5;
                color: #065f46;
              }
              .status-notworking {
                background-color: #fee2e2;
                color: #991b1b;
              }
              .status-studying {
                background-color: #f3e8ff;
                color: #6b21a8;
              }
              @media print {
                body { padding: 0; }
                @page { size: A4 landscape; margin: 15mm; }
              }
            </style>
          </head>
          <body>
            <h1>รายงานสรุปการทำงานและการศึกษาต่อของศิษย์เก่า</h1>
            <div class="subtitle">วิทยาลัยเทคนิคกันทรลักษ์ • ข้อมูล ณ วันที่ ${new Date().toLocaleDateString("th-TH")}</div>
            
            <div class="summary-cards">
              <div class="summary-item">
                <div class="summary-label">จำนวนผู้กรอกทั้งหมด</div>
                <div class="summary-value">${filteredSuverys.length} คน</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">ทำงานแล้ว</div>
                <div class="summary-value" style="color: #059669;">${filteredSuverys.filter((s) => s.currentStatus === "ทำงานแล้ว").length} คน</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">ไม่ได้ทำงาน</div>
                <div class="summary-value" style="color: #dc2626;">${filteredSuverys.filter((s) => s.currentStatus === "ไม่ได้ทำงาน").length} คน</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">ศึกษาต่อ</div>
                <div class="summary-value" style="color: #7c3aed;">${filteredSuverys.filter((s) => s.currentStatus === "ศึกษาต่อ").length} คน</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%; text-align: center;">ลำดับ</th>
                  <th style="width: 12%;">รหัสนักศึกษา</th>
                  <th style="width: 15%;">ชื่อ-สกุล</th>
                  <th style="width: 15%;">แผนกวิชา</th>
                  <th style="width: 8%;">ห้องเรียน</th>
                  <th style="width: 11%;">เบอร์โทรศัพท์</th>
                  <th style="width: 11%;">สถานะปัจจุบัน</th>
                  <th style="width: 23%;">รายละเอียดการทำงาน/การศึกษาต่อ</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSuverys.map((sv, idx) => {
                  let statusClass = "status-notworking";
                  if (sv.currentStatus === "ทำงานแล้ว") statusClass = "status-working";
                  else if (sv.currentStatus === "ศึกษาต่อ") statusClass = "status-studying";

                  let detail = "-";
                  if (sv.currentStatus === "ทำงานแล้ว") {
                    detail = `${sv.jobTitle || "-"}ที่ ${sv.workplaceName || "-"}`;
                  } else if (sv.currentStatus === "ศึกษาต่อ") {
                    detail = `ศึกษาต่อระดับ ${sv.furtherStudyLevel || "-"} (${sv.furtherStudyMajorDetail || "-"})`;
                  } else if (sv.currentStatus === "ไม่ได้ทำงาน") {
                    detail = `สาเหตุ: ${sv.notWorkingReasonGroup || "-"}`;
                  }

                  return `
                    <tr>
                      <td style="text-align: center;">${idx + 1}</td>
                      <td>${sv.studentId || "-"}</td>
                      <td style="font-weight: 600;">${sv.fullName || "-"}</td>
                      <td>${getDepartmentFromRoomId(sv.roomId)}</td>
                      <td>${sv.roomId || "-"}</td>
                      <td>${sv.contactTel || "-"}</td>
                      <td>
                        <span class="status-badge ${statusClass}">
                          ${sv.currentStatus || "ไม่ระบุ"}
                        </span>
                      </td>
                      <td>${detail}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const executeAction = (
    suvery: Isuvery,
    action: "view" | "edit" | "delete",
  ) => {
    const encoded = btoa(suvery._id);

    if (action === "view") {
      setIsDetailModalOpen(true);
      return;
    }

    if (action === "edit") {
      window.location.href = `/suvery/edit/${encoded}`;
      return;
    }

    if (action === "delete") {
      setIsDeleteConfirmOpen(true);
      return;
    }
  };

  const onPasswordSuccess = () => {
    setIsPasswordModalOpen(false);

    if (pendingAction === "exportExcel") {
      executeExportExcel();
      setPendingAction(null);
      return;
    }

    if (pendingAction === "exportPdf") {
      executeExportPdf();
      setPendingAction(null);
      return;
    }

    if (selectedSuvery && pendingAction) {
      executeAction(selectedSuvery, pendingAction);
    }
    setPendingAction(null);
  };

  const handlePasswordConfirmedDelete = (id: string) => {
    setIsPasswordModalOpen(false);
    setIsDeleteConfirmOpen(true);
    setPendingAction(null);
  };

  const confirmDelete = async () => {
    if (!selectedSuvery) return;

    setIsDeletingProcess(true);

    try {
      const res = await fetch(`/api/suvery?id=${selectedSuvery._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsDeleteConfirmOpen(false);
        setAlertContent({
          title: "ลบสำเร็จ!",
          message: `ข้อมูลถูกลบแล้ว`,
          type: "success",
        });
        setIsCustomAlertOpen(true);
        setTimeout(() => window.location.reload(), 600);
      } else {
        throw new Error("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      setIsDeleteConfirmOpen(false);
      setAlertContent({
        title: "Error",
        message: "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
        type: "error",
      });
      setIsCustomAlertOpen(true);
    } finally {
      setIsDeletingProcess(false);
    }
  };

  // -------------------------
  // Render States
  // -------------------------
  if (isLoading)
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <p>โหลดข้อมูลล้มเหลว กรุณาลองใหม่ภายหลัง</p>
      </div>
    );

  if (suverys.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">ไม่มีข้อมูลสำรวจ</p>
      </div>
    );

  return (
    <>
      {/* ------------------------------------------- */}
      {/* EXPORT PANEL: Excel & PDF (requires admin1234) */}
      {/* ------------------------------------------- */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-xs dark:bg-gray-900 dark:border-gray-800">
        <span className="mr-auto text-sm font-semibold text-gray-500 dark:text-gray-400">
          เครื่องมือส่งออกข้อมูล (จำกัดสิทธิ์ผู้ดูแลระบบ):
        </span>
        <button
          onClick={() => handleExportAction("exportExcel")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-0.5 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950 dark:shadow-none cursor-pointer"
        >
          <HiDownload className="h-4 w-4" /> ส่งออก Excel (.xlsx)
        </button>
        <button
          onClick={() => handleExportAction("exportPdf")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-0.5 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-950 dark:shadow-none cursor-pointer"
        >
          <HiDownload className="h-4 w-4" /> ส่งออก PDF (.pdf)
        </button>
      </div>
      {/* ------------------------------------------- */}
      {/* FILTER PANEL: Search, Department & Room */}
      {/* ------------------------------------------- */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-xs dark:bg-gray-900 dark:border-gray-800">
        {/* Search */}
        <div className="relative md:col-span-2">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
            ค้นหาชื่อ หรือ รหัสนักศึกษา
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="ค้นหาชื่อ หรือ รหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 text-sm text-gray-850 placeholder-gray-400 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
            แผนกวิชา
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 text-sm text-gray-850 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="">แผนกวิชาทั้งหมด</option>
            {uniqueDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Room Dropdown */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
            ห้องเรียน
          </label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-500 text-sm text-gray-850 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 cursor-pointer"
          >
            <option value="">ห้องเรียนทั้งหมด</option>
            {filteredRoomOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Helper Row */}
        <div className="md:col-span-4 flex items-center justify-between border-t border-gray-50 pt-3 dark:border-gray-800/40">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            พบข้อมูล: <b>{filteredSuverys.length}</b> จาก {suverys.length}
          </span>
          {(searchQuery || selectedDepartment || selectedRoomId) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDepartment("");
                setSelectedRoomId("");
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {filteredSuverys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <svg className="mx-auto mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">ไม่พบข้อมูลตามเงื่อนไขการค้นหาหรือตัวกรอง</p>
        </div>
      ) : (
        <>
          {/* ------------------------------------------- */}
          {/* VIEW 1: Mobile Cards (Hidden on md+) */}
          {/* ------------------------------------------- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredSuverys.map((sv) => (
              <MobileCardItem
                key={sv._id}
                suvery={sv}
                onDetailClick={handleProtectedAction}
              />
            ))}
          </div>

          {/* ------------------------------------------- */}
          {/* VIEW 2: Desktop Table (Hidden on small) */}
          {/* ------------------------------------------- */}
          <div className="hidden rounded-xl border border-gray-100 bg-white shadow-lg md:block dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-blue-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      ชื่อ-สกุล
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      แผนกวิชา
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      ห้องเรียน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      สถานะงาน
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      วันที่กรอก
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {filteredSuverys.map((sv) => (
                    <DesktopTableRow
                      key={sv._id}
                      suvery={sv}
                      onDetailClick={handleProtectedAction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ------------------------------------------- */}
      {/* Modals */}
      {/* ------------------------------------------- */}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedSuvery && (
        <SuveryModal
          suvery={selectedSuvery}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={onPasswordSuccess}
        expectedPassword={studentPassword}
        suveryIdToDelete={pendingAction === "delete" ? targetId : null}
        onDeleteConfirmed={handlePasswordConfirmedDelete}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        fullName={selectedSuvery?.fullName || ""}
        isDeleting={isDeletingProcess}
      />

      {/* Custom Alert */}
      <CustomAlertDialog
        isOpen={isCustomAlertOpen}
        onClose={() => setIsCustomAlertOpen(false)}
        title={alertContent.title}
        message={alertContent.message}
        type={alertContent.type}
        confirmText="รับทราบ"
      />
    </>
  );
};

export default SuveryList;
