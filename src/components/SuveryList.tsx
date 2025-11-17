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

interface SurveyListItemProps {
    suvery: Isuvery;
    onDetailClick: (suvery: Isuvery, action: "view" | "edit" | "delete") => void;
}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h3 className="text-xl font-bold text-indigo-700 mb-4">🔐 ยืนยันรหัสผ่าน</h3>
                <p className="text-gray-600 mb-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                    autoFocus
                />

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            onClose();
                            setPassword("");
                            setError("");
                        }}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        ยกเลิก
                    </button>

                    <button
                        onClick={handleVerify}
                        className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                    >
                        ดำเนินการ
                    </button>
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------
// Survey List Item
// ---------------------------------------------
const SurveyListItem: React.FC<SurveyListItemProps> = ({ suvery, onDetailClick }) => {
    const formatDate = (iso?: string) => {
        if (!iso) return "N/A";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "Invalid Date";
        return d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const STATUS_COLOR_MAP: Record<string, string> = {
        '1': "text-red-600 bg-red-100 border border-red-200",
        '2': "text-green-700 bg-green-100 border border-green-200",
        'ไม่ได้ทำงาน': "text-red-600 bg-red-100 border border-red-200",
        'ทำงานแล้ว': "text-green-700 bg-green-100 border border-green-200",
    };

    const statusColor = STATUS_COLOR_MAP[suvery.currentStatus || ""] || "text-gray-500 bg-gray-100";

    return (
        <tr
            className="border-b hover:bg-violet-50/50 cursor-pointer"
            onClick={() => onDetailClick(suvery, "view")}
        >
            <td className="py-3 px-4">{suvery.fullName}</td>
            <td className="py-3 px-4">
                <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                >
                    {suvery.currentStatus === "1" ? "ไม่ได้ทำงาน" :
                        suvery.currentStatus === "2" ? "ทำงานแล้ว" :
                            suvery.currentStatus || "ไม่ระบุ"}
                </span>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(suvery.submittedAt)}</td>

            <td className="py-3 px-4">
                <div className="flex justify-end gap-3">
                    {/* Edit */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, "edit");
                        }}
                        className="text-gray-400 hover:text-yellow-600"
                    >
                        <HiPencilAlt size={20} />
                    </button>

                    {/* View */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, "view");
                        }}
                        className="text-violet-600 hover:text-violet-800"
                    >
                        <HiEye size={20} />
                    </button>

                    {/* Delete */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailClick(suvery, "delete");
                        }}
                        className="text-red-600 hover:text-red-800"
                    >
                        <svg
                            className="w-5 h-5"
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

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<"view" | "edit" | "delete" | null>(null);

    const [targetId, setTargetId] = useState<string | null>(null);
    const [studentPassword, setStudentPassword] = useState<string>("");

    // Custom Alert
    const [isCustomAlertOpen, setIsCustomAlertOpen] = useState(false);
    const [alertContent, setAlertContent] = useState({
        title: "",
        message: "" as ReactNode,
        type: "info" as "success" | "error" | "warning" | "info",
    });

    // ----------------------------------------------------
    // Action Handler
    // ----------------------------------------------------
    const handleProtectedAction = (suvery: Isuvery, action: "view" | "edit" | "delete") => {
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
    // Execute after verified
    // ----------------------------------------------------
    const executeAction = (suvery: Isuvery, action: "view" | "edit" | "delete") => {
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
            handleDelete(suvery._id);
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
            executeAction(selectedSuvery, pendingAction);
        }

        setPendingAction(null);
    };

    // ----------------------------------------------------
    // Delete Logic
    // ----------------------------------------------------
    const handleDelete = async (id: string) => {
        if (!selectedSuvery) return;

        const confirmDelete = window.confirm(`ต้องการลบข้อมูลของ ${selectedSuvery.fullName}?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/suvery?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setAlertContent({
                    title: "ลบสำเร็จ!",
                    message: `ข้อมูลของ ${selectedSuvery.fullName} ถูกลบแล้ว`,
                    type: "success",
                });
                setIsCustomAlertOpen(true);

                setTimeout(() => window.location.reload(), 600);
            } else {
                setAlertContent({
                    title: "ล้มเหลว",
                    message: "ไม่สามารถลบข้อมูลได้",
                    type: "error",
                });
                setIsCustomAlertOpen(true);
            }
        } catch {
            setAlertContent({
                title: "Error",
                message: "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
                type: "error",
            });
            setIsCustomAlertOpen(true);
        }
    };

    // ----------------------------------------------------
    // Loading / Error / Empty
    // ----------------------------------------------------
    if (isLoading) return <p className="text-center p-10">กำลังโหลดข้อมูล...</p>;
    if (isError) return <p className="text-center p-10 text-red-600">โหลดข้อมูลล้มเหลว</p>;
    if (suverys.length === 0) return <p className="text-center p-10">ไม่มีข้อมูลสำรวจ</p>;

    // ----------------------------------------------------
    // Render
    // ----------------------------------------------------
    return (
        <>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-violet-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-semibold">ชื่อ-สกุล</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">สถานะงาน</th>
                            <th className="py-3 px-4 text-left text-xs font-semibold">วันที่กรอก</th>
                            <th className="py-3 px-4 text-center text-xs font-semibold">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {suverys.map((sv) => (
                            <SurveyListItem
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
                onDeleteConfirmed={handleDelete}
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
