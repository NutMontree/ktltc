// components/EditBtn.jsx
import Link from "next/link";
import { Pencil } from "lucide-react";

const EditBtn = ({ id }) => {
  // สมมติว่าหน้าแก้ไขจะอยู่ที่ /suvery/edit/[id] หรือ /suvery/[id]
  return (
    <Link
      href={`/suvery/${id}`} // ลิงก์ไปยังหน้าแก้ไข (ใช้หน้าเดียวกับกรอกฟอร์ม แต่รับ ID)
      className="transform rounded-full bg-blue-100 p-2 text-blue-600 transition duration-150 hover:scale-105 hover:bg-blue-200"
      title="แก้ไขข้อมูล"
    >
      <Pencil className="h-5 w-5" />
    </Link>
  );
};

export default EditBtn;
