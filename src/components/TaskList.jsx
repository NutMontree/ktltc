// my-projext/src/components/TaskList.jsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPencilAlt, HiOutlineTrash } from "react-icons/hi"; // สมมติว่าติดตั้ง react-icons แล้ว

const RemoveBtn = ({ id }) => {
  const router = useRouter();

  const removeTask = async () => {
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
    <button onClick={removeTask} className="text-red-600 hover:text-red-800">
      <HiOutlineTrash size={24} />
    </button>
  );
};

const TaskList = ({ tasks }) => {
  return (
    <div className="space-y-4">
      {tasks.map((t) => (
        <div
          key={t._id}
          className="my-3 flex items-start justify-between gap-5 rounded-lg border border-slate-300 bg-white p-4 shadow-sm"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
            <div className="mt-1 text-gray-600">{t.description}</div>
          </div>

          <div className="flex items-center gap-2">
            {/* 3. ปุ่มลบข้อมูล */}
            <RemoveBtn id={t._id} />

            {/* 3. ปุ่มแก้ไขข้อมูล (ลิงก์ไปยังหน้าแก้ไข) */}
            <Link href={`/edit/${t._id}`}>
              <HiPencilAlt
                size={24}
                className="text-blue-600 hover:text-blue-800"
              />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
