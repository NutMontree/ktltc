// my-projext/src/components/EditTaskForm.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 3. หน้า dashboerd สามารถ แก้ไขข้อมูล
const EditTaskForm = ({
  id,
  title: initialTitle,
  description: initialDescription,
}) => {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [newDescription, setNewDescription] = useState(initialDescription);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newTitle || !newDescription) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

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
        alert("แก้ไขข้อมูลสำเร็จ!");
        router.push("/EmploymentDashboard");
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border bg-white p-6 shadow-md"
    >
      <input
        onChange={(e) => setNewTitle(e.target.value)}
        value={newTitle}
        className="rounded-md border border-slate-500 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder="หัวข้อใหม่"
      />

      <textarea
        onChange={(e) => setNewDescription(e.target.value)}
        value={newDescription}
        className="h-32 resize-none rounded-md border border-slate-500 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="รายละเอียดใหม่"
      />

      <button
        type="submit"
        className="mt-4 w-fit rounded-lg bg-orange-600 px-6 py-3 font-bold text-white transition duration-300 hover:bg-orange-700"
      >
        อัปเดตข้อมูล
      </button>
      <Link
        href="/EmploymentDashboard"
        className="mt-2 text-center text-sm text-gray-500 hover:underline"
      >
        ยกเลิก
      </Link>
    </form>
  );
};

export default EditTaskForm;
