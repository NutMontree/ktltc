// src/components/SuveryList.tsx
"use client";

import React, { useState, FC, ReactNode } from "react";
import { HiPencilAlt, HiEye } from "react-icons/hi";
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

interface SuveyListItemProps {
  suvery: Isuvery;
  onDetailClick: (suvery: Isuvery, action: "view" | "edit" | "delete") => void;
}

// ✅ Interface สำหรับ Modal ยืนยันการลบ
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fullName: string;
  isDeleting: boolean;
}

// ---------------------------------------------
// ✅ New Component: Delete Confirm Modal
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
    // Overlay: พื้นหลังเบลอและสีดำจาง
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm scale-100 transform overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col items-center p-6 pb-0 text-center">
          {/* Icon สีแดง */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.99\-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
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
            className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                กำลังลบ...
              </>
            ) : (
              "ลบข้อมูล"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------
// Password Modal
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
        // เปลี่ยน Flow: เมื่อรหัสผ่านถูกต้อง ให้เรียก onSuccess เพื่อไปเปิด Modal ยืนยันอีกที
        // หรือถ้าต้องการลบเลยก็เรียก onDeleteConfirmed แต่ในที่นี้เราอยากโชว์ Modal กลางจอ
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
    <div className="bg-opacity-50 fixed inset-0 z-[70] flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl border border-gray-100 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-bold text-green-700 dark:text-green-400">
          🔐 ยืนยันรหัสผ่าน
        </h3>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          โปรดป้อนรหัสนักศึกษา <b>หรือ</b> รหัส Admin เพื่อดำเนินการต่อ
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
          className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          autoFocus
        />

        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              setPassword("");
              setError("");
            }}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleVerify}
            className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800"
          >
            ดำเนินการ
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------
// Suvey List Item
// ---------------------------------------------
const SuveyListItem: React.FC<SuveyListItemProps> = ({
  suvery,
  onDetailClick,
}) => {
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

  const statusColor =
    STATUS_COLOR_MAP[suvery.currentStatus || ""] ||
    "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600";

  return (
    <tr
      className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-orange-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50"
      onClick={() => onDetailClick(suvery, "view")}
    >
      <td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">
        {suvery.fullName}
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
        >
          {suvery.currentStatus === "1"
            ? "ไม่ได้ทำงาน"
            : suvery.currentStatus === "2"
              ? "ทำงานแล้ว"
              : suvery.currentStatus || "ไม่ระบุ"}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(suvery.submittedAt)}
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailClick(suvery, "edit");
            }}
            className="text-gray-400 transition-colors hover:text-yellow-600 dark:hover:text-yellow-400"
          >
            <HiPencilAlt size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailClick(suvery, "view");
            }}
            className="text-orange-500 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <HiEye size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetailClick(suvery, "delete");
            }}
            className="text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
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

  // ✅ New Delete Modal States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  // Custom Alert
  const [isCustomAlertOpen, setIsCustomAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    message: "" as ReactNode,
    type: "info" as "success" | "error" | "warning" | "info",
  });

  // ----------------------------------------------------
  // Action Handler (Check Password first)
  // ----------------------------------------------------
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

  // ----------------------------------------------------
  // Execute Action after verified
  // ----------------------------------------------------
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
      // ✅ แทนที่จะลบเลย ให้เปิด Modal ยืนยันก่อน
      setIsDeleteConfirmOpen(true);
      return;
    }
  };

  // ----------------------------------------------------
  // After Password Success
  // ----------------------------------------------------
  const onPasswordSuccess = () => {
    if (selectedSuvery) setVerifiedSuveryId(selectedSuvery._id);
    setIsPasswordModalOpen(false);

    if (selectedSuvery && pendingAction) {
      // กรณี Delete: targetId ถูกส่งมาแล้วใน props ของ PasswordModal
      // แต่ flow ของเราคือเรียก executeAction ต่อ
      executeAction(selectedSuvery, pendingAction);
    }
    setPendingAction(null);
  };

  // กรณี Password Modal เรียก onDeleteConfirmed โดยตรง
  const handlePasswordConfirmedDelete = (id: string) => {
    setIsPasswordModalOpen(false);
    // เปิด Modal ยืนยันลบกลางจอ
    setIsDeleteConfirmOpen(true);
    setPendingAction(null);
  };

  // ----------------------------------------------------
  // ✅ Confirm Delete Logic (Called by DeleteConfirmModal)
  // ----------------------------------------------------
  const confirmDelete = async () => {
    if (!selectedSuvery) return;

    setIsDeletingProcess(true);

    try {
      const res = await fetch(`/api/suvery?id=${selectedSuvery._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // ปิด Modal
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

  if (isLoading)
    return (
      <p className="p-10 text-center text-gray-500 dark:text-gray-400">
        กำลังโหลดข้อมูล...
      </p>
    );
  if (isError)
    return (
      <p className="p-10 text-center text-red-600 dark:text-red-400">
        โหลดข้อมูลล้มเหลว
      </p>
    );
  if (suverys.length === 0)
    return (
      <p className="p-10 text-center text-gray-500 dark:text-gray-400">
        ไม่มีข้อมูลสำรวจ
      </p>
    );

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-orange-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                ชื่อ-สกุล
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                สถานะงาน
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                วันที่กรอก
              </th>
              <th className="px-4 py-4 pr-8 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase dark:text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {suverys.map((sv) => (
              <SuveyListItem
                key={sv._id}
                suvery={sv}
                onDetailClick={handleProtectedAction}
              />
            ))}
          </tbody>
        </table>
      </div>

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
        onDeleteConfirmed={handlePasswordConfirmedDelete} // ✅ แก้ให้เรียกฟังก์ชันเปิด Modal ลบ
      />

      {/* ✅ Delete Confirm Modal (New) */}
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
