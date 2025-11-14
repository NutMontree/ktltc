// my-projext/src/components/TaskList.jsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPencilAlt, HiOutlineTrash } from "react-icons/hi";
import { useState } from "react";
import TaskDetailModal from "./TaskDetailModal"; // Component สำหรับแสดงรายละเอียด (ใช้เดิม)

// --- New Component: Confirmation Modal ---
const ConfirmModal = ({ onConfirm, onCancel, taskId }) => (
  // Backdrop/Overlay: พื้นหลังมืด/เบลอ
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
    {/* Modal Content */}
    <div className="w-full max-w-sm scale-100 transform rounded-xl bg-white p-8 text-center shadow-2xl transition-all duration-300 ease-out">
      <svg
        className="mx-auto mb-4 h-16 w-16 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h2 className="mb-2 text-xl font-extrabold text-gray-800">
        ⚠️ ยืนยันการลบข้อมูล
      </h2>
      <p className="mb-6 text-gray-600">
        คุณแน่ใจหรือไม่ที่ต้องการลบรายการนี้
        <br />
        ข้อมูลจะถูกลบจะไม่สามารถกู้คืนได้
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-bold text-gray-700 transition duration-300 hover:bg-gray-100"
        >
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
        >
          ยืนยันการลบ
        </button>
      </div>
    </div>
  </div>
);

// --- Component: ปุ่มลบข้อมูล ---
const RemoveBtn = ({ id }) => {
  const router = useRouter();
  // 💡 State สำหรับควบคุม Modal ยืนยันการลบ
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // ฟังก์ชันเปิด Modal
  const handleOpenModal = (e) => {
    e.stopPropagation(); // สำคัญ: ป้องกันการเปิด Task Detail Modal
    setIsConfirmModalOpen(true);
  };

  // ฟังก์ชันดำเนินการลบจริง
  const removeTask = async () => {
    setIsConfirmModalOpen(false); // ปิด Modal ทันที

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh(); // รีเฟรชหน้าเพื่อแสดงข้อมูลใหม่
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.log(error);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล!");
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal} // 💡 เปลี่ยนเป็นเปิด Modal แทน confirm()
        className="p-1 text-red-600 hover:text-red-800"
      >
        <HiOutlineTrash size={24} />
      </button>

      {/* 💡 แสดง Confirmation Modal */}
      {isConfirmModalOpen && (
        <ConfirmModal
          taskId={id}
          onConfirm={removeTask}
          onCancel={(e) => {
            e.stopPropagation(); // ป้องกัน event bubble
            setIsConfirmModalOpen(false);
          }}
        />
      )}
    </>
  );
};

// --- Component: TaskList หลัก (ใช้ Logic เดิม) ---
const TaskList = ({ tasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (id) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  const selectedTask = tasks.find((t) => t._id === selectedTaskId);

  return (
    <>
      <div className="space-y-4">
        {tasks.map((t) => (
          <div
            key={t._id}
            onClick={() => handleTaskClick(t._id)}
            className="my-3 flex cursor-pointer items-start justify-between gap-5 rounded-lg border border-slate-300 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
              <div className="mt-1 text-gray-600">{t.description}</div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <RemoveBtn id={t._id} />

              <Link
                href={`/edit/${t._id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1"
              >
                <HiPencilAlt
                  size={24}
                  className="text-blue-600 hover:text-blue-800"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default TaskList;
