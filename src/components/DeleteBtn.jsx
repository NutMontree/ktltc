// src/components/DeleteBtn.jsx
"use client";

import { HiOutlineTrash } from "react-icons/hi";
import { useRouter } from "next/navigation";

const DeleteBtn = ({ id }) => {
  const router = useRouter();

  const handleDelete = async (e) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลแบบสำรวจนี้อย่างถาวร? การกระทำนี้ไม่สามารถยกเลิกได้",
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/suvery?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }

      alert("✅ ลบข้อมูลสำเร็จแล้ว");
      router.refresh();
    } catch (error) {
      console.error("❌ Error deleting suvery:", error.message);
      alert(`ลบข้อมูลไม่สำเร็จ: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1 text-gray-400 transition hover:text-red-600"
      aria-label="ลบข้อมูล"
      title="ลบข้อมูล"
    >
      <HiOutlineTrash size={20} />
    </button>
  );
};

export default DeleteBtn;
