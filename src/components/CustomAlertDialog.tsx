// src/components/CustomAlertDialog.tsx
"use client";

import React, { useState, useEffect, FC, ReactNode } from "react";

// -----------------------------------------------------------------
// --- Interface ---
// -----------------------------------------------------------------
interface CustomAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: ReactNode; // ใช้ ReactNode เพื่อรองรับ String หรือ JSX
  confirmText?: string;
  onConfirm?: () => void; // สำหรับ Action ที่ต้องการการยืนยัน
  type?: "success" | "error" | "warning" | "info";
}

// -----------------------------------------------------------------
// --- Component: CustomAlertDialog ---
// -----------------------------------------------------------------
const CustomAlertDialog: FC<CustomAlertDialogProps> = ({
  isOpen,
  onClose,
  title = "แจ้งเตือน",
  message,
  confirmText = "ตกลง",
  onConfirm,
  type = "info",
}) => {
  if (!isOpen) return null;

  // กำหนดสีและไอคอนตามประเภท
  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          color: "text-green-700",
          bg: "bg-green-50",
          icon: (
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
        };
      case "error":
        return {
          color: "text-red-700",
          bg: "bg-red-50",
          icon: (
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
        };
      case "warning":
        return {
          color: "text-yellow-700",
          bg: "bg-yellow-50",
          icon: (
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          ),
        };
      case "info":
      default:
        return {
          color: "text-indigo-700",
          bg: "bg-indigo-50",
          icon: (
            <svg
              className="h-6 w-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ),
        };
    }
  };

  const styles = getStyles();

  const handleAction = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose(); // ปิด Modal เสมอหลังดำเนินการ
  };

  return (
    // Backdrop: พื้นหลังเบลอ
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm backdrop-filter transition-opacity duration-300"
      aria-labelledby="alert-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Content */}
      <div
        className={`w-full max-w-sm scale-100 transform rounded-xl border bg-white p-6 shadow-2xl transition-transform duration-300 ${styles.bg}`}
      >
        {/* Header/Icon */}
        <div className="mb-4 flex items-center space-x-3">
          {styles.icon}
          <h3 className={`text-xl font-bold ${styles.color}`}>{title}</h3>
        </div>

        {/* Message */}
        <div className="text-gray-5000 mb-6 text-sm leading-relaxed">
          {message}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {/* ปุ่มยืนยัน/ตกลง */}
          <button
            onClick={handleAction}
            className={`rounded-lg px-4 py-2 font-semibold shadow-md transition ${styles.color.replace("text-", "bg-").replace("-700", "-600")} ${styles.color.replace("text-", "hover:bg-").replace("-700", "-700")} text-white`}
          >
            {confirmText}
          </button>

          {/* ถ้ามี onConfirm แต่ไม่มีปุ่มยกเลิก ให้ใช้ปุ่มเดียว */}
          {onConfirm && (
            <button
              onClick={onClose}
              className="text-gray-5000 rounded-lg bg-gray-200 px-4 py-2 shadow-md transition hover:bg-gray-300"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlertDialog;
