// components/EditBtn.jsx
"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

const EditBtn = ({ id }) => {
  // ✅ เข้ารหัส ID เป็น Base64 (เพื่อให้ URL ดูสะอาดและตรงกับ Logic ใน SuveryList)
  // ถ้า id ไม่มีค่า ให้ส่ง string ว่างไปป้องกัน error
  const encodedId = id ? btoa(id) : "";

  return (
    <Link
      // ✅ ลิงก์ไปยังหน้าแก้ไขตาม Path ที่ถูกต้อง
      href={`/suvery/edit/${encodedId}`}
      className="rounded-lg p-2 text-yellow-600 transition-all duration-200 hover:bg-yellow-50 hover:text-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-300"
      aria-label="แก้ไขข้อมูล"
      title="แก้ไขข้อมูล"
    >
      <Pencil className="h-5 w-5" />
    </Link>
  );
};

export default EditBtn;
