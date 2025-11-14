// src/components/EditBtn.tsx
import Link from "next/link";
import { Pencil } from "lucide-react";

const EditBtn = ({ id }) => {
  // 💡 ลิงก์ไปยังหน้าแก้ไขตาม Path ที่คุณกำหนดไว้ก่อนหน้า: /suvery/edit/[id]
  return (
    <Link
      href={`/suvery/edit/${id}`}
      className="transform rounded-full bg-blue-100 p-2 text-blue-600 transition duration-150 hover:scale-105 hover:bg-blue-200"
      title="แก้ไขข้อมูล"
      onClick={(e) => e.stopPropagation()} // ป้องกัน event bubble ถ้าอยู่ในรายการ
    >
      <Pencil className="h-5 w-5" />
    </Link>
  );
};

export default EditBtn;
