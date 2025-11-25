// src/components/DeleteBtn.jsx
"use client";

import { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { CgSpinner } from "react-icons/cg"; // เพิ่มไอคอน Loading (ถ้ามี react-icons)

const DeleteBtn = ({ id }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    // ป้องกันการคลิกทะลุไปยัง Row ของตาราง (ถ้าปุ่มนี้อยู่ในตาราง)
    e.stopPropagation();

    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลแบบสำรวจนี้อย่างถาวร?\n\n⚠️ การกระทำนี้ไม่สามารถยกเลิกได้",
    );

    if (!confirmed) return;

    setIsDeleting(true); // เริ่มสถานะ Loading

    try {
      // ⚠️ ตรวจสอบ Route ของคุณว่าใช้ Query Param (?id=...) หรือ Path Param (/[id])
      // ถ้าเป็น Path Param ให้แก้เป็น: await fetch(`/api/suvery/${id}`, ...
      const res = await fetch(`/api/suvery?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }

      // ไม่ต้อง alert ก็ได้ถ้าอยากให้ UX ลื่นไหล (หรือใช้ Toast แทน)
      // alert("✅ ลบข้อมูลสำเร็จแล้ว");

      router.refresh(); // รีเฟรชหน้าจอเพื่อแสดงข้อมูลล่าสุด
    } catch (error) {
      console.error("❌ Error deleting suvery:", error.message);
      alert(`ลบข้อมูลไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsDeleting(false); // จบสถานะ Loading
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`rounded-lg p-2 transition-all duration-200 ${
        isDeleting
          ? "cursor-not-allowed text-gray-400 opacity-50"
          : "text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
      } `}
      aria-label="ลบข้อมูล"
      title="ลบข้อมูล"
    >
      {isDeleting ? (
        <CgSpinner className="animate-spin" size={20} />
      ) : (
        <HiOutlineTrash size={20} />
      )}
    </button>
  );
};

export default DeleteBtn;
