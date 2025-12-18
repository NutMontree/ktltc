// src/components/SuveryList.tsx
"use client";

import React, { useState, FC, ReactNode } from "react";
import { HiPencilAlt, HiEye, HiTrash } from "react-icons/hi";
import SuveryModal from "@/components/SuveryModal";
import { Isuvery } from "./Isuvery";
import CustomAlertDialog from "./CustomAlertDialog";

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
const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleDateString("th-TH", {
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
  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50"
      onClick={() => onDetailClick(suvery, "view")}
    >
      <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
        {suvery.fullName}
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
            </span>{" "}
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
    if (password === ADMIN_PASSWORD || password === expectedPassword) {
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
    "view" | "edit" | "delete" | null
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
    if (selectedSuvery) setVerifiedSuveryId(selectedSuvery._id);
    setIsPasswordModalOpen(false);

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
      {/* VIEW 1: Mobile Cards (Hidden on md+) */}
      {/* ------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {suverys.map((sv) => (
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
      <div className="rounded-xl border border-gray-100 bg-white shadow-lg md:block dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-blue-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                  ชื่อ-สกุล
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
              {suverys.map((sv) => (
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
