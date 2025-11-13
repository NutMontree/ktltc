// src/components/TaskDetailModal.jsx
import React from "react";

// สมมติว่าข้อมูล Task มี fields เช่น title, description, details
export default function TaskDetailModal({ task, onClose }) {
  if (!task) return null;

  return (
    // 💡 Backdrop/Overlay (ทำให้มืดพื้นหลังและซ่อนเนื้อหาเมื่อเปิด)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose} // คลิกพื้นหลังเพื่อปิด
    >
      {/* 💡 Modal Content */}
      <div
        className="max-h-[90vh] w-full max-w-xl transform overflow-y-auto rounded-xl bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // ป้องกันไม่ให้คลิกเนื้อหาแล้ว Modal ปิด
      >
        <div className="mb-4 flex items-start justify-between border-b pb-2">
          <h2 className="break-words text-2xl font-extrabold text-blue-700">
            📋 รายละเอียด: {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-3xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* ข้อมูลทั้งหมดของ Task */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold text-gray-800">ID:</span> {task._id}
          </p>
          <p>
            <span className="font-semibold text-gray-800">คำอธิบาย:</span>{" "}
            {task.description}
          </p>
          {/* 💡 แสดง fields อื่นๆ ของข้อมูลทั้งหมดที่ถูกดึงมา (เช่น details, status ฯลฯ) */}
          {/* ตัวอย่าง: */}
          {task.details && (
            <p>
              <span className="font-semibold text-gray-800">
                รายละเอียดเพิ่มเติม:
              </span>{" "}
              {task.details}
            </p>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
