// my-projext/src/components/EditTaskForm.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- New Component: Success Modal for Edit ---
const SuccessModal = ({ onNavigate }) => (
  // Backdrop/Overlay: พื้นหลังมืด/เบลอ
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
    {/* Modal Content */}
    <div className="w-full max-w-sm scale-100 transform rounded-xl bg-white p-8 text-center shadow-2xl transition-all duration-300 ease-out">
      <svg
        className="mx-auto mb-4 h-16 w-16 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="mb-2 text-2xl font-extrabold text-gray-800">
        ✅ แก้ไขข้อมูลสำเร็จ!
      </h2>
      <p className="mb-6 text-gray-600">ข้อมูลถูกอัปเดตในระบบเรียบร้อยแล้ว</p>
      <button
        onClick={onNavigate} // 💡 เมื่อกดปุ่ม ให้เปลี่ยนหน้าไป Dashboard
        className="w-full rounded-lg bg-green-600 px-6 py-2 font-bold text-white transition duration-300 hover:bg-green-700"
      >
        กลับสู่ Dashboard
      </button>
    </div>
  </div>
);

// 3. หน้า dashboerd สามารถ แก้ไขข้อมูล
const EditTaskForm = ({
  id,
  title: initialTitle,
  description: initialDescription,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [newDescription, setNewDescription] = useState(initialDescription);
  // 💡 State ใหม่สำหรับควบคุม Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ป้องกันการกดซ้ำ

  const router = useRouter();

  // ฟังก์ชันนำทางหลังจากปิด Modal
  const handleNavigate = () => {
    router.push("/EmploymentDashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTitle || !newDescription) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true); // เริ่มส่งข้อมูล

    try {
      // 4. การแก้ไขและลบข้อมูล จะต้อง แก้ไขจาก ข้อมูล id
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ newTitle, newDescription }),
      });

      if (res.ok) {
        // 💡 เปลี่ยนจาก alert เป็นเปิด Modal
        setIsSuccessModalOpen(true);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setIsSubmitting(false); // สิ้นสุดการส่งข้อมูล
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-8 shadow-lg"
      >
        <input
          onChange={(e) => setNewTitle(e.target.value)}
          value={newTitle}
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none transition duration-150 focus:ring-4 focus:ring-blue-100"
          type="text"
          placeholder="หัวข้อใหม่"
          disabled={isSubmitting}
        />

        <textarea
          onChange={(e) => setNewDescription(e.target.value)}
          value={newDescription}
          className="h-40 resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition duration-150 focus:ring-4 focus:ring-blue-100"
          placeholder="รายละเอียดใหม่"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          className={`mt-4 w-full rounded-lg px-6 py-3 font-bold transition duration-300 ${
            isSubmitting
              ? "cursor-not-allowed bg-gray-400"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังอัปเดต..." : "อัปเดตข้อมูล"}
        </button>
        <Link
          href="/EmploymentDashboard"
          className="mt-2 text-center text-sm text-gray-500 transition duration-150 hover:text-blue-600"
        >
          ยกเลิกและกลับสู่ Dashboard
        </Link>
      </form>

      {/* 💡 แสดง Modal เมื่อบันทึกสำเร็จ */}
      {isSuccessModalOpen && <SuccessModal onNavigate={handleNavigate} />}
    </>
  );
};

export default EditTaskForm;
