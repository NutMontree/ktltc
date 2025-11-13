// my-projext/src/components/TaskList.jsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPencilAlt, HiOutlineTrash } from "react-icons/hi";
import { useState } from "react"; // 💡 นำเข้า useState
import TaskDetailModal from "./TaskDetailModal"; // 💡 นำเข้า Modal Component ใหม่

// --- Component: ปุ่มลบข้อมูล ---
const RemoveBtn = ({ id }) => {
  const router = useRouter();

  const removeTask = async (e) => {
    // 💡 สำคัญ: หยุดการแพร่กระจายของ Event เพื่อไม่ให้ไปเรียก handleTaskClick ของรายการหลัก
    e.stopPropagation();

    const confirmed = confirm("คุณแน่ใจหรือไม่ที่ต้องการลบรายการนี้?");

    if (confirmed) {
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
      }
    }
  };

  return (
    <button
      onClick={removeTask}
      className="p-1 text-red-600 hover:text-red-800"
    >
      <HiOutlineTrash size={24} />
    </button>
  );
};

// --- Component: TaskList หลัก ---
const TaskList = ({ tasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ฟังก์ชันสำหรับจัดการการคลิกรายการเพื่อเปิด Modal
  const handleTaskClick = (id) => {
    setSelectedTaskId(id);
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับปิด Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null); // ล้าง ID เมื่อปิด
  };

  // ค้นหา Task ที่ถูกเลือกเพื่อส่งข้อมูลทั้งหมดไปยัง Modal
  const selectedTask = tasks.find((t) => t._id === selectedTaskId);

  return (
    <>
      <div className="space-y-4">
        {tasks.map((t) => (
          <div
            key={t._id}
            // 💡 เพิ่ม onClick เพื่อเปิด Modal
            onClick={() => handleTaskClick(t._id)}
            className="my-3 flex cursor-pointer items-start justify-between gap-5 rounded-lg border border-slate-300 bg-white p-4 shadow-sm transition duration-200 hover:border-blue-300 hover:shadow-md"
          >
            {/* ส่วนแสดงข้อมูลย่อ */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
              <div className="mt-1 text-gray-600">{t.description}</div>
            </div>

            {/* ส่วนปุ่ม (ลบและแก้ไข) */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {/* 💡 ปุ่มลบ */}
              <RemoveBtn id={t._id} />

              {/* 💡 ปุ่มแก้ไข */}
              <Link
                href={`/edit/${t._id}`}
                // 💡 สำคัญ: หยุดการแพร่กระจายของ Event เพื่อไม่ให้ไปเรียก handleTaskClick
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

      {/* 💡 Modal Component */}
      {isModalOpen && selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default TaskList;
